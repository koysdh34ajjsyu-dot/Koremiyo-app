const fs = require('fs');
let c = fs.readFileSync('src/app/page.js', 'utf8');

// Normalize line endings for matching
const normalized = c.replace(/\r\n/g, '\n');

const OLD_HEADER = `// ============================================================\n// 公開ランキングページ（エンドユーザー向け）\n// ============================================================\nfunction RankedProductsPage() {`;

const NEW_HEADER = `// ============================================================\n// DLsiteランキングバナー（iframeで隔離）\n// ============================================================\nfunction DlsiteRankingBanner() {\n  const iframeRef = useRef(null);\n\n  const dlsiteScript = \`\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <base target="_blank">\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { background: transparent; overflow-x: hidden; }\n  </style>\n</head>\n<body>\n  <script type="text/javascript">\n    blogparts = {\n      "base": "https://www.dlsite.com/",\n      "type": "ranking",\n      "site": "maniax",\n      "query": { "period": "24h" },\n      "title": "同人ランキング",\n      "display": "vertical",\n      "detail": "1",\n      "column": "h",\n      "image": "large",\n      "count": "10",\n      "wrapper": "1",\n      "autorotate": true,\n      "aid": "Koremiyoonline"\n    };\n  <\\/script>\n  <script type="text/javascript" src="https://www.dlsite.com/js/blogparts.js" charset="UTF-8"><\\/script>\n</body>\n</html>\n\`;\n\n  return (\n    <iframe\n      ref={iframeRef}\n      srcDoc={dlsiteScript}\n      style={{\n        width: '100%',\n        minHeight: '1200px',\n        border: 'none',\n        display: 'block',\n      }}\n      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"\n      title="DLsiteランキング"\n      loading="lazy"\n    />\n  );\n}\n\n// ============================================================\n// 公開ランキングページ（エンドユーザー向け）\n// ============================================================\nfunction RankedProductsPage() {`;

if (normalized.includes(OLD_HEADER)) {
  const result = normalized.replace(OLD_HEADER, NEW_HEADER);
  fs.writeFileSync('src/app/page.js', result, 'utf8');
  console.log('SUCCESS: DlsiteRankingBanner added');
} else {
  console.error('FAIL: Header not found');
  // Output what we actually have around that area
  const idx = normalized.indexOf('公開ランキングページ');
  console.log('Surrounding:', JSON.stringify(normalized.slice(idx - 100, idx + 300)));
}
