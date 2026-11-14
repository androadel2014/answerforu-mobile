// AnswerForU "Jawab" (Airmail) identity — v3.7.0 / versionCode 18. Presentation only.
// Royal blue + cream paper + diagonal red/blue airmail stripes + navy ink + gold accents.
// Legacy token names are kept (every screen still reads C.teal, C.mist, C.sea, …) but
// now resolve to the Airmail palette, so the whole app re-skins from one place.
export const C = {
  // Airmail core
  royal: "#0B4FC4", royalDark: "#073A99", royalSoft: "#E4EBFC",
  airRed: "#E2363C", airBlue: "#0B4FC4",
  cream: "#F8EFDC", paper: "#FFFCF5", sand: "#F3E6C8", dash: "#D6BC83",
  gold: "#F6B92B", goldDark: "#8A5A00", goldSoft: "#FCEBC2",
  greenSoft: "#DCF2EA", redSoft: "#FCE4E5",
  // Legacy names → Airmail values
  ink: "#0E1A3A", navy: "#0E1A3A", navy2: "#08122B", blue: "#0B4FC4",
  cyan: "#E4EBFC", bg: "#F8EFDC", card: "#FFFCF5", line: "#E7D8B6",
  muted: "#59607A", soft: "#E4EBFC", green: "#13795B", red: "#C42F37",
  amber: "#8A5A00", highlight: "#FCEBC2", successBg: "#DCF2EA", dangerBg: "#FCE4E5",
  teal: "#0B4FC4", tealDark: "#073A99", mist: "#E4EBFC", white: "#FFFFFF",
  sea: "#F6B92B", plum: "#5E477C", sky: "#E4EBFC"
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const type = { body: 16, label: 16, title: 26, hero: 34, line: 25 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 26 };
export const shadow = { shadowColor: "#3B2A06", shadowOpacity: .09, shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 }, elevation: 3 };
// Tinted icon tiles used across cards (matches the mockups' soft square icon chips).
export const tints = [
  { bg: "#E4EBFC", fg: "#0B4FC4" }, { bg: "#FCEBC2", fg: "#8A5A00" },
  { bg: "#DCF2EA", fg: "#13795B" }, { bg: "#FCE4E5", fg: "#C42F37" }
];
