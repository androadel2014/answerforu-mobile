export const normalizeLang = (v) => String(v || "ar").toLowerCase().startsWith("ar") ? "ar" : String(v || "").toLowerCase().startsWith("es") ? "es" : "en";
export const isRTL = (lang) => normalizeLang(lang) === "ar";
export const tr = (lang, ar, en, es = en) => normalizeLang(lang) === "ar" ? ar : normalizeLang(lang) === "es" ? es : en;
export const pick = (obj, lang) => {
  if (!obj || typeof obj !== "object") return String(obj || "");
  const L = normalizeLang(lang);
  return obj[L] || obj.en || obj.ar || obj.es || "";
};

// Localised names for the request / listing source types the API returns as raw keys
// (source_type on My Requests, type/source_type on Admin). Never render the raw key.
const SOURCE_LABELS = {
  marketplace: ["السوق", "Marketplace", "Mercado"],
  housing: ["سكن", "Housing", "Vivienda"],
  jobs: ["شغل", "Jobs", "Empleos"],
  services: ["خدمات", "Services", "Servicios"],
  community: ["المجتمع", "Community", "Comunidad"],
  resources: ["مصادر", "Resources", "Recursos"],
  places: ["أماكن", "Places", "Lugares"],
  groups: ["جروبات", "Groups", "Grupos"],
  products: ["منتجات", "Products", "Productos"]
};
const SOURCE_ALIASES = { job: "jobs", service: "services", place: "places", group: "groups", product: "products", listing: "marketplace", listings: "marketplace", resource: "resources", house: "housing" };
export const sourceLabel = (key, lang) => {
  const k = String(key || "").trim().toLowerCase();
  if (!k) return "";
  const row = SOURCE_LABELS[k] || SOURCE_LABELS[SOURCE_ALIASES[k]];
  return row ? tr(lang, row[0], row[1], row[2]) : tr(lang, "طلب", "Request", "Solicitud");
};
