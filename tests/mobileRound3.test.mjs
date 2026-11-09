import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {withTimeout,STARTUP_TIMEOUT_MS,friendlyError} from '../src/logic/appSafety.mjs';
import {makeStorageAdapter} from '../src/logic/storageAdapter.mjs';

test('boot waits are bounded to a 4-second safety limit',async()=>{
 assert.equal(STARTUP_TIMEOUT_MS,4000);
 assert.equal(await withTimeout(new Promise(()=>{}),5,'recovered'),'recovered');
 assert.equal(await withTimeout(Promise.resolve('ok'),500,'failed'),'ok');
});
test('boot storage exceptions fall back to a safe empty session',async()=>{
 const broken={getItemAsync(){throw Error('locked')}};
 const store=makeStorageAdapter('android',broken,()=>null);
 assert.equal(await store.get('token'),null);
 await store.set('token','hi');await store.remove('token');
});
test('web localStorage fallback stores and reads account, language and token',async()=>{
 const m=new Map();const web={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
 const store=makeStorageAdapter('web',null,()=>web);
 await store.set('afu_token','session');assert.equal(await store.get('afu_token'),'session');
 await store.set('afu_lang','ar');assert.equal(await store.get('afu_lang'),'ar');
 await store.remove('afu_token');assert.equal(await store.get('afu_token'),null);
});
test('localized errors never expose raw English network exception',()=>{
 const err=new Error('Failed to fetch');
 assert.match(friendlyError(err,'ar'),/الاتصال/);assert.doesNotMatch(friendlyError(err,'ar'),/Failed to fetch/);
 assert.match(friendlyError(err,'en'),/Connection/);assert.match(friendlyError(err,'es'),/conexión/);
 assert.doesNotMatch(friendlyError(new Error('SQLSTATE secret'),'ar'),/SQLSTATE/);
});
test('version is from a single mobile constant, aligned with package and Expo app metadata',()=>{
 const conf=fs.readFileSync(new URL('../src/config.js',import.meta.url),'utf8');
 const app=JSON.parse(fs.readFileSync(new URL('../app.json',import.meta.url)));
 const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url)));
 assert.match(conf,/APP_VERSION\s*=\s*["']3\.7\.0["']/);
 for(const version of [app.expo.version,pkg.version,app.expo.extra.cleanMobileVersion])assert.equal(version,'3.7.0');
 assert.equal(app.expo.extra.webMasterVersion,'6.3.9');assert.equal(app.expo.android.versionCode,16);
 assert.equal(app.expo.android.package,'com.answerforu.app');
 assert.equal(app.expo.extra.apiBaseUrl,'https://answerforu.com');
 for(const file of ['src/components/AppHeader.js','src/screens/AllSectionsScreen.js','src/screens/AuthScreen.js'])
  assert.match(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),/APP_VERSION/);
});
test('redesign renders shared marketplace cards and actionable detail controls',()=>{
 const card=fs.readFileSync(new URL('../src/components/ListingCard.js',import.meta.url),'utf8');
 const detail=fs.readFileSync(new URL('../src/screens/ListingDetailScreen.js',import.meta.url),'utf8');
 for(const key of ['listingImages','listingPrice','listingJobType','onSave','onContact'])assert.ok(card.includes(key),key);
 for(const key of ['gallery','sticky','confirmDelete','edit','removeMyReview'])assert.ok(detail.includes(key),key);
});
test('OAuth bridge uses existing account JWT, not another account store',()=>{
 const php=fs.readFileSync(new URL('../web-master/public/api/index.php',import.meta.url),'utf8');
 const js=fs.readFileSync(new URL('../src/auth/GoogleButton.js',import.meta.url),'utf8');
 assert.ok(php.includes("$path==='/auth/oauth/google/mobile'"));
 assert.ok(php.includes("oauth_finish_user('google'"));assert.ok(php.includes('email_verified'));
 assert.ok(js.includes('api.googleMobile'));assert.ok(js.includes('onAuth(session)'));
});
test('guest journey allows read-only preview and does not persist steps',()=>{
 const s=fs.readFileSync(new URL('../src/screens/JourneyScreen.js',import.meta.url),'utf8');
 assert.match(s,/if\(!user\)/);assert.match(s,/navigate\(['"]auth['"]\)/);
});
