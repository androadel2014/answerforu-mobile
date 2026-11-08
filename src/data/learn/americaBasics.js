const stopPhoto = require("../../../assets/learn/signs/stop-photo.png");
const yieldPhoto = require("../../../assets/learn/signs/yield-photo.png");
const speed35Photo = require("../../../assets/learn/signs/speedlimit35.png");
const doNotEnterPhoto = require("../../../assets/learn/signs/donotenter-photo.png");
const oneWayPhoto = require("../../../assets/learn/signs/oneway.png");

const signGraphic = (fileName, width = 260) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
const L = (ar, en, es) => ({ ar, en, es });
export const pickLearnText = (value, lang = "en") => value && typeof value === "object" && !Array.isArray(value) ? (value[lang] || value.en || value.ar || "") : (value || "");

export const CURRENCY_ITEMS = [
  {
    id: "penny",
    kind: "coin",
    name: "Penny",
    value: "1¢",
    note: "One cent",
    front: "https://www.usmint.gov/content/dam/usmint/coins/circulating-coins/2025-lincoln-penny-uncirculated-obverse-denver.jpg",
    back: "https://www.usmint.gov/content/dam/usmint/coins/circulating-coins/2025-lincoln-penny-uncirculated-reverse.jpg",
    source: "https://www.usmint.gov/learn/coins-and-medals/circulating-coins/penny",
    caption: L("أصغر قيمة معدنية شائعة: سنت واحد.", "The smallest common coin value: one cent.", "La moneda común de menor valor: un centavo."),
  },
  {
    id: "nickel",
    kind: "coin",
    name: "Nickel",
    value: "5¢",
    note: "Five cents",
    front: "https://www.usmint.gov/content/dam/usmint/coins/circulating-coins/2025-jefferson-nickel-uncirculated-obverse-denver.jpg",
    back: "https://www.usmint.gov/content/dam/usmint/coins/circulating-coins/2025-jefferson-nickel-uncirculated-reverse.jpg",
    source: "https://www.usmint.gov/learn/coins-and-medals/circulating-coins/nickel",
    caption: L("خمسة سنت. حجمه أكبر من الـDime رغم إن قيمته أقل.", "Five cents. It is larger than a dime even though it is worth less.", "Cinco centavos. Es más grande que un dime aunque vale menos."),
  },
  {
    id: "dime",
    kind: "coin",
    name: "Dime",
    value: "10¢",
    note: "Ten cents",
    front: "https://www.usmint.gov/content/dam/usmint/coins/circulating-coins/2025-roosevelt-dime-uncirculated-obverse-denver.jpg",
    back: "https://www.usmint.gov/content/dam/usmint/coins/circulating-coins/2025-roosevelt-dime-uncirculated-reverse.jpg",
    source: "https://www.usmint.gov/learn/coins-and-medals/circulating-coins/dime",
    caption: L("عشرة سنت. من أصغر العملات المعدنية حجمًا.", "Ten cents. One of the smallest U.S. coins by size.", "Diez centavos. Es una de las monedas más pequeñas por tamaño."),
  },
  {
    id: "quarter",
    kind: "coin",
    name: "Quarter",
    value: "25¢",
    note: "Four quarters = $1",
    front: "https://www.usmint.gov/content/dam/usmint/coins/american-women-quarters/2025-american-women-quarters-coin-uncirculated-obverse-denver.jpg",
    back: "https://www.usmint.gov/content/dam/usmint/coins/american-women-quarters/2025-american-women-quarters-coin-ida-wells-uncirculated-reverse.jpg",
    source: "https://www.usmint.gov/learn/coins-and-medals/circulating-coins/quarter",
    caption: L("25 سنت. ظهر الـQuarter بيتغير حسب البرنامج والسنة؛ الصورة مثال رسمي حديث.", "Twenty-five cents. Quarter reverses vary by year and program; this is a recent official example.", "Veinticinco centavos. El reverso cambia según el año y el programa; este es un ejemplo oficial reciente."),
  },
  {
    id: "half-dollar",
    kind: "coin",
    name: "Half Dollar",
    value: "50¢",
    note: "Fifty cents",
    front: "https://www.usmint.gov/content/dam/usmint/image-library/coins/2026/SemiQ-Half-Dollar-Obverse-Unc-D.jpg",
    back: "https://www.usmint.gov/content/dam/usmint/image-library/coins/2026/SemiQ-Half-Dollar-Reverse-Unc.jpg",
    source: "https://www.usmint.gov/learn/coins-and-medals/circulating-coins",
    caption: L("50 سنت. قانوني لكنه أقل شيوعًا في التعامل اليومي من Quarter/Dime/Nickel/Penny.", "Fifty cents. Legal tender, but less common in daily use than quarters, dimes, nickels and pennies.", "Cincuenta centavos. Es legal, pero menos común que quarters, dimes, nickels y pennies."),
    lessCommon: true,
  },
  {
    id: "bill-1",
    kind: "bill",
    name: "$1 bill",
    value: "$1",
    note: "George Washington",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/1_1963-present-front-1_0.jpg.jpg?itok=4Y3M6xCA",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/1_1963-present-back.jpg.jpg?itok=n66njH2q",
    source: "https://www.uscurrency.gov/denominations/1",
    caption: L("واحد دولار. الصورة الرسمية عليها SPECIMEN لأغراض التعليم.", "One dollar. The official educational image is marked SPECIMEN.", "Un dólar. La imagen educativa oficial lleva la marca SPECIMEN."),
  },
  {
    id: "bill-2",
    kind: "bill",
    name: "$2 bill",
    value: "$2",
    note: "Thomas Jefferson",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/2_1976-present-front%20%281%29.jpg.jpg?itok=V0CwcpFo",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/2_1976-present-back.jpg.jpg?itok=f3pKoM59",
    source: "https://www.uscurrency.gov/denominations/2",
    caption: L("ورقة دولارين قانونية لكنها أقل تداولًا من باقي الفئات.", "The two-dollar bill is legal tender but circulates less often than other denominations.", "El billete de dos dólares es legal, pero circula menos que otras denominaciones."),
    lessCommon: true,
  },
  {
    id: "bill-5",
    kind: "bill",
    name: "$5 bill",
    value: "$5",
    note: "Abraham Lincoln",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/%245-FRN-2021-face.png.jpg?itok=RcxNac5p",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/5_2008-present-back.jpg.jpg?itok=q7f8yxgd",
    source: "https://www.uscurrency.gov/denominations/5",
    caption: L("خمسة دولار. Lincoln على الوجه وLincoln Memorial على الظهر.", "Five dollars. Lincoln is on the front and the Lincoln Memorial is on the back.", "Cinco dólares. Lincoln aparece al frente y el Lincoln Memorial al reverso."),
  },
  {
    id: "bill-10",
    kind: "bill",
    name: "$10 bill",
    value: "$10",
    note: "Alexander Hamilton",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/10_2006-present-front-v2.1-jpg.jpg.jpg?itok=V3yT8Jl8",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/10_2006-present-back-v2.1.jpg.jpg?itok=DBxy7Xip",
    source: "https://www.uscurrency.gov/denominations/10",
    caption: L("عشرة دولار. Hamilton على الوجه وU.S. Treasury Building على الظهر.", "Ten dollars. Hamilton is on the front and the U.S. Treasury Building is on the back.", "Diez dólares. Hamilton aparece al frente y el edificio del Tesoro al reverso."),
  },
  {
    id: "bill-20",
    kind: "bill",
    name: "$20 bill",
    value: "$20",
    note: "Andrew Jackson",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/20_2003-present-front.jpg.jpg?itok=GcGWp1CN",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/20_2003-present-back.jpg.jpg?itok=Cr8qp8y8",
    source: "https://www.uscurrency.gov/denominations/20",
    caption: L("عشرين دولار. Jackson على الوجه والبيت الأبيض على الظهر.", "Twenty dollars. Jackson is on the front and the White House is on the back.", "Veinte dólares. Jackson aparece al frente y la Casa Blanca al reverso."),
  },
  {
    id: "bill-50",
    kind: "bill",
    name: "$50 bill",
    value: "$50",
    note: "Ulysses S. Grant",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/50-front-2004-present.jpg.jpg?itok=Uwr4DWQf",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/50-back-2004-present.jpg.jpg?itok=1O2AbbBY",
    source: "https://www.uscurrency.gov/denominations/50",
    caption: L("خمسين دولار. Grant على الوجه ومبنى U.S. Capitol على الظهر.", "Fifty dollars. Grant is on the front and the U.S. Capitol is on the back.", "Cincuenta dólares. Grant aparece al frente y el Capitolio al reverso."),
  },
  {
    id: "bill-100",
    kind: "bill",
    name: "$100 bill",
    value: "$100",
    note: "Benjamin Franklin",
    front: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/100-front-2013-present.jpg.jpg?itok=tVYD2VJT",
    back: "https://www.uscurrency.gov/sites/default/files/styles/bill_version/public/denominations/100-back-2013-present.jpg.jpg?itok=YbrfkL4e",
    source: "https://www.uscurrency.gov/denominations/100",
    caption: L("مئة دولار. Franklin على الوجه وIndependence Hall على الظهر.", "One hundred dollars. Franklin is on the front and Independence Hall is on the back.", "Cien dólares. Franklin aparece al frente e Independence Hall al reverso."),
  },
];

