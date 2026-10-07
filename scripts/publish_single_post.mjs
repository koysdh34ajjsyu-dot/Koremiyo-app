import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local が見つかりません:', envPath);
    process.exit(1);
  }

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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = 'C:/Users/koysd/.gemini/antigravity/brain/a0e04cc5-0e7d-4802-8a6f-1cdd41229ca5/scratch/draft_book_post.json';
const post = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Starting publication of '${post.title}' to Supabase...`);

const record = {
  title: post.title,
  content: post.content,
  site: 'dmm',
  category: post.category || 'FANZAブックス',
  tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',') : ['成人コミック']),
  dmm_id: post.dmm_id,
  created_at: new Date().toISOString()
};

const { data, error } = await supabase.from('posts').insert([record]).select('id, title, site, dmm_id');
if (error) {
  console.error('❌ Failed to insert:', error.message);
  process.exit(1);
}

console.log(`\n🎉 Published Successfully! Post ID: ${data[0].id}`);
console.log(`タイトル: ${data[0].title}`);
console.log(`DMM_ID : ${data[0].dmm_id}`);

// Save result mapping for content_manager
fs.writeFileSync(
  'C:/Users/koysd/.gemini/antigravity/brain/a0e04cc5-0e7d-4802-8a6f-1cdd41229ca5/scratch/single_publish_result.json',
  JSON.stringify(data[0], null, 2),
  'utf8'
);
