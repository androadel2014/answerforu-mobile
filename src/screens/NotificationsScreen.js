import React,{useCallback,useEffect,useState}from'react';
import {View} from 'react-native';
import {api,rows}from'../api/client';
import {Btn,Card,Empty,Loading,Screen,Txt,SectionHero}from'../components/UI';
import {C}from'../theme';import{tr}from'../i18n';
import {friendlyError}from'../logic/appSafety.mjs';
import{optInForDeviceNotifications}from'../services/pushGroundwork';
export default function NotificationsScreen({lang,navigate}){
 const[pushMessage,setPushMessage]=useState(''),[items,setItems]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const T=(a,e,s)=>tr(lang,a,e,s);
 const load=useCallback(async()=>{try{setLoading(true);setError('');setItems(rows(await api.notifications(),['notifications']))}catch(e){setError(friendlyError(e,lang))}finally{setLoading(false)}},[lang]);useEffect(()=>{load()},[load]);
 async function change(fn){try{setBusy(true);setError('');await fn();await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
 async function enable(){try{const result=await optInForDeviceNotifications();setPushMessage(result.granted?T('اتسمح بإشعارات الجهاز. استقبال الإشعارات يحتاج ربط التوكن بالسيرفر.','Device permission enabled. Push delivery needs server token registration.','Permiso activado. La entrega requiere registrar el dispositivo.'):T('الإذن مش متاح. تقدر تستخدم إشعارات الموقع هنا.','Permission denied; in-app notifications remain available.','Permiso denegado; siguen disponibles las notificaciones internas.'))}catch(e){setPushMessage(friendlyError(e,lang))}}
 return <Screen lang={lang}><SectionHero compact lang={lang} icon="bell" title={T('الإشعارات','Notifications','Notificaciones')} subtitle={T('تابع الجديد وحدد اللي قريته.','Keep up with updates and mark items read.','Revisa las novedades y márcalas como leídas.')}/>
 <Btn lang={lang} variant="light" title={T('تفعيل إشعارات الجهاز','Enable device notifications','Activar notificaciones')} onPress={enable}/>{pushMessage?<Txt lang={lang}>{pushMessage}</Txt>:null}
 <Btn lang={lang} variant="blue" disabled={busy} title={T('علّم الكل كمقروء','Mark all read','Marcar todo leído')} onPress={()=>change(api.markAllNotifications)}/>
 {error?<Card><Txt lang={lang} style={{color:C.red}}>{error}</Txt><Btn lang={lang} title={T('جرّب تاني','Retry','Reintentar')} onPress={load}/></Card>:null}
 {loading?<Loading lang={lang}/>:items.length?items.map((x,i)=><Card key={x.id||i} style={{gap:8,backgroundColor:x.read||x.is_read?C.card:C.highlight}}><Txt lang={lang} weight="900">{x.title||T('إشعار','Notification','Notificación')}</Txt><Txt lang={lang} style={{color:C.muted}}>{x.description||x.desc||x.message||''}</Txt><View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Btn lang={lang} title={T('قرأت','Mark read','Leído')} variant="light" disabled={busy} onPress={()=>change(()=>api.markNotification(x.id))}/></View><View style={{flex:1}}><Btn lang={lang} title={T('حذف','Delete','Eliminar')} variant="danger" disabled={busy} onPress={()=>change(()=>api.deleteNotification(x.id))}/></View></View></Card>):<Empty lang={lang} title={T('كله تمام!','All caught up!','¡Todo al día!')} body={T('الإشعارات الجديدة هتظهر هنا.','New updates will appear here.','Las novedades aparecerán aquí.')} onRetry={load}/>}
 </Screen>;
}
