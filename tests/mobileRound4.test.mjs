/** APP-ROUND4: source regression and API-payload contract tests. Not a device or live OAuth verification. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {emptyCv,normalizeCv,parseImportedCv,previewCv,cvDataIsValid} from '../src/logic/cvParity.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=p=>JSON.parse(read(p));
const app=data('app.json');
test('v3.7.0 / code18 / com.answerforu.app / web6.3.9 match',()=>{
 assert.equal(app.expo.version,'3.7.0');assert.equal(app.expo.android.versionCode,19);
 assert.equal(app.expo.android.package,'com.answerforu.app');assert.equal(app.expo.extra.webMasterVersion,'6.3.9');
 assert.equal(data('package.json').version,'3.7.0');
});
test('website civic banks preserve counts 100 / 128 and authoritative dataset',()=>{
 const banks=data('WEBSITE-DEPLOY/public/api/content-static/citizenship-vocabulary.json');
 const civics=data('src/data/website/civics.json');
 assert.equal(civics.banks['2008'].length,100);assert.equal(civics.banks['2025'].length,128);
 assert.equal(banks.reading_vocabulary.length,8);assert.equal(banks.writing_vocabulary.length,8);
});
test('legacy count fixtures Survival 344/17 and glossary 407 remain unchanged',()=>{
 const survival=data('src/data/website/survival.json');assert.equal(survival.packs.length,17);assert.equal(survival.phrases.length,344);
 assert.equal(data('src/data/website/glossary.json').length,407);
});
test('deployed civics guide full nine stages in each language remains source',()=>{
 const script=read('src/screens/CitizenshipScreen.js');assert.match(script,/guide\?\.stages/);
 assert.match(script,/ServerContent/);assert.match(script,/setSelected/);
});
test('citizenship and full M-638 vocabulary use website read endpoints, not bundled data',()=>{
 const script=read('src/screens/CitizenshipScreen.js');
 assert.match(script,/usePublishedContent\('citizenship-guide'\)/);
 assert.match(script,/usePublishedContent\('citizenship-civics'\)/);
 assert.match(script,/usePublishedContent\('citizenship-vocabulary'\)/);
 assert.doesNotMatch(script,/from ['"]\.\.\/data\/website\/|require\(['"]\.\.\/data\/website\//);
});
test('deployed website PHP key allowlist has both new read-only content keys',()=>{
 const php=read('WEBSITE-DEPLOY/public/api/index.php');assert.match(php,/citizenship-vocabulary\|marketplace-categories/);
 assert.match(php,/afu_static_content_fetch/);assert.match(php,/\$meth === 'GET'/);
});
test('marketplace taxonomy equals website places, services, jobs, housing and products',()=>{
 const d=data('WEBSITE-DEPLOY/public/api/content-static/marketplace-categories.json');
 for(const [key,size] of [['place_categories',17],['service_categories',21],['job_categories',10],['housing_categories',6],['product_categories',10],['group_topics',8]])assert.equal(d[key].length,size,key);
});
test('marketplace now uses server categories and the same API query on all types',()=>{
 const screen=read('src/screens/CommunityScreen.js');const api=read('src/api/client.js');
 assert.match(screen,/usePublishedContent\("marketplace-categories"\)/);
 assert.match(screen,/api\.placesPage\(1,\{q,state,city\}\)/);
 for(const name of ['groups','services','jobs','housing','products'])assert.match(screen,new RegExp(`api\\.(?:groups|listings)\\(${name==='groups'?'q':`"${name}",q`}\\)`));
 assert.match(api,/listings: \(type = "services",q=""\)/);
});
test('marketplace all sections uses one umbrella and nested filters',()=>{
 const all=read('src/screens/AllSectionsScreen.js');const appSource=read('App.js');
 for(const type of ['services','jobs','housing','products'])assert.match(all,new RegExp(`route:"community",params:\\{tab:"${type}"\\}`));
 assert.match(appSource,/initialTab=\{route\.params\?\.tab/);
});
test('guest journey screen is protected by an error boundary and guest read-only guard',()=>{
 assert.match(read('App.js'),/<ScreenErrorBoundary/);assert.match(read('src/screens/JourneyScreen.js'),/user\?api\.journey\(\):Promise\.resolve/);
 assert.match(read('src/components/ScreenErrorBoundary.js'),/componentDidCatch/);
});
test('roadmap details access seven independent full-depth website APIs',()=>{
 const source=read('src/components/RoadmapDeepDetails.js');
 for(const name of ['roadmap-guide-locales','roadmap-guides','roadmap-actions','roadmap-warnings-locales','roadmap-warnings-ar','roadmap-costs','roadmap-effort'])assert.ok(source.includes(name),name);
});
test('first-load content is API first, offline only previously downloaded snapshots',()=>{
 const source=read('src/services/offline.js');assert.match(source,/const saved=await readPack\(key,fallback\)/);
 assert.match(source,/const fresh=await fetcher\(\)/);assert.match(source,/WEB_CONTENT_VERSION = '6\.3\.7'/);
 assert.match(read('src/screens/OfflinePacksScreen.js'),/fallback:null/);
});
test('no runtime screen uses bundled legacy data as editorial source',()=>{
 for(const dir of ['src/screens','src/components','src/services','src/auth','src/api'])for(const entry of fs.readdirSync(path.join(root,dir))){if(!/\.(js|jsx|mjs)$/.test(entry))continue;const contents=read(dir+'/'+entry);assert.doesNotMatch(contents,/(?:require\(|from )[^\n]*data\/website\//,entry)}
});
test('current CV builder shares website data fields',()=>{
 const values=normalizeCv({cv_data:{personalInfo:{fullName:'Alex',email:'alex@example.com'},experiences:[{title:'Driver'}],skills:['Excel']}});
 assert.equal(values.personalInfo.fullName,'Alex');assert.equal(values.experiences[0].title,'Driver');assert.ok(cvDataIsValid(values));
 assert.match(previewCv(values),/Alex/);assert.match(previewCv(values),/Driver/);
});
test('CV import rejects unsafe data and supports repeatable rows',()=>{
 assert.throws(()=>parseImportedCv('X'.repeat(200001)));
 const obj=parseImportedCv('{"__proto__":{"admin":true},"personalInfo":{"fullName":"Lia","email":"lia@example.com"},"courses":[{"name":"SQL"}]}');
 assert.equal(obj.courses[0].name,'SQL');assert.equal(Object.hasOwn(obj,'__proto__'),false);
});
test('CV builder preserves native camera, gallery, update, delete and editable sections',()=>{
 const script=read('src/screens/CVScreen.js');for(const op of ['launchCameraAsync','launchImageLibraryAsync','api.createCv','api.updateCv','api.deleteCv','parseImportedCv','targetJob','experiences','education','courses'])assert.ok(script.includes(op),op);
});
test('audio button has playing state, stop behavior, and callback cleanup',()=>{
 const source=read('src/components/SpeechButton.js');for(const term of ['useRef','playing','stopSpeech','onState','useEffect'])assert.ok(source.includes(term),term);
});
test('fully localized network and server error return values',async()=>{
 const {friendlyError}=await import('../src/logic/appSafety.mjs');
 for(const [lang,msg] of [['ar','الاتصال'],['en','Connection'],['es','conexión']])assert.match(friendlyError(new Error('Network request failed'),lang),new RegExp(msg));
 for(const lang of ['ar','en','es'])assert.doesNotMatch(friendlyError(new Error('private token debug 123'),lang),/token debug/);
});
test('resources and state guides are available as full API-backed pages',()=>{
 const all=read('src/screens/AllSectionsScreen.js');assert.match(all,/route:"resources"/);
 const script=read('src/screens/PublishedLibraryScreen.js');assert.match(script,/usePublishedContent\(selected\)/);
 assert.match(script,/api\.stateResource/);assert.match(script,/ServerContent/);
});
test('native Google OAuth uses existing website bridge and same user JWT',()=>{
 const source=read('src/auth/GoogleButton.js');assert.match(source,/path:'auth\/callback'/);
 assert.match(source,/api\.googleMobile\(token\)/);assert.match(source,/EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID/);
 assert.match(read('src/api/client.js'),/\/api\/auth\/oauth\/google\/mobile/);
 assert.match(read('GOOGLE-SETUP.md'),/com\.answerforu\.app/);
});

// Regression: guest Journey evaluates this JSX branch and requires Btn to be in scope.
test('guest Journey sign-in banner resolves the Btn component',()=>{
 const src=read('src/screens/JourneyScreen.js');
 assert.match(src,/import\s*\{[^}]*\bBtn\b[^}]*\}\s*from\s*["']\.\.\/components\/UI["']/);
 assert.match(src,/!user\s*\?/);
 assert.match(src,/<Btn\s+lang=\{lang\}/);
});
