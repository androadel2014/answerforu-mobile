// "Jawab" Airmail kit — the visual building blocks of the v3.7.0 identity.
// Native Views only (no SVG, images, permissions or network). Re-exported from UI.js.
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, shadow } from "../theme";

// Outline icons. @expo/vector-icons (Feather) is a declared dependency; the guarded
// require keeps the UI readable with plain glyphs if the icon font ever fails to load.
let Feather = null;
try { Feather = require("@expo/vector-icons/Feather").default; } catch (e) { Feather = null; }
const GLYPH = { home:"⌂", map:"◇", "book-open":"✦", "shopping-bag":"▦", grid:"☷", compass:"◎", "message-circle":"◌",
  "file-text":"▤", award:"★", users:"☻", globe:"◍", user:"☺", bell:"♢", search:"⌕", "arrow-left":"←", "arrow-right":"→",
  check:"✓", "chevron-down":"⌄", "chevron-up":"⌃", "chevron-left":"‹", "chevron-right":"›", x:"×", star:"★", bookmark:"☆",
  briefcase:"▣", tool:"⚒", layers:"≡", clipboard:"▤", "thumbs-up":"★", send:"➤", download:"⇩", book:"Aa", shield:"⛉",
  mail:"✉", info:"ℹ", lock:"⚿", "trash-2":"⌫", plus:"+", "refresh-cw":"↻", "map-pin":"⌖", navigation:"➤", filter:"⚲",
  "edit-3":"✎", "log-out":"⇥", "log-in":"⇤", "check-circle":"✓", "message-square":"◌", list:"≡", feather:"✎", rss:"◉", "shopping-cart":"◫", key:"⌂", file:"§", link:"◉", "external-link":"↗", "dollar-sign":"$", "alert-triangle":"△", "help-circle":"?", sliders:"↔", camera:"◘", image:"◘", phone:"☏", calendar:"▦", clock:"◷", "dollar":"$", "edit":"✎", "trending-up":"↗", "volume-2":"♪", mic:"●", "play":"▶", "share-2":"⇪", "heart":"♥", "eye":"◉", "upload":"⇧", "save":"▣", cpu:"▣", target:"◎", flag:"⚑" };
export function Icon({ name = "star", size = 20, color = C.navy, style }) {
  if (Feather) return <Feather name={name} size={size} color={color} style={style} />;
  return <Text style={[{ fontSize: size, color, fontWeight: "900", lineHeight: size * 1.2 }, style]}>{GLYPH[name] || "•"}</Text>;
}
// "Forward" points left in Arabic (RTL) and right in English/Spanish (LTR), as in the mockups.
export const fwdIcon = (lang) => (String(lang || "ar").startsWith("ar") ? "arrow-left" : "arrow-right");

// Diagonal red/blue airmail band (top of screens, section dividers, card edges).
export function AirmailStripe({ height = 7, style, bg = C.paper }) {
  return <View pointerEvents="none" style={[{ height, overflow: "hidden", backgroundColor: bg, flexDirection: "row", direction: "ltr" }, style]}>
    {Array.from({ length: 72 }, (_, i) => <View key={i} style={{ width: 15, height: height * 3, marginTop: -height, marginRight: 8,
      backgroundColor: i % 2 ? C.airBlue : C.airRed, transform: [{ skewX: "-40deg" }] }} />)}
  </View>;
}

// Short four-dash airmail accent used under section titles ("▬ ▬ ▬ ▬").
export function AirmailDashes({ style }) {
  return <View style={[{ flexDirection: "row", gap: 7, marginTop: 4 }, style]}>
    {[C.airBlue, C.airRed, C.airBlue, C.airRed].map((c, i) => <View key={i} style={{ width: 22, height: 6, borderRadius: 2, backgroundColor: c, transform: [{ skewX: "-30deg" }] }} />)}
  </View>;
}

