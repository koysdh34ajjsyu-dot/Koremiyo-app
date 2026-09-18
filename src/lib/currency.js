// 通貨換算ユーティリティ (JPY ⇄ USD)

// デフォルト為替レート (1 USD ≒ 150 JPY)
const DEFAULT_JPY_PER_USD = 150;

/**
 * 日本円の価格文字列または数値から数値を抽出
 * @param {string|number} priceInput
 * @returns {number|null}
 */
export function parseJpyPrice(priceInput) {
  if (typeof priceInput === 'number') {
    return isNaN(priceInput) ? null : priceInput;
  }
  if (!priceInput || typeof priceInput !== 'string') {
    return null;
  }
  // カンマや円マーク、余計な文字を除去して数値を抽出
  const cleaned = priceInput.replace(/,/g, '').match(/\d+/);
  if (!cleaned) return null;
  const num = parseInt(cleaned[0], 10);
  return isNaN(num) ? null : num;
}

/**
 * 日本円を米ドル(USD)に換算
 * @param {number} jpyAmount
 * @param {number} rate
 * @returns {string} (例: "9.99")
 */
export function convertJpyToUsd(jpyAmount, rate = DEFAULT_JPY_PER_USD) {
  if (!jpyAmount || jpyAmount <= 0) return '0.00';
  const usd = jpyAmount / rate;
  return usd.toFixed(2);
}

/**
 * 言語に応じた価格フォーマット（英語時はUSD概算を併記）
 * @param {string|number} priceInput
 * @param {'ja'|'en'} lang
 * @returns {string}
 *   例 (ja): "¥1,320"
 *   例 (en): "¥1,320 (~$8.80 USD)"
 */
export function formatPriceWithCurrency(priceInput, lang = 'ja') {
  const num = parseJpyPrice(priceInput);
  if (num === null) {
    return typeof priceInput === 'string' ? priceInput : '';
  }

  const formattedJpy = `¥${num.toLocaleString('ja-JP')}`;

  if (lang === 'en') {
    const usd = convertJpyToUsd(num);
    return `${formattedJpy} (~$${usd} USD)`;
  }

  return formattedJpy;
}
