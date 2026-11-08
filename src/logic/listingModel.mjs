export const MEDIA_BASE='https://answerforu.com';
export function listingImages(x){
  let a=x?.images??x?.image_urls??x?.image_url??x?.image??x?.cover_url??[];
  if(typeof a==='string'){try{const parsed=JSON.parse(a);a=Array.isArray(parsed)?parsed:[a]}catch{a=a.trim()?[a]:[]}}
  return (Array.isArray(a)?a:[]).filter(Boolean).map(v=>{
    const url=typeof v==='string'?v:v?.url||v?.src||'';
    if(!url)return '';
    if(/^(https?:|data:|file:)/i.test(url))return url;
    return MEDIA_BASE+'/'+url.replace(/^\/+/, '');
  }).filter(Boolean);
}
export function listingTitle(x){return String(x?.title||x?.name||x?.display_name||'').trim();}
export function listingPlace(x){return [x?.city||x?.meta?.city,x?.state||x?.state_code||x?.meta?.state].filter(Boolean).join(', ');}
export function listingPrice(x){const value=x?.pay_rate??x?.salary??x?.price_value??x?.price??x?.hourly_rate??'';
 if(value===null||value===undefined||String(value).trim()==='')return '';
 const text=String(value).trim();return /^\$/.test(text)?text: /^\d/.test(text)?'$'+text:text;
}
export function listingContact(x){return String(x?.phone||x?.contact_phone||x?.contact||'').trim();}
export function listingJobType(x){return String(x?.jobType||x?.job_type||x?.employment_type||x?.meta?.jobType||'').trim();}
export function listingOwner(x){return x?.owner_user_id??x?.user_id??x?.created_by??x?.created_by_user_id??null;}
