import * as Speech from 'expo-speech';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';
const SPEED_KEY='afu_voice_speed_1';
export const SPEEDS=[1,0.75,0.5];
let generation=0;
let preferredRate=1;
let playing=false;
let stopListener=null;
export async function getSpeed(){let raw=null;try{raw=Platform.OS==='web'?globalThis.localStorage?.getItem(SPEED_KEY):await SecureStore.getItemAsync(SPEED_KEY);}catch{}const v=Number(raw);preferredRate=SPEEDS.includes(v)?v:1;return preferredRate;}
export async function setSpeed(value){if(!SPEEDS.includes(Number(value)))return;preferredRate=Number(value);try{if(Platform.OS==='web')globalThis.localStorage?.setItem(SPEED_KEY,String(value));else await SecureStore.setItemAsync(SPEED_KEY,String(value));}catch{}}
export function isSpeaking(){return playing;}
export function stopSpeech(){generation++;playing=false;Speech.stop();stopListener?.();stopListener=null;}
export function say(text, rate=preferredRate, onState=()=>{}){
  stopSpeech();if(!String(text||'').trim()){onState(false);return;}
  const run=++generation;playing=true;stopListener=()=>onState(false);onState(true);
  const finish=()=>{if(run!==generation)return;playing=false;stopListener=null;onState(false);};
  try{Speech.speak(String(text),{language:'en-US',rate,onDone:finish,onStopped:finish,onError:finish});}
  catch(e){finish();throw e;}
}
/** Sequential playback uses completion callbacks, never timers, and is cancel-safe. */
export function playQueue(texts,rate=1,onState=()=>{},onItem=()=>{}) {
  stopSpeech();const run=++generation;
  const list=texts.map(s=>String(s||'').trim()).filter(Boolean);
  if(!list.length){onState(false);return ()=>{};}
  playing=true;onState(true);
  let index=0;
  const finish=()=>{if(run!==generation)return;playing=false;stopListener=null;onState(false);};
  stopListener=()=>onState(false);
  const next=()=>{
    if(run!==generation)return;
    if(index>=list.length){finish();return;}
    onItem(index, list[index]);Speech.speak(list[index++],{language:'en-US',rate,onDone:next,onStopped:finish,onError:next});
  };next();
  return ()=>{if(run===generation)stopSpeech();};
}
