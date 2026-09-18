# ==============================================================================
# AI_AGENT_SHARED_CONTEXT_SPECIFICATION
# ==============================================================================
# @target_system: koremiyo-app ("次、コレ見よ")
# @document_type: Machine-to-Machine Inter-Chat Synchronization Protocol
# @target_audience: AI Coding Assistants / Autonomous Agents (Antigravity, Cursor, Claude Code, ChatGPT, Copilot)
# @human_readability: NOT_REQUIRED (Optimized for High Token Density, AST Parsing, Zero-Hallucination)
# @last_updated: 2026-09-06
# ==============================================================================

ai_meta_contract:
  purpose: >
    本ウェブサイト（次、コレ見よ / koremiyo-app）の開発仕様・アーキテクチャ・データベース構造・
    デザインシステム・API契約・セキュリティ規則を、複数のAIチャットセッションおよび自律エージェント間で
    完全かつ齟齬なく共通認識（Single Source of Truth）させるための共有コンテキスト定義体。
  
  mandatory_update_protocol:
    rule: >
      【仕様変更追記義務】
      本プロジェクトに対して機能追加、API変更、DBテーブル/カラム変更、デザインシステム変更、
      セキュリティルールの改修を実施したAI/チャットセッションは、実装完了後に必ず本ドキュメント
      （AI_SHARED_CONTEXT.md）の該当ブロックおよび「mutation_log」に最新仕様を追記・更新すること。
    trigger_events:
      - APIエンドポイントの新設・変更・削除
      - DBスキーマ（テーブル・カラム・制約・インデックス）の変更
      - 新規コンポーネント追加またはルーティング変更
      - 管理者認証・セキュリティロジックの変更
      - 自動化タスク（Cron/スクリプト）の仕様改訂
    verification_step: "更新後は必ず構文整合性を維持し、次期AIセッションが即座に同期可能な状態を担保すること"

system_identity:
  site_name: "次、コレ見よ"
  app_id: "koremiyo-app"
  production_domain: "https://koremiyo-anime.online"
  canonical_url: "https://koremiyo-anime.online"
  github_repo: "https://github.com/koysdh34ajjsyu-dot/Koremiyo-app.git"
  target_audience: "DMM/FANZA・DLsiteの同人・音声・アニメ・成人向け作品探索ユーザー"
  primary_niches:
    - "音声作品 (フェラ音声, シチュエーション音声)"
    - "スク水エロ / スクール水着"
    - "フェラチオ特化作品"
    - "FANZA人気動画 / アニメ"
    - "セール・割引キャンペーン情報"

runtime_environment:
  framework: "Next.js 16.2.4 (App Router / Turbopack / React 19)"
  styling: "Vanilla CSS (`src/app/globals.css` Master Design System)"
  backend_database: "Supabase (PostgreSQL 15+, Row Level Security enabled)"
  supabase_client_config:
    path: "src/lib/supabase.js"
    cache_policy: "fetch { ...options, cache: 'no-store' } (ブラウザ・CDNキャッシュ強制バイパス)"
  hosting_platform: "Vercel (Production CI/CD + Vercel Cron)"
  ai_generation_engine: "Google Gemini API (GEMINI_API_KEY)"
  analytics:
    provider: "Google Analytics 4"
    measurement_id: "G-PQBTDZSEZZ"
    property_id: "536322376"
    load_condition: "process.env.NODE_ENV === 'production' のみ注入"

hard_constraints_for_ai:
  language: "日本語 (すべての回答、コード内コメント、コミットメッセージは日本語を必須とする)"
  build_validation: "コード変更後は必ず `npm run build` (npx next build) による静的検証を実施しエラー0件を確認"
  no_external_iframe_double_border: "DLsiteなどの外部ウィジェット埋め込みによる二重スクロール・二重枠は禁止。自社API経由のネイティブカードコンポーネントで描画すること"
  admin_stealth_rule: "一般訪問者画面には管理者ボタンを一切描画しない。特定シークレットURL経由でのみ解錠表示"

