/** Website v6.3.7 CVBuilderView / cvHelpers compatible record model. */
export const emptyCv=()=>({targetJob:{title:'',company:'',state:''},personalInfo:{fullName:'',phone:'',email:'',address:''},education:[],courses:[],experiences:[],languages:'',summary:'',skills:[]});
export function normalizeCv(raw){
 let value=raw?.cv_data??raw?.data??raw??{};
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{value={}}}
 if(!value||typeof value!=='object'||Array.isArray(value))value={};
 const personal=value.personalInfo||value.personal||{};
 const experiences=Array.isArray(value.experiences)?value.experiences:(Array.isArray(value.experience)?value.experience:[]);
 const education=Array.isArray(value.education)?value.education:[];
 return {...value,targetJob:{...emptyCv().targetJob,...(value.targetJob||{})},personalInfo:{fullName:personal.fullName??personal.name??'',phone:personal.phone||'',email:personal.email||'',address:personal.address??personal.location??'',photo:personal.photo||'',...personal},summary:String(value.summary||''),languages:String(value.languages||''),education,courses:Array.isArray(value.courses)?value.courses:[],experiences,skills:Array.isArray(value.skills)?value.skills:(typeof value.skills==='string'?value.skills.split(',').map(x=>x.trim()).filter(Boolean):[])};
}
export function parseImportedCv(text){
 if(typeof text!=='string'||text.length>200000)throw new Error('CV_JSON_TOO_LARGE');
 const start=text.indexOf('{'),end=text.lastIndexOf('}');if(start<0||end<=start)throw new Error('CV_JSON_REQUIRED');
 function sanitize(x,depth=0){if(depth>10)return Array.isArray(x)?[]:typeof x==='object'&&x!==null?{}:'';if(typeof x==='string')return x.slice(0,5000);if(Array.isArray(x))return x.slice(0,100).map(v=>sanitize(v,depth+1));if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).map(([k,v])=>[k,sanitize(v,depth+1)]));return x;}
 return normalizeCv(sanitize(JSON.parse(text.slice(start,end+1))));
}
export function previewCv(data){const d=normalizeCv(data),p=d.personalInfo;return [p.fullName,[p.email,p.phone,p.address].filter(Boolean).join(' · '),d.targetJob.title,d.summary,...d.experiences.map(x=>[x.title,x.company,x.location,[x.start,x.end].filter(Boolean).join(' - '),x.responsibilities||x.bullets||''].filter(Boolean).join('\n')),...d.education.map(x=>[x.degree,x.major,x.school,x.location,x.year].filter(Boolean).join(' · ')),...d.courses.map(x=>[x.name,x.provider,x.date].filter(Boolean).join(' · ')),d.skills.join(' · '),d.languages].filter(Boolean).join('\n\n');}
export function cvDataIsValid(data){const d=normalizeCv(data);return Boolean(d.personalInfo.fullName.trim()&&d.personalInfo.email.trim());}
