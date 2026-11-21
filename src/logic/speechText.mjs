/**
 * AnswerForU mobile 3.7.1 — speech text preparation shared with website v6.4.2.
 * Tester items 2–3: the whole answer is spoken (never only the first answer or the
 * part before "/"), "/" between words is read as "or", and long text is spoken in
 * short chunks one after another (Android engines cut long utterances).
 */
export const SPEEDS = Object.freeze([1, 0.75, 0.5]);
export const safeSpeed = (value) => (SPEEDS.includes(Number(value)) ? Number(value) : 1);

const OR_WORD = { ar: ' أو ', en: ' or ', es: ' o ' };
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Turn display text into something every TTS engine reads completely. */
export function normalizeSpeechText(text, lang = 'en') {
  const base = String(lang || 'en').slice(0, 2).toLowerCase();
  const or = OR_WORD[base] || OR_WORD.en;
  let s = String(text ?? '');
  s = s.replace(/https?:\/\/\S+/gi, ' ');
  s = s.replace(EMOJI, ' ');
  // Bullets, middle dots and pipes join alternatives in the UI: speak a pause.
  s = s.replace(/\s*[·•|→←]+\s*/g, ', ');
  s = s.replace(/[*_`#>]+/g, ' ');
  // Slash between words (or word and number) = alternatives. Keep 06/12/2021, 24/7, 1/2.
  s = s.replace(/\band\/or\b/gi, 'and or');
  s = s.replace(/\b(km|mi|m|ft|lbs?|kg|g|oz)\/(h|hr|s|sec|min|in|ft|lb|gal)\b/gi, '$1 per $2');
  s = s.replace(/(?<=[\p{L}\p{M})'’])\s*\/\s*(?=[\p{L}\d(])/gu, or);
  s = s.replace(/(?<=\d)\s*\/\s*(?=\p{L})/gu, or);
  // Remaining slashes inside a token that also contains letters (W-2/1099) are alternatives;
  // purely numeric tokens (dates, fractions, 24/7) keep the slash.
  s = s.split(/(\s+)/).map((token) => (token.includes('/') && /\p{L}/u.test(token)
    ? token.split('/').filter(Boolean).join(or.trim() ? or : ' ')
    : token)).join('');
  s = s.replace(/\s*\/\s*$/u, '');
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/\s+([,.;:!?،؛؟])/g, '$1');
  s = s.replace(/([,،])(\s*[,،])+/g, '$1');
  s = s.replace(/^[\s,،;:]+|[\s,،;:]+$/g, '');
  return s.trim();
}

/** Split long text into sentence/clause chunks of at most `max` characters. */
export function chunkSpeechText(text, max = 180) {
  const source = String(text ?? '').trim();
  if (!source) return [];
  const out = [];
  const pushWords = (part) => {
    let line = '';
    for (const word of part.split(/\s+/)) {
      if (!word) continue;
      const next = line ? `${line} ${word}` : word;
      if (next.length <= max || !line) line = next;
      else { out.push(line); line = word; }
    }
    return line;
  };
  for (const sentence of source.split(/(?<=[.!?؟؛;])\s+|\n+/u)) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length <= max) { out.push(s); continue; }
    let buffer = '';
    for (const clause of s.split(/(?<=[,،:])\s+/u)) {
      const joined = buffer ? `${buffer} ${clause}` : clause;
      if (joined.length <= max) { buffer = joined; continue; }
      if (buffer) out.push(buffer);
      buffer = clause.length <= max ? clause : pushWords(clause);
    }
    if (buffer) out.push(buffer);
  }
  return out;
}


/** Speakable chunks for one or more display texts (answers joined with "or"). */
export function speechChunks(input, lang = 'en', max = 180) {
  const list = Array.isArray(input) ? input.map((x) => String(x ?? '').trim()).filter(Boolean) : [String(input ?? '')];
  const or = (OR_WORD[String(lang || 'en').slice(0, 2).toLowerCase()] || OR_WORD.en).trim();
  const joined = list.length > 1 ? list.join(` ${or} `) : (list[0] || '');
  return chunkSpeechText(normalizeSpeechText(joined, lang), max);
}
