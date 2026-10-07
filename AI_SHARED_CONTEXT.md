# ==============================================================================
# AI_AGENT_SHARED_CONTEXT_SPECIFICATION
# ==============================================================================
# @target_system: koremiyo-app ("次、コレ見よ")
# @document_type: Machine-to-Machine Inter-Chat Synchronization Protocol
# @target_audience: AI Coding Assistants / Autonomous Agents (Antigravity, Cursor, Claude Code, ChatGPT, Copilot)
# @human_readability: NOT_REQUIRED (Optimized for High Token Density, AST Parsing, Zero-Hallucination)
# @last_updated: 2026-10-05 (SEO Infrastructure, Dynamic Article Routes, and Sitemap/Robots Deployment)
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
    - "3D同人ゲーム (着せ替え, マッサージ, シミュレーション)"
    - "音声・ASMR作品 (フェラ音声, シチュエーション音声, 睡眠・癒やし)"
    - "同人RPG / アクションゲーム"
    - "VTuber / 声優コラボ作品"
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
  dmm_affiliate_id: "KashiwagiTak-002 (全DMMアフィリエイトURLおよびバナーウィジェットスクリプトに必ず適用)"
  campaign_approval_protocol: "キャンペーン公開時は完全自動公開を行わず、必ずユーザーへの事前確認・承認（「OK」「承認」「公開して」等）を経てから本番DB・管理シートへ反映する"
  dmm_blog_approval_protocol: "ブログ記事公開時は完全自動公開を行わず、必ずユーザーへの事前確認・承認（「OK」「承認」「公開して」等）を経てから本番DB・管理シートへ反映する"
  supabase_posts_tags_array: "Supabase posts テーブルの tags カラムは配列型 (text[]) であるため、インサート時は必ず配列形式で渡すこと"
  supabase_service_role_key_requirement: "管理スクリプトからのSupabase登録時はRLSポリシーを通過するため SUPABASE_SERVICE_ROLE_KEY を優先使用すること"
  pure_html_rendering_rule: "フロントエンドで dangerouslySetInnerHTML により直接描画されるため、記事本文には生のMarkdown記号（**太字** や ## 見出し等）を一切含めず、インラインスタイルを適用した純粋HTMLタグ（<strong style=\"...\">, <h2 style=\"...\"> 等）で100%出力すること"
  high_res_image_selection_rule: "低解像度サムネイル（_img_sam.jpg 84x120px, _img_sam_mini.jpg 65x93px, DMMの ps.jpg 等）の本文使用は全面禁止。RJ同人は _img_main.jpg ＋ _img_smp1〜5.jpg (800x600 HD)、VJ商業動画は _img_main.jpg ＋ _img_smpa1〜9.jpg (16:9 HD)、縦型ジャケット・書籍は max-width: 360px のコンテナ制約を必須適用すること"
  content_manager_cleanup_on_completion: "他作品との混同を防止するため、記事の本番公開・作業完了後は該当作品の行を統合管理シート（content_manager.xlsx / content_manager.csv）から削除（事前バックアップを保持）し、シート内には常に作業待ち・進行中の案件のみをスッキリ保持・管理すること"

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
        title: "text, NOT NULL ([PR] 表記必須)"
        description: "text (セール概要・対象期間・見どころ・割引内容)"
        image_url: "text (メインバナー画像URL)"
        link_url: "text (アフィリエイトリンクURL)"
        html_code: "text (DMM公式ウィジェットバナーHTML/Scriptコード、優先描画)"
        is_active: "boolean, DEFAULT true"
        display_order: "int, DEFAULT 0"
        expires_at: "timestamptz, NULLABLE (終了日時。期限超過でフロント・API共に自動非表示)"
        created_at: "timestamptz, DEFAULT now()"
        updated_at: "timestamptz, DEFAULT now()"
    
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
        - "TopPage: ヒーロー（約50%省スペース化によるファーストビュー最適化）、ジャンルフィルター、ピックアップバナー、最新記事グリッド（個別記事 /dlsite/[id], /dmm/[id] への <Link> クローラー巡回対応）、戻るボタン（popstate）対応"
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
        - "DmmBlogPage: DMM特化レビュー記事一覧。全カード <Link href=\"/dmm/[id]\"> 内部リンク最適化"
    "/dmm/[id]":
      file: "src/app/dmm/[id]/page.js"
      components:
        - "DmmArticlePage: 個別DMM動画レビュー詳細ページ (動的SSRルート)"
        - "generateMetadata: DMM動画専用動的SEO/OGPメタデータ (Title, Description, OGP画像, canonical URL, Twitter Card)"
        - "構造化データ: BlogPosting (JSON-LD) 自動出力"
        - "パンくずリスト: ホーム > FANZA/DMM動画レビュー > [記事タイトル]"
        - "SafeHtmlRenderer: 本文描画、キャンペーン情報バー、Xシェアボタン、回遊ナビゲーション"
    "/dlsite":
      file: "src/app/dlsite/page.js"
      components:
        - "DlsiteBlogPage: DLsite特化レビュー記事一覧。全カード <Link href=\"/dlsite/[id]\"> 内部リンク最適化"
    "/dlsite/[id]":
      file: "src/app/dlsite/[id]/page.js"
      components:
        - "DlsiteArticlePage: 個別DLsite同人レビュー詳細ページ (動的SSRルート)"
        - "generateMetadata: DLsite同人専用動的SEO/OGPメタデータ (Title, Description, OGP画像, canonical URL, Twitter Card)"
        - "構造化データ: BlogPosting (JSON-LD) 自動出力"
        - "パンくずリスト: ホーム > DLsite同人・音声レビュー > [記事タイトル]"
        - "SafeHtmlRenderer: 本文描画、キャンペーン情報バー、Xシェアボタン、回遊ナビゲーション"
    "/campaign":
      file: "src/app/campaign/page.js"
      components:
        - "CampaignPage: アクティブなセール・特集キャンペーン一覧"
        - "二重アクション導線: 各カードに『🔍 ポップアップ (Quick Viewモーダル)』と『📄 詳細ページ (/campaign/[id] 遷移)』ボタンを配置"
        - "HtmlWidgetRenderer: DMM公式ウィジェットスクリプト (300x250等) の安全な動的マウント・描画"
    "/campaign/[id]":
      file: "src/app/campaign/[id]/page.js"
      components:
        - "CampaignDetailPage: 個別キャンペーン専用詳細ページ (動的ルート)"
        - "generateMetadata: キャンペーンタイトル、OGP画像、ディスクリプション、Twitterカード (summary_large_image) 自動生成"
        - "パンくずリスト: トップ > キャンペーン一覧 > [キャンペーン名]"
        - "カウントダウン・期限バッジ: 開催中／残り日数・時間／終了バッジ"
        - "HtmlWidgetRenderer: DMM公式ウィジェットバナーの動的埋め込み描画"
        - "高成約率CTA: エメラルドグリーンの特設会場直行ボタン、Xシェアボタン、一覧戻る導線"
    "/sitemap.xml":
      file: "src/app/sitemap.js"
      description: "動的サイトマップ。固定ページ9件＋全公開記事37件＋全キャンペーン9件の計55件のURLをGooglebotへ自動通知"
    "/robots.txt":
      file: "src/app/robots.js"
      description: "検索クローラー巡回規則。全ページ巡回許可、管理・APIルート保護、sitemap.xmlの場所を明示"
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
      components_file: "src/app/admin/AdminDashboard.js (src/app/page.js より完全分離・集約)"
      components:
        - "AdminDashboard: 管理コントロールセンター"
        - "AutoPostAdmin: 🤖 AI自動投稿 (手動トリガー / Cron連携)"
        - "UnifiedDmmDashboard: 🛠 DMMツール (リアルタイム商品・女優検索・記事作成)"
        - "RankingAdmin: 🏆 ランキング管理"
        - "CampaignAdmin: 📢 キャンペーン管理"
        - "DmmAdmin / DlsiteAdmin: 📝 ブログ記事手動CRUDエディタ (軽量textarea HTML/Markdown直接編集に刷新、react-quill-new完全撤去)"
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
campaign_operations_protocol:
  standard_input_file:
    path: "content_manager.xlsx (シート2: 『キャンペーン』) および同期用 campaign_management/campaigns.csv"
    legacy_file_notice: "旧 DMMcampaign.csv は廃止・archive_old_inputs/ へ退避完了。今後は content_manager.xlsx に完全一本化"
    columns:
      - "A列: 作業フラグ (未 / 済)"
      - "B列: ステータス詳細 (未着手 / 調査完了 / 本番公開済)"
      - "C列: 対象サイト (DMM / FANZA / DLsite)"
      - "D列: キャンペーン名"
      - "E列: 特設ページURL ★ユーザー入力起点"
      - "F列: ★アフィリエイトURL (E列URLから自動生成 / タグ貼付OK)"
      - "G〜K列: バナー素材1〜5 (メインバナー/ウィジェットスクリプト/画像)"
      - "L列: 開催終了日時 (expires_at)"
      - "M列: セール概要・訴求メモ"
      - "N列: 管理用キャンペーンID (CAMP-xxxx)"
  ai_investigation_and_enrichment:
    - "特設URLからのアフィリエイトURL自動生成 (KashiwagiTak-002)"
    - "開催終了日時の厳密調査 (expires_at 用 ISO 8601 タイムスタンプ化)"
    - "対象フロア/ジャンル・割引率・セール価格帯の抽出"
    - "景品表示法・ステマ規制に準拠した [PR] タグ付き高成約率タイトル生成"
    - "購買心理・ベネフィットに基づく見どころ紹介文・訴求メモの生成"
    - "メインバナー選定 (カード描画用に 300x250 レクタングル等を優先選定)"
  approval_and_publishing_workflow:
    step_1: "ユーザーが content_manager.xlsx の【キャンペーン】シートに特設URLを追記・保存"
    step_2: "チャット上で依頼受領後、AIが特設URLを自律調査しアフィリエイトURL・期間等を自動補完、確認用ドラフト一覧を提示"
    step_3: "ユーザーが内容を事前チェックし「承認 / 公開して」の合図を出力"
    step_4: "Supabase campaigns テーブルへ登録、/campaign/[id] 詳細ページへ即時反映、content_manager.xlsx を『済 / 本番公開済』へ更新"
  compliance_and_tracking:
    affiliate_id: "KashiwagiTak-002"
    expiration_policy: "終了日時超過時に自動非表示 (有利誤認防止)"

