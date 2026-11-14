import React from"react";
import{Linking,Pressable,StyleSheet,useWindowDimensions,View}from"react-native";
import{BrandMark,Btn,Card,Icon,IconChip,Pill,Screen,SectionHero,Stamp,Txt,Wordmark}from"../components/UI";
import{C}from"../theme";
import{APP_VERSION,WEB_MASTER_VERSION}from"../config";
import{tr}from"../i18n";
const items=[
  {route:"home",icon:"home",ar:"الرئيسية",en:"Home",es:"Inicio"},
  {route:"journey",icon:"map",ar:"رحلتي",en:"My Journey",es:"Mi ruta"},
  {route:"learn",icon:"book-open",ar:"اتعلم أمريكا",en:"Learn America",es:"Aprender en EE. UU."},
  {route:"citizenship",icon:"award",ar:"الجنسية الأمريكية",en:"U.S. Citizenship",es:"Ciudadanía estadounidense"},
  {route:"survival",icon:"message-circle",ar:"إنجليزي أول شهور",en:"Survival English",es:"Inglés de supervivencia"},
  {route:"offlinePacks",icon:"download",ar:"تحميل حزم أوفلاين",en:"Offline learning packs",es:"Paquetes sin conexión"},
  {route:"glossary",icon:"book",ar:"قاموس أمريكا",en:"U.S. Glossary",es:"Glosario"},
  {route:"community",icon:"shopping-bag",ar:"السوق والمجتمع",en:"Marketplace & Community",es:"Mercado y comunidad"},
  {route:"recommend",icon:"thumbs-up",ar:"رشحلي",en:"Recommend Me",es:"Recomendaciones"},
  {route:"resources",icon:"compass",ar:"المصادر والأدلة الكاملة",en:"Complete resources & guides",es:"Recursos y guías completas"},
  {route:"community",params:{tab:"services"},icon:"tool",ar:"الخدمات",en:"Services",es:"Servicios"},
  {route:"community",params:{tab:"products"},icon:"shopping-cart",ar:"المنتجات",en:"Products",es:"Productos"},
  {route:"community",params:{tab:"housing"},icon:"key",ar:"السكن",en:"Housing",es:"Vivienda"},
  {route:"community",params:{tab:"jobs"},icon:"briefcase",ar:"الوظائف",en:"Jobs",es:"Empleos"},
  {route:"feed",icon:"list",ar:"المنشورات",en:"Feed",es:"Publicaciones"},
  {route:"myRequests",icon:"clipboard",ar:"طلباتي وإعلاناتي",en:"My submissions",es:"Mis solicitudes"},
  {route:"messages",icon:"message-square",ar:"الرسائل",en:"Messages",es:"Mensajes"},
  {route:"cv",icon:"file-text",ar:"السيرة الذاتية",en:"CV Builder",es:"Crear currículum"},
  {route:"notifications",icon:"bell",ar:"الإشعارات",en:"Notifications",es:"Notificaciones"},
  {route:"saved",icon:"bookmark",ar:"المحفوظات",en:"Saved",es:"Guardados"},
  {route:"verification",icon:"check-circle",ar:"توثيق الحساب",en:"Verification",es:"Verificación"},
  {url:"/about",icon:"info",ar:"من نحن",en:"About",es:"Acerca de"},
  {url:"/contact",icon:"mail",ar:"تواصل معنا",en:"Contact",es:"Contacto"},
  {url:"/privacy",icon:"lock",ar:"سياسة الخصوصية",en:"Privacy policy",es:"Privacidad"},
  {url:"/terms",icon:"file",ar:"الشروط",en:"Terms",es:"Condiciones"},
  {url:"/data-deletion",icon:"trash-2",ar:"حذف البيانات",en:"Data deletion",es:"Eliminación de datos"},
  {url:"/editorial-policy",icon:"edit-3",ar:"سياسة التحرير",en:"Editorial policy",es:"Política editorial"},
  {url:"/affiliate-disclosure",icon:"link",ar:"الإفصاح عن الروابط",en:"Affiliate disclosure",es:"Divulgación de afiliados"},

  {route:"profile",icon:"user",ar:"حسابي",en:"My Account",es:"Mi cuenta"},
];
export default function AllSectionsScreen({lang,navigate,onLogout,user}){
 const all=[...items,...((user?.is_admin===true||Number(user?.is_admin)===1||user?.role==="admin")?[{route:"admin",icon:"shield",ar:"لوحة الإدارة",en:"Admin dashboard",es:"Administración"}]:[])];
 return <Screen lang={lang} contentStyle={{gap:14}}>
  <View style={s.head}><BrandMark size={46}/><View style={{flex:1}}><Wordmark size={15}/></View></View>
  <SectionHero compact icon="grid" lang={lang} eyebrow={tr(lang,"استكشف AnswerForU","DISCOVER ANSWERFORU","DESCUBRE ANSWERFORU")} title={tr(lang,'كل الأقسام','All sections','Todas las secciones')} subtitle={tr(lang,'اختار القسم اللي محتاجه. تقدر ترجع للرئيسية في أي وقت.','Pick what you need. You can return Home anytime.','Elige lo que necesitas. Puedes volver a Inicio.')}/>
  <View style={s.grid}>{all.map((x,i)=>{const lead=i===0;return <Pressable accessibilityRole="button" accessibilityLabel={tr(lang,x.ar,x.en,x.es||x.en)} key={`${x.route||x.url}-${i}`} onPress={()=>x.url?Linking.openURL(`https://answerforu.com${x.url}`).catch(()=>{}):navigate(x.route,x.params||null)} style={({pressed})=>[s.cell,pressed&&{opacity:.85}]}>
   <Stamp tone={lead?"navy":"paper"} style={s.tile}>
    <Txt lang={lang} weight="900" style={[s.num,lead&&{color:"#C9D2EA"}]}>{String(i+1).padStart(2,"0")}</Txt>
    <View style={s.row}>{lead?<View style={s.leadIcon}><Icon name={x.icon} size={22} color={C.navy}/></View>:<IconChip name={x.icon} tint={i%4} size={44} iconSize={20}/>}<Txt lang={lang} numberOfLines={3} style={{flex:1,fontSize:17,lineHeight:23,color:lead?"#FFFFFF":C.navy}} weight="900">{tr(lang,x.ar,x.en,x.es||x.en)}</Txt></View>
    {x.url?<View style={s.webTag}><Icon name="external-link" size={13} color={C.muted}/><Txt lang={lang} style={{color:C.muted,fontSize:13}}>answerforu.com</Txt></View>:null}
   </Stamp>
  </Pressable>})}</View>
  <Card style={{gap:10}}><Txt lang={lang} weight="900">{tr(lang,'إدارة الحساب','Account','Cuenta')}</Txt>{user?<Btn lang={lang} icon="log-out" title={tr(lang,'تسجيل الخروج','Sign out','Cerrar sesión')} onPress={onLogout} variant="light"/>:<Btn lang={lang} icon="user" title={tr(lang,'تسجيل الدخول','Sign in','Iniciar sesión')} onPress={()=>navigate('auth')} variant="dark"/>}<Txt lang={lang} style={{color:C.muted}}>v{APP_VERSION} · {tr(lang,'نسخة الموقع','Website','Sitio web')} {WEB_MASTER_VERSION}</Txt></Card>
 </Screen>;
}
const s=StyleSheet.create({head:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:-6},grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",rowGap:12},cell:{width:"48.5%"},tile:{minHeight:118,padding:12,gap:8,justifyContent:"center"},num:{fontSize:13,color:C.muted,lineHeight:16},row:{flexDirection:"row",alignItems:"center",gap:10},leadIcon:{width:44,height:44,borderRadius:13,backgroundColor:C.gold,alignItems:"center",justifyContent:"center"},webTag:{flexDirection:"row",alignItems:"center",gap:5}});
