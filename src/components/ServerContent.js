/** Preserve editorial field depth without a local copy of the text. Supports website JSON, links and nested arrays. */
import React from 'react';
import {Linking,Pressable,View} from 'react-native';
import {NumBadge,Txt} from './UI';
import {C} from '../theme';
const LABELS={ar:{title:'العنوان',summary:'الملخص',tasks:'الخطوات',documents:'المستندات',cost:'التكلفة',time:'المدة',mistake:'أخطاء مهمة',done:'علامة الإتمام',text:'التفاصيل',video:'فيديو',warnings:'تحذيرات',actions:'الإجراءات',effort:'المجهود',estimate:'التقدير',source:'المصدر',notes:'ملاحظات',steps:'الخطوات'},en:{title:'Title',summary:'Summary',tasks:'Tasks',documents:'Documents',cost:'Cost',time:'Time',mistake:'Common mistakes',done:'Completion',text:'Details',video:'Video',warnings:'Warnings',actions:'Actions',effort:'Effort',estimate:'Estimate',source:'Source',notes:'Notes',steps:'Steps'},es:{title:'Título',summary:'Resumen',tasks:'Tareas',documents:'Documentos',cost:'Costo',time:'Plazo',mistake:'Errores comunes',done:'Finalización',text:'Detalles',video:'Video',warnings:'Advertencias',actions:'Acciones',effort:'Esfuerzo',estimate:'Estimación',source:'Fuente',notes:'Notas',steps:'Pasos'}};
export const pickLocale=(v,lang='en')=>{
  if(v==null)return '';
  if(typeof v!=='object'||Array.isArray(v))return v;
  if(['ar','en','es'].some(x=>Object.prototype.hasOwnProperty.call(v,x)))return v[lang]??v.en??v.ar??v.es??'';
  return v;
};
const readable=(key,lang)=>LABELS[lang]?.[key]||LABELS.en[key]||String(key).replace(/[_-]+/g,' ');
function Url({text,lang}){return <Pressable accessibilityRole="link" onPress={()=>Linking.openURL(text).catch(()=>{})}><Txt lang={lang} style={{color:C.blue,textDecorationLine:'underline',lineHeight:24}}>{text}</Txt></Pressable>}
export default function ServerContent({value,lang='ar',heading='',depth=0}){
  const v=pickLocale(value,lang);
  if(v==null||v==='')return null;
  if(typeof v==='string'||typeof v==='number'||typeof v==='boolean'){
    const text=String(v);
    return /^https:\/\/[^\s]+$/i.test(text)?<Url text={text} lang={lang}/>:<Txt lang={lang} selectable style={{color:depth?C.muted:C.ink,fontSize:16,lineHeight:26}}>{text}</Txt>;
  }
  // 3.7.1 (tester item 6): a round number badge instead of "1." (which Arabic text shows as ".1").
  if(Array.isArray(v))return <View style={{gap:9}}>{v.map((x,i)=><View key={String(x?.id||x?.key||i)} style={{flexDirection:'row',alignItems:'flex-start',gap:8}}><NumBadge n={i+1}/><View style={{flex:1}}><ServerContent value={x} lang={lang} depth={depth+1}/></View></View>)}</View>;
  return <View style={{gap:10}}>{Object.entries(v).filter(([k])=>!['id','stage','sort_order','order'].includes(k)).map(([key,item])=><View key={key} style={{gap:4}}><Txt lang={lang} weight="900" style={{fontSize:16,color:C.ink}}>{readable(key,lang)}</Txt><ServerContent value={item} lang={lang} depth={depth+1}/></View>)}</View>;
}
