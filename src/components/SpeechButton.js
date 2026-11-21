import React,{useEffect,useRef,useState} from 'react';
import {Btn} from './UI';
import {say,stopSpeech} from '../services/voice';
import {tr} from '../i18n';
/** `text` may be one string or a list of accepted answers; all of it is spoken. `rate` defaults to the saved speed. */
export default function SpeechButton({lang='ar',text,rate,label,onState,style,speechLang='en'}){
  const [playing,setPlaying]=useState(false),live=useRef(true),owned=useRef(false);
  useEffect(()=>{live.current=true;return()=>{live.current=false;if(owned.current)stopSpeech()};},[]);
  const update=value=>{owned.current=Boolean(value);if(live.current){setPlaying(Boolean(value));onState?.(Boolean(value));}};
  const empty=Array.isArray(text)?!text.some(x=>String(x||'').trim()):!String(text||'').trim();
  const toggle=()=>{if(playing){stopSpeech();update(false);return;}try{say(text,rate,update,speechLang)}catch{update(false)}};
  return <Btn lang={lang} title={playing?tr(lang,'■ إيقاف','■ Stop','■ Parar'):(label||tr(lang,'🔊 اسمع','🔊 Listen','🔊 Escuchar'))} variant={playing?'danger':'light'} disabled={empty} onPress={toggle} style={style}/>;
}
