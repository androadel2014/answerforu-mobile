import React,{useEffect,useState} from 'react';
import {View} from 'react-native';
import {Btn,Txt} from './UI';
import {tr} from '../i18n';
import {getSpeed,setSpeed} from '../services/voice';
export default function VoiceSpeed({lang,onChange}){const [value,setValue]=useState(1);useEffect(()=>{getSpeed().then(v=>{setValue(v);onChange?.(v)})},[]);return <View style={{gap:6}}><Txt lang={lang} weight="900">{tr(lang,'سرعة النطق','Speech speed','Velocidad de voz')}</Txt><View style={{flexDirection:'row',gap:5}}>{[1,0.75,0.5].map(n=><View key={n} style={{flex:1}}><Btn lang={lang} title={`${n}×`} variant={value===n?'dark':'light'} onPress={async()=>{setValue(n);await setSpeed(n);onChange?.(n)}}/></View>)}</View></View>}
