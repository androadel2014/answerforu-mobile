// Shared rule with the website (source-original/src/features/learn/lib/currencySources.js, v6.4.3):
// keep both copies identical in behaviour.
// AnswerForU mobile 3.7.2 — currency photos are only ever loaded from AnswerForU (the copy stored by
// the admin or the copy bundled in the website release). usmint.gov / uscurrency.gov refuse servers,
// can hang outside the U.S. and change addresses, so they stay links, never image sources.
const GOVERNMENT_PHOTO_HOST = /(^|\.)(usmint|uscurrency)\.gov$/i;

/** The address itself when the app may load it as a currency photo, otherwise "". */
export function hostedCurrencyPhoto(url) {
  if (typeof url !== 'string') return '';
  const value = url.trim();
  if (!value) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith('//')) return value;
  try {
    const parsed = new URL(value, 'https://answerforu.com');
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    return GOVERNMENT_PHOTO_HOST.test(parsed.hostname) ? '' : value;
  } catch {
    return '';
  }
}
