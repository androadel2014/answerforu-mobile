import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
// Round 6 — "Jawab" Airmail identity reskin of v3.7.0 (versionCode 19). Presentation only.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=JSON.parse(read('app.json')).expo, pkg=JSON.parse(read('package.json'));
const BASE={"hashes": {"src/api/client.js": "5d4ecf441f14f4d98b1b62bd8df9c955afc18a655cb5db276ff95d4f685905df", "src/auth/storage.js": "10abd42841441247b91472a49638514e73f60b3a57fbe12317c13c09e506e771", "src/data/communityConfig.js": "0ce634e010c7b2f26d7553b90ab4ce82ba7b064213f7d755861e9955db384fe9", "src/data/glossaryCategories.js": "155e742c4be5f318cd38d61126c9f3570e940ac00d4fb9dc994d4abc92134ddb", "src/data/learn/americaBasics.js": "84de5b445b04799c5f53bf2e8dce9f9c41ef2b48af5780279fcf4359a69db9b6", "src/data/learn/americaEducation.js": "e0e6420b19d6447084288695e0de386b4a95f5e7b60cddbd2b602a88386e5464", "src/data/learn/americaPlaces.js": "196d5d94dfc2e2971d7f9601a4c4e4ef953bbcd880bdef664941741b7602e84d", "src/data/resourceConfig.js": "fc56d0c253f728277936655c856ab0b0daf2b74c88b838b7d8b6ba114174e037", "src/data/roadmapData.js": "bde30eed792036178eb34d0799fdb88f3686c800f61903553bf1548b25a662c8", "src/data/website/civics.json": "ba36c1991c82458e1035728e816c5a11ca29ba40fb5e4cced6f54864724d343c", "src/data/website/glossary.json": "96e7254f116efc41810ffc0446cf3916f468ab65876e233aedba829fb2c20bad", "src/data/website/m638.json": "e00e7b4104e6d0e104bf4f2b9bd5101b79574e9b28c46d77a7eff415f7a0841f", "src/data/website/stages.json": "38298c01e604a485d46c090dbcd108e5a1f395f3ed98a0803b1ae84b0b00d362", "src/data/website/survival.json": "2b4c2ea735e0ea1d23f05183f41acaec0ef8b1da011abae9af79c3385eaa3b84", "src/logic/appSafety.mjs": "7cd029ea78b87521c74b8e3afa885af5abd71b02e209165a6d4e1ba4587f3e61", "src/logic/civicLogic.mjs": "d4aab7933b7d2d7c26ed485ba683b13ab666230db7cb1ad506cee21f13062944", "src/logic/confirmAction.js": "fb5c411f5c016e5a1ee3c07af3cb74ea4b003305364401dfb9b095d0ae036d12", "src/logic/cvParity.mjs": "f6d389e7ab0092237c8027d585fcd793740b11c1938b72ce1305a7a16ecc95a4", "src/logic/listingModel.mjs": "cad3277a166892eae5f8b516738b56e2a6896c8295b861edff37076de9459802", "src/logic/storageAdapter.mjs": "1eaa4cac7872ac14444b724b23f0225271ffb4b912558361824e97cb82d7a270", "src/logic/survivalLogic.mjs": "725ed30932bfc4f75a2b597a9a87b73ba412d7196ff7d7b08742f8acb631ac74", "src/logic/userSearch.mjs": "e7ba0f533c3722012031799b9097f575d8f41f99db96aeb3ed53be44c9f4ad14", "src/services/nativeShare.js": "c35094cf06fbee8fa44eb96f17348bcc32e6f7c507c4bc660920a227b4852f6a", "src/services/offline.js": "226d98026628f121315679955f4bf91cce0b051f54440cdf52eddeadb1e93c5b", "src/services/progressSync.js": "fbe234142cc7465a66fa3d790acf6c2f188b7db52901b1ca492516e4a6c4b783", "src/services/publishedContent.js": "793897faa9d2ea8b7eb327a7b892a0950ff41161f28411e683bb83e3ffaf67db", "src/services/pushGroundwork.js": "411e327783a00074e85aeccd047401d663a2584076dabd0153c468da539ce81e", "src/services/voice.js": "e490cc8bb78dfca80846daa37a023d5d09d8088f90bbf467cc31977454cda4ae"}, "screens": ["AdminManageScreen.js", "AdminScreen.js", "AllSectionsScreen.js", "AuthScreen.js", "CVScreen.js", "CitizenshipScreen.js", "CommunityScreen.js", "DirectoryScreen.js", "FeedScreen.js", "GlossaryScreen.js", "HomeScreen.js", "JourneyScreen.js", "LearnScreen.js", "ListingDetailScreen.js", "MessagesScreen.js", "MyRequestsScreen.js", "NotificationsScreen.js", "OfflinePacksScreen.js", "PostDetailScreen.js", "ProfileScreen.js", "PublishedLibraryScreen.js", "RecommendScreen.js", "SavedScreen.js", "SurvivalEnglishScreen.js", "ThreadScreen.js", "VerificationScreen.js"], "components": ["AppHeader.js", "BottomNav.js", "ListingCard.js", "ResourceCards.js", "RoadmapDeepDetails.js", "ScreenErrorBoundary.js", "ServerContent.js", "SpeechButton.js", "UI.js", "VoiceSpeed.js", "WelcomeTour.js"]};

