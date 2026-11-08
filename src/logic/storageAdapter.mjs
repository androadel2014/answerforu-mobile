/** Tiny platform-neutral storage adapter; native SecureStore, Web localStorage. */
export function makeStorageAdapter(platform,secure,web){
 const local=()=>{try{return web?.()}catch{return null}};
 return {
  async get(key){try{if(platform==='web')return local()?.getItem(key)||null;return await secure.getItemAsync(key)}catch{return null}},
  async set(key,value){try{if(platform==='web'){local()?.setItem(key,value);return;}await secure.setItemAsync(key,value)}catch{/* A locked store must never leave the app on its splash. */}},
  async remove(key){try{if(platform==='web'){local()?.removeItem(key);return;}await secure.deleteItemAsync(key)}catch{}}
 };
}