export const MONEY_ITEMS = CURRENCY_ITEMS;

export const ROAD_SIGNS = [
  { id: "stop", code: "R1-1", family: "regulatory", name: "STOP", meaning: L("توقف توقفًا كاملًا ثم تحرك عندما يكون الطريق آمنًا.", "Come to a complete stop, then proceed when the road is safe.", "Deténgase por completo y avance cuando sea seguro."), shape: "octagon", label: "STOP", color: "red", memory: L("قف تمامًا", "Full stop", "Alto completo"), image: stopPhoto, imageKind: "photo" },
  { id: "yield", code: "R1-2", family: "regulatory", name: "YIELD", meaning: L("اهدأ وأعطِ الأولوية للسيارات أو المشاة عند الحاجة.", "Slow down and yield to vehicles or pedestrians when needed.", "Reduzca la velocidad y ceda el paso cuando sea necesario."), shape: "triangle", label: "YIELD", color: "red", memory: L("ادّي الأولوية", "Give right of way", "Ceda el paso"), image: yieldPhoto, imageKind: "photo" },
  { id: "speed", code: "R2-1", family: "regulatory", name: "Speed Limit", meaning: L("الحد الأقصى القانوني للسرعة في الظروف العادية.", "The maximum legal speed under normal conditions.", "La velocidad máxima legal en condiciones normales."), shape: "rectangle", label: "SPEED\nLIMIT\n35", color: "white", memory: L("الرقم = أقصى سرعة", "Number = maximum speed", "Número = velocidad máxima"), image: speed35Photo, imageKind: "photo" },
  { id: "oneway", code: "R6-1R", family: "guide", name: "ONE WAY", meaning: L("الشارع يسمح بالحركة في اتجاه واحد فقط.", "Traffic may move in only one direction.", "El tránsito va en una sola dirección."), shape: "rectangle", label: "ONE WAY →", color: "black", memory: L("اتجاه واحد", "One direction", "Una dirección"), image: oneWayPhoto, imageKind: "photo" },
  { id: "noentry", code: "R5-1", family: "regulatory", name: "DO NOT ENTER", meaning: L("ممنوع دخول هذا الاتجاه.", "Do not enter from this direction.", "No entre desde esta dirección."), shape: "circle", label: "DO NOT\nENTER", color: "red", memory: L("ممنوع تدخل", "Do not enter", "No entrar"), image: doNotEnterPhoto, imageKind: "photo" },
  { id: "wrongway", code: "R5-1a", family: "regulatory", name: "WRONG WAY", meaning: L("أنت متجه في الاتجاه الخاطئ بالنسبة لحركة الطريق.", "You are traveling against the permitted traffic direction.", "Va en sentido contrario al tránsito permitido."), shape: "rectangle", label: "WRONG WAY", color: "red", memory: L("ارجع وصحح اتجاهك", "Stop and correct direction", "Deténgase y cambie de dirección"), image: signGraphic("US road sign R5-1a.svg") },
  { id: "norightred", code: "R10-11a", family: "regulatory", name: "NO TURN ON RED", meaning: L("لا تلف أثناء الإشارة الحمراء في هذا المكان.", "Do not turn while the signal is red at this location.", "No gire con la señal en rojo en este lugar."), shape: "rectangle", label: "NO TURN\nON RED", color: "white", memory: L("لا تلف على الأحمر", "No turn on red", "No girar en rojo"), image: signGraphic("US road sign R10-11a.svg") },
  { id: "nouturn", code: "R3-4", family: "regulatory", name: "NO U-TURN", meaning: L("ممنوع عمل U-turn في هذا المكان.", "U-turns are prohibited here.", "Está prohibido hacer un giro en U."), shape: "rectangle", label: "NO\nU-TURN", color: "white", memory: L("ممنوع ترجع بالعكس", "No U-turn", "No giro en U"), image: signGraphic("US road sign R3-4.svg") },
  { id: "noparking", code: "R8-3", family: "regulatory", name: "NO PARKING", meaning: L("ممنوع ركن السيارة في المكان المحدد.", "Parking is prohibited in the marked area.", "Está prohibido estacionar en el área indicada."), shape: "rectangle", label: "NO\nPARKING", color: "white", memory: L("ما تركنش هنا", "Do not park here", "No estacione aquí"), image: signGraphic("US road sign R8-3.svg") },
  { id: "leftonly", code: "R3-5L", family: "regulatory", name: "LEFT TURN ONLY", meaning: L("الحارة مخصصة لليسار فقط.", "This lane is for left turns only.", "Este carril es solo para girar a la izquierda."), shape: "rectangle", label: "LEFT TURN\nONLY", color: "white", memory: L("الحارة لليسار فقط", "Left only", "Solo izquierda"), image: signGraphic("US road sign R3-5L.svg") },
  { id: "school", code: "S1-1", family: "school", name: "School Crossing", meaning: L("منطقة مدرسة أو عبور طلاب. خفّف السرعة وانتبه للمشاة.", "School area or student crossing. Slow down and watch for pedestrians.", "Zona escolar o cruce de estudiantes. Reduzca la velocidad."), shape: "diamond", label: "SCHOOL", color: "yellow", memory: L("هدّي السرعة", "Slow down", "Reduzca la velocidad"), image: signGraphic("US road sign S1-1.svg") },
  { id: "ped", code: "W11-2", family: "warning", name: "Pedestrian Crossing", meaning: L("منطقة عبور مشاة. كن مستعدًا للتوقف.", "Pedestrian crossing area. Be ready to stop.", "Cruce peatonal. Prepárese para detenerse."), shape: "diamond", label: "PED\nXING", color: "yellow", memory: L("ممكن حد يعدي", "People may cross", "Pueden cruzar peatones"), image: signGraphic("US road sign W11-2.svg") },
  { id: "merge", code: "W4-1", family: "warning", name: "MERGE", meaning: L("حركة مرور ستندمج مع مسارك؛ اضبط السرعة والمسافة.", "Traffic will merge with your lane; adjust speed and spacing.", "El tránsito se incorporará a su carril; ajuste velocidad y distancia."), shape: "diamond", label: "MERGE", color: "yellow", memory: L("طريق بيندمج معاك", "Merging traffic", "Tránsito se incorpora"), image: signGraphic("US road sign W4-1.svg") },
  { id: "laneends", code: "W4-2R", family: "warning", name: "RIGHT LANE ENDS", meaning: L("الحارة اليمنى ستنتهي؛ غيّر مسارك بأمان إذا لزم.", "The right lane ends; merge safely when needed.", "El carril derecho termina; incorpórese con seguridad."), shape: "diamond", label: "RIGHT LANE\nENDS", color: "yellow", memory: L("الحارة هتنتهي", "Lane ends", "El carril termina"), image: signGraphic("US road sign W4-2R.svg") },
  { id: "stopahead", code: "W3-1", family: "warning", name: "STOP AHEAD", meaning: L("استعد لأن هناك إشارة STOP قادمة.", "Prepare for a STOP sign ahead.", "Prepárese para una señal STOP más adelante."), shape: "diamond", label: "STOP\nAHEAD", color: "yellow", memory: L("جهز نفسك للتوقف", "Prepare to stop", "Prepárese para parar"), image: signGraphic("US road sign W3-1.svg") },
  { id: "signalahead", code: "W3-3", family: "warning", name: "SIGNAL AHEAD", meaning: L("هناك إشارة مرور قادمة قد تحتاج للتوقف عندها.", "A traffic signal is ahead; you may need to stop.", "Hay un semáforo más adelante; quizá deba detenerse."), shape: "diamond", label: "SIGNAL\nAHEAD", color: "yellow", memory: L("إشارة قدام", "Signal ahead", "Semáforo adelante"), image: signGraphic("US_road_sign_W3-3.svg") },
  { id: "deer", code: "W11-3", family: "warning", name: "Deer Crossing", meaning: L("قد تعبر غزلان في المنطقة؛ انتبه خاصة ليلًا.", "Deer may cross here; be especially alert at night.", "Pueden cruzar venados; esté atento, especialmente de noche."), shape: "diamond", label: "DEER", color: "yellow", memory: L("خلي بالك من الحيوانات", "Watch for animals", "Cuidado con animales"), image: signGraphic("US road sign W11-3.svg") },
  { id: "slippery", code: "W8-5", family: "warning", name: "Slippery When Wet", meaning: L("الطريق قد يكون زلقًا عندما يبتل.", "The road may be slippery when wet.", "La carretera puede estar resbaladiza cuando está mojada."), shape: "diamond", label: "SLIPPERY\nWHEN WET", color: "yellow", memory: L("اهدى لو مطر", "Slow down in rain", "Reduzca la velocidad con lluvia"), image: signGraphic("US road sign W8-5.svg") },
  { id: "hill", code: "W7-5", family: "warning", name: "Steep Hill", meaning: L("منحدر قوي للأمام؛ تحكم في السرعة.", "A steep grade is ahead; control your speed.", "Hay una pendiente pronunciada; controle la velocidad."), shape: "diamond", label: "STEEP\nGRADE", color: "yellow", memory: L("نزلة قوية", "Steep grade", "Pendiente fuerte"), image: signGraphic("US road sign W7-5.svg") },
  { id: "deadend", code: "W14-1", family: "warning", name: "DEAD END", meaning: L("الطريق ينتهي ولا يكمل للأمام.", "The road ends and does not continue through.", "La vía termina y no continúa."), shape: "diamond", label: "DEAD\nEND", color: "yellow", memory: L("الطريق مقفول لقدام", "Road ends", "La vía termina"), image: signGraphic("US road sign W14-1.svg") },
  { id: "roundabout", code: "W2-6", family: "warning", name: "Roundabout", meaning: L("دوار قادم؛ خفف السرعة وأعطِ الأولوية حسب اللافتات.", "A roundabout is ahead; slow down and yield as posted.", "Hay una rotonda; reduzca la velocidad y ceda el paso."), shape: "diamond", label: "ROUNDABOUT", color: "yellow", memory: L("دوار قدام", "Roundabout ahead", "Rotonda adelante"), image: signGraphic("US road sign W2-6.svg") },
  { id: "rail", code: "R15-1", family: "warning", name: "Railroad Crossing", meaning: L("معبر سكة حديد. انتبه ولا تتوقف فوق القضبان.", "Railroad crossing. Watch signals and never stop on the tracks.", "Cruce ferroviario. Observe las señales y no se detenga sobre las vías."), shape: "round", label: "R R", color: "yellow", memory: L("سكة حديد", "Railroad", "Ferrocarril"), image: signGraphic("US road sign R15-1.svg") },
];

