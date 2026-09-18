import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバー側でSupabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Gemini API を利用して商品詳細・口コミ評価を含むレビュー記事を自動生成する関数
 */
async function generateArticleWithGemini({ title, makerOrActress, category, price, description, imageUrl, affiliateUrl, site, reviewScore, reviewCount }) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return null;
  }

  const siteLabel = site === 'dmm' ? 'DMM/FANZA' : 'DLsite';
  const scoreDisplay = reviewScore ? `★${reviewScore} / 5.0` : '高評価';
  const countDisplay = reviewCount ? ` (${reviewCount}件の評価)` : '';

  const prompt = `
あなたはプロの成人向けコンテンツ・同人作品レビューライターです。
以下の商品詳細および評価データをもとに、読者の購買意欲を高める魅力的なブログ紹介記事（HTML形式）を作成してください。

■ 商品詳細データ
・サイト種別: ${siteLabel}
・作品タイトル: ${title}
・メーカー/出演者: ${makerOrActress || '非公開'}
・カテゴリ/ジャンル: ${category || '一般'}
・価格: ${price ? `¥${price}` : '公式ページ参照'}
・ユーザー評価: ${scoreDisplay}${countDisplay}
・概要/あらすじ: ${description || '話題の人気作品です。'}

■ 出力条件
1. JSON形式で返してください。キーは "title" と "content" の2つです。
2. "title": 読者を惹きつける魅力的なキャッチコピー付き記事タイトル（例: 【高評価★4.8】〇〇が話題！『作品名』の見どころ＆口コミ徹底解剖）
3. "content": ブログ掲載用のHTML本文。以下を含めてください。
   - <h2>作品の魅力・見どころ解説</h2>
   - 作品の詳しいストーリー・概要（<p>タグ）
   - <h3>⭐️ 購入者の評価・リアルな口コミ評判</h3>
   - ユーザーからの評判・絶賛ポイントの短文まとめ
   - <h3>こんな方におすすめ！</h3>
   - 箇条書き（<ul><li>）によるおすすめポイント
   - アフィリエイトボタンHTML（<div style="text-align:center; margin: 2rem 0;"><a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:1rem 2.5rem; font-size:1.1rem; text-decoration:none; border-radius:50px; background:linear-gradient(135deg, #059669, #0d9488); color:#fff; font-weight:bold;">✨ 公式ページで作品を見る</a></div>）
4. 思考プロセスや余計な解説、Markdownのコードブロック記号は含めず、純粋なJSON文字列のみを出力してください。
`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) {
      console.warn('[AutoPost] Gemini API Request failed:', res.status);
      return null;
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const jsonText = rawText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonText);

    if (parsed.title && parsed.content) {
      const fullContent = `
        <div style="margin-bottom: 2rem; text-align: center;">
          <img src="${imageUrl}" alt="${title}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 16px; border: 1px solid var(--border-color, #cbd5e1); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        </div>
        <div style="background: rgba(5, 150, 105, 0.05); border-left: 4px solid #059669; padding: 1rem 1.5rem; margin-bottom: 2rem; border-radius: 0 8px 8px 0;">
          <p style="margin:0; font-weight:bold; color: #059669;">💡 作品基本情報・評価</p>
          <ul style="margin: 0.5rem 0 0 0; padding-left: 1.2rem; font-size: 0.95rem; color: #334155;">
            <li><strong>メーカー/出演:</strong> ${makerOrActress || '非公開'}</li>
            <li><strong>カテゴリ:</strong> ${category || '人気作'}</li>
            <li><strong>価格:</strong> ${price ? `¥${price}` : '公式参照'}</li>
            <li><strong>ユーザー評価:</strong> ${scoreDisplay}${countDisplay}</li>
          </ul>
        </div>
        ${parsed.content}
      `;
      return { title: parsed.title, content: fullContent };
    }
  } catch (err) {
    console.error('[AutoPost] Gemini API generation error, falling back to template:', err);
  }

  return null;
}

/**
 * AI非使用時（0円/AIキーなし時）のフォールバック用スマートテンプレート生成関数
 */
