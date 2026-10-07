import sys, os, json, re, urllib.request, urllib.parse, csv, io, argparse
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# 設定
SHEET_ID = '1u2bqFFoRSvy0huOFvS2f1NF-k9iyUy6G1dwWwH29Unc'
GOOGLE_SHEET_CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"
EXCEL_PATH = 'd:/AIproject/DMMaffireight/content_manager.xlsx'
CSV_PATH = 'd:/AIproject/DMMaffireight/content_manager.csv'

HEADERS_REQ = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html',
    'Cookie': 'adultchecked=1;'
}

font_data = Font(name='Meiryo UI', size=9)
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
align_center = Alignment(horizontal='center', vertical='center')
align_left = Alignment(horizontal='left', vertical='center')

def fetch_url_text(url):
    req = urllib.request.Request(url, headers=HEADERS_REQ)
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read().decode('utf-8', errors='ignore')

def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS_REQ)
    with urllib.request.urlopen(req, timeout=10) as res:
        return json.loads(res.read().decode('utf-8'))

def format_url(u):
    if not u: return ''
    return f"https:{u}" if u.startswith('//') else u

def search_dlsite_by_title(title):
    """タイトルからDLsiteのRJ番号と商品データを自動検索・特定する"""
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
            html = fetch_url_text(url)
            rjs = list(dict.fromkeys(re.findall(r'(?:RJ|VJ)[0-9]{6,8}', html)))
            for rj in rjs:
                if rj not in found_rjs:
                    found_rjs.append(rj)
            if found_rjs:
                break
        except Exception as e:
            pass

    # 1. 完全一致
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

    # 2. タグなし一致
    for rj in found_rjs[:10]:
        try:
            api_url = f"https://www.dlsite.com/maniax/api/=/product.json?workno={rj}"
            data = fetch_json(api_url)
            if not data: continue
            cand_name = data[0].get('work_name', '')
            if clean_tag and clean_tag == cand_name.strip():
                return rj, data[0]
        except Exception:
            continue

    # 3. 部分一致
    for rj in found_rjs[:10]:
        try:
            api_url = f"https://www.dlsite.com/maniax/api/=/product.json?workno={rj}"
            data = fetch_json(api_url)
            if not data: continue
            cand_name = data[0].get('work_name', '')
            if clean_sym and all(w in cand_name for w in clean_sym.split()):
                return rj, data[0]
        except Exception:
            continue

    # 先頭候補フォールバック
    if found_rjs:
        try:
            api_url = f"https://www.dlsite.com/maniax/api/=/product.json?workno={found_rjs[0]}"
            data = fetch_json(api_url)
            if data: return found_rjs[0], data[0]
        except Exception:
            pass

    return None, None

def fetch_product_assets(workno):
    """作品ページHTMLから素材画像・動画URLを抽出"""
    html = ''
    try:
        url = f"https://www.dlsite.com/maniax/work/=/product_id/{workno}.html"
        html = fetch_url_text(url)
    except Exception as e:
        return '', '', '', '', ''

    s1, s2, s3, s4, s5 = '', '', '', '', ''
    # メイン画像
    m_img = re.search(r'<meta property="og:image" content="([^"]+)"', html)
    if m_img: s1 = format_url(m_img.group(1))

    # サンプルCG
    smps = re.findall(r'//img\.dlsite\.jp/[^"\'\s>]+_img_smp\d+\.jpg', html)
    unique_smps = []
    for smp in smps:
        formatted = format_url(smp)
        if formatted not in unique_smps:
            unique_smps.append(formatted)
    
    if len(unique_smps) > 0: s2 = unique_smps[0]
    if len(unique_smps) > 1: s3 = unique_smps[1]
    if len(unique_smps) > 2: s4 = unique_smps[2]

    # chobitプレビュー
    chobit_m = re.search(r'https?://chobit\.cc/(?:embed|share|player)?/([a-zA-Z0-9]+)/([a-zA-Z0-9]+)', html)
    if chobit_m:
        s5 = f"https://chobit.cc/embed/{chobit_m.group(1)}/{chobit_m.group(2)}"
    else:
        chobit_m2 = re.search(r'https?://chobit\.cc/([a-zA-Z0-9]+)', html)
        if chobit_m2: s5 = f"https://chobit.cc/{chobit_m2.group(1)}"

    return s1, s2, s3, s4, s5