// Envelope: a cream letter framed on all four sides by the diagonal airmail border.
const BARS = Array.from({ length: 160 }, (_, i) => [C.airRed, "#FFFFFF", C.airBlue, "#FFFFFF"][i % 4]);
export function AirmailFrame({ children, style, contentStyle, radius = 22, thickness = 9 }) {
  return <View style={[{ borderRadius: radius, overflow: "hidden", padding: thickness, backgroundColor: "#FFFFFF" }, shadow, style]}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: "absolute", left: -600, top: -600, width: 2400, height: 2400, flexDirection: "row", transform: [{ rotate: "45deg" }] }}>
        {BARS.map((c, i) => <View key={i} style={{ width: 15, height: "100%", backgroundColor: c }} />)}
      </View>
    </View>
    <View style={[{ backgroundColor: C.paper, borderRadius: Math.max(6, radius - 8), padding: 20, gap: 12 }, contentStyle]}>{children}</View>
  </View>;
}

// Perforated postage-stamp tile. tone: "paper" | "blue" | "navy" | "cream".
export function Stamp({ children, style, tone = "paper" }) {
  const t = { paper: [C.paper, C.dash], blue: [C.royal, "#FFFFFF"], navy: [C.navy, C.gold], cream: [C.goldSoft, C.dash] }[tone] || [C.paper, C.dash];
  return <View style={[{ backgroundColor: t[0], borderWidth: 3, borderStyle: "dotted", borderColor: t[1], borderRadius: 6, padding: 14 }, style]}>{children}</View>;
}

// Circular postmark with a star and wavy cancellation lines.
export function Postmark({ size = 54, color = "#7A8199", style }) {
  return <View pointerEvents="none" style={[{ flexDirection: "row", alignItems: "center", direction: "ltr" }, style]}>
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size - 12, height: size - 12, borderRadius: size, borderWidth: 1, borderColor: color, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color, fontSize: size * .38, fontWeight: "900" }}>★</Text>
      </View>
    </View>
    <View style={{ gap: 3, marginLeft: 4 }}>{[0, 1, 2].map(i => <Text key={i} style={{ color, fontSize: 13, lineHeight: 13, letterSpacing: -1 }}>≈≈≈</Text>)}</View>
  </View>;
}

