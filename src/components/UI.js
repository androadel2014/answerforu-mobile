import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from "react";
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
    <KeyboardAwareScrollView contentContainerStyle={[s.content, { paddingBottom: 42 }, contentStyle]}>
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
    blue: { backgroundColor: C.blue, borderColor: C.blue },
    danger: { backgroundColor: "#fff1f2", borderColor: "#fecdd3" },
    ghost: { backgroundColor: "transparent", borderColor: C.line }
  };
  const textColor = variant === "dark" || variant === "blue" ? "#fff" : variant === "danger" ? C.red : C.ink;
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [s.btn, variants[variant], style, disabled && { opacity: .45 }, pressed && !disabled && { transform: [{ scale: .985 }], opacity: .92 }]}>
      <Txt lang={lang} style={{ color: textColor, textAlign: "center", fontSize: 16 }} weight="800">{title}</Txt>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline = false, lang = "ar", autoCapitalize = "none", ...props }) {
  return <View style={{ gap: 7 }}>
    {label ? <Txt lang={lang} style={{ fontSize: 16, color: C.muted }} weight="800">{label}</Txt> : null}
    <AwareTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
      textAlign={isRTL(lang) ? "right" : "left"}
      style={[s.input, multiline && { minHeight: 104, textAlignVertical: "top" }]}
      returnKeyType={multiline ? "default" : "next"}
      {...props}
    />
  </View>;
}

export function Loading({ lang = "ar", label }) {
  return <View style={s.center}><ActivityIndicator size="small" color={C.blue} /><Txt lang={lang} style={{ color: C.muted, marginTop: 10 }}>{label || (isRTL(lang) ? "جاري التحميل..." : "Loading...")}</Txt></View>;
}

export function Empty({ lang = "ar", title, body, onRetry }) {
  return <Card style={{ alignItems: "center", paddingVertical: 30 }}><Txt lang={lang} weight="900" style={{ fontSize: 17, textAlign: "center" }}>{title}</Txt>{body ? <Txt lang={lang} style={{ color: C.muted, marginTop: 8, textAlign: "center", lineHeight: 24 }}>{body}</Txt> : null}{onRetry ? <Btn lang={lang} title={lang === "ar" ? "جرّب تاني" : lang === "es" ? "Reintentar" : "Try again"} onPress={onRetry} variant="blue" /> : null}</Card>;
}

export const s = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 32 },
  text: { color: C.ink, fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: radius.lg, padding: 16, gap: 8, ...shadow },
  cardDark: { backgroundColor: C.navy, borderColor: C.navy },
  pill: { alignSelf: "flex-start", borderWidth: 1, borderColor: C.line, backgroundColor: C.soft, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  btn: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  input: { width: "100%", minHeight: 54, borderWidth: 1, borderColor: "#A8BBD0", borderRadius: radius.md, backgroundColor: "#fff", paddingHorizontal: 14, color: C.ink, fontSize: 16 },
  center: { paddingVertical: 40, alignItems: "center", justifyContent: "center" }
});
