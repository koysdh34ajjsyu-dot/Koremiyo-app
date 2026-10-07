import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const projectRoot = 'd:/AIproject/DMMaffireight/koremiyo-app';
const envPath = path.join(projectRoot, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of content.split('\n')) {
  const match = line.trim().match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['\"]|['\"]$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const targetIds = [
  'ac816324-b219-414b-af94-6fa2f6ed85bf',
  '692617cf-c88e-4432-889c-0b71486a404d'
];

async function fixHeadings() {
  for (const id of targetIds) {
    const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error || !post) continue;

    let c = post.content;
    
    // ## 見出し<br><br> または ## 見出し
    c = c.replace(/^##\s+(.+?)(?:<br\s*\/?>)*$/gm, '<h2 style="font-size: 1.35rem; color: #0f172a; border-left: 5px solid #059669; padding-left: 0.8rem; margin: 2rem 0 1rem 0;">$1</h2>');
    
    // ### 見出し<br> または ### 見出し
    c = c.replace(/^###\s+(.+?)(?:<br\s*\/?>)*$/gm, '<h3 style="font-size: 1.15rem; color: #059669; border-bottom: 2px solid rgba(5,150,105,0.2); padding-bottom: 0.4rem; margin: 1.5rem 0 0.8rem 0;">$1</h3>');

    const { error: upErr } = await supabase.from('posts').update({ content: c }).eq('id', id);
    if (upErr) {
      console.error('Update error:', upErr);
    } else {
      console.log(`Successfully fixed headings for: [${id}] ${post.title}`);
    }
  }
}

fixHeadings();
