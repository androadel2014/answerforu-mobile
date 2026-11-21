import React,{useMemo,useState}from"react";
import{Pressable,StyleSheet,View}from"react-native";
import{AwareTextInput,Card,Pill,Screen,Txt}from"../components/UI";
import{ResourceCategorySection}from"../components/ResourceCards";
import{C,themed}from"../theme";
import{tr}from"../i18n";
import{RECOMMEND_GROUPS}from"../data/resourceConfig";

const tabs=[
  ["recommend","رشحلي","Recommend Me","Recomiéndame"],
  ["states","رشح ولاية","Recommend a State","Recomienda un estado"],
  ["essential","مهم تحفظه","Must-save apps/sites","Apps y sitios clave"],
];
export default function RecommendScreen({lang}){const[tab,setTab]=useState("recommend"),[groupId,setGroupId]=useState("arrival"),[q,setQ]=useState("");const group=RECOMMEND_GROUPS.find(x=>x.id===groupId)||RECOMMEND_GROUPS[0];const stateCategories=useMemo(()=>["states"],[q]);return <Screen lang={lang}>
  <Card dark style={{gap:10}}><Pill dark><Txt lang={lang} floor={12} style={{color:C.onDarkSoft,fontSize:13}} weight="900">{"✦ "+tr(lang,"ترشيحات AnswerForU","AnswerForU Recommendations","Recomendaciones de AnswerForU")}</Txt></Pill><Txt lang={lang} style={{color:C.onDark,fontSize:27}} weight="900">{tr(lang,"اسأل الناس قبل ما تختار","See real community choices before you decide","Mira lo que elige la comunidad antes de decidir")}</Txt><Txt lang={lang} style={{color:C.onDarkMuted,lineHeight:23}}>{tr(lang,"نفس الترشيحات اللي بتظهر جوه رحلتك. التصويت والتقييم من نفس قاعدة البيانات.","The same recommendations shown inside your journey, backed by the same database.","Las mismas recomendaciones de tu ruta, con los mismos votos y reseñas.")}</Txt></Card>
  <View style={s.tabs}>{tabs.map(([id,ar,en,es])=><Pressable key={id} onPress={()=>setTab(id)} style={[s.tab,tab===id&&s.active]}><Txt lang={lang} style={{color:tab===id?C.onDark:C.ink,textAlign:"center",fontSize:13}} weight="900">{tr(lang,ar,en,es)}</Txt></Pressable>)}</View>
  {tab==="recommend"?<><View style={s.groups}>{RECOMMEND_GROUPS.map(g=><Pressable key={g.id} onPress={()=>setGroupId(g.id)} style={[s.group,groupId===g.id&&s.groupActive]}><Txt lang={lang} style={{color:groupId===g.id?C.onDark:C.ink,textAlign:"center",fontSize:13}} weight="900">{g.label[lang]||g.label.en}</Txt></Pressable>)}</View><View style={{gap:22}}>{group.categories.map(c=><ResourceCategorySection key={c} category={c} lang={lang}/>)}</View></>:null}
  {tab==="essential"?<View style={{gap:22}}>{["essential_apps","government_accounts","transport_apps","bus_apps","credit_monitoring"].map(c=><ResourceCategorySection key={c} category={c} lang={lang}/>)}</View>:null}
  {tab==="states"?<><AwareTextInput value={q} onChangeText={setQ} placeholder={tr(lang,"دور باسم الولاية أو الاختصار...","Search state name or code...","Busca el estado por nombre o sigla...")} placeholderTextColor={C.placeholder} style={[s.search,{textAlign:lang==="ar"?"right":"left"}]}/><View style={{gap:22}}>{stateCategories.map(c=><ResourceCategorySection key={c} category={c} lang={lang}/>)}</View></>:null}
</Screen>}
const s=themed(() => StyleSheet.create({tabs:{flexDirection:"row",gap:8},tab:{flex:1,minHeight:48,borderRadius:16,borderWidth:1,borderColor:C.line,backgroundColor:C.paper,alignItems:"center",justifyContent:"center",paddingHorizontal:6},active:{backgroundColor:C.navy,borderColor:C.navy},groups:{flexDirection:"row",flexWrap:"wrap",gap:8},group:{minHeight:42,borderRadius:14,borderWidth:1,borderColor:C.line,backgroundColor:C.paper,alignItems:"center",justifyContent:"center",paddingHorizontal:12},groupActive:{backgroundColor:C.royal,borderColor:C.royal},search:{minHeight:50,borderRadius:16,borderWidth:1.3,borderColor:C.inputBorder,backgroundColor:C.paper,paddingHorizontal:14,color:C.ink}}))
