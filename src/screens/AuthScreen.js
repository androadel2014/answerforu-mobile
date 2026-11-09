import React,{useState} from "react";
import { View,StyleSheet } from "react-native";
import { api } from "../api/client";
import { Btn,Card,Field,Screen,SectionHero,Txt } from "../components/UI";
import GoogleButton from "../auth/GoogleButton";
import { C } from "../theme";
import { APP_VERSION } from "../config";
import { tr } from "../i18n";
import { friendlyError } from "../logic/appSafety.mjs";
export default function AuthScreen({lang,onAuth,onLang,onBrowse}){
  const [mode,setMode]=useState('login'),[username,setUsername]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const T=(ar,en,es)=>tr(lang,ar,en,es);
  async function submit(){setError('');setNotice('');if(!email.trim()||(mode!=='forgot'&&!password)){setError(T('اكتب بريدك وكلمة المرور.','Enter your email and password.','Introduce correo y contraseña.'));return;}
    if(mode==='register'&&!username.trim()){setError(T('اكتب اسم مستخدم.','Enter a username.','Introduce un nombre de usuario.'));return;}
    if(mode==='register'&&password.length<12){setError(T('كلمة المرور لازم تكون 12 حرف على الأقل.','Use at least 12 characters.','Usa al menos 12 caracteres.'));return;}
    try{setBusy(true);if(mode==='forgot'){await api.forgotPassword(email.trim());setNotice(T('لو البريد مسجل عندنا، هنبعت لك رابط استرجاع كلمة المرور.','If the address exists, a reset link will arrive by email.','Si existe la cuenta, recibirás un enlace por correo.'));return;}
      const data=mode==='login'?await api.login(email.trim(),password):await api.register(username.trim(),email.trim(),password);await onAuth(data);
    }catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}
  }
  return <Screen lang={lang} contentStyle={st.page}>
    <SectionHero compact lang={lang} icon="A" eyebrow={`AnswerForU · v${APP_VERSION}`} title={T('حياتك في أمريكا بسهولة','Your U.S. life made simple','Tu vida en EE. UU. más fácil')} subtitle={T('كل خطواتك في مكان واحد','Everything you need in one place','Todo lo que necesitas en un lugar')}/>
    <View style={st.hello}><Txt lang={lang} weight="900" style={{fontSize:28}}>{mode==='register'?T('اعمل حسابك','Create an account','Crea tu cuenta'):mode==='forgot'?T('نرجّع حسابك','Recover your account','Recupera tu cuenta'):T('أهلًا بيك!','Welcome!','¡Bienvenido!')}</Txt><Txt lang={lang} style={{color:C.muted}}>{T('ابدأ بسهولة، واختار اللي يناسبك.','Choose the easiest way to get started.','Elige cómo quieres empezar.')}</Txt></View>
    <Card style={{gap:13}}>
      {mode!=='forgot'?<GoogleButton lang={lang} onAuth={onAuth} onBusy={setBusy} onMessage={setError}/>:null}
      {mode!=='forgot'?<Txt lang={lang} style={{textAlign:'center',color:C.muted}}>{T('أو استخدم الإيميل','or use email','o usa tu correo')}</Txt>:null}
      <View style={{flexDirection:'row',gap:8}}>{[['login','تسجيل الدخول','Sign in','Entrar'],['register','حساب جديد','Register','Crear cuenta']].map(([key,ar,en,es])=><View style={{flex:1}} key={key}><Btn lang={lang} variant={mode===key?'dark':'light'} title={T(ar,en,es)} onPress={()=>{setMode(key);setError('');setNotice('')}}/></View>)}</View>
      {mode==='register'?<Field lang={lang} label={T('اسم المستخدم','Username','Usuario')} placeholder={T('مثال: user123','e.g. user123','ej. usuario123')} value={username} onChangeText={setUsername}/>:null}
      <Field lang={lang} label={T('البريد الإلكتروني','Email address','Correo electrónico')} placeholder="name@example.com" value={email} onChangeText={setEmail} keyboardType="email-address"/>
      {mode!=='forgot'?<Field lang={lang} label={T('كلمة المرور','Password','Contraseña')} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••••••"/>:null}
      {mode==='login'?<Btn lang={lang} title={T('نسيت كلمة المرور؟','Forgot your password?','¿Olvidaste tu contraseña?')} variant="ghost" onPress={()=>{setMode('forgot');setError('')}}/>:null}
      {error?<View style={st.error}><Txt lang={lang} style={{color:C.red}}>{error}</Txt></View>:null}
      {notice?<View style={st.success}><Txt lang={lang} style={{color:C.green}}>{notice}</Txt></View>:null}
      <Btn lang={lang} disabled={busy} variant="dark" title={busy?T('جاري التحميل…','Working…','Procesando…'):mode==='register'?T('إنشاء الحساب','Create account','Crear cuenta'):mode==='forgot'?T('ابعت رابط الاسترجاع','Send reset link','Enviar enlace'):T('دخول بالإيميل','Sign in with email','Entrar con correo')} onPress={submit}/>
      {mode==='forgot'?<Btn lang={lang} variant="light" title={T('رجوع للدخول','Back to sign in','Volver a entrar')} onPress={()=>{setMode('login');setError('')}}/>:null}
      <Btn lang={lang} title={T('تصفح بدون حساب','Browse without an account','Explorar sin cuenta')} variant="light" onPress={onBrowse}/>
    </Card>
    <Btn lang={lang} title={T(`اللغة: ${lang.toUpperCase()} — تغيير`,`Language: ${lang.toUpperCase()} — Change`,`Idioma: ${lang.toUpperCase()} — Cambiar`)} onPress={onLang} variant="ghost"/>
  </Screen>;
}
const st=StyleSheet.create({page:{paddingTop:16,gap:14,paddingBottom:32,width:"100%",maxWidth:490,alignSelf:"center"},brand:{fontSize:29,color:C.navy},version:{color:C.muted},hello:{gap:8,paddingTop:10,paddingBottom:5},error:{padding:12,backgroundColor:C.dangerBg,borderRadius:14},success:{padding:12,backgroundColor:C.successBg,borderRadius:14}});
