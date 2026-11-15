import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const req=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const config=JSON.parse(read('app.json')).expo;

test('website-themed version 3.7.0, code 18, Android ID and no SDK/permission expansion',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'3.7.0'); assert.equal(config.version,'3.7.0');
 assert.equal(config.android.versionCode,19);assert.equal(config.android.package,'com.answerforu.app');
 assert.equal(config.extra.webMasterVersion,'6.3.9');
 for(const s of ['ads','analytics','firebase','amplitude','sentry'])assert.ok(!Object.keys(pkg.dependencies||{}).some(x=>x.toLowerCase().includes(s)),s);
 assert.equal(config.plugins.length,5);
});
test('design system is actually used in every requested screen, not just color tokens',()=>{
 const files=['HomeScreen','JourneyScreen','CommunityScreen','CitizenshipScreen','LearnScreen','SurvivalEnglishScreen','CVScreen','AuthScreen'];
 for(const f of files)assert.match(read(`src/screens/${f}.js`),/<SectionHero\b/,f);
 for(const f of ['HomeScreen','JourneyScreen','CitizenshipScreen','LearnScreen'])assert.match(read(`src/screens/${f}.js`),/<SectionHeading\b/,f);
 for(const f of ['ProfileScreen','FeedScreen','AllSectionsScreen'])assert.ok(read(`src/screens/${f}.js`).includes('SectionHero')||read(`src/screens/${f}.js`).includes('borderRadius:27'),f);
 assert.match(read('src/components/BottomNav.js'),/iconActive/);
 assert.match(read('src/components/AppHeader.js'),/logoMark/);
 assert.match(read('src/components/ListingCard.js'),/artDisk/);
});
test('three skippable onboarding screens and locally persisted completion with no permissions',()=>{
 const v=read('src/components/WelcomeTour.js'),a=read('App.js'),s=read('src/auth/storage.js');
 assert.equal((v.match(/descAr:/g)||[]).length,3);
 for(const mark of ['تخطي','Omitir','Previous','Empezar a explorar'])assert.ok(v.includes(mark),mark);
 for(const mark of ['getIntroDone','setIntroDone','showTour','WelcomeTour'])assert.ok(a.includes(mark),mark);
 assert.match(s,/afu_intro_v370_done/);
});
test('Arabic-first direction and Spanish labels across all marketplace categories',()=>{
 assert.match(read('src/components/UI.js'),/direction: rtl \? "rtl" : "ltr"/);
 assert.match(read('src/components/UI.js'),/writingDirection/);
 const c=read('src/data/communityConfig.js');
 for(const x of ['Lugares','Grupos','Servicios','Empleos','Vivienda','Productos'])assert.ok(c.includes(x),x);
 assert.match(read('src/screens/CommunityScreen.js'),/TYPES\.map\(\(\[id,ar,en,es\]\)/);
});
test('all original navigation actions and guest Journey button survive',()=>{
 const a=read('App.js'),j=read('src/screens/JourneyScreen.js');
 for(const route of ['citizenship','survival','feed','profile','cv','community','messages','notifications','saved'])assert.ok(a.includes(`case"${route}"`),route);
 assert.match(j,/import\{[^}]*Btn[^}]*\}from"\.\.\/components\/UI"/);
 assert.match(j,/!user\?<Card/);
 assert.match(read('src/components/ListingCard.js'),/onSave\?\.\(\)/);
 assert.match(read('src/components/ListingCard.js'),/onContact\?\.\(\)/);
});

