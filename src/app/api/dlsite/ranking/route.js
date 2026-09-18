import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const affiliateId = process.env.NEXT_PUBLIC_DLSITE_AFFILIATE_ID || 'Koremiyoonline';
    
    // DLsite maniax ranking API (24h period)
    const dlsiteUrl = 'https://www.dlsite.com/maniax/api/=/ranking.json?period=24h';
    
    const res = await fetch(dlsiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // 1時間キャッシュ
    });

    if (!res.ok) {
      throw new Error(`DLsite API Error: ${res.status}`);
    }

    const rawData = await res.json();

    if (!Array.isArray(rawData)) {
      return NextResponse.json({ items: [] });
    }

    const items = rawData.slice(0, 20).map((item, idx) => {
      let imageUrl = '';
      if (item.image_main && item.image_main.url) {
        imageUrl = item.image_main.url.startsWith('//')
          ? `https:${item.image_main.url}`
          : item.image_main.url;
      } else if (item.image_thum && item.image_thum.url) {
        imageUrl = item.image_thum.url.startsWith('//')
          ? `https:${item.image_thum.url}`
          : item.image_thum.url;
      }

      const workno = item.workno || item.product_id;
      const affiliateUrl = `https://www.dlsite.com/maniax/dpro/=/product_id/${workno}.html/?aid=${affiliateId}`;

      return {
        id: workno,
        title: item.work_name || '',
        maker: item.maker_name || '',
        image_url: imageUrl,
        affiliate_url: affiliateUrl,
        rank_position: item.ranking || idx + 1,
        discount_rate: item.discount_rate || 0,
        is_discount: !!item.is_discount_work,
        category: item.work_category || '同人'
      };
    });

    return NextResponse.json({
      success: true,
      items,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('DLsite ranking fetch error:', error);
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }
}
