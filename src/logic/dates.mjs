/**
 * AnswerForU mobile 3.7.1 (same helpers as website v6.4.2) — calendar picker (tester item 1)
 * and automatic age from date of birth (item 15). Dates are plain ISO strings
 * (YYYY-MM-DD) in local calendar terms: no time zones, no off-by-one days.
 */
const pad = (n) => String(n).padStart(2, '0');

export function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const [y, m, d] = value.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m - 1);
}

export function parseISODate(value) {
  if (!isValidISODate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return { year, month: month - 1, day };
}

export const toISODate = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** 0 = Sunday … 6 = Saturday, for the first day of the month. */
export function firstWeekday(year, month) {
  return new Date(Date.UTC(year, month, 1)).getUTCDay();
}

export function addMonths({ year, month }, delta) {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function todayISO(now = new Date()) {
  return toISODate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function compareISO(a, b) {
  if (!a || !b) return 0;
  return a < b ? -1 : a > b ? 1 : 0;
}

export function clampISO(value, min, max) {
  if (min && compareISO(value, min) < 0) return min;
  if (max && compareISO(value, max) > 0) return max;
  return value;
}

/** Whole years between a birth date and `on` (default today). */
export function ageOn(birthISO, onISO = todayISO()) {
  const b = parseISODate(birthISO);
  const t = parseISODate(onISO);
  if (!b || !t) return null;
  let age = t.year - b.year;
  if (t.month < b.month || (t.month === b.month && t.day < b.day)) age -= 1;
  return age >= 0 ? age : null;
}

/** Calendar grid of 42 cells; `null` for padding cells. */
export function monthGrid(year, month) {
  const lead = firstWeekday(year, month);
  const count = daysInMonth(year, month);
  return Array.from({ length: 42 }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= count ? day : null;
  });
}

const langKey = (lang) => (String(lang || 'en').startsWith('ar') ? 'ar' : String(lang || 'en').startsWith('es') ? 'es' : 'en');
// Explicit names: Hermes on older Android builds ships partial Intl data, so the picker never depends on it.
const MONTHS = {
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};
const WEEKDAYS = {
  ar: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
};

export function monthNames(lang, style = 'long') {
  const list = MONTHS[langKey(lang)];
  return style === 'short' && langKey(lang) !== 'ar' ? list.map((m) => m.slice(0, 3)) : list.slice();
}

/** Sunday-first weekday labels (the U.S. week that agencies use). */
export function weekdayNames(lang) {
  return WEEKDAYS[langKey(lang)].slice();
}

export function formatDisplayDate(iso, lang) {
  const p = parseISODate(iso);
  if (!p) return '';
  const key = langKey(lang);
  const month = MONTHS[key][p.month];
  if (key === 'en') return `${month} ${p.day}, ${p.year}`;
  if (key === 'es') return `${p.day} de ${month} de ${p.year}`;
  return `${p.day} ${month} ${p.year}`;
}

export function formatDisplayMonth(year, month, lang) {
  const key = langKey(lang);
  return key === 'es' ? `${MONTHS.es[month]} de ${year}` : `${MONTHS[key][month]} ${year}`;
}

/** Calendar date `months` after an ISO date (end-of-month safe: Jan 31 + 1 month = Feb 28/29). */
export function addMonthsISO(iso, months) {
  const p = parseISODate(iso);
  if (!p) return '';
  const target = addMonths({ year: p.year, month: p.month }, months);
  return toISODate(target.year, target.month, Math.min(p.day, daysInMonth(target.year, target.month)));
}

/* ---------- CV month/year values (U.S. résumé format) ---------- */
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_WORDS = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
  aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
  ene: 0, enero: 0, febrero: 1, marzo: 2, abr: 3, abril: 3, mayo: 4, junio: 5, julio: 6, ago: 7, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, dic: 11, diciembre: 11,
  يناير: 0, فبراير: 1, مارس: 2, ابريل: 3, أبريل: 3, مايو: 4, يونيو: 5, يوليو: 6, اغسطس: 7, أغسطس: 7, سبتمبر: 8, اكتوبر: 9, أكتوبر: 9, نوفمبر: 10, ديسمبر: 11,
};
const PRESENT = /^(present|current|now|currently|actual|actualidad|presente|حتى الآن|حتى الان|حاليا|حاليًا|الآن|الان)$/i;

/** Parse legacy free-text CV dates: "Mar 2021", "03/2021", "2021-03", "2021", "Present". */
export function parseMonthYear(value) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  if (PRESENT.test(s)) return { present: true };
  let m = s.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m && +m[2] >= 1 && +m[2] <= 12) return { year: +m[1], month: +m[2] - 1 };
  m = s.match(/^(\d{1,2})\s*[/.-]\s*(\d{4})$/);
  if (m && +m[1] >= 1 && +m[1] <= 12) return { year: +m[2], month: +m[1] - 1 };
  m = s.match(/^([\p{L}.]+)\s*,?\s*(\d{4})$/u);
  if (m) {
    const key = m[1].toLowerCase().replace(/\.$/, '');
    if (key in MONTH_WORDS) return { year: +m[2], month: MONTH_WORDS[key] };
  }
  m = s.match(/^(\d{4})$/);
  if (m) return { year: +m[1], month: null };
  return null;
}

export function formatMonthYear(parsed) {
  if (!parsed) return '';
  if (parsed.present) return 'Present';
  if (parsed.month === null || parsed.month === undefined) return String(parsed.year);
  return `${EN_MONTHS[parsed.month]} ${parsed.year}`;
}
