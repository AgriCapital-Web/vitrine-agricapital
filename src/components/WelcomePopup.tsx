import { useEffect, useState, useCallback } from "react";
import { Phone, Mail, Globe, ExternalLink, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import posterImage from "@/assets/poster-agricapital.png";
import logoAgriCapital from "@/assets/logo-agricapital-white.png";

interface PopupTranslation {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  tagline: string;
  description: string;
  prosperity: string;
  hectare: string;
  cta: string;
  slogan: string;
  subscriberPortal: string;
  subscriberQuestion: string;
}

const popupTranslations: Record<Language, PopupTranslation> = {
  fr: {
    line1: "Avec nous",
    line2: "vos",
    line3: "TERRES",
    line4: "Reprennent",
    line5: "vie",
    tagline: "Avec AgriCapital,",
    description: "devenez planteur de palmier à huile et faisons pousser votre",
    prosperity: "prospérité",
    hectare: "hectare après hectare",
    cta: "NOUS CONTACTER",
    slogan: "Le partenaire idéal des producteurs agricoles",
    subscriberPortal: "Espace Abonné",
    subscriberQuestion: "Déjà abonné AgriCapital ?"
  },
  en: {
    line1: "With us",
    line2: "your",
    line3: "LANDS",
    line4: "Come back",
    line5: "to life",
    tagline: "With AgriCapital,",
    description: "become an oil palm grower and let us grow your",
    prosperity: "prosperity",
    hectare: "hectare after hectare",
    cta: "CONTACT US",
    slogan: "The ideal partner for agricultural producers",
    subscriberPortal: "Subscriber Portal",
    subscriberQuestion: "Already an AgriCapital subscriber?"
  },
  ar: {
    line1: "معنا",
    line2: "أراضيكم",
    line3: "تعود",
    line4: "إلى",
    line5: "الحياة",
    tagline: "مع أجريكابيتال،",
    description: "كن مزارع نخيل زيت ودعنا ننمي",
    prosperity: "ازدهارك",
    hectare: "هكتار بعد هكتار",
    cta: "اتصل بنا",
    slogan: "الشريك المثالي للمنتجين الزراعيين",
    subscriberPortal: "بوابة المشترك",
    subscriberQuestion: "هل أنت مشترك في أجريكابيتال؟"
  },
  es: {
    line1: "Con nosotros",
    line2: "sus",
    line3: "TIERRAS",
    line4: "Vuelven",
    line5: "a la vida",
    tagline: "Con AgriCapital,",
    description: "conviértase en cultivador de palma aceitera y hagamos crecer su",
    prosperity: "prosperidad",
    hectare: "hectárea tras hectárea",
    cta: "CONTÁCTENOS",
    slogan: "El socio ideal de los productores agrícolas",
    subscriberPortal: "Portal de Suscriptor",
    subscriberQuestion: "¿Ya es suscriptor de AgriCapital?"
  },
  de: {
    line1: "Mit uns",
    line2: "erwachen Ihre",
    line3: "LÄNDER",
    line4: "wieder",
    line5: "zum Leben",
    tagline: "Mit AgriCapital,",
    description: "werden Sie Ölpalmen-Pflanzer und lassen Sie uns Ihren",
    prosperity: "Wohlstand",
    hectare: "Hektar für Hektar",
    cta: "KONTAKT",
    slogan: "Der ideale Partner für Landwirtschaftsproduzenten",
    subscriberPortal: "Abonnentenportal",
    subscriberQuestion: "Bereits AgriCapital-Abonnent?"
  },
  zh: {
    line1: "与我们一起",
    line2: "您的",
    line3: "土地",
    line4: "重获",
    line5: "新生",
    tagline: "与AgriCapital一起，",
    description: "成为油棕种植者，让我们一起培育您的",
    prosperity: "繁荣",
    hectare: "一公顷接一公顷",
    cta: "联系我们",
    slogan: "农业生产者的理想合作伙伴",
    subscriberPortal: "订阅者门户",
    subscriberQuestion: "已是AgriCapital订阅者？"
  }
};

const COUNTDOWN_DURATION = 20;

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [canClose, setCanClose] = useState(false);
  const { language } = useLanguage();
  const t = popupTranslations[language] || popupTranslations.fr;
  const isRTL = language === "ar";

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("agricapital_popup_v5");
    
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
        sessionStorage.setItem("agricapital_popup_v5", "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (canClose) {
      setIsAnimating(false);
      setTimeout(() => setIsOpen(false), 300);
    }
  }, [canClose]);

  const scrollToContact = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const openSubscriberPortal = () => {
    window.open('https://app.agricapital.ci/pay', '_blank');
  };

  if (!isOpen) return null;

  const progress = ((COUNTDOWN_DURATION - countdown) / COUNTDOWN_DURATION) * 100;

  return (
    <div 
      className={`fixed inset-0 bg-black/70 z-[100000] flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div 
        className={`relative w-full max-w-[92vw] sm:max-w-[85vw] md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 ${
          isAnimating 
            ? 'translate-y-0 scale-100 opacity-100' 
            : 'translate-y-8 scale-95 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #14532d 50%, #0f3d1f 100%)',
          animation: isAnimating ? 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Countdown on LEFT */}
        <div className={`absolute top-2 sm:top-3 ${isRTL ? 'right-2 sm:right-3' : 'left-2 sm:left-3'} z-30 flex items-center gap-2 bg-black/50 rounded-full px-3 py-2`}>
          <svg className="w-8 h-8 sm:w-10 sm:h-10 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-white font-bold text-sm sm:text-base min-w-[20px] text-center">
            {countdown}s
          </span>
        </div>

        {/* Close button on RIGHT - always clickable */}
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(() => setIsOpen(false), 300);
          }}
          className={`absolute top-2 sm:top-3 ${isRTL ? 'left-2 sm:left-3' : 'right-2 sm:right-3'} z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 transition-all shadow-lg flex items-center justify-center cursor-pointer hover:scale-110`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Decorative golden curve */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(218, 165, 32, 0.35) 0%, rgba(218, 165, 32, 0.1) 100%)',
            clipPath: 'ellipse(100% 80% at 100% 50%)'
          }}
        />

        <div className="relative z-10 p-3 sm:p-5 md:p-6 overflow-y-auto max-h-[90vh]">
          {/* Logo AgriCapital - Centered at top, larger */}
          <div className="flex justify-center mb-3 sm:mb-4 pt-8 sm:pt-6">
            <img 
              src={logoAgriCapital} 
              alt="AgriCapital" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Two-column layout for headlines */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
            {/* Left column - Main headline */}
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <p 
                className="text-white text-base sm:text-xl md:text-2xl font-bold leading-tight"
                style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
              >
                {t.line1}
              </p>
              <p className="text-white text-xs sm:text-sm md:text-base font-medium mt-0.5">
                {t.line2}
              </p>
              <p 
                className="text-base sm:text-xl md:text-2xl font-extrabold tracking-wide mt-0.5"
                style={{ 
                  color: '#22c55e',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
                }}
              >
                {t.line3}
              </p>
              <p 
                className="text-sm sm:text-lg md:text-xl font-bold italic mt-0.5"
                style={{ 
                  color: '#9ca3af',
                  fontFamily: 'Georgia, Times New Roman, serif'
                }}
              >
                {t.line4}
              </p>
              <p 
                className="text-base sm:text-xl md:text-2xl font-extrabold mt-0.5"
                style={{ 
                  color: '#f59e0b',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
                }}
              >
                {t.line5}
              </p>
            </div>

            {/* Right column - Tagline box */}
            <div 
              className="rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 self-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.97) 0%, rgba(31, 41, 55, 0.97) 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}
            >
              <p className="text-white font-bold text-[10px] sm:text-xs md:text-sm mb-1">{t.tagline}</p>
              <p className="text-white/90 text-[9px] sm:text-[10px] md:text-xs leading-relaxed">
                {t.description} <span className="text-amber-400 font-semibold">{t.prosperity}</span>, {t.hectare}
              </p>
            </div>
          </div>

          {/* Image container - enlarged with better positioning */}
          <div className="relative flex justify-center -mx-3 sm:-mx-5 md:-mx-6">
            <div className="relative w-full overflow-hidden">
              <img 
                src={posterImage} 
                alt="AgriCapital"
                className="w-full h-auto object-cover"
                style={{ 
                  maxHeight: '38vh',
                  minHeight: '200px',
                  objectPosition: 'center 30%'
                }}
                loading="eager"
              />
              {/* Gradient overlay at bottom to hide cut effect */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-20 sm:h-24"
                style={{
                  background: 'linear-gradient(to top, #166534 0%, transparent 100%)'
                }}
              />
              
              {/* CTA Button - overlapping the image bottom */}
              <div className="absolute bottom-2 sm:bottom-4 left-3 right-3 sm:left-5 sm:right-5 md:left-6 md:right-6 z-10">
                <button
                  onClick={scrollToContact}
                  className="w-full py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-bold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }}
                >
                  {t.cta} <span className="text-base sm:text-lg">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subscriber Portal Link */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-white/70 text-[10px] sm:text-xs mb-1.5 sm:mb-2">{t.subscriberQuestion}</p>
            <button
              onClick={openSubscriberPortal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)'
              }}
            >
              {t.subscriberPortal}
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Contact info */}
          <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2 sm:gap-4 text-white/90 text-[9px] sm:text-xs pb-2">
            <div className="flex items-center gap-1">
              <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>05 64 55 17 17</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>contact@agricapital.ci</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>www.agricapital.ci</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3) translateY(100px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-10px);
            opacity: 1;
          }
          70% {
            transform: scale(0.95) translateY(5px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePopup;
