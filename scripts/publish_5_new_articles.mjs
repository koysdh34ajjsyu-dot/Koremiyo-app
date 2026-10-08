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
      let val = match[2].trim().replace(/^['"]|['"]$/g, '');
      env[match[1].trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);

const targetFiles = [
  '24_RJ01685047_onna_yuusha_koihai.html',
  '25_RJ01666292_otonoko_salon_chikubi.html',
  '26_RJ01671077_dosukebe_locker.html',
  '27_RJ01706401_night_pool_gyaru_harem.html',
  '28_RJ01678831_kitsui_aegi_ninshin_imouto.html'
];

const articlesDir = path.resolve(projectRoot, '..', 'dlsite_ranking_articles');

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

    const metaBlock = metaMatch[1];
    const meta = {};
    for (const line of metaBlock.split('\n')) {
      const trimmed = line.trim();
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        meta[key] = val;
      }
    }

    // Body content (strip METADATA block)
    const content = rawContent.replace(/<!--\s*METADATA[\s\S]*?-->\s*/, '').trim();

    // Parse tags to array
    const tagsArray = meta.tags
      ? meta.tags.split(',').map(t => t.trim()).filter(Boolean)
      : ['DLsite', meta.category || '同人'];

    const record = {
      title: meta.title,
      content: content,
      site: meta.site || 'dlsite',
      category: meta.category || '同人',
      tags: tagsArray,
      dmm_id: meta.dmm_id
    };

    // Check if post with dmm_id already exists
    const { data: existing, error: checkError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('dmm_id', meta.dmm_id)
      .limit(1);

    if (checkError) {
      console.error(`Error checking existing post for ${meta.dmm_id}:`, checkError.message);
      continue;
    }

    if (existing && existing.length > 0) {
      console.log(`Updating existing post ID ${existing[0].id} for ${meta.dmm_id}...`);
      const { data, error: updateError } = await supabase
        .from('posts')
        .update(record)
        .eq('id', existing[0].id)
        .select();

      if (updateError) {
        console.error(`Failed to update ${meta.dmm_id}:`, updateError.message);
      } else {
        console.log(`✅ Successfully updated post ID ${data[0].id} (${meta.dmm_id})`);
        results.push({ id: data[0].id, dmm_id: meta.dmm_id, title: meta.title, action: 'updated' });
      }
    } else {
      console.log(`Inserting new post for ${meta.dmm_id}...`);
      record.created_at = new Date().toISOString();
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([record])
        .select();

      if (insertError) {
        console.error(`Failed to insert ${meta.dmm_id}:`, insertError.message);
      } else {
        console.log(`✅ Successfully inserted new post ID ${data[0].id} (${meta.dmm_id})`);
        results.push({ id: data[0].id, dmm_id: meta.dmm_id, title: meta.title, action: 'inserted' });
      }
    }
  }

  console.log(`\n=== Batch Publication Finished ===`);
  console.log(`Processed: ${results.length} / ${targetFiles.length}`);
  results.forEach(r => console.log(`- [${r.action.toUpperCase()}] ID: ${r.id} | ${r.dmm_id} | ${r.title}`));
}

publishBatch().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
