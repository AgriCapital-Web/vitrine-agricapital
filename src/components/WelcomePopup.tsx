import { useEffect, useState, useCallback } from "react";
import { Phone, Mail, Globe, ExternalLink, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import teamImage from "@/assets/agricapital-team.png";
import logoWhite from "@/assets/logo-agricapital-v2-white.png";

interface PopupTranslation {
  headline: string;
  description: string;
  cta: string;
  subscriberPortal: string;
  subscriberQuestion: string;
}

const popupTranslations: Record<Language, PopupTranslation> = {
  fr: {
    headline: "Votre plantation de palmier à huile, clé en main.",
    description: "Avec AgriCapital, créez votre plantation et bâtissons ensemble votre patrimoine agricole durable et rentable.",
    cta: "NOUS CONTACTER",
    subscriberPortal: "Espace Clients",
    subscriberQuestion: "Déjà client AgriCapital ?"
  },
  en: {
    headline: "Your oil palm plantation, turnkey.",
    description: "With AgriCapital, create your turnkey oil palm plantation and build together your sustainable and profitable agricultural heritage.",
    cta: "CONTACT US",
    subscriberPortal: "Client Portal",
    subscriberQuestion: "Already an AgriCapital client?"
  },
  ar: {
    headline: "مزرعة نخيل الزيت الخاصة بك، جاهزة للتسليم.",
    description: "مع أغريكابيتال، أنشئ مزرعة نخيل الزيت الخاصة بك واحصل على إرث زراعي مستدام ومربح.",
    cta: "اتصل بنا",
    subscriberPortal: "بوابة العملاء",
    subscriberQuestion: "هل أنت عميل أغريكابيتال؟"
  },
  es: {
    headline: "Su plantación de palma aceitera, llave en mano.",
    description: "Con AgriCapital, cree su plantación llave en mano y construya juntos su patrimonio agrícola duradero y rentable.",
    cta: "CONTÁCTENOS",
    subscriberPortal: "Portal de Clientes",
    subscriberQuestion: "¿Ya es cliente de AgriCapital?"
  },
  de: {
    headline: "Ihre Ölpalmenplantage, schlüsselfertig.",
    description: "Mit AgriCapital erstellen Sie Ihre schlüsselfertige Plantage und bauen gemeinsam Ihr nachhaltiges landwirtschaftliches Erbe auf.",
    cta: "KONTAKT",
    subscriberPortal: "Kundenportal",
    subscriberQuestion: "Bereits AgriCapital-Kunde?"
  },
  zh: {
    headline: "您的油棕种植园，交钥匙工程。",
    description: "与AgriCapital一起，创建您的交钥匙油棕种植园，共同打造可持续且有利可图的农业遗产。",
    cta: "联系我们",
    subscriberPortal: "客户门户",
    subscriberQuestion: "已是AgriCapital客户？"
  }
};

const COUNTDOWN_DURATION = 20;

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const { language } = useLanguage();
  const t = popupTranslations[language] || popupTranslations.fr;
  const isRTL = language === "ar";

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("agricapital_popup_v7");
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
        sessionStorage.setItem("agricapital_popup_v7", "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  const scrollToContact = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const openSubscriberPortal = () => {
    window.open('https://pay.agricapital.ci', '_blank');
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
        className={`relative w-full max-w-[92vw] sm:max-w-[85vw] md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 ${
          isAnimating ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #14532d 50%, #0f3d1f 100%)',
          animation: isAnimating ? 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Countdown */}
        <div className={`absolute top-2 sm:top-3 ${isRTL ? 'right-2' : 'left-2'} z-30 flex items-center gap-2 bg-black/50 rounded-full px-3 py-2`}>
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-white font-bold text-sm min-w-[20px] text-center">{countdown}s</span>
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className={`absolute top-2 sm:top-3 ${isRTL ? 'left-2' : 'right-2'} z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition-all shadow-lg flex items-center justify-center cursor-pointer hover:scale-110`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Decorative curve */}
        <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(218, 165, 32, 0.25) 0%, rgba(218, 165, 32, 0.05) 100%)', clipPath: 'ellipse(100% 80% at 100% 50%)' }}
        />

        <div className="relative z-10 p-3 sm:p-5 md:p-6 overflow-y-auto max-h-[90vh]">
          {/* White Logo - slightly larger */}
          <div className="flex justify-center mb-3 sm:mb-4 pt-8 sm:pt-6">
            <img src={logoWhite} alt="AgriCapital" className="h-20 sm:h-24 md:h-28 w-auto object-contain drop-shadow-lg" loading="eager" />
          </div>

          {/* Headline */}
          <div className="text-center mb-3">
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold leading-tight" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              {t.headline}
            </h2>
          </div>

          {/* Team photo - feet just touch the description card */}
          <div className="relative flex justify-end -mx-3 sm:-mx-5 md:-mx-6 -mb-6 sm:-mb-8 md:-mb-10 z-10">
            <div className="relative w-full overflow-hidden flex justify-center items-end">
              <img 
                src={teamImage} 
                alt="Équipe AgriCapital"
                className="w-auto h-auto object-contain object-bottom"
                style={{ maxHeight: '46vh', minHeight: '220px', mixBlendMode: 'multiply', maxWidth: '100%' }}
                loading="eager"
              />
            </div>
          </div>

          {/* Description - feet of team slightly overlap top of this card */}
          <div className="relative bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 mb-3 border border-white/20 z-0">
            <p className="text-white/95 text-xs sm:text-sm md:text-base text-center leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={scrollToContact}
            className="w-full py-3 text-sm sm:text-base font-bold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-white flex items-center justify-center gap-2 mb-3"
            style={{
              background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            {t.cta} <span className="text-base">→</span>
          </button>

          {/* Subscriber Portal */}
          <div className="text-center mb-3">
            <p className="text-white/70 text-[10px] sm:text-xs mb-1.5">{t.subscriberQuestion}</p>
            <button onClick={openSubscriberPortal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: 'white', boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)' }}
            >
              {t.subscriberPortal}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-white/90 text-[9px] sm:text-xs pb-2">
            <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-amber-400" /><span>05 64 55 17 17</span></div>
            <div className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-amber-400" /><span>contact@agricapital.ci</span></div>
            <div className="flex items-center gap-1"><Globe className="w-2.5 h-2.5 text-amber-400" /><span>www.agricapital.ci</span></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3) translateY(100px); opacity: 0; }
          50% { transform: scale(1.05) translateY(-10px); opacity: 1; }
          70% { transform: scale(0.95) translateY(5px); }
          100% { transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WelcomePopup;
