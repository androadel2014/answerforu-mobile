import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";
import { tr } from "../i18n";
const tabs = [
  ["home", "⌂", "الرئيسية", "Home", "Inicio"],
  ["journey", "◈", "رحلتي", "Journey", "Ruta"],
  ["learn", "✦", "اتعلم", "Learn", "Aprender"],
  ["community", "▧", "السوق", "Marketplace", "Mercado"],
  ["all", "☷", "الأقسام", "More", "Más"]
];
export default function BottomNav({ active, lang, onGo }) {
  return <View style={st.wrap} accessibilityRole="tablist">{tabs.map(([id, icon, ar, en, es]) => {
    const selected = active === id;
    return <Pressable accessibilityRole="tab" accessibilityState={{selected}} accessibilityLabel={tr(lang, ar, en, es)} key={id} onPress={() => onGo(id)} style={[st.item, selected && st.active]}>
      <Text style={[st.icon, selected && st.activeText]}>{icon}</Text>
      <Text allowFontScaling numberOfLines={2} style={[st.label, selected && st.activeText]}>{tr(lang, ar, en, es)}</Text>
    </Pressable>;
  })}</View>;
}
const st=StyleSheet.create({
  wrap:{minHeight:77,backgroundColor:C.card,borderTopWidth:1,borderColor:C.line,flexDirection:"row",paddingHorizontal:4,paddingTop:6,paddingBottom:6},
  item:{flex:1,minWidth:0,borderRadius:14,alignItems:"center",justifyContent:"center",paddingHorizontal:1,paddingVertical:4},
  active:{backgroundColor:C.soft},
  icon:{color:C.muted,fontSize:22,fontWeight:"800",lineHeight:28},
  label:{fontSize:14,lineHeight:19,color:C.muted,fontWeight:"800",textAlign:"center",flexShrink:1},
  activeText:{color:C.blue}
});
