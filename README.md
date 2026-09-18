# 「次、コレ見よ」(koremiyo-app) 開発ガイド ＆ サイト構造仕様書 (AI & Human Guide)

> 🤖 **AI Assistant Note**: This repository contains the complete specification, directory map, design tokens, database schemas, and route structure for the "次、コレ見よ" (Koremiyo) Web Portal. Any AI agent reading this workspace should reference this document and `PROJECT_SPEC.md` for architecture and implementation details.

---

## 🚀 複数AIチャット並列開発ガイドライン

本リポジトリは、複数のAIチャット（または複数のAIエージェント）で並列開発が行えるよう設計されています。
新しいチャットで開発を開始する際や、機能開発完了時の設計書更新手順については、[`PROMPT_TEMPLATES.md`](PROMPT_TEMPLATES.md) を参照してください。

- **新規チャット開始時プロンプト**: [`PROMPT_TEMPLATES.md`](PROMPT_TEMPLATES.md) の【テンプレート1】をAIに入力して設計書を読み込ませます。
- **機能完成時の設計書更新プロンプト**: [`PROMPT_TEMPLATES.md`](PROMPT_TEMPLATES.md) の【テンプレート2】をAIに入力して `PROJECT_SPEC.md` を更新させます。

---

## 📌 1. プロジェクト概要 (Project Overview)

