'use client';

import { useState, useEffect } from 'react';
import './globals.css';

// --- Components ---
function RealProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [service, setService] = useState('digital');
  const [sort, setSort] = useState('-date');

  const popularTags = ['巨乳', '人妻', '素人', '女子校生', 'NTR', '拘束', 'M男', 'VR'];

  const addTag = (tag) => {
    setKeyword(prev => prev ? `${prev} ${tag}` : tag);
  };

  const searchProducts = async () => {
    if (!keyword.trim()) {
      alert('検索キーワードを入力してください。');
      return;
    }
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

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🔍 高度な商品検索・フィルタリング (FANZA)
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        キーワードだけでなく、サービス種別や並び順を指定してDMM Web APIからリアルタイム検索を行います。
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>キーワード</label>
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワード (例: シチュエーション、プレイ内容、女優名など)" 
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

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>人気のタグ:</span>
        {popularTags.map(tag => (
          <button 
            key={tag} 
            onClick={() => addTag(tag)}
            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.3rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            {tag} +
          </button>
        ))}
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

function RealActressSearch() {
  const [actresses, setActresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');

  const searchActresses = async () => {
    setLoading(true);
    try {
      let url = `/api/dmm/actress?hits=6&sort=name`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (bust) url += `&bust=${encodeURIComponent(bust)}`;
      if (waist) url += `&waist=${encodeURIComponent(waist)}`;
      if (hip) url += `&hip=${encodeURIComponent(hip)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data && data.result && data.result.actress) {
        setActresses(data.result.actress);
      } else {
        setActresses([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        👩 女優データベース検索ツール
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        名前での検索に加え、スリーサイズ（B/W/H）を指定した詳細な絞り込みが可能です。理想のスタイルの女優を発見できます。
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="女優名 (ひらがな、漢字など)" 
          style={{ flex: 2, minWidth: '200px', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none', fontSize: '1rem' }}
        />
        <input 
          type="number" 
          value={bust}
          onChange={(e) => setBust(e.target.value)}
          placeholder="バスト (例: 90)" 
          style={{ flex: 1, minWidth: '100px', padding: '0.8rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
        />
        <input 
          type="number" 
          value={waist}
          onChange={(e) => setWaist(e.target.value)}
          placeholder="ウエスト (例: 60)" 
          style={{ flex: 1, minWidth: '100px', padding: '0.8rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
        />
        <input 
          type="number" 
          value={hip}
          onChange={(e) => setHip(e.target.value)}
          placeholder="ヒップ (例: 88)" 
          style={{ flex: 1, minWidth: '100px', padding: '0.8rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
        />
      </div>
      
      <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
        <button className="btn btn-primary" onClick={searchActresses} disabled={loading} style={{ padding: '0.8rem 3rem' }}>
          {loading ? '検索中...' : '検索する ✨'}
        </button>
      </div>

      <div className="grid grid-cols-3">
        {actresses.map((actress, idx) => (
          <div key={idx} style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'rgba(255,255,255,0.3)' }}>
            <img 
              src={actress.imageURL?.large || 'https://via.placeholder.com/150'} 
              alt={actress.name} 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', margin: '0 auto 1rem', background: '#f0f0f0', border: '3px solid var(--primary-color)' }} 
            />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{actress.name}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {actress.ruby}
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '1rem', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
              バスト: {actress.bust || '非公開'}<br/>
              ウエスト: {actress.waist || '非公開'}<br/>
              ヒップ: {actress.hip || '非公開'}
            </div>
            <a href={actress.listURL?.digital || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'block', padding: '0.4rem', fontSize: '0.8rem' }}>
              出演作品を見る
            </a>
          </div>
        ))}
      </div>
      {actresses.length === 0 && !loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>検索結果がありません。</p>}
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

      <div className="grid grid-cols-3">
        <div className="glass-panel delay-1">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>🛠 DMMツール</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
            APIを駆使した商品・女優検索、データ分析など、アフィリエイト活動を強力にサポートするツール群。
          </p>
          <button className="btn btn-primary" onClick={() => navigateTo('dmm')} style={{ width: '100%' }}>
            ツールを使う →
          </button>
        </div>

        <div className="glass-panel delay-2">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>📖 DMMブログ</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
            FANZA・DMMの注目作品や名作を、独自の視点で熱量高く徹底レビューした記事のポータル。
          </p>
          <button className="btn btn-outline" onClick={() => navigateTo('dmm-blog')} style={{ width: '100%' }}>
            DMMブログへ →
          </button>
        </div>

        <div className="glass-panel delay-3">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>✍️ DLsiteブログ</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
            同人誌や音声作品など、ニッチなフェティッシュに深く刺さるマニアックなレビューを展開。
          </p>
          <button className="btn btn-outline" onClick={() => navigateTo('dlsite')} style={{ width: '100%' }}>
            DLsiteブログへ →
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
      <RealActressSearch />

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
    { title: 'フェ◯チオが好きな方はこちら！！', desc: '管理者オススメの同人作品を紹介しています。', color: '#ff758c' },
    { title: 'スクール水着が好きな方はこちら！！', desc: '管理者オススメの同人作品を紹介しています。', color: '#84b6f4' },
    { title: '全年齢 ASMR', desc: '癒やしを求める方向けの音声作品レビュー', color: '#b088f9' }
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
            <h3 style={{ color: cat.color, marginBottom: '1rem', fontSize: '1.1rem' }}>{cat.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {cat.desc}
            </p>
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

function DmmBlogPage() {
  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DMM作品レビューブログ</h1>
        <p style={{ color: 'var(--text-secondary)' }}>FANZA/DMMの注目作品や名作を独自の視点で徹底レビュー</p>
      </div>

      <div className="grid grid-cols-2">
        {[1, 2, 3, 4].map(item => (
          <div key={item} className="glass-panel" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem' }}>
            <div style={{ width: '120px', height: '120px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', flexShrink: 0 }}></div>
            <div>
              <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>FANZA動画</span>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>超おすすめ！今月絶対に見るべき作品まとめ #{item}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                今回はFANZAで人気のあのジャンルから、個人的に最高だと思った作品をピックアップしました。映像のクオリティや演出が...
              </p>
              <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>記事を読む</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { supabase } from '../lib/supabase';

// --- Admin Components ---
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      alert('ログインに失敗しました。メールアドレスかパスワードが間違っています。');
      console.error(error);
    } else if (data.session) {
      onLogin(true);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '500px', marginTop: '4rem' }}>
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '2rem' }}>管理者ログイン</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="email" 
            placeholder="メールアドレス" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
          />
          <input 
            type="password" 
            placeholder="パスワード" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '1rem', borderRadius: '12px', border: '2px solid var(--border-color)', outline: 'none' }}
          />
          <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? '認証中...' : 'セキュアログイン'}
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
          <h3 style={{ marginBottom: '1.5rem' }}>新規記事作成 (DLsite)</h3>
          <input type="text" placeholder="記事のタイトルを入力..." style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '1rem', outline: 'none' }} />
          <textarea placeholder="情熱的なレビューをここに記述..." style={{ width: '100%', border: '2px solid var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#faf8f9', marginBottom: '1rem', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          <button className="btn btn-primary">記事を公開する</button>
        </div>
        <div className="glass-panel delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>カテゴリ</h3>
            <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--border-color)' }}>
              <option>フェ◯チオが好きな方はこちら！！</option>
              <option>スクール水着が好きな方はこちら！！</option>
              <option>全年齢 ASMR</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function DmmBlogAdmin() {
  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        ✍️ DMMブログ 記事投稿・管理
      </h2>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-panel delay-1">
          <h3 style={{ marginBottom: '1.5rem' }}>新規記事作成 (DMM)</h3>
          <input type="text" placeholder="記事のタイトルを入力..." style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '1rem', outline: 'none' }} />
          <textarea placeholder="FANZA作品のレビューをここに記述..." style={{ width: '100%', border: '2px solid var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#faf8f9', marginBottom: '1rem', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          <button className="btn btn-primary">記事を公開する</button>
        </div>
        <div className="glass-panel delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>連携商品ID (DMM)</h3>
            <input type="text" placeholder="例: snis00123" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--border-color)', outline: 'none' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              商品IDを入力すると、記事の下部に自動でアフィリエイトリンクと商品画像が生成されます。
            </p>
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
        <div className="grid grid-cols-3">
          <div className="glass-panel" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setAdminMode('dmm')}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛠</div>
            <h2 style={{ marginBottom: '1rem' }}>DMMツール管理</h2>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setAdminMode('dmm-blog')}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
            <h2 style={{ marginBottom: '1rem' }}>DMMブログ投稿</h2>
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
      {adminMode === 'dmm-blog' && <DmmBlogAdmin />}
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
          <a className={`nav-link ${currentPage === 'dmm-blog' ? 'active' : ''}`} onClick={() => setCurrentPage('dmm-blog')}>DMMブログ</a>
          <a className={`nav-link ${currentPage === 'dlsite' ? 'active' : ''}`} onClick={() => setCurrentPage('dlsite')}>DLsiteブログ</a>
          <a className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => setCurrentPage('admin')} style={{ marginLeft: '1rem', background: 'var(--secondary-color)', color: 'white' }}>管理者 🔒</a>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        {currentPage === 'top' && <TopPage navigateTo={setCurrentPage} />}
        {currentPage === 'dmm' && <DmmToolsPage />}
        {currentPage === 'dmm-blog' && <DmmBlogPage />}
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