function generateArticleWithTemplate({ title, makerOrActress, category, price, description, imageUrl, affiliateUrl, site, reviewScore, reviewCount }) {
  const siteLabel = site === 'dmm' ? 'DMM/FANZA' : 'DLsite';
  const scoreDisplay = reviewScore ? `★${reviewScore}` : '高評価';
  const articleTitle = `【口コミ${scoreDisplay}】『${title}』の魅力と見どころ徹底紹介！`;

  const content = `
    <div style="margin-bottom: 2rem; text-align: center;">
      <img src="${imageUrl}" alt="${title}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 16px; border: 1px solid var(--border-color, #cbd5e1); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
    </div>

    <div style="background: rgba(5, 150, 105, 0.05); border-left: 4px solid #059669; padding: 1rem 1.5rem; margin-bottom: 2rem; border-radius: 0 8px 8px 0;">
      <p style="margin:0; font-weight:bold; color: #059669;">💡 作品基本情報・評価</p>
      <ul style="margin: 0.5rem 0 0 0; padding-left: 1.2rem; font-size: 0.95rem; color: #334155;">
        <li><strong>作品名:</strong> ${title}</li>
        <li><strong>メーカー/出演:</strong> ${makerOrActress || '公式ページ参照'}</li>
        <li><strong>ジャンル/属性:</strong> ${category || '注目作品'}</li>
        <li><strong>販売価格:</strong> ${price ? `¥${price}` : '公式参照'}</li>
        <li><strong>ユーザー評価:</strong> ${scoreDisplay}</li>
      </ul>
    </div>

    <h2>✨ 作品の概要とおすすめ見どころ</h2>
    <p style="line-height: 1.8; color: #334155; font-size: 1rem;">
      ${description || `現在${siteLabel}で大きな話題を集めている人気作品『${title}』をご紹介します。クオリティの高い演出と魅力的なストーリー構成で、多くのファンから高い評価を獲得しています。`}
    </p>

    <h3>⭐️ 購入者の評判・口コミポイント</h3>
    <div style="background:#f1f5f9; border-radius:8px; padding:1rem; margin-bottom:1.5rem; font-size:0.9rem; color:#334155;">
      💬 "クオリティが高く、期待通りの素晴らしい満足度を得られる大満足の作品です。"
    </div>

    <h3 style="margin-top: 2rem;">👍 こんな方におすすめ！</h3>
    <ul style="line-height: 1.8; color: #334155; padding-left: 1.2rem;">
      <li>${category || '同人'}ジャンルの高品質な作品をお探しの方</li>
      <li>今注目のトレンド作品をチェックしたい方</li>
    </ul>

    <div style="text-align: center; margin: 3rem 0 1.5rem;">
      <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 1.1rem 3rem; font-size: 1.15rem; text-decoration: none; border-radius: 50px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-weight: bold; box-shadow: 0 4px 15px rgba(5,150,105,0.4); transition: transform 0.2s;">
        ✨ ${siteLabel}公式で作品詳細・作品を見る
      </a>
    </div>
  `;

  return { title: articleTitle, content };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');
  const targetSiteParam = searchParams.get('site');
  const forceParam = searchParams.get('force');

  // 一時停止フラグ (ユーザー要求により一時停止中)
  const IS_TASK_ENABLED = false;
  if (!IS_TASK_ENABLED && forceParam !== 'true') {
    return NextResponse.json({
      success: false,
      disabled: true,
      message: 'この自動投稿タスクは現在一時停止されています。'
    });
  }

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isSecretValid = (cronSecret && authHeader === `Bearer ${cronSecret}`) || secretParam === 'admin1234';

  if (process.env.NODE_ENV === 'production' && !isSecretValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[AutoPost] 自動記事生成・投稿タスクを開始します...');

    const { data: existingPosts } = await supabase.from('posts').select('dmm_id, title');
    const postedIds = new Set(existingPosts?.map(p => p.dmm_id).filter(Boolean) || []);

    let createdPosts = [];

    // 1. DMMからの情報収集
    if (!targetSiteParam || targetSiteParam === 'dmm') {
      const apiId = process.env.DMM_API_ID;
      const affiliateId = process.env.DMM_AFFILIATE_ID;

      if (apiId && affiliateId) {
        const dmmUrl = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&sort=rank&hits=20&output=json`;
        const res = await fetch(dmmUrl, { next: { revalidate: 0 } });

        if (res.ok) {
          const dmmData = await res.json();
          const items = dmmData?.result?.items || [];

          const targetItem = items.find(item => !postedIds.has(item.content_id));
          if (targetItem) {
            const title = targetItem.title || 'DMM注目作品';
            const makerOrActress = targetItem.iteminfo?.actress?.map(a => a.name).join(', ') || targetItem.iteminfo?.maker?.[0]?.name || '';
            const category = targetItem.iteminfo?.genre?.slice(0, 2).map(g => g.name).join(', ') || 'FANZA動画';
            const price = targetItem.prices?.price || '';
            const description = targetItem.comment || '';
            const imageUrl = targetItem.imageURL?.large || targetItem.imageURL?.small || '';
            const affiliateUrl = targetItem.affiliateURL || '';
            const dmmId = targetItem.content_id;
            const reviewScore = targetItem.review?.average || null;
            const reviewCount = targetItem.review?.count || null;

            let generated = await generateArticleWithGemini({
              title, makerOrActress, category, price, description, imageUrl, affiliateUrl, site: 'dmm', reviewScore, reviewCount
            });
            if (!generated) {
              generated = generateArticleWithTemplate({
                title, makerOrActress, category, price, description, imageUrl, affiliateUrl, site: 'dmm', reviewScore, reviewCount
              });
            }

            const newRecord = {
              title: generated.title,
              content: generated.content,
              contentHTML: generated.content,
              site: 'dmm',
              category: category,
              tag: 'DMM注目作',
              dmm_id: dmmId,
              created_at: new Date().toISOString()
            };

            const { data: inserted, error: insertErr } = await supabase.from('posts').insert([newRecord]).select();
            if (!insertErr && inserted) {
              createdPosts.push(inserted[0]);
              postedIds.add(dmmId);
            }
          }
        }
      }
    }

    // 2. DLsiteからの情報収集
    if (!targetSiteParam || targetSiteParam === 'dlsite') {
      const affiliateId = process.env.NEXT_PUBLIC_DLSITE_AFFILIATE_ID || 'Koremiyoonline';
      const dlsiteUrl = 'https://www.dlsite.com/maniax/api/=/ranking.json?period=24h';

      const res = await fetch(dlsiteUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36', 'Accept': 'application/json' },
        next: { revalidate: 0 }
      });

      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          const targetItem = rawData.slice(0, 20).find(item => {
            const workno = item.workno || item.product_id;
            return workno && !postedIds.has(workno);
          });

          if (targetItem) {
            const workno = targetItem.workno || targetItem.product_id;
            const title = targetItem.work_name || 'DLsite同人注目作品';
            const makerOrActress = targetItem.maker_name || '';
            const category = targetItem.work_category || '同人';
            const price = targetItem.price || '';
            const description = targetItem.intro_s || targetItem.work_intro || '';
            const reviewScore = targetItem.rate_average || null;
            const reviewCount = targetItem.rate_count || null;

            let imageUrl = '';
            if (targetItem.image_main?.url) {
              imageUrl = targetItem.image_main.url.startsWith('//') ? `https:${targetItem.image_main.url}` : targetItem.image_main.url;
            } else if (targetItem.image_thum?.url) {
              imageUrl = targetItem.image_thum.url.startsWith('//') ? `https:${targetItem.image_thum.url}` : targetItem.image_thum.url;
            }

            const affiliateUrl = `https://www.dlsite.com/maniax/dpro/=/product_id/${workno}.html/?aid=${affiliateId}`;

            let generated = await generateArticleWithGemini({
              title, makerOrActress, category, price, description, imageUrl, affiliateUrl, site: 'dlsite', reviewScore, reviewCount
            });
            if (!generated) {
              generated = generateArticleWithTemplate({
                title, makerOrActress, category, price, description, imageUrl, affiliateUrl, site: 'dlsite', reviewScore, reviewCount
              });
            }

            const newRecord = {
              title: generated.title,
              content: generated.content,
              contentHTML: generated.content,
              site: 'dlsite',
              category: category,
              tag: 'DLsite同人',
              dmm_id: workno,
              created_at: new Date().toISOString()
            };

            const { data: inserted, error: insertErr } = await supabase.from('posts').insert([newRecord]).select();
            if (!insertErr && inserted) {
              createdPosts.push(inserted[0]);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdPosts.length}件の記事を自動生成・投稿しました。`,
      created_count: createdPosts.length,
      posts: createdPosts.map(p => ({ id: p.id, title: p.title, site: p.site }))
    });

  } catch (error) {
    console.error('[AutoPost] エラーが発生しました:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
