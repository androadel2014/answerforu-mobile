import * as Speech from 'expo-speech';
// AnswerForU mobile 3.7.2 (device-test prep, audio): the app speaks English (en-US) through the
// phone's own text-to-speech engine. Some phones (e.g. without Google services) ship an engine with
// no English voice, and then "Listen" stays silent with no explanation. This check never raises a
// false alarm: an engine that does not report its voices counts as "unknown", not "missing".
let voices = null;
export async function hasVoiceFor(prefix = 'en') {
  if (voices === null) {
    try { voices = await Speech.getAvailableVoicesAsync(); } catch { voices = []; }
  }
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const want = String(prefix).toLowerCase();
  return voices.some((v) => String(v?.language || '').toLowerCase().replace('_', '-').startsWith(want));
}
