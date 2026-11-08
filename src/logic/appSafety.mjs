/** Bounded waits and friendly, localized errors: no raw network exceptions in UI. */
export const STARTUP_TIMEOUT_MS = 4000;
export const REQUEST_TIMEOUT_MS = 12000;
export function withTimeout(promise, ms, fallback = null) {
  let timer;
  return Promise.race([Promise.resolve(promise), new Promise(resolve => {timer=setTimeout(()=>resolve(fallback),ms);})]).finally(()=>clearTimeout(timer));
}
export function friendlyError(error,lang='ar'){
  const text=String(error?.message||error||'').trim();
  const es=String(lang).startsWith('es'),en=String(lang).startsWith('en');
  const tr=(ar,english,spanish)=>es?spanish:en?english:ar;
  if(!text||/failed to fetch|network request failed|networkerror|timeout|timed out|abort|internet|offline|load failed/i.test(text))return tr('الاتصال مش متاح دلوقتي. اتأكد من الإنترنت وجرب تاني.','Connection unavailable. Check your internet and try again.','No hay conexión. Revisa internet e inténtalo de nuevo.');
  if(/401|unauthorized|token expired|unauthenticated/i.test(text))return tr('سجل دخول علشان تكمل.','Sign in to continue.','Inicia sesión para continuar.');
  if(/403|forbidden|permission denied/i.test(text))return tr('مش مسموح لك تعمل الخطوة دي.','You do not have permission for this action.','No tienes permiso para esta acción.');
  if(/404|not found/i.test(text))return tr('المحتوى ده مش موجود حاليًا.','This item is not available.','Este elemento no está disponible.');
  if(/500|502|503|server error|internal error/i.test(text))return tr('الموقع مش قادر يكمّل دلوقتي. حاول بعد شوية.','The service is unavailable. Please try again shortly.','El servicio no está disponible. Inténtalo más tarde.');
  // Don't expose an unrecognized internal exception (or a raw server response).
  return tr('تعذر تنفيذ الطلب. جرب تاني.','Could not complete your request. Please try again.','No se pudo completar la acción. Vuelve a intentarlo.');
}
