import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../theme";
import { APP_VERSION } from "../config";
import { tr } from "../i18n";
import { AirmailStripe, BrandMark, Icon, LangSwitch, Wordmark } from "./Airmail";

// Airmail brand header (presentation only). Navy strip with the always-visible
// العربية / English / Español switch, then the cream bar: mark + wordmark, and
// "Sign in" (guest) or notifications + "My account" (member). Routes are unchanged.
export default function AppHeader({ lang, user, onProfile, onNotifications, onLang, onSetLang }) {
  const initial = String(user?.display_name || user?.name || user?.username || "A").trim().charAt(0).toUpperCase() || "A";
  const setLang = onSetLang || (() => onLang?.());
  return <View style={st.shell} accessibilityLabel={`AnswerForU v${APP_VERSION}`}>
    <AirmailStripe height={5} bg={C.navy} />
    <View style={[st.langBar, { direction: lang === "ar" ? "rtl" : "ltr" }]}><LangSwitch lang={lang} onSet={setLang} /></View>
    <View style={[st.wrap, { direction: lang === "ar" ? "rtl" : "ltr" }]}>
      <View style={st.logoMark}><BrandMark size={40} /></View>
      <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
        <Wordmark size={19} />
        <Text numberOfLines={1} style={st.tag}>{tr(lang, "دليلك للحياة في أمريكا", "Your guide to life in America", "Tu guía en Estados Unidos")}</Text>
      </View>
      <View style={st.actions}>
        {user ? <Pressable accessibilityRole="button" accessibilityLabel={tr(lang, "الإشعارات", "Notifications", "Notificaciones")} onPress={onNotifications} style={st.bell} hitSlop={4}>
          <Icon name="bell" size={19} color={C.navy} /><View style={st.bellDot} />
        </Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={user ? tr(lang, "حسابي", "My account", "Mi cuenta") : tr(lang, "دخول", "Sign in", "Entrar")} onPress={onProfile} style={st.account}>
          {user ? <View style={st.avatar}><Text style={st.avatarText}>{initial}</Text></View> : <Icon name="user" size={17} color={C.navy} />}
          <Text numberOfLines={1} style={st.accountText}>{user ? tr(lang, "حسابي", "Account", "Cuenta") : tr(lang, "دخول", "Sign in", "Entrar")}</Text>
        </Pressable>
      </View>
    </View>
    <View style={st.rule} />
  </View>;
}
const st = StyleSheet.create({
  shell: { backgroundColor: C.paper },
  langBar: { backgroundColor: C.navy, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center" },
  wrap: { minHeight: 66, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: C.paper, flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  tag: { color: C.muted, fontSize: 11, fontWeight: "700", marginTop: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  bell: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: C.line, backgroundColor: C.cream, alignItems: "center", justifyContent: "center" },
  bellDot: { position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: C.airRed },
  account: { minHeight: 42, borderRadius: 999, backgroundColor: C.gold, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 7, maxWidth: 140 },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.navy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: C.gold, fontWeight: "900", fontSize: 13 },
  accountText: { color: C.navy, fontWeight: "900", fontSize: 15, flexShrink: 1 },
  rule: { height: 1, backgroundColor: C.line }
});
