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

async function inspectArticles() {
  const { data: articles, error } = await supabase
    .from('posts')
    .select('id, title, site, category, dmm_id, created_at, content');

  if (error) {
    console.error('Error fetching articles:', error);
    process.exit(1);
  }

  console.log(`Total articles found in Supabase: ${articles.length}`);

  const results = [];

  for (const art of articles) {
    const content = art.content || '';
    const issues = [];

    // 1. 低解像度サムネイルチェック
    const samMatches = content.match(/https?:\/\/[^\s"']+(?:_img_sam\.jpg|_img_sam_mini\.jpg)/g) || [];
    const dmmSmallMatches = content.match(/https?:\/\/[^\s"']+(?:ps\.jpg)/g) || [];
    if (samMatches.length > 0 || dmmSmallMatches.length > 0) {
      issues.push({
        type: 'LOW_RES_IMAGE',
        severity: 'HIGH',
        detail: `低解像度サムネイル画像（_img_sam等）が使用されています`,
        matches: [...samMatches, ...dmmSmallMatches]
      });
    }

    // 2. 生のMarkdown記法チェック
    const rawBoldMatches = content.match(/\*\*[^*]+\*\*/g) || [];
    const rawHeadingMatches = content.match(/^#{1,4}\s+.+$/gm) || [];
    const rawMdLinkMatches = content.match(/\[[^\]]+\]\(https?:\/\/[^\)]+\)/g) || [];
    if (rawBoldMatches.length > 0 || rawHeadingMatches.length > 0 || rawMdLinkMatches.length > 0) {
      issues.push({
        type: 'RAW_MARKDOWN',
        severity: 'HIGH',
        detail: `生のMarkdown記法（**太字**など）が残っています（Next.js描画時にそのまま表示されてしまいます）`,
        matches: [...rawBoldMatches, ...rawHeadingMatches, ...rawMdLinkMatches].slice(0, 5)
      });
    }

    // 3. 不自然なメタ表記チェック（【結論】等）
    const metaLabelMatches = content.match(/【(?:結論|概要|まとめ)】/g) || [];
    if (metaLabelMatches.length > 0) {
      issues.push({
        type: 'META_LABEL',
        severity: 'MEDIUM',
        detail: `読者向けではないメタ表記（【結論】等）が見出し等に含まれています`,
        matches: metaLabelMatches
      });
    }

    // 4. キャンペーンタグチェック
    const hasCampaignTag = /<!--CAMPAIGN:\{.*?\}-->/.test(content);
    const mentionsSale = /OFF|セール|均一|限定/i.test(art.title) || /OFF|セール|均一/i.test(content.slice(0, 1000));
    if (mentionsSale && !hasCampaignTag) {
      issues.push({
        type: 'MISSING_CAMPAIGN_TAG',
        severity: 'MEDIUM',
        detail: 'セール・割引訴求がありますが、動的カウントダウンタグ（<!--CAMPAIGN:...-->）が未設定です。'
      });
    }

    // 5. 縦型パッケージのmax-width制約チェック
    const mainImgMatch = content.match(/<img[^>]+itemprop=["']image["'][^>]*>/i) || content.match(/<img[^>]+alt=["'][^"']*パッケージ[^"']*["'][^>]*>/i);
    if (mainImgMatch) {
      const imgTag = mainImgMatch[0];
      const hasMaxWidth = /max-width:\s*(?:3[0-9]{2}|400)px/i.test(imgTag);
      if (art.dmm_id && art.dmm_id.startsWith('VJ') && !hasMaxWidth) {
        issues.push({
          type: 'UNCONSTRAINED_VERTICAL_IMAGE',
          severity: 'LOW',
          detail: '縦型パッケージ画像に max-width: 360px の制約がなく、巨大表示の懸念があります。'
        });
      }
    }

    results.push({
      id: art.id,
      dmm_id: art.dmm_id,
      site: art.site,
      title: art.title,
      created_at: art.created_at,
      contentLength: content.length,
      issueCount: issues.length,
      issues
    });
  }

  const outPath = path.resolve(projectRoot, '../audit_supabase_articles.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Audit complete. Results saved to ${outPath}`);

  // サマリー表示
  const issueArticles = results.filter(r => r.issueCount > 0);
  console.log(`\n=== 監査サマリー ===`);
  console.log(`全記事数: ${results.length}`);
  console.log(`改善が必要な記事数: ${issueArticles.length}`);
  for (const a of issueArticles) {
    console.log(`\n- [${a.site}] ${a.title.slice(0, 40)}... (ID: ${a.dmm_id || a.id})`);
    for (const iss of a.issues) {
      console.log(`    [${iss.severity}] ${iss.type}: ${iss.detail}`);
    }
  }
}

inspectArticles();
