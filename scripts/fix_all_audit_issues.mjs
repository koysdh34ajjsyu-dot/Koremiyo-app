import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim().replace(/^['\"]|['\"]$/g, '');
      env[match[1].trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);

// FANZA作品のきれいな見出しマッピング
const fanzaHeadings = {
  'd_284669': '『異世界わからせおじさん -勇者凌●編-』の決定的な魅力と見どころ',
  'd_795627': '『幼なじみ母姉妹とのハーレム性活』の圧倒的背徳感と見どころ',
  'd_739696': '『IF:ご近所様に種まきできる世界線の話 〜昔なじみ同級生の場合〜』の決定的な魅力とは？',
  'd_793160': '『「世界の終わりックス」をしよう』が描く極上の終末純愛体験',
  'd_631527': '『性活指導委員の搾精記録っ（はーと）』の決定的な魅力と見どころ'
};

// FANZAセールの価格マッピング
const fanzaCampaigns = {
  'd_631527': { originalPrice: 1100, discountPrice: 550, discountExpiry: '2026-10-15' },
  'd_739696': { originalPrice: 1540, discountPrice: 616, discountExpiry: '2026-10-15' },
  'd_284669': { originalPrice: 1320, discountPrice: 660, discountExpiry: '2026-10-15' },
};

async function fetchDlsiteApi(workno) {
  try {
    const url = `https://www.dlsite.com/maniax/api/=/product.json?workno=${workno}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.warn(`DLsite API fetch failed for ${workno}:`, e.message);
    return null;
  }
}

async function run() {
  console.log('--- 1. 全記事取得＆バックアップ作成 ---');
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*');

  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  const backupPath = path.resolve(projectRoot, '../backup_posts_before_fix.json');
  fs.writeFileSync(backupPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`✅ ${posts.length} 件の記事をバックアップしました: ${backupPath}`);

  let updatedCount = 0;

  for (const post of posts) {
    let content = post.content || '';
    let modified = false;
    const initialContent = content;

    // ==========================================
    // ステップ1: カテゴリA（生Markdown太字）の置換
    // ==========================================
    if (/\*\*[^*]+\*\*/.test(content)) {
      content = content.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: #0f172a;">$1</strong>');
      modified = true;
      console.log(`  [ステップ1 適用] ${post.id}: 生Markdown太字を <strong> に置換`);
    }

    // ==========================================
    // ステップ2: カテゴリB（【結論】メタ表記）の置換
    // ==========================================
    if (content.includes('【結論】')) {
      // FANZA個別記事の置換
      if (post.dmm_id && fanzaHeadings[post.dmm_id]) {
        const customTitle = fanzaHeadings[post.dmm_id];
        content = content.replace(
          /<h2([^>]*)>【結論】『[^』]+』は買うべき？一言で言うと……<\/h2>/i,
          `<h2$1>${customTitle}</h2>`
        );
        content = content.replace(
          /<h2([^>]*)>【結論】『[^』]+』は見るべき？一言で言うと……<\/h2>/i,
          `<h2$1>${customTitle}</h2>`
        );
      }
      
      // 一般的な【結論】の削除（後ろのキャッチコピーを残す）
      content = content.replace(/<h2([^>]*)>【結論】/gi, '<h2$1>');
      
      if (content !== initialContent) {
        modified = true;
        console.log(`  [ステップ2 適用] ${post.dmm_id || post.id}: 【結論】メタ表記を魅力的な見出しへ置換`);
      }
    }

    // ==========================================
    // ステップ3: カテゴリC（動的キャンペーンタグ）の付与
    // ==========================================
    const hasCampaignTag = /<!--CAMPAIGN:\{.*?\}-->/.test(content);
    if (!hasCampaignTag) {
      let campaignTag = null;

      // FANZA
      if (post.dmm_id && fanzaCampaigns[post.dmm_id]) {
        const c = fanzaCampaigns[post.dmm_id];
        campaignTag = `<!--CAMPAIGN:{"originalPrice":${c.originalPrice},"discountPrice":${c.discountPrice},"discountExpiry":"${c.discountExpiry}"}-->`;
      }
      // DLsite
      else if (post.dmm_id && post.dmm_id.startsWith('RJ')) {
        const apiData = await fetchDlsiteApi(post.dmm_id);
        if (apiData && apiData.is_discount_work) {
          const orig = apiData.official_price || Math.round(apiData.price / (1 - (apiData.discount_rate || 20) / 100));
          const disc = apiData.price;
          let expiry = '2026-10-15';
          if (apiData.campaign_end_date) {
            expiry = apiData.campaign_end_date.split(' ')[0];
          }
          campaignTag = `<!--CAMPAIGN:{"originalPrice":${orig},"discountPrice":${disc},"discountExpiry":"${expiry}"}-->`;
        } else if (/【\d+%OFF】/.test(post.title)) {
          // フォールバック: タイトルの%OFFから計算
          const match = post.title.match(/【(\d+)%OFF】/);
          const rate = match ? parseInt(match[1], 10) : 20;
          campaignTag = `<!--CAMPAIGN:{"originalPrice":1500,"discountPrice":${Math.round(1500 * (1 - rate / 100))},"discountExpiry":"2026-10-15"}-->`;
        }
      }

      if (campaignTag) {
        // 先頭（PR明記バッジの手前）に挿入
        content = `${campaignTag}\n\n${content.trim()}`;
        modified = true;
        console.log(`  [ステップ3 適用] ${post.dmm_id}: 動的キャンペーンタグを追加 -> ${campaignTag}`);
      }
    }

    // 更新が必要な場合はSupabaseに反映
    if (modified) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', post.id);

      if (updateError) {
        console.error(`❌ 更新失敗 [ID: ${post.id}]:`, updateError.message);
      } else {
        updatedCount++;
        console.log(`✅ Supabase更新成功: [${post.dmm_id || post.id}] ${post.title.slice(0, 30)}...`);
      }
    }
  }

  console.log(`\n🎉 全処理完了！ 合計 ${updatedCount} 件の記事をアップデートしました。`);
}

run();
