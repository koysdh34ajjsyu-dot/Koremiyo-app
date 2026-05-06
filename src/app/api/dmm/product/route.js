import { NextResponse } from 'next/server';

export async function GET(request) {
  // リクエストURLからクエリパラメータを取得（例: ?keyword=アフィリエイト&site=DMM.com）
  const { searchParams } = new URL(request.url);
  
  // DMM APIとアフィリエイトのIDはサーバー側（環境変数）から安全に取得
  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;

  if (!apiId || !affiliateId) {
    return NextResponse.json({ error: 'サーバーの環境変数（DMM_API_ID または DMM_AFFILIATE_ID）が設定されていません。' }, { status: 500 });
  }

  // DMM商品検索APIのエンドポイント
  let apiUrl = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&output=json`;

  // クライアントから渡されたパラメータをそのままDMM APIへ引き継ぐ
  searchParams.forEach((value, key) => {
    apiUrl += `&${key}=${encodeURIComponent(value)}`;
  });

  try {
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`DMM API Error Response:`, errorText);
      throw new Error(`DMM API Error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('DMM APIリクエスト失敗:', error);
    return NextResponse.json({ error: 'データの取得に失敗しました。' }, { status: 500 });
  }
}