dmm_blog_operations_protocol:
  purpose: "DMM/FANZA（同人コミック、ブックス電子書籍、動画、アニメ）特化型レビュー記事の作成・プレビュー検証・本番公開パイプライン"
  standard_input_file:
    path: "content_manager.xlsx (シート1: 『記事作成』全17列) および同期用 content_manager.csv"
    legacy_file_notice: "旧 DMMblog.csv は廃止・archive_old_inputs/ へ退避完了。今後は content_manager.xlsx に完全一本化"
    columns:
      - "A列: 作業フラグ (未 / 済)"
      - "B列: ステータス詳細 (未着手 / 調査完了 / 記事作成済 / 本番公開済)"
      - "C列: 対象サイト (FANZA同人 / FANZA動画 / FANZAブックス / DMM)"
      - "D列: タイトル / 作品名"
      - "E列: 商品URL（調査依頼URL）★ユーザー入力起点"
      - "F列: ★アフィリエイトURL (E列URLから自動生成 / 手動上書きOK)"
      - "G〜K列: 素材URL_1〜5 (メイン大判画像 pl.jpg / サンプル画像 jp-001.jpg〜 / 動画)"
      - "L列: 商品ID (d_xxxxxx, cid, 品番)"
      - "M列: サークル / 出演 / メーカー"
      - "N列: カテゴリ"
      - "O列: 価格・割引内容"
      - "P列: 見どころ・訴求メモ (あらすじ)"
      - "Q列: 管理用記事ID (ART-xxxx)"
  ai_investigation_and_enrichment:
    - "商品URLからのアフィリエイトURL自動生成 (KashiwagiTak-002)"
    - "DMM/FANZA作品詳細ページ（EUC-JP/CP932/UTF-8対応）およびDMM ItemList APIからの公式メタデータ・あらすじ自動取得"
    - "高解像度大判画像（pl.jpg）およびサンプル画像（jp-001.jpg〜）の自動抽出・素材列格納"
    - "景品表示法・ステマ規制に準拠した記事冒頭 [PR / アフィリエイト広告] バッジの付与"
  article_design_and_cro_standards:
    quick_summary_card:
      rule: "メタ表記『【結論】』は完全廃止。読者を引き込む自然な見出し（『〇〇は買うべき？一言で言うと……』等）に統一"
      elements: "セール割引バッジ、★評価スコア、結論要約ブロック、スペック表、第1CTAボタン"
    speech_bubble_reviews:
      rule: "口コミ・評判セクションは『読者アイコン ＋ 三角しっぽ付き吹き出しボックス』を標準適用"
      style: >
        左側に丸型ユーザーアバター（👤 購入者A ★5 等）を配置し、
        右側に三角形の口が付いた白い角丸ボックス（border: 1.5px solid #cbd5e1, border-radius: 14px）で
        鍵括弧付きコメントを囲む完全自立型インラインCSSレイアウト。
    campaign_badge_integration:
      format: '<!--CAMPAIGN:{"originalPrice":1650,"discountPrice":1320,"discountExpiry":"YYYY-MM-DD"}-->'
      behavior: "記事HTML冒頭に配置することでフロントエンドの renderCampaign 関数が期間限定セールバッジを自動描画"
    media_and_safety_rules:
      - "Chromium Shadow DOM点滅バグ防止のため、<video controls> および親要素に transform: translateZ(0) や overflow: hidden を付与しない"
      - "DMM規約遵守のため記事末尾に所定クレジット（Powered by FANZA / Powered by DMM.com）を必ず付記"
      - "提供されたアフィリエイトURLおよびコードは改変せず完全無改変で使用"
  preview_and_approval_workflow:
    step_1: "content_manager.xlsx の【記事作成】シートから対象作品を調査し、完全自立型HTML記事ドラフトを生成"
    step_2: "次、これみよ用、ブログ記事保存フォルダ/preview_dmm_articles.html（PC/スマホ幅切替・タブビューワー）を更新"
    step_3: "チャット上でユーザーにドラフトの骨子を提示し、事前の修正要望確認と承認（「公開して」等）を得る"
  publishing_and_synchronization:
    cli_tools:
      batch: "koremiyo-app/scripts/publish_dmm_batch.mjs"
      single: "koremiyo-app/scripts/publish_single_post.mjs"
    auth_requirement: "RLSバイパスのため SUPABASE_SERVICE_ROLE_KEY を使用"
    data_format: "Supabase posts テーブルの tags カラムは text[] 配列型としてインサート"
    sheet_synchronization: "content_manager.xlsx および content_manager.csv へ『済』『本番公開済』として即時追記・同期（公開完了後は完了行クリーンアップ規約適用）"
    local_backup: "次、これみよ用、ブログ記事保存フォルダ/XX_..._ブログ記事.txt へ番号順に保存"

