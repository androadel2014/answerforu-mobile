export function normalized(s){return String(s||'').toLocaleLowerCase().trim();}
export function filterPhrases(phrases,{pack='',tier=0,query='',hideMastered=true,mastered=[]}={}){const m=new Set(mastered);const q=normalized(query);return phrases.filter(p=>(!pack||String(p.pack)===String(pack))&&(!tier||Number(p.tier)===Number(tier))&&(!hideMastered||!m.has(p.id))&&(!q||[p.en,p.pron_ar,p.meaning_ar,p.reply_en,p.reply_ar].some(x=>normalized(x).includes(q))));}
export function extractReply(p){if(String(p.reply_en||'').trim())return String(p.reply_en).trim();const v=String(p.reply_ar||'');const s=v.replace(/^[^\p{L}A-Za-z]*((?:المتوقع|الرد المتوقع)\s*:\s*)?/u,'').split('—')[0].replace(/^\s*(?:👂|🗣)\s*/u,'').trim();return /^[A-Za-z]/.test(s)?s:'';}
export function speakingQueue(phrases){return phrases.flatMap(p=>[p.en,extractReply(p)]).filter(Boolean);}
export function updateMastery(ids,id,value){const out=new Set(ids);if(value)out.add(id);else out.delete(id);return [...out];}
