import React, {useState} from "react";
import {Pressable,StyleSheet,View} from "react-native";
import {Btn,Screen,Txt} from "./UI";
import {C} from "../theme";
import {tr} from "../i18n";

// One-time, skippable, local-only orientation. No network request, account or permission.
const slides = [
 {icon:"◇",ar:"اعرف خطوتك الجاية",en:"Know your next step",es:"Conoce tu próximo paso",descAr:"رحلتي بتشرح لك إيه تعمل من أول يوم في أمريكا، خطوة بخطوة.",descEn:"Journey shows you what to do from day one in America, step by step.",descEs:"Tu ruta explica qué hacer desde el primer día, paso a paso."},
 {icon:"▦",ar:"دوّر على اللي تحتاجه",en:"Find what you need",es:"Encuentra lo que necesitas",descAr:"في السوق تلاقي أماكن وخدمات وشغل وسكن. تقدر تحفظ أو تتواصل من الإعلان.",descEn:"Marketplace has places, services, jobs and housing. Save or contact a listing.",descEs:"El mercado tiene lugares, servicios, empleo y vivienda. Guarda o contacta."},
 {icon:"✦",ar:"اتعلم على راحتك",en:"Learn at your pace",es:"Aprende a tu ritmo",descAr:"اتعلم الحياة اليومية والإنجليزي والجنسية، وارجع لمحتواك المحفوظ وقت ما تحب.",descEn:"Explore life skills, English and citizenship, with saved lessons for later.",descEs:"Aprende sobre la vida diaria, inglés y ciudadanía, con lecciones guardadas."}
];
export default function WelcomeTour({lang="ar",onDone}) {
 const [index,setIndex]=useState(0); const s=slides[index];
 return <Screen lang={lang} contentStyle={st.page}>
  <View style={st.top}><View style={st.logo}><Txt style={{color:"#fff",fontSize:26}} weight="900">A</Txt></View><Txt lang={lang} weight="900" style={{color:C.navy,fontSize:22,flex:1}}>AnswerForU</Txt><Pressable accessibilityRole="button" onPress={onDone} style={st.skip}><Txt lang={lang} style={{color:C.teal}} weight="900">{tr(lang,"تخطي","Skip","Omitir")}</Txt></Pressable></View>
  <View style={st.art}><View style={st.artCircle}/><View style={st.artCard}><Txt lang={lang} style={{color:C.sea,fontSize:70,textAlign:"center"}} weight="900">{s.icon}</Txt></View><View style={st.artPill}><Txt style={{color:C.teal}} weight="900">0{index+1} / 03</Txt></View></View>
  <View style={{gap:12}}><Txt lang={lang} style={{color:C.teal,fontSize:16}} weight="900">{tr(lang,"أهلاً بيك!","LET'S GET STARTED","EMPECEMOS")}</Txt><Txt lang={lang} style={{color:C.ink,fontSize:30,lineHeight:44}} weight="900">{tr(lang,s.ar,s.en,s.es)}</Txt><Txt lang={lang} style={{color:C.muted,lineHeight:27}}>{tr(lang,s.descAr,s.descEn,s.descEs)}</Txt></View>
  <View style={st.bottom}>
   <View style={st.dots}>{slides.map((_,i)=><View key={i} style={[st.dot,i===index?st.dotOn:null]}/>)}</View>
   <Btn lang={lang} variant="blue" title={index===2?tr(lang,"ابدأ الاستكشاف","Start exploring","Empezar a explorar"):tr(lang,"التالي","Next","Siguiente")} onPress={()=>index===2?onDone():setIndex(v=>v+1)}/>
   {index>0?<Btn lang={lang} variant="ghost" title={tr(lang,"السابق","Previous","Anterior")} onPress={()=>setIndex(v=>v-1)}/>:null}
  </View>
 </Screen>;
}
const st=StyleSheet.create({page:{flexGrow:1,justifyContent:"space-between",paddingTop:22,paddingBottom:30,gap:28},top:{flexDirection:"row",alignItems:"center",gap:11},logo:{width:43,height:43,borderRadius:14,backgroundColor:C.navy,alignItems:"center",justifyContent:"center"},skip:{paddingHorizontal:15,paddingVertical:12,borderRadius:999,backgroundColor:C.mist},art:{height:248,borderRadius:32,backgroundColor:C.navy,overflow:"hidden",alignItems:"center",justifyContent:"center"},artCircle:{position:"absolute",width:280,height:280,borderRadius:140,backgroundColor:"#236779",right:-115,top:-90},artCard:{width:140,height:140,borderRadius:38,borderWidth:1,borderColor:"#6AB5B1",backgroundColor:"#1C5C69",alignItems:"center",justifyContent:"center",transform:[{rotate:"-6deg"}]},artPill:{position:"absolute",right:22,bottom:17,paddingHorizontal:16,paddingVertical:9,backgroundColor:C.white,borderRadius:99},bottom:{gap:12},dots:{flexDirection:"row",justifyContent:"center",gap:7,marginBottom:6},dot:{width:8,height:8,borderRadius:8,backgroundColor:"#C6DCDB"},dotOn:{width:29,backgroundColor:C.teal}});
