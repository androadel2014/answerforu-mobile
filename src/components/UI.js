import React, { createContext, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { C, radius, shadow, spacing, type } from "../theme";
import { isRTL } from "../i18n";
import { AirmailDashes, AirmailFrame, AirmailStripe, BrandMark, EmptyArt, Icon, Postmark, Stamp, fwdIcon } from "./Airmail";
export * from "./Airmail";

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

// `balanced` asks the platform for balanced line breaks (Android textBreakStrategy, iOS standard
// line-break strategy) so headlines never end on a single-word orphan line.
export function Txt({ children, lang = "ar", style, weight = "600", numberOfLines, floor = type.body, balanced = false }) {
  const flattened = StyleSheet.flatten(style) || {};
  // Do not let legacy micro-fonts shrink body text (default floor 16). Compact chips, eyebrows and
  // meta lines may opt into a lower floor, but never below the app-wide type floor (12px).
  const minSize = Math.max(type.minText, Number(floor) || type.body);
  const fontSize = Math.max(minSize, Number(flattened.fontSize) || type.body);
  return <Text numberOfLines={numberOfLines} textBreakStrategy={balanced ? "balanced" : undefined} lineBreakStrategyIOS={balanced ? "standard" : undefined} style={[s.text, { fontWeight: weight, textAlign: isRTL(lang) ? "right" : "left", writingDirection: isRTL(lang) ? "rtl" : "ltr" }, style, {fontSize, lineHeight: Math.max(fontSize * 1.32, Number(flattened.lineHeight) || 0)}]}>{children}</Text>;
}

// Shared horizontal chip / tab / filter row (fix round). One pattern for every screen:
//  • never wider than the viewport (alignSelf stretch + maxWidth 100%), so nothing clips;
//  • LTR (en/es): a normal horizontal scroller starting at the left edge;
//  • RTL (ar): Android clips the leading items of an RTL horizontal ScrollView at the left edge,
//    so the scroller itself stays LTR, the items are laid out in reverse and the row starts
//    scrolled to its right end — the first chip sits at the right edge, and every chip can be
//    reached by scrolling, exactly like the mirrored layout;
//  • wrap: a wrapping row instead of a scroller (short tab sets).
export function ChipRow({ lang = "ar", children, wrap = false, gap = 7, style, contentStyle, scrollRef }) {
  const rtl = isRTL(lang);
  const own = useRef(null);
  const ref = scrollRef || own;
  const items = React.Children.toArray(children).filter(Boolean);
  if (wrap) return <View style={[s.chipWrap, { gap, direction: rtl ? "rtl" : "ltr" }, style]}>{items}</View>;
  const ordered = rtl ? items.slice().reverse().map((child, i) => <View key={`rtl-${child.key ?? i}`} style={s.chipCell}>{child}</View>) : items;
  return <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled"
    style={[s.chipScroll, style]}
    onContentSizeChange={rtl ? () => ref.current?.scrollToEnd?.({ animated: false }) : undefined}
    contentContainerStyle={[s.chipContent, { gap, justifyContent: rtl ? "flex-end" : "flex-start" }, contentStyle]}>
    {ordered}
  </ScrollView>;
}

export function Card({ children, style, dark = false }) {
  // Dark cards are page "letters": navy with the airmail edge across the top.
  return <View style={[s.card, dark && s.cardDark, style]}>{dark ? <View pointerEvents="none" style={s.cardDarkStripe}><AirmailStripe height={6} bg={C.navy} /></View> : null}{children}</View>;
}

export function Pill({ children, style, dark = false }) {
  return <View style={[s.pill, dark && { backgroundColor: "rgba(255,255,255,.12)", borderColor: "rgba(255,255,255,.18)" }, style]}>{children}</View>;
}

// Airmail buttons: solid navy / royal / gold with a darker pressed edge, or cream outline.
export function Btn({ title, onPress, variant = "dark", disabled = false, style, lang = "ar", icon }) {
  const variants = {
    dark: { backgroundColor: C.navy, borderColor: C.navy, borderBottomColor: C.navy2 },
    light: { backgroundColor: C.paper, borderColor: C.navy, borderBottomColor: C.navy },
    blue: { backgroundColor: C.royal, borderColor: C.royal, borderBottomColor: C.royalDark },
    gold: { backgroundColor: C.gold, borderColor: C.gold, borderBottomColor: C.goldDeep },
    danger: { backgroundColor: C.redSoft, borderColor: C.redLine, borderBottomColor: C.redLine },
    ghost: { backgroundColor: "transparent", borderColor: "transparent", borderBottomColor: "transparent" }
  };
  const textColor = variant === "dark" || variant === "blue" ? C.white : variant === "danger" ? C.red : variant === "ghost" ? C.royal : C.navy;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={typeof title === "string" ? title : undefined} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.btn, variants[variant] || variants.dark, variant === "ghost" && { borderBottomWidth: 0 }, style, disabled && { opacity: .45 }, pressed && !disabled && { transform: [{ translateY: 1.5 }], borderBottomWidth: 1.5 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {icon && icon !== "forward" ? <Icon name={icon} size={18} color={textColor} /> : null}
        <Txt lang={lang} style={{ color: textColor, textAlign: "center", fontSize: 16, flexShrink: 1 }} weight="900">{title}</Txt>
        {icon === "forward" ? <Icon name={fwdIcon(lang)} size={18} color={textColor} /> : null}
      </View>
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
      placeholderTextColor={C.placeholder}
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
  return <View style={s.center}><ActivityIndicator size="small" color={C.royal} /><Txt lang={lang} style={{ color: C.muted, marginTop: 10 }}>{label || (isRTL(lang) ? "جاري التحميل..." : lang === "es" ? "Cargando..." : "Loading...")}</Txt></View>;
}

// ONE error surface per screen (fix round). Screens render <ErrorNotice> instead of ad-hoc red
// cards; while any ErrorNotice is mounted the app-level connection banner stays hidden, so the
// same failure is never reported twice. Lists show their empty state only when there is no error.
export const ErrorSurfaceContext = createContext(null);
export function ErrorNotice({ lang = "ar", message, onRetry, retryLabel, action, style }) {
  const report = useContext(ErrorSurfaceContext);
  const shown = Boolean(message);
  useEffect(() => { if (!shown) return undefined; report?.(1); return () => report?.(-1); }, [shown, report]);
  if (!shown) return null;
  const retry = retryLabel || (lang === "ar" ? "جرّب تاني" : lang === "es" ? "Reintentar" : "Try again");
  return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.errorCard, style]}>
    <View style={s.errorHead}>
      <View style={s.errorIcon}><Icon name="alert-circle" size={18} color={C.red} /></View>
      <Txt lang={lang} weight="800" style={{ color: C.navy, flex: 1, lineHeight: 23 }}>{String(message)}</Txt>
    </View>
    {onRetry || action ? <View style={s.errorActions}>
      {onRetry ? <Btn lang={lang} icon="refresh-cw" variant="light" title={retry} onPress={onRetry} style={{ flexGrow: 1 }} /> : null}
      {action ? <Btn lang={lang} icon={action.icon || "forward"} variant="ghost" title={action.title} onPress={action.onPress} style={{ flexGrow: 1 }} /> : null}
    </View> : null}
  </View>;
}

