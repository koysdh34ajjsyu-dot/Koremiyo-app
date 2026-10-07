import csv, openpyxl, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

excel_path = 'd:/AIproject/DMMaffireight/content_manager.xlsx'
csv_path = 'd:/AIproject/DMMaffireight/content_manager.csv'

def extract_tag_info(val):
    if not val or not isinstance(val, str):
        return None, None, None
    val_str = val.strip()
    aff_url = None
    img_url = None
    workno = None

    # href
    m_href = re.search(r'href=["\']([^"\']+)["\']', val_str, re.I)
    if m_href:
        aff_url = m_href.group(1).strip()
        if aff_url.startswith('//'):
            aff_url = 'https:' + aff_url
    elif val_str.startswith('http') and ('dlaf.jp' in val_str or 'aid=' in val_str or 'al.dmm.co.jp' in val_str):
        aff_url = val_str

    # src (img or iframe)
    m_src = re.search(r'src=["\']([^"\']+)["\']', val_str, re.I)
    if m_src:
        img_url = m_src.group(1).strip()
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
    elif (val_str.startswith('http') or val_str.startswith('//')) and any(ext in val_str.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.mp4']):
        img_url = 'https:' + val_str if val_str.startswith('//') else val_str

    # workno
    m_rj = re.search(r'([R|V]J\d{6,8})', val_str, re.I)
    if m_rj:
        workno = m_rj.group(1).upper()

    return aff_url, img_url, workno

def main():
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found")
        return

    with open(csv_path, mode='r', encoding='utf-8-sig', errors='ignore') as f:
        rows = list(csv.reader(f))

    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active

    updated_count = 0
    parsed_items = []

    for i, r in enumerate(rows):
        if i == 0:
            continue
        # r: 0:作業フラグ, 1:ステータス, 2:サイト, 3:タイトル, 4:公式URL, 5:アフィURL, 6:素材1, 7:素材2, 8:素材3, 9:素材4, 10:素材5, 11:商品ID, ...
        aff_found = r[5].strip() if len(r) > 5 else ''
        extracted_materials = []

        # 素材1〜5 (Cols 6..10 in 0-indexed list)
        for c_idx in range(6, min(len(r), 11)):
            cell_val = r[c_idx].strip()
            if cell_val:
                aff, img, rj = extract_tag_info(cell_val)
                if aff and not aff_found:
                    aff_found = aff
                if img:
                    r[c_idx] = img
                elif aff and not img:
                    # テキストリンクタグの場合は画像URLがないので空に
                    r[c_idx] = ''

        if aff_found:
            r[5] = aff_found
            if r[1] == '調査完了':
                r[1] = 'アフィリエイト連携済'
            excel_row = i + 3 # row index in openpyxl (header is 3)
            # Update Excel worksheet
            ws.cell(row=excel_row, column=2, value=r[1])
            ws.cell(row=excel_row, column=6, value=r[5])
            for c in range(6, 11):
                ws.cell(row=excel_row, column=c+1, value=r[c])
            updated_count += 1
            parsed_items.append((r[11], r[3], r[5], [r[c] for c in range(6, 11) if r[c]]))

    # Save CSV
    with open(csv_path, mode='w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    wb.save(excel_path)
    print(f"🎉 {updated_count} 件の作品のアフィリエイト素材タグを正常に解析・反映しました！")
    for rj, title, aff, mats in parsed_items:
        print(f"  ✨ [{rj}] {title[:30]}")
        print(f"     Affiliate: {aff}")
        print(f"     Materials: {len(mats)} 件の画像・メディアURL")

if __name__ == '__main__':
    main()
