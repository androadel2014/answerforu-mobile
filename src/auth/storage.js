import { makeStorageAdapter } from "../logic/storageAdapter.mjs";
export {makeStorageAdapter} from "../logic/storageAdapter.mjs";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
const TOKEN="afu_token",USER="afu_user",LANG="afu_lang",TOUR="afu_intro_v370_done",THEME="afu_theme";
const storage=makeStorageAdapter(Platform.OS,SecureStore,()=>typeof globalThis.localStorage!=='undefined'?globalThis.localStorage:null);
export async function getToken(){return(await storage.get(TOKEN))||''}
export async function setToken(value){value?await storage.set(TOKEN,value):await storage.remove(TOKEN)}
export async function getUser(){const raw=await storage.get(USER);try{return raw?JSON.parse(raw):null}catch{return null}}
export async function setUser(user){user?await storage.set(USER,JSON.stringify(user)):await storage.remove(USER)}
export async function getLang(){return(await storage.get(LANG))||'ar'}
export async function setLangStored(lang){await storage.set(LANG,lang)}
export async function clearSession(){await Promise.allSettled([storage.remove(TOKEN),storage.remove(USER)])}

export async function getIntroDone(){return (await storage.get(TOUR))==="1"}
export async function setIntroDone(){await storage.set(TOUR,"1")}

// 3.7.1 (tester item 7): appearance preference — "auto" follows the phone, or "light" / "dark".
export async function getThemePref(){const v=await storage.get(THEME);return v==="light"||v==="dark"?v:"auto"}
export async function setThemePref(value){await storage.set(THEME,value==="light"||value==="dark"?value:"auto")}
