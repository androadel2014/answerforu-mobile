import React, {useState} from "react";
import {Pressable,StyleSheet,View} from "react-native";
import {AirmailFrame,AirmailStripe,BrandMark,Btn,Icon,LangSwitch,Postmark,Screen,Stamp,Txt,Wordmark} from "./UI";
import {C,themed} from "../theme";
import {tr} from "../i18n";

// One-time, skippable, local-only orientation. No network request, account or permission.
const slides = [
 {icon:"map",ar:"اعرف خطوتك الجاية",en:"Know your next step",es:"Conoce tu próximo paso",descAr:"رحلتي بتشرح لك إيه تعمل من أول يوم في أمريكا، خطوة بخطوة.",descEn:"Journey shows you what to do from day one in America, step by step.",descEs:"Tu ruta explica qué hacer desde el primer día, paso a paso."},
 {icon:"shopping-bag",ar:"دوّر على اللي تحتاجه",en:"Find what you need",es:"Encuentra lo que necesitas",descAr:"في السوق تلاقي أماكن وخدمات وشغل وسكن. تقدر تحفظ أو تتواصل من الإعلان.",descEn:"Marketplace has places, services, jobs and housing. Save or contact a listing.",descEs:"El mercado tiene lugares, servicios, empleo y vivienda. Guarda o contacta."},
 {icon:"book-open",ar:"اتعلم على راحتك",en:"Learn at your pace",es:"Aprende a tu ritmo",descAr:"اتعلم الحياة اليومية والإنجليزي والجنسية، وارجع لمحتواك المحفوظ وقت ما تحب.",descEn:"Explore life skills, English and citizenship, with saved lessons for later.",descEs:"Aprende sobre la vida diaria, inglés y ciudadanía, con lecciones guardadas."}
];
export default function WelcomeTour({lang="ar",onDone,onSetLang}) {
 const [index,setIndex]=useState(0); const s=slides[index];
 return <Screen lang={lang} contentStyle={st.page}>
  <View style={{gap:12}}>
   <View style={st.top}><BrandMark size={44}/><View style={{flex:1}}><Wordmark size={21}/></View><Pressable accessibilityRole="button" onPress={onDone} style={st.skip}><Txt lang={lang} style={{color:C.onGold}} weight="900">{tr(lang,"تخطي","Skip","Omitir")}</Txt></Pressable></View>
   {onSetLang?<View style={st.langAnchor}><LangSwitch lang={lang} onSet={onSetLang} dark={false}/></View>:null}
  </View>
  <AirmailFrame contentStyle={st.art}>
   <View style={st.artTop}><Postmark size={50}/><Stamp style={st.artStamp}><Icon name={s.icon} size={58} color={C.blue}/></Stamp></View>
   <View style={st.artPill}><Txt style={{color:C.gold}} weight="900">0{index+1} / 03</Txt></View>
  </AirmailFrame>
  <View style={{gap:12}}><Txt lang={lang} style={{color:C.blue,fontSize:16}} weight="900">{tr(lang,"أهلاً بيك!","LET'S GET STARTED","EMPECEMOS")}</Txt><Txt lang={lang} style={{color:C.ink,fontSize:32,lineHeight:44}} weight="900">{tr(lang,s.ar,s.en,s.es)}</Txt><Txt lang={lang} style={{color:C.muted,lineHeight:27}}>{tr(lang,s.descAr,s.descEn,s.descEs)}</Txt></View>
  <View style={st.bottom}>
   <View style={st.dots}>{slides.map((_,i)=><View key={i} style={[st.dot,i===index?st.dotOn:null,i===index&&i%2?{backgroundColor:C.airRed}:null]}/>)}</View>
   <Btn lang={lang} variant="blue" icon="forward" title={index===2?tr(lang,"ابدأ الاستكشاف","Start exploring","Empezar a explorar"):tr(lang,"التالي","Next","Siguiente")} onPress={()=>index===2?onDone():setIndex(v=>v+1)}/>
   {index>0?<Btn lang={lang} variant="light" title={tr(lang,"السابق","Previous","Anterior")} onPress={()=>setIndex(v=>v-1)}/>:null}
  </View>
 </Screen>;
}
const st=themed(() => StyleSheet.create({page:{flexGrow:1,justifyContent:"space-between",paddingTop:18,paddingBottom:28,gap:24},top:{flexDirection:"row",alignItems:"center",gap:11},langAnchor:{flexDirection:"row",justifyContent:"flex-end",direction:"ltr"},skip:{paddingHorizontal:16,paddingVertical:10,borderRadius:999,backgroundColor:C.gold},art:{height:220,alignItems:"center",justifyContent:"center",padding:16},artTop:{flexDirection:"row",alignItems:"center",gap:14,direction:"ltr"},artStamp:{width:120,height:136,alignItems:"center",justifyContent:"center",backgroundColor:C.surface,transform:[{rotate:"-4deg"}]},artPill:{position:"absolute",right:16,bottom:14,paddingHorizontal:14,paddingVertical:7,backgroundColor:C.navy,borderRadius:99},bottom:{gap:12},dots:{flexDirection:"row",justifyContent:"center",gap:7,marginBottom:6,direction:"ltr"},dot:{width:9,height:9,borderRadius:3,backgroundColor:C.line,transform:[{skewX:"-20deg"}]},dotOn:{width:30,backgroundColor:C.royal}}));
