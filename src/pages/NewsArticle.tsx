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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, ArrowLeft, Share2, User, Eye, Loader2, ChevronLeft, ChevronRight, X, Play } from "lucide-react";

const translations = {
  fr: { back: "Retour aux actualités", by: "Par", share: "Partager", views: "vues", notFound: "Article non trouvé", notFoundDesc: "L'article que vous recherchez n'existe pas ou a été déplacé.", gallery: "Galerie photos" },
  en: { back: "Back to news", by: "By", share: "Share", views: "views", notFound: "Article not found", notFoundDesc: "The article you're looking for doesn't exist or has been moved.", gallery: "Photo gallery" },
  ar: { back: "العودة إلى الأخبار", by: "بواسطة", share: "مشاركة", views: "مشاهدات", notFound: "المقال غير موجود", notFoundDesc: "المقال الذي تبحث عنه غير موجود أو تم نقله.", gallery: "معرض الصور" },
  es: { back: "Volver a noticias", by: "Por", share: "Compartir", views: "vistas", notFound: "Artículo no encontrado", notFoundDesc: "El artículo que busca no existe o ha sido movido.", gallery: "Galería de fotos" },
  de: { back: "Zurück zu Nachrichten", by: "Von", share: "Teilen", views: "Aufrufe", notFound: "Artikel nicht gefunden", notFoundDesc: "Der Artikel, den Sie suchen, existiert nicht oder wurde verschoben.", gallery: "Fotogalerie" },
  zh: { back: "返回新闻", by: "作者", share: "分享", views: "浏览量", notFound: "文章未找到", notFoundDesc: "您要查找的文章不存在或已被移动。", gallery: "图片库" }
};

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;
  const [viewCounted, setViewCounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!slug
  });

  // Increment view count
  useEffect(() => {
    if (article && !viewCounted) {
      setViewCounted(true);
      supabase.from("news").update({ views_count: (article.views_count || 0) + 1 }).eq("id", article.id).then(() => {});
    }
  }, [article, viewCounted]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const getLocalizedField = (item: any, field: string) => {
    if (!item) return "";
    return item[`${field}_${language}`] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'zh' ? 'zh-CN' : 'fr-FR',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const parseContent = (content: string) => {
    if (!content) return "";
    // If content already contains HTML tags, return as-is
    if (content.includes('<h2') || content.includes('<h3') || content.includes('<p ')) {
      return content;
    }
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
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/actualites"><ArrowLeft className="w-4 h-4 mr-2" />{tr.back}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Parse images and videos from JSON
  const images: string[] = article.images
    ? (Array.isArray(article.images) ? article.images : JSON.parse(article.images as string || '[]'))
    : [];
  const videos: string[] = article.videos
    ? (Array.isArray(article.videos) ? article.videos : JSON.parse(article.videos as string || '[]'))
    : [];
  const displayImages = images.length > 0 ? images : (article.featured_image ? [article.featured_image] : []);

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/actualites"><ArrowLeft className="w-4 h-4 mr-2" />{tr.back}</Link>
          </Button>
        </div>

        <article className="container mx-auto px-4 max-w-4xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-0">
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
            {(article.views_count ?? 0) > 0 && (
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.views_count} {tr.views}
              </span>
            )}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
              if (navigator.share) navigator.share({ title: getLocalizedField(article, 'title'), url: window.location.href });
            }}>
              <Share2 className="w-4 h-4 mr-2" />{tr.share}
            </Button>
          </div>

          {/* Hero Image */}
          {displayImages.length > 0 && (
            <div className="mb-8">
              <div className="rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => openLightbox(0)}>
                <img 
                  src={displayImages[0]} 
                  alt={getLocalizedField(article, 'title')}
                  className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          )}

          {/* Image Gallery Grid */}
          {displayImages.length > 1 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{tr.gallery}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {displayImages.slice(1).map((img, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => openLightbox(index + 1)}
                  >
                    <img src={img} alt={`Image ${index + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Player */}
          {videos.length > 0 && (
            <div className="mb-10 space-y-4">
              {videos.map((videoUrl, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-lg bg-black">
                  <video 
                    controls 
                    preload="metadata"
                    className="w-full aspect-video"
                    poster={displayImages[0] || undefined}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              ))}
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none mb-16 
              prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground
              prose-li:text-muted-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ 
              __html: `<p class="mb-4 leading-relaxed text-muted-foreground">${parseContent(getLocalizedField(article, 'content'))}</p>` 
            }}
          />

          <div className="flex justify-center py-8 border-t">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (navigator.share) navigator.share({ title: getLocalizedField(article, 'title'), url: window.location.href });
            }}>
              <Share2 className="w-4 h-4 mr-2" />{tr.share}
            </Button>
          </div>
        </article>
      </main>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <Button 
              variant="ghost" size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            {displayImages.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-4 z-50 text-white hover:bg-white/20" onClick={prevImage}>
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-4 z-50 text-white hover:bg-white/20" onClick={nextImage}>
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            
            <img 
              src={displayImages[lightboxIndex]} 
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default NewsArticle;
