import sys, os, json, re, urllib.request, urllib.parse, csv
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

headers_req = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Cookie': 'adultchecked=1; age_check_done=1; cklg=ja;'
}

excel_path = 'd:/AIproject/DMMaffireight/content_manager.xlsx'
csv_path = 'd:/AIproject/DMMaffireight/content_manager.csv'
campaign_csv_path = 'd:/AIproject/DMMaffireight/campaign_management/campaigns.csv'

# アフィリエイトID定義
DMM_AFFILIATE_ID = 'KashiwagiTak-002'
DLSITE_AFFILIATE_ID = 'Koremiyoonline'

font_data = Font(name='Meiryo UI', size=9)
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
align_center = Alignment(horizontal='center', vertical='center')
align_left = Alignment(horizontal='left', vertical='center')

def fetch_json(url):
    req = urllib.request.Request(url, headers=headers_req)
    with urllib.request.urlopen(req, timeout=10) as res:
        return json.loads(res.read().decode('utf-8'))

def fetch_html(url):
    req = urllib.request.Request(url, headers=headers_req)
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.read().decode('utf-8', errors='ignore')

def format_url(u):
    if not u: return ''
    return f"https:{u}" if u.startswith('//') else u

def generate_affiliate_url(req_url, platform=None, prod_id=None):
    """商品URLや特設URLからアフィリエイトURLを100%自動生成する"""
    if not req_url:
        return ''
    req_url = req_url.strip()

    # すでにアフィリエイトURL（al.fanza, al.dmm, dlaf等）の場合はそのまま
    if any(k in req_url for k in ['al.fanza.co.jp', 'al.dmm.co.jp', 'dlaf.jp', 'aid=']):
        return req_url

    # 1. DLsite
    if 'dlsite.com' in req_url or (platform and 'dlsite' in str(platform).lower()):
        m = re.search(r'([R|V|B]J\d{6,8})', req_url, re.I)
        if not m and prod_id:
            m = re.search(r'([R|V|B]J\d{6,8})', str(prod_id), re.I)
        if m:
            workno = m.group(1).upper()
            return f"https://www.dlsite.com/maniax/dlaf/=/link/work/aid/{DLSITE_AFFILIATE_ID}/id/{workno}.html"
        sep = '&' if '?' in req_url else '?'
        return f"{req_url}{sep}_af={DLSITE_AFFILIATE_ID}"

    # 2. DMM / FANZA
    if 'dmm.co.jp' in req_url or 'fanza' in req_url or 'dmm.com' in req_url or 'dlsoft.dmm' in req_url:
        clean_url = re.sub(r'(\?|&)(_gl|_fplc|utm_[a-zA-Z0-9_]+)=[^&]*', '', req_url)
        clean_url = clean_url.rstrip('?&')
        encoded = urllib.parse.quote(clean_url, safe='')
        is_fanza = any(k in clean_url for k in ['videoa', 'videoc', 'doujin', 'book.dmm.co.jp', 'kuji', 'fanza'])
        gateway = "https://al.fanza.co.jp/" if is_fanza else "https://al.dmm.co.jp/"
        return f"{gateway}?lurl={encoded}&af_id={DMM_AFFILIATE_ID}&ch=toolbar&ch_id=text"

    return req_url

