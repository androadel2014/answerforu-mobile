import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
// Round 8 — 3.7.1 (versionCode 20): beta-tester report (17 items), mobile side.
const req=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const mod=f=>import(pathToFileURL(path.join(root,f)).href);
const theme=()=>new Function(read('src/theme.js').replace(/^export /gm,'')+';return {C,palette,tints,shadow,themed,setColorScheme,resolveScheme,colorScheme,signPalette};')();
function lum(h){const n=h.replace('#','');return [0,2,4].map(i=>parseInt(n.slice(i,i+2),16)/255).map(c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0)}
const ratio=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
function readZip(bytes){const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let e=bytes.length-22;while(e>=0&&v.getUint32(e,true)!==0x06054b50)e--;const n=v.getUint16(e+10,true);let p=v.getUint32(e+16,true);const out={};const d=new TextDecoder();for(let i=0;i<n;i++){const size=v.getUint32(p+20,true),len=v.getUint16(p+28,true),off=v.getUint32(p+42,true);const name=d.decode(bytes.subarray(p+46,p+46+len));const ll=v.getUint16(off+26,true);out[name]={crc:v.getUint32(p+16,true),data:bytes.subarray(off+30+ll,off+30+ll+size)};p+=46+len;}return out}

test('item 1 + 15: calendar date fields everywhere a date is asked; age from date of birth',async()=>{
 const d=await mod('src/logic/dates.mjs');
 assert.equal(d.ageOn('1990-05-20','2026-11-21'),36);assert.equal(d.ageOn('2010-11-22','2026-11-21'),15);
 assert.equal(d.addMonthsISO('2026-11-30',3),'2027-02-28');assert.equal(d.monthGrid(2026,10).filter(Boolean).length,30);
 assert.equal(d.formatDisplayDate('2027-02-01','ar'),'1 فبراير 2027');assert.equal(d.formatDisplayDate('2027-02-01','en'),'February 1, 2027');assert.equal(d.formatDisplayDate('2027-02-01','es'),'1 de febrero de 2027');
 const c=read('src/screens/CitizenshipScreen.js');assert.ok((c.match(/<DateField /g)||[]).length>=6,'resident since, birth, marriage, spouse, state since, N-400 filing');
 assert.doesNotMatch(c,/YYYY-MM-DD|AAAA-MM-DD/);assert.match(c,/ageOn\(birthDate,today\)/);
 const cv=read('src/screens/CVScreen.js');assert.match(cv,/CV_DATE_KEYS=new Set\(\['start','end','year','date'\]\)/);assert.match(cv,/<MonthYearField /);
 const p=read('src/components/FormPickers.js');for(const x of ['export function DateField','export function MonthYearField','export function StatePicker','monthGrid(','weekdayNames(','accessibilityState={{selected:on,disabled:!ok}}'])assert.ok(p.includes(x),x);
});
test('items 2 + 3: one speech speed in every language; the whole answer is spoken, "/" read as "or"',async()=>{
 const s=await mod('src/logic/speechText.mjs');
 assert.deepEqual(s.speechChunks(['the Constitution','the Bill of Rights'],'en'),['the Constitution or the Bill of Rights']);
 assert.equal(s.normalizeSpeechText('Sunday/Saturday · W-2/1099 · 24/7','en'),'Sunday or Saturday, W-2 or 1099, 24/7');
 assert.ok(s.chunkSpeechText('word '.repeat(120),180).every(x=>x.length<=180));
 const v=read('src/services/voice.js');assert.match(v,/export function subscribeSpeed/);assert.match(v,/speechChunks\(/);assert.match(v,/normalizeSpeechText\(stripBidiControls\(s\),lang\)/);
 const b=read('src/components/SpeechButton.js');assert.match(b,/say\(text,rate,update,speechLang\)/);assert.doesNotMatch(b,/rate=1/);
 const vs=read('src/components/VoiceSpeed.js');for(const w of ["'سرعة النطق'","'Speech speed'","'Velocidad de voz'"])assert.ok(vs.includes(w),w);
 const c=read('src/screens/CitizenshipScreen.js');assert.match(c,/<SpeechButton lang=\{lang\} text=\{ans\}/);assert.doesNotMatch(c,/text=\{ans\[0\]/);
 assert.match(read('src/screens/SurvivalEnglishScreen.js'),/<VoiceSpeed lang=\{lang\} onChange=\{setVoiceRate\}\/>/);
});
test('item 4: states are a searchable list of names (Arabic / English / Spanish / code)',async()=>{
 const u=await mod('src/logic/usStates.mjs');
 assert.equal(u.stateOptions('ar').length,51);assert.deepEqual(u.searchStates('فرج','ar').slice(0,2).map(x=>x.code),['VA','WV']);
 assert.equal(u.searchStates('ny','en')[0].code,'NY');assert.equal(u.stateLabel('NC','es'),'Carolina del Norte');
 for(const f of ['src/screens/CitizenshipScreen.js','src/screens/CommunityScreen.js','src/screens/CVScreen.js'])assert.match(read(f),/<StatePicker /,f);
 assert.doesNotMatch(read('src/screens/CommunityScreen.js'),/toUpperCase\(\)\.slice\(0,2\)/);
});
test('items 5 + 6: each step fact appears once; numbered rows use badges, not "1."',async()=>{
 const {stepGuideModel}=await mod('src/logic/stepGuide.mjs');
 const guide={title:'ابنِ مركز المستندات',text:'جهّز الأوراق.\nاعمل نسخ.',video:'فيديو'};
 const data={guides:{s1:guide},guideLocales:{s1:{ar:guide,en:{title:'Build your document center',text:'Prepare papers.'}}},
  actions:{s1:[{ar:'راجع صلاحية جواز السفر',en:'Check passport validity'},{ar:'احتفظ بأصول الأوراق في حقيبة اليد',en:'Keep originals in your carry-on'},{ar:'راجع صلاحية جوازات السفر',en:'Check passports validity'}]},
  warningsLocales:{s1:{ar:['ما تشحنش الأصول في شنطة الطيارة.'],en:['Do not check original documents.']}},
  warningsAr:{steps:{s1:['ما تشحنش الأصول في شنطة الطيارة.','راجع تطابق الأسماء في الترجمات.']},stages:{}},costs:{s1:{ar:'0 دولار',en:'$0'}},effort:{s1:{prepMinutesMin:60,prepMinutesMax:120}}};
 const ar=stepGuideModel({stepId:'s1',stageId:'st',lang:'ar',checklistLabels:['راجع صلاحية جواز السفر'],data});
 assert.deepEqual(ar.points,['احتفظ بأصول الأوراق في حقيبة اليد'],'checklist + near-duplicate actions removed');
 assert.deepEqual(ar.warnings,['ما تشحنش الأصول في شنطة الطيارة.','راجع تطابق الأسماء في الترجمات.'],'the repeated warning appears once');
 assert.equal(ar.details.paragraphs.length,2);assert.equal(ar.details.effort,'وقت التحضير التقريبي: 60–120 دقيقة');
 const en=stepGuideModel({stepId:'s1',stageId:'st',lang:'en',checklistLabels:[],data});
 assert.equal(en.details.title,'Build your document center');assert.ok(!/[؀-ۿ]/.test(JSON.stringify(en)),'no Arabic original in English');
 const j=read('src/screens/JourneyScreen.js');assert.match(j,/"الإجراءات المطلوبة","Required actions","Acciones necesarias"/);assert.doesNotMatch(j,/1\. \{tr\(lang,"نفّذ دول"/);
 for(const x of ['<StepGuideCard model={guide}','<StepWarningsCard model={guide}','<StepDetailsCard model={guide}'])assert.ok(j.includes(x),x);
 const sc=read('src/components/ServerContent.js');assert.match(sc,/<NumBadge n=\{i\+1\}\/>/);assert.doesNotMatch(sc,/\{i\+1\}\.<\/Txt>/);
 const r=read('src/components/RoadmapDeepDetails.js');for(const t of ["'دليل الخطوة'","'التحذيرات'","'الشرح الإضافي — كل التفاصيل'"])assert.ok(r.includes(t),t);assert.doesNotMatch(r,/'تحذيرات إضافية'|'شرح إضافي'/);
});
test('items 6 + 13: Arabic is RTL from the app root; Latin runs keep their order inside Arabic',async()=>{
 const app=read('App.js');assert.match(app,/const rootDir=\{direction:lang==="ar"\?"rtl":"ltr"\};/);assert.equal((app.match(/style=\{\[st\.safe,rootDir\]\}/g)||[]).length,3);
 const b=await mod('src/logic/bidi.mjs');const out=b.isolateForRtl('قدّم نموذج N-400 أونلاين');
 assert.equal(out,'‏قدّم نموذج ⁦N-400⁩ أونلاين');assert.equal(b.stripBidiControls(out),'قدّم نموذج N-400 أونلاين');
 assert.equal(b.isolateForRtl('4 Quarters = $1 دولار'),'‏⁦4 Quarters = $1⁩ دولار');
 const ui=read('src/components/UI.js');assert.match(ui,/\{bidiChildren\(children, lang\)\}<\/Text>/);assert.match(ui,/export function NumBadge\(/);
});
test('item 7: dark mode — manual and automatic, contrast-checked, every stylesheet follows it',()=>{
 const T=theme();assert.equal(T.colorScheme(),'light');const light={...T.C};
 const sheet=T.themed(()=>({x:{color:T.C.ink,backgroundColor:T.C.bg}}));assert.equal(sheet.x.color,'#0E1B3D');
 assert.equal(T.setColorScheme('dark'),true);assert.equal(sheet.x.color,'#E7ECF7');assert.equal(sheet.x.backgroundColor,'#0B1220');
 const C=T.C;assert.ok(Object.values(C).every(v=>/^#[0-9A-F]{6}$/.test(v)));
 for(const [fg,bg,min] of [['ink','bg',7],['ink','paper',7],['muted','paper',4.5],['placeholder','paper',4.5],['blue','paper',4.5],['greenInk','paper',4.5],['redInk','paper',4.5],['onDark','royal',4.5],['onDark','navy',4.5],['onGold','gold',4.5],['inputBorder','paper',3]])assert.ok(ratio(C[fg],C[bg])>=min,`${fg} on ${bg} (dark)`);
 assert.equal(T.tints[0].fg,'#8DB2FF');assert.equal(T.shadow.shadowColor,'#000000');
 T.setColorScheme('light');assert.deepEqual({...T.C},light,'light appearance is unchanged');
 assert.equal(T.resolveScheme('auto','dark'),'dark');assert.equal(T.resolveScheme('light','dark'),'light');assert.equal(T.resolveScheme('auto',null),'light');
 const app=JSON.parse(read('app.json')).expo;assert.equal(app.userInterfaceStyle,'automatic');
 const a=read('App.js');assert.match(a,/useColorScheme\(\)/);assert.match(a,/setColorScheme\(resolvedTheme\)/);assert.match(a,/barStyle=\{resolvedTheme==="dark"\?"light-content":"dark-content"\}/);
 assert.match(read('src/auth/storage.js'),/export async function getThemePref/);
 for(const f of ['src/screens/AllSectionsScreen.js','src/screens/ProfileScreen.js'])assert.match(read(f),/<AppearanceControl lang=\{lang\} value=\{themePref\}/,f);
 const walk=d=>fs.readdirSync(path.join(root,d)).flatMap(f=>{const p=path.join(d,f);return fs.statSync(path.join(root,p)).isDirectory()?walk(p):/\.js$/.test(f)?[p]:[]});
 const plain=[...walk('src'),'App.js'].filter(f=>/^(export )?const \w+\s*=\s*StyleSheet\.create\(/m.test(read(f)));assert.deepEqual(plain,[],'module StyleSheets are themed()');
 const text=[...walk('src'),'App.js'].filter(f=>/color:\s*C\.(navy|white)\b/.test(read(f)));assert.deepEqual(text,[],'text uses role tokens (ink / onDark)');
});
test('item 8: journey report and Survival sheet as real Excel and Word files',async()=>{
 const {journeyReportModel,journeyWorkbook,journeyDocument}=await mod('src/logic/journeyReport.mjs');
 const {buildXlsx}=await mod('src/logic/export/xlsx.mjs');const {buildDocx}=await mod('src/logic/export/docx.mjs');const {crc32}=await mod('src/logic/export/zip.mjs');
 const stages=[{id:'a',title:{ar:'المرحلة',en:'Stage'},steps:[{id:'s1',title:{ar:'قدّم N-400',en:'File N-400'},priority:'high',checklist:[{ar:'بند',en:'Item'},{ar:'بند ٢',en:'Item 2'}]}]}];
 const model=journeyReportModel({stages,progress:{s1:{status:'doing'}},checklist:{'s1::0':{done:true}},customItems:[{id:'c',step_id:'s1',title:'Personal',is_done:true}],profile:{state_code:'VA'},lang:'ar',date:new Date(2026,10,21)});
 assert.deepEqual(model.overall,{itemsDone:2,itemsTotal:3,percent:67,stepsDone:0,stepsTotal:1});assert.equal(model.stateLabel,'فيرجينيا (VA)');
 for(const [bytes,parts] of [[buildXlsx(journeyWorkbook(model)),['xl/workbook.xml','xl/worksheets/sheet3.xml','xl/sharedStrings.xml']],[buildDocx(journeyDocument(model)),['word/document.xml','word/styles.xml']]]){
  const z=readZip(bytes);for(const p of ['[Content_Types].xml','_rels/.rels',...parts])assert.ok(z[p],p);for(const [n,e] of Object.entries(z))assert.equal(crc32(e.data),e.crc,n);
 }
 const doc=new TextDecoder().decode(readZip(buildDocx(journeyDocument(model)))['word/document.xml'].data);assert.match(doc,/<w:bidiVisual\/>/);assert.match(doc,/<w:t xml:space="preserve">N-400<\/w:t>/);
 assert.match(read('src/screens/JourneyScreen.js'),/<ReportButtons dark lang=\{lang\}/);assert.match(read('src/screens/SurvivalEnglishScreen.js'),/<ReportButtons lang=\{lang\}/);
 const share=read('src/services/reportShare.js');assert.match(share,/Sharing\.shareAsync\(file\.uri/);assert.match(share,/new File\(Paths\.cache/);
});
test('items 9–12 + 14: Learn reflects every topic, hosted currency photos, padded and drawn signs, quiz ends on a result',async()=>{
 const l=read('src/screens/LearnScreen.js');
 for(const k of ['guides','currency','signs','quiz','stores','services','education','measure'])assert.match(l,new RegExp(`\\b${k}: \\[\\[`),k);
 assert.match(l,/\[\(data\.life_guides\|\|\[\]\)\.length,tr\(lang,"دليل للحياة اليومية"/);
 assert.match(l,/unavailable=\{<View style=\{styles\.unavailable\}>/);assert.match(l,/setTimeout\(failOver, 8000\)/);assert.match(l,/hostedCurrencyPhoto\(item\?\.\[`\$\{side\}_local`\]\) \|\| hostedCurrencyPhoto\(item\?\.\[side\]\)/); // 3.7.2: hosted copies only (see round 9)
 assert.match(l,/<SignGraphic shape=\{item\.shape\}/);assert.match(l,/<SignTile /);
 assert.match(l,/if \(finished\) \{/);assert.match(l,/"اعرض النتيجة","See my result"/);assert.doesNotMatch(l,/setI\(0\);setSelected\(null\);setScore\(0\);setRun/);
 assert.match(l,/balanceCategories: true/);
 const {buildSelection}=await mod('src/logic/quizSelection.mjs');
 const bank=[...Array(13)].map((_,i)=>({category:'signs',options:{ar:['a','b']}})).concat([...Array(9)].map(()=>({category:'money',options:{ar:['a','b']}})),[...Array(4)].map(()=>({category:'daily-life',options:{ar:['a','b']}})));
 const picked=buildSelection(bank,10,{randomizeQuestions:true,randomizeChoices:true,balanceCategories:true}).map(x=>bank[x.index].category);
 assert.ok(picked.filter(c=>c==='signs').length<=4,'road signs no longer dominate');
 const tile=read('src/components/SignTile.js');for(const s of ["shape==='diamond'","shape==='triangle'","shape==='octagon'"])assert.ok(tile.includes(s),s);assert.match(tile,/padding:16/);
});
test('item 16: 8-character password with show/hide and a strength meter (same list as the API)',async()=>{
 const p=await mod('src/logic/passwordPolicy.mjs');
 assert.equal(p.PASSWORD_MIN_LENGTH,8);assert.equal(p.validatePassword('short').reason,'short');assert.equal(p.validatePassword('password1').reason,'common');
 assert.equal(p.validatePassword('kiko2026',{username:'kiko2026'}).reason,'personal');assert.ok(p.validatePassword('Blue-Nile-77').ok);assert.ok(p.passwordStrength('Blue-Nile-77!x').score>=3);
 const auth=read('src/screens/AuthScreen.js'),prof=read('src/screens/ProfileScreen.js');
 for(const s of [auth,prof]){assert.match(s,/passwordProblem\(lang,/);assert.doesNotMatch(s,/length<12/);}
 assert.match(auth,/meter=\{mode==='register'\}/);assert.match(prof,/<PasswordInput lang=\{lang\} meter /);
 const pi=read('src/components/PasswordInput.js');assert.match(pi,/secureTextEntry=\{!shown\}/);assert.match(pi,/accessibilityRole="progressbar"/);
 const webList=fs.existsSync(path.join(root,'../AnswerForU-v6.4.1/source-original/src/lib/passwordPolicy.js'))?read('../AnswerForU-v6.4.1/source-original/src/lib/passwordPolicy.js'):null;
 if(webList)assert.ok(read('src/logic/passwordPolicy.mjs').includes(webList.slice(webList.indexOf('export const COMMON_PASSWORDS'),webList.indexOf(']);')+3)),'same common list as the website');
});
test('release (3.7.1 round, re-pinned for 3.7.2): only expo-system-ui + expo-splash-screen added, no permission',()=>{
 const pkg=JSON.parse(read('package.json')),app=JSON.parse(read('app.json')).expo;
 assert.equal(pkg.version,'3.7.2');assert.equal(app.version,'3.7.2');assert.equal(app.android.versionCode,21);assert.equal(app.plugins.length,7);assert.equal(app.android.permissions,undefined);
 assert.deepEqual(Object.keys(pkg.dependencies).sort(),['@expo/vector-icons','expo','expo-auth-session','expo-crypto','expo-document-picker','expo-file-system','expo-image-picker','expo-linking','expo-notifications','expo-secure-store','expo-sharing','expo-speech','expo-speech-recognition','expo-splash-screen','expo-system-ui','expo-web-browser','react','react-native','react-native-safe-area-context']);
});