def main():
    parser = argparse.ArgumentParser(description="GoogleスプレッドシートのDLsiteランキングをcontent_manager.xlsxに同期")
    parser.add_argument('--limit', type=int, default=10, help="同期する新規作品の最大件数（デフォルト: 10）")
    parser.add_argument('--date', type=str, default='latest', help="対象の取得日時（デフォルト: 'latest'）")
    parser.add_argument('--dry-run', action='store_true', help="実際の書き込みを行わずに対象作品のみ表示")
    args = parser.parse_args()

    print("📡 Googleスプレッドシートからランキングデータを取得中...")
    try:
        csv_raw = fetch_url_text(GOOGLE_SHEET_CSV_URL)
    except Exception as e:
        print(f"❌ スプレッドシートの取得に失敗しました: {e}")
        sys.exit(1)

    reader = csv.DictReader(io.StringIO(csv_raw))
    all_rows = list(reader)
    if not all_rows:
        print("❌ スプレッドシート内にデータが見つかりませんでした。")
        sys.exit(1)

    # 日時一覧と対象日時の決定
    dates = sorted(list(set(r['取得日時'] for r in all_rows if r.get('取得日時'))))
    target_date = dates[-1] if args.date == 'latest' else args.date
    print(f"📅 対象の取得日時: {target_date} （全記録日付数: {len(dates)}件）")

    # 対象日のランキング行を抽出
    ranking_rows = [r for r in all_rows if r.get('取得日時') == target_date]
    print(f"📊 対象日のランキングデータ: {len(ranking_rows)} 件")

    if not os.path.exists(EXCEL_PATH):
        print(f"❌ {EXCEL_PATH} が見つかりません。")
        sys.exit(1)

    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb.active

    # 既存の登録済み作品（タイトルおよび商品ID）を収集して重複防止
    existing_titles = set()
    existing_ids = set()
    max_art_num = 0

    def extract_core_title(t):
        if not t: return ''
        m = re.search(r'『([^』]+)』', str(t))
        if m:
            t = m.group(1)
        t = re.sub(r'【[^】]+】|\[[^\]]+\]', '', t)
        t = re.sub(r'徹底レビュー.*', '', t)
        return re.sub(r'[\s\-_/|♡♪★☆~～]', '', t).lower()

    existing_cleaned_titles = set()

    for r in range(4, ws.max_row + 1):
        art_id = ws.cell(row=r, column=17).value
        p_id = ws.cell(row=r, column=12).value
        title = ws.cell(row=r, column=4).value
        if title:
            existing_titles.add(str(title).strip())
            core = extract_core_title(title)
            if core: existing_cleaned_titles.add(core)
        if p_id:
            existing_ids.add(str(p_id).strip().upper())
        if art_id and str(art_id).startswith('ART-'):
            try:
                num = int(str(art_id).split('-')[1])
                if num > max_art_num: max_art_num = num
            except:
                pass

    print(f"📂 既存シート内の登録件数: {len(existing_titles)} 件 (商品ID: {len(existing_ids)}件, 最新記事ID: ART-{max_art_num:04d})")

    # 新規候補の抽出
    new_candidates = []
    for row in ranking_rows:
        w_title = row.get('作品名', '').strip()
        if not w_title: continue
        
        c_title = extract_core_title(w_title)
        is_duplicate = False
        for ex_c in existing_cleaned_titles:
            if c_title and ex_c and len(c_title) >= 4 and len(ex_c) >= 4:
                if c_title in ex_c or ex_c in c_title:
                    is_duplicate = True
                    break
        
        if not is_duplicate:
            new_candidates.append(row)
            if len(new_candidates) >= args.limit:
                break

    print(f"\n✨ 未登録の新規候補作品: {len(new_candidates)} 件")
    for i, cand in enumerate(new_candidates, 1):
        print(f"  {i}. [順位: {cand.get('順位')}位] {cand.get('作品名')[:35]} (サークル: {cand.get('サークル名/クリエイター名')}, 販売数: {cand.get('販売数')})")

    if not new_candidates:
        print("🎉 すべての候補作品は既に content_manager.xlsx に登録済みです！")
        return

    if args.dry_run:
        print("\n🔎 dry-run モードのため、Excelへの書き込みはスキップしました。")
        return

    # Excelへの書き込みと詳細情報自動取得
    print("\n🚀 DLsite公式情報を調査して content_manager.xlsx に追記中...")
    added_count = 0
    current_art_num = max_art_num

    for cand in new_candidates:
        w_title = cand.get('作品名', '').strip()
        rank = cand.get('順位', '')
        sales_cnt = cand.get('販売数', '')
        
        print(f"\n🔍 調査中 [{rank}位]: {w_title[:30]}")
        rj_code, p_data = search_dlsite_by_title(w_title)
        
        if not rj_code:
            print(f"  ⚠️ DLsiteでRJ番号を特定できませんでした。タイトル情報のみで登録します。")
            rj_code = ''
            p_data = {}
        else:
            if rj_code.upper() in existing_ids:
                print(f"  ⏭️ 商品ID [{rj_code}] は既にシートに登録済みのためスキップします。")
                continue
            print(f"  🎯 商品特定: [{rj_code}] {p_data.get('work_name', '')[:30]}")
            existing_ids.add(rj_code.upper())

        current_art_num += 1
        new_row_idx = ws.max_row + 1

        # 詳細情報の整形
        official_title = p_data.get('work_name') or w_title
        maker = p_data.get('maker_name') or cand.get('サークル名/クリエイター名') or ''
        category = p_data.get('work_type_string') or cand.get('作品形式/ジャンル') or '同人'
        
        # 価格
        price_val = p_data.get('price')
        sales_price_val = p_data.get('sales_price')
        price_str = f"{price_val:,}円" if price_val else cand.get('価格(税込)', '')
        if price_val and sales_price_val:
            disc_pct = round((1 - sales_price_val / price_val) * 100)
            price_str = f"{sales_price_val:,}円 ({disc_pct}% OFF)"
        elif cand.get('割引/セール'):
            price_str = f"{price_str} ({cand.get('割引/セール')})"

        # 画像・素材
        s1, s2, s3, s4, s5 = '', '', '', '', ''
        if rj_code:
            s1, s2, s3, s4, s5 = fetch_product_assets(rj_code)

        # 見どころメモ（公式あらすじ＋スプレッドシートのランキング実績）
        intro = p_data.get('intro_s') or ''
        ranking_memo = f"【実績】{target_date} デイリー{rank}位（販売数: {sales_cnt}本）。{intro}"

        official_url = f"https://www.dlsite.com/maniax/work/=/product_id/{rj_code}.html" if rj_code else ''

        # 各列への書き込み（全17列レイアウト）
        ws.cell(row=new_row_idx, column=1, value='未')
        ws.cell(row=new_row_idx, column=2, value='調査完了')
        ws.cell(row=new_row_idx, column=3, value='DLsite')
        ws.cell(row=new_row_idx, column=4, value=official_title)
        ws.cell(row=new_row_idx, column=5, value=official_url)
        # ★ 6列目: アフィリエイトURL（手動記載用・空欄維持）
        ws.cell(row=new_row_idx, column=6, value=None)
        ws.cell(row=new_row_idx, column=7, value=s1)
        ws.cell(row=new_row_idx, column=8, value=s2)
        ws.cell(row=new_row_idx, column=9, value=s3)
        ws.cell(row=new_row_idx, column=10, value=s4)
        ws.cell(row=new_row_idx, column=11, value=s5)
        ws.cell(row=new_row_idx, column=12, value=rj_code)
        ws.cell(row=new_row_idx, column=13, value=maker)
        ws.cell(row=new_row_idx, column=14, value=category)
        ws.cell(row=new_row_idx, column=15, value=price_str)
        ws.cell(row=new_row_idx, column=16, value=ranking_memo.strip())
        ws.cell(row=new_row_idx, column=17, value=f"ART-{current_art_num:04d}")

        # スタイル適用
        for c in range(1, 18):
            cell = ws.cell(row=new_row_idx, column=c)
            cell.font = font_data
            cell.border = thin_border
            if c in [1, 2, 3, 12, 17]:
                cell.alignment = align_center
            else:
                cell.alignment = align_left

        print(f"  ✅ 行 {new_row_idx} に登録完了: [{rj_code}] {official_title[:30]}")
        added_count += 1

    # 1行目のカウンター・数式更新やオートフィルター設定
    ws.auto_filter.ref = f"A3:Q{ws.max_row}"
    wb.save(EXCEL_PATH)
    print(f"\n🎉 合計 {added_count} 件のランキング上位作品を content_manager.xlsx に追加しました！")

    # CSV同期
    with open(CSV_PATH, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        for r in range(3, ws.max_row + 1):
            writer.writerow([ws.cell(row=r, column=c).value or '' for c in range(1, 18)])

    print(f"🎉 {CSV_PATH} も同期完了しました！")

if __name__ == '__main__':
    main()