export const ROAD_SIGN_GROUPS = [
  ["all", L("الكل", "All", "Todas")],
  ["regulatory", L("أوامر ومنع", "Regulatory", "Reglamentarias")],
  ["warning", L("تحذير", "Warning", "Advertencia")],
  ["guide", L("إرشاد", "Guide", "Guía")],
  ["school", L("مدارس", "School", "Escuela")],
];

export const CONVERSIONS = [
  { id: "weight", from: "kg", to: "lb", factor: 2.2046226218, label: L("كيلوجرام ↔ باوند", "Kilograms ↔ pounds", "Kilogramos ↔ libras"), example: "23 kg ≈ 50.7 lb" },
  { id: "distance", from: "km", to: "mile", factor: 0.621371, label: L("كيلومتر ↔ ميل", "Kilometers ↔ miles", "Kilómetros ↔ millas"), example: "10 km ≈ 6.2 mi" },
  { id: "length", from: "cm", to: "inch", factor: 0.3937008, label: L("سنتيمتر ↔ إنش", "Centimeters ↔ inches", "Centímetros ↔ pulgadas"), example: "30 cm ≈ 11.8 in" },
  { id: "volume", from: "liter", to: "gallon", factor: 0.264172, label: L("لتر ↔ جالون", "Liters ↔ gallons", "Litros ↔ galones"), example: "3.785 L ≈ 1 gal" },
  { id: "temperature", from: "°C", to: "°F", factor: null, label: L("سيلزيوس ↔ فهرنهايت", "Celsius ↔ Fahrenheit", "Celsius ↔ Fahrenheit"), example: "20°C = 68°F" },
];

