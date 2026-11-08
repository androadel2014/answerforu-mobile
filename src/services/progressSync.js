import {readPack,writePack} from './offline';
/** User-owned pending updates remain on this device during network loss. */
const key=(type,id)=>`progress_${type}_${String(id).replace(/[^a-z0-9_-]/gi,'')}`;
export async function readProgress(type,userId){return readPack(key(type,userId),null);}
export async function savePendingProgress(type,userId,value){return writePack(key(type,userId),{value,pending:true});}
export async function reconcileProgress(type,userId,fetcher,saver,fallback){
 const local=await readProgress(type,userId);
 if(local?.pending){try{await saver(local.value);await writePack(key(type,userId),{value:local.value,pending:false});return local.value;}catch(e){return local.value;}}
 try{const server=await fetcher();await writePack(key(type,userId),{value:server,pending:false});return server;}
 catch(e){return local?.value??fallback;}
}
export async function commitProgress(type,userId,value,saver){
 await savePendingProgress(type,userId,value);
 try{await saver(value);await writePack(key(type,userId),{value,pending:false});return true;}catch(e){return false;}
}
