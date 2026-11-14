import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";
import { api } from "../api/client";
import { AwareTextInput, Btn, Card, Empty, Icon, IconChip, Loading, Pill, Screen, SectionHero, SectionHeading, Stamp, Txt } from "../components/UI";
import { ScrollView } from "react-native";
import { C } from "../theme";
import { tr } from "../i18n";
import {friendlyError} from "../logic/appSafety.mjs";

// The PHP API is the single source of content; do not duplicate the lesson catalog in the APK.
const LESSONS = [
  ["guides", "book-open", "دليل الحياة", "Life guides", "life_guides","Guías prácticas"],
  ["currency", "dollar-sign", "العملات", "Currency", "currency_items","Monedas"],
  ["signs", "alert-triangle", "إشارات المرور", "Road signs", "road_signs","Señales viales"],
  ["quiz", "help-circle", "اختبر نفسك", "Practice quiz", "quiz_bank","Cuestionario"],
  ["stores", "shopping-bag", "المحلات", "Stores", "store_groups","Tiendas"],
  ["services", "tool", "الخدمات اليومية", "Daily services", "service_places","Servicios diarios"],
  ["education", "award", "التعليم", "Education", "education_cards","Educación"],
  ["measure", "sliders", "المقاسات", "Measurements", "conversions","Medidas"],
];
const localized = (v, lang) => {
  if (v == null) return "";
  if (typeof v === "object" && !Array.isArray(v)) return String(v[lang] || v.en || v.ar || "");
  return typeof v === "string" || typeof v === "number" ? String(v) : "";
};
const absolute = (src) => {
  const url = String(src || "").trim();
  if (!url || url.startsWith("data:") || url.startsWith("file:")) return "";
  return /^https?:\/\//i.test(url) ? url : url.startsWith("/") ? `https://answerforu.com${url}` : "";
};
function RemoteImage({ primary, fallback, label }) {
  const first = absolute(primary), second = absolute(fallback);
  const [src, setSrc] = useState(first || second);
  useEffect(() => setSrc(first || second), [first, second]);
  if (!src) return null;
  return <Image accessibilityLabel={label || "Lesson image"} source={{uri:src}} resizeMode="contain" style={styles.image} onError={() => setSrc(s => s === first && second && first !== second ? second : "")}/>;
}
function OpenSource({ url, lang }) {
  if (!/^https?:\/\//i.test(String(url || ""))) return null;
  return <Btn lang={lang} title={tr(lang, "فتح المصدر", "Open source")} onPress={() => Linking.openURL(url).catch(() => {})} variant="ghost"/>;
}
function QuizView({ bank, lang }) {
  const [i, setI] = useState(0), [selected,setSelected] = useState(null), [score,setScore] = useState(0), [run,setRun] = useState(0);
  const questions=useMemo(() => bank.slice().sort((a,b) => String(a.id).localeCompare(String(b.id))).slice(0,15), [bank,run]);
  const q=questions[i];
  if (!q) return <Empty lang={lang} title={tr(lang,"لا توجد أسئلة حاليًا","No questions available")}/>;
  const opts=Array.isArray(q.options) ? q.options : (q.options?.[lang] || q.options?.en || q.options?.ar || []);
  const answer=Number(q.answer ?? q.correct_index ?? 0);
  function pick(n) { if(selected!==null)return;setSelected(n);if(n===answer)setScore(v=>v+1); }
  function next() { if(i+1<questions.length){setI(v=>v+1);setSelected(null);}else{setI(0);setSelected(null);setScore(0);setRun(v=>v+1);} }
  return <Card style={{gap:12}}>
    <Txt lang={lang} style={{fontSize:12,color:C.muted}} weight="900">{i+1} / {questions.length} · {tr(lang,"النتيجة","Score")}: {score}</Txt>
    <Txt lang={lang} style={{fontSize:18}} weight="900">{localized(q.q || q.question,lang)}</Txt>
    <RemoteImage primary={q.image_local || q.image} fallback={q.image_fallback || q.image} label={q.imageAlt}/>
    {opts.map((opt,n)=><Pressable key={n} onPress={()=>pick(n)} style={[styles.option,selected===n&&styles.selected,selected!==null&&n===answer&&styles.correct]}><Txt lang={lang} style={{color:selected===n?"#fff":C.ink}} weight="800">{localized(opt,lang)}</Txt></Pressable>)}
    {selected!==null?<><Txt lang={lang} style={{color:selected===answer?C.green:C.red}} weight="900">{selected===answer?tr(lang,"إجابة صحيحة ✓","Correct ✓"):tr(lang,"إجابة غير صحيحة","Not quite")}</Txt><Txt lang={lang} style={{color:C.muted,lineHeight:23}}>{localized(q.why || q.explanation,lang)}</Txt><Btn lang={lang} title={i+1===questions.length?tr(lang,"اختبار جديد","Start again"):tr(lang,"السؤال التالي","Next question")} onPress={next} variant="blue"/></>:null}
  </Card>;
}
function Currency({ item, lang }) {
  const [side,setSide] = useState("front");
  const photo = item?.[`${side}_local`] || item?.[side];
  const fallback = item?.[`${side}_fallback`] || item?.[`${side}_official_url`] || item?.[side];
  return <Card style={{gap:10}}>
    <Txt lang={lang} weight="900" style={{fontSize:19}}>{item.name || item.id} · {item.value}</Txt>
    <Txt lang={lang} style={{color:C.muted}}>{localized(item.caption || item.note,lang)}</Txt>
    <View style={{flexDirection:"row",gap:8}}><View style={{flex:1}}><Btn lang={lang} title={tr(lang,"الوجه","Front")} onPress={()=>setSide("front")} variant={side==="front"?"dark":"light"}/></View><View style={{flex:1}}><Btn lang={lang} title={tr(lang,"الظهر","Back")} onPress={()=>setSide("back")} variant={side==="back"?"dark":"light"}/></View></View>
    <RemoteImage primary={photo} fallback={fallback} label={item.name}/>
    <OpenSource lang={lang} url={item.source}/>
  </Card>;
}
function LessonCard({title, body, label, image, fallback, url, lang}) {
  return <Card style={{gap:9,overflow:"hidden"}}>
    {image?<View style={styles.imagePanel}><RemoteImage primary={image} fallback={fallback} label={localized(title,lang)}/></View>:null}
    <View style={{flexDirection:"row",alignItems:"center",gap:8}}><Txt lang={lang} style={{fontSize:19,flex:1,color:C.navy}} weight="900">{localized(title,lang) || label}</Txt>{label&&localized(title,lang)?<View style={styles.codeTag}><Txt weight="900" style={{fontSize:13,color:"#fff"}}>{label}</Txt></View>:null}</View>
    {body?<Txt lang={lang} style={{color:C.muted,lineHeight:24}}>{localized(body,lang)}</Txt>:null}
    <OpenSource url={url} lang={lang}/>
  </Card>;
}
export default function LearnScreen({ lang, navigate }) {
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[tab,setTab]=useState("guides"),[query,setQuery]=useState(""),[visible,setVisible]=useState(15),[conv,setConv]=useState("1");
  const load=useCallback(async()=>{
    try{setLoading(true);setError("");const response=await api.learn();const content=response?.data || response?.learn || response;if(!content?.life_guides || !Array.isArray(content.life_guides))throw new Error("Learning data returned an unexpected format");setData(content);}
    catch(e){setError(friendlyError(e,lang))}finally{setLoading(false)}
  },[lang]);
  useEffect(()=>{load()},[load]);
  const current=LESSONS.find(x=>x[0]===tab)||LESSONS[0];
  const items=useMemo(()=>{
    const all=Array.isArray(data?.[current[4]])?data[current[4]]:[];
    if(!query.trim())return all;
    const q=query.trim().toLowerCase();return all.filter(x=>JSON.stringify(x).toLowerCase().includes(q));
  },[data,current[4],query]);
  function select(key){setTab(key);setQuery("");setVisible(15);}
  const stats=data?[[LESSONS.length,tr(lang,"مسارات تعلم","learning paths","rutas"),C.royal],[(data.road_signs||[]).length,tr(lang,"إشارة طريق","road signs","señales"),C.airRed],[(data.quiz_bank||[]).length,tr(lang,"أسئلة في الاختبار","quiz questions","preguntas"),C.green]]:[];
  return <Screen lang={lang}>
    <SectionHero lang={lang} icon="feather" eyebrow={tr(lang,"Learn America · خطوة صغيرة كل يوم","Learn America · small steps, big progress","Learn America · paso a paso")} title={tr(lang,"اتعلم الحياة في أمريكا","Learn life in America","Aprende sobre la vida en EE. UU.")} subtitle={tr(lang,"دروس وصور وتدريبات متجددة من الموقع.","Fresh lessons, visuals and activities from the website.","Lecciones, imágenes y actividades del sitio web.")}>{stats.length?<View style={styles.stats}>{stats.map(([n,l,c],i)=><Stamp key={i} style={styles.stat}><Txt weight="900" style={{fontSize:34,lineHeight:40,color:c,textAlign:"center"}}>{String(n)}</Txt><Txt lang={lang} weight="700" style={{fontSize:14,lineHeight:18,textAlign:"center",color:C.navy}}>{l}</Txt></Stamp>)}</View>:null}</SectionHero>
    <Card style={{gap:10}}><Txt lang={lang} weight="900" style={{fontSize:17}}>{tr(lang,"تعلم واتدرب كمان","More learning and practice","Más aprendizaje y práctica")}</Txt><View style={styles.pills}><View style={[styles.navPill,{backgroundColor:C.navy}]}><Icon name="book-open" size={16} color={C.gold}/><Txt lang={lang} weight="900" style={{color:"#fff",fontSize:14}}>{tr(lang,"الدروس والاختبارات","Lessons & quizzes","Lecciones y pruebas")}</Txt></View><Pressable accessibilityRole="button" onPress={()=>navigate("citizenship")} style={[styles.navPill,{backgroundColor:C.goldSoft}]}><Icon name="award" size={16} color={C.goldDark}/><Txt lang={lang} weight="900" style={{fontSize:14,color:C.goldDark}}>{tr(lang,"الجنسية الأمريكية","U.S. Citizenship","Ciudadanía estadounidense")}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate("survival")} style={[styles.navPill,{backgroundColor:C.royalSoft}]}><Icon name="message-circle" size={16} color={C.royal}/><Txt lang={lang} weight="900" style={{fontSize:14,color:C.royal}}>{tr(lang,"إنجليزي أول شهور","Survival English","Inglés de supervivencia")}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate("offlinePacks")} style={[styles.navPill,styles.outlinePill]}><Icon name="download" size={16} color={C.navy}/><Txt lang={lang} weight="900" style={{fontSize:14}}>{tr(lang,"حزم التعلم دون إنترنت","Offline packs","Paquetes sin conexión")}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate("glossary")} style={[styles.navPill,styles.outlinePill]}><Icon name="book" size={16} color={C.navy}/><Txt lang={lang} weight="900" style={{fontSize:14}}>{tr(lang,"قاموس أمريكا — المصطلحات","U.S. Glossary — terms","Glosario")}</Txt></Pressable></View></Card><SectionHeading lang={lang} title={tr(lang,"اختار موضوعك","Choose your topic","Elige un tema")} caption={tr(lang,"اضغط على أي موضوع لعرض الدرس تحت","Select a topic to view its lessons","Elige un tema para ver sus lecciones")}/>
    {loading?<Loading lang={lang}/>:null}
    {error?<Card style={{gap:10}}><Txt lang={lang} style={{color:C.red}}>{error}</Txt><Btn lang={lang} title={tr(lang,"إعادة المحاولة","Retry")} onPress={load} variant="blue"/></Card>:null}
    {data?<>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{LESSONS.map(([key,icon,ar,en,field,es],i)=>{const on=tab===key;return <Pressable key={key} accessibilityRole="button" onPress={()=>select(key)} style={[styles.chip,on&&styles.active]}><IconChip name={icon} tint={on?1:0} size={42} iconSize={19}/><Txt lang={lang} numberOfLines={2} style={{color:on?"#fff":C.navy,fontSize:16,lineHeight:21,textAlign:"center"}} weight="900">{tr(lang,ar,en,es)}</Txt><Txt lang={lang} style={{color:on?"#DCE5FF":C.muted,fontSize:13,textAlign:"center"}}>{(data[field]||[]).length} {tr(lang,"عنصر","items","elementos")}</Txt><View style={[styles.openTag,on&&{backgroundColor:C.gold,borderColor:C.gold}]}><Txt lang={lang} weight="900" style={{fontSize:13,color:C.navy,textAlign:"center"}}>{on?tr(lang,"مفتوح تحت","Open below","Abierto abajo"):tr(lang,"افتح القسم","Open section","Abrir")}</Txt></View></Pressable>})}</ScrollView>
      <View style={styles.openBanner}><Txt lang={lang} weight="900" style={{color:C.green}}>{tr(lang,"القسم المفتوح الآن: ","Open now: ","Abierto ahora: ")}{tr(lang,current[2],current[3],current[5])}</Txt></View>
      {tab!=="quiz"?<AwareTextInput value={query} onChangeText={v=>{setQuery(v);setVisible(15)}} placeholder={tr(lang,"ابحث في الدروس...","Search lessons...")} placeholderTextColor="#9A9384" style={styles.search}/>:null}
      {tab==="quiz"?<QuizView bank={items} lang={lang}/>:null}
      {tab==="currency"?items.slice(0,visible).map((x,i)=><Currency key={x.id||i} item={x} lang={lang}/>):null}
      {tab==="signs"?items.slice(0,visible).map((x,i)=><LessonCard key={x.id||i} title={x.name||x.label} label={x.code} body={x.meaning} image={x.image_local||x.image} fallback={x.image} lang={lang}/>):null}
      {tab==="guides"?items.slice(0,visible).map((x,i)=><LessonCard key={x.id||i} title={x.title} body={x.body} url={x.source_url} lang={lang}/>):null}
      {tab==="stores"?items.slice(0,visible).map((g,i)=><Card key={g.id||i} style={{gap:10}}><Txt lang={lang} style={{fontSize:19}} weight="900">{localized(g.title,lang)}</Txt><Txt lang={lang} style={{color:C.muted}}>{localized(g.subtitle,lang)}</Txt>{(g.stores||[]).map((shop,j)=><View key={`${shop.name}-${j}`} style={styles.subcard}><Txt lang={lang} weight="900">{shop.name}</Txt><Txt lang={lang} style={{color:C.muted,lineHeight:22}}>{localized(shop.why,lang)}</Txt><OpenSource url={shop.url} lang={lang}/></View>)}</Card>):null}
      {tab==="services"?items.slice(0,visible).map((x,i)=><LessonCard key={x.name||i} title={x.name} body={x.what} url={x.url} lang={lang}/>):null}
      {tab==="education"?items.slice(0,visible).map((x,i)=><LessonCard key={x.id||i} title={x.title} body={x.body} url={x.url} lang={lang}/>):null}
      {tab==="measure"?<Card style={{gap:10}}><Txt lang={lang} weight="900">{tr(lang,"اكتب رقم للتحويل","Enter a number to convert")}</Txt><AwareTextInput keyboardType="decimal-pad" value={conv} onChangeText={setConv} style={styles.search}/>{items.slice(0,visible).map((x,i)=><View key={x.id||i} style={styles.subcard}><Txt lang={lang} weight="900">{localized(x.label,lang)}</Txt><Txt lang={lang} style={{color:C.blue}}>{conv||"0"} {x.from} ≈ {(Number(conv||0)*Number(x.factor||1)).toFixed(2)} {x.to}</Txt></View>)}</Card>:null}
      {items.length>visible && tab!=="quiz"?<Btn lang={lang} title={tr(lang,`عرض المزيد (${items.length-visible})`,`Load more (${items.length-visible})`)} onPress={()=>setVisible(v=>v+15)} variant="light"/>:null}
      {items.length===0?<Empty lang={lang} title={tr(lang,"لا توجد نتائج","No results")}/>:null}
    </>:null}
  </Screen>;
}
const styles=StyleSheet.create({
  stats:{flexDirection:"row",gap:9,marginTop:6},stat:{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:12,paddingHorizontal:6,backgroundColor:"#FFFFFF"},
  pills:{flexDirection:"row",flexWrap:"wrap",gap:8},navPill:{flexDirection:"row",alignItems:"center",gap:7,borderRadius:999,paddingHorizontal:14,minHeight:42},outlinePill:{borderWidth:1.5,borderColor:C.dash,backgroundColor:C.paper},
  chips:{flexDirection:"row",gap:10,paddingVertical:4,paddingHorizontal:2},chip:{width:140,minHeight:170,alignItems:"center",justifyContent:"space-between",backgroundColor:C.paper,borderWidth:1.3,borderColor:C.line,paddingHorizontal:10,paddingVertical:12,borderRadius:18,gap:6},active:{backgroundColor:C.navy,borderColor:C.navy},
  openTag:{borderWidth:1.3,borderColor:C.dash,borderRadius:999,paddingHorizontal:10,paddingVertical:4,backgroundColor:C.paper},
  openBanner:{backgroundColor:C.greenSoft,borderRadius:14,paddingHorizontal:14,paddingVertical:12},
  codeTag:{backgroundColor:C.navy,borderRadius:999,paddingHorizontal:10,paddingVertical:3},
  imagePanel:{marginHorizontal:-18,marginTop:-18,marginBottom:4,padding:12,backgroundColor:C.cream,borderBottomWidth:1,borderColor:C.line},
  search:{minHeight:50,borderRadius:14,borderWidth:1.3,borderColor:"#E2CF9F",backgroundColor:C.paper,paddingHorizontal:14,color:C.ink,fontSize:16},
  image:{height:190,width:"100%",backgroundColor:C.cream,borderRadius:12},
  option:{borderWidth:1.3,borderColor:C.line,backgroundColor:C.paper,padding:14,borderRadius:12},selected:{backgroundColor:C.royal,borderColor:C.royal},correct:{borderColor:C.green,borderWidth:2.5},subcard:{gap:5,padding:12,borderRadius:12,backgroundColor:C.cream,borderWidth:1,borderColor:C.line}
});
