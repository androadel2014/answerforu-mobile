import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
// Round 7 — vc18 FIX ROUND (design + localisation). Presentation only; checks the 16 brief items.
const req=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const walk=d=>fs.readdirSync(path.join(root,d)).flatMap(f=>{const p=path.join(d,f);return fs.statSync(path.join(root,p)).isDirectory()?walk(p):/\.m?js$/.test(f)?[p]:[]});
const SRC=[...walk('src'),'App.js'];
const theme=()=>new Function(read('src/theme.js').replace(/^export /gm,'')+';return {C,palette,type,radius,shadow,spacing,tints};')();
const i18n=()=>new Function(read('src/i18n.js').replace(/^export /gm,'')+';return {tr,sourceLabel};')();
function lum(h){const n=h.replace('#','');return [0,2,4].map(i=>parseInt(n.slice(i,i+2),16)/255).map(c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0)}
const ratio=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};

test('palette: canonical six colours, every colour lives in theme.js, zero hex literals elsewhere',()=>{
 const {C,palette}=theme();
 assert.deepEqual(palette,{royal:'#0B4FC8',navy:'#0E1B3D',cream:'#FAF3E0',paper:'#FFFDF6',gold:'#F6B92B',airRed:'#E2363C'});
 const offenders=SRC.filter(f=>f!=='src/theme.js').flatMap(f=>(read(f).match(/#[0-9A-Fa-f]{3,8}\b/g)||[]).map(h=>`${f} ${h}`));
 assert.deepEqual(offenders,[],'hex literals outside theme.js');
 // collapsed tint families: the old near-duplicates are gone from the token set too
 const t=read('src/theme.js').split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
 for(const old of ['#CFDBFF','#CBD8F6','#E8A20E','#F6EAD9','#EFE3C8','#E2CF9F','#0B4FC4','#0E1A3A','#F8EFDC','#FFFCF5','#9A9384'])assert.ok(!t.includes(old),old);
 assert.ok(Object.values(C).every(v=>/^#[0-9A-F]{6}$/.test(v)),'tokens are resolved hex values');
});
test('contrast: placeholder ≥ 4.5:1 and input border ≥ 3:1 on cream and card cream; inputs use the tokens',()=>{
 const {C}=theme();
 for(const bg of [C.cream,C.paper]){assert.ok(ratio(C.placeholder,bg)>=4.5,`placeholder on ${bg}`);assert.ok(ratio(C.inputBorder,bg)>=3,`border on ${bg}`);}
 assert.match(read('src/components/UI.js'),/placeholderTextColor=\{C\.placeholder\}/);
 assert.match(read('src/components/UI.js'),/input: \{[^}]*borderColor: C\.inputBorder/);
 for(const f of ['src/screens/CommunityScreen.js','src/screens/GlossaryScreen.js','src/components/ResourceCards.js'])assert.match(read(f),/input:\{[^}]*borderColor:C\.inputBorder/,f);
});
test('type floor: no literal font size below 12px; Txt floor never below theme minText',()=>{
 const small=SRC.flatMap(f=>[...read(f).matchAll(/fontSize:\s?(\d+(?:\.\d+)?)\b(?!\s*\*)/g)].filter(m=>Number(m[1])<12).map(m=>`${f} ${m[0]}`));
 assert.deepEqual(small,[]);
 assert.equal(theme().type.minText,12);assert.match(read('src/components/UI.js'),/Math\.max\(type\.minText, Number\(floor\)/);
});
test('RTL rows: one shared ChipRow pattern on Community, Survival, Resources, AdminManage (and other chip rows)',()=>{
 const ui=read('src/components/UI.js');assert.match(ui,/export function ChipRow\(/);assert.match(ui,/maxWidth: "100%"/);assert.match(ui,/scrollToEnd/);
 for(const f of ['CommunityScreen','SurvivalEnglishScreen','PublishedLibraryScreen','AdminManageScreen','GlossaryScreen','LearnScreen','JourneyScreen']){const s=read(`src/screens/${f}.js`);assert.match(s,/<ChipRow lang=\{lang\}/,f);assert.doesNotMatch(s,/<ScrollView horizontal/,f);}
 const c=read('src/screens/CommunityScreen.js');assert.match(c,/locState:\{[^}]*minWidth:0/);assert.match(c,/locCity:\{[^}]*minWidth:0/);
});
test('errors: ErrorNotice is the single surface; banner dismissible and hidden while a screen shows its own error',()=>{
 const ui=read('src/components/UI.js');assert.match(ui,/export const ErrorSurfaceContext = createContext/);assert.match(ui,/export function ErrorNotice\(/);
 const app=read('App.js');assert.match(app,/bootError&&!bannerDismissed&&inlineErrors===0\?/);assert.match(app,/setBannerDismissed\(true\)/);assert.match(app,/<ErrorSurfaceContext\.Provider value=\{reportInlineError\}>/);
 for(const f of ['CVScreen','MessagesScreen','SavedScreen','MyRequestsScreen','FeedScreen','NotificationsScreen','CommunityScreen','GlossaryScreen','PostDetailScreen']){const s=read(`src/screens/${f}.js`);assert.match(s,/<ErrorNotice /,f);assert.match(s,/:error\?null:<Empty /,f);assert.doesNotMatch(s,/\{error\?<Card/,f);}
});
test('localisation: Community Picks, proof types, statuses, source labels, resource categories',()=>{
 const rc=read('src/components/ResourceCards.js');assert.ok(!/>AnswerForU Community Picks</.test(rc));assert.ok(rc.includes('tr(lang, "مختارات مجتمع AnswerForU", "AnswerForU Community Picks", "Selecciones de la comunidad AnswerForU")'));
 const v=read('src/screens/VerificationScreen.js');
 for(const en of ['State ID','Driver License','Passport','Work License','Business Registration','Professional License','Other'])assert.ok(!v.includes(`["${en.toLowerCase().replace(/ /g,'_')}","${en}"]`),en);
 assert.match(v,/\["driver_license","رخصة القيادة","Driver License","Licencia de conducir"\]/);assert.doesNotMatch(v,/status\?\.status\|\|"none"/);assert.match(v,/statusText\(status\?\.status,lang\)/);
 const {sourceLabel}=i18n();
 for(const [k,ar,en,es] of [['marketplace','السوق','Marketplace','Mercado'],['housing','سكن','Housing','Vivienda'],['jobs','شغل','Jobs','Empleos'],['services','خدمات','Services','Servicios'],['community','المجتمع','Community','Comunidad'],['resources','مصادر','Resources','Recursos'],['places','أماكن','Places','Lugares'],['groups','جروبات','Groups','Grupos']]){assert.equal(sourceLabel(k,'ar'),ar);assert.equal(sourceLabel(k,'en'),en);assert.equal(sourceLabel(k,'es'),es);}
 assert.doesNotMatch(read('src/screens/MyRequestsScreen.js'),/\{x\.source_type\}/);assert.match(read('src/screens/MyRequestsScreen.js'),/sourceLabel\(x\.source_type,lang\)/);
 assert.doesNotMatch(read('src/screens/AdminScreen.js'),/\{item\.type\|\|item\.source_type\|\|""\}/);assert.match(read('src/screens/AdminScreen.js'),/sourceLabel\(item\.type\|\|item\.source_type,lang\)/);
 const cfg=read('src/data/resourceConfig.js');for(const l of ['ar','en','es'])assert.equal((cfg.match(new RegExp(`\\b${l}:"`,'g'))||[]).length,25,l);
});
test('localisation: Journey chips Arabic-only, Recommend pill, Learn/Marketplace eyebrows, RTL-safe Journey search',()=>{
 const j=read('src/screens/JourneyScreen.js');assert.ok(!j.includes('نفّذ الـ Checklist'));assert.ok(j.includes('"03","نفّذ قائمة المهام"'));
 assert.match(j,/howRow:\{flexDirection:"column"/);assert.doesNotMatch(j,/numberOfLines=\{2\} style=\{\{color:C\.white,fontSize:14,flex:1\}\}/);
 assert.ok(!/tr\(lang,"[^"]*(SSN|DMV)[^"]*"/.test(j),'Arabic placeholder has no Latin acronyms');
 assert.ok(!read('src/screens/RecommendScreen.js').includes('>✦ AnswerForU Recommendations<'));
 assert.ok(read('src/screens/LearnScreen.js').includes('"اتعلم أمريكا · خطوة صغيرة كل يوم"'));assert.ok(read('src/screens/CommunityScreen.js').includes('"استكشف المجتمع · سوق AnswerForU"'));
});
test('hero, header, nav, home, empty states, offline packs, switcher position',()=>{
 const ui=read('src/components/UI.js');assert.match(ui,/blue:\{[^}]*backgroundColor:C\.navy/);assert.match(ui,/variant==="certificate"/);
 const auth=read('src/screens/AuthScreen.js');assert.doesNotMatch(auth,/eyebrow=\{`AnswerForU · v\$\{APP_VERSION\}`\}/);assert.match(auth,/<LangBar><LangSwitch /);
 assert.doesNotMatch(read('src/screens/AllSectionsScreen.js'),/<View style=\{s\.head\}><BrandMark/);
 assert.doesNotMatch(read('src/components/BottomNav.js'),/id === "all"/);
 assert.doesNotMatch(read('src/components/UI.js'),/miniStamp\}><BrandMark/,'Home hero shows the brand mark only once (header)');
 assert.match(read('src/screens/HomeScreen.js'),/titleSize=\{lang==='es'\?28/);assert.match(ui,/textBreakStrategy=\{balanced \? "balanced"/);
 for(const [f,art] of [['MessagesScreen','messages'],['SavedScreen','saved'],['CVScreen','cv'],['MyRequestsScreen','requests']]){const s=read(`src/screens/${f}.js`);assert.match(s,new RegExp(`<Empty lang=\\{lang\\} art="${art}"`),f);assert.match(s,/action=\{\{title:/,f);}
 const off=read('src/screens/OfflinePacksScreen.js');assert.doesNotMatch(off,/\{WEB_CONTENT_VERSION\}/);assert.match(off,/icon:'message-circle'/);assert.match(off,/st\.stateSaved/);
 const a=read('src/components/Airmail.js');assert.match(a,/export function LangBar\(/);assert.match(a,/justifyContent: "flex-end", direction: "ltr"/);assert.match(a,/gap: 6, direction: "ltr" \}/);
 assert.match(read('src/components/AppHeader.js'),/<LangBar><LangSwitch lang=\{lang\} onSet=/);
});

// ---- render checks (mock host, no Android pixels) ----
let ts;try{ts=req('typescript')}catch{try{ts=req(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'))}catch{ts=null}}
function load(file,extra={}){
 const state=[];let cursor=0;const ctxVals=new Map();
 const React={Fragment:'Fragment',Children:{toArray:c=>(Array.isArray(c)?c.flat(Infinity):[c]).filter(x=>x!==null&&x!==undefined&&x!==false).map((x,i)=>typeof x==='object'&&x.key==null?{...x,key:'.'+i}:x)},
  createElement(type,props,...children){if(!type)throw Error('Unresolved JSX in '+file);const {key,...rest}=props||{};return {type,key:key??null,props:{...rest,children:children.length===1?children[0]:children}}},
  createContext(d){const c={_v:d};c.Provider='Provider';return c},useContext(c){return ctxVals.has(c)?ctxVals.get(c):c._v},
  useState(i){const k=cursor++;if(!(k in state))state[k]=typeof i==='function'?i():i;return [state[k],v=>state[k]=typeof v==='function'?v(state[k]):v]},
  useEffect(fn){const r=fn();return r},useRef(v){return{current:v}},useMemo(f){return f()},useCallback(f){return f},forwardRef(f){return p=>f(p,null)},useImperativeHandle(){}};
 const RN={StyleSheet:{create:o=>o,flatten:o=>Array.isArray(o)?Object.assign({},...o.filter(Boolean).map(x=>RN.StyleSheet.flatten(x))):(o||{}),absoluteFill:{}},Platform:{OS:'android'},Dimensions:{get:()=>({height:800,width:400})},Keyboard:{addListener:()=>({remove(){}}),dismiss(){}},Linking:{openURL:async()=>{}}};
 for(const h of ['View','Text','Pressable','ScrollView','TextInput','ActivityIndicator','KeyboardAvoidingView','Image','Modal'])RN[h]=h;
 const code=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText;
 const cache={};const fake=id=>{
  if(id==='react')return {__esModule:true,default:React,...React};if(id==='react-native')return RN;
  if(extra[id])return extra[id];
  if(id.includes('theme'))return theme();if(id.endsWith('i18n'))return {...i18n(),isRTL:l=>l==='ar',normalizeLang:l=>l};
  if(id==='./Airmail'||id.includes('components/UI')){const n=id==='./Airmail'?'src/components/Airmail.js':'src/components/UI.js';return cache[n]||(cache[n]=load(n,extra).module.exports)}
  if(id.startsWith('@expo/vector-icons'))throw Error('no icons in test');
  throw Error('Unexpected import '+id+' in '+file);
 };
 const module={exports:{}};new Function('require','module','exports',code)(fake,module,module.exports);
 return {module,state,reset(){cursor=0},ctxVals};
}
const walkTree=(n,fn)=>{if(n==null||typeof n==='boolean')return;if(Array.isArray(n))return n.forEach(x=>walkTree(x,fn));if(typeof n==='object'&&n.type){fn(n);walkTree(n.props?.children,fn)}};
const expand=(n)=>{ // resolve function components so the host tree can be searched
 if(n==null||typeof n!=='object')return n;if(Array.isArray(n))return n.map(expand);
 if(typeof n.type==='function')return expand(n.type(n.props));
 return {...n,props:{...n.props,children:expand(n.props?.children)}};
};
const text=n=>{let out='';walkTree(n,x=>{const c=x.props?.children;for(const v of [].concat(c))if(typeof v==='string'||typeof v==='number')out+=v});return out};

test('render: ChipRow keeps LTR order in en/es and reverses + anchors right in ar',{skip:!ts},()=>{
 const UI=load('src/components/UI.js').module.exports;const kids=['a','b','c'].map(k=>({type:'Chip',key:k,props:{id:k}}));
 for(const lang of ['en','es']){const t=UI.ChipRow({lang,children:kids});assert.equal(t.type,'ScrollView');assert.deepEqual([].concat(t.props.children).map(c=>c.props.id),['a','b','c']);}
 const ar=UI.ChipRow({lang:'ar',children:kids});assert.equal(typeof ar.props.onContentSizeChange,'function');
 assert.deepEqual([].concat(ar.props.children).map(c=>c.props.children.props.id),['c','b','a']);
 const wrap=UI.ChipRow({lang:'ar',wrap:true,children:kids});assert.equal(wrap.type,'View');
});
test('render: ErrorNotice reports itself so the banner hides; Empty art replaces the stamp fan',{skip:!ts},()=>{
 const h=load('src/components/UI.js');const UI=h.module.exports;let n=0;h.ctxVals.set(UI.ErrorSurfaceContext,d=>{n+=d});
 const tree=expand(UI.ErrorNotice({lang:'es',message:'Sin conexión',onRetry:()=>{}}));assert.equal(n,1);assert.match(text(tree),/Reintentar/);
 assert.equal(UI.ErrorNotice({lang:'ar',message:''}),null);
 for(const art of ['messages','saved','cv','requests']){const e=UI.Empty({lang:'ar',title:'x',art,action:{title:'go',onPress(){}}});let found=false;walkTree(e,x=>{if(x.type===UI.EmptyArt&&x.props.kind===art)found=true});assert.ok(found,art)}
});
test('render: My Requests shows localised source labels and statuses in AR/EN/ES',{skip:!ts},()=>{
 const extra={'../api/client':{api:{myRequests:async()=>({})},rows:()=>[]},'../logic/appSafety.mjs':{friendlyError:()=>''},'../logic/confirmAction':{confirmAction(){}}};
 for(const [lang,src,st] of [['ar','سكن','مقبول'],['en','Housing','Approved'],['es','Vivienda','Aprobado']]){
  const h=load('src/screens/MyRequestsScreen.js',extra);h.state[2]=[{id:1,title:'Room',source_type:'housing',status:'approved',request_type:'listing',entity_id:5}];h.state[5]=false;h.reset();
  const t=text(h.module.exports.default({lang,navigate(){}}));assert.ok(t.includes(src),`${lang} source`);assert.ok(t.includes(st),`${lang} status`);assert.ok(!t.includes('housing'),`${lang} raw key`);
 }
});
