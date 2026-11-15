# AnswerForU app v3.7.0 · versionCode 18 «جواب» — FIX ROUND (design + localisation)

Base: `AnswerForU-Mobile-v3.7.0-vc18-AIRMAIL-COMPLETE-SOURCE.zip` exactly as shipped.
Scope: reskin fixes only. Package `com.answerforu.app`, version 3.7.0, versionCode 18 (unchanged — not on Play yet).

## Gate summary
| Check | Result |
|---|---|
| `npm test` (`node --test tests/*.test.mjs`) | **87 / 87 pass** (76 existing + 11 new in `tests/mobileRound7.test.mjs`) |
| Zero deletions | 0 files deleted · 26 screens · 25 routes · 30 section entries · all assets present |
| Content counts | civics 100 + 128 · survival 344 / 17 · glossary 407 — `civics.json`, `survival.json`, `glossary.json` byte-identical |
| Data / logic / api / services | byte-identical to vc18, except `src/data/resourceConfig.js` (Spanish labels added — brief item 6; diff proves only `es:` keys were added) |
| Hex literals outside `src/theme.js` | **0** (was 224; 270 total / 40 unique) |
| Files | 37 modified · 4 added (`tests/mobileRound7.test.mjs` + 3 report files) · 0 deleted — see `FIXROUND-SHA256-CHANGES.tsv` |
| Grep proofs | `GREP-PROOFS-FIXROUND.txt` |
| Smoke render | all 26 screens + header, nav, tour, resource cards rendered in AR / EN / ES on a mock host with no runtime errors (not Android pixels — Kiko still builds and screenshots) |

Two existing vc18 test assertions were updated because the brief changes what they pin: the identity-token test now expects the canonical palette (royal `#0B4FC8`, navy `#0E1B3D`, page cream `#FAF3E0`, card cream `#FFFDF6`), and the pinned hash for `resourceConfig.js` is the new file. Nothing else in the old tests changed.

## Fixes
**Palette.** Every colour is a token in `src/theme.js` (`palette` = the six canonical colours; `C` = tokens + all legacy names). Tint families were collapsed: blues → `onDarkSoft` / `royalLine`, golds → `goldDeep`, creams → `sand` / `inputBorder` / `dash`.

1. **RTL row overflow.** New shared `ChipRow` in `UI.js`, used on Community (category chips + saved lists), Survival (packs, plus wrapped tier chips), Resources (tabs), AdminManage (tabs), and also Glossary, Learn and Journey stages. It never exceeds the viewport. In Arabic the scroller stays LTR with reversed items, starting scrolled to the right edge, so no chip clips at the left. The Community state/city row now uses `flexBasis 0 / minWidth 0` so it stays on-screen.
2. **Error states.** New `ErrorNotice` is the single error surface on 18 screens. Empty states are suppressed while an error shows. The app banner can now be dismissed (✕), and it stays hidden while the current screen shows its own `ErrorNotice` for the same failure (shared `ErrorSurfaceContext`). On CV, Messages and similar screens the banner + red card + empty state no longer stack.
3. ResourceCards eyebrow → `tr(lang, "مختارات مجتمع AnswerForU", "AnswerForU Community Picks", "Selecciones de la comunidad AnswerForU")`.
4. Verification: 7 proof types and 4 statuses (none / pending / approved / rejected) translated into AR/EN/ES. Chips are 13px with a 12px floor, single-line, on a two-column even grid.
5. `sourceLabel()` in `i18n.js` covers marketplace / housing / jobs / services / community / resources / places / groups (plus singular aliases) and is used by MyRequests and Admin. MyRequests filters and statuses also gained Spanish.
6. `resourceConfig.js`: Spanish on all 21 categories and 4 groups (ar 25 / en 25 / es 25).
7. Journey: Arabic chip «نفّذ قائمة المهام» and the tip text no longer use "Checklist". The how-to chips stack instead of truncating. The Arabic search placeholder is Latin-free (no SSN/DMV), and Spanish strings were added. The Recommend hero pill, the Learn and Marketplace eyebrows, and Home's "AnswerForU / Explore" eyebrow are translated per language.
8. Contrast: `placeholder #706957` gives 4.93:1 on cream and 5.36:1 on card cream. `inputBorder #93804F` gives 3.48:1 and 3.79:1. These are applied to the shared Field and to every search/input style.
9. Type floor 12px. `Txt` gained a `floor` prop (never below `type.minText` = 12). Chips, eyebrows and meta text in ResourceCards, Verification, MyRequests and Admin use 12–13px. No literal font size below 12 remains anywhere, including the header tagline and the road-sign illustration.
10. Hero system: `SectionHero variant="blue"` is now the navy-led hero: navy panel, airmail edge, royal route dots, gold pin, the same scheme as the navy cards on Recommend and Resources. Feed, Journey and Auth moved to it. The Citizenship medal is the only exception.
11. Header: the duplicate brand block is gone from All Sections. Auth has the same full-bleed `LangBar` as the app header. "v3.7.0" is removed from the Auth hero (it is kept only as a non-visible `testID`). The Home envelope stamp now shows a send icon, so the brand mark appears once in Home's first viewport (in the header).
12. Bottom nav: the All-sections special case is removed. Unselected tabs are navy, and the selected tab is a navy pill with a gold icon and white label, in all 3 languages.
13. Home headline: hero titles request balanced line breaks (Android `textBreakStrategy="balanced"`, iOS `lineBreakStrategyIOS="standard"`). The Arabic title has a deliberate break (no «كده» orphan). Spanish uses a 28px title, a shorter title and a shorter subtitle to keep the goal rows higher.
14. Empty states: Messages (airmail envelope + speech bubble → Browse the marketplace), Saved (postcard + gold bookmark → Explore places & listings), CV (resume sheet + gold pen seal → Start my first resume), My Requests (parcel + green received postmark → Add a listing or place).
15. Offline Packs: the «إصدار المحتوى: 6.3.7» line is removed (the service constant is unchanged). Each pack row has its own icon, a state pill (saved / not downloaded / downloading), one compact Download→Update button and a small remove control.
16. The language switcher no longer mirrors: same order, anchored to the right edge in AR / EN / ES on the header, Auth and the first-run tour.

## Notes for the gate
- The English strings "AnswerForU Community Picks" and the 7 English proof-type names still exist on purpose, as the English arguments of 3-language `tr()` calls. The brief's own fix 3 requires them. Grep shows no hard-coded or raw rendering is left. `glossary.json` also contains a glossary term "State ID"; that is content and was not changed.
- Item 10 reading: the "one hero pattern" is the navy hero for every dark/hero panel. The approved light page headers ("cream" title-on-paper on Learn / Marketplace / CV / Sections, and the Home envelope) are kept as in the mockups. If the gate wants those converted to navy panels too, that's a contained change in `SectionHero`.
- Not built to APK here — Kiko builds and screenshots on device in AR / EN / ES, especially the RTL chip rows and the Home first viewport.