design_system_tokens:
  source_file: "src/app/globals.css"
  css_variables:
    --primary-color: "#059669"        # エメラルドグリーン (主アクセント)
    --primary-hover: "#047857"        # ホバー時ディープグリーン
    --secondary-color: "#0d9488"      # ティールグリーン
    --accent-color: "#059669"         # ハイライト
    --bg-color: "#edf2f7"             # ソフトスレートグレー (目に優しい低疲労設計)
    --panel-bg: "#ffffff"             # カード・モーダル純白背景
    --text-primary: "#0f172a"         # 濃縮チャコールブラック (視認性高コントラスト)
    --text-secondary: "#334155"       # 本文・補足用ディープスレート
    --border-color: "#cbd5e1"         # カード境界線
    --shadow-color: "rgba(15, 23, 42, 0.08)" # 浮遊シャドウ
  atomic_classes:
    .glass-panel: "背景白、border-radius: 16px、border: 1px solid var(--border-color)、軽量box-shadow"
    .btn: "基本ボタンスタイル"
    .btn-primary: "background: var(--primary-color)、color: #ffffff"
    .btn-outline: "border: 1px solid var(--border-color)、background: transparent"
    .text-gradient: "テキストグラデーション見出し"
    .animate-fade-in: "フェードインアニメーション"

security_and_auth_specification:
  stealth_mode:
    default_state: "管理者ボタン完全不可視 (一般ユーザーへの露出ゼロ)"
    unlock_query_param: "?admin_key=koremiyo2026 または ?secret=admin1234"
    state_persistence: "localStorage.setItem('koremiyo_admin_unlocked', 'true')"
    lock_trigger: "ヘッダーの『✕』ボタン、または管理画面内『🔒 管理者ログアウト』"
  admin_page_guard:
    route: "/admin"
    component: "AdminLogin"
    passwords:
      - "admin1234"
      - "koremiyo2026"
    double_protection: "URL直打ち時もパスワード認証プロンプトを通過しない限り管理ダッシュボードは非描画"

database_schemas:
  connection: "Supabase REST API / PostgREST"
  tables:
    posts:
      purpose: "ブログレビュー記事データ"
      columns:
        id: "bigint, PRIMARY KEY, GENERATED ALWAYS AS IDENTITY"
        title: "text, NOT NULL (記事タイトル)"
        content: "text (記事本文 Markdown/HTML)"
        contentHTML: "text (記事本文 HTML)"
        site: "text, CHECK (site IN ('dmm', 'dlsite'))"
        category: "text (音声作品, スク水エロ, フェラ, FANZA動画, etc.)"
        tag: "text (カンマ区切りタグ)"
        dmm_id: "text, NULLABLE (連携DMM/FANZA商品ID)"
        lang: "text, DEFAULT 'ja' (言語区分: 'ja' [日本語] | 'en' [英語])"
        campaign_original_price: "numeric, NULLABLE"
        campaign_discount_price: "numeric, NULLABLE"
        campaign_expires_at: "timestamptz, NULLABLE"
        created_at: "timestamptz, DEFAULT now()"
        updated_at: "timestamptz, DEFAULT now()"
    
    ranked_products:
      purpose: "DMM/FANZA人気ランキングキャッシュデータ"
      columns:
        id: "bigint, PRIMARY KEY, GENERATED ALWAYS AS IDENTITY"
        rank_position: "int, NOT NULL (1〜20)"
        title: "text, NOT NULL"
        image_url: "text"
        affiliate_url: "text, NOT NULL"
        price: "text"
        actress: "text (出演者 / CV声優)"
        genre: "text"
        maker: "text (メーカー / サークル名)"
        updated_at: "timestamptz, DEFAULT now()"
    
    campaigns:
      purpose: "セール情報・プロモーションバナー管理"
      columns:
        id: "bigint, PRIMARY KEY, GENERATED ALWAYS AS IDENTITY"
        title: "text, NOT NULL"
        description: "text"
        image_url: "text"
        link_url: "text"
        html_code: "text (外部ASP・DMMバナー埋め込みHTML/Script)"
        is_active: "boolean, DEFAULT true"
        display_order: "int, DEFAULT 0"
        expires_at: "timestamptz, NULLABLE"
    
    feedbacks:
      purpose: "サイト訪問者要望・フィードバック"
      columns:
        id: "bigint, PRIMARY KEY, GENERATED ALWAYS AS IDENTITY"
        content: "text, NOT NULL"
        status: "text, DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved'))"
        created_at: "timestamptz, DEFAULT now()"

