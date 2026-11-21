/**
 * AnswerForU mobile 3.7.1 — tester item 5 (duplicated step content) and item 6
 * (numbers under «الإجراءات المطلوبة» / «التحذيرات»).
 *
 * Before: the open step rendered seven published datasets one after another.
 * In Arabic «دليل الخطوة» and «شرح إضافي» printed the same guide twice, the
 * warnings came twice («تحذيرات» + «تحذيرات إضافية»), the actions repeated
 * the checklist, and in English/Spanish the Arabic original was shown as
 * "Detailed guidance". This model returns each fact once, in the user's language:
 *   points   → «دليل الخطوة»: short broad points (editorial actions that the
 *              checklist does not already say), at most 4 (6 without a checklist)
 *   warnings → «التحذيرات»: authored + Arabic extra warnings merged, at most 3
 *   details  → «الشرح الإضافي»: the full guide text, video note, cost, effort
 * The checklist itself is «الإجراءات المطلوبة» on the screen.
 */
import { dedupeTexts } from './contentDedupe.mjs';

export const STEP_GUIDE_KEYS = Object.freeze({
  guides: 'roadmap-guides',
  guideLocales: 'roadmap-guide-locales',
  actions: 'roadmap-actions',
  warningsLocales: 'roadmap-warnings-locales',
  warningsAr: 'roadmap-warnings-ar',
  costs: 'roadmap-costs',
  effort: 'roadmap-effort',
});

const pick = (value, lang) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) return String(value[lang] ?? (lang === 'ar' ? '' : value.en) ?? '');
  return '';
};
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const list = (value) => (Array.isArray(value) ? value : []);

function localizedGuide(stepId, lang, guides, guideLocales) {
  const locale = guideLocales?.[stepId];
  if (locale && typeof locale === 'object' && locale[lang]) return locale[lang];
  // The Arabic editorial original is only ever shown to Arabic readers.
  if (lang === 'ar' && guides?.[stepId]) return guides[stepId];
  return null;
}

export function effortLabel(effort, lang) {
  const min = Number(effort?.prepMinutesMin);
  const max = Number(effort?.prepMinutesMax);
  if (!Number.isFinite(min) || min <= 0) return '';
  const top = Number.isFinite(max) && max > min ? max : min;
  const hours = top > 180 && min % 60 === 0 && top % 60 === 0;
  const unit = hours ? (lang === 'ar' ? 'ساعات' : lang === 'es' ? 'horas' : 'hours') : (lang === 'ar' ? 'دقيقة' : 'min');
  const a = hours ? min / 60 : min;
  const b = hours ? top / 60 : top;
  const range = b > a ? `${a}–${b} ${unit}` : `${a} ${unit}`;
  return lang === 'ar' ? `وقت التحضير التقريبي: ${range}` : lang === 'es' ? `Preparación aproximada: ${range}` : `Approximate prep time: ${range}`;
}

export function stepGuideModel({ stepId, stageId, lang = 'ar', checklistLabels = [], data = {} } = {}) {
  const l = lang === 'es' ? 'es' : lang === 'en' ? 'en' : 'ar';
  const labels = list(checklistLabels).map(clean).filter(Boolean);
  const guide = localizedGuide(stepId, l, data.guides, data.guideLocales);
  const actions = list(data.actions?.[stepId]).map((entry) => clean(pick(entry?.label || entry?.title || entry, l))).filter(Boolean);
  const points = dedupeTexts(actions, labels).slice(0, labels.length ? 4 : 6);

  const localeWarnings = list(data.warningsLocales?.[stepId]?.[l]);
  const arabicExtra = l === 'ar' ? list(data.warningsAr?.steps?.[stepId]).concat(list(data.warningsAr?.steps?.[stepId]).length ? [] : list(data.warningsAr?.stages?.[stageId])) : [];
  const warnings = dedupeTexts([...localeWarnings, ...arabicExtra].map((w) => clean(pick(w, l))).filter(Boolean), [...labels, ...points], 0.75).slice(0, 3);

  const paragraphs = String(guide?.text || '').split(/\n+/).map(clean).filter(Boolean);
  const details = {
    title: clean(guide?.title || ''),
    paragraphs,
    video: clean(guide?.video || ''),
    cost: clean(pick(data.costs?.[stepId], l)),
    effort: effortLabel(data.effort?.[stepId], l),
  };
  const hasDetails = Boolean(details.paragraphs.length || details.video || details.cost || details.effort);
  return { points, warnings, details, hasDetails };
}
