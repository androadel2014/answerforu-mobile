export const ROADMAP_STAGES = [
    {
      id: "stage-0",
      stageNumber: 1,
      title: {
        ar: "المرحلة الأولى: إعلان الفوز باللوتري وتأكيد البيانات (من داخل مصر)",
        en: "Stage 1: DV Lottery Selection & Confirmation (Egypt)",
        es: "Etapa 1: Selección de Lotería y Confirmación (Egipto)"
      },
      description: {
        ar: "الخطوات الدقيقة من لحظة قراءة رسالة الفوز وحفظ البيانات وحتى ملء استمارة الهجرة الرسمية.",
        en: "Crucial actions immediately following selection up to filing the official immigrant visa petition.",
        es: "Acciones clave tras ser seleccionado hasta enviar la solicitud oficial de visa."
      },
      steps: [
        {
          id: "step-0-1",
          title: {
            ar: "حفظ وتوثيق الـ Case Number وطباعة صفحة الاختيار",
            en: "Secure Case Number & Print Selection Letter",
            es: "Asegurar Case Number e Imprimir Carta de Selección"
          },
          summary: {
            ar: "رقم القضية (Case Number) هو المحدد الأساسي لموعد مقابلتك وفق النشرة الشهرية (Visa Bulletin). احتفظ بنسخ رقمية ومطبوعة لخطاب الاختيار في مكان آمن.",
            en: "Your Case Number dictates your interview timeline via the monthly Visa Bulletin. Save digital and physical copies.",
            es: "Su Case Number determina la fecha de entrevista según el Visa Bulletin. Guarde copias digitales e impresas."
          },
          checklist: [
            { ar: "طباعة خطاب الاختيار (1NL) بصيغة PDF واضحة واحتواء الباركود", en: "Print selection letter (1NL) with legible barcode", es: "Imprimir carta de selección con código de barras legible" },
            { ar: "استخراج رقم القضية وحفظه (مثلاً: 2027AF00012345)", en: "Extract and archive exact Case Number", es: "Guardar el Case Number exacto" },
            { ar: "التأكد التام من عدم ضياع Confirmation Number القديم", en: "Retain old Confirmation Number safely", es: "Conservar el Confirmation Number original" }
          ],
          youtubeId: "",
          officialUrl: "https://dvprogram.state.gov"
        },
        {
          id: "step-0-2",
          title: {
            ar: "تعبئة ومراجعة استمارة الهجرة الإلكترونية DS-260 بدقة متناهية",
            en: "File DS-260 Immigrant Visa Application",
            es: "Completar Formulario de Visa de Inmigrante DS-260"
          },
          summary: {
            ar: "استمارة الهجرة الرسمية لجميع أفراد الأسرة المقيدين. أي خطأ في تواريخ العمل أو التعليم أو العناوين قد يؤدي لتعطيل الملف بالكامل.",
            en: "Comprehensive immigration petition for all selected members. Complete employment and address histories without discrepancies.",
            es: "Petición formal de inmigración para todos los miembros. Revise historiales de trabajo y residencia minuciosamente."
          },
          checklist: [
            { ar: "سرد العناوين السابقة بالتفصيل منذ سن 16 عاماً", en: "List all residential addresses lived in since age 16", es: "Listar todas las direcciones de residencia desde los 16 años" },
            { ar: "تطابق المسميات الوظيفية والشهادات مع أصول المستندات", en: "Verify job titles and diplomas match actual papers", es: "Asegurar que cargos laborales coincidan con títulos oficiales" },
            { ar: "تحديد عنوان صالح وموثوق في أمريكا لاستلام الجرين كارد", en: "Provide a stable US mailing address for Green Card delivery", es: "Indicar dirección física confiable en EE.UU. para la Green Card" },
            { ar: "تأكيد طلب إصدار رقم الـ SSN تلقائياً داخل الاستمارة", en: "Check 'Yes' to request automatic SSN issuance", es: "Marcar 'Sí' para solicitar emisión automática de SSN" }
          ],
          youtubeId: "",
          officialUrl: "https://ceac.state.gov/IV/Login.aspx"
        },
        {
          id: "step-0-3",
          title: {
            ar: "متابعة النشرة الشهرية للتأشيرات (Visa Bulletin)",
            en: "Track Monthly Visa Bulletin Movement",
            es: "Monitorear el Boletín de Visas Mensual"
          },
          summary: {
            ar: "تصدر وزارة الخارجية الأمريكية النشرة شهرياً لتحدد سقف الأرقام المعالجة في قارة إفريقيا، لمعرفة التاريخ التقريبي لاستدعائك للمقابلة.",
            en: "US Department of State updates Cut-Off numbers monthly, signalling when your case number unlocks for processing.",
            es: "El Departamento de Estado publica mensualmente los números límite para entrevistas por región."
          },
          checklist: [
            { ar: "متابعة قسم Diversity Immigrant (DV) Category شهرياً", en: "Check DV category cut-off cutoffs every month", es: "Revisar los cortes mensuales de la categoría DV" },
            { ar: "تجهيز الأوراق فور اقتراب رقم قضيتك من النطاق النشط", en: "Gather final certs once your rank approaches cut-off", es: "Reunir documentos finales cuando su número se aproxime al corte" }
          ],
          youtubeId: "",
          officialUrl: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"
        }
      ]
    },
    {
      id: "stage-1-eg",
      stageNumber: 2,
      title: {
        ar: "المرحلة الثانية: تجهيز المستندات الرسمية والكشف الطبي في مصر",
        en: "Stage 2: Egyptian Paperwork, Translations & Medical Exam",
        es: "Etapa 2: Documentación Oficial en Egipto y Examen Médico"
      },
      description: {
        ar: "استخراج جميع الوثائق المطلوبة وترجمتها ترجمة معتمدة، والخضوع للفحص الطبي بالسفارة.",
        en: "Issuing certificates, getting certified translations, and completing designated clinical evaluations.",
        es: "Emisión de certificados, traducciones certificadas y evaluación médica consular."
      },
      steps: [
        {
          id: "step-1-eg-1",
          title: {
            ar: "استخراج وترجمة السجلات المدنية والأكاديمية والجنائية",
            en: "Issue Civil, Academic & Criminal Certificates",
            es: "Emitir Certificados Civiles, Académicos y Penales"
          },
          summary: {
            ar: "استخراج شهادات الميلاد المميكنة، شهادة الثانوية العامة/الجامعية الأصلية، موقف التجنيد للذكور، وفيش وتشبيه حديث موجه للسفارة الأمريكية بالقاهرة، ثم ترجمتها بمكتب معتمد.",
            en: "Obtain automated birth certificates, highest diplomas, military status, police record, and certified translations.",
            es: "Tramitar actas de nacimiento, diplomas académicos, situación militar, antecedentes penales y traducciones juradas."
          },
          checklist: [
            { ar: "أصل شهادة المؤهل الدراسي (الثانوية العامة كحد أدنى)", en: "Original High School diploma (minimum DV threshold)", es: "Diploma original de bachillerato o estudios superiores" },
            { ar: "شهادة إنهاء الخدمة العسكرية أو الإعفاء النهائي (للذكور)", en: "Military service completion or exemption record", es: "Certificado de servicio militar o exención" },
            { ar: "صحيفة الحالة الجنائية (فيش وتشبيه) موجهة للسفارة حديثة الإصدار", en: "Fresh Police Clearance addressed to US Embassy Cairo", es: "Récord policial vigente dirigido a la Embajada de EE.UU." },
            { ar: "قسيمة الزواج المميكنة المترجمة (في حال السفر مع الأسرة)", en: "Automated marriage cert with certified translation", es: "Acta de matrimonio certificada y traducida" }
          ],
          youtubeId: "",
          officialUrl: "https://eg.usembassy.gov/visas/immigrant-visas/diversity-visa/"
        },
        {
          id: "step-1-eg-2",
          title: {
            ar: "الفحص الطبي في المراكز المعتمدة للسفارة في مصر",
            en: "Medical Examination at Approved Clinics",
            es: "Examen Médico en Clínicas Autorizadas"
          },
          summary: {
            ar: "إجراء الكشف الطبي والتطعيمات الإلزامية في أحد المراكز المعتمدة حصراً من السفارة بالقاهرة قبل موعد المقابلة بنحو 2-3 أسابيع.",
            en: "Undergo compulsory screening, x-rays, and vaccinations only through embassy-accredited Egyptian facilities.",
            es: "Realizar exámenes clínicos, radiografías y vacunas requeridas en clínicas autorizadas por la embajada."
          },
          checklist: [
            { ar: "الحجز فور استلام خطاب المقابلة (2NL) في مستشفى معتمد", en: "Book appointment immediately upon receiving 2NL letter", es: "Reservar cita médica inmediatamente tras recibir la carta 2NL" },
            { ar: "إحضار سجل التطعيمات السابق وجواز السفر وصور 5x5", en: "Bring historical immunization records, passport, and 5x5 photos", es: "Llevar historial de vacunación, pasaporte y fotos 5x5" },
            { ar: "استلام التقرير الطبي المغلق (أو التأكد من إرساله إلكترونياً للسفارة)", en: "Receive sealed medical packet (or verify electronic transmission)", es: "Verificar envío digital o recibir paquete médico sellado" }
          ],
          youtubeId: "",
          officialUrl: "https://travel.state.gov/content/travel/en/us-visas/Supplements/Supplements_by_Post/CAI-Cairo.html"
        },
        {
          id: "step-1-eg-3",
          title: {
            ar: "يوم مقابلة السفارة الأمريكية بالقاهرة واستلام التأشيرة",
            en: "Interview Day at US Embassy Cairo & Visa Stamping",
            es: "Día de Entrevista en la Embajada y Sellado de Visa"
          },
          summary: {
            ar: "حضور المقابلة في مقر السفارة بجاردن سيتي بكامل الأصول والترجمات، وسداد رسوم التأشيرة البالغة 330 دولاراً نقداً أو بالبطاقة.",
            en: "Attend interview in Garden City with original folders, pay $330 consular fee, and complete officer interview.",
            es: "Asistir a la entrevista consular con documentos originales, pagar tarifa de $330 y responder al oficial."
          },
          checklist: [
            { ar: "سداد رسوم تأشيرة اللوتري ($330 لكل فرد) داخل السفارة", en: "Pay non-refundable DV fee ($330 per applicant) at embassy", es: "Pagar tarifa consular de $330 por solicitante" },
            { ar: "حمل ملف الأصول + ملف الترجمات + الصور الشخصية", en: "Carry organized binder of originals, translations, and copies", es: "Portar carpeta organizada con originales, traducciones y copias" },
            { ar: "استلام الجواز مختوماً بفيزا الهجرة وتأكيد تاريخ انتهاء صلاحيتها (عادة 6 شهور)", en: "Collect passport with immigrant foil; verify 6-month expiry limit", es: "Retirar pasaporte visado y constatar fecha de expiración" }
          ],
          youtubeId: "",
          officialUrl: "https://ais.usvisa-info.com/en-eg/iv"
        }
      ]
    },
    {
      id: "stage-2-prep",
      stageNumber: 3,
      title: {
        ar: "المرحلة الثالثة: تحضيرات ما قبل السفر (سداد الرسوم، التذاكر، وحزم الأمتعة)",
        en: "Stage 3: Pre-Departure Prep (USCIS Fee, Flights & Packing)",
        es: "Etapa 3: Preparativos Previos (Tarifa USCIS, Vuelos y Equipaje)"
      },
      description: {
        ar: "دفع رسوم الجرين كارد، مقارنة رحلات الطيران، وتجهيز الحقائب والفيش الكهربائية والأدوية.",
        en: "Paying immigrant production fees, locking flights, and packing compliant luggage and adapters.",
        es: "Pago de tarifa de producción, reserva de vuelos y preparación del equipaje reglamentario."
      },
      steps: [
        {
          id: "step-2-prep-1",
          title: {
            ar: "سداد رسوم بطاقة الإقامة الدائمة (USCIS Immigrant Fee - $220)",
            en: "Pay USCIS Immigrant Fee Online ($220)",
            es: "Pagar Tarifa de Inmigrante de USCIS ($220)"
          },
          summary: {
            ar: "رسوم إصدار وطباعة كارت الجرين كارد البلاستيكي. دفعها أونلاين قبل السفر يضمن سرعة شحن الكارت إلى عنوانك الأمريكي فور وصولك.",
            en: "Mandatory fee to produce your physical Permanent Resident Card. Pay online via ELIS before flying to avoid delays.",
            es: "Tarifa para fabricar su Green Card física. Páguela en línea antes de volar para agilizar el envío postal."
          },
          checklist: [
            { ar: "استخدام رقم الـ A-Number ورقم Case ID الموجودين على الفيزا", en: "Locate Alien Registration (A-Number) & DOS Case ID on visa", es: "Localizar A-Number y Case ID impresos en la visa" },
            { ar: "الدفع عبر بطاقة ائتمانية دولية أو حساب بنكي أمريكي", en: "Pay using international credit card on USCIS portal", es: "Efectuar pago con tarjeta internacional en portal de USCIS" },
            { ar: "طباعة وحفظ إيصال الدفع الرقمي مع مستندات السفر الشخصية", en: "Print and store payment receipt alongside boarding papers", es: "Imprimir comprobante oficial de pago para el viaje" }
          ],
          youtubeId: "",
          officialUrl: "https://my.uscis.gov/uscis-immigrant-fee"
        },
        {
          id: "step-2-prep-2",
          title: {
            ar: "حجز تذاكر الطيران ومقارنة الخطوط وسياسات الأمتعة",
            en: "Flight Booking & Luggage Allowance Optimization",
            es: "Reserva de Vuelos y Franquicia de Equipaje"
          },
          summary: {
            ar: "اختيار خطوط طيران توفر وزناً مضاعفاً (شنطتين 23 كجم + شنطة مقصورة)، ومراعاة مسارات الترانزيت لتفادي اشتراطات تأشيرات الترانزيت المعقدة.",
            en: "Compare airlines granting 2x 23kg checked bags. Check layover transit visa regulations carefully.",
            es: "Comparar aerolíneas con dos maletas de 23kg. Evite escalas que exijan visas de tránsito engorrosas."
          },
          checklist: [
            { ar: "المقارنة عبر محركات البحث ومراجعة الموقع المباشر لخطوط الطيران", en: "Price-match via engines and book directly with carriers", es: "Comparar precios y comprar directamente con la aerolínea" },
            { ar: "تجنب فترات الترانزيت القصيرة (أقل من 3 ساعات) بمطار الدخول الأمريكي", en: "Allow 3+ hours layover at first US Port of Entry for customs", es: "Dejar mínimo 3 horas de escala en el primer aeropuerto de EE.UU." },
            { ar: "التأكد من مطابقة أوزان وأبعاد الحقائب تجنباً لغرامات المطار", en: "Strictly weigh baggage to prevent heavy overweight penalties", es: "Pesar maletas con precisión para evitar penalizaciones" }
          ],
          youtubeId: "",
          officialUrl: "https://www.google.com/travel/flights"
        },
        {
          id: "step-2-prep-3",
          title: {
            ar: "حزم حقائب السفر: المستندات الحيوية، الأدوية، والمحولات",
            en: "Master Packing: Documents, Meds & 110V Adapters",
            es: "Equipaje Estratégico: Documentos, Fármacos y Adaptadores"
          },
          summary: {
            ar: "الأوراق الرسمية توضع حصراً في الحقيبة المحمولة (Backpack) ولا توضع في الشحن نهائياً. تجهيز أدوية بروشتات معتمدة ومحولات أفياش أمريكية (Type A/B).",
            en: "Keep critical paperwork strictly in carry-on bag. Bring certified prescriptions and 110V US Type A/B plug plugs.",
            es: "Guarde papeles críticos en el equipaje de mano. Lleve recetas certificadas y adaptadores eléctricos de EE.UU."
          },
          checklist: [
            { ar: "جواز السفر، التقرير الطبي، أصول الشهادات في الشنطة المحمولة", en: "Carry-on: Passport, sealed packet (if any), cash, all originals", es: "En cabina: Pasaporte, certificados originales, dinero y expediente" },
            { ar: "أدوية شخصية تكفي 90 يوماً مع روشتة طبية باللغة الإنجليزية", en: "90-day medication supply accompanied by English prescriptions", es: "Suministro de fármacos para 90 días con receta en inglés" },
            { ar: "شراء محولات كهرباء الجدار الأمريكي 110V (أفياش ثنائية مسطحة)", en: "Acquire dual flat-pin American wall adapters (110V)", es: "Comprar adaptadores de enchufe americano plano (110V)" },
            { ar: "الامتناع عن حمل لحوم، بذور، أو أغذية غير معلبة تجنباً لمصادرتها", en: "No fresh produce, meats, or unsealed agriculture items", es: "No empacar carnes, semillas ni alimentos perecederos" }
          ],
          youtubeId: "",
          officialUrl: "https://www.tsa.gov/travel/security-screening/whatcanibring/all"
        }
      ]
    },
    {
      id: "stage-3-housing",
      stageNumber: 4,
      title: {
        ar: "المرحلة الرابعة: حجز السكن والبحث عن الإيجار الدائم",
        en: "Stage 4: Temporary Housing & Permanent Leasing",
        es: "Etapa 4: Alojamiento Temporal y Contratos de Alquiler"
      },
      description: {
        ar: "تأمين مقر إقامة مبدئي من أسبوعين إلى شهر، ثم توقيع أول عقد إيجار رسمي في أمريكا.",
        en: "Arranging initial short-stay rentals followed by signing your first permanent apartment lease.",
        es: "Gestionar estancia corta inicial y formalizar el primer contrato de alquiler permanente."
      },
      steps: [
        {
          id: "step-3-h-1",
          title: {
            ar: "حجز السكن المؤقت (Airbnb أو شقق مخدومة)",
            en: "Reserve Initial Temporary Accommodation",
            es: "Reservar Alojamiento Provisional Inicial"
          },
          summary: {
            ar: "احجز مدة تكفيك للتحرك الميداني (2 إلى 4 أسابيع). اختر موقعاً هادئاً وقريباً من خطوط الحافلات أو المترو ومراكز التسوق.",
            en: "Book 2 to 4 weeks using flexible platforms. Select regions accessible to public transport and supermarkets.",
            es: "Reserve de 2 a 4 semanas. Elija zonas conectadas con transporte público y supermercados."
          },
          checklist: [
            { ar: "التأكد من إمكانية استلام طرود أو بريد باسمك لدى المضيف", en: "Confirm host allows receiving standard postal mail/packages", es: "Confirmar que el anfitrión permita recibir correspondencia" },
            { ar: "مراجعة تقييمات الأمان والحي (Neighborhood crime index)", en: "Review neighborhood safety scores and tenant comments", es: "Revisar índices de seguridad vecinal y comentarios previos" },
            { ar: "التحقق من سياسات استرداد الأموال في حال الرغبة في التمديد أو المغادرة", en: "Understand cancellation and early-departure terms", es: "Comprender políticas de cancelación y salida anticipada" }
          ],
          youtubeId: "",
          officialUrl: "https://www.airbnb.com"
        },
        {
          id: "step-3-h-2",
          title: {
            ar: "البحث عن شقة وتجاوز شروط الكريديت والكفيل (Co-signer)",
            en: "Permanent Apartment Hunting & Co-signer Options",
            es: "Búsqueda de Vivienda Permanente y Avalistas"
          },
          summary: {
            ar: "تطلب إدارات العقارات تاريخاً ائتمانياً وإثبات دخل يعادل 3 أضعاف الإيجار. كقادم جديد، ستحتاج للتفاوض عبر تقديم وديعة تأمين إضافية (Higher Deposit) أو استخدام كفيل.",
            en: "Landlords require credit scores and 3x rent in earnings. Counter this with higher security deposits or guarantor companies.",
            es: "Los arrendadores piden historial crediticio. Negocie ofreciendo un depósito mayor o un fiador (guarantor)."
          },
          checklist: [
            { ar: "البحث في منصات Zillow و Apartments.com و HotPads", en: "Source units on Zillow, HotPads, and Apartments.com", es: "Buscar inmuebles en Zillow, HotPads y Apartments.com" },
            { ar: "تجهيز كشف حساب بنكي يثبت وجود سيولة كافية لتغطية عدة أشهر", en: "Provide bank balances demonstrating liquid reserve funds", es: "Presentar saldo bancario demostrando fondos líquidos suficientes" },
            { ar: "استكشاف خدمات الضمان المؤسسي مثل The Guarantors أو Leap", en: "Explore corporate lease guarantor services if no co-signer", es: "Consultar servicios corporativos de garantía si carece de aval" }
          ],
          youtubeId: "",
          officialUrl: "https://www.zillow.com"
        },
        {
          id: "step-3-h-3",
          title: {
            ar: "فحص الشقة وتوقيع عقد الإيجار (Lease Agreement)",
            en: "Apartment Inspection & Lease Agreement Execution",
            es: "Inspección de la Vivienda y Firma del Contrato"
          },
          summary: {
            ar: "لا تدفع أي مبلغ نقدي دون معاينة الشقة واقعياً والتأكد من اسم المالك. وثق بالفيديو أي تلفيات قائمة قبل الاستلام لحماية وديعة التأمين عند الإخلاء.",
            en: "Never wire rent before physical walkthrough. Video-document pre-existing damage to protect your security deposit.",
            es: "Nunca pague sin visitar la vivienda. Grabe daños previos en video para salvaguardar el depósito inicial."
          },
          checklist: [
            { ar: "تصوير كل ركن في الشقة وتدوينه في استمارة Move-In Checklist", en: "Record walkthrough video and mark condition sheet", es: "Completar la hoja de inspección y grabar video del estado actual" },
            { ar: "التأكد من كتابة اسمك بوضوح على العقد لاستخدامه كإثبات عنوان رسمي", en: "Ensure your full name is recorded to serve as Proof of Address", es: "Verificar que su nombre completo figure como comprobante de domicilio" },
            { ar: "الاطلاع على بنود الفواتير المشمولة (الماء، الغاز، القمامة، الكهرباء)", en: "Verify included utilities (Water, Trash, Gas, Power)", es: "Revisar servicios incluidos (Agua, Basura, Gas, Electricidad)" }
          ],
          youtubeId: "",
          officialUrl: "https://www.apartments.com"
        }
      ]
    },
    {
      id: "stage-4-arrival",
      stageNumber: 5,
      title: {
        ar: "المرحلة الخامسة: لحظة الهبوط في المطار وتأمين الاتصالات والمواصلات",
        en: "Stage 5: Airport Port of Entry, Mobile Plans & Mobility",
        es: "Etapa 5: Llegada al Aeropuerto, Telefonía y Movilidad"
      },
      description: {
        ar: "إجراءات ضابط الهجرة (CBP)، تشغيل شريحة الهاتف الأمريكية، والتحرك إلى السكن.",
        en: "Clearing customs, getting connected via US cellular plans, and securing ground transportation.",
        es: "Trámites con oficiales de CBP, activación de telefonía y traslado seguro al alojamiento."
      },
      steps: [
        {
          id: "step-4-a-1",
          title: {
            ar: "إنهاء إجراءات الدخول مع ضابط الجمارك وحماية الحدود (CBP)",
            en: "Customs & Border Protection (CBP) Processing",
            es: "Procesamiento con Aduanas y Protección Fronteriza"
          },
          summary: {
            ar: "التوجه لمسار المهاجرين الجدد، تقديم الجواز، مطابقة البصمات، وتأكيد العنوان النهائي لشحن بطاقة الجرين كارد.",
            en: "Line up for first-time immigrant entrance. Take digital fingerprints and re-verify your residential mailing address.",
            es: "Fila para nuevos residentes. Registro de huellas digitales y confirmación de dirección física de entrega."
          },
          checklist: [
            { ar: "تسليم الجواز المحتوي على تأشيرة الهجرة والمظروف الطبي إن وُجد ورقياً", en: "Present stamped passport and sealed documents envelope if physical", es: "Entregar pasaporte visado y sobre médico sellado si aplica" },
            { ar: "مراجعة العنوان المكتوب لدى الضابط حرفياً للتأكد من خلوه من الأخطاء", en: "Carefully spell your US address letter by letter to the officer", es: "Deletrear al oficial la dirección exacta en EE.UU." },
            { ar: "استلام ختم الدخول الرسمي الذي يعمل كجرين كارد مؤقت (I-551 Stamp)", en: "Receive passport entry endorsement serving as temporary Green Card", es: "Obtener el sello I-551 que actúa como Green Card temporal" }
          ],
          youtubeId: "",
          officialUrl: "https://i94.cbp.dhs.gov"
        },
        {
          id: "step-4-a-2",
          title: {
            ar: "المواصلات والانتقال من المطار إلى السكن",
            en: "Airport Ground Transportation & Ride-Hailing",
            es: "Transporte Terrestre desde el Aeropuerto"
          },
          summary: {
            ar: "تفعيل تطبيقات النقل مثل Uber أو Lyft باستخدام واي فاي المطار ووسيلة دفع دولية، أو التنسيق المسبق مع خدمة استقبال من الجالية.",
            en: "Connect to airport Wi-Fi and request Uber/Lyft via foreign card, or arrange verified arrival pickup.",
            es: "Conéctese al Wi-Fi del aeropuerto para pedir Uber/Lyft o coordine recogida previa."
          },
          checklist: [
            { ar: "تثبيت وتفعيل تطبيقي Uber و Lyft مسبقاً على هاتفك", en: "Pre-install and configure Uber and Lyft applications", es: "Instalar y configurar previamente Uber y Lyft" },
            { ar: "التأكد من عمل بطاقتك البنكية الدولية لسداد الرحلات الرقمية", en: "Ensure your overseas payment card is unlocked for US transactions", es: "Comprobar activación internacional de su tarjeta bancaria" },
            { ar: "التوجه إلى منطقة Pickup المخصصة لسيارات التطبيقات الذكية", en: "Follow overhead signs to designated Ride-App pickup zones", es: "Seguir la señalización hacia la zona de recogida de aplicaciones" }
          ],
          youtubeId: "",
          officialUrl: "https://www.uber.com"
        },
        {
          id: "step-4-a-3",
          title: {
            ar: "اختيار وتفعيل خط الموبايل والإنترنت (Cellular Carrier)",
            en: "Select & Activate US Phone Line",
            es: "Elegir y Activar Línea Móvil en EE.UU."
          },
          summary: {
            ar: "المقارنة بين الشبكات الكبرى الثلاث (Verizon, AT&T, T-Mobile) والشبكات الافتراضية الاقتصادية (Mint Mobile, Visible) التي توفر أكثر من 60% من التكلفة.",
            en: "Evaluate Major 3 carriers against low-cost MVNOs (Mint, Visible) saving 60%+ on monthly unlimited talk/data.",
            es: "Compare operadoras principales con OMV económicas (Mint, Visible) para ahorrar más del 60%."
          },
          checklist: [
            { ar: "التأكد من أن هاتفك غير مغلق على شبكة معينة (Unlocked)", en: "Verify device is network-unlocked for US bands", es: "Comprobar que su teléfono esté liberado de fábrica" },
            { ar: "تفعيل شريحة إلكترونية eSIM فورية دون الحاجة لشريحة بلاستيكية", en: "Instant eSIM activation without waiting for physical delivery", es: "Activación instantánea mediante eSIM digital" },
            { ar: "اختيار باقة مكالمات وإنترنت مفتوحة وغير مقيدة بعقد سنوي (No-Contract)", en: "Select prepaid no-contract plan with unlimited talk & text", es: "Elegir plan prepagado sin contrato anual forzoso" }
          ],
          youtubeId: "",
          officialUrl: "https://www.visible.com"
        }
      ]
    },
    {
      id: "stage-5-legal-fin",
      stageNumber: 6,
      title: {
        ar: "المرحلة السادسة: الأساسيات القانونية والمالية (SSN والحساب البنكي)",
        en: "Stage 6: Legal Identity & Banking Core (SSN & Checking)",
        es: "Etapa 6: Identidad Legal y Banca Básica (SSN y Cuenta Corriente)"
      },
      description: {
        ar: "متابعة كارت الضمان الاجتماعي، تجهيز إثبات العنوان، وفتح الحساب البنكي الجاري والتوفير.",
        en: "Securing the SSN card, structuring proof of address, and opening premier bank accounts.",
        es: "Obtención del SSN, consolidación de comprobantes de domicilio y apertura de cuentas."
      },
      steps: [
        {
          id: "step-5-lf-1",
          title: {
            ar: "متابعة واستلام كارت السوشيال سيكيورتي (SSN)",
            en: "SSN Card Tracking & Office Walk-In",
            es: "Seguimiento y Emisión de Tarjeta de Seguro Social"
          },
          summary: {
            ar: "إذا لم يصل الكارت خلال 10 إلى 14 يوماً عمل من تاريخ دخولك، احجز موعداً وتوجه إلى أقرب فرع لـ Social Security Administration ومعك جواز السفر وختم الدخول.",
            en: "If card doesn't reach your mailbox in 10-14 business days, visit the local SSA branch in-person with passport.",
            es: "Si no llega por correo en 10-14 días laborables, acuda a la oficina local del SSA con su pasaporte."
          },
          checklist: [
            { ar: "فحص صندوق البريد والتأكد من كتابة اسمك بوضوح على الصندوق", en: "Label your mailbox clearly with your surname for USPS delivery", es: "Colocar su apellido claramente en el buzón para el cartero" },
            { ar: "حمل جواز السفر، ختم I-551، وشهادة الميلاد الأصلية المترجمة للفرع", en: "Bring passport, stamped visa, and translated birth certificate to SSA", es: "Llevar pasaporte, visa sellada y acta de nacimiento traducida al SSA" },
            { ar: "استلام خطاب إثبات التقديم (Social Security Confirmation Letter)", en: "Request printed confirmation printout verifying assignment", es: "Solicitar comprobante formal de trámite iniciado" }
          ],
          youtubeId: "",
          officialUrl: "https://www.ssa.gov"
        },
        {
          id: "step-5-lf-2",
          title: {
            ar: "تجميع وثائق إثبات العنوان (Proof of Address Mastery)",
            en: "Assemble Legitimate Proof of Address Records",
            es: "Reunir Comprobantes Oficiales de Domicilio"
          },
          summary: {
            ar: "إثبات العنوان هو مفتاح جميع المعاملات الرسمية في أمريكا (البنوك، الـ DMV، المدارس). احرص على جمع مستندين مستقلين يحملان نفس اسمك وعنوانك بدقة.",
            en: "The master key for DMVs and banks. Collect at least two distinct documents matching your name and address precisely.",
            es: "Requisito indispensable para trámites oficiales. Reúna dos documentos que muestren su nombre y domicilio exactos."
          },
          checklist: [
            { ar: "عقد الإيجار السكني الموقع من المالك والمستأجر", en: "Signed formal residential lease agreement", es: "Contrato de arrendamiento residencial firmado" },
            { ar: "فاتورة مرافق باسمك (كهرباء، غاز، مياه، أو إنترنت منزلي)", en: "Utility bill under your name (Power, Gas, or Home Wi-Fi)", es: "Factura de servicios públicos a su nombre (Luz, Gas, Internet)" },
            { ar: "خطاب رسمي أو كشف حساب مصرفي مختوم ومطبوع", en: "Mailed bank statement or government correspondence letter", es: "Estado de cuenta bancario físico o carta gubernamental" }
          ],
          youtubeId: "",
          officialUrl: "https://www.usa.gov"
        },
        {
          id: "step-5-lf-3",
          title: {
            ar: "فتح الحساب البنكي الجاري وحساب التوفير (Checking & Savings)",
            en: "Open Checking & Savings Bank Accounts",
            es: "Abrir Cuentas Bancarias de Cheques y Ahorros"
          },
          summary: {
            ar: "اختر أحد البنوك الكبرى (مثل Chase أو Bank of America) لتوافر الفروع وماكينات الصراف، وافتح حساباً جارياً لإيداع الرواتب واستلام بطاقة Debit Card.",
            en: "Target major national banks (Chase, BoA) for wide ATM networks. Set up checking for payroll and get a Debit card.",
            es: "Elija bancos nacionales grandes para mayor cobertura de cajeros. Abra cuenta corriente para nómina y obtenga tarjeta Débito."
          },
          checklist: [
            { ar: "جواز السفر الأجنبي بختم الدخول والـ SSN (إن وصل)", en: "Foreign passport with entry stamp and SSN card", es: "Pasaporte con visa sellada y tarjeta de SSN" },
            { ar: "وثيقتا إثبات عنوان مطابقتان للشروط", en: "Two acceptable proof of address documents", es: "Dos comprobantes de domicilio admitidos" },
            { ar: "إيداع مبلغ مبدئي لفتح الحساب وتفادي الرسوم الشهرية", en: "Fund initial deposit and review monthly fee waiver rules", es: "Depositar fondos iniciales y revisar exención de comisiones" }
          ],
          youtubeId: "",
          officialUrl: "https://www.chase.com"
        }
      ]
    },
    {
      id: "stage-6-dmv-job",
      stageNumber: 7,
      title: {
        ar: "المرحلة السابعة: رخصة القيادة والتوظيف الأمريكي الأول",
        en: "Stage 7: State Driver's License & US Employment Setup",
        es: "Etapa 7: Licencia de Conducir y Primer Empleo en EE.UU."
      },
      description: {
        ar: "اجتياز اختبارات الـ DMV واستخراج بطاقة Real ID، وتكييف السيرة الذاتية لنظام ATS ودخول سوق العمل.",
        en: "Passing written/road DMV exams, securing Real ID, and launching your ATS-optimized job hunt.",
        es: "Aprobar exámenes del DMV, tramitar Real ID y optimizar el currículum ATS para trabajar."
      },
      steps: [
        {
          id: "step-6-dj-1",
          title: {
            ar: "دراسة كتيب القيادة واجتياز اختبار المعرفة في الـ DMV",
            en: "Study Driver's Manual & Pass Knowledge Test (DMV)",
            es: "Estudiar Manual de Conducción y Aprobar Examen Teórico"
          },
          summary: {
            ar: "الرخصة هي الهوية التعريفية الأولى داخل أمريكا. قم بتحميل كتيب ولايتك، تدرب على الاختبار التجريبي، واحجز موعداً في إدارة المركبات (DMV).",
            en: "The primary US identity card. Download state-specific manual, take practice tests, and book DMV appointment.",
            es: "Es la identificación fundamental. Descargue el manual estatal, practique tests y reserve cita en el DMV."
          },
          checklist: [
            { ar: "تحميل كتيب القيادة الرسمي الخاص بولايتك ودراسته", en: "Download official state driver handbook", es: "Descargar manual oficial de manejo de su estado" },
            { ar: "تجهيز أوراق Real ID (الجواز، السوشيال، ووثيقتا إثبات سكن)", en: "Compile Real ID dossier (Passport, SSN, 2 residency proofs)", es: "Reunir documentos Real ID (Pasaporte, SSN, 2 comprobantes)" },
            { ar: "اجتياز اختبار النظر والاختبار النظري للحصول على تصريح القيادة (Permit)", en: "Clear vision and written exams to earn Learner's Permit", es: "Aprobar exámenes de vista y teórico para obtener el permiso" }
          ],
          youtubeId: "",
          officialUrl: "https://www.dmv.org"
        },
        {
          id: "step-6-dj-2",
          title: {
            ar: "صياغة السيرة الذاتية بالنظام الأمريكي المتوافق مع ATS",
            en: "Format US Resume for ATS Screening Software",
            es: "Adaptar Currículum al Formato ATS Estadounidense"
          },
          summary: {
            ar: "الشركات الأمريكية تفحص السير الذاتية آلياً عبر برامج ATS. ابتعد عن القوالب المعقدة أو الصور الشخصية وركز على الكلمات المفتاحية والإنجازات المقاسة.",
            en: "US recruiters utilize ATS scanners. Avoid graphics, eliminate personal pictures/birthdates, and use quantified bullets.",
            es: "Los reclutadores usan ATS. Elimine fotos y datos personales; use formato simple y logros cuantificados."
          },
          checklist: [
            { ar: "حذف الصورة الشخصية، الديانة، العمر، والحالة الاجتماعية نهائياً", en: "Strictly exclude photo, marital status, birthdate, and religion", es: "Excluir totalmente foto, estado civil, edad y religión" },
            { ar: "كتابة صياغات تركز على الأفعال والنتائج الرقمية (Action Verbs + Metrics)", en: "Frame bullets around quantified achievements and metrics", es: "Redactar logros basados en verbos de acción y cifras cuantificables" },
            { ar: "حفظ السيرة الذاتية بصيغة ملف PDF قياسي نظيف بدون جداول معقدة", en: "Export standard single-column text-based PDF file", es: "Exportar en formato PDF estándar de una columna" }
          ],
          youtubeId: "",
          officialUrl: "https://www.indeed.com"
        },
        {
          id: "step-6-dj-3",
          title: {
            ar: "التقديم على منصات التوظيف والوظائف الأولى المناسبة للبداية",
            en: "Launch Applications on Top Job Portals",
            es: "Postular en Portales de Empleo y Trabajos Iniciales"
          },
          summary: {
            ar: "التسجيل في منصات التوظيف الرئيسية والبدء بالوظائف السريعة لتوليد دخل فوري (مستودعات وتوصيل أمازون، شركات الحراسة والأمن، المتاجر الكبرى).",
            en: "Target accessible starter roles (Amazon Logistics, Security, Retail) to build initial income and local references.",
            es: "Postule a empleos de inicio (logística, seguridad, retail) para generar ingresos y referencias locales."
          },
          checklist: [
            { ar: "إنشاء وتفعيل ملف احترافي على LinkedIn و Indeed و ZipRecruiter", en: "Establish active profiles on LinkedIn, Indeed, and ZipRecruiter", es: "Crear perfiles activos en LinkedIn, Indeed y ZipRecruiter" },
            { ar: "تحديد الوظائف التي تقبل رخص العمل المباشرة دون اشتراط خبرة أمريكية", en: "Filter for entry-level positions without local experience barriers", es: "Filtrar vacantes de nivel inicial que no exijan experiencia local" },
            { ar: "تجهيز رقم الـ SSN واستمارة W-4 فور تلقي أول عرض وظيفي", en: "Have SSN and Form W-4 ready upon accepting job offer", es: "Tener listos SSN y formulario W-4 al recibir oferta formal" }
          ],
          youtubeId: "",
          officialUrl: "https://www.linkedin.com"
        }
      ]
    },
    {
      id: "stage-7-car-ins",
      stageNumber: 8,
      title: {
        ar: "المرحلة الثامنة: شراء السيارة الأولى ومنظومة التأمين الشامل",
        en: "Stage 8: First Vehicle Acquisition & Insurance Ecosystem",
        es: "Etapa 8: Compra del Primer Auto y Seguros Esenciales"
      },
      description: {
        ar: "فحص وتملك سيارة موثوقة بدون الوقوع في فخاخ النصب، واختيار التأمين الإلزامي للسيارات والصحة.",
        en: "Buying a verified vehicle without scams, locking auto coverage, and setting up healthcare policies.",
        es: "Adquirir un vehículo seguro, contratar póliza de auto e inscribirse en seguro de salud."
      },
      steps: [
        {
          id: "step-7-ci-1",
          title: {
            ar: "شراء سيارة مستعملة موثوقة وتفادي فخاخ الـ Salvage Title",
            en: "Inspect & Purchase First Reliable Used Car",
            es: "Comprar un Auto Usado Confiable y Evitar Fraudes"
          },
          summary: {
            ar: "تعتمد الحياة خارج المدن الكبرى كلياً على السيارة. افحص السيارة ميكانيكياً واشترِ حصراً سيارة بـ Clean Title وافحص تاريخها عبر Carfax قبل تحويل أي دولار.",
            en: "A vehicle is indispensable. Always run Carfax reports, verify Clean Titles, and conduct pre-purchase inspections.",
            es: "Un vehículo es vital. Revise el historial con Carfax, exija Clean Title y haga inspección mecánica previa."
          },
          checklist: [
            { ar: "سحب تقرير تاريخ السيارة عبر VIN Number من موقع Carfax", en: "Pull official Carfax history using the 17-digit VIN", es: "Revisar reporte Carfax mediante el número VIN del auto" },
            { ar: "التأكد من أن ملكية السيارة (Title) نظيفة وخالية من الرهن المالي (No Liens)", en: "Verify Clean Title status with no bank liens attached", es: "Verificar título limpio y libre de gravámenes financieros" },
            { ar: "أخذ السيارة لورشة مستقلة لفحص الشاسيه والمحرك (Pre-Purchase Inspection)", en: "Pay independent mechanic for full multi-point pre-purchase review", es: "Llevar el auto a un taller independiente para inspección completa" }
          ],
          youtubeId: "",
          officialUrl: "https://www.carfax.com"
        },
        {
          id: "step-7-ci-2",
          title: {
            ar: "إصدار وثيقة تأمين السيارة الإلزامية (Auto Insurance)",
            en: "Secure Mandatory Auto Insurance Coverage",
            es: "Contratar Seguro Obligatorio de Auto"
          },
          summary: {
            ar: "القيادة بدون تأمين جريمة يعاقب عليها القانون. قارن الأسعار بين الشركات الكبرى مثل Progressive و GEICO للحصول على أقل قسط ممكن لحاملي الرخص الجديدة.",
            en: "Driving uninsured is illegal. Quote multiple carriers (GEICO, Progressive) to counter new-driver rate surcharges.",
            es: "Conducir sin seguro es ilegal. Cotice con varias compañías (GEICO, Progressive) para obtener tarifas competitivas."
          },
          checklist: [
            { ar: "مقارنة حدود المسؤولية المدنية (Liability) والتغطية الشاملة (Full Coverage)", en: "Compare Comprehensive/Collision vs state-minimum Liability", es: "Comparar cobertura de responsabilidad civil frente a cobertura total" },
            { ar: "طباعة بطاقة التأمين الرقمية وحفظها داخل درج السيارة فوراً", en: "Print and store physical insurance binder card inside glovebox", es: "Imprimir y guardar tarjeta física del seguro en la guantera" }
          ],
          youtubeId: "",
          officialUrl: "https://www.progressive.com"
        },
        {
          id: "step-7-ci-3",
          title: {
            ar: "الاشتراك في التأمين الصحي الحكومي المدعوم (ACA / Marketplace)",
            en: "Enroll in Subsidized Healthcare (Healthcare.gov)",
            es: "Inscripción en Seguro Médico con Subsidio (ACA)"
          },
          summary: {
            ar: "الرعاية الطبية باهظة التكاليف في أمريكا. استفد من فترة التسجيل الخاصة بالوافدين الجدد (خلال 60 يوماً من الوصول) للحصول على تأمين مدعوم من الحكومة وفق دخلك.",
            en: "US medical care is costly. Utilize the 60-day Qualifying Life Event window on Healthcare.gov to obtain subsidies.",
            es: "La salud es costosa en EE.UU. Aproveche el período especial de 60 días tras llegar para recibir subsidios según ingresos."
          },
          checklist: [
            { ar: "التقديم خلال 60 يوماً من تاريخ الدخول لتفعيل Special Enrollment", en: "Submit application within 60 days of US entry date", es: "Presentar solicitud dentro de 60 días de la fecha de entrada" },
            { ar: "فهم الفارق الجوهري بين مبالغ الـ Deductible والـ Copay والـ Out-of-Pocket Max", en: "Analyze Deductible vs Copay vs Max Out-of-Pocket liabilities", es: "Revisar diferencias entre deducible, copagos y desembolso máximo" }
          ],
          youtubeId: "",
          officialUrl: "https://www.healthcare.gov"
        }
      ]
    },
    {
      id: "stage-8-credit",
      stageNumber: 9,
      title: {
        ar: "المرحلة التاسعة: هندسة وتطوير الكريديت سكور من الصفر",
        en: "Stage 9: Credit Score Architecture & Rapid Growth",
        es: "Etapa 9: Construcción y Aumento Acelerado de Crédito"
      },
      description: {
        ar: "البدء بالبطاقات المضمونة، إدارة نسبة الاستهلاك، وبناء ملف ائتماني قوي يتخطى 750 نقطة.",
        en: "Starting with secured lines, managing balance utilization, and pushing your score past 750.",
        es: "Uso de tarjetas aseguradas, control de utilización y desarrollo de puntaje superior a 750."
      },
      steps: [
        {
          id: "step-8-cs-1",
          title: {
            ar: "إصدار أول بطاقة ائتمان بضمان نقدي (Secured Credit Card)",
            en: "Apply for High-Impact Secured Credit Card",
            es: "Solicitar Primera Tarjeta de Crédito Asegurada"
          },
          summary: {
            ar: "أسهل وأأمن وسيلة لتوليد تاريخ ائتماني بدون سوابق. قم بإيداع تأمين نقدي (200$ إلى 500$) يعمل كحد ائتماني لك، ويتم التبليغ شهرياً للمكاتب الثلاثة.",
            en: "Safest launchpad for newcomers. Deposit refundable cash ($200-$500) serving as your revolving credit ceiling.",
            es: "La vía más segura para iniciar. Deposite un fondo ($200-$500) que fungirá como su límite de gasto."
          },
          checklist: [
            { ar: "اختيار كارت بدون رسوم سنوية مثل Discover it® Secured", en: "Select zero-annual-fee options like Discover it® Secured", es: "Elegir opciones sin cuota anual como Discover it® Secured" },
            { ar: "التأكد من التبليغ الدوري لمكاتب Experian و Equifax و TransUnion", en: "Confirm active reporting to Experian, TransUnion & Equifax", es: "Verificar reporte continuo a Experian, TransUnion y Equifax" }
          ],
          youtubeId: "",
          officialUrl: "https://www.discover.com/credit-cards/secured/"
        },
        {
          id: "step-8-cs-2",
          title: {
            ar: "قاعدة الـ 10% ونظام السداد التلقائي الكامل (Full Autopay)",
            en: "Mastering the 10% Utilization Rule & Auto-Pay",
            es: "Regla de Utilización del 10% y Pago Automático"
          },
          summary: {
            ar: "لا تدع رصيدك المستهلك يتعدى 10% من حد الكارت عند صدور كشف الحساب الشهري. فعّل خيار Autopay لسداد إجمالي الرصيد (Statement Balance) لتجنب دفع الفوائد نهائياً.",
            en: "Never let reported balance exceed 10% on statement closing. Set automatic full payoff to eliminate interest charges.",
            es: "Mantenga el saldo reportado bajo el 10% al cierre de estado. Active pago automático total para evitar intereses."
          },
          checklist: [
            { ar: "معرفة تاريخ صدور كشف الحساب (Statement Date) بدقة", en: "Track Statement Date vs Payment Due Date precisely", es: "Distinguir la fecha de corte (Statement Date) de la fecha límite" },
            { ar: "ضبط السداد التلقائي لكامل الرصيد وليس الحد الأدنى فقط", en: "Enable Autopay for 'Full Statement Balance' not minimum", es: "Configurar pago automático sobre el saldo total facturado" }
          ],
          youtubeId: "",
          officialUrl: "https://www.experian.com"
        },
        {
          id: "step-8-cs-3",
          title: {
            ar: "متابعة السكور والترقية للكروت غير المؤمنة (Unsecured Rewards)",
            en: "Credit Monitoring & Unsecured Cards Graduation",
            es: "Monitoreo de Puntaje y Transición a Tarjetas Tradicionales"
          },
          summary: {
            ar: "راقب درجاتك مجاناً عبر Experian و Credit Karma. بعد 8-10 شهور من الانضباط وبلوغ سكور 700+، استرد وديعتك وتأهل لكروت البنوك الكبرى ذات المكافآت ونقاط السفر.",
            en: "Track profiles on Experian and Credit Karma. Upon crossing 700+ score, graduate to cash-back rewards cards.",
            es: "Supervise su récord en Experian y Credit Karma. Al superar 700 puntos, solicite tarjetas tradicionales con recompensas."
          },
          checklist: [
            { ar: "متابعة تقرير الائتمان أسبوعياً ومراجعة أي استعلامات مشبوهة", en: "Review credit reports for unauthorized inquiries or errors", es: "Revisar reportes de crédito para corregir posibles discrepancias" },
            { ar: "طلب استرجاع وديعة التأمين النقدي وترقية الكارت إلى كارت عادي", en: "Request security deposit refund and upgrade line to unsecured", es: "Solicitar devolución del depósito y conversión a tarjeta no asegurada" }
          ],
          youtubeId: "",
          officialUrl: "https://www.creditkarma.com"
        }
      ]
    },
    {
      id: "stage-9-tax-invest",
      stageNumber: 10,
      title: {
        ar: "المرحلة العاشرة: الإقرار الضريبي والاستثمار للتقاعد وبناء الثروة",
        en: "Stage 10: Tax Compliance & Retirement Wealth (Roth IRA)",
        es: "Etapa 10: Declaración Fiscal e Inversión para el Retiro"
      },
      description: {
        ar: "فهم الفروق الضريبية بين W-2 و1099، والاستثمار المنتظم في صناديق المؤشرات المعفاة من الضرائب.",
        en: "Filing annual IRS tax returns correctly and investing monthly in tax-free index funds.",
        es: "Cumplimiento fiscal ante el IRS e inversión periódica en fondos indexados para el retiro."
      },
      steps: [
        {
          id: "step-9-ti-1",
          title: {
            ar: "فهم وتجهيز الضرائب السنوية (الفارق بين W-2 و 1099 وموسم الـ IRS)",
            en: "IRS Annual Tax Return Filing (W-2 vs 1099)",
            es: "Declaración Anual de Impuestos IRS (W-2 vs 1099)"
          },
          summary: {
            ar: "جميع المقيمين ملزمون بتقديم إقرار ضريبي قبل 15 أبريل سنوياً. إذا كنت موظفاً ستحصل على W-2 وخصومات مسبقة، بينما إذا كنت حراً (1099) فعليك دفع ضريبة العمل الحر واحتساب مصاريفك.",
            en: "File tax forms annually by April 15. W-2 employees report withheld taxes; 1099 contractors deduce legitimate expenses.",
            es: "Declare impuestos antes del 15 de abril. Distinga entre retenciones de nómina (W-2) e ingresos independientes (1099)."
          },
          checklist: [
            { ar: "جمع كافة استمارات الدخل بنهاية يناير من كل عام", en: "Gather all employer W-2s and 1099 forms by late January", es: "Reunir formularios W-2 y 1099 emitidos al cierre del año" },
            { ar: "حفظ فواتير الوقود والصيانة والمعدات القابلة للخصم لحاملي 1099", en: "Track mileage, phone, and expenses for 1099 write-offs", es: "Registrar gastos deducibles de combustible y equipo para 1099" },
            { ar: "الاستعانة بمحاسب قانوني معتمد (CPA) متخصص لتفادي الغرامات", en: "Engage certified CPA to file federal and state forms safely", es: "Asesorarse con un contador público certificado (CPA)" }
          ],
          youtubeId: "",
          officialUrl: "https://www.irs.gov"
        },
        {
          id: "step-9-ti-2",
          title: {
            ar: "فتح حساب التقاعد المعفي من الضرائب (Roth IRA)",
            en: "Open & Fund a Roth IRA Retirement Account",
            es: "Abrir y Financiar una Cuenta de Retiro Roth IRA"
          },
          summary: {
            ar: "أقوى أداة استثمارية للمبتدئين في أمريكا. تستثمر فيه أموالاً خضعت للضريبة مسبقاً، لتنمو كل الأرباح الرأسمالية وتُسحب عند سن 59.5 سنة معفاة تماماً بنسبة 100% من أي ضرائب.",
            en: "Premier wealth vehicle. Fund with after-tax money; all dividends and future retirement withdrawals are 100% tax-free.",
            es: "Instrumento óptimo de inversión. Se nutre de fondos netos; dividendos y retiros futuros están libres de impuestos."
          },
          checklist: [
            { ar: "فتح الحساب لدى وسيط منخفض العمولات (Fidelity, Vanguard, Charles Schwab)", en: "Open account at low-cost brokers (Fidelity, Vanguard, Schwab)", es: "Abrir cuenta en plataformas de bajo costo (Fidelity, Vanguard)" },
            { ar: "الالتزام بالحد الأقصى للإيداع السنوي المسموح به من مصلحة الضرائب", en: "Track maximum annual contribution limits set by IRS", es: "Respetar los topes máximos de contribución anual fijados por el IRS" },
            { ar: "ضبط التحويل البنكي التلقائي الشهري لترسيخ عادة الادخار الاستثماري", en: "Establish automated monthly bank transfers for consistency", es: "Programar transferencias bancarias mensuales automáticas" }
          ],
          youtubeId: "",
          officialUrl: "https://www.investor.gov"
        },
        {
          id: "step-9-ti-3",
          title: {
            ar: "الاستثمار في صناديق المؤشرات المتنوعة منخفضة التكلفة (S&P 500 Index Funds)",
            en: "Invest in Broad Low-Cost Index Funds (S&P 500 ETFs)",
            es: "Invertir en Fondos Indexados S&P 500 de Bajo Costo"
          },
          summary: {
            ar: "بدلاً من المخاطرة بشراء أسهم شركات فردية، استثمر في أكبر 500 شركة أمريكية مجمعة عبر صناديق مؤشرات مثل VOO أو FXAIX بنسب رسوم شبه معدومة وعوائد تاريخية قوية.",
            en: "Avoid stock picking. Buy low-cost index funds mirroring US large caps (VOO, SPY, FXAIX) with low expense ratios.",
            es: "Evite acciones individuales. Adquiera fondos indexados globales (VOO, FXAIX) con comisiones mínimas y alto historial."
          },
          checklist: [
            { ar: "شراء صناديق مؤشرات بسعر نفقات أقل من 0.05% (Expense Ratio)", en: "Select index ETFs with expense ratios under 0.05%", es: "Elegir fondos indexados con ratios de gastos menores al 0.05%" },
            { ar: "تفعيل خاصية إعادة استثمار الأرباح الموزعة تلقائياً (DRIP)", en: "Turn on Dividend Reinvestment Plan (DRIP) feature", es: "Activar reinversión automática de dividendos (DRIP)" },
            { ar: "تبني استراتيجية الشراء طويل الأجل (Dollar-Cost Averaging) وتجاهل تقلبات السوق", en: "Apply Dollar-Cost Averaging; maintain long-term horizon", es: "Aplicar compras periódicas constantes y mantener horizonte a largo plazo" }
          ],
          youtubeId: "",
          officialUrl: "https://investor.vanguard.com"
        }
      ]
    }
  ];