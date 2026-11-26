// Shared with the website (AnswerForU v6.4.2): keep both copies identical in behaviour.
/**
 * AnswerForU v6.4.2 (tester item 16) — one password policy for the whole site.
 * Owner decision: minimum 8 characters, a show/hide button and a strength meter.
 * The PHP API enforces the same minimum (AFU_PASSWORD_MIN_LENGTH in
 * public/api/password-change.php) and the same short list of the most common
 * passwords, so the browser and the server always agree.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 4096;

// The most used passwords that satisfy an 8-character minimum (lower-cased).
export const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', '12345678910', '87654321', '11111111', '00000000', '88888888', '99999999', '12121212',
  '11223344', '123123123', '1q2w3e4r', '1qaz2wsx', 'qwertyui', 'qwerty123', 'qwertyuiop', 'asdfghjk', 'asdfghjkl', 'zxcvbnm1',
  'password', 'password1', 'password12', 'password123', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'iloveyou', 'iloveyou1', 'sunshine',
  'princess', 'football', 'baseball', 'welcome1', 'welcome123', 'abc12345', 'abcd1234', 'abcdefgh', 'admin123', 'administrator',
  'letmein1', 'monkey123', 'dragon123', 'trustno1', 'superman', 'starwars', 'whatever', 'computer', 'internet', 'answerforu',
  'answerforu1', 'answerforu123', 'america1', 'america123', 'egypt123', 'cairo123', 'mohamed1', 'mohamed123', 'ahmed123', 'qwer1234',
]);

/**
 * v6.4.3 / app 3.7.2 (end-to-end check of the 8-character rule): count the way the
 * server does. PHP counts characters with mb_strlen (Unicode code points) and caps
 * the size in UTF-8 bytes; JavaScript's .length counts UTF-16 units, so a password
 * with an emoji could pass here and then be refused by the server.
 */
export function passwordLength(password) {
  return Array.from(String(password || '')).length;
}

export function passwordBytes(password) {
  let bytes = 0;
  for (const ch of String(password || '')) {
    const cp = ch.codePointAt(0);
    bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
  }
  return bytes;
}

export function isCommonPassword(password) {
  return COMMON_PASSWORDS.has(String(password || '').toLowerCase());
}

/**
 * @returns {{ ok:boolean, reason:''|'short'|'long'|'common'|'personal' }}
 * Personal = the whole password equals the email name or username.
 */
export function validatePassword(password, context = {}) {
  const value = String(password || '');
  if (passwordLength(value) < PASSWORD_MIN_LENGTH) return { ok: false, reason: 'short' };
  if (passwordBytes(value) > PASSWORD_MAX_LENGTH) return { ok: false, reason: 'long' };
  if (isCommonPassword(value)) return { ok: false, reason: 'common' };
  const lower = value.toLowerCase();
  const personal = [context.username, String(context.email || '').split('@')[0]].map((x) => String(x || '').toLowerCase()).filter((x) => x.length >= 4);
  if (personal.includes(lower)) return { ok: false, reason: 'personal' };
  return { ok: true, reason: '' };
}

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
function hasSequence(lower) {
  for (const seq of SEQUENCES) {
    for (let i = 0; i + 4 <= seq.length; i += 1) {
      const part = seq.slice(i, i + 4);
      if (lower.includes(part) || lower.includes([...part].reverse().join(''))) return true;
    }
  }
  return false;
}

/**
 * Strength 0–4 for the meter. Length counts most; variety, repeats and
 * keyboard sequences adjust it. Too short / common / personal is always 0.
 */
export function passwordStrength(password, context = {}) {
  const value = String(password || '');
  if (!value) return { score: 0, level: 'empty' };
  const validity = validatePassword(value, context);
  if (!validity.ok) return { score: 0, level: validity.reason === 'short' ? 'short' : 'weak', reason: validity.reason };
  const lower = value.toLowerCase();
  let points = 0;
  const length = passwordLength(value);
  if (length >= 8) points += 1;
  if (length >= 12) points += 1;
  if (length >= 16) points += 1;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length + (/[^\x00-\x7F]/.test(value) ? 1 : 0);
  if (classes >= 3) points += 1;
  if (classes >= 4 || (classes >= 3 && length >= 12)) points += 1;
  if (/(.)\1{2,}/.test(value)) points -= 1;
  if (hasSequence(lower)) points -= 1;
  if (new Set(value).size <= 4) points -= 1;
  const score = Math.max(1, Math.min(4, points));
  return { score, level: ['weak', 'weak', 'fair', 'good', 'strong'][score] };
}
