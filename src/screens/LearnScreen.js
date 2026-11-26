import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";
import { api } from "../api/client";
import {ErrorNotice,ChipRow, AwareTextInput, Btn, Card, Empty, Icon, IconChip, Loading, Pill, Screen, SectionHero, SectionHeading, Stamp, Txt } from "../components/UI";
import { ScrollView } from "react-native";
import { C, themed } from "../theme";
import { tr } from "../i18n";
import {friendlyError} from "../logic/appSafety.mjs";
import {buildSelection,localizeQuestion} from "../logic/quizSelection.mjs";
import { hostedCurrencyPhoto } from "../logic/currencyPhotos.mjs";
import SignTile,{SignGraphic} from "../components/SignTile";

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
// 3.7.1 (tester item 10): AnswerForU-hosted copies come first (the API sends them as *_local once the
// admin has saved them); an official image that cannot load — e.g. usmint.gov outside the U.S. — falls
// back after 8 s to a clear "not available" card with the official link instead of an empty box.
function RemoteImage({ primary, fallback, label, unavailable = null }) {
  const first = absolute(primary), second = absolute(fallback);
  const [src, setSrc] = useState(first || second);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setSrc(first || second); setLoaded(false); }, [first, second]);
  const failOver = useCallback(() => setSrc(s => s === first && second && first !== second ? second : ""), [first, second]);
  useEffect(() => { if (!src || loaded || /^https:\/\/(www\.)?answerforu\.com\//i.test(src)) return undefined; const t = setTimeout(failOver, 8000); return () => clearTimeout(t); }, [src, loaded, failOver]);
  if (!src) return unavailable;
  return <Image accessibilityLabel={label || "Lesson image"} source={{uri:src}} resizeMode="contain" style={styles.image} onLoad={() => setLoaded(true)} onError={failOver}/>;
}
function OpenSource({ url, lang }) {
  if (!/^https?:\/\//i.test(String(url || ""))) return null;
  return <Btn lang={lang} title={tr(lang, "فتح المصدر", "Open source")} onPress={() => Linking.openURL(url).catch(() => {})} variant="ghost"/>;
}
// 3.7.1 (tester item 14): the quiz ends on a result screen (score, percent, the answers to review)
// instead of silently starting over; item 9: ten questions drawn from every category in turn, so
// road signs no longer dominate, with the choices shuffled.
function QuizView({ bank, lang, onReview }) {
  const [round,setRound] = useState(0);
  const selection = useMemo(() => buildSelection(bank, Math.min(10, bank.length), { randomizeQuestions: true, randomizeChoices: true, balanceCategories: true }), [bank, round]);
  const questions = useMemo(() => selection.map(({ index, perm }) => { const q = bank[index] || {}; return localizeQuestion({ ...q, q: q.q || q.question, why: q.why || q.explanation, answer: Number(q.answer ?? q.correct_index ?? 0) }, perm, lang); }), [selection, bank, lang]);
  const [i,setI] = useState(0), [selected,setSelected] = useState(null), [given,setGiven] = useState([]);
  useEffect(() => { setI(0); setSelected(null); setGiven([]); }, [selection]);
  if (!questions.length) return <Empty lang={lang} title={tr(lang,"لا توجد أسئلة حاليًا","No questions available","No hay preguntas disponibles")}/>;
  const finished = i >= questions.length;
  const score = given.filter((g, k) => g === questions[k]?.answer).length;
  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    const message = percent >= 80 ? tr(lang,"ممتاز! انت فاهم الحياة اليومية كويس.","Excellent! You know everyday life well.","¡Excelente! Conoces bien la vida diaria.") : percent >= 50 ? tr(lang,"كويس — راجع الأسئلة اللي فاتتك.","Good — review the ones you missed.","Bien: repasa las que fallaste.") : tr(lang,"راجع الدروس وجرّب تاني.","Review the lessons and try again.","Repasa las lecciones e inténtalo de nuevo.");
    const missed = questions.map((q, k) => ({ q, k })).filter(({ q, k }) => given[k] !== q.answer);
    return <Card style={{gap:12}}>
      <Txt lang={lang} weight="900" style={{fontSize:21}}>{tr(lang,"نتيجتك","Your result","Tu resultado")}</Txt>
      <View style={{flexDirection:"row",alignItems:"center",gap:12}}><View style={styles.scoreRing}><Txt weight="900" style={{fontSize:26,color:C.blue,textAlign:"center"}}>{`${percent}%`}</Txt></View><View style={{flex:1,gap:4}}><Txt lang={lang} weight="900" style={{fontSize:18}}>{`${score} / ${questions.length}`} {tr(lang,"إجابة صحيحة","correct","correctas")}</Txt><Txt lang={lang} style={{color:C.muted}}>{message}</Txt></View></View>
      {missed.length ? <View style={{gap:8}}><Txt lang={lang} weight="900">{tr(lang,"راجع الإجابات الصحيحة","Review the correct answers","Repasa las respuestas correctas")}</Txt>{missed.map(({ q, k }) => <View key={k} style={styles.subcard}><Txt lang={lang} weight="800">{q.q}</Txt><Txt lang={lang} style={{color:C.greenInk}} weight="900">✓ {q.options[q.answer]}</Txt>{q.why ? <Txt lang={lang} style={{color:C.muted,lineHeight:22}}>{q.why}</Txt> : null}</View>)}</View> : null}
      <Btn lang={lang} icon="refresh-cw" title={tr(lang,"اختبار جديد بأسئلة مختلفة","New quiz with different questions","Nueva prueba con otras preguntas")} onPress={() => setRound(r => r + 1)} variant="blue"/>
      {onReview ? <Btn lang={lang} title={tr(lang,"راجع الدروس","Review the lessons","Repasar lecciones")} onPress={onReview} variant="light"/> : null}
    </Card>;
  }
  const q = questions[i];
  function pick(n) { if (selected !== null) return; setSelected(n); setGiven(g => { const next = g.slice(); next[i] = n; return next; }); }
  function next() { setSelected(null); setI(v => v + 1); }
  return <Card style={{gap:12}}>
    <Txt lang={lang} style={{fontSize:13,color:C.muted}} floor={12} weight="900">{`${i+1} / ${questions.length}`} · {tr(lang,"النتيجة","Score","Puntos")}: {score}</Txt>
    <Txt lang={lang} style={{fontSize:18}} weight="900">{q.q}</Txt>
    <RemoteImage primary={q.image_local || q.image} fallback={q.image_fallback || q.image} label={q.imageAlt}/>
    {q.options.map((opt,n)=><Pressable key={n} accessibilityRole="button" onPress={()=>pick(n)} style={[styles.option,selected===n&&styles.selected,selected!==null&&n===q.answer&&styles.correct]}><Txt lang={lang} style={{color:selected===n?C.onDark:C.ink}} weight="800">{String(opt ?? "")}</Txt></Pressable>)}
    {selected!==null?<><Txt lang={lang} style={{color:selected===q.answer?C.greenInk:C.redInk}} weight="900">{selected===q.answer?tr(lang,"إجابة صحيحة ✓","Correct ✓","Correcto ✓"):tr(lang,"إجابة غير صحيحة","Not quite","No exactamente")}</Txt>{q.why?<Txt lang={lang} style={{color:C.muted,lineHeight:23}}>{q.why}</Txt>:null}<Btn lang={lang} title={i+1===questions.length?tr(lang,"اعرض النتيجة","See my result","Ver mi resultado"):tr(lang,"السؤال التالي","Next question","Siguiente pregunta")} onPress={next} variant="blue"/></>:null}
  </Card>;
}
function Currency({ item, lang }) {
  const [side,setSide] = useState("front");
  // 3.7.2 (website 6.4.3): currency photos only from AnswerForU — the stored copy, then the copy
  // bundled in the website release; the official page stays a link (OpenSource below).
  const photo = hostedCurrencyPhoto(item?.[`${side}_local`]) || hostedCurrencyPhoto(item?.[side]);
  const fallback = hostedCurrencyPhoto(item?.[`${side}_fallback`]);
  return <Card style={{gap:10}}>
    <Txt lang={lang} weight="900" style={{fontSize:19}}>{item.name || item.id} · {item.value}</Txt>
    <Txt lang={lang} style={{color:C.muted}}>{localized(item.caption || item.note,lang)}</Txt>
    <View style={{flexDirection:"row",gap:8}}><View style={{flex:1}}><Btn lang={lang} title={tr(lang,"الوجه","Front")} onPress={()=>setSide("front")} variant={side==="front"?"dark":"light"}/></View><View style={{flex:1}}><Btn lang={lang} title={tr(lang,"الظهر","Back")} onPress={()=>setSide("back")} variant={side==="back"?"dark":"light"}/></View></View>
    <RemoteImage primary={photo} fallback={fallback} label={item.name} unavailable={<View style={styles.unavailable}><Icon name="image" size={22} color={C.muted}/><Txt lang={lang} style={{color:C.muted,textAlign:"center"}}>{tr(lang,"صورة العملة مش متاحة دلوقتي من المصدر الرسمي — افتح الصفحة الرسمية تحت.","The official photo is not available right now — open the official page below.","La foto oficial no está disponible ahora; abre la página oficial abajo.")}</Txt></View>}/>
    <OpenSource lang={lang} url={item.source || item[`${side}_official_url`]}/>
  </Card>;
}
// 3.7.1 (tester items 11 + 12): every sign on the same padded white tile; signs without a photo in
// the content are drawn from their shape, colour and legend instead of showing no picture.
function SignCard({ item, lang }) {
  const photo = absolute(item.image_local || item.image);
  const [failed,setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo]);
  const drawn = !photo || failed;
  return <Card style={{gap:9}}>
    <SignTile label={`${item.name || item.label || ""} — ${localized(item.meaning,lang)}`}>
      {drawn ? <SignGraphic shape={item.shape} color={item.color} label={item.label || item.name} size={164}/> : <Image source={{uri:photo}} resizeMode="contain" style={{width:"100%",height:"100%"}} onError={() => setFailed(true)}/>}
    </SignTile>
    <View style={{flexDirection:"row",alignItems:"center",gap:8}}><Txt lang={lang} style={{fontSize:19,flex:1}} weight="900">{item.name || item.label}</Txt>{item.code?<View style={styles.codeTag}><Txt weight="900" style={{fontSize:13,color:C.onDark}}>{item.code}</Txt></View>:null}</View>
    {item.meaning?<Txt lang={lang} style={{color:C.muted,lineHeight:24}}>{localized(item.meaning,lang)}</Txt>:null}
    {drawn?<Txt lang={lang} floor={12} style={{fontSize:13,color:C.muted}}>{tr(lang,"رسم توضيحي للإشارة","Illustration of the sign","Ilustración de la señal")}</Txt>:null}
  </Card>;
}
// 3.7.1 (tester item 9): each topic opens with pictures of what it really covers, not road signs.
const TOPIC_ART = {
  guides: [["home","credit-card","phone"],"السكن والفلوس والموبايل والأوراق — خطوات أول أيامك","Housing, money, phone and papers — your first steps","Vivienda, dinero, teléfono y papeles: tus primeros pasos"],
  currency: [["dollar-sign","credit-card","shopping-cart"],"العملات والبطاقات والدفع في المحلات","Coins, bills, cards and paying in stores","Monedas, billetes, tarjetas y pagos"],
  signs: [["alert-triangle","navigation","map"],"إشارات الطريق للسواقة والمشي","Road signs for driving and walking","Señales para conducir y caminar"],
  quiz: [["help-circle","check-circle","award"],"أسئلة من كل المواضيع: الفلوس والحياة اليومية والإشارات والقياسات","Questions from every topic: money, daily life, signs, measurements","Preguntas de todos los temas: dinero, vida diaria, señales, medidas"],
  stores: [["shopping-bag","tag","truck"],"فين تشتري الأكل والهدوم والأجهزة بسعر كويس","Where to buy food, clothes and electronics for less","Dónde comprar comida, ropa y electrónica"],
  services: [["tool","phone","map-pin"],"البنك والبريد والدكتور والخدمات اللي هتحتاجها","Bank, post office, doctor and everyday services","Banco, correo, médico y servicios diarios"],
  education: [["award","book-open","users"],"المدارس والجامعات وتعلّم الإنجليزي","Schools, colleges and learning English","Escuelas, universidades e inglés"],
  measure: [["thermometer","droplet","maximize-2"],"الحرارة والأوزان والمسافات بالنظام الأمريكي","Temperature, weights and distances the U.S. way","Temperatura, pesos y distancias en EE. UU."],
};
function TopicBanner({ tab, lang, count }) {
  const art = TOPIC_ART[tab]; if (!art) return null;
  return <View style={styles.topicBanner}>
    <View style={{flexDirection:"row",gap:8}}>{art[0].map((name, i) => <View key={name} style={[styles.topicIcon,{backgroundColor:[C.royalSoft,C.goldSoft,C.greenSoft][i]}]}><Icon name={name} size={22} color={[C.blue,C.goldDark,C.greenInk][i]}/></View>)}</View>
    <Txt lang={lang} weight="800" style={{flex:1,lineHeight:22}}>{tr(lang,art[1],art[2],art[3])}{count?` · ${count}`:""}</Txt>
  </View>;
}
function LessonCard({title, body, label, image, fallback, url, lang}) {
  return <Card style={{gap:9,overflow:"hidden"}}>
    {image?<View style={styles.imagePanel}><RemoteImage primary={image} fallback={fallback} label={localized(title,lang)}/></View>:null}
    <View style={{flexDirection:"row",alignItems:"center",gap:8}}><Txt lang={lang} style={{fontSize:19,flex:1,color:C.ink}} weight="900">{localized(title,lang) || label}</Txt>{label&&localized(title,lang)?<View style={styles.codeTag}><Txt weight="900" style={{fontSize:13,color:C.onDark}}>{label}</Txt></View>:null}</View>
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
  // 3.7.1 (tester item 9): daily life leads the hero; road signs are one topic among eight.
  const stats=data?[[(data.life_guides||[]).length,tr(lang,"دليل للحياة اليومية","daily-life guides","guías diarias"),C.blue],[LESSONS.length,tr(lang,"مسارات تعلم","learning paths","rutas"),C.greenInk],[(data.quiz_bank||[]).length,tr(lang,"أسئلة في الاختبار","quiz questions","preguntas"),C.airRed]]:[];
  return <Screen lang={lang}>
    <SectionHero lang={lang} icon="feather" eyebrow={tr(lang,"اتعلم أمريكا · خطوة صغيرة كل يوم","Learn America · small steps, big progress","Aprende EE. UU. · paso a paso")} title={tr(lang,"اتعلم الحياة في أمريكا","Learn life in America","Aprende sobre la vida en EE. UU.")} subtitle={tr(lang,"دروس وصور وتدريبات متجددة من الموقع.","Fresh lessons, visuals and activities from the website.","Lecciones, imágenes y actividades del sitio web.")}>{stats.length?<View style={styles.stats}>{stats.map(([n,l,c],i)=><Stamp key={i} style={styles.stat}><Txt weight="900" style={{fontSize:34,lineHeight:40,color:c,textAlign:"center"}}>{String(n)}</Txt><Txt lang={lang} weight="700" style={{fontSize:14,lineHeight:18,textAlign:"center",color:C.ink}}>{l}</Txt></Stamp>)}</View>:null}</SectionHero>
    <Card style={{gap:10}}><Txt lang={lang} weight="900" style={{fontSize:17}}>{tr(lang,"تعلم واتدرب كمان","More learning and practice","Más aprendizaje y práctica")}</Txt><View style={styles.pills}><View style={[styles.navPill,{backgroundColor:C.navy}]}><Icon name="book-open" size={16} color={C.gold}/><Txt lang={lang} weight="900" style={{color:C.onDark,fontSize:14}}>{tr(lang,"الدروس والاختبارات","Lessons & quizzes","Lecciones y pruebas")}</Txt></View><Pressable accessibilityRole="button" onPress={()=>navigate("citizenship")} style={[styles.navPill,{backgroundColor:C.goldSoft}]}><Icon name="award" size={16} color={C.goldDark}/><Txt lang={lang} weight="900" style={{fontSize:14,color:C.goldDark}}>{tr(lang,"الجنسية الأمريكية","U.S. Citizenship","Ciudadanía estadounidense")}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate("survival")} style={[styles.navPill,{backgroundColor:C.royalSoft}]}><Icon name="message-circle" size={16} color={C.blue}/><Txt lang={lang} weight="900" style={{fontSize:14,color:C.blue}}>{tr(lang,"إنجليزي أول شهور","Survival English","Inglés de supervivencia")}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate("offlinePacks")} style={[styles.navPill,styles.outlinePill]}><Icon name="download" size={16} color={C.ink}/><Txt lang={lang} weight="900" style={{fontSize:14}}>{tr(lang,"حزم التعلم دون إنترنت","Offline packs","Paquetes sin conexión")}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate("glossary")} style={[styles.navPill,styles.outlinePill]}><Icon name="book" size={16} color={C.ink}/><Txt lang={lang} weight="900" style={{fontSize:14}}>{tr(lang,"قاموس أمريكا — المصطلحات","U.S. Glossary — terms","Glosario")}</Txt></Pressable></View></Card><SectionHeading lang={lang} title={tr(lang,"اختار موضوعك","Choose your topic","Elige un tema")} caption={tr(lang,"اضغط على أي موضوع لعرض الدرس تحت","Select a topic to view its lessons","Elige un tema para ver sus lecciones")}/>
    {loading?<Loading lang={lang}/>:null}
    {error?<ErrorNotice lang={lang} message={error} onRetry={load}/>:null}
    {data?<>
      <ChipRow lang={lang} contentStyle={styles.chips}>{LESSONS.map(([key,icon,ar,en,field,es],i)=>{const on=tab===key;return <Pressable key={key} accessibilityRole="button" onPress={()=>select(key)} style={[styles.chip,on&&styles.active]}><IconChip name={icon} tint={on?1:0} size={42} iconSize={19}/><Txt lang={lang} numberOfLines={2} style={{color:on?C.onDark:C.ink,fontSize:16,lineHeight:21,textAlign:"center"}} weight="900">{tr(lang,ar,en,es)}</Txt><Txt lang={lang} style={{color:on?C.onDarkSoft:C.muted,fontSize:13,textAlign:"center"}}>{(data[field]||[]).length} {tr(lang,"عنصر","items","elementos")}</Txt><View style={[styles.openTag,on&&{backgroundColor:C.gold,borderColor:C.gold}]}><Txt lang={lang} weight="900" style={{fontSize:13,color:on?C.onGold:C.ink,textAlign:"center"}}>{on?tr(lang,"مفتوح تحت","Open below","Abierto abajo"):tr(lang,"افتح القسم","Open section","Abrir")}</Txt></View></Pressable>})}</ChipRow>
      <View style={styles.openBanner}><Txt lang={lang} weight="900" style={{color:C.greenInk}}>{tr(lang,"القسم المفتوح الآن: ","Open now: ","Abierto ahora: ")}{tr(lang,current[2],current[3],current[5])}</Txt></View>
      {tab!=="quiz"?<AwareTextInput value={query} onChangeText={v=>{setQuery(v);setVisible(15)}} placeholder={tr(lang,"ابحث في الدروس...","Search lessons...")} placeholderTextColor={C.placeholder} style={styles.search}/>:null}
      <TopicBanner tab={tab} lang={lang} count={tab==="signs"&&data?`${(data.road_signs||[]).length} ${tr(lang,"إشارة","signs","señales")}`:""}/>
      {tab==="quiz"?<QuizView bank={items} lang={lang} onReview={()=>select("guides")}/>:null}
      {tab==="currency"?items.slice(0,visible).map((x,i)=><Currency key={x.id||i} item={x} lang={lang}/>):null}
      {tab==="signs"?items.slice(0,visible).map((x,i)=><SignCard key={x.id||i} item={x} lang={lang}/>):null}
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
const styles=themed(() => StyleSheet.create({
  stats:{flexDirection:"row",gap:9,marginTop:6},stat:{flex:1,alignItems:"center",justifyContent:"center",paddingVertical:12,paddingHorizontal:6,backgroundColor:C.surface},
  pills:{flexDirection:"row",flexWrap:"wrap",gap:8},navPill:{flexDirection:"row",alignItems:"center",gap:7,borderRadius:999,paddingHorizontal:14,minHeight:42},outlinePill:{borderWidth:1.5,borderColor:C.dash,backgroundColor:C.paper},
  chips:{flexDirection:"row",gap:10,paddingVertical:4,paddingHorizontal:2},chip:{width:140,minHeight:170,alignItems:"center",justifyContent:"space-between",backgroundColor:C.paper,borderWidth:1.3,borderColor:C.line,paddingHorizontal:10,paddingVertical:12,borderRadius:18,gap:6},active:{backgroundColor:C.navy,borderColor:C.navy},
  openTag:{borderWidth:1.3,borderColor:C.dash,borderRadius:999,paddingHorizontal:10,paddingVertical:4,backgroundColor:C.paper},
  openBanner:{backgroundColor:C.greenSoft,borderRadius:14,paddingHorizontal:14,paddingVertical:12},
  codeTag:{backgroundColor:C.navy,borderRadius:999,paddingHorizontal:10,paddingVertical:3},
  imagePanel:{marginHorizontal:-18,marginTop:-18,marginBottom:4,padding:12,backgroundColor:C.cream,borderBottomWidth:1,borderColor:C.line},
  search:{minHeight:50,borderRadius:14,borderWidth:1.3,borderColor:C.inputBorder,backgroundColor:C.paper,paddingHorizontal:14,color:C.ink,fontSize:16},
  image:{height:190,width:"100%",backgroundColor:C.cream,borderRadius:12},
  unavailable:{minHeight:150,borderRadius:12,borderWidth:1.3,borderStyle:"dashed",borderColor:C.dash,backgroundColor:C.cream,alignItems:"center",justifyContent:"center",gap:8,padding:16},
  scoreRing:{width:86,height:86,borderRadius:43,borderWidth:6,borderColor:C.royal,alignItems:"center",justifyContent:"center",backgroundColor:C.royalSoft},
  topicBanner:{flexDirection:"row",alignItems:"center",gap:12,backgroundColor:C.paper,borderWidth:1,borderColor:C.line,borderRadius:16,padding:12},
  topicIcon:{width:44,height:44,borderRadius:14,alignItems:"center",justifyContent:"center"},
  option:{borderWidth:1.3,borderColor:C.line,backgroundColor:C.paper,padding:14,borderRadius:12},selected:{backgroundColor:C.royal,borderColor:C.royal},correct:{borderColor:C.green,borderWidth:2.5},subcard:{gap:5,padding:12,borderRadius:12,backgroundColor:C.cream,borderWidth:1,borderColor:C.line}
}));
