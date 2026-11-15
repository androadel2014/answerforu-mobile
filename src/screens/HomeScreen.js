import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,View,StyleSheet} from 'react-native';
import {ErrorNotice,ArrowCircle,AwareTextInput,Btn,Card,Icon,IconChip,RoadSignsArt,RouteArt,Screen,SectionHero,SectionHeading,Stamp,TrustIcon,Txt} from '../components/UI';
import {C,spacing} from '../theme';
import {tr} from '../i18n';
import {api,rows} from '../api/client';
import {friendlyError} from '../logic/appSafety.mjs';
const links=[
 ['journey','map','رحلتي في أمريكا','My journey','Mi camino','خطواتك من أول يوم','Your next steps','Tus próximos pasos'],
 ['learn','book-open','اتعلم أمريكا','Learn America','Aprender','دروس سريعة واختبارات','Quick lessons and quizzes','Lecciones y pruebas'],
 ['community','shopping-bag','أماكن وشغل وخدمات','Explore nearby','Explorar','اكتشف حاجات مفيدة حواليك','Discover places, jobs and services','Lugares, trabajo y servicios'],
 ['survival','message-circle','إنجليزي أول شهور','Survival English','Inglés útil','اتكلم في المواقف اليومية','Speak in everyday situations','Habla en situaciones reales'],
 ['citizenship','award','الجنسية الأمريكية','Citizenship','Ciudadanía','تدريب وحساب الأهلية','Practice and eligibility','Práctica y elegibilidad'],
 ['glossary','book','القاموس','Glossary','Glosario','افهم الكلمات الجديدة','Everyday words explained','Palabras cotidianas'],
 ['feed','users','تجارب المجتمع','Community stories','Comunidad','اقرأ وشارك خبرتك','Read and share stories','Lee y comparte'],
 ['cv','file-text','اعمل سيرتك الذاتية','Build your CV','Crear CV','جهز سيرتك للشغل','Build your work resume','Tu currículum para trabajar'],
];
export default function HomeScreen({lang,user,navigate}){
 const [q,setQ]=useState(''),[terms,setTerms]=useState([]),[places,setPlaces]=useState([]),[items,setItems]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const name=user?.display_name||user?.name||user?.username||'';
 useEffect(()=>{let active=true;setBusy(true);
 Promise.allSettled([api.glossary(),api.places(),api.listings()]).then(res=>{
  if(!active)return;
  if(res[0].status==='fulfilled')setTerms(rows(res[0].value,['terms','items']));
  if(res[1].status==='fulfilled')setPlaces(rows(res[1].value,['places','items']));
  if(res[2].status==='fulfilled')setItems(rows(res[2].value,['listings','items']));
  if(res.every(r=>r.status==='rejected'))setError(friendlyError(res[0].reason,lang));
 }).finally(()=>{if(active)setBusy(false)});return()=>{active=false};},[]);
 const results=useMemo(()=>{const x=q.trim().toLocaleLowerCase();if(!x)return [];
  const matches=(r,keys)=>keys.some(k=>String(r?.[k]||'').toLocaleLowerCase().includes(x));
  return [
   ...links.filter(a=>[a[2],a[3],a[4]].some(s=>s.toLocaleLowerCase().includes(x))).map(a=>({title:tr(lang,a[2],a[3],a[4]),sub:tr(lang,a[5],a[6],a[7]),route:a[0]})),
   ...terms.filter(v=>matches(v,['term','pron_ar','definition_ar','definition_en'])).slice(0,7).map(v=>({title:v.term,sub:v.definition_ar||v.definition_en,route:'glossary'})),
   ...places.filter(v=>matches(v,['name','city','state'])).slice(0,6).map(v=>({title:v.name,sub:[v.city,v.state].filter(Boolean).join(', '),route:'listingDetail',params:{item:v,type:'places'}})),
   ...items.filter(v=>matches(v,['title','description','city'])).slice(0,6).map(v=>({title:v.title,sub:v.city,route:'listingDetail',params:{item:v,type:v.type||'services'}})),
  ].slice(0,24);
 },[q,terms,places,items,lang]);
 const fwd=lang==='ar'?'arrow-left':'arrow-right';
 // "Pick your goal now" — first two rows keep the original first-step (journey) and marketplace actions.
 const goals=[
  ['journey','compass',0,'عايز أعرف الخطوة اللي بعد كده','I need my next step','Necesito mi próximo paso'],
  ['community','message-circle',3,'عايز أسأل الناس أو أقارن خدمة','I want to ask or compare a service','Quiero preguntar o comparar un servicio'],
  ['learn','book-open',1,'عايز أفهم الحياة اليومية','I want to understand daily life','Quiero entender la vida diaria'],
  ['survival','message-square',2,'إنجليزي أول شهور — جمل المواقف','Survival English — everyday phrases','Inglés básico — frases diarias'],
 ];
 return <Screen lang={lang} contentStyle={{gap:18}}>
  <SectionHero variant="envelope" lang={lang} icon="send" eyebrow={name?tr(lang,`أهلاً ${name} · AnswerForU`,`Welcome, ${name} · AnswerForU`,`¡Hola, ${name}! · AnswerForU`):tr(lang,'AnswerForU · دليلك للحياة في أمريكا','AnswerForU · U.S. Life OS','AnswerForU · Tu guía en EE. UU.')} titleSize={lang==='es'?28:lang==='ar'?34:32} title={tr(lang,'أمريكا أسهل\nلما تعرف تعمل إيه بعد كده','America gets easier when the next step is clear','EE. UU. es más fácil con el próximo paso claro')} subtitle={tr(lang,'مش محتاج تلف في الموقع. ابدأ برحلتك لو عايز تعرف تعمل إيه، أو اتعلم أمريكا لو عايز تفهم الحياة اليومية بسرعة.','You do not need to browse everything. Open your journey for the next action, or Learn America for everyday life skills.','Abre tu ruta para el próximo paso, o Aprender para la vida diaria.')}>
   <View style={{gap:10,marginTop:4}}>
    <Btn lang={lang} variant="blue" icon="forward" title={tr(lang,'ابدأ من رحلتي','Open my journey','Abrir mi ruta')} onPress={()=>navigate('journey')}/>
    <Btn lang={lang} variant="light" icon="award" title={tr(lang,'اختبر نفسي','Test what I know','Ponme a prueba')} onPress={()=>navigate('learn')}/>
   </View>
   <View style={st.dashRule}/>
   <Txt lang={lang} weight="900" style={{fontSize:21,color:C.navy}}>{tr(lang,'اختار هدفك دلوقتي','What do you need now?','¿Qué necesitas ahora?')}</Txt>
   <View>{goals.map((g,i)=><Pressable key={g[0]} accessibilityRole="button" onPress={()=>navigate(g[0])} style={[st.goal,i<goals.length-1&&st.goalLine]}><IconChip name={g[1]} tint={g[2]} size={44} iconSize={20}/><Txt lang={lang} weight="800" style={{flex:1}}>{tr(lang,g[3],g[4],g[5])}</Txt><ArrowCircle lang={lang} size={34}/></Pressable>)}</View>
  </SectionHero>

  <Card style={st.searchCard}><View style={st.searchHead}><Icon name="search" size={20} color={C.royal}/><Txt lang={lang} weight="900" style={{flex:1}}>{tr(lang,'ابحث عن اللي محتاجه','Find what you need','Encuentra lo que necesitas')}</Txt></View><AwareTextInput value={q} onChangeText={setQ} autoCorrect={false} placeholder={tr(lang,'مكان، شغل، كلمة، درس…','Place, job, word, lesson…','Lugar, trabajo, palabra, lección…')} placeholderTextColor={C.muted} textAlign={lang==='ar'?'right':'left'} style={st.search}/></Card>
  {q.trim()?<View style={{gap:9}}>{results.length?results.map((r,i)=><Pressable key={r.route+i+r.title} onPress={()=>navigate(r.route,r.params||null)} style={st.result}><View style={{flex:1,gap:2}}><Txt lang={lang} weight="800">{r.title}</Txt><Txt lang={lang} style={{color:C.muted}} numberOfLines={2}>{r.sub||''}</Txt></View><Icon name={fwd} size={18} color={C.royal}/></Pressable>):<Card><Txt lang={lang}>{busy?tr(lang,'بندور على النتائج…','Searching…','Buscando…'):tr(lang,'مش لاقيين نتيجة. جرّب كلمة تانية.','No results. Try another word.','Sin resultados. Prueba otra palabra.')}</Txt><Btn lang={lang} variant="light" title={tr(lang,'تصفح الأماكن','Explore places','Explorar lugares')} onPress={()=>navigate('community')}/></Card>}</View>:<>
   <SectionHeading lang={lang} eyebrow={tr(lang,'✦ ابدأ بالاتنين دول','✦ Start with these two','✦ Empieza con estos dos')} title={tr(lang,'رحلتك + تعليمك هما قلب AnswerForU','Your journey + learning are the core','Tu ruta + aprendizaje son lo esencial')} caption={tr(lang,'افتح خطتك الشخصية أو اتعلم المهارات اليومية بخطوات بسيطة.','Follow your personal plan or learn everyday skills, one step at a time.','Sigue tu plan personal o aprende habilidades diarias, paso a paso.')}/>
   <Stamp tone="blue" style={st.bigStamp}><RouteArt/><Txt lang={lang} weight="900" style={{color:C.onDarkSoft,fontSize:14}}>{tr(lang,'01 / خطتك الشخصية','01 / Your personal plan','01 / Tu plan personal')}</Txt><Txt lang={lang} weight="900" style={{color:C.white,fontSize:28,lineHeight:38}}>{tr(lang,'رحلتي في أمريكا','My U.S. Journey','Mi ruta en EE. UU.')}</Txt><Txt lang={lang} style={{color:C.onDarkSoft}}>{tr(lang,'اعرف أنت فين، إيه اللي خلص، وإيه أحسن خطوة تعملها دلوقتي.','Know where you are, what is done, and the best next action.','Sabe dónde estás, qué está hecho y la mejor próxima acción.')}</Txt><Btn lang={lang} variant="light" icon="forward" title={tr(lang,'افتح الآن','Open now','Abrir ahora')} onPress={()=>navigate('journey')} style={st.onBlueBtn}/></Stamp>
   <Stamp tone="cream" style={st.bigStamp}><View style={{paddingVertical:8}}><RoadSignsArt/></View><Txt lang={lang} weight="900" style={{color:C.goldDark,fontSize:14}}>{tr(lang,'02 / اتعلم بالممارسة','02 / Learn by doing','02 / Aprende practicando')}</Txt><Txt lang={lang} weight="900" style={{color:C.navy,fontSize:28,lineHeight:38}}>{tr(lang,'اتعلم أمريكا','Learn America','Aprender EE. UU.')}</Txt><Txt lang={lang} style={{color:C.muted}}>{tr(lang,'عملات، إشارات، قياسات، محلات وخدمات — بالصور والاختبارات.','Money, signs, measurements, stores and services — visually and interactively.','Dinero, señales, medidas, tiendas y servicios — con imágenes y pruebas.')}</Txt><Btn lang={lang} variant="dark" icon="forward" title={tr(lang,'افتح الآن','Open now','Abrir ahora')} onPress={()=>navigate('learn')} style={{alignSelf:'flex-start',minWidth:150}}/></Stamp>

   <SectionHeading lang={lang} eyebrow={tr(lang,'استكشف AnswerForU','AnswerForU / Explore','Explora AnswerForU')} title={tr(lang,'كل اللي تحتاجه في مكان واحد','Everything you need, in one place','Todo lo que necesitas, en un lugar')} caption={tr(lang,"اختار اللي يهمك","Choose what matters to you","Elige lo que necesitas")}/>
   <View style={st.chipRow}><Pressable accessibilityRole="button" onPress={()=>navigate('feed')} style={st.feedChip}><Icon name="message-circle" size={17} color={C.green}/><Txt lang={lang} weight="900" style={{color:C.green}}>{tr(lang,'منشورات المجتمع','Community posts','Publicaciones')}</Txt></Pressable><Pressable accessibilityRole="button" onPress={()=>navigate('community')} style={st.marketChip}><Icon name="shopping-bag" size={17} color={C.navy}/><Txt lang={lang} weight="900">{tr(lang,'افتح السوق','Browse marketplace','Abrir mercado')}</Txt><Icon name={fwd} size={16} color={C.navy}/></Pressable></View>
   <View style={st.explore}>{links.slice(1).filter(x=>x[0]!=='community').map((x,i,arr)=><Pressable key={x[0]} accessibilityRole="button" onPress={()=>navigate(x[0])} style={[st.tile,i<arr.length-1&&st.tileLine]}><IconChip name={x[1]} tint={i} size={48}/><View style={{flex:1,gap:3}}><Txt lang={lang} weight="900" style={{fontSize:19}}>{tr(lang,x[2],x[3],x[4])}</Txt><Txt lang={lang} style={{color:C.muted}}>{tr(lang,x[5],x[6],x[7])}</Txt></View><ArrowCircle lang={lang}/></Pressable>)}</View>

   <View style={st.trust}>{[['shield','المصدر الرسمي واضح','Official sources stay clear','Fuentes oficiales claras','المصدر الحكومي منفصل بوضوح عن رأي المجتمع والريفيرال.','Official sources stay separate from community opinion and referrals.','Las fuentes oficiales están separadas de opiniones y referidos.'],['map-pin','حسب ولايتك','Built around your state','Según tu estado','DMV وخدمات ومصادر تتغير حسب مكانك.','DMV and resources adapt to where you live.','DMV y recursos según dónde vives.'],['briefcase','من الوصول للاستقرار','From arrival to long-term life','De la llegada a la estabilidad','المنصة تكبر معاك: شغل، دراسة، ضرائب، بيت، استثمار ومواطنة.','Career, education, taxes, home, wealth and citizenship.','Trabajo, estudios, impuestos, vivienda y ciudadanía.']].map(t=><View key={t[0]} style={st.trustRow}><TrustIcon name={t[0]}/><View style={{flex:1,gap:3}}><Txt lang={lang} weight="900" style={{color:C.white,fontSize:19}}>{tr(lang,t[1],t[2],t[3])}</Txt><Txt lang={lang} style={{color:C.onDarkMuted}}>{tr(lang,t[4],t[5],t[6])}</Txt></View></View>)}</View>
  </>}
  {error?<ErrorNotice lang={lang} message={error} action={{title:tr(lang,'تصفح المحتوى المتاح','Browse available content','Explorar contenido'),icon:"grid",onPress:()=>navigate('all')}}/>:null}
 </Screen>;
}
const st=StyleSheet.create({dashRule:{height:0,borderTopWidth:1.5,borderStyle:'dashed',borderColor:C.dash,marginVertical:6},goal:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:11},goalLine:{borderBottomWidth:1,borderColor:C.line},searchCard:{gap:11,padding:14},searchHead:{flexDirection:"row",alignItems:"center",gap:10},search:{borderWidth:1.3,borderColor:C.inputBorder,borderRadius:13,paddingHorizontal:14,minHeight:52,fontSize:16,color:C.ink,backgroundColor:C.paper},bigStamp:{padding:20,gap:9,borderRadius:4},onBlueBtn:{alignSelf:'flex-start',minWidth:150,backgroundColor:C.white,borderColor:C.white,borderBottomColor:C.royalLine},chipRow:{flexDirection:'row',flexWrap:'wrap',gap:10},feedChip:{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,minHeight:46,borderRadius:999,backgroundColor:C.greenSoft},marketChip:{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:16,minHeight:46,borderRadius:14,borderWidth:1.5,borderColor:C.navy,backgroundColor:C.paper},explore:{backgroundColor:C.paper,borderWidth:1,borderColor:C.line,borderRadius:22,paddingHorizontal:16},tile:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:16},tileLine:{borderBottomWidth:1,borderColor:C.line},trust:{backgroundColor:C.navy,borderRadius:22,padding:20,gap:20,overflow:'hidden'},trustRow:{flexDirection:'row',alignItems:'flex-start',gap:14},result:{flexDirection:'row',alignItems:'center',gap:10,padding:14,backgroundColor:C.paper,borderWidth:1,borderColor:C.line,borderRadius:14}});
