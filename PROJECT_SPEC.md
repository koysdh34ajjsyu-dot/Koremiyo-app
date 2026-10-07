# 「次、コレ見よ」(koremiyo-app) AI用システム総合設計書・仕様書

**最終更新日**: 2026年10月5日 (SEO・外部流入獲得基盤：個別動的記事ルーティング(/dlsite/[id], /dmm/[id])・動的sitemap.js・robots.js・ファーストビュー最適化)  
**リポジトリ**: `https://github.com/koysdh34ajjsyu-dot/Koremiyo-app.git`  
**本番ドメイン**: [https://koremiyo-anime.online](https://koremiyo-anime.online)  
**アフィリエイトID**: `KashiwagiTak-002` (DMM/FANZA公式) / `Koremiyoonline` (DLsite)  

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
  - **完全SEO・外部流入設計**: 全レビュー記事の個別動的ルート (SSR) 化、動的メタデータ・OGP生成、動的サイトマップ (`sitemap.xml`) による検索エンジン自動インデックス体制。

---

## 2. 技術スタック & 動作環境

* **フロントエンド**: Next.js 16.2.4 (App Router / Turbopack / React 19)
* **スタイリング**: Vanilla CSS (`src/app/globals.css` マスターCSSデザインシステム)
* **バックエンド / データベース**: Supabase (PostgreSQL / RLS セキュリティ)
* **インフラ / ホスティング**: Vercel (Vercel Cron による自動更新タスク含む)
* **SEO & クローラー巡回基盤**: 動的サイトマップ (`src/app/sitemap.js` 全55URL自動生成) / クローラー巡回規則 (`src/app/robots.js`) / JSON-LD構造化データ (`BlogPosting`) / 動的OGP・Twitter Card
* **アナリティクス**: Google Analytics 4 (プロパティID: `536322376` / Measurement ID: `G-PQBTDZSEZZ` / Data API v1beta連携分析スクリプト配備)

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
│   │   ├── page.js              # メイン全コンポーネント (TopPage, Ranking, CampaignsPage等)
│   │   ├── sitemap.js           # 【新設】動的サイトマップ (/sitemap.xml / 全55URL自動生成)
│   │   ├── robots.js            # 【新設】検索クローラー巡回規則 (/robots.txt)
│   │   ├── admin/
│   │   │   ├── page.js          # 管理者画面ルーティング (/admin)
│   │   │   └── AdminDashboard.js # 分離・集約された管理コントロールセンター
│   │   ├── dmm/
│   │   │   ├── page.js          # DMMブログルーティング (/dmm)
│   │   │   └── [id]/page.js     # 【新設】個別DMM動画記事詳細ページ (/dmm/[id])
│   │   ├── dlsite/
│   │   │   ├── page.js          # DLsiteブログルーティング (/dlsite)
│   │   │   └── [id]/page.js     # 【新設】個別DLsite同人記事詳細ページ (/dlsite/[id])
│   │   ├── ranking/page.js      # 人気ランキングルーティング (/ranking)
│   │   ├── campaign/
│   │   │   ├── page.js          # キャンペーン一覧ルーティング (/campaign)
│   │   │   └── [id]/page.js     # 個別キャンペーン詳細ページ (/campaign/[id])
│   │   ├── en/                  # 英語多言語ルーティング (/en, /en/ranking 等)
│   │   ├── design-preview/page.js # デザイン比較プレビュー
│   │   └── api/                 # 各種APIエンドポイント
│   └── lib/
│       ├── supabase.js          # Supabaseクライアント設定
│       ├── i18n.js              # 日英多言語辞書
│       └── currency.js          # JPY⇄USD為替換算
```

### 主要コンポーネント
- `AppLayoutWrapper`: 全体レイアウト、共通ヘッダー、ナビゲーション、解錠シークレット管理ボタン
- `TopPage`: メイントップ。ファーストビュー省スペース化（約50%圧縮）、ジャンルフィルター、ピックアップバナー、最新記事グリッド（個別記事 `<Link>` クローラー巡回対応）、戻るボタン（`popstate`）対応
- `DlsiteBlogPage` (`/dlsite`): DLsiteレビュー記事一覧。全カード `<Link href="/dlsite/[id]">` 内部リンク最適化
- `DmmBlogPage` (`/dmm`): DMMレビュー記事一覧。全カード `<Link href="/dmm/[id]">` 内部リンク最適化
- `DlsiteArticlePage` (`/dlsite/[id]`): 【新設】個別DLsite同人記事詳細ページ (SSR)。動的SEO/OGPメタデータ (`generateMetadata`)、`BlogPosting` 構造化データ (JSON-LD)、パンくずリスト、キャンペーン情報バー、`SafeHtmlRenderer` 本文描画、Xシェアボタン、回遊ナビゲーション
- `DmmArticlePage` (`/dmm/[id]`): 【新設】個別DMM動画記事詳細ページ (SSR)。DMM動画専用動的SEO/OGP、JSON-LD、パンくず、Xシェアボタン
- `sitemap.js` (`/sitemap.xml`): 【新設】固定ページ9件＋公開記事37件＋キャンペーン9件の計55件のURLをGooglebotへ自動通知する動的サイトマップ
- `robots.js` (`/robots.txt`): 【新設】検索クローラーの全ページ巡回許可および管理URL（`/admin`, `/api`）保護、サイトマップ通知
- `RankedProductsPage` (`/ranking`): 公開ランキングページ（左: DMM/FANZA、右: DLsiteネイティブカードリスト）
- `DlsiteRankingList`: DLsite同人ランキングをAPIより取得して表示するネイティブカードリストコンポーネント
- `CampaignsPage` (`/campaign`):
  - **二重アクション導線**: カード内に「🔍 ポップアップ (Quick View)」と「📄 詳細ページ」ボタンを配置し、概要の素早い確認と長文・詳細の閲覧を両立。
  - `HtmlWidgetRenderer`: DMM公式ウィジェットスクリプトを安全かつ動的に実行・描画。
- `CampaignDetailPage` (`/campaign/[id]`):
  - 動的SEO/OGPメタデータ (`generateMetadata`)、パンくずリスト、カウントダウン期限バッジ、[PR]表記、高CVR CTAボタン、Xシェアボタン。
- `RealProductSearch`: DMMリアルタイム検索 & 女優スリーサイズ検索
- `RealActressSearch`: 女優データベース検索
- `AdminDashboard` (`src/app/admin/AdminDashboard.js`): 管理画面専用に完全分離されたコントロールセンター

---

## 7. 管理者セキュリティ & 認証仕様

* **管理者ボタンのデフォルト非表示化**: 一般訪問者画面には管理者ボタンを非表示。
* **解錠シークレットURL**:
  `https://koremiyo-anime.online/?admin_key=koremiyo2026`
  このパラメータ付きURLでのみ解錠され、ヘッダーに管理者用リンクが出現。
* **`/admin` パスワード保護**: パスワード (`admin1234` / `koremiyo2026`) による二重保護。

---

## 8. DMMキャンペーン運用・連携仕様 (最新プロトコル)

1. **標準データ入力フォーマット**:
   - `content_manager.xlsx` の **【キャンペーン】シート**（シート2）へ完全統合。
   - 列構成: `作業フラグ`, `ステータス詳細`, `対象サイト`, `キャンペーン名`, `特設ページURL`, `アフィリエイトURL`, `バナー素材1〜5`, `開催終了日時`, `セール概要・訴求メモ`, `管理用ID`。
   - （旧 `campaign_management/DMMcampaign.csv` は廃止・`archive_old_inputs/` へ退避完了）
2. **AI自律調査 & アフィリエイトURL自動生成**:
   - 特設ページURL（E列）からアフィリエイトURL（F列: `KashiwagiTak-002`）を100%自動生成。
   - 終了日時（`expires_at`: ISO 8601）、対象ジャンル、割引内容、`[PR]` 表記付きタイトル、購買意欲を高める訴求文、300x250メインバナーをURL先から自動取得・構成。
3. **人間事前承認プロトコル (Human-in-the-Loop)**:
   - 完全自動公開は行わず、必ずチャット上で確認用ドラフト一覧を提示。ユーザーの「承認 / 公開して」を確認後に Supabase および管理シートへ本番反映。
4. **アフィリエイトID & コンプライアンス**:
   - 公式ID: `KashiwagiTak-002`（全URLおよびウィジェットスクリプトに適用）。
   - 景品表示法・ステマ規制に準拠（`[PR]` 広告明示、二重価格適正化、終了日時到来時の自動非表示化）。

---

## 9. 統合管理シート運用 & 記事品質厳格化仕様 (最新プロトコル)

1. **統合管理シート (`content_manager.xlsx` / `content_manager.csv`) 仕様**:
   - **単一入力ポータル (Single Source of Input)**: 散在していた入力ファイル（`content_manager.xlsx`, `DMMblog.csv`, `DMMcampaign.csv`）を1つのExcelブック（`content_manager.xlsx`）へ完全集約。デスクトップに直接開けるショートカットを配置済み。
   - **2シート構成**:
     - シート1: **【記事作成】** (全17列) - DLsite（同人・音声・動画）およびDMM/FANZA（同人・動画・ブックス）の全レビュー管理。
     - シート2: **【キャンペーン】** (全14列) - セール・特集・くじプロモーション管理。
2. **アフィリエイトURLの100%自動生成 & タグ自動解析**:
   - E列に通常の商品URLまたは特設URLを入力するだけで、DMM/FANZA（`KashiwagiTak-002`）およびDLsite（`Koremiyoonline`）の正規アフィリエイトURLをAI/スクリプトが100%自動生成。ツールバーからのタグコピー作業が完全不要化。
   - ユーザーが素材列やF列にHTMLタグ（`<a href="..."><img src="..."></a>`）を貼り付けた場合でも、`href` からアフィリエイトURLを安全抽出し、`iframe`（Chobitプレイヤー等）を素材5へ自動格納する互換性を維持。
   - 低解像度サムネイル（`_img_sam.jpg`, `ps.jpg` 等）は全面使用禁止。同人は `_img_smp1〜5.jpg`（800x600 HD）、商業動画・同人は `pl.jpg`（大判高画質）および `jp-001.jpg〜`（HDシーンキャプチャ）へ自動昇格。
3. **公式API・Webスクレイピング連携による自動補完**:
   - DLsite公式API（`maniax`, `appx`, `books`, `pro`）およびDMM/FANZA詳細ページ（EUC-JP/CP932/UTF-8対応）から、正式タイトル、サークル/出演/メーカー名、カテゴリ、定価、セール価格、割引率、キャンペーン終了日時、公式あらすじを自動取得して全項目を補完。
4. **記事生成の品質厳格化基準**:
   - **動的キャンペーンタグ**: セール作品には記事先頭に `<!--CAMPAIGN:{"originalPrice":...,"discountPrice":...,"discountExpiry":"YYYY-MM-DD"}-->` を埋め込み、サイト上のカウントダウンバーと完全連動。
   - **100% Pure HTML記法**: フロントエンドで `dangerouslySetInnerHTML` 描画されるため、生Markdown（`**太字**` や `## 見出し`）を完全禁止。インラインスタイルを適用した `<strong style="...">`, `<h2 style="...">` 等の純粋HTMLタグで統一。
   - **自然なキャッチコピー見出し**: 「【結論】」等の無機質なメタ表記を完全排除し、読者を惹きつける自然な見出しに刷新。
   - **縦型画像最適化**: 書籍（マンガ）等の縦長画像には `style="width: 100%; max-width: 360px; ..."` のコンテナ制約を適用し、巨大化・画面崩れを防止。
5. **作業完了作品の自動整理（混同防止）**:
   - 記事の本番公開・作業完了後は、他の未着手・進行中作品との混同を防止するため、事前バックアップ保持の上で該当行を管理シートから削除し、常に作業待ち案件のみを保持・管理する。

---

## 10. 変更履歴 (Change Log)

- **2026/10/05 (データ入力完全一元化 & アフィリエイトURL自動生成パイプライン配備)**:
  - **入力ファイルの1本化**: 散在していた入力用ファイル（`content_manager.xlsx`, `DMMblog.csv`, `campaign_management/DMMcampaign.csv`, `target_list.csv`）を統合Excelブック **`content_manager.xlsx`**（シート1「記事作成」、シート2「キャンペーン」の2シート構成）へ完全一本化。旧ファイル群は `archive_old_inputs/` へ安全退避。
  - **アフィリエイトURLの100%自動生成**: 商品URLや特設ページURLを入力するだけで、DMM/FANZA（`KashiwagiTak-002`）およびDLsite（`Koremiyoonline`）の正規アフィリエイトリンクを自動生成するロジックを配備。手動でのツールバータグコピー作業を完全不要化。
  - **マルチサイト自動調査・補完スクリプトの拡張**: `inspect_and_fill_sheet.py` を全面改修し、DMM/FANZAの年齢確認・文字コード自動判定および高解像度大判画像（`pl.jpg`）・サンプル画像（`jp-001.jpg〜`）抽出に対応。後方互換用CSV（`content_manager.csv`, `campaigns.csv`）の自動同期を実装。
  - **デスクトップショートカット作成**: ユーザーのデスクトップ上に `content_manager（次コレ管理シート）.lnk` を配置し、1クリックで直接開ける環境を整備。
  - `npm run build` による静的検証（全23ルート・エラー0件）および `AI_SHARED_CONTEXT.md` 仕様同期を完了。
- **2026/10/05 (SEO・外部流入獲得基盤の確立)**:
  - **GA4分析とボトルネック特定**: Google Analytics Data API（プロパティID: `536322376`）による直近データ分析を実施。ファーストビュー改修により直帰率が75.0%→46.5%に改善、セッションあたりPVが1.5→3.51PVに急伸した一方、個別記事URLが存在せず自然検索流入がほぼゼロだった根本課題を特定。
  - **個別動的記事ルート（SSR）新設**: `/dlsite/[id]` (`src/app/dlsite/[id]/page.js`) および `/dmm/[id]` (`src/app/dmm/[id]/page.js`) を新設。全公開記事に独立URL、動的SEO/OGPメタデータ (`generateMetadata`)、`BlogPosting` 構造化データ (JSON-LD)、パンくずリスト、Xシェアボタンを実装。
  - **動的サイトマップ & robots.txt 導入**: `src/app/sitemap.js`（固定ページ9件＋記事37件＋キャンペーン9件の計55URL自動生成）および `src/app/robots.js` を設置し、Googlebotへの全件自動インデックス通知基盤を構築。
  - **内部リンクのクローラー最適化**: `TopPage`、`DlsiteBlogPage`、`DmmBlogPage` の記事カードをクライアントState切り替えから `<Link href="...">` に最適化し、検索クローラーが全記事へ自然に巡回できるように改善。
  - `npm run build` による全23ルート静的・動的ビルド検証をエラー0件でパス。
- **2026/10/05**:
  - 記事品質基準の厳格化（高解像度選定、100% Pure HTML記法、メタ表記【結論】排除、動的キャンペーンタグ標準化、縦型画像制約）を確立。
  - Supabase公開全27記事の一括品質監査・バッチ改修を実施（エラー0件・合格率100%達成）。
  - 新規9作品（DLsite/Books/Appx）の自動調査・HTML記事案生成・Supabase本番公開（累計36記事へ拡大）を完了。
  - 管理シート（`content_manager.xlsx` / `.csv`）から作業完了行を自動削除し、作業待ち案件のみを保持する混同防止ルールを正式策定。
- **2026/09/23**: 
  - DMMキャンペーンの運用フォーマットを `campaign_management/DMMcampaign.csv` に一本化し、自動調査・ドラフト提示・事前承認公開フローを確立。
  - キャンペーン専用個別詳細ページ動的ルート `/campaign/[id]` (`src/app/campaign/[id]/page.js`) を新設（SEO/OGP・パンくず・カウントダウン・ウィジェット描画・高CVR CTA・Xシェア）。
  - キャンペーン一覧 (`/campaign`) に「🔍 ポップアップ」と「📄 詳細ページ」の二重導線を導入。
  - DMMアフィリエイトIDを `KashiwagiTak-002` に統一固定。
- **2026/09/22**: DMMブログ（`/dmm`）代行記事作成スキル（`dmm-affiliate-article-generator`）を新設。
- **2026/09/18**: 動的タクソノミー（カテゴリピルバー）および多ジャンル拡張。
- **2026/09/17**: 管理画面コードの分離軽量化 (`AdminDashboard.js`) および `manage-posts.mjs` CLIツール新設。
- **2026/09/07**: 多言語（英語 `/en`）対応および通貨換算基盤の構築。
- **2026/08/22**: DLsite同人ランキングの埋め込み二重枠を撤去し、`/api/dlsite/ranking` APIおよび `DlsiteRankingList` ネイティブカードリスト表示を新設・統合。
- **2026/08/12**: システム総合設計書 (`PROJECT_SPEC.md`) 初版作成。

