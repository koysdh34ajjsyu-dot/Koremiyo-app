# 「次、コレ見よ」(koremiyo-app) システム総合設計書・仕様書
**最終更新日**: 2026年8月12日  
**リポジトリ**: `https://github.com/koysdh34ajjsyu-dot/Koremiyo-app.git`  
**本番ドメイン**: [https://koremiyo-anime.online](https://koremiyo-anime.online)  

---

## 1. プロジェクト概要 & コンセプト

* **サイト名**: 次、コレ見よ (Koremiyo)
* **目的**: DMM (FANZA) および DLsite のオススメ同人作品・音声・スク水エロ・フェラ動画・ランキング・セール情報を厳選レビューし、ユーザーへ提供するアフィリエイト・ブログポータルサイト。
* **主要コンセプト**: 
  - **ビジュアルポータル構造**: 直感的な画像・アイコンと目的別クイックフィルターによる快適なナビゲーション動線。
  - **アイ・フレンドリー（目に優しい）デザイン**: 原色の眩しさを抑えたソフトスレート背景 (`#edf2f7`) と濃いチャコールブラックテキスト (`#0f172a` / `#334155`) による高コントラスト・低疲労設計。
  - **完全自動化 & 超高速ロード**: Next.js 16 (App Router) ＋ Supabase データベースによるサーバーレス＆爆速キャッシュ配信。

---

## 2. 技術スタック & 動作環境

* **フロントエンド**: Next.js 16.2.4 (App Router / Turbopack / React 19)
* **スタイリング**: Vanilla CSS (`src/app/globals.css` デザインシステム)
* **バックエンド / データベース**: Supabase (PostgreSQL / RLS セキュリティ)
* **インフラ / ホスティング**: Vercel (Vercel Cron による定時自動更新タスク含む)
* **アナリティクス**: Google Analytics 4 (プロパティID: `536322376`)

---

## 3. デザインシステム仕様 (`src/app/globals.css`)

```css
:root {
  --primary-color: #059669;    /* エメラルドグリーン (メインアクセント) */
  --primary-hover: #047857;    /* ホバー時ダークグリーン */
  --secondary-color: #0d9488;  /* ティールグリーン */
  --accent-color: #059669;     /* ハイライトグリーン */
  --bg-color: #edf2f7;         /* 目に優しいソフトスレートグレー背景 */
  --panel-bg: #ffffff;         /* カード・パネル純白背景 */
  --text-primary: #0f172a;     /* 主見出し・タイトル用 濃いチャコールブラック */
  --text-secondary: #334155;   /* 本文・説明用 深みのあるスレート文字 */
  --border-color: #cbd5e1;     /* カード枠線 */
  --shadow-color: rgba(15, 23, 42, 0.08); /* カード立体シャドウ */
}
```

---

## 4. データベース設計 (Supabase)

### 1. `posts` テーブル (ブログレビュー記事)
* `id` (bigint, PK)
* `title` (text) - 記事タイトル
* `content` / `contentHTML` (text) - 記事本文 (HTML形式, Quillエディタ出力)
* `site` (text) - 投稿サイト種別 (`dmm` / `dlsite`)
* `category` (text) - カテゴリ (`音声作品`, `スク水エロ`, `フェラ`, `FANZA動画` 等)
* `tag` (text) - タグ
* `created_at` / `updated_at` (timestamptz)

### 2. `ranked_products` テーブル (ランキング作品)
* `id` (bigint, PK)
* `rank_position` (int) - 順位 (1〜20)
* `title` (text) - 作品タイトル
* `image_url` (text) - サムネイル画像
* `affiliate_url` (text) - アフィリエイトリンク
* `description` (text) - 作品概要
* `actress` (text) - 出演者名 / 声優名
* `maker` (text) - サークル名 / メーカー名
* `updated_at` (timestamptz)

### 3. `campaigns` テーブル (広告バナー・キャンペーン)
* `id` (bigint, PK)
* `title` (text) - キャンペーン名
* `description` (text) - 概要
* `image_url` (text) - 画像バナーURL
* `link_url` (text) - 遷移先アフィリエイトリンク
* `html_code` (text) - DMMバナーなどの `<script>` タグを含むカスタムHTML
* `is_active` (boolean) - 公開・非公開フラグ
* `display_order` (int) - 表示順
* `expires_at` (timestamptz) - 表示終了期限 (自動非表示判定)

### 4. `feedbacks` テーブル (ユーザー要望)
* `id` (bigint, PK)
* `content` (text) - 送信された要望本文
* `status` (text) - `new` / `in_progress` / `resolved`
* `created_at` (timestamptz)

---

## 5. 主要ページ & ユーザー動線構造

### `src/app/page.js` (メイン統合コンポーネント)
1. **トップページ (`TopPage`)**:
   * **クイックジャンルフィルター**: `🎧 音声作品`, `👙 スク水・水着`, `💋 フェラ特集`, `🎬 FANZA動画`, `👑 人気ランキング`, `🎁 セール情報`
   * **ピックアップバナー**: `🔥 本日のイチオシ特集` 高評価作品
   * **ビジュアルナビカード**: DMMブログ / DLsiteブログ / ランキング / キャンペーン
   * **最新レビュー記事グリッド**: Supabaseから最新6件を取得し、アイキャッチ画像＋タイトル＋直出し記事ビューワーを搭載。
2. **DMMブログ (`DmmBlogPage`)** / **DLsiteブログ (`DlsiteBlogPage`)**: カテゴリ・検索絞り込みと記事展開。
3. **人気ランキング (`RankedProductsPage`)**: DMM & DLsiteのダブル集計ランキング。
4. **キャンペーン (`CampaignsPage`)**: 自動期限判定＋ウィジェットレンダリング。
5. **デザイン比較プレビュー (`/design-preview`)**: 案A・案B・案C・確定案のライブテストページ。

---

## 6. 管理者セキュリティ & 認証仕様

* **管理者ボタンのデフォルト非表示化**: 一般訪問者のヘッダーには「管理者 🔒」ボタンを一切表示させない。
* **解錠シークレットURL**:
  👉 `https://koremiyo-anime.online/?admin_key=koremiyo2026`
  このパラメータ付きURLでのみ管理者ボタンが出現し、`localStorage`へアクセス権を一時保持。
* **ワンタップ非表示ボタン**: ヘッダーの `✕` ボタン、または管理画面内の「🔒 管理者ログアウト」で即座にボタンを隠せる。
* **`/admin` パスワード保護 (`AdminLogin`)**: `/admin` 直打ち時もパスワード入力モーダル（`admin1234` / `koremiyo2026`）が保護。

---

## 7. ディレクトリ & ファイル構成

```text
koremiyo-app/
├── PROJECT_SPEC.md              # 【本設計書】システム総合設計書
├── AGENTS.md                    # Antigravityエージェント自動読み込み用ルール
├── src/
│   ├── app/
│   │   ├── globals.css          # マスターCSSデザインシステム
│   │   ├── page.js              # メイン全コンポーネント (TopPage, Dashboards)
│   │   ├── admin/page.js        # 管理者ルーティング (/admin)
│   │   ├── dmm/page.js          # DMMブログ (/dmm)
│   │   ├── dlsite/page.js       # DLsiteブログ (/dlsite)
│   │   ├── ranking/page.js      # ランキング (/ranking)
│   │   ├── campaign/page.js     # キャンペーン (/campaign)
│   │   ├── design-preview/page.js # デザイン比較プレビュー (/design-preview)
│   │   └── api/                 # 各種APIプロキシ & Cronタスク
│   └── lib/
│       └── supabase.js          # Supabaseクライアント設定 (no-store強制)
```

---

## 8. 新しいチャットセッションを開始する際の手順

新しいチャットを開始した際は、以下の指示をモデルに送信してください：

> **「`PROJECT_SPEC.md` を参照し、プロジェクトの現在の設計・技術スタック・仕様を把握した上で開発を進めてください。」**
