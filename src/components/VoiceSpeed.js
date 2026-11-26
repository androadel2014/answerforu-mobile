import React,{useEffect,useState} from 'react';
import {View} from 'react-native';
import {Btn,Txt} from './UI';
import {tr} from '../i18n';
import {SPEEDS,currentSpeed,getSpeed,setSpeed,subscribeSpeed} from '../services/voice';
import {hasVoiceFor} from '../services/voiceCheck';
import {C} from '../theme';
// AnswerForU mobile 3.7.1 (tester item 2): one labelled speed control in all three
// languages, used on every screen that speaks; it stays in sync across screens.
export default function VoiceSpeed({lang,onChange}){
  const [value,setValue]=useState(currentSpeed());
  // 3.7.2: say so when the phone has no English voice (listening would stay silent).
  const [noVoice,setNoVoice]=useState(false);
  useEffect(()=>{let live=true;hasVoiceFor('en').then(ok=>{if(live)setNoVoice(ok===false)}).catch(()=>{});return()=>{live=false};},[]);
  useEffect(()=>{let live=true;getSpeed().then(v=>{if(live){setValue(v);onChange?.(v)}});const off=subscribeSpeed(v=>{if(live){setValue(v);onChange?.(v)}});return()=>{live=false;off()};},[]);
  const names={1:tr(lang,'عادي','Normal','Normal'),0.75:tr(lang,'أبطأ','Slower','Más lento'),0.5:tr(lang,'بطيء جدًا','Very slow','Muy lento')};
  return <View style={{gap:6}} accessibilityRole="radiogroup" accessibilityLabel={tr(lang,'سرعة النطق','Speech speed','Velocidad de voz')}>
    <Txt lang={lang} weight="900">{tr(lang,'سرعة النطق','Speech speed','Velocidad de voz')}</Txt>
    <View style={{flexDirection:'row',gap:5}}>{SPEEDS.map(n=><View key={n} style={{flex:1}}><Btn lang={lang} title={`${names[n]} · ${n}x`} variant={value===n?'dark':'light'} onPress={()=>setSpeed(n)}/></View>)}</View>
    {noVoice?<Txt lang={lang} accessibilityRole="alert" style={{color:C.redInk,fontSize:14}}>{tr(lang,'مفيش صوت إنجليزي متثبت على الموبايل، فالنطق ممكن ما يشتغلش. ثبّته من: الإعدادات ← تحويل النص إلى كلام.','No English voice is installed on this phone, so listening may stay silent. Install one in Settings → Text-to-speech.','No hay voz en inglés instalada en este teléfono; el audio puede no sonar. Instálala en Ajustes → Texto a voz.')}</Txt>:null}
  </View>;
}