// Self-explaining empty state: dashed letter box with the airmail edge and a fan of stamps.
// `art` (messages | saved | cv | requests) swaps the generic stamp fan for that list's own picture;
// pair it with `action` so every empty list offers a clear next step.
export function Empty({ lang = "ar", title, body, onRetry, action, art }) {
  return <View style={s.empty}>
    <AirmailStripe height={6} style={{ alignSelf: "stretch", marginTop: -1 }} />
    {art ? <View style={{ marginTop: 16, marginBottom: 2, alignSelf: "stretch" }}><EmptyArt kind={art} /></View> : <View style={s.stampFan}>{[["mail", "-8deg", 0], ["star", "0deg", 1], ["map-pin", "8deg", 2]].map(([n, r, t]) =>
      <Stamp key={n} style={{ width: 62, height: 70, padding: 0, alignItems: "center", justifyContent: "center", transform: [{ rotate: r }], marginHorizontal: -3 }}><Icon name={n} size={24} color={[C.royal, C.goldDark, C.red][t]} /></Stamp>)}</View>}
    <Txt lang={lang} weight="900" style={{ fontSize: 21, textAlign: "center", color: C.navy, paddingHorizontal: 16 }}>{title}</Txt>
    {body ? <Txt lang={lang} style={{ color: C.muted, textAlign: "center", lineHeight: 24, paddingHorizontal: 18 }}>{body}</Txt> : null}
    {onRetry ? <Btn lang={lang} icon="refresh-cw" title={lang === "ar" ? "جرّب تاني" : lang === "es" ? "Reintentar" : "Try again"} onPress={onRetry} variant="blue" style={{ alignSelf: "center", minWidth: 180, marginTop: 6 }} /> : null}
    {action ? <Btn lang={lang} icon={action.icon || "plus"} title={action.title} onPress={action.onPress} variant="blue" style={{ alignSelf: "center", minWidth: 210, marginTop: 6 }} /> : null}
  </View>;
}

