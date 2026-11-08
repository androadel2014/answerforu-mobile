import React,{useEffect,useRef,useState} from 'react';
import {Btn} from './UI';
import {say,stopSpeech} from '../services/voice';
import {tr} from '../i18n';
export default function SpeechButton({lang='ar',text,rate=1,label,onState,style}){
  const [playing,setPlaying]=useState(false),live=useRef(true),owned=useRef(false);
  useEffect(()=>{live.current=true;return()=>{live.current=false;if(owned.current)stopSpeech()};},[]);
  const update=value=>{owned.current=Boolean(value);if(live.current){setPlaying(Boolean(value));onState?.(Boolean(value));}};
  const toggle=()=>{if(playing){stopSpeech();update(false);return;}try{say(text,rate,update)}catch{update(false)}};
  return <Btn lang={lang} title={playing?tr(lang,'■ إيقاف','■ Stop','■ Parar'):(label||tr(lang,'🔊 اسمع','🔊 Listen','🔊 Escuchar'))} variant={playing?'danger':'light'} disabled={!String(text||'').trim()} onPress={toggle} style={style}/>;
}
