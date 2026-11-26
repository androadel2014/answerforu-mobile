import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Appearance, BackHandler, Keyboard, Platform, Pressable, StatusBar, StyleSheet, View, useColorScheme } from "react-native";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "./src/components/AppHeader";
import BottomNav from "./src/components/BottomNav";
import { api } from "./src/api/client";
import { clearSession, getLang, getIntroDone, setIntroDone, getToken, getUser, setLangStored, setToken, setUser as storeUser, getThemePref, setThemePref } from "./src/auth/storage";
import { C, themed, resolveScheme, setColorScheme } from "./src/theme";
import { AirmailStripe, BrandMark, Btn, ErrorSurfaceContext, Icon, LangSwitch, Txt, Wordmark } from "./src/components/UI";
import { tr } from "./src/i18n";
import { friendlyError, withTimeout, STARTUP_TIMEOUT_MS } from "./src/logic/appSafety.mjs";
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import JourneyScreen from "./src/screens/JourneyScreen";
import LearnScreen from "./src/screens/LearnScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import FeedScreen from "./src/screens/FeedScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import ThreadScreen from "./src/screens/ThreadScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CVScreen from "./src/screens/CVScreen";
import DirectoryScreen from "./src/screens/DirectoryScreen";
import RecommendScreen from "./src/screens/RecommendScreen";
import GlossaryScreen from "./src/screens/GlossaryScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import AllSectionsScreen from "./src/screens/AllSectionsScreen";
import SavedScreen from "./src/screens/SavedScreen";
import VerificationScreen from "./src/screens/VerificationScreen";
import MyRequestsScreen from "./src/screens/MyRequestsScreen";
import AdminScreen from "./src/screens/AdminScreen";
import AdminManageScreen from "./src/screens/AdminManageScreen";
import ListingDetailScreen from "./src/screens/ListingDetailScreen";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import CitizenshipScreen from "./src/screens/CitizenshipScreen";
import SurvivalEnglishScreen from "./src/screens/SurvivalEnglishScreen";
import OfflinePacksScreen from "./src/screens/OfflinePacksScreen";
import ScreenErrorBoundary from "./src/components/ScreenErrorBoundary";
import WelcomeTour from "./src/components/WelcomeTour";
import PublishedLibraryScreen from "./src/screens/PublishedLibraryScreen";

const MAIN = new Set(["home","journey","learn","community","all"]);
const MEMBER_SCREENS = new Set([ "messages", "thread", "profile", "cv", "notifications", "saved", "verification", "myRequests", "admin", "adminContent"]);

