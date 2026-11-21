import React,{useEffect,useState} from 'react';
import {View} from 'react-native';
import {Btn,Txt} from './UI';
import {tr} from '../i18n';
import {SPEEDS,currentSpeed,getSpeed,setSpeed,subscribeSpeed} from '../services/voice';
// AnswerForU mobile 3.7.1 (tester item 2): one labelled speed control in all three
// languages, used on every screen that speaks; it stays in sync across screens.
export default function VoiceSpeed({lang,onChange}){
  const [value,setValue]=useState(currentSpeed());
  useEffect(()=>{let live=true;getSpeed().then(v=>{if(live){setValue(v);onChange?.(v)}});const off=subscribeSpeed(v=>{if(live){setValue(v);onChange?.(v)}});return()=>{live=false;off()};},[]);
  const names={1:tr(lang,'عادي','Normal','Normal'),0.75:tr(lang,'أبطأ','Slower','Más lento'),0.5:tr(lang,'بطيء جدًا','Very slow','Muy lento')};
  return <View style={{gap:6}} accessibilityRole="radiogroup" accessibilityLabel={tr(lang,'سرعة النطق','Speech speed','Velocidad de voz')}>
    <Txt lang={lang} weight="900">{tr(lang,'سرعة النطق','Speech speed','Velocidad de voz')}</Txt>
    <View style={{flexDirection:'row',gap:5}}>{SPEEDS.map(n=><View key={n} style={{flex:1}}><Btn lang={lang} title={`${names[n]} · ${n}x`} variant={value===n?'dark':'light'} onPress={()=>setSpeed(n)}/></View>)}</View>
  </View>;
}
