import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Share2, User, Eye, Loader2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ag1 from "@/assets/ag-2026-1.jpg";
import ag2 from "@/assets/ag-2026-2.jpg";
import ag3 from "@/assets/ag-2026-3.jpg";
import ag4 from "@/assets/ag-2026-4.jpg";
import ag5 from "@/assets/ag-2026-5.jpg";

// Hardcoded AG article (always available)
const agArticle: Record<string, any> = {
  "assemblee-generale-2026": {
    id: "ag-2026",
    slug: "assemblee-generale-2026",
    title_fr: "AGRICAPITAL | Assemblée Générale Ordinaire Annuelle 2026",
    title_en: "AGRICAPITAL | Annual General Meeting 2026",
    title_ar: "أغريكابيتال | الجمعية العمومية العادية السنوية 2026",
    title_es: "AGRICAPITAL | Asamblea General Ordinaria Anual 2026",
    title_de: "AGRICAPITAL | Jährliche Ordentliche Hauptversammlung 2026",
    title_zh: "AGRICAPITAL | 2026年度普通股东大会",
    content_fr: `Le 07 janvier 2026, AgriCapital SARL a tenu sa première Assemblée Générale Ordinaire Annuelle, réunissant l'ensemble de ses associés.

Fidèle à son identité, la rencontre s'est déroulée en plein air, directement sur le terrain, là où les décisions prennent tout leur sens.

Sans attendre de salle climatisée. Pas de bureau luxueux. Mais des échanges francs, des décisions claires et une direction assumée.

**Parce que, chez AgriCapital, la vision se construit dans l'action, avec méthode, rigueur et responsabilité.**

---

## À l'ordre du jour

### I. Bilan de constitution et lancement des activités

Le Fondateur et Directeur Général a présenté le bilan de constitution de l'entreprise ainsi que le démarrage effectif des activités, articulé autour de quatre jalons structurants :

- **18 octobre 2025** : Signature des statuts par les huit (8) associés, actant la création officielle d'AgriCapital SARL.
- **13 novembre 2025** : Obtention du RCCM, suivie de la DFE et des formalités administratives connexes, assurant la pleine conformité juridique de l'entreprise.
- **19 novembre 2025** : Lancement opérationnel des activités sur le terrain.
- **24 décembre 2025** : Mise en service du premier site de pépinière de 100 hectares, équipé d'un système d'irrigation autonome, dans le département de Daloa.

Ces étapes ont été franchies avant l'entrée en 2026, traduisant une exécution anticipée du projet.

---

### II. Budget prévisionnel et orientations stratégiques 2026

Monsieur **Inocent Koffi**, Fondateur et Directeur Général, a présenté le budget prévisionnel ainsi que les grandes orientations stratégiques pour l'exercice 2026.

Après échanges et analyses, l'Assemblée Générale a validé à l'unanimité les orientations proposées, marquant la volonté collective d'entrer dans une nouvelle phase de consolidation et de montée en charge des activités.

---

### III. Décisions opérationnelles et perspectives de déploiement

Dans le prolongement des orientations validées, l'Assemblée Générale a arrêté une décision opérationnelle majeure pour l'année 2026.

Il a ainsi été décidé la mise en place d'un **second site de pépinière de 100 hectares**, dans le département de Vavoua, secteur de Vrouho.

Cette extension portera la superficie totale encadrée par AgriCapital à **200 hectares**, renforçant la capacité opérationnelle de l'entreprise et son ancrage territorial.

Les associés ont exprimé une adhésion unanime à cette trajectoire de croissance progressive et maîtrisée.

---

### IV. Rappel : positionnement et vision opérationnelle

AGRICAPITAL SARL est aujourd'hui pleinement constituée et opérationnelle, avec un positionnement clair autour de :

- L'accompagnement agricole et les services intégrés
- La création et le développement de plantations de palmier à huile

AgriCapital se positionne comme un **acteur structurant et facilitateur** d'un modèle agricole inclusif, durable et économiquement viable, associant producteurs, partenaires techniques, investisseurs, institutions et acteurs locaux.

---

## Dispositif d'investissement structuré

À l'issue de l'Assemblée Générale, les associés ont validé l'ouverture d'un **dispositif d'investissement structuré**, permettant aux personnes physiques et morales intéressées de participer au financement des projets d'AgriCapital, dans un cadre rigoureux, transparent et orienté vers la création de valeur durable, à moyen et long terme.

Pour plus d'informations sur les modalités de participation, veuillez nous contacter directement.

---

## Contact

📞 (+225) 07 59 56 60 87 / 05 64 55 17 17  
📧 contact@agricapital.ci  
🌐 www.agricapital.ci`,
    content_en: `On January 7, 2026, AgriCapital SARL held its first Annual Ordinary General Meeting, bringing together all its associates.

True to its identity, the meeting took place outdoors, directly in the field, where decisions take on their full meaning.

No waiting for an air-conditioned room. No luxurious office. But frank exchanges, clear decisions, and assumed direction.

**Because, at AgriCapital, the vision is built in action, with method, rigor, and responsibility.**

---

## Agenda

### I. Constitution Report and Activity Launch

The Founder and Managing Director presented the company's constitution report and the effective start of activities, articulated around four structuring milestones:

- **October 18, 2025**: Signing of the statutes by the eight (8) associates, establishing the official creation of AgriCapital SARL.
- **November 13, 2025**: Obtaining the RCCM, followed by the DFE and related administrative formalities, ensuring the company's full legal compliance.
- **November 19, 2025**: Operational launch of activities in the field.
- **December 24, 2025**: Commissioning of the first 100-hectare nursery site, equipped with an autonomous irrigation system, in the Daloa department.

These stages were completed before entering 2026, reflecting an anticipated execution of the project.

---

### II. Provisional Budget and 2026 Strategic Orientations

Mr. **Inocent Koffi**, Founder and Managing Director, presented the provisional budget and major strategic orientations for 2026.

After exchanges and analysis, the General Assembly unanimously validated the proposed orientations, marking the collective will to enter a new phase of consolidation and ramp-up of activities.

---

### III. Operational Decisions and Deployment Perspectives

Following the validated orientations, the General Assembly made a major operational decision for 2026.

It was decided to establish a **second 100-hectare nursery site**, in the Vavoua department, Vrouho sector.

This extension will bring the total area managed by AgriCapital to **200 hectares**, strengthening the company's operational capacity and territorial presence.

The associates expressed unanimous support for this trajectory of progressive and controlled growth.

---

### IV. Reminder: Positioning and Operational Vision

AGRICAPITAL SARL is now fully constituted and operational, with a clear positioning around:

- Agricultural support and integrated services
- Creation and development of oil palm plantations

AgriCapital positions itself as a **structuring and facilitating actor** of an inclusive, sustainable, and economically viable agricultural model, associating producers, technical partners, investors, institutions, and local stakeholders.

---

## Structured Investment Scheme

At the end of the General Assembly, the associates validated the opening of a **structured investment scheme**, allowing interested individuals and legal entities to participate in the financing of AgriCapital's projects, within a rigorous, transparent framework oriented towards sustainable value creation in the medium and long term.

For more information on participation terms, please contact us directly.

---

## Contact

📞 (+225) 07 59 56 60 87 / 05 64 55 17 17  
📧 contact@agricapital.ci  
🌐 www.agricapital.ci`,
    images: [ag1, ag2, ag3, ag4, ag5],
    published_at: "2026-01-07T12:00:00Z",
    author: "AgriCapital",
    category: "corporate",
    views_count: 0
  }
};

