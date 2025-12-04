import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/palm-oil-production.jpg";

const Hero = () => {
  const { t } = useLanguage();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Plantation de palmiers à huile en production"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-accent/20 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
            <p className="text-agri-orange font-bold text-base sm:text-lg md:text-xl lg:text-2xl">{t.hero.badge}</p>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
            {t.hero.title}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => scrollToSection("approche")}
              className="bg-white hover:bg-white/90 text-agri-green border-0 shadow-medium transition-smooth group w-full sm:w-auto"
            >
              {t.hero.btnApproach}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              onClick={() => scrollToSection("partenariat")}
              className="bg-accent hover:bg-accent/90 text-white border-0 shadow-medium transition-smooth w-full sm:w-auto"
            >
              {t.hero.btnPartner}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
