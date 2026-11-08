import { Share } from 'react-native';
/** The second argument may be either a URL or prose; never pass prose as iOS `url`. */
export async function shareItem(title,linkOrText){
  const body=String(linkOrText||'').trim();
  const url=/^https?:\/\//i.test(body)?body:undefined;
  try { return await Share.share({title:String(title||'AnswerForU'),message:[title,body].filter(Boolean).join('\n'),...(url?{url}:{})}); }
  catch(e) { return null; }
}
