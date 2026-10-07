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

async function check() {
  const { data } = await supabase.from('posts').select('dmm_id, content').eq('dmm_id', 'RJ01688423').single();
  console.log('--- RJ01688423 START ---');
  console.log(data.content.slice(1000, 2500));
}

check();
