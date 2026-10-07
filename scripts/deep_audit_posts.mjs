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

async function inspectImagesAndTags() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, site, category, dmm_id, created_at, content');

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const report = [];

  for (const p of posts) {
    const content = p.content || '';
    
    // 画像タグの抽出
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images = [];
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      images.push({
        fullTag: match[0],
        src: match[1]
      });
    }

    // Markdown太字
    const bolds = content.match(/\*\*[^*]+\*\*/g) || [];

    // メタ表記
    const metaHeadings = content.match(/<h[1-6][^>]*>.*?【(?:結論|概要|まとめ).*?<\/h[1-6]>/gi) || [];

    // キャンペーンタグ
    const campaignTags = content.match(/<!--CAMPAIGN:\{.*?\}-->/g) || [];

    report.push({
      id: p.id,
      dmm_id: p.dmm_id,
      title: p.title,
      site: p.site,
      created_at: p.created_at,
      images,
      boldsCount: bolds.length,
      boldsSample: bolds.slice(0, 3),
      metaHeadings,
      hasCampaignTag: campaignTags.length > 0,
      campaignTags
    });
  }

  fs.writeFileSync('d:/AIproject/DMMaffireight/deep_audit_posts.json', JSON.stringify(report, null, 2), 'utf8');
  console.log(`Saved deep audit to deep_audit_posts.json. Total posts: ${report.length}`);
}

inspectImagesAndTags();