export const s = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, gap: 16, paddingBottom: 40 },
  text: { color: C.ink, fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: radius.lg, padding: 18, gap: 11, ...shadow },
  cardDark: { backgroundColor: C.navy, borderColor: C.navy2, overflow: "hidden", paddingTop: 26 },
  cardDarkStripe: { position: "absolute", top: 0, left: 0, right: 0 },
  pill: { alignSelf: "flex-start", borderWidth: 1, borderColor: C.royalLine, backgroundColor: C.royalSoft, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 6 },
  btn: { minHeight: 52, borderWidth: 1.5, borderBottomWidth: 4, borderRadius: 14, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  input: { width: "100%", minHeight: 54, borderWidth: 1.3, borderColor: C.inputBorder, borderRadius: 13, backgroundColor: C.paper, paddingHorizontal: 16, color: C.ink, fontSize: 16 },
  inputFocus: { backgroundColor: C.white, borderColor: C.royal, borderWidth: 2 },
  emptyArt: { width: 68, height: 68, borderRadius: 20, backgroundColor: C.royalSoft, alignItems: "center", justifyContent: "center", marginBottom: 5 },
  empty: { backgroundColor: C.paper, borderWidth: 1.5, borderStyle: "dashed", borderColor: C.dash, borderRadius: 20, overflow: "hidden", alignItems: "center", paddingBottom: 26, gap: 10 },
  stampFan: { flexDirection: "row", justifyContent: "center", marginTop: 18, marginBottom: 6, direction: "ltr" },
  center: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
  errorCard: { backgroundColor: C.paper, borderWidth: 1.3, borderColor: C.redLine, borderLeftWidth: 5, borderLeftColor: C.red, borderRadius: radius.md, padding: 14, gap: 12 },
  errorHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  errorIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.redSoft, alignItems: "center", justifyContent: "center" },
  errorActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipScroll: { flexGrow: 0, alignSelf: "stretch", maxWidth: "100%", direction: "ltr" },
  chipContent: { flexGrow: 1, flexDirection: "row", alignItems: "center", paddingVertical: 2, paddingHorizontal: 1 },
  chipCell: { direction: "rtl" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", alignSelf: "stretch", maxWidth: "100%" }
});

