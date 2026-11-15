// AnswerForU "Jawab" (Airmail) identity — v3.7.0 / versionCode 18 fix round. Presentation only.
// ONE source of colour: every hex value in the app lives in this file. Screens and components
// read tokens (C.royal, C.placeholder, …) and never write a hex literal of their own.
//
// Canonical palette (owner-approved): royal #0B4FC8 · navy ink #0E1B3D · page cream #FAF3E0 ·
// card cream #FFFDF6 · gold #F6B92B · airmail red #E2363C. Everything else below is a tint,
// shade or state colour derived for a specific job; near-duplicate tints were collapsed:
//   blues  #DCE5FF/#CFDBFF/#E6EAF5 → onDarkSoft · #CBD8F6/#B9C8F0 → royalLine
//   golds  #E8A20E/#C98F0A → goldDeep
//   creams #F3E6C8/#F6EAD9/#EFE3C8 → sand · #E2CF9F → inputBorder (inputs) / dash (decoration)
export const palette = {
  royal: "#0B4FC8", navy: "#0E1B3D", cream: "#FAF3E0", paper: "#FFFDF6", gold: "#F6B92B", airRed: "#E2363C"
};
const P = palette;
const base = {
  // Airmail core (canonical)
  royal: P.royal, navy: P.navy, cream: P.cream, paper: P.paper, gold: P.gold, airRed: P.airRed, airBlue: P.royal,
  // Royal family
  royalDark: "#073A99", royalSoft: "#E4EBFC", royalLine: "#B9C8F0",
  // Text/lines on navy or royal surfaces (all ≥ 11:1 on navy)
  onDark: "#FFFFFF", onDarkSoft: "#DCE5FF", onDarkMuted: "#C9D2EA",
  // Navy family
  navy2: "#08122B",
  // Cream family
  sand: "#F3E6C8", dash: "#D6BC83", line: "#E7D8B6",
  // Form controls — contrast-checked on cream #FAF3E0 and card cream #FFFDF6:
  //   placeholder 4.93:1 / 5.36:1 (WCAG AA text ≥ 4.5) · inputBorder 3.48:1 / 3.79:1 (UI component ≥ 3)
  placeholder: "#706957", inputBorder: "#93804F",
  // Gold family
  goldDeep: "#C98F0A", goldDark: "#8A5A00", goldSoft: "#FCEBC2",
  // States
  green: "#13795B", greenDark: "#0B5A42", greenSoft: "#DCF2EA",
  red: "#C42F37", redSoft: "#FCE4E5", redLine: "#F2B8BB",
  muted: "#59607A", plum: "#5E477C",
  // Neutrals (white/black/shadow)
  white: "#FFFFFF", black: "#000000", shadow: "#3B2A06"
};
// Legacy token names are kept (every screen still reads C.teal, C.mist, C.sea, …) and resolve
// to the tokens above, so no screen loses a colour.
export const C = {
  ...base,
  ink: base.navy, blue: base.royal, cyan: base.royalSoft, bg: base.cream, card: base.paper,
  soft: base.royalSoft, amber: base.goldDark, highlight: base.goldSoft, successBg: base.greenSoft,
  dangerBg: base.redSoft, teal: base.royal, tealDark: base.royalDark, mist: base.royalSoft,
  sea: base.gold, sky: base.royalSoft
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
// Type floor: no UI text below 12px anywhere (minText). Body copy stays at 16.
export const type = { body: 16, label: 16, title: 26, hero: 34, line: 25, minText: 12, meta: 13 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 26 };
export const shadow = { shadowColor: C.shadow, shadowOpacity: .09, shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 }, elevation: 3 };
// Tinted icon tiles used across cards (matches the mockups' soft square icon chips).
export const tints = [
  { bg: C.royalSoft, fg: C.royal }, { bg: C.goldSoft, fg: C.goldDark },
  { bg: C.greenSoft, fg: C.green }, { bg: C.redSoft, fg: C.red }
];
