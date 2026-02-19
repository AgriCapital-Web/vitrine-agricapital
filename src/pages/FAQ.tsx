import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, Mail, MessageCircle, ChevronRight, Leaf, Users, TrendingUp, Shield, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqTranslations: Record<string, FAQItem[]> = {
  fr: [
    { category: "general", question: "Qu'est-ce qu'AgriCapital ?", answer: "AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans l'accompagnement agricole inclusif. Elle pilote le programme « Palmier Solidaire », un modèle innovant permettant aux familles rurales vulnérables d'accéder à la filière palmier à huile avec accompagnement technique complet et garantie d'écoulement de la production." },
    { category: "general", question: "Qu'est-ce que le programme Palmier Solidaire ?", answer: "Le programme « Palmier Solidaire » vise à améliorer durablement les conditions de vie des familles rurales vulnérables à travers une agriculture inclusive, durable et résiliente au changement climatique. Il cible prioritairement les femmes, les jeunes et les chefs de ménages dans la région du Haut-Sassandra." },
    { category: "general", question: "Où se trouve AgriCapital ?", answer: "Notre siège est situé à Gonaté, Daloa, dans la région du Haut-Sassandra en Côte d'Ivoire. Notre zone d'intervention couvre Daloa, Vavoua, Zoukougbeu et Issia." },
    { category: "general", question: "AgriCapital est-elle une entreprise légale ?", answer: "Oui, AGRICAPITAL SARL est formellement constituée et opérationnelle, immatriculée au RCCM sous le numéro CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "Qui peut bénéficier du programme ?", answer: "Le programme s'adresse aux familles rurales vulnérables, principalement les femmes, les jeunes et les chefs de ménages disposant de terres à valoriser. Il est aussi ouvert aux propriétaires terriens, producteurs et toute personne souhaitant participer au développement de la filière palmier à huile." },
    { category: "accompagnement", question: "En quoi consiste l'accompagnement d'AgriCapital ?", answer: "Notre accompagnement intégré comprend : la fourniture de plants certifiés Tenera et intrants adaptés, le suivi technique continu par des techniciens qualifiés, des formations pratiques sur les techniques agricoles durables, des sessions dédiées aux femmes et jeunes sur l'entrepreneuriat rural, et la garantie d'écoulement de la production." },
    { category: "accompagnement", question: "Que fournit le bénéficiaire ?", answer: "Le bénéficiaire apporte sa parcelle de terre et la main-d'œuvre locale pour les travaux de terrain (nettoyage, défrichage, trouaison, plantation, entretien). AgriCapital fournit les intrants, l'expertise technique et la garantie commerciale." },
    { category: "accompagnement", question: "D'où proviennent les plants de palmier ?", answer: "Nos plants proviennent de semences certifiées d'origine Iro Lamé, fournies par notre partenaire Les Palmistes. Il s'agit de la variété Tenera, tolérante à la fusariose, garantissant des plants de haute qualité et productifs." },
    { category: "accompagnement", question: "Quelles sont les étapes du programme ?", answer: "Le programme se déroule en 5 étapes : (1) Prospection et mobilisation des familles bénéficiaires, (2) Mise en place des plantations avec plants certifiés, (3) Renforcement des capacités et formations, (4) Suivi technique et accompagnement continu, (5) Accès au marché avec garantie d'écoulement." },
    { category: "garanties", question: "Quelle garantie d'écoulement offre AgriCapital ?", answer: "AgriCapital s'engage à assurer l'écoulement de 100% de la production de régimes de palmier frais à des prix du marché, pendant une durée minimum de 20 ans. Cette garantie assure des débouchés stables et des revenus prévisibles pour tous les bénéficiaires." },
    { category: "garanties", question: "Comment AgriCapital sécurise-t-elle le programme ?", answer: "La sécurisation repose sur : un modèle solidaire éprouvé, des partenariats industriels pour la commercialisation, un accompagnement technique réduisant les risques, la transparence et la traçabilité des opérations, et un engagement contractuel à long terme." },
    { category: "offres", question: "Quels sont les objectifs sociaux du programme ?", answer: "D'ici 2030, le programme vise à accompagner 1 000 familles rurales (dont 60% de femmes et jeunes), valoriser 500 hectares de terres sous-exploitées, renforcer les capacités techniques des bénéficiaires, accroître les revenus agricoles et la sécurité alimentaire, et contribuer à la résilience climatique." },
    { category: "offres", question: "Comment le programme favorise-t-il l'autonomisation des femmes ?", answer: "Le programme intègre des sessions de formation spécifiques pour les femmes et les jeunes, couvrant la gestion agricole et l'entrepreneuriat rural. 60% des bénéficiaires ciblés sont des femmes et des jeunes, avec des groupes d'entraide communautaire dédiés." },
    { category: "offres", question: "Comment le programme contribue-t-il à la résilience climatique ?", answer: "Le programme promeut des pratiques agricoles respectueuses de l'environnement, utilise des variétés de plants adaptées au climat local, et sensibilise les bénéficiaires sur la protection de l'environnement et les bonnes pratiques durables." },
    { category: "investissement", question: "Comment puis-je soutenir le programme Palmier Solidaire ?", answer: "Plusieurs formes de partenariat sont possibles : partenariat foncier (mise à disposition de terres), partenariat technique, partenariat institutionnel (ONG, fondations), ou partenariat financier. Contactez notre équipe pour discuter des modalités adaptées à votre situation." },
    { category: "investissement", question: "Le programme est-il ouvert aux institutions et fondations ?", answer: "Absolument. Le programme Palmier Solidaire est conçu pour accueillir des partenaires institutionnels, des fondations et des ONG souhaitant contribuer au développement rural durable et à l'autonomisation des communautés vulnérables en Côte d'Ivoire." },
    { category: "entreprise", question: "Quelle est l'expérience de l'équipe AgriCapital ?", answer: "Le fondateur Inocent KOFFI possède 12 années d'expérience professionnelle terrain, ayant parcouru plus de 360 localités dans 8 régions de Côte d'Ivoire. Cette connaissance approfondie des réalités rurales a permis de concevoir le programme Palmier Solidaire, adapté aux besoins réels des communautés." },
    { category: "entreprise", question: "Quelle est la vision d'AgriCapital ?", answer: "Notre vision est d'améliorer durablement les conditions de vie des familles rurales à travers une agriculture inclusive et résiliente. Nous voulons stimuler l'économie rurale, contribuer à la sécurité alimentaire, réduire l'exode rural et impacter positivement les générations futures." },
    { category: "entreprise", question: "Comment contacter AgriCapital ?", answer: "Vous pouvez nous joindre par téléphone/WhatsApp au +225 05 64 55 17 17, par email à contact@agricapital.ci, ou visiter notre site web www.agricapital.ci. Notre siège est situé à Gonaté, Daloa, Côte d'Ivoire." },
  ],
  en: [
    { category: "general", question: "What is AgriCapital?", answer: "AGRICAPITAL SARL is an Ivorian company specializing in inclusive agricultural support. It leads the 'Solidarity Palm' program, an innovative model enabling vulnerable rural families to access the oil palm sector with comprehensive technical support and guaranteed production marketing." },
    { category: "general", question: "What is the Solidarity Palm program?", answer: "The 'Solidarity Palm' program aims to sustainably improve the living conditions of vulnerable rural families through inclusive, sustainable agriculture that is resilient to climate change. It primarily targets women, youth and household heads in the Haut-Sassandra region." },
    { category: "general", question: "Where is AgriCapital located?", answer: "Our headquarters is in Gonaté, Daloa, in the Haut-Sassandra region of Côte d'Ivoire. Our area of operation covers Daloa, Vavoua, Zoukougbeu and Issia." },
    { category: "general", question: "Is AgriCapital a legally registered company?", answer: "Yes, AGRICAPITAL SARL is formally constituted and operational, registered under RCCM number CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "Who can benefit from the program?", answer: "The program targets vulnerable rural families, mainly women, youth and household heads with land to develop. It is also open to landowners, producers and anyone wishing to participate in oil palm sector development." },
    { category: "accompagnement", question: "What does AgriCapital's support include?", answer: "Our integrated support includes: certified Tenera seedlings and adapted inputs, continuous technical monitoring by qualified technicians, practical training on sustainable agricultural techniques, dedicated sessions for women and youth on rural entrepreneurship, and guaranteed production marketing." },
    { category: "accompagnement", question: "What does the beneficiary provide?", answer: "The beneficiary provides their plot of land and local labor for field work (clearing, digging, planting, maintenance). AgriCapital provides inputs, technical expertise and commercial guarantees." },
    { category: "accompagnement", question: "Where do the palm seedlings come from?", answer: "Our seedlings come from certified Iro Lamé origin seeds, supplied by our partner Les Palmistes. These are Tenera variety, fusarium-tolerant, ensuring high-quality and productive plants." },
    { category: "accompagnement", question: "What are the program stages?", answer: "The program unfolds in 5 stages: (1) Prospecting and mobilizing beneficiary families, (2) Setting up plantations with certified seedlings, (3) Capacity building and training, (4) Technical monitoring and continuous support, (5) Market access with guaranteed outlets." },
    { category: "garanties", question: "What marketing guarantee does AgriCapital offer?", answer: "AgriCapital commits to ensuring the marketing of 100% of fresh palm fruit bunch production at market prices, for a minimum of 20 years. This guarantee ensures stable outlets and predictable income for all beneficiaries." },
    { category: "garanties", question: "How does AgriCapital secure the program?", answer: "Security is based on: a proven solidarity model, industrial partnerships for marketing, technical support reducing risks, transparency and traceability of operations, and long-term contractual commitment." },
    { category: "offres", question: "What are the program's social objectives?", answer: "By 2030, the program aims to support 1,000 rural families (60% women and youth), develop 500 hectares of underutilized land, strengthen beneficiaries' technical capabilities, increase agricultural income and food security, and contribute to climate resilience." },
    { category: "offres", question: "How does the program empower women?", answer: "The program includes specific training sessions for women and youth, covering agricultural management and rural entrepreneurship. 60% of targeted beneficiaries are women and youth, with dedicated community support groups." },
    { category: "offres", question: "How does the program contribute to climate resilience?", answer: "The program promotes environmentally friendly agricultural practices, uses plant varieties adapted to local climate, and raises beneficiary awareness about environmental protection and sustainable practices." },
    { category: "investissement", question: "How can I support the Solidarity Palm program?", answer: "Several forms of partnership are possible: land partnership (providing land), technical partnership, institutional partnership (NGOs, foundations), or financial partnership. Contact our team to discuss arrangements suited to your situation." },
    { category: "investissement", question: "Is the program open to institutions and foundations?", answer: "Absolutely. The Solidarity Palm program is designed to welcome institutional partners, foundations and NGOs wishing to contribute to sustainable rural development and empowerment of vulnerable communities in Côte d'Ivoire." },
    { category: "entreprise", question: "What is the AgriCapital team's experience?", answer: "Founder Inocent KOFFI has 12 years of professional field experience, having visited over 360 localities across 8 regions of Côte d'Ivoire. This deep knowledge of rural realities enabled the design of the Solidarity Palm program, adapted to communities' real needs." },
    { category: "entreprise", question: "What is AgriCapital's vision?", answer: "Our vision is to sustainably improve the living conditions of rural families through inclusive and resilient agriculture. We aim to stimulate rural economy, contribute to food security, reduce rural exodus and positively impact future generations." },
    { category: "entreprise", question: "How to contact AgriCapital?", answer: "You can reach us by phone/WhatsApp at +225 05 64 55 17 17, by email at contact@agricapital.ci, or visit our website www.agricapital.ci. Our headquarters is in Gonaté, Daloa, Côte d'Ivoire." },
  ],
  ar: [
    { category: "general", question: "ما هي أغريكابيتال؟", answer: "أغريكابيتال هي شركة إيفوارية متخصصة في الدعم الزراعي الشامل. تقود برنامج «النخيل التضامني»، وهو نموذج مبتكر يمكّن الأسر الريفية الضعيفة من الوصول إلى قطاع نخيل الزيت مع دعم تقني شامل وضمان تسويق الإنتاج." },
    { category: "general", question: "ما هو برنامج النخيل التضامني؟", answer: "يهدف برنامج «النخيل التضامني» إلى تحسين ظروف معيشة الأسر الريفية الضعيفة بشكل مستدام من خلال زراعة شاملة ومستدامة ومقاومة لتغير المناخ. يستهدف بشكل أساسي النساء والشباب وأرباب الأسر في منطقة هوت ساساندرا." },
    { category: "general", question: "أين يقع مقر أغريكابيتال؟", answer: "يقع مقرنا في غوناتي، دالوا، في منطقة هوت ساساندرا في كوت ديفوار. تغطي منطقة عملنا دالوا وفافوا وزوكوغبو وإيسيا." },
    { category: "general", question: "هل أغريكابيتال شركة قانونية؟", answer: "نعم، أغريكابيتال مؤسسة رسمياً وعاملة، مسجلة في السجل التجاري تحت الرقم CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "من يمكنه الاستفادة من البرنامج؟", answer: "يستهدف البرنامج الأسر الريفية الضعيفة، خاصة النساء والشباب وأرباب الأسر الذين يملكون أراضي للتثمين. كما أنه مفتوح لملاك الأراضي والمنتجين وكل من يرغب في المشاركة في تطوير قطاع نخيل الزيت." },
    { category: "accompagnement", question: "ما الذي يشمله دعم أغريكابيتال؟", answer: "يشمل دعمنا المتكامل: توفير شتلات تينيرا المعتمدة والمدخلات المناسبة، والمتابعة التقنية المستمرة من قبل فنيين مؤهلين، وتدريبات عملية على التقنيات الزراعية المستدامة، وجلسات مخصصة للنساء والشباب حول ريادة الأعمال الريفية، وضمان تسويق الإنتاج." },
    { category: "accompagnement", question: "ماذا يقدم المستفيد؟", answer: "يقدم المستفيد قطعة أرضه والعمالة المحلية لأعمال الميدان (التنظيف، القطع، الحفر، الزراعة، الصيانة). توفر أغريكابيتال المدخلات والخبرة التقنية والضمان التجاري." },
    { category: "accompagnement", question: "من أين تأتي شتلات النخيل؟", answer: "تأتي شتلاتنا من بذور معتمدة من أصل إيرو لامي، يوفرها شريكنا ليه بالميست. وهي من صنف تينيرا المقاوم للفوزاريوم، مما يضمن نباتات عالية الجودة وإنتاجية." },
    { category: "accompagnement", question: "ما هي مراحل البرنامج؟", answer: "يتم البرنامج في 5 مراحل: (1) التنقيب وتعبئة الأسر المستفيدة، (2) إنشاء المزارع بشتلات معتمدة، (3) بناء القدرات والتدريب، (4) المتابعة التقنية والدعم المستمر، (5) الوصول للسوق مع ضمان التسويق." },
    { category: "garanties", question: "ما ضمان التسويق الذي تقدمه أغريكابيتال؟", answer: "تلتزم أغريكابيتال بضمان تسويق 100% من إنتاج عناقيد النخيل الطازجة بأسعار السوق، لمدة لا تقل عن 20 عاماً. يضمن هذا منافذ مستقرة ودخلاً يمكن التنبؤ به لجميع المستفيدين." },
    { category: "garanties", question: "كيف تؤمّن أغريكابيتال البرنامج؟", answer: "يعتمد التأمين على: نموذج تضامني مثبت، شراكات صناعية للتسويق، دعم تقني يقلل المخاطر، الشفافية وإمكانية التتبع في العمليات، والتزام تعاقدي طويل الأمد." },
    { category: "offres", question: "ما هي الأهداف الاجتماعية للبرنامج؟", answer: "بحلول عام 2030، يهدف البرنامج إلى مرافقة 1000 أسرة ريفية (60% منهم نساء وشباب)، تثمين 500 هكتار من الأراضي غير المستغلة، تعزيز القدرات التقنية للمستفيدين، زيادة الدخل الزراعي والأمن الغذائي، والمساهمة في المرونة المناخية." },
    { category: "offres", question: "كيف يعزز البرنامج تمكين المرأة؟", answer: "يتضمن البرنامج جلسات تدريبية خاصة للنساء والشباب حول الإدارة الزراعية وريادة الأعمال الريفية. 60% من المستفيدين المستهدفين هم من النساء والشباب، مع مجموعات دعم مجتمعية مخصصة." },
    { category: "offres", question: "كيف يساهم البرنامج في المرونة المناخية؟", answer: "يعزز البرنامج الممارسات الزراعية الصديقة للبيئة، ويستخدم أصناف نباتية متكيفة مع المناخ المحلي، ويرفع وعي المستفيدين حول حماية البيئة والممارسات المستدامة." },
    { category: "investissement", question: "كيف يمكنني دعم برنامج النخيل التضامني؟", answer: "عدة أشكال من الشراكة ممكنة: شراكة عقارية (توفير الأراضي)، شراكة تقنية، شراكة مؤسسية (منظمات غير حكومية، مؤسسات)، أو شراكة مالية. تواصل مع فريقنا لمناقشة الترتيبات المناسبة لوضعك." },
    { category: "investissement", question: "هل البرنامج مفتوح للمؤسسات والمنظمات؟", answer: "بالتأكيد. برنامج النخيل التضامني مصمم لاستقبال الشركاء المؤسسيين والمؤسسات والمنظمات غير الحكومية الراغبة في المساهمة في التنمية الريفية المستدامة وتمكين المجتمعات الضعيفة في كوت ديفوار." },
    { category: "entreprise", question: "ما هي خبرة فريق أغريكابيتال؟", answer: "يمتلك المؤسس إينوسنت كوفي 12 عاماً من الخبرة المهنية الميدانية، حيث زار أكثر من 360 موقعاً في 8 مناطق من كوت ديفوار. هذه المعرفة العميقة بالواقع الريفي مكّنت من تصميم برنامج النخيل التضامني المتكيف مع الاحتياجات الحقيقية للمجتمعات." },
    { category: "entreprise", question: "ما هي رؤية أغريكابيتال؟", answer: "رؤيتنا هي تحسين ظروف معيشة الأسر الريفية بشكل مستدام من خلال زراعة شاملة ومرنة. نسعى لتحفيز الاقتصاد الريفي، والمساهمة في الأمن الغذائي، والحد من النزوح الريفي، والتأثير إيجابياً على الأجيال القادمة." },
    { category: "entreprise", question: "كيف يمكن التواصل مع أغريكابيتال؟", answer: "يمكنكم التواصل معنا عبر الهاتف/واتساب على الرقم +225 05 64 55 17 17، أو بالبريد الإلكتروني contact@agricapital.ci، أو زيارة موقعنا www.agricapital.ci. مقرنا في غوناتي، دالوا، كوت ديفوار." },
  ],
  es: [
    { category: "general", question: "¿Qué es AgriCapital?", answer: "AGRICAPITAL SARL es una empresa marfileña especializada en el acompañamiento agrícola inclusivo. Dirige el programa «Palma Solidaria», un modelo innovador que permite a las familias rurales vulnerables acceder al sector del aceite de palma con acompañamiento técnico completo y garantía de comercialización." },
    { category: "general", question: "¿Qué es el programa Palma Solidaria?", answer: "El programa «Palma Solidaria» busca mejorar de manera sostenible las condiciones de vida de las familias rurales vulnerables a través de una agricultura inclusiva, sostenible y resiliente al cambio climático. Se dirige prioritariamente a mujeres, jóvenes y jefes de hogar en la región de Haut-Sassandra." },
    { category: "general", question: "¿Dónde se encuentra AgriCapital?", answer: "Nuestra sede está en Gonaté, Daloa, en la región de Haut-Sassandra en Costa de Marfil. Nuestra zona de intervención cubre Daloa, Vavoua, Zoukougbeu e Issia." },
    { category: "general", question: "¿Es AgriCapital una empresa legal?", answer: "Sí, AGRICAPITAL SARL está formalmente constituida y operativa, registrada bajo el número RCCM CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "¿Quién puede beneficiarse del programa?", answer: "El programa se dirige a familias rurales vulnerables, principalmente mujeres, jóvenes y jefes de hogar con tierras por valorizar. También está abierto a propietarios de tierras, productores y cualquier persona que desee participar en el desarrollo del sector del aceite de palma." },
    { category: "accompagnement", question: "¿En qué consiste el acompañamiento de AgriCapital?", answer: "Nuestro acompañamiento integrado incluye: suministro de plantones certificados Tenera e insumos adaptados, seguimiento técnico continuo por técnicos calificados, formaciones prácticas sobre técnicas agrícolas sostenibles, sesiones dedicadas a mujeres y jóvenes sobre emprendimiento rural, y garantía de comercialización." },
    { category: "accompagnement", question: "¿Qué aporta el beneficiario?", answer: "El beneficiario aporta su parcela de tierra y la mano de obra local para los trabajos de campo (limpieza, desmonte, ahoyado, plantación, mantenimiento). AgriCapital proporciona los insumos, la experiencia técnica y la garantía comercial." },
    { category: "accompagnement", question: "¿De dónde provienen los plantones de palma?", answer: "Nuestros plantones provienen de semillas certificadas de origen Iro Lamé, suministradas por nuestro socio Les Palmistes. Son de la variedad Tenera, tolerante a la fusariosis, garantizando plantas de alta calidad y productivas." },
    { category: "accompagnement", question: "¿Cuáles son las etapas del programa?", answer: "El programa se desarrolla en 5 etapas: (1) Prospección y movilización de familias beneficiarias, (2) Establecimiento de plantaciones con plantones certificados, (3) Fortalecimiento de capacidades y formación, (4) Seguimiento técnico y acompañamiento continuo, (5) Acceso al mercado con garantía de comercialización." },
    { category: "garanties", question: "¿Qué garantía de comercialización ofrece AgriCapital?", answer: "AgriCapital se compromete a asegurar la comercialización del 100% de la producción de racimos de palma fresca a precios de mercado, durante un mínimo de 20 años. Esta garantía asegura salidas estables e ingresos predecibles para todos los beneficiarios." },
    { category: "garanties", question: "¿Cómo asegura AgriCapital el programa?", answer: "La seguridad se basa en: un modelo solidario probado, asociaciones industriales para la comercialización, acompañamiento técnico que reduce los riesgos, transparencia y trazabilidad de las operaciones, y un compromiso contractual a largo plazo." },
    { category: "offres", question: "¿Cuáles son los objetivos sociales del programa?", answer: "Para 2030, el programa busca acompañar a 1.000 familias rurales (60% mujeres y jóvenes), valorizar 500 hectáreas de tierras subutilizadas, fortalecer las capacidades técnicas de los beneficiarios, aumentar los ingresos agrícolas y la seguridad alimentaria, y contribuir a la resiliencia climática." },
    { category: "offres", question: "¿Cómo favorece el programa la autonomización de las mujeres?", answer: "El programa integra sesiones de formación específicas para mujeres y jóvenes sobre gestión agrícola y emprendimiento rural. El 60% de los beneficiarios objetivo son mujeres y jóvenes, con grupos de apoyo comunitario dedicados." },
    { category: "offres", question: "¿Cómo contribuye el programa a la resiliencia climática?", answer: "El programa promueve prácticas agrícolas respetuosas con el medio ambiente, utiliza variedades de plantas adaptadas al clima local, y sensibiliza a los beneficiarios sobre la protección ambiental y las prácticas sostenibles." },
    { category: "investissement", question: "¿Cómo puedo apoyar el programa Palma Solidaria?", answer: "Varias formas de asociación son posibles: asociación territorial (puesta a disposición de tierras), asociación técnica, asociación institucional (ONG, fundaciones), o asociación financiera. Contacte a nuestro equipo para discutir las modalidades adaptadas a su situación." },
    { category: "investissement", question: "¿El programa está abierto a instituciones y fundaciones?", answer: "Absolutamente. El programa Palma Solidaria está diseñado para recibir socios institucionales, fundaciones y ONG que deseen contribuir al desarrollo rural sostenible y la autonomización de las comunidades vulnerables en Costa de Marfil." },
    { category: "entreprise", question: "¿Cuál es la experiencia del equipo AgriCapital?", answer: "El fundador Inocent KOFFI posee 12 años de experiencia profesional de campo, habiendo recorrido más de 360 localidades en 8 regiones de Costa de Marfil. Este conocimiento profundo de las realidades rurales permitió diseñar el programa Palma Solidaria, adaptado a las necesidades reales de las comunidades." },
    { category: "entreprise", question: "¿Cuál es la visión de AgriCapital?", answer: "Nuestra visión es mejorar de manera sostenible las condiciones de vida de las familias rurales a través de una agricultura inclusiva y resiliente. Queremos estimular la economía rural, contribuir a la seguridad alimentaria, reducir el éxodo rural e impactar positivamente a las generaciones futuras." },
    { category: "entreprise", question: "¿Cómo contactar a AgriCapital?", answer: "Puede contactarnos por teléfono/WhatsApp al +225 05 64 55 17 17, por email a contact@agricapital.ci, o visitar nuestro sitio web www.agricapital.ci. Nuestra sede está en Gonaté, Daloa, Costa de Marfil." },
  ],
  de: [
    { category: "general", question: "Was ist AgriCapital?", answer: "AGRICAPITAL SARL ist ein ivorisches Unternehmen, das auf inklusive landwirtschaftliche Begleitung spezialisiert ist. Es leitet das Programm «Solidarische Palme», ein innovatives Modell, das es gefährdeten ländlichen Familien ermöglicht, mit umfassender technischer Unterstützung und garantierter Vermarktung Zugang zum Ölpalmensektor zu erhalten." },
    { category: "general", question: "Was ist das Programm Solidarische Palme?", answer: "Das Programm «Solidarische Palme» zielt darauf ab, die Lebensbedingungen gefährdeter ländlicher Familien durch inklusive, nachhaltige und klimaresiliente Landwirtschaft dauerhaft zu verbessern. Es richtet sich vorrangig an Frauen, Jugendliche und Haushaltsvorstände in der Region Haut-Sassandra." },
    { category: "general", question: "Wo befindet sich AgriCapital?", answer: "Unser Hauptsitz ist in Gonaté, Daloa, in der Region Haut-Sassandra in der Elfenbeinküste. Unser Einsatzgebiet umfasst Daloa, Vavoua, Zoukougbeu und Issia." },
    { category: "general", question: "Ist AgriCapital ein legal registriertes Unternehmen?", answer: "Ja, AGRICAPITAL SARL ist formell gegründet und betriebsbereit, eingetragen unter RCCM-Nummer CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "Wer kann vom Programm profitieren?", answer: "Das Programm richtet sich an gefährdete ländliche Familien, hauptsächlich Frauen, Jugendliche und Haushaltsvorstände mit zu entwickelndem Land. Es steht auch Landbesitzern, Produzenten und allen offen, die an der Entwicklung des Ölpalmensektors teilnehmen möchten." },
    { category: "accompagnement", question: "Was umfasst die Begleitung von AgriCapital?", answer: "Unsere integrierte Begleitung umfasst: zertifizierte Tenera-Setzlinge und angepasste Betriebsmittel, kontinuierliche technische Überwachung durch qualifizierte Techniker, praktische Schulungen zu nachhaltigen Agrartechniken, spezielle Sitzungen für Frauen und Jugendliche zu ländlichem Unternehmertum, und garantierte Vermarktung." },
    { category: "accompagnement", question: "Was bringt der Begünstigte ein?", answer: "Der Begünstigte bringt sein Grundstück und lokale Arbeitskräfte für die Feldarbeit ein (Rodung, Graben, Pflanzen, Pflege). AgriCapital liefert Betriebsmittel, technische Expertise und Handelsgarantie." },
    { category: "accompagnement", question: "Woher kommen die Palmsetzlinge?", answer: "Unsere Setzlinge stammen aus zertifiziertem Saatgut von Iro Lamé-Herkunft, geliefert von unserem Partner Les Palmistes. Es handelt sich um die fusariumtolerante Tenera-Sorte, die qualitativ hochwertige und produktive Pflanzen gewährleistet." },
    { category: "accompagnement", question: "Welche Phasen hat das Programm?", answer: "Das Programm verläuft in 5 Phasen: (1) Prospektion und Mobilisierung der Begünstigtenfamilien, (2) Aufbau der Plantagen mit zertifizierten Setzlingen, (3) Kapazitätsaufbau und Schulung, (4) Technische Überwachung und kontinuierliche Begleitung, (5) Marktzugang mit garantierter Vermarktung." },
    { category: "garanties", question: "Welche Vermarktungsgarantie bietet AgriCapital?", answer: "AgriCapital verpflichtet sich, die Vermarktung von 100% der Produktion frischer Palmfruchtbündel zu Marktpreisen über mindestens 20 Jahre zu gewährleisten. Diese Garantie sichert stabile Absatzmärkte und planbare Einkommen für alle Begünstigten." },
    { category: "garanties", question: "Wie sichert AgriCapital das Programm ab?", answer: "Die Absicherung basiert auf: einem bewährten Solidaritätsmodell, Industriepartnerschaften für die Vermarktung, risikominimierender technischer Begleitung, Transparenz und Rückverfolgbarkeit der Operationen, und langfristiger vertraglicher Bindung." },
    { category: "offres", question: "Was sind die sozialen Ziele des Programms?", answer: "Bis 2030 soll das Programm 1.000 ländliche Familien begleiten (60% Frauen und Jugendliche), 500 Hektar untergenutzte Flächen aufwerten, die technischen Fähigkeiten der Begünstigten stärken, landwirtschaftliche Einkommen und Ernährungssicherheit erhöhen, und zur Klimaresilienz beitragen." },
    { category: "offres", question: "Wie fördert das Programm die Stärkung der Frauen?", answer: "Das Programm umfasst spezifische Schulungen für Frauen und Jugendliche zur landwirtschaftlichen Verwaltung und ländlichem Unternehmertum. 60% der Zielbegünstigten sind Frauen und Jugendliche, mit eigenen Gemeinschaftsunterstützungsgruppen." },
    { category: "offres", question: "Wie trägt das Programm zur Klimaresilienz bei?", answer: "Das Programm fördert umweltfreundliche landwirtschaftliche Praktiken, verwendet an das lokale Klima angepasste Pflanzensorten und sensibilisiert die Begünstigten für Umweltschutz und nachhaltige Praktiken." },
    { category: "investissement", question: "Wie kann ich das Programm Solidarische Palme unterstützen?", answer: "Verschiedene Partnerschaftsformen sind möglich: Landpartnerschaft (Bereitstellung von Flächen), technische Partnerschaft, institutionelle Partnerschaft (NGOs, Stiftungen), oder finanzielle Partnerschaft. Kontaktieren Sie unser Team, um die für Ihre Situation geeigneten Modalitäten zu besprechen." },
    { category: "investissement", question: "Ist das Programm offen für Institutionen und Stiftungen?", answer: "Absolut. Das Programm Solidarische Palme ist dafür konzipiert, institutionelle Partner, Stiftungen und NGOs aufzunehmen, die zur nachhaltigen ländlichen Entwicklung und Ermächtigung gefährdeter Gemeinschaften in der Elfenbeinküste beitragen möchten." },
    { category: "entreprise", question: "Welche Erfahrung hat das AgriCapital-Team?", answer: "Gründer Inocent KOFFI verfügt über 12 Jahre professionelle Felderfahrung und hat über 360 Ortschaften in 8 Regionen der Elfenbeinküste besucht. Dieses tiefe Wissen über ländliche Realitäten ermöglichte die Konzeption des Programms Solidarische Palme, angepasst an die tatsächlichen Bedürfnisse der Gemeinschaften." },
    { category: "entreprise", question: "Was ist AgriCapitals Vision?", answer: "Unsere Vision ist es, die Lebensbedingungen ländlicher Familien durch inklusive und resiliente Landwirtschaft nachhaltig zu verbessern. Wir wollen die ländliche Wirtschaft ankurbeln, zur Ernährungssicherheit beitragen, die Landflucht reduzieren und zukünftige Generationen positiv beeinflussen." },
    { category: "entreprise", question: "Wie kann man AgriCapital kontaktieren?", answer: "Sie erreichen uns per Telefon/WhatsApp unter +225 05 64 55 17 17, per E-Mail an contact@agricapital.ci, oder besuchen Sie unsere Website www.agricapital.ci. Unser Hauptsitz ist in Gonaté, Daloa, Elfenbeinküste." },
  ],
  zh: [
    { category: "general", question: "什么是AgriCapital？", answer: "AGRICAPITAL SARL是一家专注于包容性农业支持的科特迪瓦企业。它领导着「团结棕榈」计划，这是一个创新模式，使脆弱的农村家庭能够获得全面的技术支持和生产销售保障，进入油棕行业。" },
    { category: "general", question: "什么是团结棕榈计划？", answer: "「团结棕榈」计划旨在通过包容性、可持续和气候韧性农业，持续改善脆弱农村家庭的生活条件。它优先针对上萨桑德拉地区的妇女、青年和户主。" },
    { category: "general", question: "AgriCapital在哪里？", answer: "我们的总部位于科特迪瓦上萨桑德拉地区达洛阿的戈纳泰。我们的业务范围覆盖达洛阿、瓦武阿、祖库格布和伊西亚。" },
    { category: "general", question: "AgriCapital是合法注册的企业吗？", answer: "是的，AGRICAPITAL SARL已正式成立并运营，在商业登记处注册号为CI-DAL-01-2025-B12-13435。" },
    { category: "general", question: "谁可以从该计划中受益？", answer: "该计划面向脆弱的农村家庭，主要是拥有待开发土地的妇女、青年和户主。同时也向土地所有者、生产者和所有希望参与油棕行业发展的人开放。" },
    { category: "accompagnement", question: "AgriCapital的支持包括什么？", answer: "我们的综合支持包括：提供认证的Tenera种苗和适配投入品、合格技术人员的持续技术跟踪、可持续农业技术的实践培训、针对妇女和青年的农村创业专题培训，以及生产销售保障。" },
    { category: "accompagnement", question: "受益人需要提供什么？", answer: "受益人提供自己的土地和当地劳动力进行田间作业（清理、开垦、挖坑、种植、维护）。AgriCapital提供投入品、技术专长和商业保障。" },
    { category: "accompagnement", question: "棕榈种苗来自哪里？", answer: "我们的种苗来自Iro Lamé原产的认证种子，由我们的合作伙伴Les Palmistes供应。这是耐镰刀菌的Tenera品种，保证高质量和高产植物。" },
    { category: "accompagnement", question: "计划有哪些阶段？", answer: "计划分为5个阶段：(1)受益家庭的勘探和动员，(2)用认证种苗建立种植园，(3)能力建设和培训，(4)技术跟踪和持续支持，(5)保障销售的市场准入。" },
    { category: "garanties", question: "AgriCapital提供什么销售保障？", answer: "AgriCapital承诺以市场价格确保100%新鲜棕榈果串产量的销售，最低期限为20年。这一保障确保所有受益人拥有稳定的销售渠道和可预测的收入。" },
    { category: "garanties", question: "AgriCapital如何保障计划安全？", answer: "安全保障基于：经过验证的团结模式、工业合作伙伴关系确保销售、降低风险的技术支持、运营的透明度和可追溯性，以及长期合同承诺。" },
    { category: "offres", question: "计划的社会目标是什么？", answer: "到2030年，计划旨在支持1,000个农村家庭（60%为妇女和青年），开发500公顷未充分利用的土地，加强受益人的技术能力，增加农业收入和粮食安全，并促进气候韧性。" },
    { category: "offres", question: "计划如何促进妇女赋权？", answer: "计划包括针对妇女和青年的农业管理和农村创业专题培训。60%的目标受益人是妇女和青年，配有专门的社区互助小组。" },
    { category: "offres", question: "计划如何促进气候韧性？", answer: "计划推广环保农业实践，使用适应当地气候的植物品种，并提高受益人对环境保护和可持续实践的意识。" },
    { category: "investissement", question: "我如何支持团结棕榈计划？", answer: "多种合作形式可供选择：土地合作（提供土地）、技术合作、机构合作（非政府组织、基金会），或财务合作。请联系我们的团队讨论适合您情况的安排。" },
    { category: "investissement", question: "该计划对机构和基金会开放吗？", answer: "当然。团结棕榈计划旨在欢迎希望为科特迪瓦可持续农村发展和脆弱社区赋权做出贡献的机构合作伙伴、基金会和非政府组织。" },
    { category: "entreprise", question: "AgriCapital团队有什么经验？", answer: "创始人Inocent KOFFI拥有12年的专业实地经验，走访了科特迪瓦8个地区的360多个地点。这种对农村现实的深入了解使得团结棕榈计划得以设计，适应社区的真实需求。" },
    { category: "entreprise", question: "AgriCapital的愿景是什么？", answer: "我们的愿景是通过包容和韧性的农业持续改善农村家庭的生活条件。我们希望刺激农村经济，促进粮食安全，减少农村外流，并积极影响后代。" },
    { category: "entreprise", question: "如何联系AgriCapital？", answer: "您可以通过电话/WhatsApp +225 05 64 55 17 17联系我们，通过电子邮件contact@agricapital.ci，或访问我们的网站www.agricapital.ci。我们的总部位于科特迪瓦达洛阿戈纳泰。" },
  ],
};

const FAQ = () => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("general");
  const navigate = useNavigate();

  const ft = t.faq || {
    title: "Foire Aux Questions",
    subtitle: "Trouvez rapidement les réponses à vos questions.",
    categories: { general: "Général", offers: "Nos Offres", investment: "Investissement", support: "Accompagnement", guarantees: "Garanties", company: "L'Entreprise" },
    noQuestions: "Aucune question dans cette catégorie.",
    ctaTitle: "Vous n'avez pas trouvé votre réponse ?",
    ctaSubtitle: "Notre équipe est disponible pour répondre à toutes vos questions.",
    contactUs: "Nous contacter",
  };

  const categories = [
    { id: "general", label: ft.categories.general, icon: HelpCircle },
    { id: "offres", label: ft.categories.offers, icon: Leaf },
    { id: "investissement", label: ft.categories.investment, icon: TrendingUp },
    { id: "accompagnement", label: ft.categories.support, icon: Users },
    { id: "garanties", label: ft.categories.guarantees, icon: Shield },
    { id: "entreprise", label: ft.categories.company, icon: Building2 },
  ];

  const faqItems = faqTranslations[language] || faqTranslations.fr;
  const filteredFAQ = faqItems.filter(item => item.category === activeCategory);

  const scrollToContact = () => {
    navigate('/#contact');
  };

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        <section className="py-12 sm:py-16 bg-agri-green text-white">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{ft.title}</h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">{ft.subtitle}</p>
          </div>
        </section>

        <section className="py-8 border-b bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"}
                    className={`flex items-center gap-2 ${activeCategory === cat.id ? "bg-agri-green hover:bg-agri-green-dark text-white" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-4 sm:px-6 shadow-sm">
                  <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-5">
                    <span className="text-sm sm:text-base font-medium pr-4">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4 sm:pb-5 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFAQ.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{ft.noQuestions}</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gradient-to-r from-agri-green/10 to-accent/10">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl sm:text-2xl">{ft.ctaTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">{ft.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={scrollToContact} className="bg-agri-green hover:bg-agri-green-dark">
                    <MessageCircle className="w-4 h-4 mr-2" />{ft.contactUs}<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" asChild><a href="tel:+2250564551717"><Phone className="w-4 h-4 mr-2" />05 64 55 17 17</a></Button>
                  <Button variant="outline" asChild><a href="mailto:contact@agricapital.ci"><Mail className="w-4 h-4 mr-2" />Email</a></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
