import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";
import { api } from "../api/client";
import { AwareTextInput, Btn, Card, Empty, Loading, Pill, Screen, SectionHero, SectionHeading, Txt } from "../components/UI";
import { C } from "../theme";
import { tr } from "../i18n";
import {friendlyError} from "../logic/appSafety.mjs";

// The PHP API is the single source of content; do not duplicate the lesson catalog in the APK.
const LESSONS = [
  ["guides", "◈", "دليل الحياة", "Life guides", "life_guides","Guías prácticas"],
  ["currency", "$", "العملات", "Currency", "currency_items","Monedas"],
  ["signs", "△", "إشارات المرور", "Road signs", "road_signs","Señales viales"],
  ["quiz", "?", "اختبر نفسك", "Practice quiz", "quiz_bank","Cuestionario"],
  ["stores", "▣", "المحلات", "Stores", "store_groups","Tiendas"],
  ["services", "⚙", "الخدمات اليومية", "Daily services", "service_places","Servicios diarios"],
  ["education", "✦", "التعليم", "Education", "education_cards","Educación"],
  ["measure", "↔", "المقاسات", "Measurements", "conversions","Medidas"],
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
  return <Card style={{gap:9}}>
    <Txt lang={lang} style={{fontSize:17}} weight="900">{localized(title,lang) || label}</Txt>
    {image?<RemoteImage primary={image} fallback={fallback} label={localized(title,lang)}/>:null}
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
  return <Screen lang={lang}><Card style={{gap:9}}><Txt lang={lang} weight="900" style={{fontSize:17}}>{tr(lang,"تعلم واتدرب كمان","More learning and practice","Más aprendizaje y práctica")}</Txt><Btn lang={lang} title={tr(lang,"🇺🇸 الجنسية الأمريكية","🇺🇸 U.S. Citizenship","🇺🇸 Ciudadanía estadounidense")} onPress={()=>navigate("citizenship")} variant="blue"/><Btn lang={lang} title={tr(lang,"🗣 إنجليزي أول شهور","🗣 Survival English","🗣 Inglés de supervivencia")} onPress={()=>navigate("survival")} variant="light"/><Btn lang={lang} title={tr(lang,"⇩ حزم التعلم دون إنترنت","⇩ Offline packs","⇩ Paquetes sin conexión")} onPress={()=>navigate("offlinePacks")} variant="light"/></Card>
    <SectionHero lang={lang} icon="✦" eyebrow={tr(lang,"خطوة صغيرة كل يوم","SMALL STEPS, BIG PROGRESS","APRENDE PASO A PASO")} title={tr(lang,"اتعلم الحياة في أمريكا","Learn life in America","Aprende sobre la vida en EE. UU.")} subtitle={tr(lang,"دروس وصور وتدريبات متجددة من الموقع.","Fresh lessons, visuals and activities from the website.","Lecciones, imágenes y actividades del sitio web.")}/><SectionHeading lang={lang} title={tr(lang,"اختار موضوعك","Choose your topic","Elige un tema")} caption={tr(lang,"اضغط على أي موضوع لعرض الدرس تحت","Select a topic to view its lessons","Elige un tema para ver sus lecciones")}/>
    {loading?<Loading lang={lang}/>:null}
    {error?<Card style={{gap:10}}><Txt lang={lang} style={{color:C.red}}>{error}</Txt><Btn lang={lang} title={tr(lang,"إعادة المحاولة","Retry")} onPress={load} variant="blue"/></Card>:null}
    {data?<>
      <View style={styles.chips}>{LESSONS.map(([key,icon,ar,en,field,es])=><Pressable key={key} onPress={()=>select(key)} style={[styles.chip,tab===key&&styles.active]}><Txt lang={lang} style={{color:tab===key?"#fff":C.ink,fontSize:12}} weight="900">{icon} {tr(lang,ar,en,es)} ({(data[field]||[]).length})</Txt></Pressable>)}</View>
      {tab!=="quiz"?<AwareTextInput value={query} onChangeText={v=>{setQuery(v);setVisible(15)}} placeholder={tr(lang,"ابحث في الدروس...","Search lessons...")} placeholderTextColor="#64748b" style={styles.search}/>:null}
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
  chips:{flexDirection:"row",flexWrap:"wrap",gap:9},chip:{width:"48%",minHeight:85,justifyContent:"center",backgroundColor:"#fff",borderWidth:1,borderColor:C.line,paddingHorizontal:14,paddingVertical:12,borderRadius:19},active:{backgroundColor:C.teal,borderColor:C.teal},
  search:{minHeight:48,borderRadius:14,borderWidth:1,borderColor:C.line,backgroundColor:"#fff",paddingHorizontal:14,color:C.ink,fontSize:16},
  image:{height:190,width:"100%",backgroundColor:"#f8fafc",borderRadius:12},
  option:{borderWidth:1,borderColor:C.line,backgroundColor:"#fff",padding:14,borderRadius:12},selected:{backgroundColor:C.blue,borderColor:C.blue},correct:{borderColor:C.green},subcard:{gap:5,padding:11,borderRadius:12,backgroundColor:"#f8fafc",borderWidth:1,borderColor:C.line}
});
