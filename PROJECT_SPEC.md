# Koremiyo (DMMアフィリエイトサイト) プロジェクト仕様書

## プロジェクト概要
DMMアフィリエイトのAPIを活用し、商品のランキングやおすすめ情報を公開するウェブサイトです。エンドユーザー向けには常に最速で情報を提供するため、Next.jsのサーバーレスアーキテクチャとSupabaseを組み合わせています。

## 技術スタック
- **フレームワーク**: Next.js 16.2.4 (App Router)
- **言語**: JavaScript / React
- **バックエンド / データベース**: Supabase (PostgreSQL, Row Level Security)
- **ホスティング**: Vercel (Vercel Cronを使用した定期実行タスク含む)

---

## データベース設計 (Supabase)

### 1. `ranked_products` テーブル
DMM APIから取得したランキング商品データを保存するテーブル。
- `id` (bigint, PK)
- `rank_position` (int) - 順位。表示用。
- `title` (text) - 商品名
- `image_url` (text) - サムネイル画像
- `affiliate_url` (text) - アフィリエイトリンク
- `description` (text) - 商品説明
- `actress` (text) - 出演者名
- `maker` (text) - メーカー名
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. `campaigns` テーブル
管理者が手動で登録する広告やキャンペーン情報を保存するテーブル。
- `id` (bigint, PK)
- `title` (text) - キャンペーン名
- `description` (text) - 説明文
- `image_url` (text) - 画像URL
- `link_url` (text) - 遷移先アフィリエイトリンク
- `html_code` (text) - DMMバナーなどの動的ウィジェット用HTML/Scriptコード
- `is_active` (boolean) - 公開フラグ
- `display_order` (int) - 表示順（昇順）
- `expires_at` (timestamptz) - 表示期限（この時間を過ぎると自動非表示になる）
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### セキュリティポリシー (RLS)
- 両テーブルともに、`SELECT`権限は `public` (anon および authenticated) に許可されています。
- 追加・更新・削除はNext.jsのAPIルート (`/api/admin/...` または `/api/cron/...`) 経由で **Service Role Key** を用いて実行されるため、ブラウザからの直接の書き込みはブロックされています。
- クライアントのフェッチキャッシュ問題を回避するため、`src/lib/supabase.js` にて `cache: 'no-store'` が強制されています。

---

## 主要な機能と構造

### `src/app/page.js` (モノリス設計)
このファイル一つで公開ページと管理画面のルーティング・コンポーネントを担っています。

#### 1. 公開画面 (エンドユーザー向け)
- **ランキング画面 (`ProductRanking`)**: Supabaseの `ranked_products` テーブルから高速にデータを読み込み表示。
- **キャンペーン画面 (`CampaignsPage`)**: `campaigns` テーブルから、`is_active = true` かつ `expires_at` が期限切れでないものを表示。`html_code` が存在する場合は `HtmlWidgetRenderer` コンポーネントを通じて `<script>` タグを再構築し安全に実行。

#### 2. 管理画面 (管理者向け)
- **アクセス方法**: URLに `?secret=admin1234` を付与してアクセス。
- **ログイン**: Supabase Auth (`supabase.auth.signInWithPassword`) を使用。
- **DMMツール**: DMM APIを直接叩いて商品の検索・比較を行う機能。
- **ランキング管理**: DMM APIからランキングを手動で再取得し、`ranked_products` テーブルを上書き保存する。
- **キャンペーン管理 (`CampaignAdmin`)**: 広告・ウィジェットのCRUD操作。表示順、公開/非公開、表示期限などを設定可能。

### API ルート (`src/app/api/...`)
- **`/api/cron/update-ranking`**: Vercel Cronによって定期的に呼び出され、DMMからランキングデータを取得してSupabaseに保存する完全自動処理。
- **`/api/admin/campaign`**: 管理画面からのリクエストを受け取り、`campaigns` テーブルに対してCRUD操作を行う。
- **`/api/dmm/product`, `/api/dmm/actress`**: DMM APIへのプロキシ。管理者画面でのみ使用される。
