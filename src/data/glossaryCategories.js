export const GLOSSARY_CATEGORIES = {
  english_basics: { ar: "أساسيات الإنجليزي", en: "English Basics", es: "Inglés básico" },
  identity: { ar: "الهوية والحكومة", en: "ID & Government", es: "Identidad y gobierno" },
  money: { ar: "البنوك والكريديت", en: "Banking & Credit", es: "Banca y crédito" },
  work: { ar: "الشغل والمرتبات", en: "Work & Pay", es: "Trabajo y salario" },
  taxes: { ar: "الضرائب", en: "Taxes", es: "Impuestos" },
  housing: { ar: "السكن", en: "Housing", es: "Vivienda" },
  driving: { ar: "العربية والقيادة والتأمين", en: "Driving, Cars & Insurance", es: "Conducción y seguro" },
  health: { ar: "الصحة والتأمين الصحي", en: "Health & Insurance", es: "Salud y seguro" },
  travel: { ar: "السفر والمطار", en: "Travel & Airport", es: "Viajes y aeropuerto" },
  education: { ar: "التعليم", en: "Education", es: "Educación" },
  daily_life: { ar: "الحياة اليومية", en: "Daily Life", es: "Vida diaria" },
  phrases: { ar: "كلام أمريكي دارج", en: "Everyday Phrases", es: "Frases cotidianas" },
};
export const glossaryCategoryLabel=(key,lang="en")=>GLOSSARY_CATEGORIES[key]?.[lang]||GLOSSARY_CATEGORIES[key]?.en||key;
