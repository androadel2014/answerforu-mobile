const L = (ar, en, es) => ({ ar, en, es });

export const STORE_GROUPS = [
  {
    id: "home",
    title: "البيت والصيانة",
    subtitle: "لمبات، عدة، دهانات، سباكة، أدوات وإصلاحات البيت",
    keywords: ["لمبات", "عدة", "صيانة", "بيت", "خشب", "دهان"],
    stores: [
      { name: "The Home Depot", why: "مواد وأدوات تحسين وصيانة المنزل، كهرباء، سباكة، دهانات وخشب.", url: "https://www.homedepot.com/", tags:["لمبات","عدة","بيت","صيانة","أدوات"], bestFor:"أدوات وصيانة البيت" },
      { name: "Lowe's", why: "بديل كبير لـHome Depot لأدوات البيت والصيانة والأجهزة.", url: "https://www.lowes.com/", tags:["لمبات","أجهزة","بيت","صيانة"], bestFor:"بديل ممتاز لصيانة البيت" },
      { name: "Harbor Freight", why: "عدة وأدوات بأسعار اقتصادية مقارنةً بمحلات أدوات كثيرة.", url: "https://www.harborfreight.com/", tags:["عدة","أدوات","اقتصادي"], bestFor:"عدة بسعر أقل" },
      { name: "IKEA", why: "أثاث، تخزين، أدوات منزلية وحلول عملية للشقق والغرف.", url: "https://www.ikea.com/us/en/", tags:["عفش","أثاث","بيت","تخزين"], bestFor:"تأثيث الشقة" },
    ],
  },
  {
    id: "general",
    title: "كل حاجة تقريبًا",
    subtitle: "احتياجات يومية، بيت، إلكترونيات بسيطة، أكل وملابس",
    keywords:["كل حاجة","سوبرماركت","احتياجات","عام"],
    stores: [
      { name: "Walmart", why: "سوبرماركت ومتجر شامل بأسعار متنوعة واحتياجات يومية كثيرة.", url: "https://www.walmart.com/", tags:["أكل","هدوم","ملابس","بيت","احتياجات يومية"], bestFor:"أرخص وأسهل بداية لكثير من الناس" },
      { name: "Target", why: "احتياجات البيت، ملابس، إلكترونيات بسيطة، عناية شخصية وأكل.", url: "https://www.target.com/", tags:["هدوم","ملابس","بيت","عناية شخصية","أكل"], bestFor:"منتجات مرتبة وتجربة أهدى" },
      { name: "Costco", why: "شراء كميات كبيرة بنظام عضوية؛ مناسب لبعض الأسر والمشتريات بالجملة.", url: "https://www.costco.com/", tags:["جملة","أكل","عضوية","بيت"], bestFor:"مشتريات بالجملة", membership:"Membership required · تقريبًا $65–$130/year" },
      { name: "Sam's Club", why: "نادي بيع بالجملة بنظام عضوية شبيه بفكرة Costco.", url: "https://www.samsclub.com/", tags:["جملة","عضوية","أكل","بيت"], bestFor:"شراء بالجملة", membership:"Membership required · تقريبًا $60–$120/year" },
    ],
  },
  {
    id: "clothes",
    title: "ملابس وأحذية بأسعار مخفضة",
    subtitle: "هدوم، جاكيتات، أحذية، شنط وإكسسوارات بنظام off-price",
    keywords:["هدوم","لبس","ملابس","أحذية","جاكيتات","شنط"],
    stores: [
      { name: "Burlington", why: "ملابس وأحذية ومنتجات منزلية بأسعار مخفضة ومتغيرة حسب الفرع.", url: "https://www.burlington.com/", tags:["هدوم","لبس","أحذية","شنط"], bestFor:"خصومات قوية على الملابس" },
      { name: "Ross Dress for Less", why: "ملابس وأحذية ومنتجات منزلية بنظام off-price.", url: "https://www.rossstores.com/", tags:["هدوم","لبس","أحذية","ديكور"], bestFor:"خصومات يومية" },
      { name: "Marshalls", why: "ملابس وإكسسوارات ومنتجات منزلية بأسعار مخفضة.", url: "https://www.marshalls.com/", tags:["هدوم","ملابس","إكسسوارات","بيت"], bestFor:"ماركات مخفضة" },
      { name: "TJ Maxx", why: "ماركات وملابس ومنتجات منزلية بأسعار off-price.", url: "https://tjmaxx.tjx.com/", tags:["هدوم","ملابس","ماركات","شنط"], bestFor:"ملابس ومستلزمات متنوعة" },
      { name: "Old Navy", why: "ملابس أساسية للعائلة كلها غالبًا بأسعار معقولة وعروض متكررة.", url: "https://oldnavy.gap.com/", tags:["هدوم","ملابس","أطفال","عائلة"], bestFor:"Basics للعائلة" },
      { name: "Macy's", why: "متجر Department Store معروف للملابس والأحذية والبيت والعطور.", url: "https://www.macys.com/", tags:["هدوم","أحذية","عطور","بيت"], bestFor:"خيارات أوسع وماركات أكثر" },
    ],
  },
  {
    id: "grocery",
    title: "سوبرماركت وأكل",
    subtitle: "اختيارات مختلفة حسب السعر والمنطقة",
    keywords:["أكل","سوبرماركت","خضار","بقالة"],
    stores: [
      { name: "ALDI", why: "سوبرماركت اقتصادي بتشكيلة مركزة وأسعار منافسة في مناطق كثيرة.", url: "https://www.aldi.us/", tags:["أكل","اقتصادي","بقالة"], bestFor:"توفير في البقالة" },
      { name: "Lidl", why: "سوبرماركت اقتصادي موجود في ولايات/مناطق محددة.", url: "https://www.lidl.com/", tags:["أكل","اقتصادي","بقالة"], bestFor:"خصومات وبقالة" },
      { name: "Trader Joe's", why: "منتجات خاصة بالمتجر وأطعمة جاهزة وسناكس مشهورة.", url: "https://www.traderjoes.com/", tags:["أكل","سناكس","أطعمة جاهزة"], bestFor:"منتجات خاصة ومجمدة" },
      { name: "Whole Foods Market", why: "سوبرماركت يركز على منتجات طبيعية/عضوية وفئات سعرية أعلى نسبيًا.", url: "https://www.wholefoodsmarket.com/", tags:["أكل","عضوي","سوبرماركت"], bestFor:"خيارات طبيعية/عضوية" },
      { name: "Kroger", why: "سلسلة بقالة كبيرة تحت أسماء مختلفة حسب الولاية/المنطقة.", url: "https://www.kroger.com/", tags:["أكل","بقالة","صيدلية أحيانًا"], bestFor:"بقالة متكاملة" },
    ],
  },
  {
    id: "pharmacy",
    title: "صيدلية واحتياجات سريعة",
    subtitle: "أدوية OTC، وصفات، صور وبعض الاحتياجات اليومية",
    keywords:["صيدلية","دواء","أدوية","احتياجات سريعة"],
    stores: [
      { name: "CVS", why: "صيدلية ووصفات طبية وأدوية OTC واحتياجات يومية.", url: "https://www.cvs.com/", tags:["صيدلية","دواء","لقاحات"], bestFor:"صيدلية قريبة في مناطق كثيرة" },
      { name: "Walgreens", why: "صيدلية ووصفات وأدوية OTC ومنتجات عناية شخصية.", url: "https://www.walgreens.com/", tags:["صيدلية","دواء","صور"], bestFor:"أدوية وصور سريعة" },
    ],
  },
  {
    id: "tech",
    title: "إلكترونيات وموبايلات",
    subtitle: "موبايلات، لابتوبات، إكسسوارات وأجهزة",
    keywords:["إلكترونيات","موبايل","لاب","سماعات"],
    stores: [
      { name: "Best Buy", why: "إلكترونيات كبيرة وصغيرة، موبايلات، لابتوبات، تلفزيونات وإكسسوارات.", url: "https://www.bestbuy.com/", tags:["إلكترونيات","موبايل","كمبيوتر"], bestFor:"شراء إلكترونيات" },
      { name: "Apple Store", why: "منتجات Apple الرسمية والدعم والخدمة والإصلاح.", url: "https://www.apple.com/retail/", tags:["iphone","mac","apple"], bestFor:"منتجات Apple" },
      { name: "Micro Center", why: "متميز في الكمبيوترات والقطع والتجميع والإكسسوارات التقنية.", url: "https://www.microcenter.com/", tags:["كمبيوتر","قطع","تقنية"], bestFor:"الكمبيوتر وقطع الغيار" },
    ],
  },
  {
    id: "foodchains",
    title: "أماكن أكل مشهورة",
    subtitle: "أسامي هتسمعها كتير للأكل السريع والقهوة",
    keywords:["أكل","مطاعم","فطار","قهوة","برجر"],
    stores: [
      { name: "McDonald's", why: "واحدة من أشهر سلاسل الوجبات السريعة للبرجر والفطار والقهوة.", url: "https://www.mcdonalds.com/", tags:["برجر","فطار","أكل سريع"], bestFor:"أكل سريع معروف" },
      { name: "Chick-fil-A", why: "سلسلة مشهورة بساندويتشات الدجاج والخدمة السريعة.", url: "https://www.chick-fil-a.com/", tags:["دجاج","أكل سريع"], bestFor:"وجبات دجاج" },
      { name: "Chipotle", why: "وجبات بطابع Mexican-style زي burritos و bowls.", url: "https://www.chipotle.com/", tags:["burrito","mexican","bowls"], bestFor:"وجبة أسرع لكن مختلفة" },
      { name: "Starbucks", why: "قهوة ومشروبات وسناكس، واسم هتشوفه في كل مكان تقريبًا.", url: "https://www.starbucks.com/", tags:["قهوة","مشروبات"], bestFor:"قهوة ومكان سريع" },
      { name: "Dunkin'", why: "قهوة، دونات، وبعض ساندويتشات الفطار.", url: "https://www.dunkindonuts.com/", tags:["قهوة","دونات","فطار"], bestFor:"فطار سريع" },
    ],
  },
];

