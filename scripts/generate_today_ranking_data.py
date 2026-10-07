import sys, os, json, re, urllib.request, csv, datetime
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

HEADERS_REQ = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
}

today_str = datetime.datetime.now().strftime('%Y-%m-%d')
now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
output_csv_path = f'd:/AIproject/DMMaffireight/dlsite_ranking_{datetime.datetime.now().strftime("%Y%m%d")}.csv'
output_xlsx_path = f'd:/AIproject/DMMaffireight/dlsite_ranking_{datetime.datetime.now().strftime("%Y%m%d")}.xlsx'

print(f"📡 2026-09-23 本日のDLsite 24時間ランキング速報を取得中...")

# 1. ランキング一覧取得
ranking_url = 'https://www.dlsite.com/maniax/api/=/ranking.json?period=24h'
req = urllib.request.Request(ranking_url, headers=HEADERS_REQ)
with urllib.request.urlopen(req, timeout=15) as res:
    ranking_data = json.loads(res.read().decode('utf-8'))

print(f"✅ ランキングデータ取得完了: {len(ranking_data)} 件")

def format_url(u):
    if not u: return ''
    return f"https:{u}" if u.startswith('//') else u

records = []
for idx, item in enumerate(ranking_data[:20], 1):
    workno = item.get('workno') or item.get('product_id')
    raw_title = item.get('work_name', '').strip()
    raw_maker = item.get('maker_name', '').strip()
    disc_rate = item.get('discount_rate') or 0
    
    print(f"🔍 [{idx:02d}位] {workno}: {raw_title[:30]}")

    # 詳細API取得
    p = {}
    try:
        p_url = f"https://www.dlsite.com/maniax/api/=/product.json?workno={workno}"
        p_req = urllib.request.Request(p_url, headers=HEADERS_REQ)
        p_res = json.loads(urllib.request.urlopen(p_req, timeout=5).read())
        p = p_res[0] if p_res else {}
    except Exception as e:
        pass

    title = p.get('work_name') or raw_title
    maker = p.get('maker_name') or raw_maker
    category = p.get('work_type_string') or item.get('work_type_string') or '同人'
    
    price_val = p.get('price')
    sales_price_val = p.get('sales_price')
    
    price_str = f"¥{price_val:,}" if price_val else ''
    disc_str = f"{disc_rate}%OFF" if disc_rate > 0 else ''
    
    sales_date = (p.get('regist_date') or '').split(' ')[0]

    # 画像取得
    main_img = ''
    if item.get('image_main') and item['image_main'].get('url'):
        main_img = format_url(item['image_main']['url'])
    elif p.get('image_main') and p['image_main'].get('url'):
        main_img = format_url(p['image_main']['url'])

    samples = []
    if item.get('image_samples'):
        for smp in item['image_samples']:
            u = format_url(smp.get('url'))
            if u and u not in samples: samples.append(u)
    
    s1 = samples[0] if len(samples) > 0 else ''
    s2 = samples[1] if len(samples) > 1 else ''
    s3 = samples[2] if len(samples) > 2 else ''

    intro = p.get('intro_s') or ''
    official_url = f"https://www.dlsite.com/maniax/work/=/product_id/{workno}.html"
    affiliate_url = f"https://www.dlsite.com/maniax/dpro/=/product_id/{workno}.html/?aid=Koremiyoonline"

    records.append({
        '取得日時': now_str,
        '順位': idx,
        '作品名': title,
        'サークル名/クリエイター名': maker,
        '作品形式/ジャンル': category,
        '価格(税込)': price_str,
        '割引/セール': disc_str,
        '販売日': sales_date,
        '商品ID': workno,
        '公式商品URL': official_url,
        'アフィリエイトURL（参考例）': affiliate_url,
        'メイン画像URL': main_img,
        'サンプル画像1': s1,
        'サンプル画像2': s2,
        'サンプル画像3': s3,
        '見どころメモ（あらすじ）': intro
    })

# 1. CSVファイル作成（Googleスプレッドシート完全互換ヘッダー＋詳細情報）
csv_headers = [
    '取得日時', '順位', '作品名', 'サークル名/クリエイター名', '作品形式/ジャンル',
    '価格(税込)', '割引/セール', '販売日', '商品ID', '公式商品URL',
    'アフィリエイトURL（参考例）', 'メイン画像URL', 'サンプル画像1', 'サンプル画像2', 'サンプル画像3', '見どころメモ（あらすじ）'
]

with open(output_csv_path, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=csv_headers)
    writer.writeheader()
    for r in records:
        writer.writerow(r)

print(f"\n🎉 外部CSVデータを作成しました: {output_csv_path}")

# 2. Excelファイル作成（見やすいスタイル整形付き）
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "DLsite最新ランキング"
ws.views.sheetView[0].showGridLines = True

font_header = Font(name='Meiryo UI', size=10, bold=True, color='FFFFFF')
font_data = Font(name='Meiryo UI', size=9)
fill_header = PatternFill(start_color='1E293B', end_color='1E293B', fill_type='solid')
thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)
align_center = Alignment(horizontal='center', vertical='center')
align_left = Alignment(horizontal='left', vertical='center')

# ヘッダー
ws.row_dimensions[1].height = 28
for c, h in enumerate(csv_headers, 1):
    cell = ws.cell(row=1, column=c, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.border = thin_border
    cell.alignment = align_center

# データ行
for r_idx, r in enumerate(records, 2):
    ws.row_dimensions[r_idx].height = 22
    for c_idx, h in enumerate(csv_headers, 1):
        val = r[h]
        cell = ws.cell(row=r_idx, column=c_idx, value=val)
        cell.font = font_data
        cell.border = thin_border
        if h in ['取得日時', '順位', '販売日', '商品ID', '価格(税込)', '割引/セール']:
            cell.alignment = align_center
        else:
            cell.alignment = align_left

# 列幅調整
for col in ws.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = openpyxl.utils.get_column_letter(col[0].column)
    ws.column_dimensions[col_letter].width = min(max(max_len * 1.5, 12), 40)

ws.auto_filter.ref = f"A1:P{len(records) + 1}"
wb.save(output_xlsx_path)

print(f"🎉 外部Excelデータを作成しました: {output_xlsx_path}")