routes_and_components_matrix:
  frontend_routes:
    "/":
      file: "src/app/page.js"
      components:
        - "AppLayoutWrapper: 共通ナビゲーション、解錠管理ボタン、フッター"
        - "TopPage: ヒーロー、ジャンルフィルター、ピックアップバナー、最新記事グリッド、リアルタイム検索"
        - "FeedbackWidget: フローティング要望投稿モーダル"
    "/ranking":
      file: "src/app/ranking/page.js"
      components:
        - "RankedProductsPage: ランキング2カラム統合ビュー"
        - "左カラム: DMM/FANZA人気ランキング (Supabase ranked_products からフェッチ)"
        - "右カラム: DlsiteRankingList (API /api/dlsite/ranking からフェッチ、自社カードリスト描画)"
    "/dmm":
      file: "src/app/dmm/page.js"
      components:
        - "DmmBlogPage: DMM特化レビュー記事一覧・詳細アコーディオン展開"
    "/dlsite":
      file: "src/app/dlsite/page.js"
      components:
        - "DlsiteBlogPage: DLsite特化レビュー記事一覧・詳細アコーディオン展開"
    "/campaign":
      file: "src/app/campaign/page.js"
      components:
        - "CampaignPage: アクティブなセール・特集キャンペーン一覧"
    "/en":
      file: "src/app/en/page.js"
      components:
        - "EnglishTopPage: 英語UIトップページ、多言語ヒーロー・最新レビュー一覧・英語カテゴリ導線"
    "/en/ranking":
      file: "src/app/en/ranking/page.js"
      components:
        - "EnglishRankingPage: 英語ランキング統合ビュー (DMM & DLsite、USD価格自動換算併記)"
    "/en/dlsite":
      file: "src/app/en/dlsite/page.js"
      components:
        - "EnglishDlsiteBlogPage: 英語DLsite特化レビュー記事一覧"
    "/en/campaign":
      file: "src/app/en/campaign/page.js"
      components:
        - "EnglishCampaignsPage: 英語セール・特集キャンペーン一覧"
    "/admin":
      file: "src/app/admin/page.js"
      components:
        - "AdminDashboard: 管理コントロールセンター"
        - "AutoPostAdmin: 🤖 AI自動投稿 (手動トリガー / Cron連携)"
        - "UnifiedDmmDashboard: 🛠 DMMツール (リアルタイム商品・女優検索・記事作成)"
        - "RankingAdmin: 🏆 ランキング管理"
        - "CampaignAdmin: 📢 キャンペーン管理"
        - "DmmAdmin / DlsiteAdmin: 📝 ブログ記事手動CRUDエディタ (react-quill-new)"
        - "FeedbackAdmin: 💬 要望管理"
    "/design-preview":
      file: "src/app/design-preview/page.js"
      components:
        - "デザイン比較プレビュー用"

