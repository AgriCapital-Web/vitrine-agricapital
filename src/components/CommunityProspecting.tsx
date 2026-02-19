import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users, MapPin, Handshake, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import prospectImage1 from "@/assets/community-meeting-1.jpg";
import prospectImage2 from "@/assets/community-meeting-2.jpg";
import prospectImage3 from "@/assets/community-meeting-3.png";
import prospectImage4 from "@/assets/community-meeting-4.jpg";
import prospectImage5 from "@/assets/community-meeting-5.jpg";
import prospectImage6 from "@/assets/community-meeting-6.jpg";
import prospectImage7 from "@/assets/community-meeting-7.jpg";
import prospectImage8 from "@/assets/community-meeting-8.jpg";
import prospectImage9 from "@/assets/prospect-meeting-9.jpg";
import prospectImage10 from "@/assets/prospect-meeting-10.jpg";
import prospectImage11 from "@/assets/prospect-meeting-11.jpg";
import prospectImage12 from "@/assets/prospect-meeting-12.jpg";
import prospectImage13 from "@/assets/prospect-meeting-13.jpg";
import prospectImage14 from "@/assets/prospect-meeting-14.jpg";

const translations = {
  fr: {
    title: "Prospection Communautaire",
    subtitle: "Un ancrage terrain solide au service du programme Palmier Solidaire",
    description: "De 2012 à 2024, Inocent KOFFI, fondateur d'AgriCapital, a sillonné à travers son expérience professionnelle plus de 360 localités dans 8 régions de Côte d'Ivoire. Cette démarche constitue une pré-prospection précieuse, ayant permis d'identifier des réalités identiques chez les planteurs à travers le pays — démontrant le potentiel de scalabilité du programme et l'urgence d'agir pour ces communautés. AgriCapital capitalise aujourd'hui sur cette connaissance terrain pour déployer le programme « Palmier Solidaire » dans la région du Haut-Sassandra.",
    stats: {
      localities: "30+ villages mobilisés",
      regions: "Région du Haut-Sassandra",
      producers: "200+ producteurs identifiés",
      years: "Opérations lancées en 2025",
    },
    galleryTitle: "Photos de Prospection Terrain",
    badge: "Entreprise à impact social",
    highlights: [
      "Rencontres directes avec les producteurs, propriétaires terriens et familles vulnérables",
      "Présentation du programme Palmier Solidaire et du modèle d'accompagnement",
      "Identification des bénéficiaires et des parcelles à valoriser",
      "Sensibilisation sur les bonnes pratiques agricoles et la résilience climatique",
    ],
  },
  en: {
    title: "Community Prospecting",
    subtitle: "A solid field foundation for the Solidarity Palm program",
    description: "From 2012 to 2024, Inocent KOFFI, founder of AgriCapital, traveled through his professional experience to over 360 localities across 8 regions of Côte d'Ivoire. This process constitutes invaluable pre-prospecting, identifying identical realities among growers across the country — demonstrating the program's scalability potential and the urgency to act for these communities. AgriCapital now leverages this field knowledge to deploy the 'Solidarity Palm' program in the Haut-Sassandra region.",
    stats: {
      localities: "30+ villages mobilized",
      regions: "Haut-Sassandra region",
      producers: "200+ producers identified",
      years: "Operations launched in 2025",
    },
    galleryTitle: "Field Prospecting Photos",
    badge: "Social impact company",
    highlights: [
      "Direct meetings with producers, landowners and vulnerable families",
      "Presentation of the Solidarity Palm program and support model",
      "Identification of beneficiaries and plots to develop",
      "Awareness on good agricultural practices and climate resilience",
    ],
  },
  ar: {
    title: "التنقيب المجتمعي",
    subtitle: "التزامنا الميداني مع المنتجين والمجتمعات الريفية في هوت ساساندرا",
    description: "من ٢٠١٢ إلى ٢٠٢٤، جاب إينوسنت كوفي، مؤسس أغريكابيتال، من خلال خبرته المهنية أكثر من ٣٦٠ موقعًا في ٨ مناطق من كوت ديفوار. تشكل هذه العملية استكشافًا مسبقًا قيمًا، مما سمح بتحديد حقائق متطابقة بين المزارعين في جميع أنحاء البلاد — مما يدل على إمكانية توسع البرنامج والحاجة الملحة للعمل من أجل هذه المجتمعات. تستثمر أغريكابيتال اليوم هذه المعرفة الميدانية لنشر برنامج « النخيل التضامني » في منطقة هوت ساساندرا.",
    stats: {
      localities: "+٣٠ قرية ملتزمة",
      regions: "منطقة هوت ساساندرا",
      producers: "+٢٠٠ منتج محدد",
      years: "بدء العمليات ٢٠٢٥",
    },
    galleryTitle: "صور التنقيب الميداني",
    badge: "شركة ذات أثر اجتماعي",
    highlights: [
      "لقاءات مباشرة مع المنتجين وملاك الأراضي",
      "تقديم نموذج أغريكابيتال وعروض الدعم",
      "تحديد وتعاقد القطع",
      "التوعية بالممارسات الزراعية الجيدة والمرونة المناخية",
    ],
  },
  es: {
    title: "Prospección Comunitaria",
    subtitle: "Nuestro compromiso de campo con los productores y comunidades rurales de Haut-Sassandra",
    description: "De 2012 a 2024, Inocent KOFFI, fundador de AgriCapital, recorrió a través de su experiencia profesional más de 360 localidades en 8 regiones de Costa de Marfil. Este proceso constituye una valiosa pre-prospección, habiendo permitido identificar realidades idénticas entre los agricultores de todo el país — demostrando el potencial de escalabilidad del programa y la urgencia de actuar para estas comunidades. AgriCapital capitaliza hoy este conocimiento de campo para desplegar el programa « Palma Solidaria » en la región de Haut-Sassandra.",
    stats: {
      localities: "30+ aldeas movilizadas",
      regions: "Región de Haut-Sassandra",
      producers: "200+ productores identificados",
      years: "Operaciones lanzadas en 2025",
    },
    galleryTitle: "Fotos de Prospección de Campo",
    badge: "Empresa de impacto social",
    highlights: [
      "Reuniones directas con productores y propietarios de tierras",
      "Presentación del modelo AgriCapital y ofertas de acompañamiento",
      "Identificación y contratación de parcelas",
      "Sensibilización sobre buenas prácticas agrícolas y resiliencia climática",
    ],
  },
  de: {
    title: "Gemeinschaftliche Prospektion",
    subtitle: "Unser Engagement vor Ort bei Produzenten und ländlichen Gemeinden in Haut-Sassandra",
    description: "Von 2012 bis 2024 bereiste Inocent KOFFI, Gründer von AgriCapital, durch seine berufliche Erfahrung mehr als 360 Ortschaften in 8 Regionen der Elfenbeinküste. Dieser Prozess stellt eine wertvolle Vorprospektion dar, die es ermöglichte, identische Realitäten bei den Pflanzern im ganzen Land zu identifizieren — was das Skalierbarkeitspotenzial des Programms und die Dringlichkeit des Handelns für diese Gemeinschaften demonstriert. AgriCapital nutzt heute dieses Feldwissen, um das Programm « Solidarische Palme » in der Region Haut-Sassandra einzusetzen.",
    stats: {
      localities: "30+ Dörfer mobilisiert",
      regions: "Region Haut-Sassandra",
      producers: "200+ identifizierte Produzenten",
      years: "Betrieb gestartet 2025",
    },
    galleryTitle: "Fotos der Feldprospektion",
    badge: "Soziales Unternehmen",
    highlights: [
      "Direkte Treffen mit Produzenten und Landbesitzern",
      "Präsentation des AgriCapital-Modells und der Begleitangebote",
      "Identifizierung und Vertragsabschluss von Parzellen",
      "Sensibilisierung für gute landwirtschaftliche Praktiken und Klimaresilienz",
    ],
  },
  zh: {
    title: "社区勘探",
    subtitle: "我们对上萨桑德拉地区生产者和农村社区的实地承诺",
    description: "从2012年到2024年，AgriCapital创始人Inocent KOFFI通过其专业经验走访了科特迪瓦8个地区的360多个地点。这一过程构成了宝贵的预勘探，使我们能够识别全国种植者中相同的现实——证明了该计划的可扩展性潜力和为这些社区采取行动的紧迫性。AgriCapital现在利用这一实地知识在上萨桑德拉地区部署「团结棕榈」计划。",
    stats: {
      localities: "30+个已动员村庄",
      regions: "上萨桑德拉地区",
      producers: "200+名已识别生产者",
      years: "2025年启动运营",
    },
    galleryTitle: "实地勘探照片",
    badge: "社会影响力企业",
    highlights: [
      "与生产者和土地所有者直接会面",
      "介绍AgriCapital模式和支持方案",
      "地块的识别和签约",
      "良好农业实践和气候适应力的宣传",
    ],
  },
};

