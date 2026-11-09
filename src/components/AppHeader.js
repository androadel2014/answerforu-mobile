import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";
import { APP_VERSION } from "../config";
import { tr } from "../i18n";

// Presentation-only website brand header. No route, account or API changes.
export default function AppHeader({ lang, user, onProfile, onNotifications, onLang }) {
  const initial = String(user?.display_name || user?.name || user?.username || "A").trim().charAt(0).toUpperCase() || "A";
  return <View style={[st.wrap,{direction:lang==="ar"?"rtl":"ltr"}]}>
    <View style={st.logoMark}><Text style={st.markText}>A</Text><View style={st.markDot}/></View>
    <View style={{flex:1,minWidth:0,justifyContent:"center"}}>
      <Text numberOfLines={1} style={st.logo}>Answer<Text style={{color:C.teal}}>ForU</Text></Text>
      <Text numberOfLines={1} style={st.tag}>{tr(lang,"دليلك للحياة في أمريكا","Your guide to life in America","Tu guía en Estados Unidos")}</Text>
    </View>
    <View style={st.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,"تغيير اللغة","Change language","Cambiar idioma")} onPress={onLang} style={st.small}><Text style={st.smallText}>{String(lang).toUpperCase()}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,"الإشعارات","Notifications","Notificaciones")} onPress={onNotifications} style={st.small}><Text style={st.bell}>♢</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,"حسابي","My account","Mi cuenta")} onPress={onProfile} style={st.avatar}><Text style={st.avatarText}>{initial}</Text></Pressable>
    </View>
  </View>;
}
const st=StyleSheet.create({
  wrap:{minHeight:72,paddingHorizontal:16,paddingVertical:9,backgroundColor:C.card,borderBottomWidth:1,borderColor:C.line,flexDirection:"row",alignItems:"center",gap:10},
  logoMark:{width:39,height:39,borderRadius:13,backgroundColor:C.navy,alignItems:"center",justifyContent:"center"},
  markText:{fontSize:24,fontWeight:"900",color:"#fff"},
  markDot:{position:"absolute",width:7,height:7,borderRadius:4,right:5,bottom:5,backgroundColor:C.sea},
  logo:{color:C.ink,fontSize:19,fontWeight:"900",letterSpacing:-.6},
  tag:{color:C.muted,fontSize:11,fontWeight:"600",marginTop:2},
  actions:{flexDirection:"row",alignItems:"center",gap:6},
  small:{minWidth:36,height:38,borderRadius:13,borderWidth:1,borderColor:C.line,backgroundColor:C.bg,alignItems:"center",justifyContent:"center"},
  smallText:{color:C.navy,fontWeight:"900",fontSize:12},
  bell:{color:C.navy,fontWeight:"900",fontSize:24},
  avatar:{width:39,height:39,borderRadius:14,backgroundColor:C.teal,alignItems:"center",justifyContent:"center",borderWidth:2,borderColor:C.mist},
  avatarText:{color:"#fff",fontWeight:"900",fontSize:17}
});
