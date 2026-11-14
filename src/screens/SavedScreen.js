import React,{useCallback,useEffect,useState} from 'react';
import {Pressable,View} from 'react-native';
import {api,rows} from '../api/client';
import {Btn,Card,Empty,Field,Loading,Screen,Txt,SectionHero} from '../components/UI';
import {confirmAction} from '../logic/confirmAction';
import {friendlyError} from '../logic/appSafety.mjs';
import {C} from '../theme';
import {tr} from '../i18n';
export default function SavedScreen({lang,navigate}){
 const [cols,setCols]=useState([]),[selected,setSelected]=useState(null),[items,setItems]=useState([]),[loading,setLoading]=useState(true),[name,setName]=useState(''),[renaming,setRenaming]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const T=(a,e,s)=>tr(lang,a,e,s);
 const load=useCallback(async()=>{setLoading(true);setError('');try{const c=rows(await api.favoriteCollections());setCols(c);const id=selected||c[0]?.id||null;if(!selected&&id)setSelected(id);setItems(id?rows(await api.favoriteItems(id)):[])}catch(e){setError(friendlyError(e,lang))}finally{setLoading(false)}},[selected,lang]);useEffect(()=>{load()},[load]);
 async function create(){if(!name.trim())return;try{setBusy(true);await api.createFavoriteCollection(name.trim());setName('');await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
 async function rename(){if(!renaming.trim()||!selected)return;try{setBusy(true);await api.renameFavoriteCollection(selected,renaming.trim());setRenaming('');await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
 function delCollection(){if(!selected)return;confirmAction({title:T('حذف القائمة؟','Delete this list?','¿Eliminar lista?'),message:T('كل العناصر المحفوظة فيها هتتشال.','Its saved items will be removed.','Se quitarán sus elementos.'),cancelLabel:T('إلغاء','Cancel','Cancelar'),confirmLabel:T('حذف','Delete','Eliminar'),onConfirm:async()=>{try{setBusy(true);await api.deleteFavoriteCollection(selected);setSelected(null);await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}})}
 async function remove(x){try{setBusy(true);await api.removeFavorite(selected,x.item_type||'listing',x.item_id||x.id);await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
 return <Screen lang={lang}>
 <SectionHero compact lang={lang} icon="bookmark" title={T('المحفوظات','Saved places & listings','Mis guardados')} subtitle={T('رتّب المهم عندك في قوائم واضحة.','Keep important things in organized lists.','Organiza tus favoritos en listas.')}/>
 <Card style={{gap:8}}><Field lang={lang} label={T('قائمة جديدة','New list','Lista nueva')} value={name} onChangeText={setName} placeholder={T('مثال: بيوت مناسبة','e.g. Homes to visit','ej. Casas para visitar')}/><Btn lang={lang} title={T('＋ إنشاء قائمة','＋ Create list','＋ Crear lista')} variant="blue" disabled={busy} onPress={create}/></Card>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{cols.map(c=><Btn key={c.id} lang={lang} title={`${c.name} (${c.item_count||0})`} variant={String(selected)===String(c.id)?'dark':'light'} onPress={()=>setSelected(c.id)}/>)}</View>
 {selected?<Card style={{gap:8}}><Txt lang={lang} weight="900">{T('إدارة القائمة','Manage this list','Administrar lista')}</Txt><Field lang={lang} label={T('اسم جديد','New name','Nuevo nombre')} value={renaming} onChangeText={setRenaming} placeholder={cols.find(x=>String(x.id)===String(selected))?.name||''}/><Btn lang={lang} title={T('تغيير الاسم','Rename','Renombrar')} variant="light" onPress={rename} disabled={busy}/><Btn lang={lang} title={T('حذف القائمة','Delete list','Eliminar lista')} variant="danger" onPress={delCollection} disabled={busy}/></Card>:null}
 {error?<Card style={{backgroundColor:C.dangerBg}}><Txt lang={lang} style={{color:C.red}}>{error}</Txt><Btn lang={lang} title={T('إعادة المحاولة','Retry','Reintentar')} onPress={load} variant="light"/></Card>:null}
 {loading?<Loading lang={lang}/>:items.length?items.map((x,i)=><Card key={x.id||i} style={{gap:10}}><Txt lang={lang} weight="900" style={{fontSize:20}}>{x.title||x.meta?.title||T('عنصر محفوظ','Saved item','Guardado')}</Txt><Txt lang={lang} style={{color:C.muted}}>{x.item_type||''}</Txt><View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Btn lang={lang} title={T('عرض','Open','Abrir')} variant="blue" onPress={()=>navigate('listingDetail',{id:x.item_id,type:x.meta?.type||x.item_type||'services',item:x.meta||x})}/></View><View style={{flex:1}}><Btn lang={lang} title={T('إزالة','Unsave','Quitar')} variant="light" disabled={busy} onPress={()=>remove(x)}/></View></View></Card>):<Empty lang={lang} title={T('مفيش حاجة محفوظة لسه','Nothing saved yet','Aún no hay guardados')} body={T('افتح أي مكان واضغط حفظ.','Open a listing and tap Save.','Abre un anuncio y pulsa Guardar.')} onRetry={()=>navigate('community')}/>}
 </Screen>;
}
