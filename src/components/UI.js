import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { C, radius, shadow, spacing, type } from "../theme";
import { isRTL } from "../i18n";

const KeyboardScrollContext = createContext(null);

export const KeyboardAwareScrollView = forwardRef(function KeyboardAwareScrollView({ children, contentContainerStyle, style, onScroll, scrollEventThrottle = 16, ...props }, forwardedRef) {
  const innerRef = useRef(null);
  const focusedRef = useRef(null);
  const keyboardTopRef = useRef(null);
  const scrollYRef = useRef(0);
  useImperativeHandle(forwardedRef, () => innerRef.current);

  const adjustFocused = useCallback(() => {
    const input = focusedRef.current?.current || focusedRef.current;
    if (!input?.measureInWindow) return;
    // Measure against the real keyboard top after Android has resized the window.
    input.measureInWindow((x, y, width, height) => {
      const keyboardTop = keyboardTopRef.current ?? (Dimensions.get("screen").height - 300);
      const desiredBottom = keyboardTop - (Platform.OS === "ios" ? 28 : 34);
      const actualBottom = y + height;
      if (actualBottom > desiredBottom) {
        const delta = actualBottom - desiredBottom + 18;
        innerRef.current?.scrollTo?.({ y: Math.max(0, scrollYRef.current + delta), animated: true });
      }
    });
  }, []);

  const ensureVisible = useCallback((inputRef) => {
    focusedRef.current = inputRef;
    // Run more than once because onFocus fires before the soft keyboard has fully opened.
    [40, 160, 320].forEach((delay) => setTimeout(adjustFocused, delay));
  }, [adjustFocused]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const a = Keyboard.addListener(showEvent, (event) => {
      const screenY = Number(event?.endCoordinates?.screenY);
      const keyboardHeight = Number(event?.endCoordinates?.height);
      keyboardTopRef.current = Number.isFinite(screenY) && screenY > 0
        ? screenY
        : Number.isFinite(keyboardHeight) && keyboardHeight > 0
          ? Dimensions.get("screen").height - keyboardHeight
          : null;
      [0, 80, 180].forEach((delay) => setTimeout(adjustFocused, delay));
    });
    const b = Keyboard.addListener("keyboardDidHide", () => {
      keyboardTopRef.current = null;
      focusedRef.current = null;
    });
    return () => { a.remove(); b.remove(); };
  }, [adjustFocused]);

  return <KeyboardScrollContext.Provider value={ensureVisible}>
    <ScrollView
      ref={innerRef}
      style={[s.flex, style]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={scrollEventThrottle}
      onScroll={(event) => {
        scrollYRef.current = Number(event?.nativeEvent?.contentOffset?.y || 0);
        onScroll?.(event);
      }}
      contentContainerStyle={contentContainerStyle}
      {...props}
    >{children}</ScrollView>
  </KeyboardScrollContext.Provider>;
});

export const AwareTextInput = forwardRef(function AwareTextInput({ onFocus, ...props }, forwardedRef) {
  const localRef = useRef(null);
  const ensureVisible = useContext(KeyboardScrollContext);
  useImperativeHandle(forwardedRef, () => localRef.current);
  return <TextInput
    ref={localRef}
    {...props}
    onFocus={(event) => {
      ensureVisible?.(localRef);
      onFocus?.(event);
    }}
  />;
});

export function Screen({ children, lang = "ar", scroll = true, refreshing = false, onRefresh, contentStyle }) {
  const rtl = isRTL(lang);
  const body = scroll ? (
    <KeyboardAwareScrollView contentContainerStyle={[s.content, { paddingBottom: 46 }, contentStyle]}>
      {children}
    </KeyboardAwareScrollView>
  ) : <View style={[s.flex, contentStyle]}>{children}</View>;
  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
      <View style={[s.flex, { direction: rtl ? "rtl" : "ltr" }]}>{body}</View>
    </KeyboardAvoidingView>
  );
}

export function Txt({ children, lang = "ar", style, weight = "600", numberOfLines }) {
  const flattened = StyleSheet.flatten(style) || {};
  // Do not let legacy micro-fonts shrink body text. Compact metadata uses the same readable scale.
  const fontSize = Math.max(16, Number(flattened.fontSize) || 16);
  return <Text numberOfLines={numberOfLines} style={[s.text, { fontWeight: weight, textAlign: isRTL(lang) ? "right" : "left", writingDirection: isRTL(lang) ? "rtl" : "ltr" }, style, {fontSize, lineHeight: Math.max(fontSize * 1.32, Number(flattened.lineHeight) || 0)}]}>{children}</Text>;
}

export function Card({ children, style, dark = false }) {
  return <View style={[s.card, dark && s.cardDark, style]}>{children}</View>;
}

export function Pill({ children, style, dark = false }) {
  return <View style={[s.pill, dark && { backgroundColor: "rgba(255,255,255,.09)", borderColor: "rgba(255,255,255,.12)" }, style]}>{children}</View>;
}

