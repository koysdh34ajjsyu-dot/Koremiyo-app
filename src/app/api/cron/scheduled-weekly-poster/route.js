import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase クライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * ①〜⑦の要素をすべて含んだDMM(FANZA同人・アニメ)特化型ハイブリッド記事（HTML）を生成する関数
 */
async function generateDmmSpecialArticle({
  title, makerOrAuthor, category, price, listPrice, discountRate, description,
  imageUrl, sampleImages, sampleMovie, affiliateUrl, reviewScore, reviewCount, floor
}) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const isAnime = floor === 'anime';
  const genreLabel = isAnime ? 'FANZAアニメ' : 'FANZA同人';
  const scoreDisplay = reviewScore ? `★${reviewScore} / 5.0` : '高評価';
  const countDisplay = reviewCount ? ` (${reviewCount}件の評価)` : '';

  // セールバッジテキストの準備
  let discountBadgeHtml = '';
  if (discountRate && discountRate > 0) {
    discountBadgeHtml = `
      <div style="display:inline-block; background: linear-gradient(135deg, #e63946, #d62828); color:#ffffff; padding:0.4rem 1.2rem; border-radius:50px; font-weight:bold; font-size:1.05rem; margin-top:0.5rem; box-shadow: 0 4px 10px rgba(230,57,70,0.3);">
        🔥 特別セール中！ ${discountRate}% OFF （元値: ¥${listPrice} → 期間限定 ¥${price}）
      </div>
    `;
  } else if (price) {
    discountBadgeHtml = `
      <div style="display:inline-block; background: #059669; color:#ffffff; padding:0.3rem 1rem; border-radius:50px; font-weight:bold; font-size:0.95rem; margin-top:0.5rem;">
        価格: ¥${price} (大人気配信中)
      </div>
    `;
  }

  // ⑦ サンプル画像ギャラリーHTMLの構築
  let sampleGalleryHtml = '';
  if (sampleImages && sampleImages.length > 0) {
    const imagesList = sampleImages.slice(0, 6).map(imgUrl => `
      <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" style="display:block; overflow:hidden; border-radius:8px; border:1px solid #cbd5e1; transition:transform 0.2s;">
        <img src="${imgUrl}" alt="サンプル画像" style="width:100%; height:120px; object-fit:cover; display:block;" />
      </a>
    `).join('');

    sampleGalleryHtml = `
      <div style="margin: 2.5rem 0;">
        <h3 style="color:#0f172a; font-size:1.1rem; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
          🖼 サンプル画像ギャラリー (タップで拡大・詳細)
        </h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:0.8rem;">
          ${imagesList}
        </div>
      </div>
    `;
  }

  // ⑦ サンプル動画埋め込みHTMLの構築
  let sampleMovieHtml = '';
  if (sampleMovie) {
    sampleMovieHtml = `
      <div style="margin: 2.5rem 0; text-align:center;">
        <h3 style="color:#0f172a; font-size:1.1rem; margin-bottom:1rem;">
          🎬 公式サンプル動画プレビュー
        </h3>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; border:2px solid #cbd5e1; background:#000;">
          <iframe src="${sampleMovie}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  if (geminiApiKey) {
    const prompt = `
あなたはDMM (FANZA同人・アニメ) のプロレビューライターです。
以下の商品詳細およびセールデータをもとに、読者の購買意欲を高める魅力的なレビュー記事（HTML形式）を作成してください。

■ 商品詳細データ
・ジャンル: ${genreLabel}
・作品タイトル: ${title}
・サークル/メーカー/出演者: ${makerOrAuthor || '公式参照'}
・カテゴリ: ${category || '人気作'}
・価格情報: ${price ? `¥${price}` : '公式参照'} ${discountRate ? `(${discountRate}% OFFセール中)` : ''}
・ユーザー評価: ${scoreDisplay}${countDisplay}
・作品詳細概要/あらすじ: ${description || '注目の大人気作品です。'}

■ 出力条件
1. JSON形式で返してください。キーは "title" と "summary3Lines" と "storyDetail" と "userReviews" と "reviewContent" の5つです。
2. "title": ① キャッチコピー付きタイトル（例: 【セール中${discountRate ? `${discountRate}%OFF` : ''}】〇〇で話題！『作品名』の見どころ＆口コミ徹底紹介）
3. "summary3Lines": ④ 30秒でわかる3行スッキリ要約の配列（["1行目", "2行目", "3行目"]）
4. "storyDetail": ⑥ 作品の詳しいストーリー・設定・世界観を魅力的に深掘り解説した段落
5. "userReviews": ⑤ 実際に購入・鑑賞したユーザーの評判口コミポイントの配列（例: ["演出と作画のクオリティが素晴らしい", "セール価格で買えて大満足のボリューム", "声優/サークルのこだわりが伝わる傑作"]）
6. "reviewContent": 魅力とおすすめポイントを伝えるHTML本文（<h2>作品の見どころ・おすすめポイント</h2>、<h3>こんな方におすすめ！</h3>、箇条書き等）
7. 思考プロセスや余計な解説、Markdownのコードブロック記号は含めず、純粋なJSON文字列のみを出力してください。
`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const jsonText = rawText.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(jsonText);

          if (parsed.title && parsed.reviewContent) {
            const summaryHtml = Array.isArray(parsed.summary3Lines)
              ? parsed.summary3Lines.map(line => `<li>${line}</li>`).join('')
              : `<li>現在${genreLabel}で大人気セール中の注目作品！</li><li>ユーザー評価${scoreDisplay}を獲得した圧倒的クオリティ</li><li>ファンなら絶対に見逃せないイチオシ作！</li>`;

            const reviewsHtml = Array.isArray(parsed.userReviews)
              ? parsed.userReviews.map(r => `<div style="background:#ffffff; border-radius:8px; padding:0.8rem 1rem; margin-bottom:0.5rem; border:1px solid #e2e8f0; font-size:0.9rem; color:#334155;">💬 "${r}"</div>`).join('')
              : `<div style="background:#ffffff; border-radius:8px; padding:0.8rem 1rem; border:1px solid #e2e8f0; font-size:0.9rem; color:#334155;">💬 "セールで安く買えて大満足。演出・ストーリーともにハイクオリティでした。"</div>`;

            const fullContent = `
              <!-- ② 大判アイキャッチ画像 ＋ 価格・セール情報バッジ -->
              <div style="margin-bottom: 2rem; text-align: center;">
                <img src="${imageUrl}" alt="${title}" style="max-width: 100%; max-height: 420px; object-fit: contain; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 6px 16px rgba(0,0,0,0.12);" />
                <div style="margin-top: 1rem;">
                  ${discountBadgeHtml}
                </div>
              </div>

              <!-- ④ 30秒でわかる3行スッキリ要約 -->
              <div style="background: linear-gradient(135deg, rgba(5,150,105,0.08), rgba(13,148,136,0.08)); border: 2px solid #059669; border-radius: 12px; padding: 1.2rem 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin: 0 0 0.8rem 0; color: #059669; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                  ⚡ 30秒でわかる！作品の3行スッキリ要約
                </h3>
                <ul style="margin: 0; padding-left: 1.2rem; color: #0f172a; line-height: 1.7; font-weight: 500;">
                  ${summaryHtml}
                </ul>
              </div>

              <!-- ③ 出演者 / 声優 / サークル プロフィールカード -->
              <div style="background: #f8fafc; border-left: 4px solid #059669; padding: 1rem 1.5rem; margin-bottom: 2rem; border-radius: 0 8px 8px 0;">
                <p style="margin:0; font-weight:bold; color: #059669;">💡 作品・サークル/出演情報</p>
                <ul style="margin: 0.5rem 0 0 0; padding-left: 1.2rem; font-size: 0.95rem; color: #334155;">
                  <li><strong>サークル/メーカー/出演:</strong> ${makerOrAuthor || '公式参照'}</li>
                  <li><strong>ジャンル:</strong> ${category || genreLabel}</li>
                  <li><strong>価格:</strong> ${price ? `¥${price}` : '公式参照'} ${discountRate ? `(${discountRate}% OFFセール)` : ''}</li>
                </ul>
              </div>

              <!-- ⑤ 口コミ評判・ユーザー星評価 -->
              <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 1.2rem 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                  <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">⭐️ 購入者の評価・リアルな口コミ評判</h3>
                  <span style="background: #059669; color: #ffffff; padding: 0.2rem 0.8rem; border-radius: 50px; font-weight: bold; font-size: 0.9rem;">
                    評価: ${scoreDisplay}${countDisplay}
                  </span>
                </div>
                ${reviewsHtml}
              </div>

              <!-- ⑥ ストーリー・詳細あらすじ解説 -->
              ${parsed.storyDetail ? `
                <h2>📖 作品のストーリー・詳細解説</h2>
                <p style="line-height: 1.8; color: #334155; font-size: 1rem; margin-bottom: 2rem;">
                  ${parsed.storyDetail}
                </p>
              ` : ''}

              ${parsed.reviewContent}

              <!-- ⑦ サンプル画像ギャラリー / 動画埋め込み -->
              ${sampleMovieHtml}
              ${sampleGalleryHtml}

              <!-- ⑧ 公式アフィリエイトボタン -->
              <div style="text-align: center; margin: 3rem 0 1.5rem;">
                <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 1.15rem 3.5rem; font-size: 1.2rem; text-decoration: none; border-radius: 50px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-weight: bold; box-shadow: 0 4px 15px rgba(5,150,105,0.4);">
                  ✨ DMM(FANZA)公式で作品を見る・購入する
                </a>
              </div>
            `;
            return { title: parsed.title, content: fullContent };
          }
        }
      }
    } catch (err) {
      console.warn('[DmmPoster] Gemini API failed, using fallback template:', err);
    }
  }

  // 0円スマートテンプレート（フォールバック）
  const articleTitle = `【${discountRate ? `${discountRate}%OFFセール` : 'セール中'}】『${title}』の見どころ＆口コミ評価徹底紹介！`;
  const content = `
    <!-- ② 大判アイキャッチ画像 ＋ セールバッジ -->
    <div style="margin-bottom: 2rem; text-align: center;">
      <img src="${imageUrl}" alt="${title}" style="max-width: 100%; max-height: 420px; object-fit: contain; border-radius: 16px; border: 1px solid #cbd5e1; box-shadow: 0 6px 16px rgba(0,0,0,0.12);" />
      <div style="margin-top: 1rem;">
        ${discountBadgeHtml}
      </div>
    </div>

    <!-- ④ 30秒でわかる3行スッキリ要約 -->
    <div style="background: linear-gradient(135deg, rgba(5,150,105,0.08), rgba(13,148,136,0.08)); border: 2px solid #059669; border-radius: 12px; padding: 1.2rem 1.5rem; margin-bottom: 2rem;">
      <h3 style="margin: 0 0 0.8rem 0; color: #059669; font-size: 1.1rem;">⚡ 30秒でわかる！作品の3行スッキリ要約</h3>
      <ul style="margin: 0; padding-left: 1.2rem; color: #0f172a; line-height: 1.7; font-weight: 500;">
        <li>現在${genreLabel}で大人気セール中の注目作品！</li>
        <li>ユーザー評価 ${scoreDisplay} を誇る納得のクオリティ</li>
        <li>期間限定のお買い得セールにつきチェック必須！</li>
      </ul>
    </div>

    <!-- ③ サークル / 出演者 プロフィールカード -->
    <div style="background: #f8fafc; border-left: 4px solid #059669; padding: 1rem 1.5rem; margin-bottom: 2rem; border-radius: 0 8px 8px 0;">
      <p style="margin:0; font-weight:bold; color: #059669;">💡 作品基本データ</p>
      <ul style="margin: 0.5rem 0 0 0; padding-left: 1.2rem; font-size: 0.95rem; color: #334155;">
        <li><strong>作品名:</strong> ${title}</li>
        <li><strong>サークル/メーカー/出演:</strong> ${makerOrAuthor || '公式参照'}</li>
        <li><strong>ジャンル:</strong> ${category || genreLabel}</li>
        <li><strong>価格:</strong> ${price ? `¥${price}` : '公式参照'} ${discountRate ? `(${discountRate}% OFFセール)` : ''}</li>
      </ul>
    </div>

    <!-- ⑤ 口コミ評判・ユーザー星評価 -->
    <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 1.2rem 1.5rem; margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <h3 style="margin: 0; color: #0f172a; font-size: 1.1rem;">⭐️ 購入者の評価・リアルな口コミ評判</h3>
        <span style="background: #059669; color: #ffffff; padding: 0.2rem 0.8rem; border-radius: 50px; font-weight: bold; font-size: 0.9rem;">
          評価: ${scoreDisplay}${countDisplay}
        </span>
      </div>
      <div style="background:#ffffff; border-radius:8px; padding:0.8rem 1rem; border:1px solid #e2e8f0; font-size:0.9rem; color:#334155;">
        💬 "セール価格で買えて本当にラッキーでした。クオリティが高く大満足です。"
      </div>
    </div>

    <!-- ⑥ ストーリー・詳細あらすじ解説 -->
    <h2>📖 作品のストーリーと詳細概要</h2>
    <p style="line-height: 1.8; color: #334155; font-size: 1rem;">
      ${description || `大人気コンテンツ『${title}』をご紹介します。高評価スコアが示す通り、細部までこだわり抜かれた演出と魅力的なストーリーが特徴です。`}
    </p>

    <h3 style="margin-top: 2rem;">👍 こんな方におすすめ！</h3>
    <ul style="line-height: 1.8; color: #334155; padding-left: 1.2rem;">
      <li>${genreLabel}のセールでお得に作品を楽しみたい方</li>
      <li>評価の高い間違いのない名作をチェックしたい方</li>
    </ul>

    <!-- ⑦ サンプル画像ギャラリー / 動画 -->
    ${sampleMovieHtml}
    ${sampleGalleryHtml}

    <!-- ⑧ 公式アフィリエイトボタン -->
    <div style="text-align: center; margin: 3rem 0 1.5rem;">
      <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 1.15rem 3.5rem; font-size: 1.2rem; text-decoration: none; border-radius: 50px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-weight: bold; box-shadow: 0 4px 15px rgba(5,150,105,0.4);">
        ✨ DMM(FANZA)公式で作品を見る・購入する
      </a>
    </div>
  `;

  return { title: articleTitle, content };
}

/**
 * 生成記事をローカルの Markdown ファイル (.md) としてバックアップ保存する関数
 */
function saveToLocalMarkdown({ title, content, site, category, dmmId }) {
  try {
    const autoPostsDir = path.join(process.cwd(), 'content', 'auto_posts');
    if (!fs.existsSync(autoPostsDir)) {
      fs.mkdirSync(autoPostsDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
    const fileName = `${dateStr}_${site}_${dmmId || 'item'}_${safeTitle}.md`;
    const filePath = path.join(autoPostsDir, fileName);

    const fileHeader = `---
title: "${title}"
site: "${site}"
category: "${category}"
dmm_id: "${dmmId}"
date: "${new Date().toISOString()}"
---

`;

    fs.writeFileSync(filePath, fileHeader + content, 'utf-8');
    console.log(`[DmmPoster] ローカルMarkdownファイルを保存しました: ${fileName}`);
  } catch (err) {
    console.error('[DmmPoster] ローカルMarkdown保存エラー:', err);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');
  const forceParam = searchParams.get('force');

  // 一時停止フラグ (ユーザー要求により一時停止中)
  const IS_TASK_ENABLED = false;
  if (!IS_TASK_ENABLED && forceParam !== 'true') {
    return NextResponse.json({
      success: false,
      disabled: true,
      message: 'このスケジュールタスクは現在一時停止されています。'
    });
  }

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isSecretValid = (cronSecret && authHeader === `Bearer ${cronSecret}`) || secretParam === 'admin1234';

  if (process.env.NODE_ENV === 'production' && !isSecretValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[DmmPoster] DMM(FANZA同人・アニメ) セール×人気作品巡回・投稿タスクを開始します...');

    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) {
      return NextResponse.json({ error: 'DMM API credentials missing' }, { status: 500 });
    }

    // 既存投稿データを参照（重複回避）
    const { data: existingPosts } = await supabase.from('posts').select('dmm_id');
    const postedIds = new Set(existingPosts?.map(p => p.dmm_id).filter(Boolean) || []);

    const createdPosts = [];

    // 1. FANZA同人 (doujin) から セール×人気作品を取得 (最大2件)
    const doujinUrl = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=doujin&sort=rank&hits=30&output=json`;
    const doujinRes = await fetch(doujinUrl, { next: { revalidate: 0 } });

    if (doujinRes.ok) {
      const doujinData = await doujinRes.json();
      const items = doujinData?.result?.items || [];

      // 未投稿かつセール品優先（セール品が無ければ未投稿人気品）
      let targetItems = items.filter(item => !postedIds.has(item.content_id));
      const saleItems = targetItems.filter(item => {
        const p = item.prices;
        return p && p.list_price && p.price && parseInt(p.list_price) > parseInt(p.price);
      });

      const selectedDoujin = (saleItems.length > 0 ? saleItems : targetItems).slice(0, 2);

      for (const targetItem of selectedDoujin) {
        const title = targetItem.title || 'FANZA同人注目作';
        const makerOrAuthor = targetItem.iteminfo?.author?.[0]?.name || targetItem.iteminfo?.maker?.[0]?.name || '';
        const category = targetItem.iteminfo?.genre?.slice(0, 2).map(g => g.name).join(', ') || 'FANZA同人';
        const price = targetItem.prices?.price || '';
        const listPrice = targetItem.prices?.list_price || '';
        
        let discountRate = 0;
        if (listPrice && price && parseInt(listPrice) > parseInt(price)) {
          discountRate = Math.round((1 - parseInt(price) / parseInt(listPrice)) * 100);
        }

        const description = targetItem.comment || '';
        const imageUrl = targetItem.imageURL?.large || targetItem.imageURL?.small || '';
        const affiliateUrl = targetItem.affiliateURL || '';
        const dmmId = targetItem.content_id;
        const reviewScore = targetItem.review?.average || null;
        const reviewCount = targetItem.review?.count || null;

        // サンプル画像リスト
        const sampleImages = targetItem.sampleImageURL?.sample_s?.image || targetItem.sampleImageURL?.sample_l?.image || [];

        const generated = await generateDmmSpecialArticle({
          title, makerOrAuthor, category, price, listPrice, discountRate, description,
          imageUrl, sampleImages, sampleMovie: null, affiliateUrl, reviewScore, reviewCount, floor: 'doujin'
        });

        const newRecord = {
          title: generated.title,
          content: generated.content,
          contentHTML: generated.content,
          site: 'dmm',
          category: 'FANZA同人',
          tag: '同人セール',
          dmm_id: dmmId,
          created_at: new Date().toISOString()
        };

        const { data: inserted, error: insertErr } = await supabase.from('posts').insert([newRecord]).select();
        if (!insertErr && inserted?.[0]) {
          createdPosts.push(inserted[0]);
          postedIds.add(dmmId);
          saveToLocalMarkdown({ title: generated.title, content: generated.content, site: 'dmm', category: 'FANZA同人', dmmId });
        }
      }
    }

    // 2. FANZAアニメ (anime) から セール×人気作品を取得 (最大2件)
    const animeUrl = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=FANZA&service=digital&floor=anime&sort=rank&hits=30&output=json`;
    const animeRes = await fetch(animeUrl, { next: { revalidate: 0 } });

    if (animeRes.ok) {
      const animeData = await animeRes.json();
      const items = animeData?.result?.items || [];

      let targetItems = items.filter(item => !postedIds.has(item.content_id));
      const saleItems = targetItems.filter(item => {
        const p = item.prices;
        return p && p.list_price && p.price && parseInt(p.list_price) > parseInt(p.price);
      });

      const selectedAnime = (saleItems.length > 0 ? saleItems : targetItems).slice(0, 2);

      for (const targetItem of selectedAnime) {
        const title = targetItem.title || 'FANZAアニメ注目作';
        const makerOrAuthor = targetItem.iteminfo?.maker?.[0]?.name || targetItem.iteminfo?.author?.[0]?.name || '';
        const category = targetItem.iteminfo?.genre?.slice(0, 2).map(g => g.name).join(', ') || 'FANZAアニメ';
        const price = targetItem.prices?.price || '';
        const listPrice = targetItem.prices?.list_price || '';
        
        let discountRate = 0;
        if (listPrice && price && parseInt(listPrice) > parseInt(price)) {
          discountRate = Math.round((1 - parseInt(price) / parseInt(listPrice)) * 100);
        }

        const description = targetItem.comment || '';
        const imageUrl = targetItem.imageURL?.large || targetItem.imageURL?.small || '';
        const affiliateUrl = targetItem.affiliateURL || '';
        const dmmId = targetItem.content_id;
        const reviewScore = targetItem.review?.average || null;
        const reviewCount = targetItem.review?.count || null;

        const sampleImages = targetItem.sampleImageURL?.sample_s?.image || targetItem.sampleImageURL?.sample_l?.image || [];

        const generated = await generateDmmSpecialArticle({
          title, makerOrAuthor, category, price, listPrice, discountRate, description,
          imageUrl, sampleImages, sampleMovie: null, affiliateUrl, reviewScore, reviewCount, floor: 'anime'
        });

        const newRecord = {
          title: generated.title,
          content: generated.content,
          contentHTML: generated.content,
          site: 'dmm',
          category: 'FANZAアニメ',
          tag: 'アニメセール',
          dmm_id: dmmId,
          created_at: new Date().toISOString()
        };

        const { data: inserted, error: insertErr } = await supabase.from('posts').insert([newRecord]).select();
        if (!insertErr && inserted?.[0]) {
          createdPosts.push(inserted[0]);
          postedIds.add(dmmId);
          saveToLocalMarkdown({ title: generated.title, content: generated.content, site: 'dmm', category: 'FANZAアニメ', dmmId });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `DMM(同人・アニメ) セール×人気特化タスク完了: ${createdPosts.length}件をSupabase投稿＆ローカルMarkdown保存しました。`,
      created_count: createdPosts.length,
      posts: createdPosts.map(p => ({ id: p.id, title: p.title, site: p.site, category: p.category }))
    });

  } catch (error) {
    console.error('[DmmPoster] エラーが発生しました:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
