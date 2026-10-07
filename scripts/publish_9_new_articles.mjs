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

const targetFiles = [
  '15_RJ01491408_uninhabited_island_survival.html',
  '16_RJ01673232_damasare_nomunication.html',
  '17_RJ01651392_uraaka_sarasuzo_lovehotel.html',
  '18_BJ01910616_tall_silent_girlfriend.html',
  '19_BJ045391_hentai_yamamoto_san.html',
  '20_BJ006146_yumiel_endless_feed.html',
  '21_RJ01719638_gyaru_harem.html',
  '22_RJ01660984_gym_early_for_me.html',
  '23_RJ01689189_nakadashi_city.html'
];

const articlesDir = 'd:/AIproject/DMMaffireight/dlsite_ranking_articles';

async function publishBatch() {
  console.log(`Starting publication of ${targetFiles.length} new articles to Supabase...`);

  const results = [];

  for (const fileName of targetFiles) {
    const filePath = path.join(articlesDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const rawContent = fs.readFileSync(filePath, 'utf8');
    const metaMatch = rawContent.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
    if (!metaMatch) {
      console.error(`No metadata found in: ${fileName}`);
      continue;
    }

    const meta = JSON.parse(metaMatch[1].trim());
    const bodyContent = rawContent.replace(metaMatch[0], '').trim();

    const parsedTags = typeof meta.tags === 'string'
      ? meta.tags.split(',').map(t => t.trim()).filter(Boolean)
      : (Array.isArray(meta.tags) ? meta.tags : ['DLsite', 'セール']);

    const record = {
      title: meta.title,
      content: bodyContent,
      site: meta.site || 'dlsite',
      category: meta.category || '同人作品',
      tags: parsedTags,
      dmm_id: meta.dmm_id
    };

    // 既存チェック
    const { data: existing } = await supabase
      .from('posts')
      .select('id, title')
      .eq('dmm_id', record.dmm_id)
      .limit(1);

    let postId = null;

    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('posts')
        .update(record)
        .eq('id', existing[0].id)
        .select();

      if (error) {
        console.error(`❌ Update failed for ${record.dmm_id}:`, error.message);
        continue;
      }
      postId = data[0].id;
      console.log(`🔄 Updated existing post: [${record.dmm_id}] ID: ${postId}`);
    } else {
      record.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('posts')
        .insert([record])
        .select();

      if (error) {
        console.error(`❌ Insert failed for ${record.dmm_id}:`, error.message);
        continue;
      }
      postId = data[0].id;
      console.log(`✅ Published new post: [${record.dmm_id}] ID: ${postId}`);
    }

    results.push({
      fileName,
      dmm_id: record.dmm_id,
      title: record.title,
      postId
    });
  }

  const outResultPath = 'd:/AIproject/DMMaffireight/published_9_articles_result.json';
  fs.writeFileSync(outResultPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n🎉 All ${results.length} articles published to Supabase! Details saved to: ${outResultPath}`);
}

publishBatch();
