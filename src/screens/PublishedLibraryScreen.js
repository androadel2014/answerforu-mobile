import React,{useEffect,useState} from 'react';
import {Pressable,ScrollView,View} from 'react-native';
import {api} from '../api/client';
import {ChipRow,Btn,Card,Field,Screen,Txt} from '../components/UI';
import ServerContent from '../components/ServerContent';
import {usePublishedContent} from '../services/publishedContent';
import {tr} from '../i18n';
import {C} from '../theme';
import {friendlyError} from '../logic/appSafety.mjs';
const areas=[
 ['state-agencies','جهات الولايات','State agencies','Agencias estatales'],
 ['state-health-marketplaces','تأمين صحي بالولاية','Health marketplaces','Seguro de salud estatal'],
 ['curated-cities','المدن الموثقة','Curated cities','Ciudades verificadas'],
 ['roadmap-guides','الأدلة الكاملة','Journey guides','Guías completas'],
 ['roadmap-guide-locales','شروحات المراحل','Step details','Detalles de las etapas'],
 ['roadmap-actions','إجراءات الرحلة','Action plans','Planes de acción'],
 ['roadmap-warnings-locales','تحذيرات الرحلة','Journey warnings','Advertencias'],
 ['roadmap-warnings-ar','تحذيرات إضافية','Extra warnings','Advertencias adicionales'],
 ['roadmap-costs','تكاليف الرحلة','Journey costs','Costos de las etapas'],
 ['roadmap-effort','المدة والمجهود','Time and effort','Tiempo y esfuerzo'],
 ['roadmap-dv-template','دليل القرعة','DV lottery guide','Guía del sorteo DV'],
 ['citizenship-guide','دليل الجنسية','Citizenship guide','Guía de ciudadanía'],
 ['citizenship-civics','أسئلة المدنيات','Civics banks','Bancos de ciudadanía'],
 ['citizenship-vocabulary','مفردات الإنجليزية','English vocabulary','Vocabulario en inglés'],
];
export default function PublishedLibraryScreen({lang,navigate}){
 const [selected,setSelected]=useState('state-agencies'),[state,setState]=useState('VA'),[stateData,setStateData]=useState(null),[stateError,setStateError]=useState(''),[stateLoading,setStateLoading]=useState(false);
 const {data,loading,error}=usePublishedContent(selected);
 async function loadState(){setStateLoading(true);setStateError('');try{const result=await api.stateResource(state.toUpperCase().trim());setStateData(result?.data||result?.resource||result)}catch(e){setStateError(friendlyError(e,lang))}finally{setStateLoading(false)}}
 return <Screen lang={lang}><Card dark style={{gap:8}}><Txt lang={lang} style={{color:C.white,fontSize:23}} weight='900'>{tr(lang,'المصادر والأدلة الكاملة','Complete resources and guides','Recursos y guías completas')}</Txt><Txt lang={lang} style={{color:C.royalSoft}}>{tr(lang,'اقرأ المعلومات الكاملة من قاعدة بيانات الموقع؛ دون إنترنت تظهر فقط النسخة التي حملتها من قبل.','All details come from the website API. Offline only previously downloaded content is shown.','Todos los detalles proceden de la API. Sin conexión se muestra solo el contenido descargado.')}</Txt></Card>
 <ChipRow lang={lang} gap={8}>{areas.map(([id,ar,en,es])=><Pressable key={id} onPress={()=>setSelected(id)} style={{paddingHorizontal:15,paddingVertical:11,borderRadius:14,borderWidth:1,borderColor:selected===id?C.blue:C.line,backgroundColor:selected===id?C.blue:C.white}}><Txt lang={lang} weight='900' style={{color:selected===id?C.white:C.ink,fontSize:15}}>{tr(lang,ar,en,es)}</Txt></Pressable>)}</ChipRow>
 {loading?<Card><Txt lang={lang}>{tr(lang,'جاري التحميل من الموقع','Loading from website','Cargando del sitio web')}</Txt></Card>:null}
 {error&&!data?<Card><Txt lang={lang} style={{color:C.red}}>{tr(lang,'لا تتوفر نسخة محمّلة لهذا الدليل. اتصل بالإنترنت.','This guide has not been downloaded. Connect to the internet.','Esta guía no se ha descargado. Conéctate a internet.')}</Txt></Card>:null}
 {data?<Card style={{gap:12}}><ServerContent value={data} lang={lang}/></Card>:null}
 <Card style={{gap:9}}><Txt lang={lang} weight='900' style={{fontSize:19}}>{tr(lang,'مصادر ولاية محددة','Resources for a specific state','Recursos de un estado')}</Txt><Field lang={lang} label={tr(lang,'رمز الولاية','State code','Código del estado')} value={state} autoCapitalize='characters' onChangeText={setState}/><Btn lang={lang} title={tr(lang,'إظهار بيانات الولاية','Show state details','Mostrar detalles del estado')} variant='blue' disabled={stateLoading||state.trim().length!==2} onPress={loadState}/>{stateError?<Txt lang={lang} style={{color:C.red}}>{stateError}</Txt>:null}{stateData?<ServerContent value={stateData} lang={lang}/>:null}</Card>
 </Screen>;
}
