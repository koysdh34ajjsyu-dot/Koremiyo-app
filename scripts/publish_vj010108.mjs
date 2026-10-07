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

if (!serviceRoleKey || !env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);

const targetHtmlPath = 'd:/AIproject/DMMaffireight/dlsite_ranking_articles/14_VJ010108_marshmallow_sister_succubus.html';
const rawContent = fs.readFileSync(targetHtmlPath, 'utf8');

const metaMatch = rawContent.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
if (!metaMatch) {
  console.error('❌ メタデータが見つかりません');
  process.exit(1);
}

const meta = JSON.parse(metaMatch[1].trim());
const bodyContent = rawContent.replace(metaMatch[0], '').trim();

const parsedTags = typeof meta.tags === 'string'
  ? meta.tags.split(',').map(t => t.trim()).filter(Boolean)
  : (Array.isArray(meta.tags) ? meta.tags : null);

const record = {
  title: meta.title,
  content: bodyContent,
  site: meta.site || 'dlsite',
  category: meta.category || 'アニメ・動画',
  tags: parsedTags,
  dmm_id: meta.dmm_id || 'VJ010108',
};

console.log(`Starting publication of [${record.dmm_id}] ${record.title}...`);

// Check if already exists
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
    console.error('❌ 更新失敗:', error.message);
    process.exit(1);
  }
  postId = data[0].id;
  console.log(`🔄 既存記事を更新しました: [ID: ${postId}]`);
} else {
  record.created_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('posts')
    .insert([record])
    .select();

  if (error) {
    console.error('❌ 新規作成失敗:', error.message);
    process.exit(1);
  }
  postId = data[0].id;
  console.log(`✅ 新規公開に成功しました: [ID: ${postId}]`);
}

console.log(`\n🎉 Supabase公開完了！ Post ID: ${postId}`);
