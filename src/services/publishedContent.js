/** v6.3.7 — published server content is authoritative; offline means an API-derived disk snapshot only. */
import {api} from "../api/client";
import {useOfflinePack} from "./offline";
export const PUBLISHED_KEYS=Object.freeze([
  "citizenship-guide","citizenship-civics","citizenship-vocabulary","marketplace-categories","roadmap-guides","roadmap-guide-locales",
  "roadmap-actions","roadmap-warnings-locales","roadmap-warnings-ar",
  "roadmap-effort","roadmap-costs","state-agencies","state-health-marketplaces",
  "roadmap-dv-template","curated-cities","search-synonyms"
]);
export function unwrapContent(payload){
  if(payload == null)return null;
  if(typeof payload !== "object")return payload;
  if(payload.ok === true && Object.prototype.hasOwnProperty.call(payload,"data"))return payload.data;
  return payload;
}
export function usePublishedContent(key){
  const pack=useOfflinePack(`site-v637-${key}`,()=>api.publishedContent(key),null);
  return {...pack,data:unwrapContent(pack.data)};
}
export function useWebsiteContent(key,fetcher){
  const pack=useOfflinePack(`site-v637-${key}`,fetcher,null);
  return {...pack,data:unwrapContent(pack.data)};
}
