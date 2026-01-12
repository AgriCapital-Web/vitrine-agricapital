import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Newspaper, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import ag1 from "@/assets/ag-2026-1.jpg";

const translations = {
  fr: {
    title: "Actualités",
    subtitle: "Les dernières nouvelles d'AgriCapital",
    moreNews: "Plus d'actualités",
    evolution: "Voir l'évolution",
    readMore: "Lire la suite",
    noNews: "Restez connectés pour les prochaines actualités"
  },
  en: {
    title: "News",
    subtitle: "The latest news from AgriCapital",
    moreNews: "More news",
    evolution: "See evolution",
    readMore: "Read more",
    noNews: "Stay tuned for upcoming news"
  },
  ar: {
    title: "الأخبار",
    subtitle: "آخر أخبار أغريكابيتال",
    moreNews: "المزيد من الأخبار",
    evolution: "شاهد التطور",
    readMore: "اقرأ المزيد",
    noNews: "ترقبوا الأخبار القادمة"
  },
  es: {
    title: "Noticias",
    subtitle: "Las últimas noticias de AgriCapital",
    moreNews: "Más noticias",
    evolution: "Ver evolución",
    readMore: "Leer más",
    noNews: "Manténgase atento a las próximas noticias"
  },
  de: {
    title: "Nachrichten",
    subtitle: "Die neuesten Nachrichten von AgriCapital",
    moreNews: "Mehr Nachrichten",
    evolution: "Entwicklung ansehen",
    readMore: "Weiterlesen",
    noNews: "Bleiben Sie dran für kommende Nachrichten"
  },
  zh: {
    title: "新闻",
    subtitle: "AgriCapital的最新消息",
    moreNews: "更多新闻",
    evolution: "查看发展",
    readMore: "阅读更多",
    noNews: "敬请关注即将发布的新闻"
  }
};

// First article for display
const firstArticle = {
  id: "ag-2026",
  slug: "assemblee-generale-2026",
  title_fr: "AGRICAPITAL | Assemblée Générale Ordinaire Annuelle 2026",
  title_en: "AGRICAPITAL | Annual General Meeting 2026",
  excerpt_fr: "Le 07 janvier 2026, AgriCapital SARL a tenu sa première Assemblée Générale Ordinaire Annuelle, réunissant l'ensemble de ses associés pour valider les orientations stratégiques 2026.",
  excerpt_en: "On January 7, 2026, AgriCapital SARL held its first Annual General Meeting, bringing together all its partners to validate the 2026 strategic orientations.",
  featured_image: ag1,
  published_at: "2026-01-07T12:00:00Z",
  category: "corporate"
};

const NewsSection = () => {
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;

  // Fetch latest 3 news from database
  const { data: newsFromDb } = useQuery({
    queryKey: ["news-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(2);
      if (error) throw error;
      return data || [];
    }
  });

  // Combine with first article
  const newsItems = [firstArticle, ...(newsFromDb || [])].slice(0, 3);

  const getLocalizedField = (item: any, field: string) => {
    const langField = `${field}_${language}`;
    return item[langField] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section id="actualites" className="py-16 md:py-24 bg-gradient-to-br from-muted/50 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-agri-green/20 text-agri-green border-0">
            <Newspaper className="w-4 h-4 mr-2" />
            {tr.title}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {tr.subtitle}
          </h2>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {newsItems.map((article: any, index) => (
            <Card 
              key={article.id} 
              className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${
                index === 0 ? 'border-2 border-agri-green/30' : ''
              }`}
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={article.featured_image || ag1} 
                  alt={getLocalizedField(article, 'title')}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4 md:p-6">
                {index === 0 && (
                  <Badge className="mb-3 bg-agri-orange/20 text-agri-orange border-0 text-xs">
                    À la une
                  </Badge>
                )}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
                  {getLocalizedField(article, 'title')}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {getLocalizedField(article, 'excerpt')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.published_at || article.created_at)}
                  </span>
                  <Link 
                    to={article.slug ? `/actualites/${article.slug}` : `/actualites`}
                    className="text-agri-green hover:text-agri-green/80 text-sm font-medium flex items-center gap-1"
                  >
                    {tr.readMore}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-agri-green hover:bg-agri-green/90">
            <Link to="/actualites" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              {tr.moreNews}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/evolution" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {tr.evolution}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