const moneyQuestions = [
  { id: "q-money-1", category: "money", q: L("اسم العملة اللي في الصورة دي إيه؟", "Which coin is shown?", "¿Qué moneda aparece?"), image: CURRENCY_ITEMS[3].front, imageAlt: "Quarter coin front", options: L(["Nickel", "Quarter", "Dime"], ["Nickel", "Quarter", "Dime"], ["Nickel", "Quarter", "Dime"]), answer: 1, why: L("دي Quarter = 25¢. أربع Quarters = $1.", "A quarter is 25¢. Four quarters equal $1.", "Un quarter vale 25¢. Cuatro quarters equivalen a $1.") },
  { id: "q-money-2", category: "money", q: L("دي أي ناحية من الـPenny؟", "Which side of the penny is this?", "¿Qué lado del penny es este?"), image: CURRENCY_ITEMS[0].back, imageAlt: "Penny reverse", options: L(["الوجه / Heads", "الظهر / Tails", "دي Dime"], ["Front / heads", "Back / tails", "It is a dime"], ["Frente / heads", "Reverso / tails", "Es un dime"]), answer: 1, why: L("ده ظهر الـPenny.", "This is the back, or reverse, of the penny.", "Este es el reverso del penny.") },
  { id: "q-money-3", category: "money", q: L("الورقة دي قيمتها كام؟", "What is this bill worth?", "¿Cuánto vale este billete?"), image: CURRENCY_ITEMS.find((x) => x.id === "bill-20")?.front, imageAlt: "$20 front", options: L(["$10", "$20", "$50"], ["$10", "$20", "$50"], ["$10", "$20", "$50"]), answer: 1, why: L("دي ورقة $20.", "This is a $20 bill.", "Este es un billete de $20.") },
  { id: "q-money-4", category: "money", q: L("إيه العملة اللي تساوي 10¢؟", "Which coin is worth 10¢?", "¿Qué moneda vale 10¢?"), options: L(["Nickel", "Dime", "Quarter"], ["Nickel", "Dime", "Quarter"], ["Nickel", "Dime", "Quarter"]), answer: 1, why: L("Dime = 10¢.", "A dime equals 10¢.", "Un dime equivale a 10¢.") },
  { id: "q-money-5", category: "money", q: L("4 Quarters يساووا كام؟", "How much are four quarters worth?", "¿Cuánto valen cuatro quarters?"), options: L(["50¢", "$1", "$4"], ["50¢", "$1", "$4"], ["50¢", "$1", "$4"]), answer: 1, why: L("25¢ × 4 = 100¢ = $1.", "25¢ × 4 = 100¢ = $1.", "25¢ × 4 = 100¢ = $1.") },
  { id: "q-money-6", category: "money", q: L("أي ورقة أقل شيوعًا لكنها قانونية؟", "Which bill is less common but still legal tender?", "¿Qué billete es menos común pero sigue siendo legal?"), options: L(["ورقة $2", "ورقة $20", "ورقة $10"], ["$2 bill", "$20 bill", "$10 bill"], ["Billete de $2", "Billete de $20", "Billete de $10"]), answer: 0, why: L("ورقة $2 قانونية لكنها أقل انتشارًا.", "The $2 bill is legal tender but less common.", "El billete de $2 es legal, pero menos común.") },
  { id: "q-money-7", category: "money", q: L("أي عملة قيمتها 5¢؟", "Which coin is worth 5¢?", "¿Qué moneda vale 5¢?"), image: CURRENCY_ITEMS[1].front, imageAlt: "Nickel front", options: L(["Penny", "Nickel", "Dime"], ["Penny", "Nickel", "Dime"], ["Penny", "Nickel", "Dime"]), answer: 1, why: L("Nickel = 5¢.", "A nickel equals 5¢.", "Un nickel equivale a 5¢.") },
  { id: "q-money-8", category: "money", q: L("اسم الورقة دي إيه؟", "Which bill is shown?", "¿Qué billete aparece?"), image: CURRENCY_ITEMS.find((x) => x.id === "bill-100")?.front, imageAlt: "$100 front", options: L(["ورقة $50", "ورقة $20", "ورقة $100"], ["$50 bill", "$20 bill", "$100 bill"], ["Billete de $50", "Billete de $20", "Billete de $100"]), answer: 2, why: L("دي ورقة $100.", "This is a $100 bill.", "Este es un billete de $100.") },
];

