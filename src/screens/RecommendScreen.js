import React,{useMemo,useState}from"react";
import{Pressable,StyleSheet,View}from"react-native";
import{AwareTextInput,Card,Pill,Screen,Txt}from"../components/UI";
import{ResourceCategorySection}from"../components/ResourceCards";
import{C}from"../theme";
import{tr}from"../i18n";
import{RECOMMEND_GROUPS}from"../data/resourceConfig";

const tabs=[
  ["recommend","رشحلي","Recommend Me"],
  ["states","رشح ولاية","Recommend a State"],
  ["essential","مهم تحفظه","Must-save apps/sites"],
];
export default function RecommendScreen({lang}){const[tab,setTab]=useState("recommend"),[groupId,setGroupId]=useState("arrival"),[q,setQ]=useState("");const group=RECOMMEND_GROUPS.find(x=>x.id===groupId)||RECOMMEND_GROUPS[0];const stateCategories=useMemo(()=>["states"],[q]);return <Screen lang={lang}>
  <Card dark style={{gap:10}}><Pill dark><Txt lang={lang} style={{color:C.cyan,fontSize:10}} weight="900">✦ AnswerForU Recommendations</Txt></Pill><Txt lang={lang} style={{color:"#fff",fontSize:27}} weight="900">{tr(lang,"اسأل الناس قبل ما تختار","See real community choices before you decide")}</Txt><Txt lang={lang} style={{color:"#C9D2EA",lineHeight:23}}>{tr(lang,"نفس الترشيحات اللي بتظهر جوه رحلتك. التصويت والتقييم من نفس قاعدة البيانات.","The same recommendations shown inside your journey, backed by the same database.")}</Txt></Card>
  <View style={s.tabs}>{tabs.map(([id,ar,en])=><Pressable key={id} onPress={()=>setTab(id)} style={[s.tab,tab===id&&s.active]}><Txt lang={lang} style={{color:tab===id?"#fff":C.ink,textAlign:"center",fontSize:12}} weight="900">{tr(lang,ar,en)}</Txt></Pressable>)}</View>
  {tab==="recommend"?<><View style={s.groups}>{RECOMMEND_GROUPS.map(g=><Pressable key={g.id} onPress={()=>setGroupId(g.id)} style={[s.group,groupId===g.id&&s.groupActive]}><Txt lang={lang} style={{color:groupId===g.id?"#fff":C.ink,textAlign:"center",fontSize:11}} weight="900">{g.label[lang]||g.label.en}</Txt></Pressable>)}</View><View style={{gap:22}}>{group.categories.map(c=><ResourceCategorySection key={c} category={c} lang={lang}/>)}</View></>:null}
  {tab==="essential"?<View style={{gap:22}}>{["essential_apps","government_accounts","transport_apps","bus_apps","credit_monitoring"].map(c=><ResourceCategorySection key={c} category={c} lang={lang}/>)}</View>:null}
  {tab==="states"?<><AwareTextInput value={q} onChangeText={setQ} placeholder={tr(lang,"دور باسم الولاية أو الاختصار...","Search state name or code...")} placeholderTextColor="#9A9384" style={[s.search,{textAlign:lang==="ar"?"right":"left"}]}/><View style={{gap:22}}>{stateCategories.map(c=><ResourceCategorySection key={c} category={c} lang={lang}/>)}</View></>:null}
</Screen>}
const s=StyleSheet.create({tabs:{flexDirection:"row",gap:8},tab:{flex:1,minHeight:48,borderRadius:16,borderWidth:1,borderColor:C.line,backgroundColor:"#FFFCF5",alignItems:"center",justifyContent:"center",paddingHorizontal:6},active:{backgroundColor:C.navy,borderColor:C.navy},groups:{flexDirection:"row",flexWrap:"wrap",gap:8},group:{minHeight:42,borderRadius:14,borderWidth:1,borderColor:C.line,backgroundColor:"#FFFCF5",alignItems:"center",justifyContent:"center",paddingHorizontal:12},groupActive:{backgroundColor:C.blue,borderColor:C.blue},search:{minHeight:50,borderRadius:16,borderWidth:1,borderColor:C.line,backgroundColor:"#FFFCF5",paddingHorizontal:14,color:C.ink}})