// The runner has no React Native or emulator. With the TypeScript parser available
// on the build host, evaluate genuine JSX component functions against a strict
// mock-host renderer; this tests execution and callbacks, not Android pixels.
let ts;
try{ts=req('typescript')}catch{
 try{ts=req(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}catch{ts=null}
}
function harness(file){
 const state=[],seen={};let cursor=0;
 const React={
  Fragment:"Fragment",
  createElement(type,props,...children){if(!type)throw Error(`Unresolved JSX component in ${file}`);return {type,props:{...(props||{}),children:children.length===1?children[0]:children}}},
  useState(init){const i=cursor++;if(!(i in state))state[i]=typeof init==='function'?init():init;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v]},
  useEffect(){},useRef(v){return{current:v}},useMemo(fn){return fn()},useCallback(fn){return fn}
 };
 const trans=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText;
 const fakeRequire=id=>{
  if(id==='react')return {__esModule:true,default:React,...React};
  if(id==='react-native')return {StyleSheet:{create:o=>o},View:'View',Pressable:'Pressable'};
  if(id.includes('/UI')||id==='./UI')return {Screen:'Screen',Txt:'Txt',Btn:'Btn',Card:'Card',SectionHero:'SectionHero',SectionHeading:'SectionHeading',AwareTextInput:'AwareTextInput',
   // v3.7.0 Airmail kit (re-exported by UI.js) — rendered as named host nodes like the rest.
   Icon:'Icon',AirmailStripe:'AirmailStripe',AirmailFrame:'AirmailFrame',AirmailDashes:'AirmailDashes',Stamp:'Stamp',Postmark:'Postmark',BrandMark:'BrandMark',Wordmark:'Wordmark',LangSwitch:'LangSwitch',IconChip:'IconChip',ArrowCircle:'ArrowCircle',RoadSignsArt:'RoadSignsArt',RouteArt:'RouteArt',TrustIcon:'TrustIcon',fwdIcon:l=>l==='ar'?'arrow-left':'arrow-right'};
  if(id.includes('theme'))return {C:{teal:'#078B91',navy:'#10394A',sea:'#B2ECE2',ink:'#123346',muted:'#536C79',mist:'#E6F5F2'}};
  if(id.includes('i18n'))return {tr:(lang,ar,en,es=en)=>lang==='ar'?ar:lang==='es'?es:en};
  if(id.includes('/api/client'))return {api:{},rows:()=>[]};
  if(id.includes('/appSafety'))return {friendlyError:()=>''};
  throw Error('Unexpected import in UI render: '+id);
 };
 const module={exports:{}};
 new Function('require','module','exports',trans)(fakeRequire,module,module.exports);
 return {render(props){cursor=0;return module.exports.default(props)},state,seen};
}
function walk(node,fn){if(node===null||node===undefined||typeof node==='boolean')return;
 if(Array.isArray(node)){node.forEach(x=>walk(x,fn));return}
 if(typeof node==='object'&&node.type){fn(node);walk(node.props?.children,fn)}
}
function find(root,fn){const matches=[];walk(root,n=>{if(fn(n))matches.push(n)});return matches}

test('render: skippable first-run onboarding advances all three pages in AR/EN/ES', {skip:!ts},()=>{
 const r=harness('src/components/WelcomeTour.js');let finished=0;
 for(const lang of ['ar','en','es']){
   r.state.length=0;
   let root=r.render({lang,onDone:()=>finished++});
   assert.equal(find(root,n=>n.type==='Btn').length>=1,true);
   for(let index=0;index<3;index++){
     assert.ok(find(root,n=>n.type==='Txt'&&(Array.isArray(n.props.children)?n.props.children.join(""):String(n.props.children)).includes(`0${index+1} / 03`)).length,`${lang}, step ${index+1}`);
     const action=find(root,n=>n.type==='Btn' && n.props.variant==='blue')[0];assert.ok(action,`${lang} primary action`);
     action.props.onPress();
     if(index<2)root=r.render({lang,onDone:()=>finished++});
   }
 }
 assert.equal(finished,3);
});
test('render: home guest includes functioning first-step and marketplace actions', {skip:!ts},()=>{
 const r=harness('src/screens/HomeScreen.js'),visited=[];
 const root=r.render({lang:'ar',user:null,navigate:(...args)=>visited.push(args)});
 assert.ok(find(root,n=>n.type==='SectionHero').length);
 const entries=find(root,n=>n.type==='Pressable'&&typeof n.props.onPress==='function');
 assert.ok(entries.length>=2);
 entries[0].props.onPress(); entries[1].props.onPress();
 assert.deepEqual(visited.map(x=>x[0]),['journey','community']);
});
