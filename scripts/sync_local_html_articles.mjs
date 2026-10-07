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

async function syncLocalHtml() {
  const dir = 'd:/AIproject/DMMaffireight/dlsite_ranking_articles';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  const { data: posts } = await supabase.from('posts').select('dmm_id, content');
  const postMap = new Map();
  for (const p of posts) {
    if (p.dmm_id) postMap.set(p.dmm_id, p.content);
  }

  for (const f of files) {
    const filePath = path.join(dir, f);
    const raw = fs.readFileSync(filePath, 'utf8');
    const metaMatch = raw.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
    if (!metaMatch) continue;

    const meta = JSON.parse(metaMatch[1]);
    const dmmId = meta.dmm_id;
    if (dmmId && postMap.has(dmmId)) {
      const updatedBody = postMap.get(dmmId);
      const newContent = `${metaMatch[0]}\n\n${updatedBody}`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Synced local file: ${f}`);
    }
  }
}

syncLocalHtml();