api_endpoints_specification:
  - path: "/api/dlsite/ranking"
    method: "GET"
    auth: "Public"
    cache: "next: { revalidate: 3600 } (1時間キャッシュ)"
    behavior: >
      DLsite公式API (https://www.dlsite.com/maniax/api/=/ranking.json?period=24h) から
      リアルタイム同人ランキング上位20件を取得。
      NEXT_PUBLIC_DLSITE_AFFILIATE_ID (デフォルト: 'Koremiyoonline') をURLに付与し、
      統一カード用JSON形式 (id, title, maker, image_url, affiliate_url, rank_position,
      discount_rate, is_discount, category) で返却。
  
  - path: "/api/dmm/product"
    method: "GET"
    auth: "Public (API Proxy)"
    behavior: "DMM Affiliate ItemList APIの検索プロキシ。キーワード・フロア・ソートによる作品検索"
  
  - path: "/api/dmm/actress"
    method: "GET"
    auth: "Public (API Proxy)"
    behavior: "DMM Actress APIプロキシ。女優名・スリーサイズ（バスト/ウエスト/ヒップ/カップ）検索"
  
  - path: "/api/admin/campaign"
    method: "GET, POST"
    auth: "Admin"
    behavior: "キャンペーンデータの取得・新規作成・更新"
  
  - path: "/api/cron/update-ranking"
    method: "GET"
    auth: "Cron / Secret"
    schedule: "Vercel Cron 毎日 15:00 UTC (0 15 * * *)"
    behavior: "DMM APIから人気ランキングを取得し、Supabaseの ranked_products テーブルをUPSERT更新"
  
  - path: "/api/cron/auto-post-generator"
    method: "GET"
    params: "?secret=admin1234&site=[dmm|dlsite]"
    auth: "Secret Key"
    behavior: "DMM/DLsiteの人気ランキング・セール作品から未投稿作品を自動選定し、AI記事を生成して posts テーブルに保存"
  
  - path: "/api/cron/scheduled-weekly-poster"
    method: "GET"
    params: "?secret=admin1234"
    auth: "Secret Key"
    schedule: "水曜 22:00 / 土曜 05:00 JST 想定"
    behavior: >
      DMM (FANZA同人・アニメ) のランキング上位かつセール割引中（特別セール）の作品を自動抽出。
      Gemini APIを用いて①〜⑦の構成（セールバッジ・3行要約・詳細見どころ・口コミ評判・
      サンプル画像ギャラリー・サンプル動画プレイヤー埋め込み・CTA）を含む高コンバージョンHTML記事を自動生成。
      Supabase posts テーブルへの保存およびローカルMarkdownバックアップ保存を同時実行。

automation_and_cron_pipeline:
  article_generation_blueprint:
    section_1: "セール・割引バッジ (割引率・元値・期間限定価格の明示)"
    section_2: "アイキャッチ画像 & 作品基本メタデータ (サークル/メーカー、声優/出演者、ジャンル)"
    section_3: "3行でわかる本作の抜きどころ / 見どころ要約"
    section_4: "詳細レビュー・ストーリー＆シチュエーション解説 (Gemini生成)"
    section_5: "ユーザー口コミ・評判シミュレーション (肯定的な反響)"
    section_6: "サンプル動画 / 公式PVプレイヤー埋め込み (利用可能な場合)"
    section_7: "高解像度サンプル画像ギャラリー (タップで公式拡大)"
    section_8: "公式アフィリエイト購入ボタン (CTA)"

seo_and_metadata:
  site_title_template: "%s | 次、コレ見よ"
  default_title: "次、コレ見よ | 音声作品・スク水・フェラ オススメ同人作品レビュー＆DMMツール"
  theme_color: "#0f172a"
  og_image: "/og-image.png"
  json_ld:
    - WebSite
    - Organization
    - Blog (次コレ管理人)
  core_keywords:
    - "音声作品 オススメ"
    - "フェラ オススメ"
    - "スク水 オススメ"
    - "DLsite オススメ 作品"
    - "FANZA 動画 おすすめ"
    - "DMM ツール"

development_workflow_for_ai:
  step_1_on_session_start:
    action: "本仕様書 (AI_SHARED_CONTEXT.md) および PROJECT_SPEC.md を完全ロードし、現在のアーキテクチャを正確に把握する"
  step_2_during_implementation:
    rules:
      - "既存のデザインシステム変数 (--bg-color, --text-primary 等) を再利用する"
      - "DLsiteや外部サイトの埋め込みで二重枠を発生させない (自社API/カードを使用)"
      - "管理者UIの非表示/解錠シークレットプロトコルを破壊しない"
  step_3_on_completion:
    actions:
      - "ビルド検証: `npm run build` を実行しコンパイルエラー・型エラーが皆無であることを確認"
      - "【最重要】仕様変更追記: 変更点・新規API・新規テーブル等を本ファイル (AI_SHARED_CONTEXT.md) の各ブロックおよび mutation_log に即座に追記更新する"

mutation_log:
  - date: "2026-09-07"
    author: "AI Assistant (Antigravity)"
    type: "PHASE_1_GLOBALIZATION_FOUNDATION"
    summary: >
      海外展開に向けたPhase 1「多言語基盤構築とデータベース拡張 (i18n & DB拡張)」を完了。
      1. 日英翻訳辞書モジュール (`src/lib/i18n.js`) および JPY⇄USD 通貨換算モジュール (`src/lib/currency.js`) を新設。
      2. ナビゲーションバーに言語切り替えトグル (🇯🇵 日本語 / 🇺🇸 English) を実装し、URL相互ルーティングに対応。
      3. 英語ルート (/en, /en/ranking, /en/dlsite, /en/campaign) を新設。
      4. Supabase posts テーブルに lang カラム ('ja' | 'en') を追加するマイグレーションスクリプト (`scripts/add_lang_column.sql`) を整備。
      5. ランキングカード・記事詳細で価格の米ドル換算自動併記に対応。
  - date: "2026-09-06"
    author: "AI Assistant (Antigravity)"
    type: "INITIAL_CREATION"
    summary: >
      複数AIチャット・マルチエージェント間で完全な開発仕様共通認識を保持するための
      高密度マシンオプティマイズド共有仕様書 (AI_SHARED_CONTEXT.md) を初版作成。
      DLsiteネイティブランキングAPI、Vercel Cron週次ハイブリッド自動投稿、
      ステルス管理者認証、Supabaseテーブル定義を全網羅。
  - date: "2026-08-22"
    author: "AI Assistant"
    type: "FEATURE_INTEGRATION"
    summary: >
      DLsiteランキング埋め込みiframe二重枠を全廃。
      /api/dlsite/ranking プロキシAPIおよび DlsiteRankingList ネイティブカードコンポーネントを新設。
  - date: "2026-08-20"
    author: "AI Assistant"
    type: "CRON_EXPANSION"
    summary: >
      /api/cron/scheduled-weekly-poster および /api/cron/auto-post-generator を追加。
      Gemini APIを活用した①〜⑦要素網羅型DMMセール記事自動生成・投稿パイプラインを統合。
