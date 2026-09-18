# 「次、コレ見よ」(koremiyo-app) AI用システム総合設計書・仕様書

**最終更新日**: 2026年8月22日  
**リポジトリ**: `https://github.com/koysdh34ajjsyu-dot/Koremiyo-app.git`  
**本番ドメイン**: [https://koremiyo-anime.online](https://koremiyo-anime.online)  

---

## 💡 本設計書の目的（複数チャット並列開発用ルール）

本ドキュメントは、**複数のAIチャットセッションで並列して新機能開発や保守を行う際の「単一の信頼できる情報源 (Single Source of Truth)」**です。

### 規則
1. **開発開始時**: 新しいチャットセッションを開いたら、まず本設計書（`PROJECT_SPEC.md`）をAIに読み込ませてください。
2. **開発中**: 定義されているディレクトリ構成・技術スタック・CSS変数・API命名規則に従ってください。
3. **開発完了時**: 開発・修正を行ったチャット内で、変更内容（新規API、追加テーブル、コンポーネント、動作仕様など）を本設計書に必ず更新・追記させてください。

---

## 1. プロジェクト概要 & コンセプト

* **サイト名**: 次、コレ見よ (Koremiyo)
* **目的**: DMM (FANZA) および DLsite のオススメ同人作品・音声・スク水エロ・フェラ動画・ランキング・セール情報を厳選レビューし、ユーザーへ提供するアフィリエイト・ブログポータルサイト。
* **主要コンセプト**: 
  - **ビジュアルポータル構造**: 直感的な画像・アイコンと目的別クイックフィルターによる快適なナビゲーション動線。
  - **アイ・フレンドリー（目に優しい）デザイン**: 原色の眩しさを抑えたソフトスレート背景 (`#edf2f7`) と濃いチャコールテキスト (`#0f172a` / `#334155`) による高コントラスト・低疲労設計。
  - **完全自動化 & 超高速ロード**: Next.js 16 (App Router / Turbopack) ＋ Supabase データベースによる爆速キャッシュ配信。
  - **二重枠のない完全ネイティブUI**: 外部ウィジェット（DLsite等）の埋め込み枠を廃止し、自社統一UIカードリストで統合レンダリング。

---

## 2. 技術スタック & 動作環境

* **フロントエンド**: Next.js 16.2.4 (App Router / Turbopack / React 19)
* **スタイリング**: Vanilla CSS (`src/app/globals.css` マスターCSSデザインシステム)
* **バックエンド / データベース**: Supabase (PostgreSQL / RLS セキュリティ)
* **インフラ / ホスティング**: Vercel (Vercel Cron による自動更新タスク含む)
* **リッチテキストエディタ**: `react-quill-new` (管理者投稿用)
* **アナリティクス**: Google Analytics 4 (プロパティID: `536322376`)

---

## 3. デザインシステム仕様 (`src/app/globals.css`)

デザインの変更や新規UIの作成時は、必ず以下のマスターCSS変数およびクラスを活用してください。

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

### 主要共通UIクラス
- `.glass-panel`: カード枠・パネル用基本スタイル（背景白、丸角16px、枠線、薄いシャドウ）
- `.btn .btn-primary`: メインアクションボタン
- `.btn .btn-outline`: サブアクションボタン
- `.text-gradient`: グラデーションタイトルテキスト
- `.animate-fade-in`: フェードイン表示アニメーション

---

## 4. データベース設計 (Supabase)

### 1. `posts` テーブル (ブログレビュー記事)
- `id` (bigint, PK)
- `title` (text) - 記事タイトル
- `content` / `contentHTML` (text) - 記事本文 (HTML形式)
- `site` (text) - 投稿サイト種別 (`dmm` / `dlsite`)
- `category` (text) - カテゴリ (`音声作品`, `スク水エロ`, `フェラ`, `FANZA動画` 等)
- `tag` (text) - タグ
- `dmm_id` (text) - 連携DMM商品ID
- `campaign_original_price` / `campaign_discount_price` / `campaign_expires_at` - キャンペーンセール情報
- `created_at` / `updated_at` (timestamptz)

### 2. `ranked_products` テーブル (DMM/FANZA人気ランキング作品)
- `id` (bigint, PK)
- `rank_position` (int) - 順位 (1〜20)
- `title` (text) - 作品タイトル
- `image_url` (text) - サムネイル画像
- `affiliate_url` (text) - アフィリエイトリンク
- `price` (text) - 価格
- `actress` (text) - 出演者名 / 声優名
- `genre` (text) - ジャンル
- `maker` (text) - サークル名 / メーカー名
- `updated_at` (timestamptz)

### 3. `campaigns` テーブル (広告バナー・キャンペーン)
- `id` (bigint, PK)
- `title` (text) - キャンペーン名
- `description` (text) - 概要
- `image_url` (text) - 画像バナーURL
- `link_url` (text) - 遷移先アフィリエイトリンク
- `html_code` (text) - カスタムHTML / バナーコード
- `is_active` (boolean) - 公開・非公開フラグ
- `display_order` (int) - 表示順
- `expires_at` (timestamptz) - 表示終了期限

### 4. `feedbacks` テーブル (ユーザー要望)
- `id` (bigint, PK)
- `content` (text) - 送信された要望本文
- `status` (text) - `new` / `in_progress` / `resolved`
- `created_at` (timestamptz)

---

## 5. APIエンドポイント一覧

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/dlsite/ranking` | GET | DLsite公式APIから最新同人ランキング(24h)を取得し独自JSONで返却 |
| `/api/cron/update-ranking` | GET | Vercel Cron用。DMM APIからFANZAランキングを取得しSupabaseに自動保存 |
| `/api/dmm/product` | GET | DMM ItemList APIの検索プロキシ |
| `/api/dmm/actress` | GET | DMM Actress APIの女優検索・スリーサイズ検索プロキシ |
| `/api/admin/campaign` | GET / POST | キャンペーンバナーの取得・作成・更新 |

---

## 6. ディレクトリ & コンポーネント構成

```text
koremiyo-app/
├── PROJECT_SPEC.md              # 【本設計書】AI用システム総合設計書
├── PROMPT_TEMPLATES.md          # 複数AIチャット並列開発用プロンプト集
├── src/
│   ├── app/
│   │   ├── globals.css          # マスターCSSデザインシステム
│   │   ├── layout.js            # ルートレイアウト・メタデータ
│   │   ├── page.js              # メイン全コンポーネント (TopPage, Ranking, Admin等)
│   │   ├── admin/page.js        # 管理者画面ルーティング (/admin)
│   │   ├── dmm/page.js          # DMMブログルーティング (/dmm)
│   │   ├── dlsite/page.js       # DLsiteブログルーティング (/dlsite)
│   │   ├── ranking/page.js      # 人気ランキングルーティング (/ranking)
│   │   ├── campaign/page.js     # キャンペーンルーティング (/campaign)
│   │   ├── design-preview/page.js # デザイン比較プレビュー
│   │   └── api/                 # 各種APIエンドポイント
│   └── lib/
│       └── supabase.js          # Supabaseクライアント設定
```

### 主要コンポーネント (`src/app/page.js`)
- `AppLayoutWrapper`: 全体レイアウト、共通ヘッダー、ナビゲーション、解錠シークレット管理ボタン
- `TopPage`: メイントップ。ジャンルフィルター、ピックアップバナー、ビジュアルカード、最新レビュー
- `DmmBlogPage` / `DlsiteBlogPage`: 各ブログ記事一覧および展開表示
- `RankedProductsPage`: 公開ランキングページ（左: DMM/FANZA、右: DLsiteネイティブカードリスト）
- `DlsiteRankingList`: DLsite同人ランキングをAPIより取得して表示するネイティブカードリストコンポーネント
- `RealProductSearch`: DMMリアルタイム検索 & 女優スリーサイズ検索
- `RealActressSearch`: 女優データベース検索
- `AdminDashboard` / `DmmAdmin` / `DlsiteAdmin` / `CampaignAdmin` / `RankingAdmin` / `FeedbackAdmin`: 管理機能群

---

## 7. 管理者セキュリティ & 認証仕様

* **管理者ボタンのデフォルト非表示化**: 一般訪問者画面には管理者ボタンを非表示。
* **解錠シークレットURL**:
  `https://koremiyo-anime.online/?admin_key=koremiyo2026`
  このパラメータ付きURLでのみ解錠され、ヘッダーに管理者用リンクが出現。
* **`/admin` パスワード保護**: パスワード (`admin1234` / `koremiyo2026`) による二重保護。

---

## 8. 変更履歴 (Change Log)

- **2026/08/22**: DLsite同人ランキングの埋め込み二重枠を撤去し、`/api/dlsite/ranking` APIおよび `DlsiteRankingList` ネイティブカードリスト表示を新設・統合。
- **2026/08/12**: システム総合設計書 (`PROJECT_SPEC.md`) 初版作成。