def extract_tag_info(val):
    """公式HTMLタグからaffiliate_url, img_url, worknoを高精度に抽出する"""
    if not val or not isinstance(val, str):
        return None, None, None

    val_str = val.strip()
    aff_url = None
    img_url = None
    workno = None

    m_href = re.search(r'href=["\']([^"\']+)["\']', val_str, re.I)
    if m_href:
        aff_url = m_href.group(1).strip()
        if aff_url.startswith('//'):
            aff_url = 'https:' + aff_url
    elif val_str.startswith('http') and any(k in val_str for k in ['dlaf.jp', 'aid=', 'al.dmm.co.jp', 'al.fanza.co.jp']):
        aff_url = val_str

    m_src = re.search(r'src=["\']([^"\']+)["\']', val_str, re.I)
    if m_src:
        img_url = m_src.group(1).strip()
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
    elif (val_str.startswith('http') or val_str.startswith('//')) and any(ext in val_str.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.mp4']):
        img_url = format_url(val_str)

    m_rj = re.search(r'([R|V|B]J\d{6,8})', val_str, re.I)
    if m_rj:
        workno = m_rj.group(1).upper()
    else:
        m_cid = re.search(r'cid=([a-zA-Z0-9_]+)', val_str, re.I)
        if m_cid:
            workno = m_cid.group(1)

    return aff_url, img_url, workno

def scrape_dmm_product(url):
    """DMM / FANZA の作品詳細ページから公式情報をスクレイピング抽出する"""
    try:
        req = urllib.request.Request(url, headers=headers_req)
        with urllib.request.urlopen(req, timeout=10) as res:
            raw = res.read()
        
        # 文字コード自動判定 (euc-jp, cp932, utf-8)
        html = None
        for enc in ['euc-jp', 'cp932', 'utf-8']:
            try:
                html = raw.decode(enc)
                break
            except Exception:
                continue
        if not html:
            html = raw.decode('utf-8', errors='ignore')

        info = {}

        # 1. タイトル
        m_title = re.search(r'<meta[^>]+(?:property|name)=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
        if not m_title:
            m_title = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:title["\']', html, re.I)
        if m_title:
            t = m_title.group(1).split(' - ')[0].split('【FANZA')[0].split(' - FANZA')[0].strip()
            info['title'] = t
        else:
            m_h1 = re.search(r'<h1[^>]*id="title"[^>]*>([^<]+)</h1>', html)
            if m_h1:
                info['title'] = m_h1.group(1).strip()

        # 2. メイン画像 (og:image) -> 高解像度昇格 (pl.jpg)
        m_img = re.search(r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
        if not m_img:
            m_img = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:image["\']', html, re.I)
        if m_img:
            img_u = m_img.group(1).strip()
            img_u = re.sub(r'p[r|s|t]\.jpg', 'pl.jpg', img_u)
            info['main_image'] = img_u

        # 3. サンプル画像 (jp-001.jpg, -1.jpg等)
        samples = re.findall(r'https?://(?:doujin|pics|ebook)-assets\.dmm\.co\.jp/[^"\'\s>]+(?:jp-\d+|-\d+)\.(?:jpg|png)', html)
        if not samples:
            samples = re.findall(r'https?://pics\.dmm\.co\.jp/[^"\'\s>]+jp-\d+\.jpg', html)
        if not samples:
            samples = re.findall(r'https?://pics\.dmm\.co\.jp/[^"\'\s>]+-\d+\.jpg', html)

        unique_smps = []
        for s in samples:
            if s not in unique_smps and s != info.get('main_image'):
                unique_smps.append(s)
        info['samples'] = unique_smps

        # 4. サークル / 出演 / メーカー
        for d_m in re.finditer(r'<dt[^>]*class="informationList__ttl"[^>]*>([^<]+)</dt>\s*<dd[^>]*class="informationList__txt"[^>]*>(.*?)</dd>', html, re.S):
            lbl = d_m.group(1).strip()
            val_txt = re.sub(r'<[^>]+>', ' ', d_m.group(2)).strip()
            if any(k in lbl for k in ['サークル', '作者', '作家', '出演者', 'メーカー']):
                info['maker'] = ' '.join(val_txt.split())
                break
            elif 'ジャンル' in lbl and not info.get('category'):
                info['category'] = ' / '.join([w for w in val_txt.split() if w][:3])

        if not info.get('maker'):
            for pattern in [
                r'出演者[：:]</td>\s*<td[^>]*>(?:<a[^>]*>)?([^<]+)',
                r'サークル[：:]</td>\s*<td[^>]*>(?:<a[^>]*>)?([^<]+)',
                r'作家[：:]</td>\s*<td[^>]*>(?:<a[^>]*>)?([^<]+)',
                r'メーカー[：:]</td>\s*<td[^>]*>(?:<a[^>]*>)?([^<]+)'
            ]:
                m = re.search(pattern, html)
                if m:
                    info['maker'] = m.group(1).strip()
                    break

        # 5. カテゴリ (未取得時)
        if not info.get('category'):
            m_genres = re.findall(r'genre[^"]*">([^<]+)</a>', html)
            if m_genres:
                info['category'] = ' / '.join(m_genres[:3])

        # 6. 価格・セール
        m_price = re.search(r'(?:class="[^"]*price[^"]*"|<span[^>]*itemprop="price"[^>]*>)([^<]+)', html)
        if m_price:
            info['price'] = re.sub(r'[^\d,円%OFF\s～~-]', '', m_price.group(1)).strip()

        # 7. あらすじ
        m_desc = re.search(r'<meta[^>]+(?:property|name)=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
        if not m_desc:
            m_desc = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:description["\']', html, re.I)
        if m_desc:
            info['intro'] = m_desc.group(1).strip()
        else:
            m_p = re.search(r'<p class="mg-b20[^"]*">([^<]+)</p>', html)
            if m_p:
                info['intro'] = m_p.group(1).strip()

        # 8. サンプル動画 (litevideo)
        m_vid = re.search(r'https?://www\.dmm\.co\.jp/litevideo/-/part/=/cid=[^"\'\s>]+', html)
        if m_vid:
            info['sample_video'] = m_vid.group(0)

        return info
    except Exception as e:
        print(f"  ⚠️ DMMスクレイピング例外 ({url}): {e}")
        return {}

def search_dlsite_by_title(title):
    clean_tag = re.sub(r'^[【\[][^】\]]+[】\]]', '', title).strip()
    clean_sym = re.sub(r'[~～\-_/|・―—：:＝=]', ' ', clean_tag).strip()
    
    keywords = []
    if clean_sym and clean_sym != title:
        keywords.append(' '.join(clean_sym.split()))
        words = clean_sym.split()
        if len(words) > 1 and len(words[0]) >= 3:
            keywords.append(words[0])
    if clean_tag and clean_tag != title:
        keywords.append(' '.join(clean_tag.split()))
    keywords.append(' '.join(title.split()))
    
    found_rjs = []
    for kw in keywords:
        q = urllib.parse.quote_plus(kw)
        url = f"https://www.dlsite.com/maniax/fsr/=/keyword/{q}"
        try:
            html = fetch_html(url)
            rjs = list(dict.fromkeys(re.findall(r'(?:RJ|VJ|BJ)[0-9]{6,8}', html)))
            for rj in rjs:
                if rj not in found_rjs:
                    found_rjs.append(rj)
            if found_rjs:
                break
        except Exception:
            pass

    for rj in found_rjs[:10]:
        try:
            api_url = f"https://www.dlsite.com/maniax/api/=/product.json?workno={rj}"
            data = fetch_json(api_url)
            if not data: continue
            cand_name = data[0].get('work_name', '')
            if cand_name.strip() == title.strip():
                return rj, data[0]
        except Exception:
            continue

    if found_rjs:
        try:
            api_url = f"https://www.dlsite.com/maniax/api/=/product.json?workno={found_rjs[0]}"
            data = fetch_json(api_url)
            if data: return found_rjs[0], data[0]
        except Exception:
            pass

    return None, None

def process_articles_sheet(ws):
    print("\n==========================================")
    print("📋 シート1: 【記事作成】のスキャンと自動補完")
    print("==========================================")

    tags_found = 0
    for r in range(4, ws.max_row + 1):
        for c in range(6, 12):
            cell_val = ws.cell(row=r, column=c).value
            if cell_val and ('<a ' in str(cell_val) or '<img ' in str(cell_val)):
                aff, img, rj = extract_tag_info(str(cell_val))
                if aff and (not ws.cell(row=r, column=6).value or '<' in str(ws.cell(row=r, column=6).value)):
                    ws.cell(row=r, column=6, value=aff)
                    print(f"  📎 行 {r} のタグからアフィリエイトURLを自動反映: {aff}")
                    tags_found += 1
                if img and c >= 7:
                    ws.cell(row=r, column=c, value=img)
                    print(f"  🖼️ 行 {r} 列 {c} の素材URLを正規化: {img}")
                elif c == 6 and aff:
                    ws.cell(row=r, column=6, value=aff)
                if rj and not ws.cell(row=r, column=12).value:
                    ws.cell(row=r, column=12, value=rj)
                if rj and not ws.cell(row=r, column=5).value:
                    if rj.startswith(('RJ', 'VJ', 'BJ')):
                        ws.cell(row=r, column=5, value=f"https://www.dlsite.com/maniax/work/=/product_id/{rj}.html")

    target_rows = []
    for r in range(4, ws.max_row + 1):
        status = ws.cell(row=r, column=2).value
        title = ws.cell(row=r, column=4).value
        req_url = ws.cell(row=r, column=5).value
        aff_url = ws.cell(row=r, column=6).value
        img1 = ws.cell(row=r, column=7).value
        prod_id = ws.cell(row=r, column=12).value

        all_values = [ws.cell(row=r, column=c).value for c in range(1, 18)]
        if not any(all_values):
            continue

        if status in ['本番公開済', '記事作成済'] and title and (prod_id or img1):
            continue

        if req_url or prod_id or title:
            is_incomplete = (
                status in ['未着手', '調査待ち', None, ''] or
                not req_url or
                not prod_id or
                not aff_url or
                not img1
            )
            if is_incomplete:
                target_rows.append(r)

    print(f"📊 調査・補完対象: {len(target_rows)} 件 (行: {target_rows})")

    for row_idx in target_rows:
        req_url = ws.cell(row=row_idx, column=5).value
        prod_id = ws.cell(row=row_idx, column=12).value
        title = ws.cell(row=row_idx, column=4).value
        platform = ws.cell(row=row_idx, column=3).value or ''
        
        print(f"\n🔍 行 {row_idx} を調査中: URL={req_url}, ID={prod_id}, Title={title}")

        # タイトルのみある場合
        resolved_data = None
        if not req_url and not prod_id and title:
            rj_code, p_data = search_dlsite_by_title(title)
            if rj_code:
                prod_id = rj_code
                req_url = f"https://www.dlsite.com/maniax/work/=/product_id/{rj_code}.html"
                resolved_data = p_data
                platform = 'DLsite'
                print(f"  🎯 DLsite商品を特定: [{prod_id}] URL: {req_url}")

        # 商品IDはあるがURLがない場合
        if not req_url and prod_id:
            pid_str = str(prod_id).strip()
            if re.search(r'[R|V|B]J\d{6,8}', pid_str, re.I):
                req_url = f"https://www.dlsite.com/maniax/work/=/product_id/{pid_str}.html"
                platform = 'DLsite'
            elif pid_str.startswith('d_'):
                req_url = f"https://www.dmm.co.jp/dc/doujin/-/detail/=/cid={pid_str}/"
                platform = 'FANZA同人'
            elif 'ssni' in pid_str.lower():
                req_url = f"https://www.dmm.co.jp/digital/videoa/-/detail/=/cid={pid_str}/"
                platform = 'FANZA動画'

        url_str = str(req_url or '')

        # プラットフォーム自動判定
        if not platform or platform == '':
            if 'dlsite.com' in url_str or re.search(r'[R|V|B]J\d{6,8}', url_str, re.I):
                platform = 'DLsite'
            elif 'dc/doujin' in url_str:
                platform = 'FANZA同人'
            elif 'digital/video' in url_str:
                platform = 'FANZA動画'
            elif 'book.dmm.co.jp' in url_str:
                platform = 'FANZAブックス'
            elif 'dmm.co.jp' in url_str or 'dmm.com' in url_str:
                platform = 'DMM'

        # アフィリエイトURLの自動生成（空欄時）
        current_aff = ws.cell(row=row_idx, column=6).value
        if not current_aff or '<' in str(current_aff):
            auto_aff = generate_affiliate_url(url_str, platform, prod_id)
            if auto_aff:
                ws.cell(row=row_idx, column=6, value=auto_aff)
                print(f"  ✨ アフィリエイトURLを自動生成: {auto_aff}")

        # A. DLsite商品の情報取得
        if platform == 'DLsite' or 'dlsite.com' in url_str or re.search(r'[R|V|B]J\d{6,8}', url_str, re.I):
            m = re.search(r'([R|V|B]J\d{6,8})', url_str or str(prod_id), re.I)
            if not m:
                continue
            workno = m.group(1).upper()
            prod_id = workno
            
            p = resolved_data or {}
            if not p:
                try:
                    prod_api = f"https://www.dlsite.com/maniax/api/=/product.json?workno={workno}"
                    prod_data = fetch_json(prod_api)
                    p = prod_data[0] if prod_data and len(prod_data) > 0 else {}
                except Exception:
                    p = {}

            html = ''
            try:
                html = fetch_html(f"https://www.dlsite.com/maniax/work/=/product_id/{workno}.html")
            except Exception:
                pass

            res_title = p.get('work_name') or title or ''
            maker = p.get('maker_name') or ''
            category = p.get('work_type_string') or '同人'
            intro = p.get('intro_s') or ''

            price_str = f"{p.get('price'):,}円" if p.get('price') else ''
            sale_price_str = f"{p.get('sales_price'):,}円" if p.get('sales_price') else ''
            discount_str = f"{round((1 - p.get('sales_price') / p.get('price')) * 100)}% OFF" if p.get('price') and p.get('sales_price') else ''

            s1 = s2 = s3 = s4 = s5 = ''
            if html:
                m_img = re.search(r'<meta property="og:image" content="([^"]+)"', html)
                if m_img: s1 = format_url(m_img.group(1))
                smps = re.findall(r'//img\.dlsite\.jp/[^"\'\s>]+_img_smp\d+\.jpg', html)
                unique_smps = []
                for s in smps:
                    f_s = format_url(s)
                    if f_s not in unique_smps:
                        unique_smps.append(f_s)
                if len(unique_smps) > 0: s2 = unique_smps[0]
                if len(unique_smps) > 1: s3 = unique_smps[1]
                if len(unique_smps) > 2: s4 = unique_smps[2]
                chobit_m = re.search(r'https?://chobit\.cc/(?:embed|share|player)?/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)', html)
                if chobit_m:
                    s5 = f"https://chobit.cc/embed/{chobit_m.group(1)}/{chobit_m.group(2)}"

            # 反映
            ws.cell(row=row_idx, column=1, value='未')
            ws.cell(row=row_idx, column=2, value='調査完了')
            ws.cell(row=row_idx, column=3, value='DLsite')
            if res_title: ws.cell(row=row_idx, column=4, value=res_title)
            if req_url: ws.cell(row=row_idx, column=5, value=req_url)
            if s1: ws.cell(row=row_idx, column=7, value=s1)
            if s2: ws.cell(row=row_idx, column=8, value=s2)
            if s3: ws.cell(row=row_idx, column=9, value=s3)
            if s4: ws.cell(row=row_idx, column=10, value=s4)
            if s5: ws.cell(row=row_idx, column=11, value=s5)
            ws.cell(row=row_idx, column=12, value=workno)
            if maker: ws.cell(row=row_idx, column=13, value=maker)
            if category: ws.cell(row=row_idx, column=14, value=category)
            price_disp = f"{sale_price_str} ({discount_str})" if sale_price_str and discount_str else (price_str or '')
            if price_disp: ws.cell(row=row_idx, column=15, value=price_disp)
            if intro and not ws.cell(row=row_idx, column=16).value: ws.cell(row=row_idx, column=16, value=intro)
            if not ws.cell(row=row_idx, column=17).value: ws.cell(row=row_idx, column=17, value=f"ART-{row_idx-3:04d}")

        # B. DMM / FANZA商品の情報取得
        elif any(k in url_str for k in ['dmm.co.jp', 'dmm.com', 'fanza']):
            dmm_info = scrape_dmm_product(url_str)
            res_title = dmm_info.get('title') or title or ''
            s1 = dmm_info.get('main_image') or ''
            smps = dmm_info.get('samples', [])
            s2 = smps[0] if len(smps) > 0 else ''
            s3 = smps[1] if len(smps) > 1 else ''
            s4 = smps[2] if len(smps) > 2 else ''
            s5 = dmm_info.get('sample_video') or ''
            maker = dmm_info.get('maker') or ''
            category = dmm_info.get('category') or ''
            price_disp = dmm_info.get('price') or ''
            intro = dmm_info.get('intro') or ''

            cid_m = re.search(r'cid=([a-zA-Z0-9_]+)', url_str)
            if cid_m: prod_id = cid_m.group(1)
            elif not prod_id and 'product/' in url_str:
                p_m = re.search(r'product/\d+/([^/?#]+)', url_str)
                if p_m: prod_id = p_m.group(1)

            ws.cell(row=row_idx, column=1, value='未')
            ws.cell(row=row_idx, column=2, value='調査完了')
            ws.cell(row=row_idx, column=3, value=platform or 'FANZA')
            if res_title: ws.cell(row=row_idx, column=4, value=res_title)
            if req_url: ws.cell(row=row_idx, column=5, value=req_url)
            if s1: ws.cell(row=row_idx, column=7, value=s1)
            if s2: ws.cell(row=row_idx, column=8, value=s2)
            if s3: ws.cell(row=row_idx, column=9, value=s3)
            if s4: ws.cell(row=row_idx, column=10, value=s4)
            if s5: ws.cell(row=row_idx, column=11, value=s5)
            if prod_id: ws.cell(row=row_idx, column=12, value=prod_id)
            if maker: ws.cell(row=row_idx, column=13, value=maker)
            if category: ws.cell(row=row_idx, column=14, value=category)
            if price_disp: ws.cell(row=row_idx, column=15, value=price_disp)
            if intro and not ws.cell(row=row_idx, column=16).value: ws.cell(row=row_idx, column=16, value=intro)
            if not ws.cell(row=row_idx, column=17).value: ws.cell(row=row_idx, column=17, value=f"ART-{row_idx-3:04d}")

        # スタイル適用
        for c in range(1, 18):
            cell = ws.cell(row=row_idx, column=c)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c in [1, 2, 3, 12, 14, 17] else align_left

def process_campaigns_sheet(ws):
    print("\n==========================================")
    print("📢 シート2: 【キャンペーン】のスキャンと自動補完")
    print("==========================================")
    for r in range(4, ws.max_row + 1):
        c_title = ws.cell(row=r, column=4).value
        c_url = ws.cell(row=r, column=5).value
        c_aff = ws.cell(row=r, column=6).value
        
        all_vals = [ws.cell(row=r, column=c).value for c in range(1, 15)]
        if not any(all_vals): continue

        # アフィリエイトURL自動生成
        if c_url and (not c_aff or '<' in str(c_aff)):
            auto_aff = generate_affiliate_url(c_url, 'DMM')
            ws.cell(row=r, column=6, value=auto_aff)
            print(f"  ✨ キャンペーン行 {r} アフィリエイトURLを自動生成: {auto_aff}")

        if not ws.cell(row=r, column=14).value:
            ws.cell(row=r, column=14, value=f"CAMP-{r-3:04d}")

        for c in range(1, 15):
            cell = ws.cell(row=r, column=c)
            cell.font = font_data
            cell.border = thin_border
            cell.alignment = align_center if c in [1, 2, 3, 12, 14] else align_left

def main():
    if not os.path.exists(excel_path):
        print(f"エラー: {excel_path} が見つかりません。")
        sys.exit(1)

    wb = openpyxl.load_workbook(excel_path)
    
    # 1. 記事作成シート処理
    ws_articles = wb['記事作成'] if '記事作成' in wb.sheetnames else wb.active
    process_articles_sheet(ws_articles)

    # 2. キャンペーンシート処理
    if 'キャンペーン' in wb.sheetnames:
        process_campaigns_sheet(wb['キャンペーン'])

    # オートフィルター更新
    ws_articles.auto_filter.ref = f"A3:Q{ws_articles.max_row}"
    if 'キャンペーン' in wb.sheetnames:
        wb['キャンペーン'].auto_filter.ref = f"A3:N{wb['キャンペーン'].max_row}"

    # 保存
    wb.save(excel_path)
    print(f"\n🎉 統合Excel ({excel_path}) を正常に保存しました！")

    # CSV同期保存 (記事作成シート)
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        for r in range(3, ws_articles.max_row + 1):
            writer.writerow([ws_articles.cell(row=r, column=c).value or '' for c in range(1, 18)])
    print(f"📄 記事作成同期用CSV ({csv_path}) を保存しました。")

    # CSV同期保存 (キャンペーンシート)
    if 'キャンペーン' in wb.sheetnames:
        ws_camp = wb['キャンペーン']
        with open(campaign_csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            for r in range(3, ws_camp.max_row + 1):
                writer.writerow([ws_camp.cell(row=r, column=c).value or '' for c in range(1, 15)])
        print(f"📄 キャンペーン同期用CSV ({campaign_csv_path}) を保存しました。")

if __name__ == '__main__':
    main()