// Airmail section hero. Variants match the approved mockups:
//  "cream"       – big navy title on the paper background (Learn, Marketplace, CV, sections)
//  "envelope"    – cream letter framed by the airmail border with stamp + postmark (Home, Sign in)
//  "blue"        – the ONE dark hero: navy-led letter panel with the airmail edge, royal route
//                  dots and gold pin — same scheme as the navy cards on Recommend / Resources
//                  (Journey, Feed, Sign in). Full-saturation royal heroes were retired in this fix round.
//  "certificate" – gold-ruled certificate with the ribbon medal (Citizenship)
// `icon` accepts either a Feather icon name or a legacy glyph.
export function SectionHero({lang="ar",eyebrow,title,subtitle,icon="star",children,style,compact=false,variant="cream",titleSize}) {
  const isName=/^[a-z][a-z0-9-]*$/.test(String(icon||""));
  const blue=variant==="blue";
  const eyeColor=blue?C.onDarkSoft:C.royal;
  const eyebrowRow=eyebrow||icon?<View style={heroStyles.eyebrowRow}>
    {isName?<Icon name={icon} size={16} color={blue?C.gold:C.royal}/>:<Txt style={{color:blue?C.gold:C.royal,fontSize:16}} weight="900">{icon}</Txt>}
    {eyebrow?<Txt lang={lang} style={{color:eyeColor,fontSize:14,flexShrink:1}} weight="900">{eyebrow}</Txt>:null}
  </View>:null;
  const tSize=titleSize||(compact?30:36);
  const titleEl=<Txt lang={lang} balanced style={{color:blue?C.white:C.navy,fontSize:tSize,lineHeight:Math.round(tSize*1.33)}} weight="900">{title}</Txt>;
  const subEl=subtitle?<Txt lang={lang} style={{color:blue?C.onDarkSoft:C.muted,lineHeight:26,fontSize:16}} weight="500">{subtitle}</Txt>:null;
  if(variant==="envelope")return <AirmailFrame style={style} contentStyle={{padding:compact?18:22,gap:12}}>
    <View style={heroStyles.envelopeDeco}><Postmark size={46}/><Stamp style={heroStyles.miniStamp}><Icon name="send" size={22} color={C.royal}/></Stamp></View>
    {eyebrowRow}{titleEl}{subEl}{children}
  </AirmailFrame>;
  if(blue)return <View style={[heroStyles.blue,compact&&heroStyles.compact,style]}>
    <View pointerEvents="none" style={heroStyles.blueStripe}><AirmailStripe height={6} bg={C.navy}/></View>
    <View pointerEvents="none" style={heroStyles.route}>{[0,1,2,3,4,5,6].map(i=><View key={i} style={[heroStyles.routeDot,{marginTop:i%3===0?0:i%3===1?10:4}]}/>)}<View style={heroStyles.pin}><View style={heroStyles.pinDot}/></View></View>
    {eyebrowRow}{titleEl}{subEl}{children}
  </View>;
  if(variant==="certificate")return <View style={[heroStyles.certOuter,style]}>
    <View pointerEvents="none" style={heroStyles.medalWrap}><View style={heroStyles.ribbonRow}><View style={[heroStyles.ribbon,{transform:[{rotate:"18deg"}]}]}/><View style={[heroStyles.ribbon,{transform:[{rotate:"-18deg"}]}]}/></View><View style={heroStyles.medal}><View style={heroStyles.medalInner}><Icon name="star" size={22} color={C.navy}/></View></View></View>
    <View style={[heroStyles.certInner,compact&&{padding:18}]}>{eyebrowRow}{titleEl}{subEl}{children}</View>
  </View>;
  return <View style={[heroStyles.cream,style]}>{eyebrowRow}{titleEl}{subEl}<AirmailDashes/>{children}</View>;
}
export function SectionHeading({lang="ar",title,caption,action,eyebrow}) {
  return <View style={{gap:4,marginTop:6,marginBottom:2}}>
    {eyebrow?<Txt lang={lang} style={{color:C.royal,fontSize:14}} weight="900">{eyebrow}</Txt>:null}
    <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
      <Txt lang={lang} style={{fontSize:24,lineHeight:32,color:C.navy,flex:1}} weight="900">{title}</Txt>
      {action||null}
    </View>
    {caption?<Txt lang={lang} style={{color:C.muted}}>{caption}</Txt>:null}
    <View style={{flexDirection:"row",gap:5}}>{[C.airBlue,C.airRed].map((c,i)=><View key={i} style={{width:16,height:4,borderRadius:2,backgroundColor:c,transform:[{skewX:"-30deg"}]}}/>)}</View>
  </View>;
}
const heroStyles=StyleSheet.create({
  cream:{gap:10,paddingTop:6,paddingBottom:4},
  blue:{position:"relative",overflow:"hidden",borderRadius:radius.lg,backgroundColor:C.navy,padding:22,paddingTop:62,gap:10,minHeight:190,borderWidth:1,borderColor:C.navy2,...shadow},
  compact:{padding:18,paddingTop:56,minHeight:160},
  blueStripe:{position:"absolute",top:0,left:0,right:0},
  route:{position:"absolute",top:18,left:22,right:22,height:40,flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",direction:"ltr"},
  routeDot:{width:6,height:6,borderRadius:3,backgroundColor:C.royalLine},
  pin:{width:24,height:30,borderTopLeftRadius:12,borderTopRightRadius:12,borderBottomLeftRadius:12,borderBottomRightRadius:2,backgroundColor:C.gold,transform:[{rotate:"45deg"}],alignItems:"center",justifyContent:"center",marginTop:-4},
  pinDot:{width:8,height:8,borderRadius:4,backgroundColor:C.navy},
  eyebrowRow:{flexDirection:"row",alignItems:"center",gap:8},
  envelopeDeco:{flexDirection:"row",alignItems:"center",justifyContent:"flex-end",gap:6,marginBottom:-4,direction:"ltr"},
  miniStamp:{width:44,height:48,padding:0,borderRadius:3,backgroundColor:C.white,alignItems:"center",justifyContent:"center"},
  certOuter:{marginTop:30,backgroundColor:C.paper,borderRadius:22,borderWidth:1,borderColor:C.line,padding:8,...shadow},
  certInner:{borderWidth:2,borderColor:C.gold,borderRadius:16,padding:22,paddingTop:44,gap:11},
  medalWrap:{position:"absolute",top:-30,alignSelf:"center",left:0,right:0,alignItems:"center",zIndex:2},
  medal:{width:62,height:62,borderRadius:31,backgroundColor:C.gold,borderWidth:4,borderStyle:"dotted",borderColor:C.goldDeep,alignItems:"center",justifyContent:"center"},
  medalInner:{width:42,height:42,borderRadius:21,borderWidth:1,borderStyle:"dashed",borderColor:C.navy,alignItems:"center",justifyContent:"center"},
  ribbonRow:{position:"absolute",top:44,flexDirection:"row",gap:6},
  ribbon:{width:14,height:28,backgroundColor:C.airRed,borderBottomLeftRadius:2,borderBottomRightRadius:2}
});