export const STORE_TOPIC_CHIPS = [
  ["all","الكل"],
  ["هدوم","ملابس"],
  ["أكل","أكل"],
  ["بيت","البيت"],
  ["إلكترونيات","إلكترونيات"],
  ["صيدلية","صيدلية"],
  ["عضوية","عضوية"],
];

export const SERVICE_PLACES = [
  { name: "Public Library", icon: "library", what: L("كتب وWi-Fi وكمبيوتر ودراسة وأحيانًا طباعة ومسح.", "Books, Wi-Fi, computers, study space and sometimes printing and scanning.", "Libros, Wi-Fi, computadoras, espacios de estudio y a veces impresión y escaneo."), tip: L("اعمل Library Card واسأل عن الطباعة والمسح وغرف الاجتماعات وموارد ESL.", "Get a local library card and ask about printing, scanning, meeting rooms and ESL resources.", "Obtenga una tarjeta local y pregunte por impresión, escaneo, salas y recursos de ESL."), url: "" },
  { name: "USPS / Post Office", icon: "mail", what: L("إرسال واستلام بريد وطرود وPO Box وخدمات بريدية.", "Send and receive mail and packages, use a PO Box and access postal services.", "Envíe y reciba correo y paquetes, use un PO Box y servicios postales."), tip: L("احتفظ برقم التتبع عند إرسال مستندات مهمة.", "Keep the tracking number when mailing important documents.", "Guarde el número de seguimiento al enviar documentos importantes."), url: "https://www.usps.com/" },
  { name: "FedEx Office", icon: "print", what: L("طباعة ونسخ ومسح وشحن في فروع كثيرة.", "Printing, copying, scanning and shipping at many locations.", "Impresión, copias, escaneo y envíos en muchas ubicaciones."), tip: L("مفيد لطباعة مستند بسرعة خارج البيت.", "Useful when you need to print a document away from home.", "Útil para imprimir rápidamente fuera de casa."), url: "https://www.office.fedex.com/" },
  { name: "The UPS Store", icon: "box", what: L("شحن وطباعة وخدمات صناديق بريد في فروع مستقلة.", "Shipping, printing and mailbox services at independently operated locations.", "Envíos, impresión y buzones en locales independientes."), tip: L("الأسعار والخدمات قد تختلف حسب الفرع.", "Prices and services may vary by location.", "Los precios y servicios pueden variar según el local."), url: "https://www.theupsstore.com/" },
  { name: "Staples", icon: "print", what: L("مستلزمات مكتب وخدمات طباعة وتسويق.", "Office supplies plus printing and marketing services.", "Artículos de oficina y servicios de impresión y marketing."), tip: L("مفيد للـrésumé والنسخ والطباعة الملونة.", "Useful for résumés, copies and color printing.", "Útil para currículums, copias e impresión en color."), url: "https://www.staples.com/" },
  { name: "DMV / State Motor Agency", icon: "car", what: L("رخصة وState ID وتسجيل السيارة وخدمات القيادة حسب الولاية.", "Driver licenses, state IDs, vehicle registration and other state driving services.", "Licencias, State ID, registro de vehículos y otros servicios estatales."), tip: L("الاسم مش DMV في كل ولاية؛ استخدم دليل AnswerForU الخاص بولايتك.", "The agency is not called DMV in every state; use the AnswerForU state guide.", "La agencia no se llama DMV en todos los estados; use la guía estatal de AnswerForU."), url: "/roadmap" },
];