test('version: 3.7.0, versionCode 19, package com.answerforu.app, no new plugins or permissions',()=>{
 assert.equal(app.version,'3.7.0');assert.equal(pkg.version,'3.7.0');assert.equal(app.extra.cleanMobileVersion,'3.7.0');
 assert.equal(app.android.versionCode,19);assert.equal(app.android.package,'com.answerforu.app');assert.equal(app.ios.bundleIdentifier,'com.answerforu.app');
 assert.equal(app.plugins.length,5);assert.equal(app.android.permissions,undefined);
 assert.match(read('src/config.js'),/APP_VERSION = "3\.7\.0"/);
 assert.equal(app.icon,'./assets/icon.png');assert.equal(app.android.adaptiveIcon.foregroundImage,'./assets/adaptive-icon.png');
});
test('identity tokens: royal blue, cream paper, airmail red/blue, navy ink, gold',()=>{
 const t=read('src/theme.js');
 // Fix round (vc18 FR): canonical owner palette — royal #0B4FC8, navy #0E1B3D, page cream #FAF3E0,
 // card cream #FFFDF6, gold #F6B92B, airmail red #E2363C. Values are resolved, not just text-matched.
 const T=new Function(t.replace(/^export /gm,'')+';return {C,palette};')();
 for(const [k,v] of [['royal','#0B4FC8'],['cream','#FAF3E0'],['paper','#FFFDF6'],['airRed','#E2363C'],['airBlue','#0B4FC8'],['navy','#0E1B3D'],['gold','#F6B92B'],['bg','#FAF3E0'],['card','#FFFDF6']])assert.equal(T.C[k],v,k);
 // legacy token names still exist so no screen loses a color
 for(const k of ['ink','navy2','blue','cyan','card','line','muted','soft','green','red','amber','highlight','successBg','dangerBg','teal','tealDark','mist','white','sea','plum','sky'])assert.match(t,new RegExp(`\\b${k}:`),k);
});
test('airmail kit: diagonal stripe, envelope frame, perforated stamp, postmark, brand mark, icons',()=>{
 const a=read('src/components/Airmail.js'),ui=read('src/components/UI.js');
 for(const x of ['AirmailStripe','AirmailFrame','AirmailDashes','Stamp','Postmark','BrandMark','Wordmark','LangSwitch','Icon','IconChip','ArrowCircle','RoadSignsArt','RouteArt','TrustIcon'])assert.match(a,new RegExp(`export (function|const) ${x}\\b`),x);
 assert.match(a,/skewX: "-40deg"/);assert.match(a,/rotate: "45deg"/);assert.match(a,/borderStyle: "dotted"/);
 assert.match(a,/@expo\/vector-icons\/Feather/);assert.ok(pkg.dependencies['@expo/vector-icons'],'icon package declared');
 assert.match(ui,/export \* from "\.\/Airmail"/);
 for(const v of ['envelope','blue','certificate'])assert.match(ui,new RegExp(`variant==="${v}"`),v);
});
test('three languages, switch always visible: header on every main screen, sign-in and first-run tour',()=>{
 const a=read('src/components/Airmail.js');
 for(const l of ['"ar", "العربية"','"en", "English"','"es", "Español"'])assert.ok(a.includes(l),l);
 const h=read('src/components/AppHeader.js');assert.match(h,/<LangSwitch lang=\{lang\} onSet=/);assert.doesNotMatch(h,/\{user\s*\?\s*<LangSwitch|lang===["']ar["']\s*\?\s*<LangSwitch/);
 assert.match(read('src/screens/AuthScreen.js'),/<LangSwitch /);assert.match(read('src/components/WelcomeTour.js'),/<LangSwitch /);
 const appSrc=read('App.js');assert.match(appSrc,/async function setLangTo\(next\)\{if\(!\["ar","en","es"\]\.includes\(next\)\)return;/);
 assert.match(appSrc,/<AppHeader [^\n]*onSetLang=\{setLangTo\}/);assert.match(appSrc,/<AuthScreen [^\n]*onSetLang=\{setLangTo\}/);assert.match(appSrc,/<WelcomeTour [^\n]*onSetLang=\{setLangTo\}/);
 assert.match(appSrc,/async function cycleLang\(\)/,'old cycle kept');
 assert.match(read('src/i18n.js'),/isRTL = \(lang\) => normalizeLang\(lang\) === "ar"/);
 // every tr( call in the redesigned screens carries Arabic + English (+ Spanish where it existed)
 for(const f of ['HomeScreen','AllSectionsScreen','AuthScreen','JourneyScreen','LearnScreen','CitizenshipScreen','CommunityScreen','CVScreen'])assert.ok((read(`src/screens/${f}.js`).match(/[؀-ۿ]/g)||[]).length>50,f);
});
test('mockup layouts are applied to the ten approved screens',()=>{
 const r=f=>read(`src/screens/${f}.js`);
 assert.match(r('HomeScreen'),/variant="envelope"/);assert.match(r('HomeScreen'),/<RouteArt\/>/);assert.match(r('HomeScreen'),/<RoadSignsArt\/>/);assert.match(r('HomeScreen'),/<TrustIcon /);
 assert.match(r('AllSectionsScreen'),/<Stamp tone=\{lead\?"navy":"paper"\}/);assert.match(r('AllSectionsScreen'),/padStart\(2,"0"\)/);
 assert.match(r('JourneyScreen'),/variant="blue"/);assert.match(r('JourneyScreen'),/<AirmailStripe /);
 assert.match(r('LearnScreen'),/<Stamp key=\{i\} style=\{styles\.stat\}>/);
 assert.match(r('CitizenshipScreen'),/variant="certificate"/);
 assert.match(r('CommunityScreen'),/action=\{tab==="saved"\?null:/);
 assert.match(r('CVScreen'),/cv\.stepper/);assert.match(r('CVScreen'),/cv\.ring/);
 assert.match(r('AuthScreen'),/<AirmailFrame /);
 const nav=read('src/components/BottomNav.js');for(const id of ['"home"','"journey"','"learn"','"community"','"all"'])assert.ok(nav.includes(`[${id},`),id);
});
test('citizenship link stays out of the top header (sections grid only)',()=>{
 assert.doesNotMatch(read('src/components/AppHeader.js'),/citizenship|الجنسية/i);
 assert.match(read('src/screens/AllSectionsScreen.js'),/route:"citizenship"/);
});
test('zero deletions: same screens, components, routes and section entries as the v3.7.0 base',()=>{
 for(const f of BASE.screens)assert.ok(fs.existsSync(path.join(root,'src/screens',f)),f);
 for(const f of BASE.components)assert.ok(fs.existsSync(path.join(root,'src/components',f)),f);
 assert.equal(fs.readdirSync(path.join(root,'src/screens')).length,26);
 const a=read('App.js');const routes=[...a.matchAll(/case"(\w+)"/g)].map(m=>m[1]);assert.equal(routes.length,25);
 const s=read('src/screens/AllSectionsScreen.js');assert.equal((s.match(/\{route:"|\{url:"/g)||[]).length,30,'29 entries + admin');
 for(const f of ['assets/icon.png','assets/adaptive-icon.png','assets/learn/dime.png','assets/learn/dollar1.png','assets/learn/nickel.png','assets/learn/penny.png','assets/learn/quarter.png'])assert.ok(fs.existsSync(path.join(root,f)),f);
 assert.equal(fs.readdirSync(path.join(root,'assets/learn/signs')).length,5);
});
test('content, logic, API and storage files are byte-identical to the v3.7.0 base (counts untouched)',()=>{
 // Fix round: src/data/resourceConfig.js intentionally gained Spanish labels (brief item 6; ar/en text unchanged,
 // keys and bindings unchanged) — its pinned hash is the fix-round file. Every other file stays byte-identical.
 for(const [f,h] of Object.entries(BASE.hashes)){const got=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');assert.equal(got,h,f);}
});
test('no hidden numbers: mockup counts are computed from data, not hard-coded',()=>{
 const home=read('src/screens/HomeScreen.js'),learn=read('src/screens/LearnScreen.js');
 assert.doesNotMatch(home,/24 منشور|24 community posts/);
 assert.doesNotMatch(learn,/>51<|>10<|"51"|"10"/);assert.match(learn,/\(data\.road_signs\|\|\[\]\)\.length/);
});
