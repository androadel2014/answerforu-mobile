// AnswerForU mobile 3.7.1 (tester item 4): the same 50 states + DC list and search as website v6.4.2.
export const US_STATE_NAMES = {
  AL:{en:'Alabama',ar:'ألاباما'}, AK:{en:'Alaska',ar:'ألاسكا'}, AZ:{en:'Arizona',ar:'أريزونا'}, AR:{en:'Arkansas',ar:'أركنساس'},
  CA:{en:'California',ar:'كاليفورنيا'}, CO:{en:'Colorado',ar:'كولورادو'}, CT:{en:'Connecticut',ar:'كونيتيكت'}, DE:{en:'Delaware',ar:'ديلاوير'},
  FL:{en:'Florida',ar:'فلوريدا'}, GA:{en:'Georgia',ar:'جورجيا'}, HI:{en:'Hawaii',ar:'هاواي'}, ID:{en:'Idaho',ar:'أيداهو'},
  IL:{en:'Illinois',ar:'إلينوي'}, IN:{en:'Indiana',ar:'إنديانا'}, IA:{en:'Iowa',ar:'آيوا'}, KS:{en:'Kansas',ar:'كانساس'},
  KY:{en:'Kentucky',ar:'كنتاكي'}, LA:{en:'Louisiana',ar:'لويزيانا'}, ME:{en:'Maine',ar:'مين'}, MD:{en:'Maryland',ar:'ماريلاند'},
  MA:{en:'Massachusetts',ar:'ماساتشوستس'}, MI:{en:'Michigan',ar:'ميشيغان'}, MN:{en:'Minnesota',ar:'مينيسوتا'}, MS:{en:'Mississippi',ar:'مسيسيبي'},
  MO:{en:'Missouri',ar:'ميزوري'}, MT:{en:'Montana',ar:'مونتانا'}, NE:{en:'Nebraska',ar:'نبراسكا'}, NV:{en:'Nevada',ar:'نيفادا'},
  NH:{en:'New Hampshire',ar:'نيوهامبشير'}, NJ:{en:'New Jersey',ar:'نيوجيرسي'}, NM:{en:'New Mexico',ar:'نيو مكسيكو'}, NY:{en:'New York',ar:'نيويورك'},
  NC:{en:'North Carolina',ar:'نورث كارولاينا'}, ND:{en:'North Dakota',ar:'نورث داكوتا'}, OH:{en:'Ohio',ar:'أوهايو'}, OK:{en:'Oklahoma',ar:'أوكلاهوما'},
  OR:{en:'Oregon',ar:'أوريغون'}, PA:{en:'Pennsylvania',ar:'بنسلفانيا'}, RI:{en:'Rhode Island',ar:'رود آيلاند'}, SC:{en:'South Carolina',ar:'ساوث كارولاينا'},
  SD:{en:'South Dakota',ar:'ساوث داكوتا'}, TN:{en:'Tennessee',ar:'تينيسي'}, TX:{en:'Texas',ar:'تكساس'}, UT:{en:'Utah',ar:'يوتا'},
  VT:{en:'Vermont',ar:'فيرمونت'}, VA:{en:'Virginia',ar:'فيرجينيا'}, WA:{en:'Washington',ar:'واشنطن'}, WV:{en:'West Virginia',ar:'ويست فيرجينيا'},
  WI:{en:'Wisconsin',ar:'ويسكونسن'}, WY:{en:'Wyoming',ar:'وايومنغ'}, DC:{en:'District of Columbia',ar:'مقاطعة كولومبيا'}
};

// v6.4.2 (tester item 4): Spanish names where they differ from English, so the
// searchable state picker reads naturally in all three site languages.
export const US_STATE_NAMES_ES = {
  HI:'Hawái', LA:'Luisiana', MI:'Míchigan', MS:'Misisipi', MO:'Misuri', NJ:'Nueva Jersey', NM:'Nuevo México', NY:'Nueva York',
  NC:'Carolina del Norte', ND:'Dakota del Norte', OR:'Oregón', PA:'Pensilvania', SC:'Carolina del Sur', SD:'Dakota del Sur',
  TN:'Tennessee', VA:'Virginia', WV:'Virginia Occidental', DC:'Distrito de Columbia', KS:'Kansas', AR:'Arkansas',
};

export function stateLabel(code, lang='en') {
  const rec = US_STATE_NAMES[code];
  if (!rec) return code || '';
  const l = String(lang || 'en').toLowerCase();
  if (l.startsWith('ar')) return rec.ar;
  if (l.startsWith('es')) return US_STATE_NAMES_ES[code] || rec.en;
  return rec.en;
}

// Common alternate Arabic spellings people type (search only).
const AR_ALIASES = {
  VA:['فرجينيا','فرجينا'], WV:['ويست فرجينيا','فرجينيا الغربية'], DC:['واشنطن العاصمة','واشنطن دي سي'], MI:['ميشيجان'], MD:['ميريلاند','مريلاند'],
  NC:['كارولاينا الشمالية','نورث كارولينا'], SC:['كارولاينا الجنوبية','ساوث كارولينا'], NJ:['نيو جيرسي'], NY:['نيو يورك'], NH:['نيو هامبشير'],
  PA:['بنسيلفانيا','بنسلفانيا'], TN:['تنيسي'], CT:['كونيتيكت','كونتيكت'], MA:['ماساتشوستس','ماسوتشوستس'], IL:['الينوي','إلينوى'], IA:['ايوا','أيوا'],
};

const normalizeSearch = (value) => String(value || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/\s+/g, ' ').trim();

/** All states + DC, sorted by the name shown in `lang`. */
export function stateOptions(lang='en') {
  const l = String(lang || 'en').toLowerCase().startsWith('ar') ? 'ar' : String(lang || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  return Object.keys(US_STATE_NAMES)
    .map((code) => ({ code, label: stateLabel(code, l), en: US_STATE_NAMES[code].en, ar: US_STATE_NAMES[code].ar, es: US_STATE_NAMES_ES[code] || US_STATE_NAMES[code].en }))
    .sort((a, b) => { try { return a.label.localeCompare(b.label, l); } catch { return a.label < b.label ? -1 : a.label > b.label ? 1 : 0; } });
}

/** Match by code ("va"), English, Arabic (any alef/ta-marbuta form) or Spanish name; code matches first. */
export function searchStates(query, lang='en') {
  const q = normalizeSearch(query);
  const all = stateOptions(lang);
  if (!q) return all;
  const exactCode = all.filter((o) => o.code.toLowerCase() === q);
  const names = (o) => [o.en, o.ar, o.es, o.code, ...(AR_ALIASES[o.code] || [])];
  const rest = all.filter((o) => o.code.toLowerCase() !== q && names(o).some((name) => normalizeSearch(name).includes(q)));
  const starts = rest.filter((o) => names(o).some((name) => normalizeSearch(name).startsWith(q)));
  const contains = rest.filter((o) => !starts.includes(o));
  return [...exactCode, ...starts, ...contains];
}
