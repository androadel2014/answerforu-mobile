import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {ScrollView,Pressable,View} from 'react-native';
import {api,rows} from '../api/client';
import {ErrorNotice,ChipRow,Btn,Card,Empty,Field,Loading,Screen,Txt} from '../components/UI';
import {C} from '../theme';
import {tr} from '../i18n';
import {friendlyError} from '../logic/appSafety.mjs';
import {confirmAction} from '../logic/confirmAction';
const sections=[
 ['glossary','مصطلحات القاموس','Glossary','Glosario'],
 ['resources','المصادر والخدمات','Resources','Recursos'],
 ['reviews','التقييمات','Reviews','Reseñas'],
 ['reports','البلاغات','Reports','Informes'],
 ['verifications','طلبات التوثيق','Verifications','Verificaciones'],
 ['update-suggestions','اقتراحات التحديث','Suggestions','Sugerencias'],
 ['appeals','الاعتراضات','Appeals','Apelaciones']
];
const GLOSSARY=['term','category','definition_ar','definition_en','definition_es','pron_ar','example_ar','example_en','example_es'];
const RESOURCE=['name','category','description','website_url','state_code'];
const editingFields={glossary:GLOSSARY,resources:RESOURCE};
const labels={term:['الكلمة','Term','Término'],category:['التصنيف','Category','Categoría'],definition_ar:['الشرح بالعربي','Arabic meaning','Significado árabe'],definition_en:['الشرح بالإنجليزي','English definition','Definición inglesa'],definition_es:['الشرح بالإسباني','Spanish definition','Definición española'],pron_ar:['النطق بالعربي','Arabic pronunciation','Pronunciación árabe'],example_ar:['مثال عربي','Arabic example','Ejemplo árabe'],example_en:['مثال إنجليزي','English example','Ejemplo inglés'],example_es:['مثال إسباني','Spanish example','Ejemplo español'],name:['الاسم','Name','Nombre'],description:['الوصف','Description','Descripción'],website_url:['الموقع الإلكتروني','Website','Sitio web'],state_code:['الولاية','State','Estado']};
const local=(lang,ar,en,es)=>tr(lang,ar,en,es);
const blank=section=>Object.fromEntries((editingFields[section]||[]).map(k=>[k,'']));
export default function AdminManageScreen({lang,user,back}){
 const [section,setSection]=useState('glossary'),[items,setItems]=useState([]),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[selected,setSelected]=useState(null),[form,setForm]=useState(blank('glossary')),[note,setNote]=useState(''),[shown,setShown]=useState(15);
 const isAdmin=user?.is_admin===true||Number(user?.is_admin)===1||user?.role==='admin';
 const canEdit=Boolean(editingFields[section]);
 const load=useCallback(async()=>{if(!isAdmin)return;setLoading(true);setError('');try{const d=await api.adminList(section);setItems(rows(d,[section,'terms','resources','reviews','reports','requests','suggestions','items','appeals']));}catch(e){setError(friendlyError(e,lang))}finally{setLoading(false)}},[section,isAdmin,lang]);
 useEffect(()=>{setSelected(null);setForm(blank(section));setShown(15);load()},[load]);
 const label=(ar,en,es)=>local(lang,ar,en,es);
 function select(item){setSelected(item);setForm(Object.fromEntries((editingFields[section]||[]).map(k=>[k,String(item?.[k]||'')])));setNote('');}
 async function submit(){const data={...form};if(!(data.term||data.name)?.trim()){setError(label('اكتب الاسم أو الكلمة.','Enter a name or term.','Escribe el nombre o término.'));return;}
   setBusy(true);setError('');setNotice('');try{if(selected)await api.adminEdit(section,selected.id,data);else await api.adminCreate(section,data);setNotice(label('اتحفظ بنجاح.','Saved successfully.','Guardado correctamente.'));setSelected(null);setForm(blank(section));await load();}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
 function remove(item){confirmAction({title:label('متأكد من الحذف؟','Delete this item?','¿Eliminar este elemento?'),message:label('الحذف نهائي.','This is permanent.','Esta acción es permanente.'),cancelLabel:label('إلغاء','Cancel','Cancelar'),confirmLabel:label('حذف','Delete','Eliminar'),onConfirm:async()=>{setBusy(true);try{if(section==='reviews')await api.adminReviewDelete(item.kind||item.source_type||item.type||'marketplace',item.id);else await api.adminRemove(section,item.id);await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}});}
 async function action(item,kind){setBusy(true);setError('');try{if(section==='update-suggestions')await api.adminSuggestionAction(item.id,kind,note);else if(section==='verifications')await api.adminEdit('verifications',item.id,{status:kind==='approve'?'approved':'rejected',reason:note,reject_reason:note});else if(section==='reports')await api.adminEdit('reports',item.id,{status:kind==='approve'?'resolved':'dismissed'});else if(section==='glossary'||section==='resources')await api.adminModerateContent(section,item.id,kind);await load();setNotice(label('تم حفظ القرار.','Decision saved.','Decisión guardada.'));}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
 if(!isAdmin)return <Screen lang={lang}><Empty lang={lang} title={label('الحساب ده مش أدمن.','Admin access required.','Se requiere acceso de administrador.')} onRetry={back}/></Screen>;
 return <Screen lang={lang} contentStyle={{gap:12}}><Btn lang={lang} variant="ghost" title={label('‹ رجوع للإدارة','‹ Back to admin','‹ Volver a administración')} onPress={back}/>
  <Txt lang={lang} style={{fontSize:25}} weight="900">{label('إدارة المحتوى والبلاغات','Manage content and reports','Gestionar contenido e informes')}</Txt>
  <ChipRow lang={lang} contentStyle={{paddingVertical:3}}>{sections.map(([key,ar,en,es])=><Pressable key={key} onPress={()=>setSection(key)} style={{paddingHorizontal:14,paddingVertical:12,backgroundColor:section===key?C.blue:C.white,borderWidth:1,borderColor:section===key?C.blue:C.line,borderRadius:14}}><Txt lang={lang} weight="800" style={{color:section===key?C.white:C.ink}}>{label(ar,en,es)}</Txt></Pressable>)}</ChipRow>
  {error?<ErrorNotice lang={lang} message={error} onRetry={load} retryLabel={label('حاول تاني','Retry','Reintentar')}/>:null}
  {notice?<Card style={{backgroundColor:C.successBg}}><Txt lang={lang} style={{color:C.green}}>{notice}</Txt></Card>:null}
  {canEdit?<Card style={{gap:10}}><Txt lang={lang} weight="900" style={{fontSize:20}}>{selected?label('تعديل','Edit','Editar'):label('إضافة جديدة','Add new','Añadir nuevo')}</Txt>{editingFields[section].map(k=><Field key={k} lang={lang} label={local(lang,...(labels[k]||[k,k,k]))} value={form[k]||''} onChangeText={v=>setForm(f=>({...f,[k]:v}))} multiline={['description','definition_ar','definition_en','definition_es','example_ar','example_en','example_es'].includes(k)}/>)}<Btn lang={lang} title={busy?label('جاري الحفظ…','Saving…','Guardando…'):label('حفظ','Save','Guardar')} disabled={busy} variant="blue" onPress={submit}/>{selected?<Btn lang={lang} variant="light" title={label('إلغاء التعديل','Cancel editing','Cancelar edición')} onPress={()=>{setSelected(null);setForm(blank(section))}}/>:null}</Card>:null}
  <Txt lang={lang} weight="900" style={{fontSize:20}}>{label('الموجود حاليًا','Current items','Elementos actuales')} · {items.length}</Txt>
  {loading?<Loading lang={lang}/>:items.length?items.slice(0,shown).map((x,i)=><Card key={`${x.id||i}`} style={{gap:8}}><Txt lang={lang} weight="900" style={{fontSize:18}}>{x.term||x.name||x.title||x.subject||x.message||x.type||`#${x.id}`}</Txt><Txt lang={lang} style={{color:C.muted}} numberOfLines={4}>{x.definition_ar||x.description||x.comment||x.text||x.reason||x.status||''}</Txt>{x.status?<Txt lang={lang} style={{color:C.blue}}>{x.status}</Txt>:null}
    {canEdit?<Btn lang={lang} variant="light" title={label('تعديل','Edit','Editar')} onPress={()=>select(x)}/>:null}
    {section==='glossary'||section==='resources'||section==='update-suggestions'||section==='verifications'||section==='reports'?<View style={{gap:7}}>{!['glossary','resources'].includes(section)?<Field lang={lang} label={label('سبب القرار (اختياري)','Decision note (optional)','Motivo (opcional)')} value={note} onChangeText={setNote}/>:null}<Btn lang={lang} title={label('موافقة / حل','Approve / Resolve','Aprobar / Resolver')} variant="blue" disabled={busy} onPress={()=>action(x,'approve')}/><Btn lang={lang} title={label('رفض / إغلاق','Reject / Close','Rechazar / Cerrar')} variant="light" disabled={busy} onPress={()=>action(x,'reject')}/></View>:null}
    {!['update-suggestions','verifications'].includes(section)?<Btn lang={lang} title={label('حذف','Delete','Eliminar')} variant="danger" disabled={busy} onPress={()=>remove(x)}/>:null}
   </Card>):<Empty lang={lang} title={label('مفيش عناصر هنا','Nothing here yet','No hay elementos')} body={label('اختار قسم تاني أو أضف عنصر.','Choose another section or add an item.','Elige otra sección o añade un elemento.')} onRetry={load}/>}
  {items.length>shown?<Btn lang={lang} title={label('عرض المزيد','Load more','Ver más')} variant="light" onPress={()=>setShown(v=>v+15)}/>:null}
  <Btn lang={lang} title={label('تحديث','Refresh','Actualizar')} variant="ghost" onPress={load}/>
 </Screen>;
}
