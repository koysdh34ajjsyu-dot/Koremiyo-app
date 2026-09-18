import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// .env.local 読み込み
function loadEnv() {
  const envPath = 'd:/AIproject/DMMaffireight/koremiyo-app/.env.local';
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
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY が .env.local に設定されていません。');
  console.log('   1. Supabaseダッシュボード (Project Settings > API) を開きます。');
  console.log('   2. `service_role secret` の値をコピーします。');
  console.log('   3. koremiyo-app/.env.local の `SUPABASE_SERVICE_ROLE_KEY=` に貼り付けて保存してください。\n');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);

const articlesDir = 'd:/AIproject/DMMaffireight/dlsite_ranking_articles';
const allFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html')).sort();

const isAll = process.argv.includes('--all');
const targetFiles = isAll ? allFiles : [allFiles[0]];

console.log(`\n🚀 ${isAll ? '全5件の一括公開' : '【安全テスト】第1位（1件のみ）の先行公開'} を開始します...`);

const published = [];

for (const file of targetFiles) {
  const filePath = path.join(articlesDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf8');

  // メタデータ抽出
  const metaMatch = rawContent.match(/<!--\s*METADATA\s*([\s\S]*?)-->/);
  if (!metaMatch) {
    console.error(`❌ メタデータが見つかりません: ${file}`);
    continue;
  }

  const meta = JSON.parse(metaMatch[1].trim());
  const bodyContent = rawContent.replace(metaMatch[0], '').trim();

  // 既存記事の重複チェック
  if (meta.dmm_id) {
    const { data: existing } = await supabase
      .from('posts')
      .select('id, title')
      .eq('dmm_id', meta.dmm_id)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`\n⏭️  既に公開済みのためスキップします: [${meta.dmm_id}] ${existing[0].title}`);
      continue;
    }
  }

  const parsedTags = typeof meta.tags === 'string'
    ? meta.tags.split(',').map(t => t.trim()).filter(Boolean)
    : (Array.isArray(meta.tags) ? meta.tags : null);

  const record = {
    title: meta.title,
    content: bodyContent,
    site: meta.site || 'dlsite',
    category: meta.category || '3Dゲーム',
    tags: parsedTags,
    dmm_id: meta.dmm_id || null,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('posts').insert([record]).select();
  if (error) {
    console.error(`❌ 公開失敗: ${file}`, error.message);
  } else {
    const post = data[0];
    console.log(`\n✅ 正常に公開されました！ [ID: ${post.id}]`);
    console.log(`   タイトル: ${post.title}`);
    console.log(`   カテゴリ: ${post.category} | 作品番号: ${post.dmm_id}`);
    published.push(post);
  }
}

console.log(`\n🎉 公開完了: ${published.length} 件`);
if (!isAll && published.length > 0) {
  console.log('👉 まずは本番サイトでこの1記事の表示・プレイヤー・リンクを確認してください。');
  console.log('👉 問題がなければ、`node scripts/publish-5-articles.mjs --all` を実行して残り4件も公開できます。');
}
