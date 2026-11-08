/** Disk-backed public-content cache; user secrets/progress are deliberately excluded. */
import { File, Paths } from 'expo-file-system';
import { useEffect, useState } from 'react';

export const WEB_CONTENT_VERSION = '6.3.7';
const safeKey = key => String(key).replace(/[^a-z0-9_-]/gi, '_');
const fileFor = key => new File(Paths.document, `afu_${safeKey(key)}_v${WEB_CONTENT_VERSION}.json`);
export async function readPack(key, fallback = null) {
  try { const file=fileFor(key);if(file.exists){const data=JSON.parse(await file.text());if(data?.version===WEB_CONTENT_VERSION)return data.value;} } catch(e) { /* Corrupt or missing cache: no bundled editorial fallback. */ }
  return fallback;
}
export async function writePack(key, value) {
  const file=fileFor(key);
  await file.write(JSON.stringify({version:WEB_CONTENT_VERSION,storedAt:Date.now(),value}));
  return value;
}
export async function refreshPack(key, fetcher, fallback) {
  try { const value=await fetcher();await writePack(key,value);return value; }
  catch (e) {const cached=await readPack(key,fallback);if(cached==null)throw e;return cached;}
}
/** Show only a previously downloaded disk value while refreshing from the API. */
export function useOfflinePack(key, fetcher, fallback) {
  const [data,setData]=useState(fallback),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{let active=true;(async()=>{
    const saved=await readPack(key,fallback);if(active){setData(saved);setLoading(false);}
    try{const fresh=await fetcher();await writePack(key,fresh);if(active){setData(fresh);setError('');}}
    catch(e){if(active)setError(String(e.message||e));}
  })();return()=>{active=false};},[key]);
  return {data,loading,error};
}
export async function clearPack(key) {
  try {const f=fileFor(key);if(f.exists)f.delete();}catch(e){}
}
