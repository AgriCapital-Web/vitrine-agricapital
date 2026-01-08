import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ag1 from "@/assets/ag-2026-1.jpg";
import ag2 from "@/assets/ag-2026-2.jpg";
import ag3 from "@/assets/ag-2026-3.jpg";
import ag4 from "@/assets/ag-2026-4.jpg";
import ag5 from "@/assets/ag-2026-5.jpg";

// First featured article data (AG 2026)
const firstArticle = {
  id: "ag-2026",
  slug: "assemblee-generale-2026",
  title_fr: "AGRICAPITAL | Assemblée Générale Ordinaire Annuelle 2026",
  title_en: "AGRICAPITAL | Annual General Meeting 2026",
  content_fr: `Le 07 janvier 2026, AgriCapital SARL a tenu sa première Assemblée Générale Ordinaire Annuelle, réunissant l'ensemble de ses associés.

Fidèle à son identité, la rencontre s'est déroulée en plein air, directement sur le terrain, là où les décisions prennent tout leur sens.

Sans attendre de salle climatisée. Pas de bureau luxueux. Mais des échanges francs, des décisions claires et une direction assumée.

Parce que, chez AgriCapital, la vision se construit dans l'action, avec méthode, rigueur et responsabilité.

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

Monsieur Inocent Koffi, Fondateur et Directeur Général, a présenté le budget prévisionnel ainsi que les grandes orientations stratégiques pour l'exercice 2026.

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

- l'accompagnement agricole et les services intégrés ;
- la création et le développement de plantations de palmier à huile.

AgriCapital se positionne comme un **acteur structurant et facilitateur** d'un modèle agricole inclusif, durable et économiquement viable, associant producteurs, partenaires techniques, investisseurs, institutions et acteurs locaux.

---

À l'issue de l'Assemblée Générale, les associés ont validé l'ouverture d'un **dispositif d'investissement structuré**, permettant aux personnes physiques et morales intéressées de participer au financement des projets d'AgriCapital, dans un cadre :

- rigoureux,
- transparent,
- orienté vers la création de valeur durable, à moyen et long terme.`,
  excerpt_fr: "AgriCapital SARL a tenu sa première Assemblée Générale Ordinaire Annuelle le 07 janvier 2026, réunissant l'ensemble de ses associés pour valider les orientations stratégiques 2026.",
  images: [ag1, ag2, ag3, ag4, ag5],
  published_at: "2026-01-07T12:00:00Z",
  author: "AgriCapital",
  category: "corporate"
};

const translations = {
  fr: {
    title: "Actualités",
    subtitle: "Suivez les dernières nouvelles et évolutions d'AgriCapital",
    noNews: "Aucune actualité pour le moment",
    readMore: "Lire la suite",
    evolution: "Voir l'évolution",
    views: "vues",
    by: "Par",
    seeAll: "Toutes les actualités"
  },
  en: {
    title: "News",
    subtitle: "Follow the latest news and developments from AgriCapital",
    noNews: "No news at the moment",
    readMore: "Read more",
    evolution: "See evolution",
    views: "views",
    by: "By",
    seeAll: "All news"
  },
  ar: {
    title: "الأخبار",
    subtitle: "تابع آخر الأخبار والتطورات من أغريكابيتال",
    noNews: "لا توجد أخبار حالياً",
    readMore: "اقرأ المزيد",
    evolution: "شاهد التطور",
    views: "مشاهدات",
    by: "بواسطة",
    seeAll: "جميع الأخبار"
  },
  es: {
    title: "Noticias",
    subtitle: "Siga las últimas noticias y desarrollos de AgriCapital",
    noNews: "No hay noticias por el momento",
    readMore: "Leer más",
    evolution: "Ver evolución",
    views: "vistas",
    by: "Por",
    seeAll: "Todas las noticias"
  },
  de: {
    title: "Nachrichten",
    subtitle: "Verfolgen Sie die neuesten Nachrichten und Entwicklungen von AgriCapital",
    noNews: "Derzeit keine Nachrichten",
    readMore: "Weiterlesen",
    evolution: "Entwicklung ansehen",
    views: "Aufrufe",
    by: "Von",
    seeAll: "Alle Nachrichten"
  },
  zh: {
    title: "新闻",
    subtitle: "关注AgriCapital的最新新闻和发展动态",
    noNews: "暂无新闻",
    readMore: "阅读更多",
    evolution: "查看发展",
    views: "浏览量",
    by: "作者",
    seeAll: "所有新闻"
  }
};

const News = () => {
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;

  // Fetch news from database
  const { data: newsFromDb } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  // Combine with first article
  const allNews = [firstArticle, ...(newsFromDb || [])];

  const getLocalizedField = (item: any, field: string) => {
    const langField = `${field}_${language}`;
    return item[langField] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-agri-green/10 to-agri-orange/5">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-agri-green/20 text-agri-green border-0">
              <Newspaper className="w-4 h-4 mr-2" />
              {tr.title}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {tr.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {tr.subtitle}
            </p>
          </div>
        </section>

        {/* Featured Article */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden border-2 border-agri-green/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Carousel */}
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {firstArticle.images.map((img, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video">
                            <img 
                              src={img} 
                              alt={`AG 2026 - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </Carousel>
                </div>
                
                {/* Content */}
                <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-agri-orange/20 text-agri-orange border-0">
                    À la une
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {getLocalizedField(firstArticle, 'title')}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-4">
                    {getLocalizedField(firstArticle, 'excerpt')}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(firstArticle.published_at)}
                    </span>
                    <span>{tr.by} {firstArticle.author}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="bg-agri-green hover:bg-agri-green/90">
                      <Link to={`/actualites/${firstArticle.slug}`}>
                        {tr.readMore}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/evolution">
                        {tr.evolution}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* News Grid */}
        {newsFromDb && newsFromDb.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8">{tr.seeAll}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsFromDb.map((article: any) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {article.featured_image && (
                      <div className="aspect-video">
                        <img 
                          src={article.featured_image} 
                          alt={getLocalizedField(article, 'title')}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {getLocalizedField(article, 'title')}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {getLocalizedField(article, 'excerpt')}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views_count || 0} {tr.views}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default News;
