export const normalizeLang = (v) => String(v || "ar").toLowerCase().startsWith("ar") ? "ar" : String(v || "").toLowerCase().startsWith("es") ? "es" : "en";
export const isRTL = (lang) => normalizeLang(lang) === "ar";
export const tr = (lang, ar, en, es = en) => normalizeLang(lang) === "ar" ? ar : normalizeLang(lang) === "es" ? es : en;
export const pick = (obj, lang) => {
  if (!obj || typeof obj !== "object") return String(obj || "");
  const L = normalizeLang(lang);
  return obj[L] || obj.en || obj.ar || obj.es || "";
};