content_manager_operations_protocol:
  purpose: "統合管理シート（content_manager.xlsx）を通じた記事作成・キャンペーン・素材抽出・アフィリエイトURL自動生成・本番公開・自動整理の全一元化パイプライン"
  standard_input_file:
    path: "content_manager.xlsx (統合Excelブック: 2シート構成) および同期用 CSV (content_manager.csv, campaign_management/campaigns.csv)"
    sheet_1:
      name: "記事作成"
      purpose: "DLsite同人・音声・商業、およびFANZA同人・動画・ブックスの全作品レビュー管理"
      columns:
        - "A列: 作業フラグ (未 / 済 / サンプル作業不要)"
        - "B列: ステータス詳細 (未着手 / 調査完了 / 記事作成済 / 本番公開済)"
        - "C列: 対象サイト (DLsite / FANZA同人 / FANZA動画 / FANZAブックス / DMM)"
        - "D列: タイトル / 作品名"
        - "E列: 商品URL（調査依頼URL）★ユーザー入力起点"
        - "F列: ★アフィリエイトURL (自動生成 / 手動上書きOK)"
        - "G列: 素材URL_1 (メイン画像 / 公式タグ貼付OK)"
        - "H列: 素材URL_2 (サブ画像1 / 公式タグ貼付OK)"
        - "I列: 素材URL_3 (サブ画像2 / 公式タグ貼付OK)"
        - "J列: 素材URL_4 (サブ画像3 / 公式タグ貼付OK)"
        - "K列: 素材URL_5 (動画/音声/Chobit埋め込み/公式タグ貼付OK)"
        - "L列: 商品ID (品番・作品番号: RJxxxxxx, BJxxxxxx, VJxxxxxx, d_xxxxxx, cid)"
        - "M列: サークル / 出演 / メーカー"
        - "N列: カテゴリ (シミュレーション, マンガ, 3Dゲーム, etc.)"
        - "O列: 価格・割引内容 (定価・セール価格・割引率)"
        - "P列: 見どころ・訴求メモ (あらすじ・販売実績)"
        - "Q列: 管理用記事ID (ART-xxxx)"
    sheet_2:
      name: "キャンペーン"
      purpose: "DMM/FANZA・DLsiteのセール・特集・くじプロモーション管理"
      columns:
        - "A列: 作業フラグ (未 / 済)"
        - "B列: ステータス詳細 (未着手 / 調査完了 / 本番公開済)"
        - "C列: 対象サイト (DMM / FANZA / DLsite)"
        - "D列: キャンペーン名"
        - "E列: 特設ページURL ★ユーザー入力起点"
        - "F列: ★アフィリエイトURL (自動生成 / タグ貼付OK)"
        - "G〜K列: バナー素材1〜5 (メインバナー/ウィジェットスクリプト/画像)"
        - "L列: 開催終了日時 (expires_at)"
        - "M列: セール概要・訴求メモ"
        - "N列: 管理用キャンペーンID (CAMP-xxxx)"
  ai_investigation_and_autofill_rules:
    - "アフィリエイトURL自動生成: E列に商品URLや特設URLが入力されている場合、F列が空欄であればDMM/FANZA（KashiwagiTak-002）およびDLsite（Koremiyoonline）の正規アフィリエイトURLを100%自動生成。ツールバータグのコピー作業を完全不要化"
    - "公式タグ自動展開互換性: ユーザーが素材列（G〜K列）やF列に公式ツールバータグ（<a href=...><img src=...></a>）を貼り付けた場合でも、hrefからアフィリエイトURL、srcから画像URLを高解像度化して安全格納"
    - "低解像度サムネイル排除: _img_sam.jpg (84x120px) や ps.jpg/pt.jpg 等は全面使用禁止。同人は _img_smp1〜5.jpg (800x600 HD)、商業動画・同人は pl.jpg (大判高画質) および jp-001.jpg〜 (HDシーンキャプチャ) へ自動昇格"
    - "マルチサイト公式API/スクレイピング調査: DLsite公式API (maniax, appx, books, pro) および DMM/FANZA商品ページから正式タイトル、サークル/出演/メーカー、カテゴリ、価格、セール割引、公式あらすじを自動取得して全項目を完全補完"
  article_generation_and_publishing_rules:
    - "動的キャンペーンタグ: セール作品には必ず記事冒頭に <!--CAMPAIGN:{\"originalPrice\":...,\"discountPrice\":...,\"discountExpiry\":\"YYYY-MM-DD\"}--> を埋め込み、サイト上のカウントダウンバーと連動"
    - "100% Pure HTML記法: フロントエンドで dangerouslySetInnerHTML 描画されるため、生Markdown（**太字** や ## 見出し）を完全禁止。<strong style=\"...\">, <h2 style=\"...\"> 等の純粋HTMLタグで出力"
    - "自然な見出し設計: 構成案のメタ指示文字『【結論】』『【概要】』を見出しから完全排除し、読者を惹きつける自然なキャッチコピー見出しを採用"
    - "縦型画像サイズ制約: 書籍や縦型パッケージ画像には画面崩れ防止のため style=\"width: 100%; max-width: 360px; ...\" のコンテナ制約を適用"
    - "ユーザー承認必須: 生成した記事案（HTML）はローカルに保存し、ユーザーの事前確認・承認を得てからSupabase posts テーブルへ一括登録"
  completed_items_cleanup_protocol:
    rule: "【作業完了作品の自動整理（混同防止）】"
    details: >
      記事の本番公開・作業完了後は、他の未着手・進行中作品との混同を防止するため、
      事前安全バックアップ（content_manager_backup_...xlsx / .csv）を取得した上で、
      該当作品の行を content_manager.xlsx および content_manager.csv から完全に削除し、
      残りの未処理案件のみを行4から上詰めで整列・再配置する。

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
  - date: "2026-10-05"
    author: "AI Assistant (Antigravity)"
    type: "UNIFIED_CONTENT_MANAGER_PORTAL_AND_AFFILIATE_AUTO_GENERATION"
    summary: >
      散在していた入力ファイル（content_manager.xlsx, DMMblog.csv, DMMcampaign.csv）を1つのExcelブック（content_manager.xlsx）へ完全一元化し、URLを貼るだけでアフィリエイトURLや公式メタデータ・高解像度素材を100%自動生成する運用パイプラインを配備。
      1. 入力データのSingle Source of Input化（2シート統合）:
         - 『content_manager.xlsx』を1つ開くだけで、シート1「記事作成」（DLsite/FANZA/DMM全作品レビュー）とシート2「キャンペーン」（セール・くじ特集）の双方を管理可能に統合。
         - 旧CSV群（DMMblog.csv, campaign_management/DMMcampaign.csv, target_list.csv）を archive_old_inputs/ へ安全退避。
      2. アフィリエイトURL（F列）の100%自動生成:
         - DMM/FANZA（KashiwagiTak-002）およびDLsite（Koremiyoonline）のアフィリエイトURL生成ロジックを確立。
         - 商品URLや特設URLを貼り付けるだけで、ASPツールバーからタグを手動コピーする作業を完全不要化。手動タグ貼り付け時の自動分解・高画質昇格互換性も維持。
      3. マルチサイト自動調査・補完スクリプトの統合拡張:
         - `koremiyo-app/scripts/inspect_and_fill_sheet.py` を全面改修。DMM/FANZAの年齢確認・文字コード（EUC-JP/CP932/UTF-8）自動判定および高解像度大判画像（pl.jpg）やサンプル画像（jp-001.jpg〜）の抽出、DLsite公式API連携を統合。
         - 実行時に後方互換用の `content_manager.csv` および `campaign_management/campaigns.csv` へ同時自動同期。
  - date: "2026-10-05"
    author: "AI Assistant (Antigravity)"
    type: "SEO_INFRASTRUCTURE_DYNAMIC_ARTICLE_ROUTING_AND_SITEMAP_DEPLOYMENT"
    summary: >
      Google Analytics分析に基づくファーストビュー改善および外部流入獲得のためのSEO基盤（個別動的記事ルート、動的サイトマップ、robots.txt、内部リンク最適化）を完全配備。
      1. GA4データ分析と効果測定:
         - Google Analytics Data API (プロパティID: 536322376) 連携スクリプト (scratch/fetch_ga4_data.py) を作成・実行。
         - ファーストビュー最適化により直帰率が 75.0% ➔ 46.5% へ劇的改善、セッションあたりPVが 1.5 ➔ 3.51PV、平均滞在時間が6.2倍に伸長。
         - 一方で、個別記事の独立URLが存在せず自然検索流入がほぼゼロだった根本課題を特定。
      2. 個別動的記事ルート (SSR) の新設:
         - `/dlsite/[id]` (`src/app/dlsite/[id]/page.js`) および `/dmm/[id]` (`src/app/dmm/[id]/page.js`) を作成。
         - 各記事の generateMetadata による動的SEO/OGPメタデータ (Title, Description, OGP画像, canonical URL, Twitter Card) 生成。
         - BlogPosting 構造化データ (JSON-LD)、パンくずリスト、キャンペーン情報バー、SafeHtmlRenderer 本文描画、Xシェアボタン、回遊ナビゲーションを実装。
      3. 動的サイトマップ (sitemap.js) および robots.js の導入:
         - `src/app/sitemap.js` を新設し、固定ページ9件＋全公開記事37件＋全キャンペーン9件の計55件のURLを Googlebot へ自動通知する動的 sitemap.xml を生成。
         - `src/app/robots.js` を新設し、全ページ巡回許可、管理・APIルート保護、sitemap.xml の場所を明示。
      4. 内部リンク構造のクローラー最適化:
         - TopPage、DlsiteBlogPage、DmmBlogPage の全記事カードをクライアントState切り替えから `<Link href="...">` に変更し、検索クローラーが全記事へ自然に巡回できるように改善。
      5. ビルド検証:
         - `npm run build` による全23ルート静的・動的ビルド検証をエラー0件でパス。
  - date: "2026-10-05"
    author: "AI Assistant (Antigravity)"
    type: "CONTENT_MANAGER_WORKFLOW_REFINEMENT_AND_ARTICLE_QUALITY_ENFORCEMENT"
    summary: >
      記事品質基準の厳格化（高解像度選定・100% Pure HTML・メタ表記排除・動的キャンペーンタグ）、
      既存公開全記事の品質監査＆バッチ改修、新規9作品の本番公開、および管理シート完了行自動整理規約を確立。
      1. 記事品質基準の確立・厳格化:
         - 低解像度サムネイル（_img_sam.jpg 等）の全面使用禁止と、高解像度サンプルCG（_img_smp1〜5.jpg / _img_smpa1〜9.jpg）への自動昇格ルールを確立。
         - Next.js の dangerouslySetInnerHTML 描画における生のMarkdown記号（**太字** や ## 見出し）露出を完全防止するため、100% Pure HTML記法（<strong style="..."> 等）を義務化。
         - 見出し中の無機質な『【結論】』等のメタ表記を完全排除し、読者の感情を直撃する自然なキャッチコピー見出しに統一。
         - セール作品に対して動的キャンペーンタグ <!--CAMPAIGN:{"originalPrice":...,"discountPrice":...,"discountExpiry":"..."}--> を標準付与し、終了カウントダウンバーと連動。
         - 書籍・縦型パッケージ画像の max-width: 360px レスポンシブ制約を適用。
      2. 既存全記事の一括品質監査＆バッチ改修:
         - Supabase posts テーブル内の全27記事を自動監査し、生Markdown残存3件、メタ表記18件、動的キャンペーンタグ未設定9件を一括改修。監査合格率100%（エラー0件）を達成。
      3. 管理シート運用規約の刷新（混同防止のための作業完了行自動削除）:
         - 他作品との混同を防止するため、本番公開・作業完了した行は事前バックアップ保持の上で content_manager.xlsx / .csv から完全削除し、常に作業待ち案件のみを保持するルールを制定。
      4. 新規9作品（DLsite/Books/Appx）の完全自動調査・記事生成・本番公開・シート整理:
         - ユーザーがツールバータグを貼り付けた9作品（RJ01491408, RJ01673232, RJ01651392, BJ01910616, BJ045391, BJ006146, RJ01719638, RJ01660984, RJ01689189）について、公式APIから情報自動補完 ➔ Pure HTML記事生成 ➔ ユーザー事前承認 ➔ Supabase posts テーブルへ本番公開（累計36記事へ拡大） ➔ 管理シート完了行削除・上詰めを全自動完遂。
  - date: "2026-10-05"
    author: "AI Assistant (Antigravity)"
    type: "DMM_BLOG_WORKFLOW_ESTABLISHMENT_AND_SPEECH_BUBBLE_UI"
    summary: >
      DMMブログページの管理代行運用パイプラインの確立および記事デザインシステムのUX最適化を完了。
      1. 入力インターフェースとして `DMMblog.csv`（作品名、URL、アフィリエイト素材1〜3）を公式採用。DMM ItemList API（同人・電子書籍）とWebスクレイピングを連動させた作品情報（CID、サークル/著者、出版社、セール価格、ページ数、あらすじ、高解像度サンプル画像）の自動調査・補完フローを構築。
      2. 記事デザインのUX最適化:
         - クイックサマリーカードのメタ的表記『【結論】』を完全撤廃し、読者を惹きつける自然な見出しに刷新。
         - 口コミ・評判セクションを『アバターアイコン ＋ 三角しっぽ付き吹き出しボックス（自立型インラインCSS）』へデザイン刷新。視覚的なリアリティと読者への訴求力を向上。
      3. プレビュー検証環境の整備:
         - `次、これみよ用、ブログ記事保存フォルダ/preview_dmm_articles.html` を新設・更新。PC/スマホ表示幅切り替えおよび全作品タブ切り替えによる事前検証環境を提供。
      4. 本番公開パイプラインの実証・実行:
         - RLS回避のための `SUPABASE_SERVICE_ROLE_KEY` 適用および `tags` カラム（text[]配列型）の整合性を修正した公開スクリプト (`publish_dmm_batch.mjs`, `publish_single_post.mjs`) を整備。
         - FANZA同人5作品（d_631527, d_739696, d_284669, d_793160, d_795627）およびFANZAブックス話題作（k568agotp11397）の計6作品を本番Supabase `posts` テーブルへ正常公開。
         - 統合管理シート（`content_manager.csv` / `.xlsx`）およびローカルバックアップテキストへの双方向同期を完了。
  - date: "2026-09-23"
    author: "AI Assistant (Antigravity)"
    type: "DMM_CAMPAIGN_WORKFLOW_AND_DETAIL_PAGE_EXPANSION"
    summary: >
      DMMキャンペーンの管理運用方針刷新および専用詳細ページ機能の実装を完了。
      1. 入力インターフェースを `campaign_management/DMMcampaign.csv`（キャンペーン名・URL・バナー素材1〜5）へ完全一本化。AIによる自動調査・ドラフト生成と人間事前承認プロトコルを確立。
      2. キャンペーン専用個別詳細ページ動的ルート `/campaign/[id]` (`src/app/campaign/[id]/page.js`) を新設。動的OGPメタデータ、パンくずリスト、カウントダウン・期限バッジ、HtmlWidgetRenderer、[PR]表記、高CVR CTAボタン、Xシェアボタンを実装。
      3. 一覧ページ (`/campaign`) のUIを刷新し、カード内の文章見切れを解消する『🔍 ポップアップ (Quick View)』と『📄 詳細ページ』の二重アクション導線を導入。
      4. DMMアフィリエイトIDを `KashiwagiTak-002` に統一固定し、Supabase `campaigns` テーブルおよび `content_manager.csv` / `.xlsx` との自動同期パイプラインを整備。
      5. `npm run build` による全ルート静的検証をエラー0件でパス。
  - date: "2026-09-22"
    author: "AI Assistant (Antigravity)"
    type: "DMM_BLOG_ARTICLE_GENERATOR_SKILL_CREATION"
    summary: >
      DMMブログページ（/dmm）の管理代行および高品質記事作成を自動化する専用スキル
      `.agents/skills/dmm-affiliate-article-generator` を新設。
      1. 完全自立型インラインHTML、Chromium Shadow DOM点滅防止、アイキャッチ自動抽出連動を網羅。
      2. 景品表示法・ステマ規制（PR表記明示、二重価格表示適正化）およびDMMアフィリエイト参加規約（クリック嘆願禁止、素材無改変、Powered by FANZA クレジット表記）に完全準拠。
      3. ファーストビュー直下サマリーカード、見どころ3選、公式サンプル動画・画像ギャラリー、正直レビュー（Pros/Cons）、第1〜3CTAを内蔵した高成約率HTMLテンプレートを整備。
      4. ユーザー事前確認・承認プロトコルと `manage-posts.mjs` / `content_manager` 連携ワークフローを定義。
  - date: "2026-09-18"
    author: "AI Assistant (Antigravity)"
    type: "DYNAMIC_TAXONOMY_AND_MULTI_CATEGORY_EXPANSION"
    summary: >
      特定マニアックニッチ固定から多様な成人向け・同人作品の投稿に対応する動的タクソノミー改修を実施。
      1. `DlsiteBlogPage` および `TopPage` を改修し、Supabase posts テーブルから実際に投稿されているカテゴリを動的に収集・生成するピル型フィルターバー（レスポンシブ・横スクロール対応）を実装。
      2. 主要ジャンルプリセット（3Dゲーム、音声・ASMR、同人RPG、VTuber、スク水、フェラ、動画アニメ等）を整備。
      3. URLクエリパラメータ（?category=xxx）による初期絞り込み連動に対応。
      4. `src/lib/i18n.js` に拡張ジャンルの日英辞書キーを追加。
      5. 管理画面（`AdminDashboard.js`）のカテゴリ入力欄を自由入力＋datalist候補選択に刷新。
      6. `npm run build` による静的ビルド検証をエラー0件でパス。
  - date: "2026-09-17"
    author: "AI Assistant (Antigravity)"
    type: "AI_CHAT_POST_PIPELINE_AND_BUNDLE_OPTIMIZATION"
    summary: >
      AIチャット主導の記事開発・直接公開体制への移行およびフロントエンドの劇的軽量化を実施。
      1. チャットからSupabaseへ記事・広告を直接CRUD操作できる専用CLIツール (`scripts/manage-posts.mjs`) を新設。
      2. 巨大な手動執筆用リッチエディタ `react-quill-new` を完全アンインストール (依存パッケージ9個削除)。
      3. `src/app/page.js` (約3,600行・約200KB) から管理者画面コード約1,100行を完全分離し、`src/app/admin/AdminDashboard.js` に集約。
      4. 一般ユーザーが訪れる全公開ページからQuillのCSS/JSバンドルおよび管理者コードを完全に排除し、初期読み込み速度・バンドル容量を劇的に改善。
      5. `npm run build` による全21ルートの静的生成・ビルド検証をエラー0件でパス。
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
