// Shared with the website (AnswerForU v6.4.2): keep both copies identical in behaviour.
/**
 * AnswerForU v6.4.2 (tester item 5): the same information was repeated in the
 * step guide, the checklist, the "avoid these mistakes" box and the long
 * guide. These helpers compare short texts by meaning-bearing words (Arabic
 * normalized, English/Spanish lower-cased and lightly stemmed) so each fact is
 * shown once, in the section where it belongs.
 */
const AR_DIACRITICS = /[ً-ٰٟۖ-ۭـ]/g;
const STOP = new Set([
  // Arabic (normalized forms)
  'في','من','علي','الي','عن','مع','او','ثم','قبل','بعد','عند','كل','اي','هذا','هذه','ذلك','التي','الذي','ان','لا','ما','لو','لان','حتي','كده','ده','دي','اللي','عشان','مش','هو','هي','انت','لازم','تكون','يكون','مثل','بين','غير','لكل','فقط','بس','كمان','علشان','وقت',
  // English
  'the','a','an','and','or','of','to','in','on','for','with','your','you','is','are','be','by','at','as','it','this','that','from','before','after','all','each','any','not','do','don','t','if','into','than','then','only','also',
  // Spanish
  'el','la','los','las','un','una','y','o','de','del','en','con','por','para','su','sus','que','es','al','lo','se','no','antes','despues',
]);

export function normalizeForCompare(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(AR_DIACRITICS, '')
    .replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[ؤئ]/g, 'ء')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stem(word) {
  let w = word;
  if (/^[؀-ۿ]+$/.test(w)) {
    w = w.replace(/^(وال|بال|كال|فال|لل|ال)/, '');
    if (w.length >= 4) w = w.replace(/^[وفبلك](?=[\u0600-\u06FF]{3})/, '');
    if (w.length > 4) w = w.replace(/(ات|ين|ون|ها|هم|كم|ية|يه|تين)$/, '');
    if (w.length > 3) w = w.replace(/[هي]$/, '');
    return w;
  }
  if (w.length > 5) w = w.replace(/(ations|ation|ments|ment|ings|ing|edly|ed|es|s)$/, '');
  return w;
}

// Small domain synonym map so "keep the originals in the carry-on" and
// "put critical documents in the hand bag" are recognised as the same fact.
const SYNONYMS = new Map([
  ['ورق', 'doc'], ['اوراق', 'doc'], ['مستند', 'doc'], ['مستندات', 'doc'], ['وثاءق', 'doc'], ['وثيق', 'doc'], ['document', 'doc'], ['documento', 'doc'],
  ['احتفظ', 'keep'], ['ضع', 'keep'], ['حط', 'keep'], ['خلي', 'keep'], ['keep', 'keep'], ['put', 'keep'], ['store', 'keep'], ['guard', 'keep'],
  ['حقيب', 'bag'], ['شنط', 'bag'], ['carry', 'bag'], ['bag', 'bag'], ['equipaje', 'bag'],
  ['راجع', 'check'], ['تحقق', 'check'], ['تاكد', 'check'], ['check', 'check'], ['verify', 'check'], ['confirm', 'check'], ['comprueb', 'check'], ['verifiqu', 'check'],
  ['هاتف', 'phone'], ['موبايل', 'phone'], ['phone', 'phone'],
  ['صور', 'photo'], ['photo', 'photo'],
]);

export function keyTerms(text) {
  const words = normalizeForCompare(text).split(' ').filter(Boolean);
  const out = new Set();
  for (const word of words) {
    if (STOP.has(word) || word.length < 2) continue;
    const s = stem(word);
    if (s.length >= 2 && !STOP.has(s)) out.add(SYNONYMS.get(s) || SYNONYMS.get(word) || s);
  }
  return out;
}

/** Overlap of the smaller text's key terms that also appear in the other (0..1). */
export function similarity(a, b) {
  const A = a instanceof Set ? a : keyTerms(a);
  const B = b instanceof Set ? b : keyTerms(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const term of A) if (B.has(term)) shared += 1;
  return shared / Math.min(A.size, B.size);
}

export const DUPLICATE_THRESHOLD = 0.6;

export function isNearDuplicate(a, b, threshold = DUPLICATE_THRESHOLD) {
  const A = keyTerms(a); const B = keyTerms(b);
  const smaller = Math.min(A.size, B.size);
  if (smaller < 2) return normalizeForCompare(a) === normalizeForCompare(b);
  if (smaller < 3) {
    // Very short labels ("before opening the account") only match near-identical text.
    let shared = 0; for (const t of A) if (B.has(t)) shared += 1;
    return shared / (A.size + B.size - shared) >= 0.67;
  }
  return similarity(A, B) >= threshold;
}

/** Keep items that do not repeat each other or anything in `seen` (array of texts). */
export function dedupeTexts(items, seen = [], threshold = DUPLICATE_THRESHOLD) {
  const kept = [];
  const reference = [...seen];
  for (const item of items || []) {
    const text = String(item ?? '').trim();
    if (!text) continue;
    if (reference.some((other) => isNearDuplicate(text, other, threshold))) continue;
    kept.push(text);
    reference.push(text);
  }
  return kept;
}

/** Remove whole sentences of a long guide that only repeat facts already shown above. */
export function dropRepeatedSentences(paragraph, seen = [], threshold = 0.75) {
  const sentences = String(paragraph ?? '').split(/(?<=[.!؟?؛])\s+/u);
  const kept = sentences.filter((sentence) => {
    const terms = keyTerms(sentence);
    if (terms.size < 4) return true; // short connective sentences stay for readability
    return !seen.some((other) => similarity(terms, keyTerms(other)) >= threshold && keyTerms(other).size >= 3 && similarity(keyTerms(other), terms) >= threshold);
  });
  return kept.join(' ').trim();
}
