const L = (ar, en, es) => ({ ar, en, es });

export const EDUCATION_CARDS = [
  { title: "Community College", body: L("كلية محلية تقدم Associate degrees وشهادات مهنية ومسارات انتقال لجامعة 4 سنوات، وغالبًا تكون بداية عملية أقل تكلفة.", "A local college offering associate degrees, career certificates and transfer paths to four-year universities, often at a lower cost.", "Universidad comunitaria con títulos associate, certificados profesionales y rutas de transferencia, a menudo a menor costo.") },
  { title: "Associate Degree", body: L("درجة جامعية مصممة عادة لتُنجز في نحو سنتين بدوام كامل، حسب البرنامج والحمل الدراسي.", "A college degree usually designed for about two years of full-time study, depending on the program and course load.", "Título universitario diseñado normalmente para unos dos años de estudio a tiempo completo, según el programa.") },
  { title: "Certificate", body: L("برنامج أقصر يركز على مهارة أو مجال مهني محدد، وتختلف المدة والمتطلبات.", "A shorter program focused on a specific skill or career field; duration and requirements vary.", "Programa más corto centrado en una habilidad o campo profesional; la duración y los requisitos varían.") },
  { title: "Transfer", body: L("انتقال من Community College إلى جامعة لاستكمال Bachelor's؛ خطط للمقررات القابلة للتحويل من البداية.", "Moving from community college to a university to finish a bachelor's degree; plan transferable courses early.", "Pasar de un community college a una universidad para completar el bachelor's; planifique pronto los cursos transferibles.") },
  { title: "Academic Advisor", body: L("مرشد يساعدك تفهم البرنامج والمواد والتخرج والتحويل؛ اسأله مبكرًا.", "An advisor helps with programs, courses, graduation and transfer planning; meet with one early.", "Un asesor ayuda con programas, cursos, graduación y transferencia; consúltelo pronto.") },
  { title: "Financial Aid", body: L("مساعدات للطلاب المؤهلين قد تشمل grants وscholarships وwork-study أو loans حسب الأهلية.", "Aid for eligible students may include grants, scholarships, work-study or loans, depending on eligibility.", "La ayuda para estudiantes elegibles puede incluir grants, becas, work-study o préstamos.") },
];

export const NOVA_INFO = {
  name: "NOVA — Northern Virginia Community College",
  summary: L("كلية مجتمع كبيرة في شمال فرجينيا تقدم Associate degrees وcertificates وبرامج انتقال للجامعات.", "A large Northern Virginia community college offering associate degrees, certificates and university-transfer programs.", "Un gran community college del norte de Virginia con títulos associate, certificados y programas de transferencia."),
  facts: [
    L("NOVA تقدم AA / AS / AFA الموجهة للتحويل، إضافة إلى شهادات وبرامج أخرى.", "NOVA offers transfer-oriented AA, AS and AFA degrees, plus certificates and other programs.", "NOVA ofrece títulos AA, AS y AFA orientados a transferencia, además de certificados y otros programas."),
    L("مكتبات NOVA توفر موارد دراسة وتقنية ومرافق طباعة ونسخ ومسح للطلاب.", "NOVA libraries provide study resources, technology, printing, copying and scanning.", "Las bibliotecas de NOVA ofrecen recursos, tecnología, impresión, copias y escaneo."),
    L("ACEPrint هو نظام الطباعة والنسخ والمسح؛ يستخدم الطلاب NOVACard للدفع للطباعة والنسخ.", "ACEPrint is NOVA's printing, copying and scanning system; students use NOVACard for paid printing and copying.", "ACEPrint es el sistema de impresión, copias y escaneo; los estudiantes usan NOVACard para pagar."),
    L("NOVACard هو Student ID ويُستخدم للمكتبات والطباعة وخدمات أخرى في الحرم.", "NOVACard is the student ID used for libraries, printing and other campus services.", "NOVACard es la identificación estudiantil usada en bibliotecas, impresión y otros servicios."),
  ],
  links: [
    { label: "Programs & Academics", url: "https://www.nvcc.edu/academics/" },
    { label: "NOVA Libraries", url: "https://www.nvcc.edu/academics/library/student-resources/index.html" },
    { label: "ACEPrint", url: "https://www.nvcc.edu/student-resources/novacard/students/aceprint.html" },
  ],
};
