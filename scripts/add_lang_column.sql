-- ==============================================================================
-- Supabase Schema Migration: Add `lang` column to `posts` table
-- Purpose: Enable multi-language support (Japanese 'ja' & English 'en')
-- ==============================================================================

-- 1. posts テーブルに lang カラムを追加 (デフォルト: 'ja')
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS lang text DEFAULT 'ja';

-- 2. 既存データで NULL のものがあれば 'ja' に更新
UPDATE posts 
SET lang = 'ja' 
WHERE lang IS NULL;

-- 3. 言語によるフィルタリング高速化のためのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_posts_lang ON posts(lang);
CREATE INDEX IF NOT EXISTS idx_posts_lang_created_at ON posts(lang, created_at DESC);

-- 確認クエリ
-- SELECT id, title, site, lang, created_at FROM posts ORDER BY created_at DESC LIMIT 10;
