import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/nursery-site.webp";
import SocialShareButtons from "@/components/SocialShareButtons";
import OptimizedImage from "@/components/OptimizedImage";

const Hero = () => {
  const { t, language } = useLanguage();

  const subscriberText: Record<string, string> = {
    fr: "Espace Clients",
    en: "Client Portal",
    ar: "بوابة العملاء",
    es: "Portal de Clientes",
    de: "Kundenportal",
    zh: "客户门户"
  };
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openSubscriberPortal = () => {
    window.open('https://pay.agricapital.ci', '_blank');
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20">
      {/* Background Image with Overlay - Optimized for mobile */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src={heroImage}
          alt="Site de pépinière AgriCapital - Agriculture moderne en Côte d'Ivoire"
          className="w-full h-full"
          priority={true}
          objectFit="cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content - Enhanced mobile spacing */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 sm:px-6 py-2 sm:py-3 bg-accent/20 backdrop-blur-sm rounded-full mb-3 sm:mb-6">
            <p className="text-agri-orange font-bold text-sm sm:text-lg md:text-xl lg:text-2xl">{t.hero.badge}</p>
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-6 leading-tight px-1 sm:px-2">
            {t.hero.title}
          </h1>
          
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-1 sm:px-2">
            {t.hero.description}
          </p>

          {/* CTA Buttons - Better touch targets for mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
            <Button
              size="lg"
              onClick={() => scrollToSection("approche")}
              className="bg-white hover:bg-white/90 text-agri-green border-0 shadow-medium transition-smooth group w-full sm:w-auto min-h-[48px] touch-manipulation active:scale-95"
            >
              {t.hero.btnApproach}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              onClick={() => scrollToSection("partenariat")}
              className="bg-accent hover:bg-accent/90 text-white border-0 shadow-medium transition-smooth w-full sm:w-auto min-h-[48px] touch-manipulation active:scale-95"
            >
              {t.hero.btnPartner}
            </Button>
          </div>

          {/* Subscriber Portal Button - Enhanced touch */}
          <div className="mt-4 sm:mt-6">
            <button
              onClick={openSubscriberPortal}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-xl bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg touch-manipulation min-h-[48px]"
            >
              {subscriberText[language] || subscriberText.fr}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Social Share Buttons */}
          <SocialShareButtons variant="hero" />
        </div>
      </div>
    </section>
  );
};

export default Hero;