import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SocialShareButtons from "@/components/SocialShareButtons";

import heroImage1 from "@/assets/nursery-site.webp";
import heroImage2 from "@/assets/nursery-palm.jpg";
import heroImage3 from "@/assets/founder-palm-field.jpg";
import heroImage4 from "@/assets/nursery-dec-2025-1.jpg";
import posterImage from "@/assets/poster-agricapital.jpg";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

const Hero = () => {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
    <section id="hero" className="relative min-h-screen flex items-center pt-16 sm:pt-20 overflow-hidden">
      {/* Animated Background Images with Ken Burns effect */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: currentIndex === index ? 1 : 0 }}
          >
            <img
              src={img}
              alt="AgriCapital - Agriculture moderne en Côte d'Ivoire"
              className="w-full h-full object-cover"
              style={{
                animation: currentIndex === index ? 'heroKenBurns 12s ease-in-out infinite alternate' : 'none',
              }}
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content — two-column on desktop */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left column: Text */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-block px-3 sm:px-6 py-2 sm:py-3 bg-accent/20 backdrop-blur-sm rounded-full mb-3 sm:mb-5">
              <p className="text-white font-bold text-sm sm:text-lg md:text-xl">{t.hero.badge}</p>
            </div>
            
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight">
              {t.hero.title}
            </h1>
            
            <p className="text-xs sm:text-base md:text-lg text-white/90 font-medium mb-5 sm:mb-7 leading-relaxed">
              {t.hero.description}
            </p>

            {/* CTA Buttons — vertical stack */}
            <div className="flex flex-col gap-3 sm:max-w-xs lg:max-w-sm mx-auto lg:mx-0">
              <Button
                size="lg"
                onClick={() => scrollToSection("approche")}
                className="bg-white hover:bg-white/90 text-agri-green border-0 shadow-medium transition-smooth group w-full min-h-[48px] touch-manipulation active:scale-95"
              >
                {t.hero.btnApproach}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                onClick={() => scrollToSection("partenariat")}
                className="bg-accent hover:bg-accent/90 text-white border-0 shadow-medium transition-smooth w-full min-h-[48px] touch-manipulation active:scale-95"
              >
                {t.hero.btnPartner}
              </Button>
              <button
                onClick={openSubscriberPortal}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-xl bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg touch-manipulation min-h-[48px] w-full"
              >
                {subscriberText[language] || subscriberText.fr}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="mt-4">
              <SocialShareButtons variant="hero" />
            </div>
          </div>

          {/* Right column: Poster image — desktop only */}
          <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl hidden lg:block">
            <img 
              src={posterImage} 
              alt="AgriCapital - Devenez planteur de palmier à huile" 
              className="w-full rounded-xl shadow-2xl"
              loading="eager"
            />
          </div>

          {/* Poster on mobile — below text */}
          <div className="lg:hidden w-full max-w-sm mx-auto">
            <img 
              src={posterImage} 
              alt="AgriCapital - Devenez planteur de palmier à huile" 
              className="w-full rounded-xl shadow-2xl"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
