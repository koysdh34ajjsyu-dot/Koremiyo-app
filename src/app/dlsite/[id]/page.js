import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { AppLayoutWrapper, SafeHtmlRenderer } from '../../page';
import { renderCampaign } from '../../../lib/campaign';
import { formatPriceWithCurrency } from '../../../lib/currency';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

function extractThumbnail(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  let url = match[1];
  if (url.startsWith('//')) url = 'https:' + url;
  return url;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) {
    return {
      title: '記事が見つかりません | 次、コレ見よ',
      description: '指定された記事は存在しないか、削除された可能性があります。'
    };
  }

  const title = `${post.title} | 次、コレ見よ`;
  const rawText = stripHtml(post.content || post.contentHTML);
  const description = rawText ? rawText.slice(0, 140) + '...' : 'DLsiteおすすめ同人音声・作品の徹底レビュー記事！';
  const ogImage = extractThumbnail(post.content || post.contentHTML) || 'https://koremiyo-anime.online/og-image.png';
  const canonicalUrl = `https://koremiyo-anime.online/dlsite/${post.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: ogImage }],
      type: 'article',
      siteName: '次、コレ見よ',
      publishedTime: post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function DlsiteArticlePage({ params }) {
  const { id } = await params;
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  const { campaign, showCampaign, cleanContent } = renderCampaign(post.content || post.contentHTML);
  const pageUrl = `https://koremiyo-anime.online/dlsite/${post.id}`;
  const shareText = encodeURIComponent(`${post.title}\n#DLsite #同人作品 #オススメ\n${pageUrl}`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: extractThumbnail(post.content || post.contentHTML) || 'https://koremiyo-anime.online/og-image.png',
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: '次コレ管理人',
    },
    publisher: {
      '@type': 'Organization',
      name: '次、コレ見よ',
      url: 'https://koremiyo-anime.online',
    },
    description: stripHtml(post.content || post.contentHTML).slice(0, 140),
  };

  return (
    <AppLayoutWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container animate-fade-in" style={{ maxWidth: '860px', margin: '1.5rem auto', padding: '0 1rem' }}>
        
        {/* パンくずリスト */}
        <nav style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#059669', textDecoration: 'none' }}>ホーム</Link>
          <span>&gt;</span>
          <Link href="/dlsite" style={{ color: '#059669', textDecoration: 'none' }}>🎧 DLsite同人・音声レビュー</Link>
          <span>&gt;</span>
          <span style={{ color: '#334155', fontWeight: 'bold' }}>{post.title.slice(0, 24)}...</span>
        </nav>

        {/* 記事カード本体 */}
        <article className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: '24px', background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#059669', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.8rem', borderRadius: '50px' }}>
              {post.category || post.tag || 'DLsite同人'}
            </span>
            <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.7rem', borderRadius: '50px', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>📢 PR</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>アフィリエイト広告</span>
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              📅 {new Date(post.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.4', marginBottom: '1.2rem' }}>
            {post.title}
          </h1>

          {/* 景品表示法・ステマ規制準拠 広告明示バー */}
          <div style={{ background: '#f8fafc', borderLeft: '4px solid #059669', padding: '0.6rem 1rem', marginBottom: '1.5rem', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
            ※当記事は商品・サービスの紹介を含むPR・アフィリエイト広告記事です。
          </div>

          {/* セール・キャンペーンバー */}
          {showCampaign && (
            <div style={{ background: '#ecfdf5', border: '2px solid #059669', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '2rem', position: 'relative' }}>
              <h4 style={{ color: '#059669', margin: '0 0 0.8rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔥 期間限定キャンペーン実施中！
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                {campaign.originalPrice && (
                  <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '1.1rem' }}>
                    {formatPriceWithCurrency(campaign.originalPrice, 'ja')}
                  </span>
                )}
                {campaign.discountPrice && (
                  <span style={{ color: '#e63946', fontSize: '2.2rem', fontWeight: '900', lineHeight: '1' }}>
                    {formatPriceWithCurrency(campaign.discountPrice, 'ja')}
                  </span>
                )}
              </div>
              {campaign.discountExpiry && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', fontWeight: 'bold', background: 'rgba(5,150,105,0.1)', display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '50px' }}>
                  ⏰ 割引期限: <span style={{ color: '#e63946' }}>{new Date(campaign.discountExpiry).toLocaleDateString('ja-JP')} まで</span>
                </p>
              )}
            </div>
          )}

          {/* 本文 */}
          <SafeHtmlRenderer html={cleanContent} />

          {/* シェア＆回遊ナビゲーション */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>
                この記事をシェアする:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                𝕏 でポスト
              </a>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dlsite" className="btn btn-outline" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', color: '#059669', borderColor: '#059669', background: '#ffffff', fontWeight: 'bold' }}>
                ← DLsite記事一覧へ
              </Link>
              <Link href="/ranking" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', color: '#ffffff', background: '#059669', fontWeight: 'bold' }}>
                👑 最新ランキングを見る →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </AppLayoutWrapper>
  );
}
