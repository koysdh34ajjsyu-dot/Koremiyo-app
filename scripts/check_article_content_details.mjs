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

async function checkDetails() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, site, category, dmm_id, content');

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log('=== 1. カテゴリA (生Markdown太字) ===');
  const boldIds = ['692617cf-c88e-4432-889c-0b71486a404d', 'ac816324-b219-414b-af94-6fa2f6ed85bf', 'a56408f9-ba88-403b-a319-94d991451454'];
  for (const p of posts) {
    if (boldIds.includes(p.id)) {
      console.log(`\n--- [${p.id}] ${p.title} ---`);
      const bolds = p.content.match(/\*\*[^*]+\*\*/g) || [];
      console.log(`Bolds (${bolds.length}):`, bolds);
    }
  }

  console.log('\n=== 2. カテゴリB (【結論】) ===');
  for (const p of posts) {
    if (p.content.includes('【結論】')) {
      const match = p.content.match(/<h2[^>]*>.*?【結論】.*?<\/h2>/i);
      console.log(`[${p.dmm_id || p.id.slice(0, 8)}] ${p.title.slice(0, 30)} ->`, match ? match[0] : 'not in h2');
    }
  }

  console.log('\n=== 3. カテゴリC (セール記事の価格) ===');
  const saleIds = ['RJ01688423', 'RJ357058', 'RJ01641249', 'RJ328940', 'RJ01556529', 'RJ01702354', 'RJ01683949', 'RJ01612664', 'RJ01720281'];
  for (const p of posts) {
    if (saleIds.includes(p.dmm_id)) {
      const priceDiv = p.content.match(/<div><strong>💰 価格:<\/strong>(.*?)<\/div>/i) || p.content.match(/💰 価格:.*?(?:<\/div>|\n)/i);
      console.log(`[${p.dmm_id}] ${p.title.slice(0, 30)}`);
      console.log(`   Price snippet:`, priceDiv ? priceDiv[0] : 'Not found');
    }
  }
}

checkDetails();
