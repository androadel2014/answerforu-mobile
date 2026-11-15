import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";
import { tr } from "../i18n";
import { Icon } from "./Airmail";
// Same five destinations as before; Airmail look: floating cream bar. One rule for every tab in
// every language: unselected = navy icon + navy label; selected = navy pill + gold icon + white label.
const tabs = [
  ["home", "home", "الرئيسية", "Home", "Inicio"],
  ["journey", "map", "رحلتي", "Journey", "Ruta"],
  ["learn", "book-open", "اتعلم", "Learn", "Aprender"],
  ["community", "shopping-bag", "السوق", "Marketplace", "Mercado"],
  ["all", "grid", "كل الأقسام", "All sections", "Secciones"]
];
export default function BottomNav({ active, lang, onGo }) {
  return <View style={st.outer}><View style={[st.wrap, { direction: lang === "ar" ? "rtl" : "ltr" }]} accessibilityRole="tablist">{tabs.map(([id, icon, ar, en, es]) => {
    const selected = active === id;
    return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={tr(lang, ar, en, es)} key={id} onPress={() => onGo(id)} style={[st.item, selected && st.iconActive]}>
      <Icon name={icon} size={22} color={selected ? C.gold : C.navy} />
      <Text allowFontScaling numberOfLines={2} style={[st.label, selected && st.activeText]}>{tr(lang, ar, en, es)}</Text>
    </Pressable>;
  })}</View></View>;
}
const st = StyleSheet.create({
  outer: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6, backgroundColor: C.bg },
  wrap: { minHeight: 70, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 22, flexDirection: "row", padding: 5, gap: 3, shadowColor: C.shadow, shadowOffset: { width: 0, height: -2 }, shadowRadius: 14, shadowOpacity: .12, elevation: 8 },
  item: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 16, paddingVertical: 6 },
  iconActive: { backgroundColor: C.navy },
  label: { fontSize: 12, lineHeight: 15, color: C.navy, fontWeight: "800", textAlign: "center", flexShrink: 1 },
  activeText: { color: C.white, fontWeight: "900" }
});
