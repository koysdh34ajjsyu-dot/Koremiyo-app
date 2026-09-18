#!/usr/bin/env node
/**
 * manage-posts.mjs
 * 
 * チャット（AI）および開発者が直接Supabaseのposts/campaignsテーブルへ
 * 記事や広告を投稿・確認・更新・削除するための管理ツール
 * 
 * 使い方:
 *   node scripts/manage-posts.mjs list [--limit=10] [--site=dmm|dlsite]
 *   node scripts/manage-posts.mjs get <id>
 *   node scripts/manage-posts.mjs create <path-to-json-or-data>
 *   node scripts/manage-posts.mjs update <id> <path-to-json-or-data>
 *   node scripts/manage-posts.mjs delete <id>
 *   node scripts/manage-posts.mjs campaign-list
 *   node scripts/manage-posts.mjs campaign-add <path-to-json-or-data>
 *   node scripts/manage-posts.mjs campaign-delete <id>
 */

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
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseInputData(rawArg) {
  if (!rawArg) {
    throw new Error('データ（JSON文字列またはファイルパス）が指定されていません。');
  }
  if (fs.existsSync(rawArg)) {
    const fileContent = fs.readFileSync(rawArg, 'utf8');
    return JSON.parse(fileContent);
  }
  return JSON.parse(rawArg);
}

async function listPosts(options = {}) {
  const limit = options.limit || 10;
  let query = supabase
    .from('posts')
    .select('id, title, site, category, tags, dmm_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (options.site) {
    query = query.eq('site', options.site);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ 記事一覧の取得に失敗しました:', error.message);
    process.exit(1);
  }

  console.log(`\n=== 📋 記事一覧 (直近 ${data.length} 件) ===`);
  data.forEach((p) => {
    console.log(`[ID: ${p.id}] [${p.site?.toUpperCase() || 'UNKNOWN'}] [${p.category || 'カテゴリなし'}]`);
    console.log(`  タイトル: ${p.title}`);
    console.log(`  DMM_ID: ${p.dmm_id || 'なし'} | タグ: ${p.tags || 'なし'} | 作成日時: ${p.created_at}`);
    console.log('----------------------------------------------------');
  });
}

async function getPost(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`❌ 記事 (ID: ${id}) の取得に失敗しました:`, error.message);
    process.exit(1);
  }

  console.log(`\n=== 📄 記事詳細 (ID: ${data.id}) ===`);
  console.log(`タイトル   : ${data.title}`);
  console.log(`サイト     : ${data.site}`);
  console.log(`カテゴリ   : ${data.category}`);
  console.log(`タグ       : ${data.tags || 'なし'}`);
  console.log(`DMM ID     : ${data.dmm_id || 'なし'}`);
  console.log(`作成日時   : ${data.created_at}`);
  console.log('---------------- 本文 (最初の300文字) ----------------');
  console.log((data.content || '').slice(0, 300) + '...');
}

async function createPost(postData) {
  const record = {
    title: postData.title,
    content: postData.content || postData.contentHTML || '',
    site: postData.site || 'dlsite',
    category: postData.category || '音声作品',
    tags: postData.tags || postData.tag || null,
    dmm_id: postData.dmm_id || null,
    created_at: new Date().toISOString()
  };

  if (!record.title || !record.content) {
    console.error('❌ title と content は必須です。');
    process.exit(1);
  }

  const { data, error } = await supabase.from('posts').insert([record]).select();
  if (error) {
    console.error('❌ 記事の作成に失敗しました:', error.message);
    process.exit(1);
  }

  console.log(`\n🎉 記事が正常に公開されました！ [ID: ${data[0].id}]`);
  console.log(`タイトル: ${data[0].title}`);
  console.log(`サイト  : ${data[0].site}`);
  console.log(`カテゴリ: ${data[0].category}`);
}

async function updatePost(id, updateData) {
  const record = {};
  if (updateData.title !== undefined) record.title = updateData.title;
  if (updateData.content !== undefined) record.content = updateData.content;
  if (updateData.site !== undefined) record.site = updateData.site;
  if (updateData.category !== undefined) record.category = updateData.category;
  if (updateData.tags !== undefined || updateData.tag !== undefined) record.tags = updateData.tags || updateData.tag;
  if (updateData.dmm_id !== undefined) record.dmm_id = updateData.dmm_id;

  const { data, error } = await supabase
    .from('posts')
    .update(record)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`❌ 記事 (ID: ${id}) の更新に失敗しました:`, error.message);
    process.exit(1);
  }

  console.log(`\n✅ 記事 (ID: ${id}) を正常に更新しました！`);
  console.log(`タイトル: ${data[0].title}`);
}

