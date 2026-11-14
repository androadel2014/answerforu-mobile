import React,{useCallback,useEffect,useMemo,useState}from'react';
import{Alert,Image,Linking,Pressable,ScrollView,Share,StyleSheet,useWindowDimensions,View}from'react-native';
import{api,rows}from'../api/client';
import{Btn,Card,Empty,Field,KeyboardAwareScrollView,Loading,Pill,Txt}from'../components/UI';
import{C}from'../theme';
import{tr}from'../i18n';
import{friendlyError}from'../logic/appSafety.mjs';
import {confirmAction} from '../logic/confirmAction';
import * as ImagePicker from 'expo-image-picker';
import{listingImages,listingTitle,listingPlace,listingPrice,listingContact,listingJobType,listingOwner}from'../logic/listingModel.mjs';
const COMMUNITY_TYPES=new Set(['places','groups']);
function rawId(value,type){const s=String(value||'');if(!s.includes('_'))return s;const prefix=s.split('_')[0].toLowerCase();return (type==='places'&&prefix==='place'||type==='groups'&&prefix==='group'||prefix===type)?s.split('_').slice(1).join('_'):s}
const reviewRating=r=>Number(r?.rating??r?.stars??r?.score??0)||0;
const reviewText=r=>r?.comment||r?.text||r?.body||'';
export default function ListingDetailScreen({lang,params,back,user,navigate}){
  const {width:screenWidth}=useWindowDimensions();
  const type=params?.type||params?.item?._type||params?.item?.type||'services';
  const id=rawId(params?.id??params?.item?.id,type);
  const[item,setItem]=useState(params?.item||null),[reviews,setReviews]=useState([]),[cols,setCols]=useState([]);
  const[rating,setRating]=useState(5),[comment,setComment]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[editing,setEditing]=useState(false);
  const[form,setForm]=useState({title:'',description:'',city:'',state:'',price:'',phone:'',website:'',address:'',category:'',job_type:'',price_type:'',images:[]});
  const label=(ar,en,es)=>tr(lang,ar,en,es);
  const load=useCallback(async()=>{
    if(!id)return;setLoading(true);setError('');
    try{const isCommunity=COMMUNITY_TYPES.has(type);
      const[d,r,c]=await Promise.all([isCommunity?api.communityItem(type,id):api.listing(id),
        (isCommunity?api.communityReviews(type,id):api.listingReviews(id)).catch(()=>null),user?api.favoriteCollections().catch(()=>null):Promise.resolve(null)]);
      const x=d?.item||d?.listing||d?.place||d?.group||d?.data||d;
      setItem(x);setReviews(rows(r,['reviews','items']));setCols(rows(c,['collections']));
      setForm({title:listingTitle(x),description:x?.description||x?.notes||'',city:x?.city||'',state:x?.state||'',price:String(x?.price_value||x?.price||''),phone:x?.phone||'',website:x?.website||x?.link||'',address:x?.address||'',category:x?.category||'',job_type:x?.job_type||'',price_type:x?.price_type||'',images:listingImages(x)});
    }catch(e){setError(friendlyError(e,lang))}finally{setLoading(false)}
  },[id,type,lang,user]);
  useEffect(()=>{load()},[load]);
  const images=listingImages(item),location=listingPlace(item),price=listingPrice(item),phone=listingContact(item),website=item?.website||item?.link||item?.url||'';
  const owner=listingOwner(item);const isMine=Boolean(user && owner!=null && String(user?.id||user?.user_id)===String(owner));
  async function contact(){if(phone){Linking.openURL(`tel:${phone}`).catch(()=>{});return;}
    const email=item?.email||item?.contact_email;if(email){Linking.openURL(`mailto:${email}`).catch(()=>{});return;}
    if(owner && user){try{setBusy(true);const d=await api.createThread(owner);navigate('thread',{id:d?.thread?.id||d?.id})}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}return;}
    if(website){Linking.openURL(website).catch(()=>{});return;}if(!user)navigate('auth');
  }
  function confirmDelete(){confirmAction({title:label('حذف الإعلان؟','Delete listing?','¿Eliminar anuncio?'),message:label('الحذف نهائي. متأكد؟','This cannot be undone. Continue?','No se puede deshacer. ¿Continuar?'),cancelLabel:label('إلغاء','Cancel','Cancelar'),confirmLabel:label('حذف','Delete','Eliminar'),onConfirm:async()=>{try{setBusy(true);if(COMMUNITY_TYPES.has(type))await api.deleteCommunityItem(type,id);else await api.deleteListing(id);back?.();}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}});}
  async function chooseEditPhoto(camera=false){try{
    const permission=camera?await ImagePicker.requestCameraPermissionsAsync():await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted){setError(label('اسمح بالوصول للصور أو الكاميرا.','Allow photo or camera access.','Permite acceso a fotos o cámara.'));return;}
    const r=camera?await ImagePicker.launchCameraAsync({base64:true,quality:.46}):await ImagePicker.launchImageLibraryAsync({base64:true,quality:.46});
    if(r.canceled)return;
    const asset=r.assets?.[0];if(!asset?.base64)return;
    const data=`data:${asset.mimeType||'image/jpeg'};base64,${asset.base64}`;
    setForm(f=>({...f,images:[...(f.images||[]),data].slice(0,5)}));
  }catch(e){setError(friendlyError(e,lang));}}
  async function edit(){try{setBusy(true);setError('');const payload=COMMUNITY_TYPES.has(type)?{name:form.title,notes:form.description,city:form.city,state:form.state,address:form.address,category:form.category,phone:form.phone,website:form.website,...(type==='places'?{images:form.images}:{link:form.website})}:{title:form.title,description:form.description,city:form.city,state:form.state,price_value:form.price||null,price:form.price,price_type:form.price_type,job_type:form.job_type,address:form.address,category:form.category,phone:form.phone,website:form.website,images:form.images};
    if(COMMUNITY_TYPES.has(type))await api.updateCommunityItem(type,id,payload);else await api.updateListing(id,payload);setEditing(false);setMessage(label('تم إرسال التعديل للمراجعة.','Changes submitted for review.','Cambios enviados a revisión.'));await load();}
    catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
  async function review(){if(!user){navigate('auth');return;}if(!comment.trim())return setError(label('اكتب تقييمك الأول.','Write your review first.','Escribe tu reseña primero.'));
    try{setBusy(true);if(COMMUNITY_TYPES.has(type))await api.addCommunityReview(type,id,rating,comment);else await api.addListingReview(id,rating,comment);setComment('');await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
  async function removeMyReview(){try{setBusy(true);if(COMMUNITY_TYPES.has(type))await api.deleteCommunityReview(type,id);else await api.deleteListingReview(id);await load()}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
  async function save(collectionId){if(!user){navigate('auth');return;}try{setBusy(true);await api.saveFavorite(collectionId,{...item,item_type:type,item_id:id,title:listingTitle(item),meta:{type,city:item?.city||'',state:item?.state||''}});setMessage(label('اتحفظ في قائمتك.','Saved to your list.','Guardado en tu lista.'))}catch(e){setError(friendlyError(e,lang))}finally{setBusy(false)}}
  async function share(){try{await Share.share({title:listingTitle(item),message:[listingTitle(item),item?.description||item?.notes,website].filter(Boolean).join('\n\n')})}catch{}}
  return <View style={st.page}>
    <KeyboardAwareScrollView contentContainerStyle={st.content}>
      <Pressable onPress={back} style={st.back}><Txt lang={lang} style={{color:C.blue}} weight="800">‹ {label('رجوع','Back','Volver')}</Txt></Pressable>
      {loading&&!item?<Loading lang={lang}/>:item?<>
        {images.length?<ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={st.gallery} contentContainerStyle={{gap:8}}>{images.map((url,i)=><Image key={`${i}-${url}`} source={{uri:url}} style={[st.photo,{width:Math.max(230,screenWidth-30)}]} resizeMode="cover"/>)}</ScrollView>:<View style={st.placeholder}><Txt lang={lang} style={{textAlign:'center',fontSize:48,color:C.blue}}>⌂</Txt><Txt lang={lang} style={{textAlign:'center',color:C.muted}}>{label('تفاصيل المكان','Place details','Detalles del lugar')}</Txt></View>}
        <View style={{gap:7}}><Pill><Txt lang={lang} style={{color:C.blue}} weight="900">{item.category||item.topic||type}</Txt></Pill><Txt lang={lang} weight="900" style={{fontSize:26}}>{listingTitle(item)}</Txt>{location?<Txt lang={lang} style={{color:C.muted}}>⌖ {location}</Txt>:null}{price?<Txt lang={lang} weight="900" style={{fontSize:24,color:C.blue}}>{price}</Txt>:null}</View>
        <Card style={{gap:12}}><Txt lang={lang} weight="900" style={{fontSize:20}}>{label('معلومات مهمة','Key details','Datos importantes')}</Txt>
          {type==='jobs'&&listingJobType(item)?<Txt lang={lang}>▤ {listingJobType(item)}</Txt>:null}
          {item?.hours||item?.opening_hours?<Txt lang={lang}>◷ {item?.hours||item?.opening_hours}</Txt>:null}
          {item?.address?<Txt lang={lang}>⌖ {item.address}</Txt>:null}
          {phone?<Txt lang={lang}>☎ {phone}</Txt>:null}
          {website?<Btn lang={lang} title={label('الموقع الإلكتروني','Website','Sitio web')} onPress={()=>Linking.openURL(website).catch(()=>{})} variant="light"/>:null}
          <Btn lang={lang} title={label('مشاركة','Share','Compartir')} variant="light" onPress={share}/>
        </Card>
        {item?.description||item?.notes?<Card style={{gap:8}}><Txt lang={lang} weight="900" style={{fontSize:20}}>{label('عن المكان أو الإعلان','About this listing','Acerca del anuncio')}</Txt><Txt lang={lang}>{item?.description||item?.notes}</Txt></Card>:null}
        {isMine?<Card style={{gap:10}}><Txt lang={lang} weight="900">{label('إدارة إعلاني','Manage my listing','Administrar mi anuncio')}</Txt><Btn lang={lang} variant="light" title={label('تعديل','Edit','Editar')} onPress={()=>setEditing(e=>!e)}/>{editing?<View style={{gap:10}}><Field lang={lang} label={label('الاسم','Title','Título')} value={form.title} onChangeText={v=>setForm(f=>({...f,title:v}))}/><Field lang={lang} label={label('الوصف','Description','Descripción')} multiline value={form.description} onChangeText={v=>setForm(f=>({...f,description:v}))}/>{['city','state','address','category','price','price_type','job_type','phone','website'].filter(key=>(type==='jobs'||key!=='job_type')&&(type!=='places'||!['price','price_type','job_type'].includes(key))).map(key=><Field key={key} lang={lang} label={key} value={form[key]} onChangeText={v=>setForm(f=>({...f,[key]:v}))}/>)}<View style={{gap:7}}><Txt lang={lang} weight="900">{label('صور الإعلان','Listing photos','Fotos del anuncio')}</Txt>{form.images?.map((uri,k)=><View key={`${k}-${String(uri).slice(0,20)}`} style={{flexDirection:'row',gap:8,alignItems:'center'}}><Image source={{uri}} style={{height:70,width:90,borderRadius:12}}/><Btn lang={lang} variant="light" title={label('إزالة','Remove','Quitar')} onPress={()=>setForm(f=>({...f,images:f.images.filter((_,i)=>i!==k)}))}/></View>)}<Btn lang={lang} variant="light" title={label('＋ صورة من الجهاز','＋ Choose photo','＋ Elegir foto')} onPress={chooseEditPhoto}/><Btn lang={lang} variant="light" title={label('📷 التقاط صورة','📷 Take photo','📷 Tomar foto')} onPress={()=>chooseEditPhoto(true)}/></View><Btn lang={lang} variant="blue" disabled={busy} title={label('حفظ التعديل','Save changes','Guardar cambios')} onPress={edit}/></View>:null}<Btn lang={lang} variant="danger" title={label('حذف الإعلان','Delete listing','Eliminar anuncio')} disabled={busy} onPress={confirmDelete}/></Card>:null}
        {user?<Card style={{gap:8}}><Txt lang={lang} weight="900">{label('احفظه في قائمة','Save to a collection','Guardar en una lista')}</Txt>{cols.length?cols.map(c=><Btn lang={lang} key={c.id} variant="light" title={`☆ ${c.name}`} onPress={()=>save(c.id)}/>):<Btn lang={lang} variant="light" title={label('أنشئ قائمة محفوظات','Create a saved list','Crear lista')} onPress={()=>navigate('saved')}/>}</Card>:null}
        <Card style={{gap:12}}><Txt lang={lang} weight="900" style={{fontSize:20}}>{label('تقييمات الناس','Community reviews','Reseñas')}</Txt><Txt lang={lang}>{reviews.length?`${reviews.length} ${label('تقييم','reviews','reseñas')}`:label('لسه مفيش تقييمات.','No reviews yet.','Todavía no hay reseñas.')}</Txt>{user?<><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[1,2,3,4,5].map(i=><Pressable key={i} onPress={()=>setRating(i)} style={[st.star,i<=rating&&st.starSelected]}><Txt lang={lang} style={{color:i<=rating?'#fff':C.muted}}>★</Txt></Pressable>)}</View><Field lang={lang} value={comment} onChangeText={setComment} multiline placeholder={label('شارك تجربتك…','Share your experience…','Comparte tu experiencia…')}/><Btn lang={lang} variant="blue" disabled={busy} onPress={review} title={label('إرسال التقييم','Submit review','Enviar reseña')}/><Btn lang={lang} variant="light" onPress={removeMyReview} title={label('حذف تقييمي','Delete my review','Eliminar mi reseña')}/></>:null}
          {reviews.map((x,i)=><View key={x.id||i} style={st.review}><Txt lang={lang} weight="800">{x.reviewer_name||x.username||x.user_name||label('مستخدم','Member','Miembro')} · {reviewRating(x)}★</Txt><Txt lang={lang} style={{color:C.muted}}>{reviewText(x)}</Txt></View>)}
        </Card>
      </>:<Empty lang={lang} title={label('الإعلان مش موجود','Listing not found','Anuncio no encontrado')} onRetry={load}/>}
      {message?<Txt lang={lang} style={{color:C.green}}>{message}</Txt>:null}
      {error?<Card style={{backgroundColor:C.dangerBg}}><Txt lang={lang} style={{color:C.red}}>{error}</Txt><Btn lang={lang} variant="light" onPress={load} title={label('جرّب تاني','Retry','Reintentar')}/></Card>:null}
    </KeyboardAwareScrollView>
    {item?<View style={st.sticky}><Btn lang={lang} variant="blue" disabled={busy} title={phone?label('☎ اتصل دلوقتي','☎ Call now','☎ Llamar ahora'):label('تواصل دلوقتي','Contact now','Contactar ahora')} onPress={contact}/></View>:null}
  </View>;
}
const st=StyleSheet.create({page:{flex:1,backgroundColor:C.bg},content:{padding:14,gap:14,paddingBottom:35},back:{paddingVertical:6,alignSelf:'flex-start'},gallery:{height:230,borderRadius:18,overflow:'hidden'},photo:{height:230,width:330,borderRadius:18,backgroundColor:C.soft},placeholder:{height:160,backgroundColor:'#E4EBFC',alignItems:'center',justifyContent:'center',borderRadius:18},sticky:{paddingHorizontal:16,paddingVertical:10,backgroundColor:C.card,borderTopWidth:1,borderColor:C.line},star:{minWidth:43,minHeight:43,borderRadius:12,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:C.line},starSelected:{backgroundColor:C.blue,borderColor:C.blue},review:{gap:5,paddingVertical:10,borderTopWidth:1,borderColor:C.line}});
