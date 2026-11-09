import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";
import { tr } from "../i18n";
const tabs = [
  ["home", "⌂", "الرئيسية", "Home", "Inicio"],
  ["journey", "◇", "رحلتي", "Journey", "Ruta"],
  ["learn", "✦", "اتعلم", "Learn", "Aprender"],
  ["community", "▦", "السوق", "Marketplace", "Mercado"],
  ["all", "☷", "الأقسام", "More", "Más"]
];
export default function BottomNav({ active, lang, onGo }) {
  return <View style={st.outer}><View style={[st.wrap,{direction:lang==="ar"?"rtl":"ltr"}]} accessibilityRole="tablist">{tabs.map(([id, icon, ar, en, es]) => {
    const selected = active === id;
    return <Pressable accessibilityRole="tab" accessibilityState={{selected}} accessibilityLabel={tr(lang, ar, en, es)} key={id} onPress={() => onGo(id)} style={st.item}>
      <View style={[st.iconWrap,selected&&st.iconActive]}><Text style={[st.icon,selected&&st.iconActiveText]}>{icon}</Text></View>
      <Text allowFontScaling numberOfLines={2} style={[st.label,selected&&st.activeText]}>{tr(lang,ar,en,es)}</Text>
      {selected?<View style={st.indicator}/>:<View style={st.indicatorBlank}/>}
    </Pressable>;
  })}</View></View>;
}
const st=StyleSheet.create({
  outer:{paddingHorizontal:10,paddingTop:5,paddingBottom:4,backgroundColor:C.bg},
  wrap:{minHeight:70,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:23,flexDirection:"row",paddingHorizontal:4,paddingVertical:5,shadowColor:"#0F4145",shadowOffset:{width:0,height:-3},shadowRadius:14,shadowOpacity:.12,elevation:8},
  item:{flex:1,minWidth:0,alignItems:"center",justifyContent:"center",gap:1},
  iconWrap:{width:46,height:34,borderRadius:13,alignItems:"center",justifyContent:"center"},
  iconActive:{backgroundColor:C.mist},
  icon:{color:C.muted,fontSize:23,fontWeight:"800",lineHeight:28},
  iconActiveText:{color:C.teal},
  label:{fontSize:11,lineHeight:15,color:C.muted,fontWeight:"700",textAlign:"center",flexShrink:1},
  activeText:{color:C.teal,fontWeight:"900"},
  indicator:{width:14,height:3,borderRadius:8,backgroundColor:C.teal,marginTop:1},
  indicatorBlank:{height:4}
});
