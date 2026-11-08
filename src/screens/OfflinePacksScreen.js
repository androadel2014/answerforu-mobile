import {friendlyError} from "../logic/appSafety.mjs";
import React,{useEffect,useState} from 'react';
import {View} from 'react-native';
import {api,rows} from '../api/client';
import {Btn,Card,Screen,Txt} from '../components/UI';
import {tr} from '../i18n';
import {C} from '../theme';
import {readPack,refreshPack,clearPack,WEB_CONTENT_VERSION} from '../services/offline';
const L=(lang,ar,en,es=en)=>tr(lang,ar,en,es);
export default function OfflinePacksScreen({lang}){
 const [status,setStatus]=useState({}),[busy,setBusy]=useState(''),[error,setError]=useState('');
 const packs=[{id:'survival_english',name:L(lang,'إنجليزي أول شهور','Survival English','Inglés de supervivencia'),fetcher:api.survivalEnglish,fallback:null},
  {id:'glossary',name:L(lang,'القاموس','Glossary','Glosario'),fetcher:async()=>({terms:rows(await api.glossary(),['terms'])}),fallback:null},
  {id:'civics_banks',name:L(lang,'بنك الجنسية 2008 و2025','Civics banks 2008 & 2025','Bancos de educación cívica'),fetcher:api.civicsBanks,fallback:null}];
 useEffect(()=>{let active=true;Promise.all(packs.map(async p=>[p.id,!!(await readPack(p.id))])).then(entries=>{if(active)setStatus(Object.fromEntries(entries))});return()=>{active=false}},[]);
 async function download(p){setBusy(p.id);setError('');try{await refreshPack(p.id,p.fetcher,p.fallback);setStatus(s=>({...s,[p.id]:true}));}catch(e){setError(friendlyError(e,lang))}finally{setBusy('')}}
 async function reset(p){await clearPack(p.id);setStatus(s=>({...s,[p.id]:false}));}
 return <Screen lang={lang}><Card dark><Txt lang={lang} weight="900" style={{color:'#fff',fontSize:23}}>{L(lang,'حزم التعلم بدون إنترنت','Offline learning packs','Paquetes sin conexión')}</Txt><Txt lang={lang} style={{color:'#cbd5e1'}}>{L(lang,'حمّل المحتوى من الموقع مرة واحدة، وبعدها استخدم نسختك المحفوظة دون إنترنت.','Download content from the website once, then use your saved copy offline.','Descarga el contenido del sitio una vez y usa tu copia guardada sin conexión.')}</Txt></Card>
 <Txt lang={lang} style={{color:C.muted}}>{L(lang,'إصدار المحتوى','Content version','Versión del contenido')}: {WEB_CONTENT_VERSION}</Txt>
 {packs.map(p=><Card key={p.id} style={{gap:8}}><Txt lang={lang} weight="900" style={{fontSize:17}}>{p.name}</Txt><Txt lang={lang} style={{color:C.muted}}>{status[p.id]?L(lang,'مخزن على الجهاز','Saved on device','Guardado en dispositivo'):L(lang,'يلزم التحميل أولًا','Download first','Descargar primero')}</Txt><Btn lang={lang} title={busy===p.id?L(lang,'جاري التحميل','Downloading','Descargando'):L(lang,'تحميل/تحديث','Download/refresh','Descargar/actualizar')} disabled={!!busy} onPress={()=>download(p)} variant="blue"/>{status[p.id]?<Btn lang={lang} title={L(lang,'حذف النسخة المحملة','Clear downloaded copy','Borrar copia descargada')} onPress={()=>reset(p)} variant="light"/>:null}</Card>)}
 {error?<Txt lang={lang} style={{color:C.red}}>{error}</Txt>:null}
 <Card><Txt lang={lang}>{L(lang,'البنوك الرسمية تُحمّل مباشرة من موقع AnswerForU. دون إنترنت تُعرض آخر نسخة حفظتها.','Official banks download from AnswerForU. Offline mode uses only your previously saved snapshot.','Los bancos se descargan de AnswerForU. Sin conexión se usa solo la copia guardada.')}</Txt></Card>
 </Screen>;
}
