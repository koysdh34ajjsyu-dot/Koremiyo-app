import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバー側でSupabaseクライアントを初期化（サービスロールキーがある場合はそちらを使用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  // Vercel Cronからのリクエストを認証
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // CRON_SECRETが設定されている場合は検証する
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;

  if (!apiId || !affiliateId) {
    return NextResponse.json({ error: 'DMM API credentials not configured' }, { status: 500 });
  }

  try {
    console.log('[Cron] ランキングデータの自動取得を開始...');

    // DMM APIからランキング上位20件を取得
    const dmmUrl = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&sort=rank&hits=20&output=json`;
    const res = await fetch(dmmUrl, { next: { revalidate: 0 } });

    if (!res.ok) {
      throw new Error(`DMM API Error: ${res.status}`);
    }

    const data = await res.json();
    const items = data?.result?.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items returned from DMM API' }, { status: 500 });
    }

    // Supabase に upsert（既存データは更新、新規は追加）
    const records = items.map((item, idx) => ({
      content_id: item.content_id,
      title: item.title || '',
      affiliate_url: item.affiliateURL || '',
      image_url: item.imageURL?.small || '',
      price: item.prices?.price || '',
      actress: item.iteminfo?.actress?.map(a => a.name).join(', ') || '',
      genre: item.iteminfo?.genre?.slice(0, 3).map(g => g.name).join(', ') || '',
      maker: item.iteminfo?.maker?.[0]?.name || '',
      release_date: item.date?.split(' ')?.[0] || '',
      rank_position: idx + 1,
      updated_at: new Date().toISOString(),
    }));

    // 既存データを全削除してから新規挿入（ランキングは毎回全更新）
    const { error: deleteError } = await supabase.from('ranked_products').delete().neq('id', 0);
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase.from('ranked_products').insert(records);
    if (insertError) throw insertError;

    console.log(`[Cron] ${records.length}件のランキングデータを保存しました`);

    return NextResponse.json({
      success: true,
      message: `${records.length}件のランキングデータを更新しました`,
      updated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Cron] ランキング更新エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