function Root() {
  const [ready,setReady]=useState(false), [token,setTokenState]=useState(""), [user,setUser]=useState(null), [lang,setLang]=useState("ar");
  const [route,setRoute]=useState({name:"home",params:null}), [history,setHistory]=useState([]), [keyboardOpen,setKeyboardOpen]=useState(false);
  const [afterLogin, setAfterLogin] = useState(null);
  const [showTour,setShowTour]=useState(false);
  const [screenRetry,setScreenRetry] = useState(0);
  const [bootError,setBootError]=useState(""); const [bootAttempt,setBootAttempt]=useState(0);
  // One error surface per screen: the connection banner is dismissible and stays hidden while the
  // current screen is already showing its own <ErrorNotice> for the same failure.
  const [bannerDismissed,setBannerDismissed]=useState(false), [inlineErrors,setInlineErrors]=useState(0);
  const reportInlineError=useCallback(delta=>setInlineErrors(n=>Math.max(0,n+delta)),[]);
  // 3.7.1 (tester item 7): dark mode — manual (light/dark) or automatic (follows the phone).
  // The live colour tokens are switched before any child renders, so every screen redraws in
  // the new appearance on the same pass (no remount: forms and scroll positions are kept).
  const [themePref,setThemePrefState]=useState("auto");
  const systemScheme=useColorScheme();
  const resolvedTheme=resolveScheme(themePref,systemScheme);
  setColorScheme(resolvedTheme);
  useEffect(()=>{let alive=true;withTimeout(getThemePref(),STARTUP_TIMEOUT_MS,"auto").then(v=>{if(alive)setThemePrefState(v||"auto")}).catch(()=>{});return()=>{alive=false};},[]);
  const changeTheme=useCallback(next=>{const v=next==="light"||next==="dark"?next:"auto";setThemePrefState(v);setThemePref(v).catch(()=>{});},[]);
  // 3.7.2: a manual Light / Dark choice is passed to the phone too, so native pieces (alerts, the
  // keyboard) match the app; "auto" removes the override and follows the phone again.
  useEffect(()=>{try{if(typeof Appearance?.setColorScheme==="function")Appearance.setColorScheme(themePref==="light"||themePref==="dark"?themePref:"auto");}catch{}},[themePref]);
  // 3.7.2 (expo-system-ui — Android automatic dark mode): the window behind the screens (seen during
  // transitions, behind the keyboard and the picker sheets) takes the active background colour.
  useEffect(()=>{try{SystemUI.setBackgroundColorAsync(C.bg)?.catch?.(()=>{});}catch{}},[resolvedTheme]);
  const bar=<StatusBar barStyle={resolvedTheme==="dark"?"light-content":"dark-content"} backgroundColor={C.bg}/>;
  // 3.7.1 (tester item 6): Arabic is right-to-left on EVERY screen, from the app root (the same
  // mirroring I18nManager.forceRTL gives, but applied live when the language changes — forceRTL
  // only takes effect after a full restart). Screens that never used <Screen> (Journey, listing
  // details, directory) were left-to-right in Arabic before this.
  const rootDir={direction:lang==="ar"?"rtl":"ltr"};

  useEffect(()=>{
    let alive=true;
    (async()=>{
      // Never wait indefinitely for a compromised/corrupt native store.
      const results=await Promise.allSettled([
        withTimeout(getToken(),STARTUP_TIMEOUT_MS,""),
        withTimeout(getUser(),STARTUP_TIMEOUT_MS,null),
        withTimeout(getLang(),STARTUP_TIMEOUT_MS,"ar"),
        withTimeout(getIntroDone(),STARTUP_TIMEOUT_MS,true)
      ]);
      if(!alive)return;
      const val=(i,defaultValue)=>results[i]?.status==="fulfilled"?results[i].value:defaultValue;
      const t=val(0,""), u=val(1,null), l=val(2,"ar");
      setLang(l||"ar");setTokenState(t||"");setUser(u||null);setShowTour(!val(3,true));
      if(results.some(x=>x.status==='rejected'))setBootError("storage");
      setReady(true); // Do not block first meaningful paint on an API request.
      if(t){try{
        const d=await withTimeout(api.me(),12000,null);
        if(d && alive){const me=d?.user||d?.profile||d?.data||d;setUser(me);storeUser(me).catch(()=>{});}
        else if(alive)setBootError("network");
      }catch(e){if(e.status===401){clearSession().catch(()=>{});if(alive){setTokenState("");setUser(null)}}else if(alive)setBootError("network");}}
    })().catch(()=>{if(alive){setReady(true);setBootError('storage')}});
    return()=>{alive=false};
  },[bootAttempt]);

  useEffect(()=>{ const a=Keyboard.addListener("keyboardDidShow",()=>setKeyboardOpen(true));const b=Keyboard.addListener("keyboardDidHide",()=>setKeyboardOpen(false));return()=>{a.remove();b.remove()};},[]);

  const navigate=useCallback((name,params=null,replace=false)=>{
    Keyboard.dismiss();
    if (!token && MEMBER_SCREENS.has(name)) {
      setAfterLogin({name, params});
      setRoute({name:"auth",params:null});
      return;
    }
    setRoute(prev=>{if(!replace)setHistory(h=>[...h,prev].slice(-20));return{name,params}});
  },[token]);
  const back=useCallback(()=>{Keyboard.dismiss();setHistory(h=>{if(!h.length){setRoute({name:"home",params:null});return[];}const next=[...h];const prev=next.pop();setRoute(prev);return next;});},[]);
  useEffect(()=>{const sub=BackHandler.addEventListener("hardwareBackPress",()=>{if(route.name!=="home"||history.length){back();return true;}return false;});return()=>sub.remove();},[route.name,history.length,back]);

  async function onAuth(data){const t=data?.token||data?.authToken||data?.jwt||"";const u=data?.user||data?.profile||data?.data||null;if(!t)throw new Error("Login response did not include a token");await setToken(t);await storeUser(u);setTokenState(t);setUser(u);setHistory([]);setRoute(afterLogin||{name:"home",params:null});setAfterLogin(null);}
  async function logout(){Keyboard.dismiss();await clearSession();setTokenState("");setUser(null);setHistory([]);setRoute({name:"home",params:null});}
  async function cycleLang(){const next=lang==="ar"?"en":lang==="en"?"es":"ar";setLang(next);await setLangStored(next);}
  // Direct pick from the always-visible العربية / English / Español switch.
  async function setLangTo(next){if(!["ar","en","es"].includes(next))return;setLang(next);await setLangStored(next).catch(()=>{});}
  async function updateUser(u){setUser(u);await storeUser(u);}

  if(!ready)return <View style={st.splash}>{bar}<AirmailStripe height={8} style={st.splashStripeTop}/><View style={st.mark}><BrandMark size={72}/></View><Wordmark size={26}/><ActivityIndicator style={{marginTop:22}} size="large" color={C.blue}/><Txt lang={lang} style={{marginTop:16,color:C.ink,textAlign:"center"}}>{tr(lang,"جاري التحميل…","Loading…","Cargando…")}</Txt><AirmailStripe height={8} style={st.splashStripeBottom}/></View>;
  if(showTour)return <SafeAreaView style={[st.safe,rootDir]} edges={["top","left","right","bottom"]}>{bar}<WelcomeTour lang={lang} onSetLang={setLangTo} onDone={()=>{setShowTour(false);setIntroDone().catch(()=>{})}}/></SafeAreaView>;
  if(route.name==="auth")return <SafeAreaView style={[st.safe,rootDir]}>{bar}<AuthScreen lang={lang} onAuth={onAuth} onLang={cycleLang} onSetLang={setLangTo} onBrowse={()=>{setAfterLogin(null);setRoute({name:"home",params:null})}}/></SafeAreaView>;

  const common={lang,user,navigate,params:route.params,back,onLogout:logout,onUser:updateUser,themePref,resolvedTheme,onTheme:changeTheme};
  let content=null;
  switch(route.name){
    case"home":content=<HomeScreen {...common}/>;break;
    case"journey":content=<JourneyScreen {...common}/>;break;
    case"learn":content=<LearnScreen {...common}/>;break;
    case"resources":content=<PublishedLibraryScreen {...common}/>;break;
    case"citizenship":content=<CitizenshipScreen {...common}/>;break;
    case"survival":content=<SurvivalEnglishScreen {...common}/>;break;
    case"offlinePacks":content=<OfflinePacksScreen {...common}/>;break;
    case"community":content=<CommunityScreen {...common} initialTab={route.params?.tab||"places"}/>;break;
    case"feed":content=<FeedScreen {...common}/>;break;
    case"messages":content=<MessagesScreen {...common}/>;break;
    case"thread":content=<ThreadScreen {...common}/>;break;
    case"profile":content=<ProfileScreen {...common}/>;break;
    case"cv":content=<CVScreen {...common}/>;break;
    case"recommend":content=<RecommendScreen {...common}/>;break;
    case"directory":content=<DirectoryScreen {...common}/>;break;
    case"glossary":content=<GlossaryScreen {...common}/>;break;
    case"notifications":content=<NotificationsScreen {...common}/>;break;
    case"saved":content=<SavedScreen {...common}/>;break;
    case"verification":content=<VerificationScreen {...common}/>;break;
    case"myRequests":content=<MyRequestsScreen {...common}/>;break;
    case"admin":content=<AdminScreen {...common}/>;break;
    case"adminContent":content=<AdminManageScreen {...common}/>;break;
    case"listingDetail":content=<ListingDetailScreen {...common}/>;break;
    case"postDetail":content=<PostDetailScreen {...common}/>;break;
    case"all":content=<AllSectionsScreen {...common}/>;break;
    default:content=<HomeScreen {...common}/>;
  }
  const active=route.name==="listingDetail"?"community":route.name==="citizenship"||route.name==="survival"||route.name==="offlinePacks"?"learn":MAIN.has(route.name)?route.name:(route.name==="recommend"||route.name==="directory"||route.name==="resources"?"all":route.name==="profile"||route.name==="messages"||route.name==="cv"||route.name==="feed"||route.name==="glossary"||route.name==="notifications"||route.name==="saved"||route.name==="verification"||route.name==="myRequests"||route.name==="admin"||route.name==="adminContent"?"all":"home");
  return <SafeAreaView style={[st.safe,rootDir]} edges={["top","left","right","bottom"]}>
    {bar}
    <AppHeader lang={lang} user={user} onProfile={()=>navigate(token?"profile":"auth")} onNotifications={()=>navigate("notifications")} onLang={cycleLang} onSetLang={setLangTo}/>
    <ErrorSurfaceContext.Provider value={reportInlineError}><View style={st.body}>{bootError&&!bannerDismissed&&inlineErrors===0?<View accessibilityRole="alert" style={st.bootNotice}><Icon name="alert-circle" size={18} color={C.redInk}/><Txt lang={lang} style={{color:C.ink,flex:1}}>{tr(lang,"بعض بياناتك ما اتحملتش. تقدر تكمل أو تجرّب تاني.","Some account details could not load. Continue or retry.","No se pudieron cargar algunos datos. Continúa o reintenta.")}</Txt><Btn lang={lang} variant="light" title={tr(lang,"إعادة","Retry","Reintentar")} onPress={()=>{setBootError("");setBannerDismissed(false);setBootAttempt(x=>x+1)}}/><Pressable accessibilityRole="button" accessibilityLabel={tr(lang,"إخفاء التنبيه","Dismiss","Cerrar")} hitSlop={8} onPress={()=>setBannerDismissed(true)} style={st.bootClose}><Icon name="x" size={18} color={C.ink}/></Pressable></View>:null}<ScreenErrorBoundary key={`${route.name}-${JSON.stringify(route.params?.id||route.params?.type||route.params?.tab||"")}-${screenRetry}`} lang={lang} onHome={()=>navigate("home")} onRetry={()=>setScreenRetry(x=>x+1)}>{content}</ScreenErrorBoundary></View></ErrorSurfaceContext.Provider>
    {!keyboardOpen ? <BottomNav active={active} lang={lang} onGo={navigate}/> : null}
  </SafeAreaView>;
}
export default function App(){return <SafeAreaProvider><Root/></SafeAreaProvider>}
const st=themed(() => StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},body:{flex:1,backgroundColor:C.bg},bootNotice:{backgroundColor:C.redSoft,paddingVertical:8,paddingHorizontal:12,gap:8,flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:C.redLine},bootClose:{width:36,height:36,borderRadius:18,alignItems:"center",justifyContent:"center"},splash:{flex:1,backgroundColor:C.bg,alignItems:"center",justifyContent:"center"},mark:{marginBottom:14,borderRadius:22,padding:6,backgroundColor:C.paper,borderWidth:3,borderStyle:"dotted",borderColor:C.dash},splashStripeTop:{position:"absolute",top:0,left:0,right:0},splashStripeBottom:{position:"absolute",bottom:0,left:0,right:0}}));
