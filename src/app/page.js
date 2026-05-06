'use client';

import { useState, useEffect } from 'react';
import './globals.css';

// --- Components ---
function RealProductSearch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('ASMR');
  const [service, setService] = useState('digital');
  const [sort, setSort] = useState('-date');

  const searchProducts = async () => {
    setLoading(true);
    try {
      // 検索パラメータの構築
      let apiUrl = `/api/dmm/product?site=FANZA&keyword=${encodeURIComponent(keyword)}&hits=10&sort=${sort}`;
      if (service !== 'all') {
        apiUrl += `&service=${service}`;
      }

      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data && data.result && data.result.items) {
        setProducts(data.result.items);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchProducts();
  }, []);

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🔍 高度な商品検索・フィルタリング (FANZA)
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        キーワードだけでなく、サービス種別や並び順を指定してDMM Web APIからリアルタイム検索を行います。
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>キーワード</label>
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例: ASMR, 同人誌, メイド" 
            style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none', fontSize: '1rem' }}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>サービス（カテゴリ）</label>
          <select value={service} onChange={(e) => setService(e.target.value)} style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none', fontSize: '1rem', background: '#fff' }}>
            <option value="all">すべて</option>
            <option value="digital">動画 (ビデオ/素人)</option>
            <option value="doujin">同人 (音声/CG/ゲーム)</option>
            <option value="pcgame">PCゲーム</option>
            <option value="ebook">電子書籍 (コミック/小説)</option>
            <option value="mono">通販 (DVD/グッズ)</option>
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>並び順</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none', fontSize: '1rem', background: '#fff' }}>
            <option value="-date">新着順</option>
            <option value="rank">人気順</option>
            <option value="review">評価順</option>
            <option value="price">価格が安い順</option>
          </select>
        </div>
        <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn btn-primary" onClick={searchProducts} disabled={loading} style={{ padding: '0.8rem 2.5rem' }}>
            {loading ? '検索中...' : '絞り込み検索 ✨'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {products.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1.5rem', padding: '1rem', border: '2px solid var(--border-color)', borderRadius: '16px', background: 'rgba(255,255,255,0.5)' }}>
            <img src={item.imageURL?.small || ''} alt="サムネイル" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', background: '#f0f0f0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.category_name || item.service_name || 'カテゴリ未設定'}</span>
              <h3 style={{ margin: '0.3rem 0', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--primary-hover)', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 'auto' }}>
                {item.prices?.price ? `¥${item.prices.price}` : '価格未定'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <a href={item.affiliateURL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', textAlign: 'center', display: 'block' }}>
                  作品の詳細を見る ✨
                </a>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  ♡ 保存
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && !loading && <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem', color: 'var(--text-secondary)' }}>条件に一致する作品が見つかりませんでした。</p>}
      </div>
    </div>
  );
}

// --- Pages ---
function TopPage({ navigateTo }) {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          次、コレ見よ<br/>(DMMツール＆DLsiteブログポータル）
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          ニッチな創作作品をもっと身近にしたい、あなたに高機能なツールと作品紹介ブログを提供します。
        </p>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel delay-1">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>DMMツールポータル</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            APIを駆使した高度な検索、価格トラッキング、自動化Bot、データ分析など、アフィリエイト活動を強力にサポートする6つのツール群。
          </p>
          <button className="btn btn-primary" onClick={() => navigateTo('dmm')}>
            ツールポータルへ進む →
          </button>
        </div>

        <div className="glass-panel delay-2">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>DLsiteブログ</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            R18フィクション、スクール水着、全年齢ASMRなど、特定のフェティッシュに深く刺さる熱量のあるレビュー記事を展開。
          </p>
          <button className="btn btn-outline" onClick={() => navigateTo('dlsite')}>
            レビューブログへ進む →
          </button>
        </div>
      </div>
    </div>
  );
}

function DmmToolsPage() {
  const tools = [
    { id: 1, title: '商品検索・フィルタリング', desc: 'ジャンル×メーカーの複合検索や女優プロフィールからの精巧な作品検索。' },
    { id: 2, title: '価格トラッキング', desc: '過去の価格変動グラフと、希望価格を下回った際の値下げ通知（Discord/LINE）。' },
    { id: 3, title: 'データ分析ダッシュボード', desc: 'ジャンル別商品数推移やメーカー別レビュー評価ランキングの可視化。' },
    { id: 4, title: '新作通知 Bot', desc: 'お気に入り女優・メーカーの新作や特定ジャンルの新着アラート自動通知。' },
    { id: 5, title: 'カスタムメルマガ', desc: '詳細な嗜好設定に基づいたパーソナライズされた商品レコメンドの定期配信。' },
    { id: 6, title: '自動更新レビュー', desc: 'APIから自動的に最新商品を取得し、アフィリエイトリンク付きで表示するメディア。' }
  ];

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DMMツールポータル</h1>
        <p style={{ color: 'var(--text-secondary)' }}>APIを活用した強力なアフィリエイト支援ツール群</p>
      </div>

      <RealProductSearch />

      <h2 style={{ marginBottom: '1.5rem' }}>開発予定の機能一覧</h2>
      <div className="grid grid-cols-3">
        {tools.map((tool, index) => (
          <div key={tool.id} className={`glass-panel delay-${(index % 3) + 1}`} style={{ padding: '1.5rem' }}>
            <div style={{ 
              width: '45px', height: '45px', borderRadius: '50%', 
              background: 'var(--border-color)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
              color: 'var(--primary-hover)', fontWeight: '900', fontSize: '1.2rem'
            }}>
              0{tool.id}
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>{tool.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>{tool.desc}</p>
            <button className="btn btn-outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}>ツールを開く</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DlsiteBlogPage() {
  const categories = [
    { title: 'R18 フィクション', tags: ['同人誌', 'CG集', 'ゲーム'], color: '#ff758c' },
    { title: 'マニアック (スク水)', tags: ['スクール水着', 'フェティッシュ'], color: '#84b6f4' },
    { title: '全年齢 ASMR', tags: ['耳舐め', '音声作品', '癒やし'], color: '#b088f9' }
  ];

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DLsiteレビューブログ</h1>
        <p style={{ color: 'var(--text-secondary)' }}>ニッチな需要に深く刺さる、熱量重視の作品紹介</p>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
        {categories.map((cat, idx) => (
          <div key={idx} className="glass-panel" style={{ textAlign: 'center', borderColor: `rgba(${parseInt(cat.color.slice(1,3),16)}, ${parseInt(cat.color.slice(3,5),16)}, ${parseInt(cat.color.slice(5,7),16)}, 0.3)` }}>
            <h3 style={{ color: cat.color, marginBottom: '1rem' }}>{cat.title}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {cat.tags.map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>最新のレビュー</h2>
      <div className="grid grid-cols-2">
        {[1, 2, 3, 4].map(item => (
          <div key={item} className="glass-panel" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem' }}>
            <div style={{ width: '120px', height: '120px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', flexShrink: 0 }}></div>
            <div>
              <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>ASMR</span>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>究極の癒やし体験！耳舐め音声作品レビュー #{item}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                独自の切り口による熱量のあるレビュー文。シナリオの深さや音質のクリアさなど、実用性を含めて徹底的に解説します...
              </p>
              <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>記事を読む</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Admin Components ---
function AdminLogin({ onLogin }) {
  return (
    <div className="container animate-fade-in" style={{ maxWidth: '500px', marginTop: '4rem' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '2rem' }}>管理者ログイン</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="ユーザー名 (admin)" 
            style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
          />
          <input 
            type="password" 
            placeholder="パスワード (1234)" 
            style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
          />
          <button className="btn btn-primary" onClick={() => onLogin(true)}>
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}

function DmmAdmin() {
  const [primaryColor, setPrimaryColor] = useState('#ffb3c6');
  const [bgColor, setBgColor] = useState('#fff0f5');

  const handleApplyColors = () => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
    alert('デザイン設定を保存し、サイトに適用しました！');
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        🛠 DMMツール設定・UI管理
      </h2>
      
      <div className="grid grid-cols-2">
        <div className="glass-panel delay-1">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>🎨 テーマ・UIカラー設定</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>メインカラー (ボタン等)</label>
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>背景カラー</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer' }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleApplyColors} style={{ width: '100%' }}>デザインを適用する</button>
        </div>
        <div className="glass-panel delay-2">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>⚙️ ツール表示管理</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            トップページに表示するツールの順番や、表示/非表示を切り替えます。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {['商品検索', '価格トラッキング'].map((tool, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '0.8rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>{tool}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>編集</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DlsiteAdmin() {
  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        ✍️ DLsiteブログ 記事投稿・管理
      </h2>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-panel delay-1">
          <h3 style={{ marginBottom: '1.5rem' }}>新規記事作成</h3>
          <input type="text" placeholder="記事のタイトルを入力..." style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '1rem', outline: 'none' }} />
          <textarea placeholder="情熱的なレビューをここに記述..." style={{ width: '100%', border: '2px solid var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#faf8f9', marginBottom: '1rem', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          <button className="btn btn-primary">記事を公開する</button>
        </div>
        <div className="glass-panel delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>カテゴリ</h3>
            <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--border-color)' }}>
              <option>R18 フィクション</option>
              <option>マニアック (スク水)</option>
              <option>全年齢 ASMR</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminMode, setAdminMode] = useState(null);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={setIsLoggedIn} />;
  }

  if (adminMode === null) {
    return (
      <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>管理者ダッシュボード</h1>
        <div className="grid grid-cols-2">
          <div className="glass-panel" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setAdminMode('dmm')}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛠</div>
            <h2 style={{ marginBottom: '1rem' }}>DMMツール管理</h2>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setAdminMode('dlsite')}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✍️</div>
            <h2 style={{ marginBottom: '1rem' }}>DLsiteブログ投稿</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => setAdminMode(null)}>← ダッシュボード選択に戻る</button>
      </div>
      {adminMode === 'dmm' && <DmmAdmin />}
      {adminMode === 'dlsite' && <DlsiteAdmin />}
    </div>
  );
}

// --- App Root ---
export default function Page() {
  const [currentPage, setCurrentPage] = useState('top');

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand text-gradient" onClick={() => setCurrentPage('top')} style={{ fontSize: '1.3rem' }}>
          次、コレ見よ
        </div>
        <div className="nav-links">
          <a className={`nav-link ${currentPage === 'top' ? 'active' : ''}`} onClick={() => setCurrentPage('top')}>ホーム</a>
          <a className={`nav-link ${currentPage === 'dmm' ? 'active' : ''}`} onClick={() => setCurrentPage('dmm')}>DMMツール</a>
          <a className={`nav-link ${currentPage === 'dlsite' ? 'active' : ''}`} onClick={() => setCurrentPage('dlsite')}>DLsiteブログ</a>
          <a className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => setCurrentPage('admin')} style={{ marginLeft: '1rem', background: 'var(--secondary-color)', color: 'white' }}>管理者 🔒</a>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        {currentPage === 'top' && <TopPage navigateTo={setCurrentPage} />}
        {currentPage === 'dmm' && <DmmToolsPage />}
        {currentPage === 'dlsite' && <DlsiteBlogPage />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>
      
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <a href="https://affiliate.dmm.com/api/" target="_blank" rel="noopener noreferrer">
            <img src="https://pics.dmm.com/af/web_service/com_88_35.gif" width="88" height="35" alt="WEB SERVICE BY DMM.com" />
          </a>
          <a href="https://affiliate.dmm.com/api/" target="_blank" rel="noopener noreferrer">
            <img src="https://p.dmm.co.jp/p/affiliate/web_service/r18_88_35.gif" width="88" height="35" alt="WEB SERVICE BY FANZA" />
          </a>
        </div>
        <p>&copy; 2026 次、コレ見よ. All rights reserved.</p>
      </footer>
    </>
  );
}