async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    console.error(`❌ 記事 (ID: ${id}) の削除に失敗しました:`, error.message);
    process.exit(1);
  }
  console.log(`\n🗑️ 記事 (ID: ${id}) を正常に削除しました。`);
}

async function listCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('❌ キャンペーン一覧の取得に失敗しました:', error.message);
    process.exit(1);
  }

  console.log(`\n=== 📢 キャンペーン・広告一覧 (${data.length} 件) ===`);
  data.forEach((c) => {
    console.log(`[ID: ${c.id}] [有効: ${c.is_active}] [順序: ${c.display_order}]`);
    console.log(`  タイトル: ${c.title}`);
    console.log(`  リンク  : ${c.link_url || 'なし'}`);
    console.log(`  画像    : ${c.image_url || 'なし'}`);
    console.log('----------------------------------------------------');
  });
}

async function addCampaign(campData) {
  const record = {
    title: campData.title,
    description: campData.description || '',
    image_url: campData.image_url || '',
    link_url: campData.link_url || '',
    html_code: campData.html_code || '',
    is_active: campData.is_active !== undefined ? Boolean(campData.is_active) : true,
    display_order: campData.display_order ? Number(campData.display_order) : 0,
    expires_at: campData.expires_at || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!record.title) {
    console.error('❌ title は必須です。');
    process.exit(1);
  }

  const { data, error } = await supabase.from('campaigns').insert([record]).select();
  if (error) {
    console.error('❌ キャンペーンの作成に失敗しました:', error.message);
    process.exit(1);
  }

  console.log(`\n🎉 キャンペーン広告が正常に追加されました！ [ID: ${data[0].id}]`);
  console.log(`タイトル: ${data[0].title}`);
  console.log(`リンク  : ${data[0].link_url}`);
}

async function deleteCampaign(id) {
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) {
    console.error(`❌ キャンペーン (ID: ${id}) の削除に失敗しました:`, error.message);
    process.exit(1);
  }
  console.log(`\n🗑️ キャンペーン (ID: ${id}) を正常に削除しました。`);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
使用可能なコマンド:
  node scripts/manage-posts.mjs list [--limit=10] [--site=dmm|dlsite]
  node scripts/manage-posts.mjs get <id>
  node scripts/manage-posts.mjs create <json-or-file>
  node scripts/manage-posts.mjs update <id> <json-or-file>
  node scripts/manage-posts.mjs delete <id>
  node scripts/manage-posts.mjs campaign-list
  node scripts/manage-posts.mjs campaign-add <json-or-file>
  node scripts/manage-posts.mjs campaign-delete <id>
  `);
  process.exit(0);
}

try {
  switch (command) {
    case 'list': {
      const limitArg = args.find((a) => a.startsWith('--limit='));
      const siteArg = args.find((a) => a.startsWith('--site='));
      const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 10;
      const site = siteArg ? siteArg.split('=')[1] : null;
      await listPosts({ limit, site });
      break;
    }
    case 'get': {
      const id = args[1];
      if (!id) throw new Error('記事IDを指定してください。');
      await getPost(id);
      break;
    }
    case 'create': {
      const postData = parseInputData(args[1]);
      await createPost(postData);
      break;
    }
    case 'update': {
      const id = args[1];
      if (!id) throw new Error('記事IDを指定してください。');
      const updateData = parseInputData(args[2]);
      await updatePost(id, updateData);
      break;
    }
    case 'delete': {
      const id = args[1];
      if (!id) throw new Error('記事IDを指定してください。');
      await deletePost(id);
      break;
    }
    case 'campaign-list': {
      await listCampaigns();
      break;
    }
    case 'campaign-add': {
      const campData = parseInputData(args[1]);
      await addCampaign(campData);
      break;
    }
    case 'campaign-delete': {
      const id = args[1];
      if (!id) throw new Error('キャンペーンIDを指定してください。');
      await deleteCampaign(id);
      break;
    }
    default:
      console.error(`❌ 未知のコマンドです: ${command}`);
      process.exit(1);
  }
} catch (err) {
  console.error('❌ エラーが発生しました:', err.message);
  process.exit(1);
}
