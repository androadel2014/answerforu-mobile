import {friendlyError} from "../logic/appSafety.mjs";
import React,{useEffect,useState} from 'react';
import {Pressable,StyleSheet,View} from 'react-native';
import {api,rows} from '../api/client';
import {Btn,Card,ErrorNotice,Icon,IconChip,Screen,Txt} from '../components/UI';
import {tr} from '../i18n';
import {C} from '../theme';
import {readPack,refreshPack,clearPack,WEB_CONTENT_VERSION} from '../services/offline';
const L=(lang,ar,en,es=en)=>tr(lang,ar,en,es);
export default function OfflinePacksScreen({lang}){
 const [status,setStatus]=useState({}),[busy,setBusy]=useState(''),[error,setError]=useState('');
 const packs=[{id:'survival_english',icon:'message-circle',tint:0,name:L(lang,'إنجليزي أول شهور','Survival English','Inglés de supervivencia'),fetcher:api.survivalEnglish,fallback:null},
  {id:'glossary',icon:'book',tint:1,name:L(lang,'القاموس','Glossary','Glosario'),fetcher:async()=>({terms:rows(await api.glossary(),['terms'])}),fallback:null},
  {id:'civics_banks',icon:'award',tint:2,name:L(lang,'بنك الجنسية 2008 و2025','Civics banks 2008 & 2025','Bancos de educación cívica'),fetcher:api.civicsBanks,fallback:null}];
 useEffect(()=>{let active=true;Promise.all(packs.map(async p=>[p.id,!!(await readPack(p.id))])).then(entries=>{if(active)setStatus(Object.fromEntries(entries))});return()=>{active=false}},[]);
 async function download(p){setBusy(p.id);setError('');try{await refreshPack(p.id,p.fetcher,p.fallback);setStatus(s=>({...s,[p.id]:true}));}catch(e){setError(friendlyError(e,lang))}finally{setBusy('')}}
 async function reset(p){await clearPack(p.id);setStatus(s=>({...s,[p.id]:false}));}
 return <Screen lang={lang}><Card dark><Txt lang={lang} weight="900" style={{color:C.white,fontSize:23}}>{L(lang,'حزم التعلم بدون إنترنت','Offline learning packs','Paquetes sin conexión')}</Txt><Txt lang={lang} style={{color:C.onDarkMuted}}>{L(lang,'حمّل المحتوى من الموقع مرة واحدة، وبعدها استخدم نسختك المحفوظة دون إنترنت.','Download content from the website once, then use your saved copy offline.','Descarga el contenido del sitio una vez y usa tu copia guardada sin conexión.')}</Txt></Card>
 {/* Pack rows: own icon + a clear state pill; one compact action per state (Download → Update), and
     a small remove control only once a copy is saved — no more stacked identical full-width buttons. */}
 <View style={st.list}>{packs.map((p,i)=>{const saved=!!status[p.id],working=busy===p.id;
  return <View key={p.id} style={[st.row,i<packs.length-1&&st.rowLine]}>
   <IconChip name={p.icon} tint={p.tint} size={48}/>
   <View style={{flex:1,minWidth:0,gap:6}}>
    <Txt lang={lang} weight="900" style={{fontSize:17}}>{p.name}</Txt>
    <View style={[st.state,saved?st.stateSaved:st.stateNeeded]}><Icon name={working?'download':saved?'check-circle':'cloud-off'} size={14} color={saved?C.green:C.goldDark}/><Txt lang={lang} floor={12} weight="900" style={{fontSize:13,color:saved?C.green:C.goldDark}}>{working?L(lang,'جاري التحميل…','Downloading…','Descargando…'):saved?L(lang,'محفوظ على الجهاز','Saved on device','Guardado en el dispositivo'):L(lang,'غير محمّل بعد','Not downloaded yet','Aún no descargado')}</Txt></View>
   </View>
   <View style={st.actions}>
    <Btn lang={lang} icon={saved?'refresh-cw':'download'} title={saved?L(lang,'تحديث','Update','Actualizar'):L(lang,'تحميل','Download','Descargar')} disabled={!!busy} onPress={()=>download(p)} variant={saved?'light':'blue'} style={st.actionBtn}/>
    {saved?<Pressable accessibilityRole="button" accessibilityLabel={L(lang,'حذف النسخة المحملة','Clear downloaded copy','Borrar copia descargada')} disabled={!!busy} onPress={()=>reset(p)} hitSlop={6} style={st.trash}><Icon name="trash-2" size={18} color={C.red}/></Pressable>:null}
   </View>
  </View>})}</View>
 {error?<ErrorNotice lang={lang} message={error}/>:null}
 <Card><Txt lang={lang}>{L(lang,'البنوك الرسمية تُحمّل مباشرة من موقع AnswerForU. دون إنترنت تُعرض آخر نسخة حفظتها.','Official banks download from AnswerForU. Offline mode uses only your previously saved snapshot.','Los bancos se descargan de AnswerForU. Sin conexión se usa solo la copia guardada.')}</Txt></Card>
 </Screen>;
}
const st=StyleSheet.create({list:{backgroundColor:C.paper,borderWidth:1,borderColor:C.line,borderRadius:20,paddingHorizontal:14},row:{flexDirection:"row",alignItems:"center",gap:12,paddingVertical:14},rowLine:{borderBottomWidth:1,borderStyle:"dashed",borderBottomColor:C.dash},state:{alignSelf:"flex-start",flexDirection:"row",alignItems:"center",gap:5,borderRadius:999,paddingHorizontal:10,paddingVertical:4},stateSaved:{backgroundColor:C.greenSoft},stateNeeded:{backgroundColor:C.goldSoft},actions:{alignItems:"center",gap:8},actionBtn:{minHeight:44,paddingHorizontal:12,borderBottomWidth:3},trash:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:C.redLine,backgroundColor:C.redSoft,alignItems:"center",justifyContent:"center"}});
