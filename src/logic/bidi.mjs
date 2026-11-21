// Shared with the website (AnswerForU v6.4.2): keep both copies identical in behaviour.
/**
 * AnswerForU v6.4.2 (tester item 13): mixed Arabic + English text must not
 * flip direction. In an RTL paragraph, Latin runs that contain digits or
 * hyphens ("N-400", "I-94", "W-2", "4 Quarters = $1", "$100 bill") are
 * reordered by the Unicode bidi algorithm ("400-N", "bill $100"). We split a
 * string into segments and isolate each Latin run (rendered as <bdi dir="ltr">
 * by BidiText.jsx), without changing the text itself (search, copy and
 * translations keep working).
 */
const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LATIN = /[A-Za-z]/;
const TOKEN = String.raw`[A-Za-z0-9$€£][A-Za-z0-9$€£%&'’@#+._:/()\-]*`;
const JOIN = String.raw`(?:[  ]|[  ]?[=+×→][  ]?)`;
const RUN = new RegExp(`${TOKEN}(?:${JOIN}${TOKEN})*`, 'g');
const CLOSERS = /[”"’»)\]]/;
// "$2", "€10", "£5": amounts after Arabic text would otherwise show as "2$".
const CURRENCY = /[$€£]\s?\d/;
const isolatable = (run) => LATIN.test(run) || CURRENCY.test(run);

export const hasRtl = (text) => RTL.test(String(text ?? ''));

function balanceParens(run) {
  let out = run;
  const count = (s, c) => s.split(c).length - 1;
  while (out.endsWith(')') && count(out, ')') > count(out, '(')) out = out.slice(0, -1);
  while (out.startsWith('(') && count(out, '(') > count(out, ')')) out = out.slice(1);
  return out;
}

/** @returns {{text:string, ltr:boolean}[]} */
export function bidiSegments(value) {
  const text = String(value ?? '');
  if (!text || !isolatable(text)) return [{ text, ltr: false }];
  if (!RTL.test(text)) return [{ text, ltr: true }];
  const out = [];
  let cursor = 0;
  for (const match of text.matchAll(RUN)) {
    let run = match[0];
    let start = match.index;
    if (!isolatable(run)) continue;
    // Sentence punctuation after a Latin word belongs to the Arabic sentence,
    // unless the English phrase is quoted (“Here you go.”).
    const after = text[start + run.length] || '';
    if (!CLOSERS.test(after)) run = run.replace(/[.,:;!?]+$/u, '');
    const balanced = balanceParens(run);
    start += run.indexOf(balanced);
    run = balanced;
    if (!run || !isolatable(run)) continue;
    if (start > cursor) out.push({ text: text.slice(cursor, start), ltr: false });
    out.push({ text: run, ltr: true });
    cursor = start + run.length;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), ltr: false });
  return out.length ? out : [{ text, ltr: false }];
}

/* ---------- AnswerForU mobile 3.7.1 (tester items 6 + 13) ---------- */
const RLM = '‏';
const LRI = '⁦';
const PDI = '⁩';
const CONTROLS = /[‎‏⁦-⁩]/g;

/**
 * Text for an Arabic <Text>: an RLM first, so Android lays the paragraph out
 * right-to-left even when it starts with an English word or a number
 * ("SSN هو…", "4 Quarters = $1"), and every Latin run isolated left-to-right
 * so "N-400", "$100 bill" or "W-2/1099" keep their own order.
 * Android has no writingDirection prop; this is the platform-neutral fix.
 */
export function isolateForRtl(value) {
  const text = String(value ?? '');
  if (!text.trim()) return text;
  const body = bidiSegments(text.replace(CONTROLS, '')).map((segment) => (segment.ltr ? `${LRI}${segment.text}${PDI}` : segment.text)).join('');
  return `${RLM}${body}`;
}

/** Remove the invisible direction marks again (copy, search, speech). */
export const stripBidiControls = (value) => String(value ?? '').replace(CONTROLS, '');
