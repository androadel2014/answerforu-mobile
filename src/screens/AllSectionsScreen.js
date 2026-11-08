import React from"react";
import{Linking,Pressable,StyleSheet,useWindowDimensions,View}from"react-native";
import{Btn,Card,Pill,Screen,Txt}from"../components/UI";
import{C}from"../theme";
import{APP_VERSION,WEB_MASTER_VERSION}from"../config";
import{tr}from"../i18n";
const items=[
  {route:"home",icon:"⌂",ar:"الرئيسية",en:"Home"},
  {route:"journey",icon:"◇",ar:"رحلتي",en:"My Journey"},
  {route:"learn",icon:"✦",ar:"اتعلم أمريكا",en:"Learn America"},
  {route:"citizenship",icon:"🇺🇸",ar:"الجنسية الأمريكية",en:"U.S. Citizenship",es:"Ciudadanía estadounidense"},
  {route:"survival",icon:"🗣",ar:"إنجليزي أول شهور",en:"Survival English",es:"Inglés de supervivencia"},
  {route:"offlinePacks",icon:"⇩",ar:"تحميل حزم أوفلاين",en:"Offline learning packs",es:"Paquetes sin conexión"},
  {route:"glossary",icon:"Aa",ar:"قاموس أمريكا",en:"U.S. Glossary"},
  {route:"community",icon:"◎",ar:"السوق والمجتمع",en:"Marketplace & Community",es:"Mercado y comunidad"},
  {route:"recommend",icon:"★",ar:"رشحلي",en:"Recommend Me"},
  {route:"resources",icon:"⌖",ar:"المصادر والأدلة الكاملة",en:"Complete resources & guides",es:"Recursos y guías completas"},
  {route:"community",params:{tab:"services"},icon:"▤",ar:"الخدمات",en:"Services"},
  {route:"community",params:{tab:"products"},icon:"◫",ar:"المنتجات",en:"Products"},
  {route:"community",params:{tab:"housing"},icon:"⌂",ar:"السكن",en:"Housing"},
  {route:"community",params:{tab:"jobs"},icon:"▣",ar:"الوظائف",en:"Jobs"},
  {route:"feed",icon:"◉",ar:"المنشورات",en:"Feed"},
  {route:"myRequests",icon:"✓",ar:"طلباتي وإعلاناتي",en:"My submissions"},
  {route:"messages",icon:"◌",ar:"الرسائل",en:"Messages"},
  {route:"cv",icon:"CV",ar:"السيرة الذاتية",en:"CV Builder"},
  {route:"notifications",icon:"●",ar:"الإشعارات",en:"Notifications"},
  {route:"saved",icon:"☆",ar:"المحفوظات",en:"Saved"},
  {route:"verification",icon:"✓",ar:"توثيق الحساب",en:"Verification"},
  {url:"/about",icon:"ℹ",ar:"من نحن",en:"About",es:"Acerca de"},
  {url:"/contact",icon:"✉",ar:"تواصل معنا",en:"Contact",es:"Contacto"},
  {url:"/privacy",icon:"⚿",ar:"سياسة الخصوصية",en:"Privacy policy",es:"Privacidad"},
  {url:"/terms",icon:"§",ar:"الشروط",en:"Terms",es:"Condiciones"},
  {url:"/data-deletion",icon:"⌫",ar:"حذف البيانات",en:"Data deletion",es:"Eliminación de datos"},
  {url:"/editorial-policy",icon:"◈",ar:"سياسة التحرير",en:"Editorial policy",es:"Política editorial"},
  {url:"/affiliate-disclosure",icon:"◉",ar:"الإفصاح عن الروابط",en:"Affiliate disclosure",es:"Divulgación de afiliados"},

  {route:"profile",icon:"A",ar:"حسابي",en:"My Account"},
];
export default function AllSectionsScreen({lang,navigate,onLogout,user}){
 const all=[...items,...((user?.is_admin===true||Number(user?.is_admin)===1||user?.role==="admin")?[{route:"admin",icon:"⚑",ar:"لوحة الإدارة",en:"Admin dashboard",es:"Administración"}]:[])];
 return <Screen lang={lang} contentStyle={{gap:12}}>
  <View style={{gap:5,paddingVertical:7}}><Txt lang={lang} style={{fontSize:26}} weight="900">{tr(lang,'كل الأقسام','All sections','Todas las secciones')}</Txt><Txt lang={lang} style={{color:C.muted}}>{tr(lang,'اختار القسم اللي محتاجه. تقدر ترجع للرئيسية في أي وقت.','Pick what you need. You can return Home anytime.','Elige lo que necesitas. Puedes volver a Inicio.')}</Txt></View>
  <View style={s.grid}>{all.map((x,i)=><Pressable accessibilityRole="button" accessibilityLabel={tr(lang,x.ar,x.en,x.es||x.en)} key={`${x.route||x.url}-${i}`} onPress={()=>x.url?Linking.openURL(`https://answerforu.com${x.url}`).catch(()=>{}):navigate(x.route,x.params||null)} style={s.tile}><View style={s.icon}><Txt lang={lang} style={{color:C.blue,fontSize:21,textAlign:'center'}} weight="900">{x.icon}</Txt></View><Txt lang={lang} style={{flex:1,fontSize:17}} weight="900">{tr(lang,x.ar,x.en,x.es||x.en)}</Txt><Txt lang={lang} style={{fontSize:23,color:C.blue}}>›</Txt></Pressable>)}</View>
  <Card style={{gap:9}}><Txt lang={lang} weight="900">{tr(lang,'إدارة الحساب','Account','Cuenta')}</Txt>{user?<Btn lang={lang} title={tr(lang,'تسجيل الخروج','Sign out','Cerrar sesión')} onPress={onLogout} variant="light"/>:<Btn lang={lang} title={tr(lang,'تسجيل الدخول','Sign in','Iniciar sesión')} onPress={()=>navigate('auth')} variant="blue"/>}<Txt lang={lang} style={{color:C.muted}}>v{APP_VERSION} · {tr(lang,'نسخة الموقع','Website','Sitio web')} {WEB_MASTER_VERSION}</Txt></Card>
 </Screen>;
}
const s=StyleSheet.create({grid:{gap:9},tile:{minHeight:67,backgroundColor:'#fff',borderWidth:1,borderColor:C.line,borderRadius:16,flexDirection:'row',alignItems:'center',paddingHorizontal:13,paddingVertical:10,gap:12},icon:{width:44,height:44,borderRadius:13,backgroundColor:C.soft,alignItems:'center',justifyContent:'center'}});
