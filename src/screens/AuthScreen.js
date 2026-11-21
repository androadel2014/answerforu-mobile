import React,{useState} from "react";
import { View,StyleSheet } from "react-native";
import { api } from "../api/client";
import { AirmailFrame,AirmailStripe,BrandMark,Btn,Field,Icon,LangBar,LangSwitch,Postmark,Screen,SectionHero,Stamp,Txt } from "../components/UI";
import { Pressable } from "react-native";
import GoogleButton from "../auth/GoogleButton";
import { C, themed } from "../theme";
import { APP_VERSION } from "../config";
import { tr } from "../i18n";
import { friendlyError } from "../logic/appSafety.mjs";
import PasswordInput,{passwordProblem} from "../components/PasswordInput";
export default function AuthScreen({lang,onAuth,onLang,onSetLang,onBrowse}){
  const [mode,setMode]=useState('login'),[username,setUsername]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const T=(ar,en,es)=>tr(lang,ar,en,es);
  async function submit(){setError('');setNotice('');if(!email.trim()||(mode!=='forgot'&&!password)){setError(T('اكتب بريدك وكلمة المرور.','Enter your email and password.','Introduce correo y contraseña.'));return;}
    if(mode==='register'&&!username.trim()){setError(T('اكتب اسم مستخدم.','Enter a username.','Introduce un nombre de usuario.'));return;}
    // 3.7.1 (tester item 16): 8 characters minimum, common / personal passwords refused (same policy as the API).
    if(mode==='register'){const problem=passwordProblem(lang,password,{username:username.trim(),email:email.trim()});if(problem){setError(problem);return;}}
    try{setBusy(true);if(mode==='forgot'){await api.forgotPassword(email.trim());setNotice(T('لو البريد مسجل عندنا، هنبعت لك رابط استرجاع كلمة المرور.','If the address exists, a reset link will arrive by email.','Si existe la cuenta, recibirás un enlace por correo.'));return;}
      const data=mode==='login'?await api.login(email.trim(),password):await api.register(username.trim(),email.trim(),password);await onAuth(data);
    }catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}
  }
  // Same full-bleed language bar as every other screen (sits outside the padded page).
  // The build version is kept for QA as a testID only — it is no longer shown to users.
  return <View style={st.root} testID={`auth-v${APP_VERSION}`}>
    <LangBar><LangSwitch lang={lang} onSet={onSetLang||(()=>onLang?.())}/></LangBar>
    <Screen lang={lang} contentStyle={st.page}>
    <SectionHero variant="blue" compact lang={lang} icon="send" eyebrow={T('أهلاً بيك في AnswerForU','Welcome to AnswerForU','Bienvenido a AnswerForU')} title={T('حياتك في أمريكا بسهولة','Your U.S. life made simple','Tu vida en EE. UU. más fácil')} subtitle={T('كل خطواتك في مكان واحد','Everything you need in one place','Todo lo que necesitas en un lugar')}>
      <View style={st.envelope}><AirmailFrame radius={12} thickness={6} contentStyle={st.envInner}><Stamp style={st.envStamp}><BrandMark size={34}/></Stamp><Postmark size={40}/><View style={{flex:1,gap:6,alignSelf:"flex-end",paddingBottom:6}}>{[1,.8,.6].map((w,i)=><View key={i} style={[st.envLine,{width:`${w*100}%`}]}/>)}</View></AirmailFrame></View>
    </SectionHero>
    <AirmailFrame thickness={8} contentStyle={{gap:13,padding:18}}>
      <Pressable accessibilityRole="button" onPress={onBrowse} style={st.backLink}><Icon name={lang==='ar'?'arrow-right':'arrow-left'} size={17} color={C.muted}/><Txt lang={lang} style={{color:C.muted}} weight="700">{T('العودة للرئيسية','Back to home','Volver al inicio')}</Txt></Pressable>
      <View style={st.hello}><Txt lang={lang} weight="900" style={{fontSize:34,lineHeight:44,color:C.ink}}>{mode==='register'?T('اعمل حسابك','Create an account','Crea tu cuenta'):mode==='forgot'?T('نرجّع حسابك','Recover your account','Recupera tu cuenta'):T('تسجيل الدخول','Sign in','Iniciar sesión')}</Txt><Txt lang={lang} style={{color:C.muted}}>{mode==='login'?T('أهلاً بك مجدداً — ابدأ بسهولة، واختار اللي يناسبك.','Welcome back — choose the easiest way to get started.','Bienvenido de nuevo — elige cómo empezar.'):T('ابدأ بسهولة، واختار اللي يناسبك.','Choose the easiest way to get started.','Elige cómo quieres empezar.')}</Txt></View>
      {mode!=='forgot'?<GoogleButton lang={lang} onAuth={onAuth} onBusy={setBusy} onMessage={setError}/>:null}
      {mode!=='forgot'?<View style={st.orRow}><View style={st.orLine}/><Txt lang={lang} style={{textAlign:'center',color:C.muted}}>{T('أو استخدم الإيميل','or use email','o usa tu correo')}</Txt><View style={st.orLine}/></View>:null}
      <View style={st.modeRow}>{[['login','تسجيل الدخول','Sign in','Entrar'],['register','حساب جديد','Register','Crear cuenta']].map(([key,ar,en,es])=><View style={{flex:1}} key={key}><Btn lang={lang} variant={mode===key?'dark':'light'} title={T(ar,en,es)} onPress={()=>{setMode(key);setError('');setNotice('')}}/></View>)}</View>
      {mode==='register'?<Field lang={lang} label={T('اسم المستخدم','Username','Usuario')} placeholder={T('مثال: user123','e.g. user123','ej. usuario123')} value={username} onChangeText={setUsername}/>:null}
      <Field lang={lang} label={T('البريد الإلكتروني','Email address','Correo electrónico')} placeholder="name@example.com" value={email} onChangeText={setEmail} keyboardType="email-address"/>
      {mode!=='forgot'?<PasswordInput lang={lang} label={T('كلمة المرور','Password','Contraseña')} value={password} onChangeText={setPassword} meter={mode==='register'} context={{username:username.trim(),email:email.trim()}} placeholder="••••••••" autoComplete={mode==='register'?'new-password':'password'} textContentType={mode==='register'?'newPassword':'password'}/>:null}
      {mode==='login'?<Btn lang={lang} title={T('نسيت كلمة المرور؟','Forgot your password?','¿Olvidaste tu contraseña?')} variant="ghost" onPress={()=>{setMode('forgot');setError('')}}/>:null}
      {error?<View style={st.error}><Txt lang={lang} style={{color:C.redInk}}>{error}</Txt></View>:null}
      {notice?<View style={st.success}><Txt lang={lang} style={{color:C.greenInk}}>{notice}</Txt></View>:null}
      <Btn lang={lang} disabled={busy} variant="blue" title={busy?T('جاري التحميل…','Working…','Procesando…'):mode==='register'?T('إنشاء الحساب','Create account','Crear cuenta'):mode==='forgot'?T('ابعت رابط الاسترجاع','Send reset link','Enviar enlace'):T('دخول بالإيميل','Sign in with email','Entrar con correo')} onPress={submit}/>
      {mode==='forgot'?<Btn lang={lang} variant="light" title={T('رجوع للدخول','Back to sign in','Volver a entrar')} onPress={()=>{setMode('login');setError('')}}/>:null}
      <View style={st.footer}>{mode==='login'?<Btn lang={lang} variant="ghost" title={T('ليس لديك حساب؟ سجل الآن','No account? Register now','¿Sin cuenta? Regístrate')} onPress={()=>{setMode('register');setError('');setNotice('')}}/>:null}<Btn lang={lang} title={T('تصفح بدون حساب','Browse without an account','Explorar sin cuenta')} variant="light" onPress={onBrowse}/></View>
    </AirmailFrame>
    <Btn lang={lang} icon="globe" title={T(`اللغة: ${lang.toUpperCase()} — تغيير`,`Language: ${lang.toUpperCase()} — Change`,`Idioma: ${lang.toUpperCase()} — Cambiar`)} onPress={onLang} variant="ghost"/>
  </Screen></View>;
}
const st=themed(() => StyleSheet.create({root:{flex:1,backgroundColor:C.bg},page:{paddingTop:12,gap:16,paddingBottom:32,width:"100%",maxWidth:520,alignSelf:"center"},langRow:{backgroundColor:C.navy,borderRadius:999,paddingHorizontal:10,paddingVertical:6,alignSelf:"stretch",flexDirection:"row",justifyContent:"center"},envelope:{marginTop:6,transform:[{rotate:"-3deg"}]},envInner:{flexDirection:"row",alignItems:"center",gap:8,padding:12,minHeight:96,direction:"ltr"},envStamp:{padding:4,backgroundColor:C.surface,borderRadius:3},envLine:{height:3,borderRadius:2,backgroundColor:C.dash},backLink:{flexDirection:"row",alignItems:"center",gap:6,alignSelf:"flex-start"},brand:{fontSize:29,color:C.ink},version:{color:C.muted},hello:{gap:6,paddingTop:2,paddingBottom:4},orRow:{flexDirection:"row",alignItems:"center",gap:10},orLine:{flex:1,height:1,backgroundColor:C.line},modeRow:{flexDirection:'row',gap:8},footer:{marginTop:4,marginHorizontal:-18,marginBottom:-18,padding:14,gap:8,backgroundColor:C.sand,borderBottomLeftRadius:14,borderBottomRightRadius:14},error:{padding:12,backgroundColor:C.dangerBg,borderRadius:12},success:{padding:12,backgroundColor:C.successBg,borderRadius:12}}));
