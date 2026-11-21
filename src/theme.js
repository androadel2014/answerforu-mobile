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
// Dark appearance (AnswerForU mobile 3.7.1, tester item 7 — manual + automatic dark mode).
// Same token names; page/card surfaces turn deep navy, text tokens turn light, and the solid
// accent surfaces (navy panels, royal/green/red buttons, gold) keep white or navy text on them.
// Contrast (WCAG): ink 15.8:1 on bg · muted 7.7:1 on card · placeholder 6.7:1 on card ·
// inputBorder 3.9:1 on card · royal buttons carry white text at 4.8:1.
const darkBase = {
  royal: "#2F6BEA", navy: "#1B2A55", cream: "#0B1220", paper: "#141E33", gold: P.gold, airRed: P.airRed, airBlue: "#2F6BEA",
  royalDark: "#1D4FB8", royalSoft: "#1A2B52", royalLine: "#34508F",
  onDark: "#FFFFFF", onDarkSoft: "#DCE5FF", onDarkMuted: "#C9D2EA",
  navy2: "#070D1D",
  sand: "#22304A", dash: "#4A5A80", line: "#2A3654",
  placeholder: "#9AA4BE", inputBorder: "#6B7AA0",
  goldDeep: "#E0A92A", goldDark: "#F2C66D", goldSoft: "#3A2E10",
  green: "#13795B", greenDark: "#0B5A42", greenSoft: "#0F3A2D",
  red: "#C42F37", redSoft: "#3D1519", redLine: "#6B2A30",
  muted: "#A7B0C8", plum: "#C7B3E6",
  white: "#18233A", black: "#000000", shadow: "#000000"
};
// Role tokens (3.7.1): one name per job, so a colour that is both a surface and a text colour
// in the light theme can split in the dark one. Light values equal the original colours, so the
// light appearance is unchanged pixel for pixel.
const roles = (b, dark) => ({
  surface: dark ? "#18233A" : b.white, // card/box surfaces that were "white"
  royalInk: dark ? "#8DB2FF" : b.royal, // royal text and icons
  royalDarkInk: dark ? "#8DB2FF" : b.royalDark, // deep-royal text (glossary examples)
  greenInk: dark ? "#5FD3A5" : b.green,
  redInk: dark ? "#FF8A8F" : b.red,
  onGold: P.navy, // text on gold stays navy in both appearances
  outline: dark ? "#5B6E9C" : b.navy // outline-button borders
});
// Legacy token names are kept (every screen still reads C.teal, C.mist, C.sea, …) and resolve
// to the tokens above, so no screen loses a colour.
const tokens = (b, dark = false) => ({
  ...b,
  ...roles(b, dark),
  ink: dark ? "#E7ECF7" : b.navy, blue: dark ? "#8DB2FF" : b.royal, cyan: b.royalSoft, bg: b.cream, card: b.paper,
  soft: b.royalSoft, amber: b.goldDark, highlight: b.goldSoft, successBg: b.greenSoft,
  dangerBg: b.redSoft, teal: b.royal, tealDark: b.royalDark, mist: b.royalSoft,
  sea: b.gold, sky: b.royalSoft
});
const LIGHT = tokens(base, false);
const DARK = tokens(darkBase, true);
// C is the live token object: setColorScheme() swaps every value in place, so code that reads
// C.x while rendering always gets the current appearance.
export const C = { ...LIGHT };
let activeScheme = "light";
export function colorScheme() { return activeScheme; }
export function setColorScheme(next) {
  const scheme = next === "dark" ? "dark" : "light";
  if (scheme === activeScheme) return false;
  activeScheme = scheme;
  Object.assign(C, scheme === "dark" ? DARK : LIGHT);
  return true;
}
/** Resolve the saved preference ("light" | "dark" | "auto") against the phone setting. */
export function resolveScheme(preference, system) {
  if (preference === "dark" || preference === "light") return preference;
  return system === "dark" ? "dark" : "light";
}
// Module-level StyleSheets are built lazily per appearance: `themed(() => StyleSheet.create({...}))`
// returns an object whose keys resolve against the active appearance at render time.
export function themed(factory) {
  const cache = {};
  return new Proxy({}, {
    get(_, key) {
      const sheet = cache[activeScheme] || (cache[activeScheme] = factory());
      return sheet[key];
    },
    has(_, key) { return key in (cache[activeScheme] || (cache[activeScheme] = factory())); },
    ownKeys() { return Reflect.ownKeys(cache[activeScheme] || (cache[activeScheme] = factory())); },
    getOwnPropertyDescriptor(_, key) {
      const sheet = cache[activeScheme] || (cache[activeScheme] = factory());
      return key in sheet ? { enumerable: true, configurable: true, value: sheet[key] } : undefined;
    }
  });
}
// Road-sign faces keep their real MUTCD colours in both appearances (3.7.1, tester items 11–12).
export const signPalette = {
  white: "#FFFFFF", black: "#111111", yellow: "#FFCC00", orange: "#F58220", red: "#C8102E",
  green: "#006B3F", blue: "#1F4E9A", tile: "#FFFFFF", tileLine: "#D9D2C1"
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
// Type floor: no UI text below 12px anywhere (minText). Body copy stays at 16.
export const type = { body: 16, label: 16, title: 26, hero: 34, line: 25, minText: 12, meta: 13 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 26 };
export const shadow = { get shadowColor() { return C.shadow; }, shadowOpacity: .09, shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 }, elevation: 3 };
// Tinted icon tiles used across cards (matches the mockups' soft square icon chips).
// Getters, so the tiles follow the active appearance.
export const tints = [
  { get bg() { return C.royalSoft; }, get fg() { return C.royalInk; } }, { get bg() { return C.goldSoft; }, get fg() { return C.goldDark; } },
  { get bg() { return C.greenSoft; }, get fg() { return C.greenInk; } }, { get bg() { return C.redSoft; }, get fg() { return C.redInk; } }
];
