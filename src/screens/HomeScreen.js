import React,{useEffect,useMemo,useState} from 'react';
import {Pressable,View,StyleSheet} from 'react-native';
import {AwareTextInput,Btn,Card,Screen,SectionHero,SectionHeading,Txt} from '../components/UI';
import {C,spacing} from '../theme';
import {tr} from '../i18n';
import {api,rows} from '../api/client';
import {friendlyError} from '../logic/appSafety.mjs';
const links=[
 ['journey','◈','رحلتي في أمريكا','My journey','Mi camino','خطواتك من أول يوم','Your next steps','Tus próximos pasos'],
 ['learn','✦','اتعلم أمريكا','Learn America','Aprender','دروس سريعة واختبارات','Quick lessons and quizzes','Lecciones y pruebas'],
 ['community','⌖','أماكن وشغل وخدمات','Explore nearby','Explorar','اكتشف حاجات مفيدة حواليك','Discover places, jobs and services','Lugares, trabajo y servicios'],
 ['survival','▣','إنجليزي أول شهور','Survival English','Inglés útil','اتكلم في المواقف اليومية','Speak in everyday situations','Habla en situaciones reales'],
 ['citizenship','★','الجنسية الأمريكية','Citizenship','Ciudadanía','تدريب وحساب الأهلية','Practice and eligibility','Práctica y elegibilidad'],
 ['glossary','A','القاموس','Glossary','Glosario','افهم الكلمات الجديدة','Everyday words explained','Palabras cotidianas'],
 ['feed','☻','تجارب المجتمع','Community stories','Comunidad','اقرأ وشارك خبرتك','Read and share stories','Lee y comparte'],
 ['cv','▤','اعمل سيرتك الذاتية','Build your CV','Crear CV','جهز سيرتك للشغل','Build your work resume','Tu currículum para trabajar'],
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
 return <Screen lang={lang} contentStyle={{gap:14}}>
  <SectionHero lang={lang} icon="✦" eyebrow={tr(lang,"كل اللي تحتاجه في مكان واحد","Everything you need, in one place","Todo lo que necesitas en un lugar")} title={name?tr(lang,`أهلاً ${name}`,`Welcome, ${name}`,`¡Hola, ${name}!`):tr(lang,'أهلاً بيك في أمريكا','Welcome to the U.S.','Bienvenido a EE. UU.')} subtitle={tr(lang,'خطوة بخطوة، نسهّل عليك الحياة هنا.','Explore your next step, find work and get settled.','Tu siguiente paso, trabajo y una nueva vida.')}/>
  
  <Card style={st.searchCard}><View style={st.searchHead}><View style={st.searchLens}><Txt style={{color:C.teal,fontSize:25}}>⌕</Txt></View><Txt lang={lang} weight="900" style={{flex:1}}>{tr(lang,'ابحث عن اللي محتاجه','Find what you need','Encuentra lo que necesitas')}</Txt></View><AwareTextInput value={q} onChangeText={setQ} autoCorrect={false} placeholder={tr(lang,'مكان، شغل، كلمة، درس…','Place, job, word, lesson…','Lugar, trabajo, palabra, lección…')} placeholderTextColor={C.muted} style={st.search}/></Card>
  {q.trim()?<View style={{gap:9}}>{results.length?results.map((r,i)=><Pressable key={r.route+i+r.title} onPress={()=>navigate(r.route,r.params||null)} style={st.result}><Txt lang={lang} weight="800" style={{flex:1}}>{r.title}</Txt><Txt lang={lang} style={{color:C.muted,flex:1}} numberOfLines={2}>{r.sub||''}</Txt><Txt style={{color:C.blue}}>›</Txt></Pressable>):<Card><Txt lang={lang}>{busy?tr(lang,'بندور على النتائج…','Searching…','Buscando…'):tr(lang,'مش لاقيين نتيجة. جرّب كلمة تانية.','No results. Try another word.','Sin resultados. Prueba otra palabra.')}</Txt><Btn lang={lang} variant="light" title={tr(lang,'تصفح الأماكن','Explore places','Explorar lugares')} onPress={()=>navigate('community')}/></Card>}</View>:<>
   <SectionHeading lang={lang} title={tr(lang,"ابدأ من هنا","Start here","Empieza aquí")} caption={tr(lang,"أهم حاجتين تبدأ بيهم","Two easy places to begin","Dos formas fáciles de empezar")}/><View style={st.features}><Pressable style={st.feature} onPress={()=>navigate('journey')}><View style={st.featureIcon}><Txt style={{fontSize:28}}>◈</Txt></View><View style={{flex:1,gap:4}}><Txt lang={lang} style={{fontSize:20}} weight="900">{tr(lang,'رحلتي في أمريكا','My journey','Mi camino')}</Txt><Txt lang={lang} style={{color:C.muted}}>{tr(lang,'خطوات واضحة تبدأ بيها دلوقتي','Simple steps to start today','Pasos sencillos para empezar')}</Txt></View><Txt style={{color:C.blue,fontSize:23}}>›</Txt></Pressable>
   <Pressable style={st.feature} onPress={()=>navigate('community')}><View style={[st.featureIcon,{backgroundColor:'#E9F5ED'}]}><Txt style={{fontSize:26}}>⌖</Txt></View><View style={{flex:1,gap:4}}><Txt lang={lang} style={{fontSize:20}} weight="900">{tr(lang,'دور على مكان أو شغل','Find places and work','Encuentra lugares y empleo')}</Txt><Txt lang={lang} style={{color:C.muted}}>{tr(lang,'أماكن وخدمات وإعلانات من ناس حقيقيين','Helpful listings, jobs and services','Anuncios, empleos y servicios')}</Txt></View><Txt style={{color:C.blue,fontSize:23}}>›</Txt></Pressable></View>
   <SectionHeading lang={lang} title={tr(lang,'استكشف الأقسام','Explore sections','Explora las secciones')} caption={tr(lang,"اختار اللي يهمك","Choose what matters to you","Elige lo que necesitas")}/><View style={st.grid}>{links.slice(1).filter(x=>x[0]!=='community').map(x=><Pressable key={x[0]} onPress={()=>navigate(x[0])} style={st.tile}><View style={st.miniIcon}><Txt style={{color:C.blue,fontSize:22}}>{x[1]}</Txt></View><View style={{flex:1,gap:3}}><Txt lang={lang} weight="900">{tr(lang,x[2],x[3],x[4])}</Txt><Txt lang={lang} style={{color:C.muted}}>{tr(lang,x[5],x[6],x[7])}</Txt></View></Pressable>)}</View>
  </>}
  {error?<Card style={{gap:7}}><Txt lang={lang} style={{color:C.red}}>{error}</Txt><Btn lang={lang} title={tr(lang,'تصفح المحتوى المتاح','Browse available content','Explorar contenido')} variant="light" onPress={()=>navigate('all')}/></Card>:null}
 </Screen>;
}
const st=StyleSheet.create({searchCard:{gap:11,padding:14,marginTop:-8,borderColor:"#C8E7E3"},searchHead:{flexDirection:"row",alignItems:"center",gap:10},searchLens:{width:42,height:42,borderRadius:14,backgroundColor:C.mist,alignItems:"center",justifyContent:"center"},features:{flexDirection:"row",flexWrap:"wrap",gap:10},search:{borderWidth:1,borderColor:C.line,borderRadius:14,paddingHorizontal:13,minHeight:54,fontSize:16,color:C.ink,backgroundColor:'#fff'},feature:{width:'48%',minHeight:178,borderWidth:1,borderColor:'#D1E7E4',borderRadius:23,backgroundColor:C.card,padding:16,flexDirection:'column',alignItems:'flex-start',gap:12},featureIcon:{height:51,width:51,borderRadius:17,backgroundColor:C.mist,alignItems:'center',justifyContent:'center'},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{width:'48%',minHeight:136,alignItems:'flex-start',gap:9,padding:14,backgroundColor:'#fff',borderWidth:1,borderColor:C.line,borderRadius:21},miniIcon:{width:44,height:44,borderRadius:15,backgroundColor:C.mist,alignItems:'center',justifyContent:'center'},result:{flexDirection:'row',alignItems:'center',gap:10,padding:12,backgroundColor:'#fff',borderWidth:1,borderColor:C.line,borderRadius:14}});