const translations = {
  fr: { back: "Retour aux actualités", by: "Par", share: "Partager", views: "vues", notFound: "Article non trouvé", notFoundDesc: "L'article que vous recherchez n'existe pas ou a été déplacé." },
  en: { back: "Back to news", by: "By", share: "Share", views: "views", notFound: "Article not found", notFoundDesc: "The article you're looking for doesn't exist or has been moved." },
  ar: { back: "العودة إلى الأخبار", by: "بواسطة", share: "مشاركة", views: "مشاهدات", notFound: "المقال غير موجود", notFoundDesc: "المقال الذي تبحث عنه غير موجود أو تم نقله." },
  es: { back: "Volver a noticias", by: "Por", share: "Compartir", views: "vistas", notFound: "Artículo no encontrado", notFoundDesc: "El artículo que busca no existe o ha sido movido." },
  de: { back: "Zurück zu Nachrichten", by: "Von", share: "Teilen", views: "Aufrufe", notFound: "Artikel nicht gefunden", notFoundDesc: "Der Artikel, den Sie suchen, existiert nicht oder wurde verschoben." },
  zh: { back: "返回新闻", by: "作者", share: "分享", views: "浏览量", notFound: "文章未找到", notFoundDesc: "您要查找的文章不存在或已被移动。" }
};

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;
  const [viewCounted, setViewCounted] = useState(false);

  // Fetch from DB if not hardcoded
  const { data: dbArticle, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      if (!slug || agArticle[slug]) return null;
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!slug && !agArticle[slug]
  });

  // Determine the article source
  const article = slug ? (agArticle[slug] || dbArticle) : null;

  // Increment view count for DB articles
  useEffect(() => {
    if (dbArticle && !viewCounted) {
      setViewCounted(true);
      supabase
        .from("news")
        .update({ views_count: (dbArticle.views_count || 0) + 1 })
        .eq("id", dbArticle.id)
        .then(() => {});
    }
  }, [dbArticle, viewCounted]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const getLocalizedField = (item: any, field: string) => {
    if (!item) return "";
    const langField = `${field}_${language}`;
    return item[langField] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'zh' ? 'zh-CN' : 'fr-FR',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const parseContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-6 text-foreground border-b pb-2">$1</h2>')
      .replace(/- (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/---/g, '<hr class="my-8 border-border" />')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-muted-foreground">')
      .replace(/\n/g, '<br />');
  };

  if (isLoading) {
    return (
      <>
        <SEOHead />
        <DynamicNavigation />
        <main className="pt-24 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <SEOHead />
        <DynamicNavigation />
        <main className="pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">{tr.notFound}</h1>
            <p className="text-muted-foreground mb-8">{tr.notFoundDesc}</p>
            <Button asChild className="bg-agri-green hover:bg-agri-green/90">
              <Link to="/actualites">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {tr.back}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Get images - either local array or from DB JSON
  const images = article.images 
    ? (Array.isArray(article.images) ? article.images : JSON.parse(article.images || '[]'))
    : [];
  
  // For DB articles, use featured_image if no images array
  const displayImages = images.length > 0 ? images : (article.featured_image ? [article.featured_image] : []);

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/actualites">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tr.back}
            </Link>
          </Button>
        </div>

        <article className="container mx-auto px-4 max-w-4xl">
          <Badge className="mb-4 bg-agri-orange/20 text-agri-orange border-0">
            {article.category || 'Actualité'}
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {getLocalizedField(article, 'title')}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at || article.created_at)}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {tr.by} {article.author || 'AgriCapital'}
            </span>
            {article.views_count > 0 && (
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.views_count} {tr.views}
              </span>
            )}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
              if (navigator.share) {
                navigator.share({ title: getLocalizedField(article, 'title'), url: window.location.href });
              }
            }}>
              <Share2 className="w-4 h-4 mr-2" />
              {tr.share}
            </Button>
          </div>

          {displayImages.length > 0 && (
            <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
              <Carousel className="w-full">
                <CarouselContent>
                  {displayImages.map((img: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video md:aspect-[16/9]">
                        <img 
                          src={img} 
                          alt={`${getLocalizedField(article, 'title')} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {displayImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none mb-16"
            dangerouslySetInnerHTML={{ 
              __html: `<p class="mb-4 leading-relaxed text-muted-foreground">${parseContent(getLocalizedField(article, 'content'))}</p>` 
            }}
          />

          <div className="flex justify-center py-8 border-t">
            <Button className="bg-agri-green hover:bg-agri-green/90" onClick={() => {
              if (navigator.share) {
                navigator.share({ title: getLocalizedField(article, 'title'), url: window.location.href });
              }
            }}>
              <Share2 className="w-4 h-4 mr-2" />
              {tr.share}
            </Button>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default NewsArticle;
