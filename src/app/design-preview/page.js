'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DesignPreviewPage() {
  const [activeTab, setActiveTab] = useState('B'); // Default to Option B

  // Sample sample products
  const sampleProducts = [
    {
      id: 1,
      title: '【耳舐めASMR】最高級の癒やしと極上フェラチオ音声〜吐息と咀嚼音のフルコース〜',
      category: '🎧 音声作品',
      tag: 'フェラ音声',
      rating: '4.9',
      price: '1,320',
      originalPrice: '2,640',
      discount: '50% OFF',
      image: 'https://pics.dmm.com/digital/video/h_1234/h_1234jp.jpg',
      description: 'バイノーラルマイクで密着録音。吐息が耳元でささやかれる圧倒的な没入感。'
    },
    {
      id: 2,
      title: '【スク水特選】放課後のプールサイドで二人きり…スクール水着の秘密特訓',
      category: '👙 スク水・水着',
      tag: 'スク水エロ',
      rating: '4.8',
      price: '1,980',
      originalPrice: '2,200',
      discount: '10% OFF',
      image: 'https://pics.dmm.com/digital/video/h_5678/h_5678jp.jpg',
      description: 'フェチズム溢れるスクール水着グラビア＆動画。高画質4K収録。'
    },
    {
      id: 3,
      title: '【2026年最新】FANZA上半期売上第1位！話題の超人気タイトル完全レビュー',
      category: '🎬 FANZA動画',
      tag: '人気1位',
      rating: '5.0',
      price: '2,480',
      originalPrice: '3,100',
      discount: '20% OFF',
      image: 'https://pics.dmm.com/digital/video/h_9012/h_9012jp.jpg',
      description: 'ユーザー支持率圧倒的ナンバーワン。見どころポイントを管理者が徹底解説。'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* プレビューコントロールバー */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎨 デザイン案 比較プレビュー画面
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            タブを切り替えて、実際のデザイン・カラー・カードの雰囲気をお試しください。
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setActiveTab('A')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              background: activeTab === 'A' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: activeTab === 'A' ? '#fff' : '#94a3b8'
            }}
          >
            案A: サイバーネオン ⚡
          </button>

          <button
            onClick={() => setActiveTab('B')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              background: activeTab === 'B' ? 'linear-gradient(135deg, #f43f5e, #8b5cf6)' : 'transparent',
              color: activeTab === 'B' ? '#fff' : '#94a3b8'
            }}
          >
            案B: ビジュアルポータル 🔥 (おすすめ)
          </button>

          <button
            onClick={() => setActiveTab('C')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              background: activeTab === 'C' ? 'linear-gradient(135deg, #10b981, #f59e0b)' : 'transparent',
              color: activeTab === 'C' ? '#fff' : '#94a3b8'
            }}
          >
            案C: ハイブリッドエレガンス 🌿
          </button>
        </div>

        <Link href="/" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← サイトトップへ戻る
        </Link>
      </header>

      {/* ============================================================ */}
      {/* 案A: サイバーネオン & グラスモーフィズム */}
      {/* ============================================================ */}
      {activeTab === 'A' && (
        <div style={{ background: '#05070d', minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* ヘッダー演出 */}
            <div style={{ textAlign: 'center', margin: '2rem 0 3rem' }}>
              <span style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid #06b6d4',
                color: '#22d3ee',
                padding: '0.3rem 1rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                letterSpacing: '0.1em'
              }}>CYBER NEON EDITION</span>
              <h2 style={{
                fontSize: '2.8rem',
                fontWeight: '900',
                marginTop: '1rem',
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.3))'
              }}>
                次、コレ見よ
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>近未来感溢れるグラスモーフィズムとネオンライトの発光デザイン</p>
            </div>

            {/* ナビゲーションタグ */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {['🔥 総合TOP', '🎧 音声作品', '👙 スク水エロ', '💋 フェラ特集', '👑 ランキング'].map((tag, idx) => (
                <button key={tag} style={{
                  background: idx === 0 ? 'linear-gradient(135deg, #06b6d4, #6366f1)' : 'rgba(15, 23, 42, 0.6)',
                  border: idx === 0 ? 'none' : '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#fff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  boxShadow: idx === 0 ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none',
                  cursor: 'pointer'
                }}>
                  {tag}
                </button>
              ))}
            </div>

            {/* カードグリッド */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {sampleProducts.map(p => (
                <div key={p.id} style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(56,189,248,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '180px', background: '#1e293b' }}>
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: 'rgba(6, 182, 212, 0.9)',
                      color: '#000', fontWeight: 'bold', fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem', borderRadius: '6px', backdropFilter: 'blur(4px)'
                    }}>
                      {p.tag}
                    </div>
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff', fontWeight: 'bold', fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem', borderRadius: '6px'
                    }}>
                      {p.discount}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '3rem' }}>
                      🖼️
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold' }}>{p.category}</span>
                    <h3 style={{ fontSize: '1rem', margin: '0.4rem 0', lineHeight: '1.4', color: '#f8fafc' }}>{p.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>{p.description}</p>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through', marginRight: '0.4rem' }}>¥{p.originalPrice}</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22d3ee' }}>¥{p.price}</span>
                    </div>
                    <button style={{
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.5rem 1.2rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      boxShadow: '0 0 12px rgba(6,182,212,0.4)',
                      cursor: 'pointer'
                    }}>
                      詳細を見る →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 案B: ビジュアルリッチ & エンタメポータル型 */}
      {/* ============================================================ */}
      {activeTab === 'B' && (
        <div style={{ background: '#0b0f19', minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem' }}>
          <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
            
            {/* ヒーローピックアップバナー (新設) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: '24px',
              padding: '2rem',
              marginBottom: '3rem',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <span style={{ background: '#f43f5e', color: '#fff', fontWeight: '900', padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem' }}>
                    🔥 本日のピックアップ作品
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fbbf24', fontWeight: 'bold', padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem' }}>
                    ★ 4.9 高評価作品
                  </span>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 1rem 0', lineHeight: '1.3', color: '#fff' }}>
                  【耳舐めASMR】最高級の癒やしと極上フェラチオ音声
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  管理者絶賛！バイノーラル3D音響で頭がとろけるような最高の没入体験。期間限定50%OFFセール実施中！
                </p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                    color: '#fff', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px',
                    fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(244,63,94,0.4)'
                  }}>
                    ▶ レビューと作品を試聴する
                  </button>
                  <span style={{ color: '#f43f5e', fontSize: '1.4rem', fontWeight: '900' }}>50% OFF (¥1,320)</span>
                </div>
              </div>
              
              <div style={{ width: '280px', height: '180px', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', fontSize: '3rem', color: '#94a3b8' }}>
                🎬 予告動画/ジャケット
              </div>
            </div>

            {/* グラフィカルカテゴリータブ */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📁 カテゴリーから作品を探す
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { name: '🎧 音声作品', count: '120作品', color: 'linear-gradient(135deg, #a855f7, #6366f1)' },
                  { name: '👙 スク水・水着', count: '85作品', color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
                  { name: '💋 フェラ特集', count: '94作品', color: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
                  { name: '👑 人気ランキング', count: 'TOP 50', color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                ].map(c => (
                  <div key={c.name} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem'
                  }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{c.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 作品一覧 */}
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', color: '#fff' }}>新着おすすめ作品レビュー</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {sampleProducts.map(p => (
                <div key={p.id} style={{
                  background: '#151c2c',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ position: 'relative', height: '190px', background: '#1e293b' }}>
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#8b5cf6', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.3rem 0.8rem', borderRadius: '50px' }}>
                      {p.category}
                    </span>
                    <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                      ★ {p.rating}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '3rem' }}>
                      🖼️ サムネイル
                    </div>
                  </div>

                  <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, lineHeight: '1.4', color: '#f8fafc' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{p.description}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through', marginRight: '0.4rem' }}>¥{p.originalPrice}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f43f5e' }}>¥{p.price}</span>
                      </div>
                      <button style={{
                        background: 'rgba(244, 63, 94, 0.15)',
                        color: '#fb7185',
                        border: '1px solid rgba(244, 63, 94, 0.4)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                        レビューを読む 👀
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 案C: ハイブリッド・シックエレガンス */}
      {/* ============================================================ */}
      {activeTab === 'C' && (
        <div style={{ background: '#1e293b', minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem', color: '#f1f5f9' }}>
          <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', margin: '2rem 0 3rem' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.05em' }}>RICH SLATE ELEGANCE</span>
              <h2 style={{ fontSize: '2.4rem', margin: '0.5rem 0', color: '#ffffff', fontWeight: 'bold' }}>次、コレ見よ</h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>明るいスレートグレー背景と高いコントラストで読みやすさを追求</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {sampleProducts.map(p => (
                <div key={p.id} style={{
                  background: '#0f172a',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid #334155',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ width: '140px', height: '100px', background: '#334155', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#94a3b8' }}>
                    🖼️
                  </div>

                  <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <span style={{ background: '#10b981', color: '#000', fontWeight: 'bold', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        {p.category}
                      </span>
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>★ {p.rating}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>{p.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{p.description}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0, marginLeft: 'auto' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through', display: 'block' }}>¥{p.originalPrice}</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981' }}>¥{p.price}</span>
                    </div>
                    <button style={{
                      background: '#10b981',
                      color: '#0f172a',
                      border: 'none',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}>
                      詳細を見る →
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
