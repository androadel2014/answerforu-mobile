// Shared with the website (features/learn/lib/quizSelection.js, v6.4.2).
const pickLearnText = (value, lang) => {
  if (value == null) return "";
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    const picked = value[lang] ?? value.en ?? value.ar ?? "";
    return Array.isArray(picked) ? picked : String(picked);
  }
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
};

// v6.4.2 (tester item 14 — "the quiz loops and never shows the result"):
// the question set is now chosen ONCE per quiz content (question ids), not per
// array identity. Parents rebuild their `items` array on every re-render
// (e.g. MoneyLesson's quizBank.slice(0,3)), and saving a finished attempt fires
// "afu-learning-updated", which re-renders the page. The old effect reset the
// quiz to its start screen at exactly the moment the result should appear.
export function shuffledIndexes(length, rng = Math.random) {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Mixed quizzes draw from every category in turn, so one category (road signs)
// cannot dominate a 10-question set (tester item 9: "feels like a driving test").
export function pickQuestionIndexes(items, count, { randomize = false, balanceCategories = false, rng = Math.random } = {}) {
  const total = Array.isArray(items) ? items.length : 0;
  const wanted = Math.min(Math.max(0, Number(count) || total), total);
  if (!randomize) return Array.from({ length: wanted }, (_, i) => i);
  const order = shuffledIndexes(total, rng);
  if (!balanceCategories) return order.slice(0, wanted);
  const buckets = new Map();
  for (const index of order) {
    const key = String(items[index]?.category || "other");
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(index);
  }
  const keys = shuffledIndexes(buckets.size, rng).map((i) => [...buckets.keys()][i]);
  const picked = [];
  while (picked.length < wanted) {
    let progressed = false;
    for (const key of keys) {
      const bucket = buckets.get(key);
      if (bucket.length && picked.length < wanted) { picked.push(bucket.shift()); progressed = true; }
    }
    if (!progressed) break;
  }
  return picked;
}

export function buildSelection(items, count, { randomizeQuestions, randomizeChoices, balanceCategories }) {
  return pickQuestionIndexes(items, count, { randomize: randomizeQuestions, balanceCategories }).map((index) => {
    const optionCount = Array.isArray(items[index]?.options) ? items[index].options.length
      : Array.isArray(items[index]?.options?.ar) ? items[index].options.ar.length
      : Array.isArray(items[index]?.options?.en) ? items[index].options.en.length : 0;
    return { index, perm: randomizeChoices ? shuffledIndexes(optionCount) : Array.from({ length: optionCount }, (_, i) => i) };
  });
}

export function localizeQuestion(question, perm, lang) {
  const options = pickLearnText(question.options, lang) || [];
  const order = perm.length === options.length ? perm : options.map((_, i) => i);
  return {
    ...question,
    q: pickLearnText(question.q, lang),
    why: pickLearnText(question.why, lang),
    options: order.map((i) => options[i]),
    answer: order.indexOf(question.answer),
  };
}

