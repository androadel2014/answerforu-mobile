import * as Speech from 'expo-speech';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';
import {SPEEDS as SPEED_LIST,normalizeSpeechText,safeSpeed,speechChunks} from '../logic/speechText.mjs';
import {stripBidiControls} from '../logic/bidi.mjs';
const SPEED_KEY='afu_voice_speed_1';
export const SPEEDS=SPEED_LIST;
let generation=0;
let preferredRate=1;
let loaded=false;
let playing=false;
let stopListener=null;
const speedListeners=new Set();
// AnswerForU mobile 3.7.1 (tester item 2): one speech speed for every screen and
// language. Screens subscribe, so a change in one place applies everywhere at once.
export function currentSpeed(){return preferredRate;}
export function subscribeSpeed(listener){speedListeners.add(listener);return()=>speedListeners.delete(listener);}
export async function getSpeed(){if(loaded)return preferredRate;let raw=null;try{raw=Platform.OS==='web'?globalThis.localStorage?.getItem(SPEED_KEY):await SecureStore.getItemAsync(SPEED_KEY);}catch{}preferredRate=safeSpeed(raw);loaded=true;return preferredRate;}
export async function setSpeed(value){if(!SPEEDS.includes(Number(value)))return;preferredRate=Number(value);loaded=true;speedListeners.forEach(fn=>{try{fn(preferredRate)}catch{}});try{if(Platform.OS==='web')globalThis.localStorage?.setItem(SPEED_KEY,String(value));else await SecureStore.setItemAsync(SPEED_KEY,String(value));}catch{}}
export function isSpeaking(){return playing;}
export function stopSpeech(){generation++;playing=false;Speech.stop();stopListener?.();stopListener=null;}
/**
 * Speak a text — or a list of accepted answers — completely (tester item 3).
 * "A / B" is read as "A or B", every answer is spoken (not only the first), and
 * long text is split into short chunks played one after another, so Android
 * engines never stop after the first part. `rate` defaults to the saved speed.
 */
export function say(text, rate, onState=()=>{}, lang='en'){
  const chunks=speechChunks(Array.isArray(text)?text.map(stripBidiControls):stripBidiControls(text),lang);
  if(!chunks.length){stopSpeech();onState(false);return ()=>{};}
  return playQueue(chunks,rate,onState,()=>{},lang);
}
/** Sequential playback uses completion callbacks, never timers, and is cancel-safe. */
export function playQueue(texts,rate,onState=()=>{},onItem=()=>{},lang='en') {
  stopSpeech();const run=++generation;
  const speed=safeSpeed(rate??preferredRate);
  const language=lang==='ar'?'ar':lang==='es'?'es-US':'en-US';
  // Every queued text is spoken in full: "A/B" → "A or B", emoji and links dropped (tester item 3).
  const list=texts.map(s=>normalizeSpeechText(stripBidiControls(s),lang)).filter(Boolean);
  if(!list.length){onState(false);return ()=>{};}
  playing=true;onState(true);
  let index=0;
  const finish=()=>{if(run!==generation)return;playing=false;stopListener=null;onState(false);};
  stopListener=()=>onState(false);
  const next=()=>{
    if(run!==generation)return;
    if(index>=list.length){finish();return;}
    onItem(index, list[index]);Speech.speak(list[index++],{language,rate:speed,onDone:next,onStopped:finish,onError:next});
  };next();
  return ()=>{if(run===generation)stopSpeech();};
}
getSpeed().catch(()=>{});
