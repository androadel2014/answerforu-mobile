import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";
import { APP_VERSION } from "../config";
import { tr } from "../i18n";
export default function AppHeader({ lang, user, onProfile, onNotifications, onLang }) {
  const initial = String(user?.display_name || user?.name || user?.username || "A").trim().charAt(0).toUpperCase() || "A";
  return <View style={st.wrap}>
    <View style={{flex:1}}><Text style={st.logo}>AnswerForU</Text><Text style={st.tag}>{tr(lang,"دليلك للحياة في أمريكا","Your guide to life in America","Tu guía en Estados Unidos")} · v{APP_VERSION}</Text></View>
    <View style={st.actions}>
      <Pressable accessibilityLabel={tr(lang,"تغيير اللغة","Change language","Cambiar idioma")} onPress={onLang} style={st.small}><Text style={st.smallText}>{String(lang).toUpperCase()}</Text></Pressable>
      <Pressable accessibilityLabel={tr(lang,"الإشعارات","Notifications","Notificaciones")} onPress={onNotifications} style={st.small}><Text style={st.smallText}>♧</Text></Pressable>
      <Pressable accessibilityLabel={tr(lang,"حسابي","My account","Mi cuenta")} onPress={onProfile} style={st.avatar}><Text style={st.avatarText}>{initial}</Text></Pressable>
    </View>
  </View>;
}
const st=StyleSheet.create({
  wrap:{minHeight:66,paddingHorizontal:16,paddingVertical:8,backgroundColor:C.card,borderBottomWidth:1,borderColor:C.line,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  logo:{color:C.ink,fontSize:23,fontWeight:"900",letterSpacing:-.5},
  tag:{color:C.muted,fontSize:12,fontWeight:"700",marginTop:2},
  actions:{flexDirection:"row",alignItems:"center",gap:7},
  small:{minWidth:39,height:39,borderRadius:13,borderWidth:1,borderColor:C.line,backgroundColor:C.soft,alignItems:"center",justifyContent:"center"},
  smallText:{color:C.ink,fontWeight:"800",fontSize:13},
  avatar:{width:42,height:42,borderRadius:21,backgroundColor:C.blue,alignItems:"center",justifyContent:"center"},
  avatarText:{color:"#fff",fontWeight:"900",fontSize:17}
});
