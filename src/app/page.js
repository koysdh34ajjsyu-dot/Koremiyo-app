'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './globals.css';

// --- Utilities ---
const extractThumbnail = (html) => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

// --- Components ---
function RealProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [service, setService] = useState('digital');
  const [sort, setSort] = useState('-date');

  const popularTags = [
    '巨乳', '爆乳', '微乳', 'スレンダー', 'ぽっちゃり', 
    '人妻', '素人', '女子校生', 'ギャル', 'お姉さん',
    'NTR', '拘束', 'ハードコア', 'VR'
  ];

  const addTag = (tag) => {
    setKeyword(prev => prev ? `${prev} ${tag}` : tag);
  };

  const [useMeasurements, setUseMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState({
    bustMin: '', bustMax: '', waistMin: '', waistMax: '', hipMin: '', hipMax: ''
  });

  const searchProducts = async () => {
    setLoading(true);
    setProducts([]);
    try {
      if (useMeasurements) {
        // Step 1: 女優APIでスリーサイズ条件に合う女優を検索
        let actressUrl = `/api/dmm/actress?hits=5`;
        if (measurements.bustMin) actressUrl += `&gte_bust=${measurements.bustMin}`;
        if (measurements.bustMax) actressUrl += `&lte_bust=${measurements.bustMax}`;
        if (measurements.waistMin) actressUrl += `&gte_waist=${measurements.waistMin}`;
        if (measurements.waistMax) actressUrl += `&lte_waist=${measurements.waistMax}`;
        if (measurements.hipMin) actressUrl += `&gte_hip=${measurements.hipMin}`;
        if (measurements.hipMax) actressUrl += `&lte_hip=${measurements.hipMax}`;

        const aRes = await fetch(actressUrl);
        const aData = await aRes.json();
        const actresses = aData.result?.actress || [];
        
        if (actresses.length === 0) {
          alert('指定されたスリーサイズ条件に一致する女優が見つかりませんでした。条件を少し広げてみてください。');
          setLoading(false);
          return;
        }

        // Step 2: 該当した上位の女優(最大3名)の出演作品を検索
        let mergedItems = [];
        for (const act of actresses.slice(0, 3)) {
          let pUrl = `/api/dmm/product?site=FANZA&article=actress&article_id=${act.id}&hits=10&sort=${sort}`;
          if (service !== 'all') pUrl += `&service=${service}`;
          
          const pRes = await fetch(pUrl);
          const pData = await pRes.json();
          if (pData.result?.items) {
            // 各作品に誰の検索結果かわかるように女優名を付与
            const itemsWithActress = pData.result.items.map(i => ({...i, _matchedActress: act.name}));
            mergedItems = [...mergedItems, ...itemsWithActress];
          }
        }
        
        // 重複排除
        const uniqueItems = Array.from(new Map(mergedItems.map(item => [item.content_id, item])).values());
        setProducts(uniqueItems);

      } else {
        if (!keyword.trim()) {
          alert('検索キーワードを入力してください。');
          setLoading(false);
          return;
        }
        let apiUrl = `/api/dmm/product?site=FANZA&keyword=${encodeURIComponent(keyword)}&hits=20&sort=${sort}`;
        if (service !== 'all') apiUrl += `&service=${service}`;

        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data && data.result && data.result.items) {
          setProducts(data.result.items);
        }
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
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            <input type="checkbox" checked={useMeasurements} onChange={e => setUseMeasurements(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
            👙 女優のスリーサイズ（体型）から作品を探す
          </label>
        </div>

        {!useMeasurements ? (
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
        ) : (
          <div style={{ flex: '1 1 100%', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>バスト (cm)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" placeholder="Min" value={measurements.bustMin} onChange={e => setMeasurements({...measurements, bustMin: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                <span>〜</span>
                <input type="number" placeholder="Max" value={measurements.bustMax} onChange={e => setMeasurements({...measurements, bustMax: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>ウエスト (cm)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" placeholder="Min" value={measurements.waistMin} onChange={e => setMeasurements({...measurements, waistMin: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                <span>〜</span>
                <input type="number" placeholder="Max" value={measurements.waistMax} onChange={e => setMeasurements({...measurements, waistMax: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>ヒップ (cm)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="number" placeholder="Min" value={measurements.hipMin} onChange={e => setMeasurements({...measurements, hipMin: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                <span>〜</span>
                <input type="number" placeholder="Max" value={measurements.hipMax} onChange={e => setMeasurements({...measurements, hipMax: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
            </div>
            <p style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 -0.5rem 0' }}>※条件に合う女優を検索し、その女優の出演作品を自動で抽出します。</p>
          </div>
        )}

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
              {item._matchedActress && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--glass-bg)', padding: '0.2rem 0.5rem', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '0.3rem' }}>
                  出演: {item._matchedActress}
                </div>
              )}
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

  const searchActresses = async () => {
    if (!keyword) {
      alert('検索キーワードを入力してください。');
      return;
    }
    setLoading(true);
    try {
      let url = `/api/dmm/actress?hits=6&sort=name`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

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
        女優の名前やキーワードを入力して、プロフィール画像や出演作品一覧へのリンクを即座に表示します。
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="女優名 (ひらがな、漢字など)" 
          style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '50px', border: '2px solid var(--border-color)', outline: 'none', fontSize: '1rem' }}
        />
        <button className="btn btn-primary" onClick={searchActresses} disabled={loading} style={{ padding: '0.8rem 2rem' }}>
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

function TrendingAnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // ランキング上位30件を取得して分析 (site=FANZAを追加)
      const res = await fetch('/api/dmm/product?site=FANZA&sort=rank&hits=30');
      const data = await res.json();
      
      if (data && data.result && data.result.items) {
        const items = data.result.items;
        
        let totalPrice = 0;
        const genreCounts = {};
        const makerCounts = {};
        
        items.forEach(item => {
          totalPrice += parseInt(item.prices?.price || 0);
          
          if (item.iteminfo?.genre) {
            item.iteminfo.genre.forEach(g => {
              genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
            });
          }
          if (item.iteminfo?.maker) {
            item.iteminfo.maker.forEach(m => {
              makerCounts[m.name] = (makerCounts[m.name] || 0) + 1;
            });
          }
        });

        // ソートしてトップ5を取得
        const topGenres = Object.entries(genreCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
        const topMakers = Object.entries(makerCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

        setStats({
          avgPrice: Math.round(totalPrice / items.length),
          topGenres,
          topMakers
        });
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📈 トレンドデータ分析ダッシュボード
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        現在の人気ランキング上位30作品のデータをリアルタイム解析し、今最も熱いジャンルやメーカーの傾向を可視化します。
      </p>
      
      {!stats && !loading && (
        <button className="btn btn-primary" onClick={fetchAnalytics} style={{ padding: '0.8rem 2rem' }}>
          トレンドデータを解析する ✨
        </button>
      )}

      {loading && <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>データを解析中...</p>}

      {stats && (
        <div className="grid grid-cols-3" style={{ marginTop: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>人気作品の平均価格</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              ¥{stats.avgPrice.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>上位30作品から算出</p>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>🔥 急上昇ジャンル TOP5</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
              {stats.topGenres.map((g, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.3rem' }}>
                  <span>{i+1}. {g[0]}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{g[1]} 作品</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>🏆 人気メーカー TOP5</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
              {stats.topMakers.map((m, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.3rem' }}>
                  <span>{i+1}. {m[0]}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{m[1]} 作品</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function DmmReleaseCalendar() {
  const [releases, setReleases] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      // 最新の動画作品を日付順で取得
      const res = await fetch('/api/dmm/product?site=FANZA&service=digital&sort=-date&hits=40');
      const data = await res.json();
      
      if (data && data.result && data.result.items) {
        const items = data.result.items;
        const grouped = {};
        
        items.forEach(item => {
          const rawDate = item.date || item.delivery_date;
          if (rawDate) {
            // YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD
            const dateStr = rawDate.split(' ')[0];
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(item);
          }
        });
        
        // 日付でソート
        const sortedGroups = Object.keys(grouped).sort((a,b) => new Date(b) - new Date(a)).reduce((acc, key) => {
          acc[key] = grouped[key];
          return acc;
        }, {});
        
        setReleases(sortedGroups);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📅 新作発売カレンダー (FANZA動画)
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        近日発売された、または発売予定の新作タイトルを日付ごとにチェックできます。
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>カレンダーを読み込み中...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.keys(releases).map(dateStr => (
            <div key={dateStr}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary-color)' }}>
                {dateStr}
              </h3>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                {releases[dateStr].map(item => (
                  <div key={item.content_id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <img src={item.imageURL?.small || ''} alt="thumbnail" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        {item.title}
                      </div>
                      <a href={item.affiliateURL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold', textDecoration: 'none' }}>
                        作品ページへ →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(releases).length === 0 && !loading && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>リリース情報がありません。</p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Pages ---
function TopPage({ navigateTo }) {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          次、コレ見よ
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 1rem', lineHeight: '1.8' }}>
          <strong>音声作品・フェラ・スク水（スクール水着）</strong>などのオススメ同人作品を厳選レビュー。<br/>
          DLsite・FANZA・DMMから管理者イチオシの作品を紹介するブログポータル＆<strong>DMMツール・FANZAツール</strong>を提供します。
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
          ※ 本サイトは18歳以上の方を対象としたアダルトコンテンツを含みます。
        </p>
      </div>

      <div className="grid grid-cols-3">
        <div className="glass-panel delay-1">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>🛠 DMMツール / FANZAツール</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
            FANZA・DMM APIを活用した高度な商品検索・女優データベース検索・トレンド分析ツール群。
          </p>
          <button className="btn btn-primary" onClick={() => navigateTo('dmm')} style={{ width: '100%' }}>
            ツールを使う →
          </button>
        </div>

        <div className="glass-panel delay-2">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>📖 DMMブログ / FANZAレビュー</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
            FANZA・DMMのオススメ動画作品を管理者が熱量込めて徹底レビュー。新作・人気作を随時更新。
          </p>
          <button className="btn btn-outline" onClick={() => navigateTo('dmm-blog')} style={{ width: '100%' }}>
            DMMブログへ →
          </button>
        </div>

        <div className="glass-panel delay-3">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>✍️ DLsiteブログ / 音声・同人レビュー</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
            <strong>フェラ音声・スク水エロ・スクール水着</strong>などDLsiteオススメ作品を管理者がマニアックにレビュー。
          </p>
          <button className="btn btn-outline" onClick={() => navigateTo('dlsite')} style={{ width: '100%' }}>
            DLsiteブログへ →
          </button>
        </div>
      </div>
    </div>
  );
}

function DmmToolsPage({ navigateTo }) {
  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DMMツール / FANZAツール ポータル</h1>
        <p style={{ color: 'var(--text-secondary)' }}>FANZA・DMM APIを活用した商品検索・女優データベース・トレンド分析など、強力な検索・分析ツール群</p>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel hover-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigateTo('dmm-product-search')}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>商品検索ツール</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>各種条件でDMM/FANZAの商品を柔軟に検索・抽出</p>
        </div>
        <div className="glass-panel hover-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigateTo('dmm-actress-search')}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>女優データベース検索</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>名前や詳細なプロフィールから女優情報を検索</p>
        </div>
        <div className="glass-panel hover-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigateTo('dmm-trending')}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>トレンド分析ダッシュボード</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>人気キーワードやジャンルの傾向をグラフで可視化</p>
        </div>
        <div className="glass-panel hover-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigateTo('dmm-calendar')}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>新作発売カレンダー</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>近日発売の注目作品をカレンダー形式で一覧表示</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>🚀 近日公開予定のツール</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', opacity: 0.7, marginBottom: '2rem' }}>
        <span style={{ background: 'var(--glass-bg)', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>📉 セール・価格トラッキング</span>
        <span style={{ background: 'var(--glass-bg)', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>🤖 おすすめ作品自動生成AI</span>
        <span style={{ background: 'var(--glass-bg)', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>📱 ユーザーお気に入り保存機能</span>
      </div>
    </div>
  );
}

const renderCampaign = (contentRaw) => {
  let campaign = null;
  let cleanContent = contentRaw || '';
  const match = cleanContent.match(/<!--CAMPAIGN:(.*?)-->/);
  if (match) {
    try { campaign = JSON.parse(match[1]); } catch(e){}
    cleanContent = cleanContent.replace(/<!--CAMPAIGN:.*?-->\n?/g, '');
  }
  
  let showCampaign = false;
  if (campaign && campaign.discountExpiry) {
    const expiryDate = new Date(`${campaign.discountExpiry}T23:59:59`);
    const now = new Date();
    if (now <= expiryDate) {
      showCampaign = true;
    }
  }
  return { campaign, showCampaign, cleanContent };
};

function DlsiteBlogPage({ articles = [] }) {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    { title: 'フェ◯チオが好きな方はこちら！！', desc: 'フェラ・フェラチオ好きへ管理者オススメのDLsite同人作品を紹介。フェラ音声・フェラ同人を厳選！', color: '#ff758c' },
    { title: 'スクール水着が好きな方はこちら！！', desc: 'スク水・スクール水着エロ好きへ管理者オススメのDLsite同人作品を紹介。スク水エロCG・音声を厳選！', color: '#84b6f4' },
    { title: '全年齢 ASMR', desc: '癒やしを求める方向けの音声作品レビュー', color: '#b088f9' }
  ];

  if (selectedArticle) {
    const { campaign, showCampaign, cleanContent } = renderCampaign(selectedArticle.content || selectedArticle.contentHTML);

    return (
      <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
        <button className="btn btn-outline" onClick={() => setSelectedArticle(null)} style={{ marginBottom: '2rem' }}>← 記事一覧に戻る</button>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>{selectedArticle.category || selectedArticle.tag}</span>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '2rem', fontSize: '2rem' }}>{selectedArticle.title}</h1>
          
          {showCampaign && (
            <div style={{ background: 'var(--glass-bg)', border: '2px solid #84b6f4', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #84b6f4, #b088f9)' }}></div>
              <h4 style={{ color: '#84b6f4', margin: '0 0 1rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔥 期間限定キャンペーン実施中！
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '1rem' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{campaign.originalPrice}円</span>
                <span style={{ color: '#84b6f4', fontSize: '2.5rem', fontWeight: '900', lineHeight: '1', textShadow: '0 2px 4px rgba(132,182,244,0.2)' }}>{campaign.discountPrice}円</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold', background: 'rgba(132,182,244,0.1)', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '50px' }}>
                ⏰ 割引期限: <span style={{ color: '#b088f9' }}>{new Date(campaign.discountExpiry).toLocaleDateString('ja-JP')} 23:59 まで</span>
              </p>
            </div>
          )}

          <div 
            className="article-content"
            style={{ color: 'var(--text-color)', lineHeight: '1.8', fontSize: '1.05rem' }}
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </div>
    );
  }

  const filteredArticles = activeCategory ? articles.filter(a => a.category === activeCategory) : articles;

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DLsiteレビューブログ</h1>
        <p style={{ color: 'var(--text-secondary)' }}>ニッチな需要に深く刺さる、熱量重視の作品紹介</p>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
        {categories.map((cat, idx) => {
          const isActive = activeCategory === cat.title;
          return (
            <div 
              key={idx} 
              className="glass-panel hover-card" 
              onClick={() => setActiveCategory(isActive ? null : cat.title)}
              style={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                borderColor: isActive ? cat.color : `rgba(${parseInt(cat.color.slice(1,3),16)}, ${parseInt(cat.color.slice(3,5),16)}, ${parseInt(cat.color.slice(5,7),16)}, 0.3)`,
                background: isActive ? `rgba(${parseInt(cat.color.slice(1,3),16)}, ${parseInt(cat.color.slice(3,5),16)}, ${parseInt(cat.color.slice(5,7),16)}, 0.1)` : 'var(--glass-bg)',
                transform: isActive ? 'translateY(-5px)' : 'none'
              }}
            >
              <h3 style={{ color: cat.color, marginBottom: '1rem', fontSize: '1.1rem' }}>{cat.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {cat.desc}
              </p>
            </div>
          );
        })}
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>{activeCategory ? `「${activeCategory}」のレビュー` : '最新のレビュー'}</h2>
      <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
        {filteredArticles.map(item => {
          const thumbUrl = extractThumbnail(item.content || item.contentHTML);
          const { showCampaign } = renderCampaign(item.content || item.contentHTML);

          return (
            <div key={item.id} className="glass-panel hover-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {showCampaign && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'linear-gradient(45deg, #84b6f4, #b088f9)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(132,182,244,0.3)', zIndex: 10 }}>
                  🔥 キャンペーン中
                </div>
              )}
              {thumbUrl ? (
                <div style={{ width: '100%', height: '160px', marginBottom: '1rem', overflow: 'hidden', borderRadius: '8px' }}>
                  <img src={thumbUrl} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '160px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '1rem' }}></div>
              )}
              <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.category || item.tag}</span>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', flexGrow: 1 }}>{item.title}</h3>
              <button className="btn btn-primary" onClick={() => setSelectedArticle(item)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', marginTop: '1rem' }}>記事を読む</button>
            </div>
          );
        })}
        {filteredArticles.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>現在公開されている記事はありません。</p>}
      </div>
    </div>
  );
}

function DmmBlogPage({ articles = [] }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  if (selectedArticle) {
    const { campaign, showCampaign, cleanContent } = renderCampaign(selectedArticle.content || selectedArticle.contentHTML);

    return (
      <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
        <button className="btn btn-outline" onClick={() => setSelectedArticle(null)} style={{ marginBottom: '2rem' }}>← 記事一覧に戻る</button>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 'bold' }}>FANZA動画</span>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '2rem', fontSize: '2rem' }}>{selectedArticle.title}</h1>
          
          {showCampaign && (
            <div style={{ background: 'var(--glass-bg)', border: '2px solid #ff758c', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #ff758c, #ff7eb3)' }}></div>
              <h4 style={{ color: '#ff758c', margin: '0 0 1rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔥 期間限定キャンペーン実施中！
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '1rem' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{campaign.originalPrice}円</span>
                <span style={{ color: '#ff0033', fontSize: '2.5rem', fontWeight: '900', lineHeight: '1', textShadow: '0 2px 4px rgba(255,0,51,0.2)' }}>{campaign.discountPrice}円</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold', background: 'rgba(255,117,140,0.1)', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '50px' }}>
                ⏰ 割引期限: <span style={{ color: '#e63946' }}>{new Date(campaign.discountExpiry).toLocaleDateString('ja-JP')} 23:59 まで</span>
              </p>
            </div>
          )}

          <div 
            className="article-content"
            style={{ color: 'var(--text-color)', lineHeight: '1.8', fontSize: '1.05rem' }}
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DMM作品レビューブログ</h1>
        <p style={{ color: 'var(--text-secondary)' }}>FANZA/DMMの注目作品や名作を独自の視点で徹底レビュー</p>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
        {articles.map(item => {
          const thumbUrl = extractThumbnail(item.content || item.contentHTML);
          const { showCampaign } = renderCampaign(item.content || item.contentHTML);

          return (
            <div key={item.id} className="glass-panel hover-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {showCampaign && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'linear-gradient(45deg, #ff0033, #ff758c)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.8rem', boxShadow: '0 4px 10px rgba(255,0,51,0.3)', zIndex: 10 }}>
                  🔥 キャンペーン中
                </div>
              )}
              {thumbUrl ? (
                <div style={{ width: '100%', height: '160px', marginBottom: '1rem', overflow: 'hidden', borderRadius: '8px' }}>
                  <img src={thumbUrl} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '160px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '1rem' }}></div>
              )}
              <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>FANZA動画</span>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', flexGrow: 1 }}>{item.title}</h3>
              <button className="btn btn-primary" onClick={() => setSelectedArticle(item)} style={{ width: '100%', padding: '0.6rem', fontSize: '0.9rem', marginTop: '1rem' }}>記事を読む</button>
            </div>
          );
        })}
        {articles.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>現在公開されている記事はありません。</p>}
      </div>
    </div>
  );
}

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

function DlsiteAdmin({ articles, refreshPosts }) {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('フェ◯チオが好きな方はこちら！！');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // キャンペーン設定用ステート
  const [campaignEnabled, setCampaignEnabled] = useState(false);
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountExpiry, setDiscountExpiry] = useState('');

  const handleSave = async () => {
    if (!title || !content) return alert('タイトルと本文を入力してください');
    
    // キャンペーン情報の埋め込み処理
    let finalContent = content;
    if (campaignEnabled) {
      if (!originalPrice || !discountPrice || !discountExpiry) {
        return alert('キャンペーンの元金額、割引金額、期限をすべて入力してください');
      }
      const campData = { originalPrice, discountPrice, discountExpiry };
      finalContent = `<!--CAMPAIGN:${JSON.stringify(campData)}-->\n` + content.replace(/<!--CAMPAIGN:.*?-->\n?/g, '');
    } else {
      finalContent = content.replace(/<!--CAMPAIGN:.*?-->\n?/g, '');
    }

    setLoading(true);
    
    if (editingId) {
      const { error } = await supabase.from('posts').update({ title, content: finalContent, category }).eq('id', editingId);
      if (error) { alert('更新に失敗しました: ' + JSON.stringify(error)); console.error(error); }
    } else {
      const { error } = await supabase.from('posts').insert([{ site: 'dlsite', title, content: finalContent, category }]);
      if (error) { alert('保存に失敗しました: ' + JSON.stringify(error)); console.error(error); }
    }
    
    if (refreshPosts) await refreshPosts();
    handleCancel();
    setLoading(false);
    alert('保存しました！');
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setCategory(article.category || 'フェ◯チオが好きな方はこちら！！');
    setShowPreview(false);
    
    // キャンペーン情報の復元
    const match = (article.content || '').match(/<!--CAMPAIGN:(.*?)-->/);
    if (match) {
      try {
        const camp = JSON.parse(match[1]);
        setCampaignEnabled(true);
        setOriginalPrice(camp.originalPrice || '');
        setDiscountPrice(camp.discountPrice || '');
        setDiscountExpiry(camp.discountExpiry || '');
        setContent((article.content || '').replace(/<!--CAMPAIGN:.*?-->\n?/g, ''));
      } catch(e) {
        setContent(article.content);
      }
    } else {
      setCampaignEnabled(false);
      setOriginalPrice('');
      setDiscountPrice('');
      setDiscountExpiry('');
      setContent(article.content || '');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('この記事を削除しますか？')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) {
        alert('削除に失敗しました');
        console.error(error);
      } else {
        if (refreshPosts) await refreshPosts();
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setShowPreview(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        ✍️ DLsiteブログ 記事投稿・管理
      </h2>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-panel delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{editingId ? '記事の編集 (DLsite)' : '新規記事作成 (DLsite)'}</h3>
            <button className="btn btn-outline" onClick={() => setShowPreview(!showPreview)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              {showPreview ? 'エディタに戻る' : 'HTMLプレビューを表示'}
            </button>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="記事のタイトルを入力..." style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '1rem', outline: 'none' }} />
          
          {showPreview ? (
            <div style={{ width: '100%', border: '2px dashed var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#fff', marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: content || '<p style="color:#aaa">プレビュー表示エリア（HTMLがレンダリングされます）</p>' }} />
          ) : (
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="情熱的なレビューをここに記述... (アフィリエイト用HTMLコードをそのまま貼り付け可能です)" style={{ width: '100%', border: '2px solid var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#faf8f9', marginBottom: '1rem', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : (editingId ? '変更を保存する' : '記事を公開する')}</button>
            {editingId && <button className="btn btn-outline" onClick={handleCancel} disabled={loading}>キャンセル</button>}
          </div>
        </div>
        <div className="glass-panel delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>カテゴリ</h3>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--border-color)' }}>
              <option>フェ◯チオが好きな方はこちら！！</option>
              <option>スクール水着が好きな方はこちら！！</option>
              <option>全年齢 ASMR</option>
            </select>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(132, 182, 244, 0.05)', borderRadius: '12px', border: '1px solid rgba(132, 182, 244, 0.3)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: campaignEnabled ? '1rem' : '0' }}>
              <input type="checkbox" checked={campaignEnabled} onChange={e => setCampaignEnabled(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
              🔥 キャンペーン情報を追加する
            </label>
            
            {campaignEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>元金額 (円)</div>
                  <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="例: 4980" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>割引後の金額 (円)</div>
                  <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="例: 500" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>割引の終了日</div>
                  <input type="date" value={discountExpiry} onChange={e => setDiscountExpiry(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                  ※指定した終了日の23:59を過ぎると、自動的に非表示になります。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>過去の記事一覧</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {articles.map(article => (
          <div key={article.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>{article.category}</span>
              <h4 style={{ margin: '0.3rem 0 0 0', fontSize: '1.1rem' }}>{article.title}</h4>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => handleEdit(article)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>編集</button>
              <button className="btn btn-outline" onClick={() => handleDelete(article.id)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'red', borderColor: 'red' }}>削除</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>投稿された記事はありません。</p>}
      </div>
    </div>
  );
}

function DmmBlogAdmin({ articles, refreshPosts }) {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dmmId, setDmmId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // キャンペーン設定用ステート
  const [campaignEnabled, setCampaignEnabled] = useState(false);
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [discountExpiry, setDiscountExpiry] = useState('');

  const handleSave = async () => {
    if (!title || !content) return alert('タイトルと本文を入力してください');
    
    // キャンペーン情報の埋め込み処理
    let finalContent = content;
    if (campaignEnabled) {
      if (!originalPrice || !discountPrice || !discountExpiry) {
        return alert('キャンペーンの元金額、割引金額、期限をすべて入力してください');
      }
      const campData = { originalPrice, discountPrice, discountExpiry };
      finalContent = `<!--CAMPAIGN:${JSON.stringify(campData)}-->\n` + content.replace(/<!--CAMPAIGN:.*?-->\n?/g, '');
    } else {
      finalContent = content.replace(/<!--CAMPAIGN:.*?-->\n?/g, '');
    }

    setLoading(true);

    if (editingId) {
      const { error } = await supabase.from('posts').update({ title, content: finalContent, dmm_id: dmmId }).eq('id', editingId);
      if (error) { alert('更新に失敗しました: ' + JSON.stringify(error)); console.error(error); }
    } else {
      const { error } = await supabase.from('posts').insert([{ site: 'dmm', title, content: finalContent, dmm_id: dmmId }]);
      if (error) { alert('保存に失敗しました: ' + JSON.stringify(error)); console.error(error); }
    }
    
    if (refreshPosts) await refreshPosts();
    handleCancel();
    setLoading(false);
    alert('保存しました！');
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setDmmId(article.dmmId || article.dmm_id || '');
    setShowPreview(false);

    // キャンペーン情報の復元
    const match = (article.content || '').match(/<!--CAMPAIGN:(.*?)-->/);
    if (match) {
      try {
        const camp = JSON.parse(match[1]);
        setCampaignEnabled(true);
        setOriginalPrice(camp.originalPrice || '');
        setDiscountPrice(camp.discountPrice || '');
        setDiscountExpiry(camp.discountExpiry || '');
        setContent((article.content || '').replace(/<!--CAMPAIGN:.*?-->\n?/g, ''));
      } catch(e) {
        setContent(article.content);
      }
    } else {
      setCampaignEnabled(false);
      setOriginalPrice('');
      setDiscountPrice('');
      setDiscountExpiry('');
      setContent(article.content || '');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('この記事を削除しますか？')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) {
        alert('削除に失敗しました');
        console.error(error);
      } else {
        if (refreshPosts) await refreshPosts();
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setDmmId('');
    setShowPreview(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '2rem', borderBottom: '3px solid var(--primary-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        ✍️ DMMブログ 記事投稿・管理
      </h2>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-panel delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{editingId ? '記事の編集 (DMM)' : '新規記事作成 (DMM)'}</h3>
            <button className="btn btn-outline" onClick={() => setShowPreview(!showPreview)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              {showPreview ? 'エディタに戻る' : 'HTMLプレビューを表示'}
            </button>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="記事のタイトルを入力..." style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '1rem', outline: 'none' }} />
          
          {showPreview ? (
            <div style={{ width: '100%', border: '2px dashed var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#fff', marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: content || '<p style="color:#aaa">プレビュー表示エリア（HTMLがレンダリングされます）</p>' }} />
          ) : (
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="FANZA作品のレビューをここに記述... (アフィリエイト用HTMLコードをそのまま貼り付け可能です)" style={{ width: '100%', border: '2px solid var(--border-color)', borderRadius: '12px', minHeight: '300px', padding: '1rem', background: '#faf8f9', marginBottom: '1rem', outline: 'none', fontSize: '1rem', resize: 'vertical' }}></textarea>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? '保存中...' : (editingId ? '変更を保存する' : '記事を公開する')}</button>
            {editingId && <button className="btn btn-outline" onClick={handleCancel} disabled={loading}>キャンセル</button>}
          </div>
        </div>
        <div className="glass-panel delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>連携商品ID (DMM)</h3>
            <input type="text" value={dmmId} onChange={e => setDmmId(e.target.value)} placeholder="例: snis00123" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--border-color)', outline: 'none' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              商品IDを入力すると、記事の下部に自動でアフィリエイトリンクと商品画像が生成されます。
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255, 117, 140, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 117, 140, 0.3)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: campaignEnabled ? '1rem' : '0' }}>
              <input type="checkbox" checked={campaignEnabled} onChange={e => setCampaignEnabled(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
              🔥 キャンペーン情報を追加する
            </label>
            
            {campaignEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>元金額 (円)</div>
                  <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="例: 4980" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>割引後の金額 (円)</div>
                  <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="例: 500" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>割引の終了日</div>
                  <input type="date" value={discountExpiry} onChange={e => setDiscountExpiry(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                  ※指定した終了日の23:59を過ぎると、キャンペーン表示は自動的に非表示になります。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>過去の記事一覧</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {articles.map(article => (
          <div key={article.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>FANZA動画</span>
              <h4 style={{ margin: '0.3rem 0 0 0', fontSize: '1.1rem' }}>{article.title}</h4>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => handleEdit(article)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>編集</button>
              <button className="btn btn-outline" onClick={() => handleDelete(article.id)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'red', borderColor: 'red' }}>削除</button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>投稿された記事はありません。</p>}
      </div>
    </div>
  );
}

function AdminDashboard({ dlsiteArticles, dmmArticles, refreshPosts }) {
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
      {adminMode === 'dlsite' && <DlsiteAdmin articles={dlsiteArticles} refreshPosts={refreshPosts} />}
      {adminMode === 'dmm-blog' && <DmmBlogAdmin articles={dmmArticles} refreshPosts={refreshPosts} />}
    </div>
  );
}

// --- App Root ---
export default function Page() {
  const [currentPage, setCurrentPage] = useState('top');
  const [showAdmin, setShowAdmin] = useState(false);
  
  // ブログ記事のステート (Supabase連携)
  const [dlsiteArticles, setDlsiteArticles] = useState([]);
  const [dmmArticles, setDmmArticles] = useState([]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });
    
    if (data) {
      setDlsiteArticles(data.filter(post => post.site === 'dlsite'));
      setDmmArticles(data.filter(post => post.site === 'dmm'));
    }
    if (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    // 隠しURLのチェック (?secret=admin1234)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('secret') === 'admin1234') {
        setShowAdmin(true);
        setCurrentPage('admin');
        
        // オプション: URLからパラメータを消去して綺麗にする場合
        // window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

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
          {showAdmin && (
            <a className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => setCurrentPage('admin')} style={{ marginLeft: '1rem', background: 'var(--secondary-color)', color: 'white' }}>管理者 🔒</a>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        {currentPage === 'top' && <TopPage navigateTo={setCurrentPage} />}
        {currentPage === 'dmm' && <DmmToolsPage navigateTo={setCurrentPage} />}
        
        {currentPage === 'dmm-product-search' && (
          <div className="container animate-fade-in">
             <button className="btn btn-outline" style={{ marginBottom: '1.5rem' }} onClick={() => setCurrentPage('dmm')}>← DMMツールポータルに戻る</button>
             <RealProductSearch />
          </div>
        )}
        {currentPage === 'dmm-actress-search' && (
          <div className="container animate-fade-in">
             <button className="btn btn-outline" style={{ marginBottom: '1.5rem' }} onClick={() => setCurrentPage('dmm')}>← DMMツールポータルに戻る</button>
             <RealActressSearch />
          </div>
        )}
        {currentPage === 'dmm-trending' && (
          <div className="container animate-fade-in">
             <button className="btn btn-outline" style={{ marginBottom: '1.5rem' }} onClick={() => setCurrentPage('dmm')}>← DMMツールポータルに戻る</button>
             <TrendingAnalyticsDashboard />
          </div>
        )}
        {currentPage === 'dmm-calendar' && (
          <div className="container animate-fade-in">
             <button className="btn btn-outline" style={{ marginBottom: '1.5rem' }} onClick={() => setCurrentPage('dmm')}>← DMMツールポータルに戻る</button>
             <DmmReleaseCalendar />
          </div>
        )}

        {currentPage === 'dmm-blog' && <DmmBlogPage articles={dmmArticles} />}
        {currentPage === 'dlsite' && <DlsiteBlogPage articles={dlsiteArticles} />}
        {currentPage === 'admin' && showAdmin && <AdminDashboard dlsiteArticles={dlsiteArticles} dmmArticles={dmmArticles} refreshPosts={fetchPosts} />}
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
