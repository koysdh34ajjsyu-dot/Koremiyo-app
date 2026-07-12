import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(envFile.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('=')));

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseAnonKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('--- Testing SELECT ---');
  const { data, error } = await supabase
    .from('ranked_products')
    .select('rank_position, title')
    .limit(3);
    
  if (error) {
    console.error('Fetch Error:', error);
  } else {
    console.log('Fetch Success! Data length:', data?.length);
    console.log(data);
  }
}

testFetch();
