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
// Use SUPABASE_SERVICE_ROLE_KEY to bypass RLS for administrative posting
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = 'C:/Users/koysd/.gemini/antigravity/brain/a0e04cc5-0e7d-4802-8a6f-1cdd41229ca5/scratch/generated_dmm_posts.json';
const posts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Starting publication of ${posts.length} DMM articles to Supabase (using Service Role Key)...`);

const publishedResults = [];

for (const p of posts) {
  const tagsArray = p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : ['FANZA同人'];

  const record = {
    title: p.title,
    content: p.content,
    site: 'dmm',
    category: p.category || 'FANZA同人',
    tags: tagsArray,
    dmm_id: p.dmm_id,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('posts').insert([record]).select('id, title, site, dmm_id');
  if (error) {
    console.error(`❌ Failed to insert [${p.dmm_id}]:`, error.message);
  } else {
    console.log(`✅ Published Post ID: ${data[0].id} [${data[0].dmm_id}] - ${data[0].title.slice(0, 35)}...`);
    publishedResults.push(data[0]);
  }
}

console.log(`\n🎉 Published ${publishedResults.length} / ${posts.length} articles successfully!`);

// Save result mapping
fs.writeFileSync(
  'C:/Users/koysd/.gemini/antigravity/brain/a0e04cc5-0e7d-4802-8a6f-1cdd41229ca5/scratch/publish_results.json',
  JSON.stringify(publishedResults, null, 2),
  'utf8'
);