const signQuestions = [
  { id: "q-sign-1", category: "signs", q: L("إشارة YIELD معناها إيه؟", "What does YIELD mean?", "¿Qué significa YIELD?"), signId: "yield", options: L(["قف 10 ثواني دائمًا", "أعطِ الأولوية عند الحاجة", "زود السرعة"], ["Always stop for 10 seconds", "Yield when needed", "Speed up"], ["Parar siempre 10 segundos", "Ceder el paso cuando sea necesario", "Acelerar"]), answer: 1, why: L("Yield تعني إعطاء الأولوية والاندماج بأمان.", "Yield means give right of way and merge safely.", "Yield significa ceder el paso e incorporarse con seguridad.") },
  { id: "q-sign-2", category: "signs", q: L("العلامة دي معناها إيه؟", "What does this sign mean?", "¿Qué significa esta señal?"), signId: "noentry", options: L(["اتجاه ممنوع الدخول منه", "موقف سيارات", "طريق سريع"], ["Do not enter from this direction", "Parking area", "Highway"], ["No entrar desde esta dirección", "Estacionamiento", "Autopista"]), answer: 0, why: L("DO NOT ENTER = لا تدخل من هذا الاتجاه.", "DO NOT ENTER means do not enter from this direction.", "DO NOT ENTER significa no entrar desde esta dirección.") },
  { id: "q-sign-3", category: "signs", q: L("لو شفت الإشارة دي، تعمل إيه؟", "What should you do at this sign?", "¿Qué debe hacer ante esta señal?"), signId: "stop", options: L(["تهدي فقط", "تتوقف توقفًا كاملًا", "تلف فورًا"], ["Only slow down", "Come to a complete stop", "Turn immediately"], ["Solo reducir la velocidad", "Detenerse por completo", "Girar de inmediato"]), answer: 1, why: L("STOP يعني توقف كامل.", "STOP requires a complete stop.", "STOP exige detenerse por completo.") },
  { id: "q-sign-4", category: "signs", q: L("أي إشارة تعني إن الحارة اليمنى هتنتهي؟", "Which sign means the right lane will end?", "¿Qué señal indica que termina el carril derecho?"), signId: "laneends", options: L(["MERGE", "RIGHT LANE ENDS", "NO U-TURN"], ["MERGE", "RIGHT LANE ENDS", "NO U-TURN"], ["MERGE", "RIGHT LANE ENDS", "NO U-TURN"]), answer: 1, why: L("اسمها Right Lane Ends.", "The sign says RIGHT LANE ENDS.", "La señal dice RIGHT LANE ENDS.") },
  { id: "q-sign-5", category: "signs", q: L("School Crossing بتطلب منك إيه؟", "What should you do at a School Crossing sign?", "¿Qué debe hacer ante una señal School Crossing?"), signId: "school", options: L(["تزود السرعة", "تنتبه وتبطّأ", "تستخدم الكلاكس"], ["Speed up", "Slow down and pay attention", "Use the horn"], ["Acelerar", "Reducir la velocidad y estar atento", "Usar la bocina"]), answer: 1, why: L("منطقة مدارس = هدوء وانتباه.", "School areas require slower, attentive driving.", "Las zonas escolares exigen conducir despacio y con atención.") },
  { id: "q-sign-6", category: "signs", q: L("دي أي إشارة؟", "Which sign is this?", "¿Qué señal es esta?"), signId: "oneway", options: L(["Two way", "One Way", "No Entry"], ["Two way", "One Way", "No Entry"], ["Doble sentido", "One Way", "No Entry"]), answer: 1, why: L("دي ONE WAY.", "This is a ONE WAY sign.", "Esta es una señal ONE WAY.") },
  { id: "q-sign-7", category: "signs", q: L("إيه المقصود بـ NO TURN ON RED؟", "What does NO TURN ON RED mean?", "¿Qué significa NO TURN ON RED?"), signId: "norightred", options: L(["ممنوع تمشي مستقيم", "ممنوع تلف أثناء الأحمر", "ممنوع تقف"], ["Do not go straight", "Do not turn while the light is red", "Do not stop"], ["No seguir recto", "No girar mientras la luz esté roja", "No detenerse"]), answer: 1, why: L("الإشارة تخص اللف أثناء الأحمر.", "The sign prohibits turning while the light is red.", "La señal prohíbe girar mientras la luz está roja.") },
  { id: "q-sign-8", category: "signs", q: L("Slippery When Wet معناها إيه؟", "What does Slippery When Wet mean?", "¿Qué significa Slippery When Wet?"), signId: "slippery", options: L(["الطريق زلق لما يبتل", "ممنوع المشي", "طريق منحدر"], ["The road is slippery when wet", "Walking is prohibited", "Steep road"], ["La vía resbala cuando está mojada", "Está prohibido caminar", "Vía con pendiente"]), answer: 0, why: L("دي علامة تحذير من انزلاق الطريق عند البلل.", "It warns that the road may be slippery when wet.", "Advierte que la vía puede estar resbaladiza al mojarse.") },
];

