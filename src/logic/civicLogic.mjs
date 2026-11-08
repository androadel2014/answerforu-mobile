export const CUTOFF='2025-10-20';
export const civicsVersion = date => String(date||'') && date < CUTOFF?'2008':'2025';
export const rulesFor = (version,special=false) => special?{max:10,pass:6,fail:5}:version==='2008'?{max:10,pass:6,fail:5}:{max:20,pass:12,fail:9};
export function testStatus(correct,incorrect,version,special){const r=rulesFor(version,special);return correct>=r.pass?'passed':incorrect>=r.fail?'failed':correct+incorrect>=r.max?'failed':'running';}
export function addDays(date,n){const d=new Date(date+'T12:00:00Z');if(isNaN(d))return '';d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function addYears(date,n){const d=new Date(date+'T12:00:00Z');if(isNaN(d))return '';const m=d.getUTCMonth();d.setUTCFullYear(d.getUTCFullYear()+n);if(d.getUTCMonth()!==m)d.setUTCDate(0);return d.toISOString().slice(0,10);}
export const englishException = (age,years)=>age>=65&&years>=20?'65/20':age>=55&&years>=15?'55/15':age>=50&&years>=20?'50/20':null;
export function estimateFiling({greenDate,married=false,marriedSince='',spouseCitizenSince='',stateSince='',age=0,longestTripDays='',totalDaysAbroad=''},today=new Date().toISOString().slice(0,10)){
 if(!greenDate||isNaN(new Date(greenDate+'T00:00:00Z'))||greenDate>today)return {valid:false,reason:'greenDate'};
 const years=married?3:5,anniversary=addYears(greenDate,years),earlyDate=addDays(anniversary,-90);
 const dates=[earlyDate];const warnings=[];
 if(married){if(!marriedSince||!spouseCitizenSince)warnings.push('marriageProof');else dates.push(addYears(marriedSince,3),addYears(spouseCitizenSince,3));}
 if(stateSince)dates.push(addDays(stateSince,90));else warnings.push('stateResidence');
 if(Number(age)<18)warnings.push('age');
 const away=Number(longestTripDays),total=Number(totalDaysAbroad);
 if(longestTripDays===''||away>=180)warnings.push('continuousResidence');
 if(totalDaysAbroad===''||total<0)warnings.push('physicalPresence');
 else {const required=married?548:913;const period=(Date.parse(today)-Date.parse(addYears(today,-years)))/86400000;if(period-total<required)warnings.push('physicalPresence');}
 return {valid:true,years,anniversary,earlyDate,earliest:dates.sort().at(-1),warnings};
}
export const normalizeAnswer = s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\b([a-z])\.([a-z])\./g,'$1$2').replace(/[^a-z0-9]+/g,' ').trim();
export function answerMatches(user,answers){const text=normalizeAnswer(user);return !!text&&answers.some(x=>{const expect=normalizeAnswer(x);return expect===text || (expect.length>5&&text.includes(expect));});}
export function filterUnmastered(bank,mastered,showAll){return showAll?bank:bank.filter(q=>!mastered.includes(q.id));}
export function dynamicAnswer(q,values,state=''){const key=q.dynamic_key||q.variable_key||q.answer_key||q.dynamic_answer_key||(String(q.question_en||"" ).toLowerCase().includes("capital of the united states")?"capital":null);if(!key)return q.answers_en||[];const item=values.find(a=>a.answer_key===key&&a.region===state)||values.find(a=>a.answer_key===key&&a.region==='US');return item?[item.answer_value]:(q.answers_en||[]).filter(a=>!String(a).startsWith("@"));}