const CommunityProspecting = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] || translations.fr;

  const prospectingImages = [
    prospectImage12, // Large gathering under tent
    prospectImage11, // Meeting with AgriCapital polo
    prospectImage13, // Village meeting
    prospectImage14, // Field discussion
    prospectImage9,  // Small group meeting
    prospectImage10, // Community porch meeting
    prospectImage1,
    prospectImage2,
    prospectImage3,
    prospectImage4,
    prospectImage5,
    prospectImage6,
    prospectImage7,
    prospectImage8,
  ];

  const statsData = [
    { icon: MapPin, value: t.stats.localities },
    { icon: Users, value: t.stats.regions },
    { icon: Handshake, value: t.stats.producers },
    { icon: TrendingUp, value: t.stats.years },
  ];

  return (
    <section id="prospection" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-agri-green/10 text-agri-green border-agri-green/30 hover:bg-agri-green/20">
            <Handshake className="w-3.5 h-3.5 mr-1.5" />
            {t.badge}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 max-w-4xl mx-auto">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-agri-green" />
                  <p className="text-sm md:text-base font-semibold text-foreground leading-tight">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Description & Highlights */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                {t.description}
              </p>
            </div>
            <div className="space-y-3">
              {t.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-agri-green mt-2 shrink-0" />
                  <p className="text-foreground text-sm md:text-base">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Gallery Carousel */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
            {t.galleryTitle}
          </h3>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {prospectingImages.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div
                    className="rounded-xl overflow-hidden shadow-medium aspect-[4/3] cursor-pointer group"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${t.galleryTitle} ${index + 1}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 md:-left-6" />
            <CarouselNext className="-right-2 md:-right-6" />
          </Carousel>
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={t.galleryTitle}
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CommunityProspecting;
