import React,{useState} from 'react';
import {View} from 'react-native';
import {Btn,Txt} from './UI';
import {C} from '../theme';
import {tr} from '../i18n';
// AnswerForU mobile 3.7.1 (tester item 8): "Excel / Word" share buttons. onExport(format) → promise.
export default function ReportButtons({lang='ar',label,onExport,dark=false}){
  const [busy,setBusy]=useState(''),[error,setError]=useState('');
  const run=async format=>{if(busy)return;setBusy(format);setError('');try{await onExport(format);}catch(e){setError(tr(lang,'تعذر إنشاء الملف. حاول مرة ثانية.','Could not create the file. Please try again.','No se pudo crear el archivo. Inténtelo de nuevo.'));}finally{setBusy('');}};
  const working=tr(lang,'جارٍ التجهيز…','Preparing…','Preparando…');
  return <View style={{gap:7}}>
    {label?<Txt lang={lang} weight="900" floor={13} style={{fontSize:14,color:dark?C.onDarkSoft:C.muted}}>{label}</Txt>:null}
    <View style={{flexDirection:'row',gap:8}}>
      <View style={{flex:1}}><Btn lang={lang} icon="grid" variant={dark?'gold':'light'} title={busy==='xlsx'?working:'Excel'} disabled={Boolean(busy)} onPress={()=>run('xlsx')}/></View>
      <View style={{flex:1}}><Btn lang={lang} icon="file-text" variant={dark?'gold':'light'} title={busy==='docx'?working:'Word'} disabled={Boolean(busy)} onPress={()=>run('docx')}/></View>
    </View>
    {error?<Txt lang={lang} style={{color:dark?C.onDark:C.redInk,fontSize:14}} floor={13}>{error}</Txt>:null}
  </View>;
}