const basicsQuestions = [
  { id: "q-basic-1", category: "measurements", q: L("23 كجم تقريبًا كام باوند؟", "About how many pounds is 23 kg?", "¿Aproximadamente cuántas libras son 23 kg?"), options: L(["23 lb", "35 lb", "51 lb"], ["23 lb", "35 lb", "51 lb"], ["23 lb", "35 lb", "51 lb"]), answer: 2, why: L("23 kg ≈ 50.7 lb، وده مهم لوزن شنط السفر.", "23 kg ≈ 50.7 lb, a useful number for airline baggage.", "23 kg ≈ 50.7 lb, una cifra útil para el equipaje aéreo.") },
  { id: "q-basic-2", category: "measurements", q: L("10 km تقريبًا كام mile؟", "About how many miles is 10 km?", "¿Aproximadamente cuántas millas son 10 km?"), options: L(["6.2 mi", "10 mi", "3 mi"], ["6.2 mi", "10 mi", "3 mi"], ["6.2 mi", "10 mi", "3 mi"]), answer: 0, why: L("10 km ≈ 6.2 miles.", "10 km ≈ 6.2 miles.", "10 km ≈ 6.2 millas.") },
  { id: "q-basic-3", category: "daily-life", q: L("Home Depot غالبًا بتروحله عشان إيه؟", "What do people usually visit Home Depot for?", "¿Para qué suele ir la gente a Home Depot?"), options: L(["عدة وصيانة البيت", "فتح حساب بنكي", "رخصة القيادة"], ["Tools and home repairs", "Opening a bank account", "A driver's license"], ["Herramientas y reparaciones", "Abrir una cuenta bancaria", "Una licencia de conducir"]), answer: 0, why: L("Home Depot مشهور بأدوات وصيانة البيت.", "Home Depot is known for tools and home improvement supplies.", "Home Depot es conocido por herramientas y mejoras del hogar.") },
  { id: "q-basic-4", category: "daily-life", q: L("فين ممكن تطبع Resume بسرعة؟", "Where can you quickly print a résumé?", "¿Dónde puede imprimir rápidamente un currículum?"), options: L(["FedEx Office أو Staples", "DMV", "Starbucks فقط"], ["FedEx Office or Staples", "DMV", "Only Starbucks"], ["FedEx Office o Staples", "DMV", "Solo Starbucks"]), answer: 0, why: L("FedEx Office وStaples من الأماكن الشائعة للطباعة.", "FedEx Office and Staples commonly offer printing.", "FedEx Office y Staples suelen ofrecer impresión.") },
  { id: "q-basic-5", category: "education", q: L("NOVA اختصار لإيه؟", "What does NOVA stand for?", "¿Qué significa NOVA?"), options: L(["Northern Virginia Community College", "National Office for Visa Affairs", "New Online Visa Academy"], ["Northern Virginia Community College", "National Office for Visa Affairs", "New Online Visa Academy"], ["Northern Virginia Community College", "National Office for Visa Affairs", "New Online Visa Academy"]), answer: 0, why: L("NOVA = Northern Virginia Community College.", "NOVA = Northern Virginia Community College.", "NOVA = Northern Virginia Community College.") },
  { id: "q-basic-6", category: "daily-life", q: L("Public Library ممكن تساعدك في إيه؟", "How can a public library help?", "¿Cómo puede ayudar una biblioteca pública?"), options: L(["كتب وكمبيوتر وطباعة أحيانًا", "تجديد جواز أمريكي فورًا", "شراء أثاث"], ["Books, computers and sometimes printing", "Instant U.S. passport renewal", "Buying furniture"], ["Libros, computadoras y a veces impresión", "Renovar un pasaporte al instante", "Comprar muebles"]), answer: 0, why: L("المكتبات العامة غالبًا توفر كتب وإنترنت وكمبيوتر وأحيانًا طباعة.", "Public libraries often provide books, internet, computers and sometimes printing.", "Las bibliotecas públicas suelen ofrecer libros, internet, computadoras y a veces impresión.") },
  { id: "q-basic-7", category: "money", q: L("هل $0.99 أقل من دولار؟", "Is $0.99 less than one dollar?", "¿$0.99 es menos de un dólar?"), options: L(["أقل من دولار", "أكتر من دولار", "يساوي $5"], ["Less than $1", "More than $1", "Equal to $5"], ["Menos de $1", "Más de $1", "Igual a $5"]), answer: 0, why: L("0.99 = 99¢ = أقل من $1.", "0.99 = 99¢, which is less than $1.", "0.99 = 99¢, menos de $1.") },
  { id: "q-basic-8", category: "daily-life", q: L("Costco غالبًا يحتاج إيه؟", "What does Costco usually require?", "¿Qué suele requerir Costco?"), options: L(["عضوية", "رخصة تجارية", "تأشيرة"], ["Membership", "Business license", "Visa"], ["Membresía", "Licencia comercial", "Visa"]), answer: 0, why: L("Costco متجر يعمل بنظام العضوية.", "Costco is a membership-based store.", "Costco es una tienda con membresía.") },
];

export const LEARN_QUIZ_BANK = [...moneyQuestions, ...signQuestions, ...basicsQuestions];
export const BASICS_QUIZ = LEARN_QUIZ_BANK;