* **サイト名**: 次、コレ見よ (Koremiyo)
* **本番ドメイン**: [https://koremiyo-anime.online](https://koremiyo-anime.online)
* **GitHubリポジトリ**: `https://github.com/koysdh34ajjsyu-dot/Koremiyo-app.git`
* **目的**: DMM (FANZA) および DLsite のおすすめ同人作品、音声、スク水エロ、フェラ動画、ランキング、セール情報を厳選レビュー・紹介するアフィリエイトポータルWebアプリケーション。
* **主要コンセプト**:
  1. **ビジュアルポータル構造**: 直感的な画像サムネイル、アイコン、目的別クイックジャンルフィルターによる超快適な導線。
  2. **アイ・フレンドリー（目に優しい）デザイン**: 原色の眩しさを抑えた落ち着いたソフトスレート背景 (`#edf2f7`) と、高コントラストで読みやすい濃いチャコールブラックテキスト (`#0f172a` / `#334155`)。
  3. **爆速ロード & 自動化**: Next.js 16 (App Router) ＋ Supabase データベースによるサーバーレス＆Vercel Cron自動同期。

---

## 🛠 2. 技術スタック & 動作環境 (Tech Stack)

* **フレームワーク**: Next.js 16.2.4 (App Router / Turbopack / React 19)
* **言語**: JavaScript (ES6+)
* **スタイリング**: Vanilla CSS (`src/app/globals.css` カスタムデザインシステム)
* **バックエンド / データベース**: Supabase (PostgreSQL / RLSセキュリティ)
* **ホスティング / Cron**: Vercel (Vercel Cron による自動更新タスク)
* **解析**: Google Analytics 4 (プロパティID: `536322376`)

---

## 🎨 3. デザインシステム & カラーパレット (`src/app/globals.css`)

```css
:root {
  --primary-color: #059669;    /* エメラルドグリーン (メインアクセント) */
  --primary-hover: #047857;    /* ホバー時ダークグリーン */
  --secondary-color: #0d9488;  /* ティールグリーン */
  --accent-color: #059669;     /* ハイライトグリーン */
  --bg-color: #edf2f7;         /* 目に優しいソフトスレートグレー背景 */
  --panel-bg: #ffffff;         /* カード・パネル純白背景 */
  --text-primary: #0f172a;     /* 主見出し・タイトル用 濃いチャコールブラック */
  --text-secondary: #334155;   /* 本文・説明文用 深みのあるスレート文字 */
  --border-color: #cbd5e1;     /* カード枠線 */
  --shadow-color: rgba(15, 23, 42, 0.08); /* 立体シャドウ */
}
```

---

## 🗂 4. フォルダ & サイト構造マップ (Directory & Page Structure)

```text
koremiyo-app/
├── README.md                    # 【本ファイル】開発ガイド & 総合マップ
├── PROJECT_SPEC.md              # 【AIマスター設計書】システム詳細仕様書
├── PROMPT_TEMPLATES.md          # 複数AI並列開発用プロンプト集
├── AGENTS.md                    # Antigravity AIエージェント設定ファイル
├── LLMS.txt / CLAUDE.md         # LLMエージェント自動読み込み標準ファイル
├── src/
│   ├── app/
│   │   ├── globals.css          # マスターCSSデザインシステム
│   │   ├── page.js              # メインビュー統合ファイル (TopPage, Dashboards)
│   │   ├── admin/page.js        # 管理者ルート (/admin)
│   │   ├── dmm/page.js          # DMMブログルート (/dmm)
│   │   ├── dlsite/page.js       # DLsiteブログルート (/dlsite)
│   │   ├── ranking/page.js      # ランキングルート (/ranking)
│   │   ├── campaign/page.js     # キャンペーンルート (/campaign)
│   │   ├── design-preview/page.js # デザイン比較プレビュー (/design-preview)
│   │   └── api/                 # APIプロキシ & Cron処理
│   │       ├── admin/campaign/  # キャンペーンCRUD API
│   │       ├── cron/update-ranking/ # ランキング自動更新Cron
│   │       ├── dlsite/ranking/  # DLsite同人ランキングAPI
│   │       └── dmm/             # DMM API プロキシ (product, actress)
│   └── lib/
│       └── supabase.js          # Supabaseクライアント設定 (no-store強制)
```

---

## 🗄 5. データベース設計 (Supabase Tables)

### 1. `posts` (ブログレビュー記事)
* `id` (bigint, PK)
* `title` (text) - 記事タイトル
* `content` / `contentHTML` (text) - 記事本文 (HTML形式)
* `site` (text) - `dmm` または `dlsite`
* `category` (text) - カテゴリ名 (`音声作品`, `スク水エロ`, `フェラ`, `FANZA動画` 等)
* `tag` (text) - タグ
* `dmm_id` (text) - 連携DMM商品ID
* `campaign_original_price` / `campaign_discount_price` / `campaign_expires_at` - セール情報
* `created_at` / `updated_at` (timestamptz)

### 2. `ranked_products` (DMM/FANZA人気ランキングデータ)
* `id` (bigint, PK)
* `rank_position` (int) - 順位 (1〜20)
* `title` (text) - 作品名
* `image_url` (text) - サムネイル画像
* `affiliate_url` (text) - アフィリエイトリンク
* `price` (text) - 価格
* `actress` (text) - 出演者 / 声優
* `genre` (text) - ジャンル
* `maker` (text) - メーカー / サークル
* `updated_at` (timestamptz)

### 3. `campaigns` (広告バナー・キャンペーン)
* `id` (bigint, PK), `title` (text), `description` (text), `image_url` (text), `link_url` (text), `html_code` (text), `is_active` (boolean), `display_order` (int), `expires_at` (timestamptz)

### 4. `feedbacks` (ユーザー要望機能)
* `id` (bigint, PK), `content` (text), `status` (text), `created_at` (timestamptz)

---

## 🔒 6. 管理者セキュリティ & 認証構造 (Admin Security)

1. **管理者ボタンの完全非表示化**: 一般訪問者にはヘッダーに管理者ボタンを表示しません。
2. **解錠用シークレットURL**:
   `https://koremiyo-anime.online/?admin_key=koremiyo2026`
   このパラメータ付きURLでのみ管理者ボタンが出現し、`localStorage`へ一時保持されます。
3. **ボタン非表示化 (✕)**: ヘッダーの `✕` ボタン、または管理画面内の「🔒 管理者ログアウト」で即座に非表示状態に戻せます。
4. **`/admin` パスワード保護 (`AdminLogin`)**: 直打ちされた場合もパスワード認証画面（`admin1234` / `koremiyo2026`）で保護されています。

---

## 💻 7. 開発 & ビルドコマンド (Commands)

```bash
# 開発サーバー起動
npm run dev

# 生産用ビルド検証 (必ずエラーのないことを確認)
npm run build

# Git コミット & 本番デプロイ
git add .
git commit -m "commit message"
git push
```