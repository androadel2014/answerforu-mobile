import React,{useEffect,useMemo,useState} from "react";
import { Platform,View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { ResponseType,makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Btn,Txt } from "../components/UI";
import { api } from "../api/client";
import { tr } from "../i18n";
import { friendlyError } from "../logic/appSafety.mjs";
WebBrowser.maybeCompleteAuthSession();
// OAuth IDs must be configured in Google Cloud for the real app bundle and scheme.
const ids={
  web:process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID||'816411262872-hhf8r29j0gt9p2russi232ji7vgmq1oj.apps.googleusercontent.com',
  android:process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID||'',
  ios:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID||''
};
function Configured({lang,onAuth,onBusy,onMessage}){
  const redirectUri=useMemo(()=>makeRedirectUri({scheme:'answerforu',path:'auth/callback'}),[]);
  const [request,response,promptAsync]=Google.useAuthRequest({
    webClientId:ids.web||undefined, androidClientId:ids.android||undefined,
    iosClientId:ids.ios||undefined, responseType:ResponseType.IdToken,
    scopes:['openid','profile','email'], redirectUri, selectAccount:true
  });
  useEffect(()=>{let alive=true;(async()=>{
    if(response?.type==='error'){onMessage(tr(lang,'Google مش قادر يفتح دلوقتي. جرّب تاني.','Google sign-in could not open. Please retry.','No se pudo abrir Google. Reinténtalo.'));onBusy(false);return;}
    if(response?.type!=='success')return;
    const token=response.params?.id_token||response.authentication?.idToken;
    if(!token){onMessage(tr(lang,'Google ما رجّعش بيانات دخول صالحة.','Google did not return a valid sign-in token.','Google no devolvió un token válido.'));onBusy(false);return;}
    try{const session=await api.googleMobile(token);if(alive)await onAuth(session);}
    catch(e){if(alive)onMessage(friendlyError(e,lang))}finally{if(alive)onBusy(false)}
  })();return()=>{alive=false}},[response]);
  return <Btn lang={lang} title={tr(lang,'المتابعة باستخدام Google','Continue with Google','Continuar con Google')} variant="blue" disabled={!request} onPress={async()=>{onMessage('');onBusy(true);try{const result=await promptAsync();if(result?.type!=='success')onBusy(false)}catch(e){onBusy(false);onMessage(friendlyError(e,lang))}}}/>;
}
export default function GoogleButton({lang,onAuth,onBusy,onMessage}){
  const configured=Boolean(ids.web && (Platform.OS==='web'||ids[Platform.OS]));
  if(!configured)return <View style={{gap:7}}><Btn lang={lang} variant="blue" title={tr(lang,'المتابعة باستخدام Google','Continue with Google','Continuar con Google')} onPress={()=>onMessage(tr(lang,'تسجيل Google محتاج إعداد معرّف التطبيق أولًا. ممكن تدخل بالإيميل دلوقتي.','Google sign-in needs its app client ID configured. You can use email sign-in meanwhile.','Google necesita configurar el identificador de la app. Puedes acceder con correo.'))}/></View>;
  return <Configured lang={lang} onAuth={onAuth} onBusy={onBusy} onMessage={onMessage}/>;
}
