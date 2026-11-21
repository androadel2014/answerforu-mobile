/**
 * AnswerForU mobile 3.7.1 (tester item 8): the Survival English sheet as Excel or Word —
 * the same columns as the website download (English, Arabic pronunciation, meaning, reply,
 * level, mastered).
 */
import { formatDisplayDate, todayISO } from './dates.mjs';

const tr = (lang, ar, en, es) => (lang === 'ar' ? ar : lang === 'es' ? es : en);
const TIERS = { 1: ['أول يوم', 'First day', 'Primer día'], 2: ['أول شهر', 'First month', 'Primer mes'], 3: ['أول 3 شهور', 'First 3 months', 'Primeros 3 meses'] };

export function survivalSheetModel({ pack, phrases = [], mastered = [], lang = 'ar', date = new Date() } = {}) {
  const l = lang === 'es' ? 'es' : lang === 'en' ? 'en' : 'ar';
  const learned = new Set((mastered || []).map(String));
  const packName = pack ? String(pack[l] || pack.en || pack.ar || '') : '';
  const title0 = tr(l, 'إنجليزي أول شهور', 'Survival English', 'Inglés para los primeros meses');
  const rows = (phrases || []).map((p, i) => ({
    number: i + 1,
    en: String(p?.en || ''),
    pron: String(p?.pron_ar || ''),
    meaning: String(p?.meaning_ar || ''),
    reply: String(p?.reply_ar || p?.reply_en || ''),
    level: TIERS[p?.tier] ? tr(l, ...TIERS[p.tier]) : '',
    mastered: learned.has(String(p?.id)),
  }));
  const iso = date instanceof Date && !Number.isNaN(date.getTime()) ? todayISO(date) : todayISO();
  return {
    lang: l,
    title: packName ? `${packName} — ${title0}` : title0,
    dateLabel: formatDisplayDate(iso, l),
    masteredCount: rows.filter((r) => r.mastered).length,
    rows,
    labels: {
      english: tr(l, 'الجملة بالإنجليزي', 'English phrase', 'Frase en inglés'),
      pron: tr(l, 'النطق', 'Pronunciation', 'Pronunciación'),
      meaning: tr(l, 'المعنى', 'Meaning', 'Significado'),
      reply: tr(l, 'الرد', 'Reply', 'Respuesta'),
      level: tr(l, 'المرحلة', 'When', 'Etapa'),
      mastered: tr(l, 'اتعلمتها', 'Learned', 'Aprendida'),
      yes: '✓',
      date: tr(l, 'تاريخ الملف', 'Date', 'Fecha'),
      phrases: tr(l, 'عدد الجمل', 'Phrases', 'Frases'),
    },
  };
}

export function survivalWorkbook(model) {
  const L = model.labels;
  const rows = [
    [{ v: model.title, s: 'title' }],
    [{ v: `${L.date}: ${model.dateLabel} · ${L.phrases}: ${model.rows.length} · ${L.mastered}: ${model.masteredCount}`, s: 'muted' }],
    [],
    ['#', L.english, L.pron, L.meaning, L.reply, L.level, L.mastered].map((v) => ({ v, s: 'header' })),
    ...model.rows.map((r) => [{ v: r.number, s: 'int' }, r.en, r.pron, r.meaning, r.reply, r.level, { v: r.mastered ? L.yes : '', s: r.mastered ? 'done' : 'center' }]),
  ];
  return { title: model.title, sheets: [{ name: model.title, rtl: model.lang === 'ar', rows, freezeRows: 4, autoFilterRow: 4, merges: ['A1:G1', 'A2:G2'], columns: [{ width: 5 }, { width: 38 }, { width: 30 }, { width: 30 }, { width: 46 }, { width: 14 }, { width: 10 }] }] };
}

export function survivalDocument(model) {
  const L = model.labels;
  return {
    title: model.title,
    lang: model.lang,
    landscape: true,
    blocks: [
      { type: 'title', text: model.title },
      { type: 'meta', text: `${L.date}: ${model.dateLabel} · ${L.phrases}: ${model.rows.length} · ${L.mastered}: ${model.masteredCount}` },
      { type: 'table', headers: ['#', L.english, L.pron, L.meaning, L.reply, L.mastered], widths: [0.5, 3.2, 2.6, 2.6, 3.6, 0.9],
        rows: model.rows.map((r) => [String(r.number), { text: r.en, bold: true }, r.pron, r.meaning, r.reply, { text: r.mastered ? L.yes : '', tone: r.mastered ? 'done' : undefined }]) },
    ],
  };
}