export function Btn({ title, onPress, variant = "dark", disabled = false, style, lang = "ar" }) {
  const variants = {
    dark: { backgroundColor: C.navy, borderColor: C.navy },
    light: { backgroundColor: "#fff", borderColor: C.line },
    blue: { backgroundColor: C.teal, borderColor: C.teal },
    danger: { backgroundColor: "#fff1f2", borderColor: "#fecdd3" },
    ghost: { backgroundColor: "transparent", borderColor: "transparent" }
  };
  const textColor = variant === "dark" || variant === "blue" ? "#fff" : variant === "danger" ? C.red : C.ink;
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [s.btn, variants[variant], style, disabled && { opacity: .45 }, pressed && !disabled && { transform: [{ scale: .985 }], opacity: .92 }]}>
      <Txt lang={lang} style={{ color: textColor, textAlign: "center", fontSize: 16 }} weight="800">{title}</Txt>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline = false, lang = "ar", autoCapitalize = "none", ...props }) {
  const [focused,setFocused] = useState(false);
  return <View style={{ gap: 8 }}>
    {label ? <Txt lang={lang} style={{ fontSize: 16, color: C.muted }} weight="800">{label}</Txt> : null}
    <AwareTextInput
      value={value}
      onChangeText={onChangeText}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
      textAlign={isRTL(lang) ? "right" : "left"}
      style={[s.input, focused && s.inputFocus, multiline && { minHeight: 104, textAlignVertical: "top" }]}
      returnKeyType={multiline ? "default" : "next"}
      {...props}
    />
  </View>;
}

export function Loading({ lang = "ar", label }) {
  return <View style={s.center}><ActivityIndicator size="small" color={C.blue} /><Txt lang={lang} style={{ color: C.muted, marginTop: 10 }}>{label || (isRTL(lang) ? "جاري التحميل..." : "Loading...")}</Txt></View>;
}

export function Empty({ lang = "ar", title, body, onRetry }) {
  return <Card style={{ alignItems: "center", paddingVertical: 32, gap: 9 }}><View style={s.emptyArt}><Txt style={{fontSize:30,color:C.teal}}>✧</Txt></View><Txt lang={lang} weight="900" style={{ fontSize: 17, textAlign: "center" }}>{title}</Txt>{body ? <Txt lang={lang} style={{ color: C.muted, marginTop: 8, textAlign: "center", lineHeight: 24 }}>{body}</Txt> : null}{onRetry ? <Btn lang={lang} title={lang === "ar" ? "جرّب تاني" : lang === "es" ? "Reintentar" : "Try again"} onPress={onRetry} variant="blue" /> : null}</Card>;
}

export const s = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 18, gap: 16, paddingBottom: 40 },
  text: { color: C.ink, fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: radius.lg, padding: 19, gap: 11, ...shadow },
  cardDark: { backgroundColor: C.navy, borderColor: C.navy2 },
  pill: { alignSelf: "flex-start", borderWidth: 1, borderColor: "#CDE9E3", backgroundColor: C.soft, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  btn: { minHeight: 50, borderWidth: 1, borderRadius: 16, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  input: { width: "100%", minHeight: 54, borderWidth: 1.2, borderColor: "#BDD5D3", borderRadius: 16, backgroundColor: "#F9FCFC", paddingHorizontal: 16, color: C.ink, fontSize: 16 },
  inputFocus: { backgroundColor: C.white, borderColor: C.teal, borderWidth: 2 },
  emptyArt: {width:68,height:68,borderRadius:24,backgroundColor:C.mist,alignItems:"center",justifyContent:"center",marginBottom:5},
  center: { paddingVertical: 40, alignItems: "center", justifyContent: "center" }
});

// Reusable editorial hero. Intentionally built with native Views (no new native
// dependencies, permissions, images or network calls).
export function SectionHero({lang="ar",eyebrow,title,subtitle,icon="✦",children,style,compact=false}) {
  return <View style={[heroStyles.shell,compact&&heroStyles.compact,style]}>
    <View pointerEvents="none" style={heroStyles.orbA}/><View pointerEvents="none" style={heroStyles.orbB}/>
    <View style={heroStyles.eyebrowRow}>
      <View style={heroStyles.badge}><Txt style={{color:C.sea,fontSize:14}} weight="900">{icon}</Txt></View>
      {eyebrow?<Txt lang={lang} style={{color:C.sea,fontSize:14,flexShrink:1}} weight="800">{eyebrow}</Txt>:null}
    </View>
    <Txt lang={lang} style={{color:"#FFFFFF",fontSize:compact?25:30,lineHeight:compact?36:43}} weight="900">{title}</Txt>
    {subtitle?<Txt lang={lang} style={{color:"#D0E8E8",lineHeight:25,fontSize:16}} weight="500">{subtitle}</Txt>:null}
    {children}
    <View style={heroStyles.underline}/>
  </View>;
}
export function SectionHeading({lang="ar",title,caption,action}) {
  return <View style={{gap:5,marginTop:3,marginBottom:2}}>
    <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
      <View style={{width:5,height:25,borderRadius:9,backgroundColor:C.teal}}/>
      <Txt lang={lang} style={{fontSize:22,color:C.ink,flex:1}} weight="900">{title}</Txt>
      {action||null}
    </View>
    {caption?<Txt lang={lang} style={{color:C.muted,marginHorizontal:14}}>{caption}</Txt>:null}
  </View>;
}
const heroStyles=StyleSheet.create({
  shell:{position:"relative",overflow:"hidden",borderRadius:28,backgroundColor:C.navy,padding:24,gap:12,minHeight:177},
  compact:{padding:20,minHeight:150,gap:9},
  orbA:{position:"absolute",width:190,height:190,borderRadius:95,top:-105,right:-58,backgroundColor:"#146476",opacity:.65},
  orbB:{position:"absolute",width:120,height:120,borderRadius:60,bottom:-81,left:-32,backgroundColor:C.teal,opacity:.28},
  eyebrowRow:{flexDirection:"row",alignItems:"center",gap:9},
  badge:{width:33,height:33,borderRadius:12,backgroundColor:"#17596A",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#337C83"},
  underline:{width:55,height:4,borderRadius:99,backgroundColor:C.sea,marginTop:4}
});
