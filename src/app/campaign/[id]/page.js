import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { AppLayoutWrapper, HtmlWidgetRenderer } from '../../page';

// Supabase クライアント初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 残り日数の計算ヘルパー
function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── 動的メタデータ生成 (SEO / OGP / Twitter Card) ───
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: camp } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!camp) {
    return {
      title: 'キャンペーンが見つかりません | 次、コレ見よ',
      description: '指定されたキャンペーンは終了したか、存在しません。'
    };
  }

  const title = `${camp.title} | 次、コレ見よ`;
  const description = camp.description || 'DMM / FANZAの最新セール・キャンペーン特集情報！';
  const ogImage = camp.image_url || 'https://koremiyo-anime.online/ogp-default.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
      type: 'article',
      siteName: '次、コレ見よ'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  };
}

// ─── キャンペーン詳細ページ本体 ───
export default async function CampaignDetailPage({ params }) {
  const { id } = await params;
  const { data: camp, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !camp || !camp.is_active) {
    notFound();
  }

  // 期限チェック（終了している場合は案内を表示）
  const isExpired = camp.expires_at && new Date(camp.expires_at) < new Date();
  const daysLeft = getDaysRemaining(camp.expires_at);

  // シェア用URL
  const pageUrl = `https://koremiyo-anime.online/campaign/${camp.id}`;
  const shareText = encodeURIComponent(`${camp.title}\n#FANZA #DMM #セール情報\n${pageUrl}`);

  return (
    <AppLayoutWrapper>
      <div className="container animate-fade-in" style={{ maxWidth: '840px', margin: '2rem auto', padding: '0 1rem' }}>
        
        {/* パンくずリスト */}
        <nav style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#059669', textDecoration: 'none' }}>ホーム</Link>
          <span>&gt;</span>
          <Link href="/campaign" style={{ color: '#059669', textDecoration: 'none' }}>🌟 キャンペーン一覧</Link>
          <span>&gt;</span>
          <span style={{ color: '#334155', fontWeight: 'bold' }}>{camp.title.slice(0, 24)}...</span>
        </nav>

        {/* 期限切れアラート */}
        {isExpired && (
          <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
            ⚠️ このキャンペーン・セールは終了しました。最新の開催中キャンペーンは<Link href="/campaign" style={{ textDecoration: 'underline', color: '#991b1b' }}>こちら</Link>からご確認ください。
          </div>
        )}

        {/* メイン詳細カード */}
        <article 
          className="glass-panel" 
          style={{ 
            background: '#ffffff', 
            borderRadius: '24px', 
            border: '1px solid var(--border-color)', 
            padding: '2rem', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)' 
          }}
        >
          {/* ヘッダー情報 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--primary-color, #059669)', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.7rem', borderRadius: '6px' }}>
              CAMPAIGN
            </span>
            {camp.expires_at && (
              <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                📅 {new Date(camp.expires_at).toLocaleDateString('ja-JP')} まで
              </span>
            )}
            {daysLeft !== null && daysLeft > 0 && (
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: daysLeft <= 3 ? '#dc2626' : '#d97706', background: daysLeft <= 3 ? '#fee2e2' : '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                🔥 残り{daysLeft}日！
              </span>
            )}
          </div>

          {/* タイトル（全文・大見出し） */}
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.45', marginBottom: '1.5rem' }}>
            {camp.title}
          </h1>

          {/* バナー完全表示エリア */}
          <div style={{ marginBottom: '2rem', background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            {camp.html_code ? (
              <HtmlWidgetRenderer htmlContent={camp.html_code} />
            ) : camp.image_url ? (
              <img 
                src={camp.image_url} 
                alt={camp.title} 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} 
              />
            ) : (
              <div style={{ padding: '2rem', color: '#94a3b8' }}>バナー画像はありません</div>
            )}
          </div>

          {/* 開催期間バー */}
          {camp.expires_at && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.8rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <span>⏰</span>
              <span>開催期間：{new Date(camp.expires_at).toLocaleString('ja-JP')} 終了</span>
            </div>
          )}

          {/* 見どころ・訴求文全文ボックス */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💡</span> キャンペーンの見どころ・詳細
            </h2>
            <p style={{ color: '#1e293b', fontSize: '1rem', lineHeight: '1.85', margin: 0, whiteSpace: 'pre-wrap' }}>
              {camp.description || '公式特設ページにて特別割引や限定商品を今すぐチェック！'}
            </p>
          </div>

          {/* 特大公式CTAボタン */}
          {camp.link_url && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <a
                href={camp.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '1.2rem 1.5rem',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 12px 28px -6px rgba(5, 150, 105, 0.45)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box'
                }}
              >
                👉 DMM公式キャンペーン会場へ今すぐ行く
              </a>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem' }}>
                ※ Powered by {camp.title.includes('FANZA') ? 'FANZA' : 'DMM.com'} (アフィリエイト広告を含みます)
              </p>
            </div>
          )}

          {/* SNSシェア ＆ 回遊アクション */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Link 
              href="/campaign" 
              className="btn btn-outline" 
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
            >
              ← キャンペーン一覧に戻る
            </Link>

            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0f172a',
                color: '#fff',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>𝕏</span> このキャンペーンをシェア
            </a>
          </div>
        </article>
      </div>
    </AppLayoutWrapper>
  );
}