// Simplified AnswerForU mark: a blue "A" peak with a red flag swoosh, gold star and pin dot.
export function BrandMark({ size = 40 }) {
  return <View style={{ width: size, height: size, borderRadius: size * .26, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <Text style={{ color: C.royal, fontSize: size * .62, fontWeight: "900", lineHeight: size * .72 }}>A</Text>
    <View style={{ position: "absolute", width: size * .52, height: size * .12, backgroundColor: C.airRed, bottom: size * .22, right: size * .08, transform: [{ rotate: "-28deg" }], borderRadius: 3 }} />
    <View style={{ position: "absolute", width: size * .2, height: size * .2, borderRadius: size, backgroundColor: C.navy, top: size * .1, left: size * .22, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: C.gold, fontSize: size * .14, lineHeight: size * .17, fontWeight: "900" }}>★</Text>
    </View>
  </View>;
}
export function Wordmark({ size = 19, color = C.navy }) {
  return <Text numberOfLines={1} style={{ color, fontSize: size, fontWeight: "900", letterSpacing: -.4 }}>AnswerForU</Text>;
}

// Always-visible language switch: العربية · English · Español (no cycling, no hidden menu).
export const LANGS = [["ar", "العربية"], ["en", "English"], ["es", "Español"]];
export function LangSwitch({ lang, onSet, dark = true, style }) {
  return <View accessibilityRole="radiogroup" accessibilityLabel={lang === "ar" ? "تغيير اللغة" : lang === "es" ? "Cambiar idioma" : "Change language"} style={[{ flexDirection: "row", alignItems: "center", gap: 6 }, style]}>
    <Icon name="globe" size={17} color={dark ? "#C9D2EA" : C.navy} />
    {LANGS.map(([code, label]) => {
      const on = lang === code;
      return <Pressable key={code} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={label}
        onPress={() => { if (!on) onSet?.(code); }} hitSlop={6}
        style={{ paddingHorizontal: 12, minHeight: 32, borderRadius: 999, justifyContent: "center",
          backgroundColor: on ? "#FFFFFF" : "transparent", borderWidth: dark ? 0 : 1, borderColor: on ? C.navy : C.line }}>
        <Text style={{ color: on ? C.navy : dark ? "#E6EAF5" : C.muted, fontWeight: on ? "900" : "700", fontSize: 14 }}>{label}</Text>
      </Pressable>;
    })}
  </View>;
}

// Tinted square icon chip used in cards and list rows.
export function IconChip({ name, tint = 0, size = 46, iconSize = 21, style }) {
  const T = [{ bg: C.royalSoft, fg: C.royal }, { bg: C.goldSoft, fg: C.goldDark }, { bg: C.greenSoft, fg: C.green }, { bg: C.redSoft, fg: C.red }][tint % 4];
  return <View style={[{ width: size, height: size, borderRadius: size * .3, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" }, style]}><Icon name={name} size={iconSize} color={T.fg} /></View>;
}

// Round outlined arrow button (the "→" circle at the end of mockup rows/cards).
export function ArrowCircle({ lang, size = 38, color = C.navy }) {
  return <View style={{ width: size, height: size, borderRadius: size, borderWidth: 1.5, borderColor: C.dash, alignItems: "center", justifyContent: "center", backgroundColor: C.paper }}>
    <Icon name={fwdIcon(lang)} size={size * .45} color={color} />
  </View>;
}

// Learn America illustration: STOP · SPEED LIMIT 35 · YIELD (drawn with Views, matches mockups).
export function RoadSignsArt({ scale = 1 }) {
  const k = scale;
  return <View pointerEvents="none" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 * k, direction: "ltr" }}>
    <View style={{ width: 66 * k, height: 66 * k, backgroundColor: C.airRed, borderRadius: 18 * k, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", ...shadow }}>
      <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 16 * k }}>STOP</Text>
    </View>
    <View style={{ width: 52 * k, height: 66 * k, backgroundColor: "#FFFFFF", borderRadius: 6, borderWidth: 3, borderColor: C.navy, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: C.navy, fontWeight: "900", fontSize: 8 * k, lineHeight: 9 * k, textAlign: "center" }}>{"SPEED\nLIMIT"}</Text>
      <Text style={{ color: C.navy, fontWeight: "900", fontSize: 24 * k, lineHeight: 27 * k }}>35</Text>
    </View>
    <View style={{ width: 70 * k, height: 62 * k, alignItems: "center" }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 35 * k, borderRightWidth: 35 * k, borderTopWidth: 62 * k, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: C.airRed }} />
      <View style={{ position: "absolute", top: 9 * k, width: 0, height: 0, borderLeftWidth: 23 * k, borderRightWidth: 23 * k, borderTopWidth: 40 * k, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#FFFFFF" }} />
      <Text style={{ position: "absolute", top: 12 * k, color: C.airRed, fontWeight: "900", fontSize: 9 * k }}>YIELD</Text>
    </View>
  </View>;
}
// Journey illustration: dotted route 1 → 2 → 3 ending at a gold pin (on royal blue).
export function RouteArt() {
  const Node = ({ n, top }) => <View style={{ marginTop: top, width: 26, height: 26, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: C.royal, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.royal, fontWeight: "900", fontSize: 13 }}>{n}</Text></View>;
  const Dots = ({ top }) => <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", marginTop: top }}>{[0, 1, 2, 3].map(i => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,.8)" }} />)}</View>;
  return <View pointerEvents="none" style={{ height: 92, flexDirection: "row", alignItems: "flex-start", direction: "ltr", paddingTop: 6 }}>
    <Node n="1" top={52} /><Dots top={56} /><Node n="2" top={24} /><Dots top={38} /><Node n="3" top={40} /><Dots top={24} />
    <View style={{ width: 30, height: 38, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 2, backgroundColor: C.gold, transform: [{ rotate: "45deg" }], alignItems: "center", justifyContent: "center" }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.navy }} /></View>
  </View>;
}
// Dashed gold circle with an icon (trust band on navy).
export function TrustIcon({ name }) {
  return <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderStyle: "dashed", borderColor: C.gold, alignItems: "center", justifyContent: "center" }}><Icon name={name} size={22} color={C.gold} /></View>;
}
