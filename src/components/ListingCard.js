import React from 'react';
import {Image,Linking,Pressable,Share,StyleSheet,View} from 'react-native';
import {C,shadow} from '../theme';
import {Txt} from './UI';
import {tr} from '../i18n';
import {listingImages,listingTitle,listingPrice,listingPlace,listingJobType,listingContact} from '../logic/listingModel.mjs';
const ICONS={places:'⌂',groups:'♧',services:'✦',jobs:'▤',housing:'⌂',products:'▧'};
export default function ListingCard({item,type='places',lang='ar',onOpen,onSave,onContact}){
  const images=listingImages(item), title=listingTitle(item)||tr(lang,'بدون عنوان','Untitled','Sin título');
  const location=listingPlace(item),price=listingPrice(item),job=type==='jobs'?listingJobType(item):'';
  const category=item?.category||item?.topic||item?.platform||type;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onOpen} style={({pressed})=>[st.card,pressed&&{opacity:.94}]}>
    {images[0]?<Image source={{uri:images[0]}} style={st.photo} resizeMode="cover" accessibilityLabel={title}/>:
      <View style={st.placeholder}><Txt lang={lang} style={{fontSize:48,color:C.blue,textAlign:'center'}}>{ICONS[type]||'✦'}</Txt><Txt lang={lang} style={{color:C.muted,textAlign:'center'}}>{tr(lang,'اكتشف التفاصيل','Discover more','Ver detalles')}</Txt></View>}
    <View style={st.body}>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,alignItems:'center'}}><View style={st.chip}><Txt lang={lang} style={{color:C.blue}} weight="800">{category}</Txt></View>{job?<View style={st.job}><Txt lang={lang} style={{color:C.ink}} weight="800">{job}</Txt></View>:null}</View>
      <Txt lang={lang} weight="900" style={st.title}>{title}</Txt>
      {location?<Txt lang={lang} style={st.location}>⌖ {location}</Txt>:null}
      {price?<Txt lang={lang} weight="900" style={st.price}>{price}{type==='jobs'&&/hour|hr|ساعة/i.test(item?.priceType||'')?' / hr':''}</Txt>:null}
      <View style={st.actions}>
        <Pressable accessibilityRole="button" onPress={e=>{e.stopPropagation?.();onSave?.()}} style={st.save}><Txt lang={lang} style={{color:C.ink,textAlign:'center'}}>☆ {tr(lang,'حفظ','Save','Guardar')}</Txt></Pressable>
        <Pressable accessibilityRole="button" onPress={e=>{e.stopPropagation?.();onContact?.()}} style={st.contact}><Txt lang={lang} style={{color:'#fff',textAlign:'center'}} weight="800">{tr(lang,'تواصل','Contact','Contactar')}</Txt></Pressable>
      </View>
    </View>
  </Pressable>;
}
const st=StyleSheet.create({card:{borderRadius:20,overflow:'hidden',backgroundColor:C.card,borderColor:C.line,borderWidth:1,...shadow,marginBottom:4},photo:{width:'100%',height:204,backgroundColor:C.soft},placeholder:{height:150,backgroundColor:'#E4F1FF',alignItems:'center',justifyContent:'center',gap:2},body:{padding:15,gap:9},title:{fontSize:21,lineHeight:27,color:C.ink},location:{color:C.muted,fontSize:16},price:{fontSize:21,color:C.blue},chip:{borderRadius:10,backgroundColor:C.soft,paddingHorizontal:10,paddingVertical:5,alignSelf:'flex-start',maxWidth:'100%'},job:{borderRadius:10,backgroundColor:'#EDF1F8',paddingHorizontal:10,paddingVertical:5},actions:{flexDirection:'row',gap:9,marginTop:4},save:{flex:1,minHeight:49,borderRadius:13,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center',backgroundColor:C.card},contact:{flex:1.2,minHeight:49,borderRadius:13,backgroundColor:C.blue,alignItems:'center',justifyContent:'center'}});
