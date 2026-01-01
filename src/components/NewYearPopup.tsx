import { useEffect, useState, useCallback } from "react";
import { Phone, Mail, Globe, ExternalLink, X, Sparkles, Star, PartyPopper } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import logoAgriCapital from "@/assets/logo-agricapital-white.png";

interface NewYearTranslation {
  greeting: string;
  year: string;
  wishes: string;
  message: string;
  thanksTitle: string;
  thanks: string;
  commitment: string;
  cta: string;
  subscriberPortal: string;
  subscriberQuestion: string;
}

const newYearTranslations: Record<Language, NewYearTranslation> = {
  fr: {
    greeting: "Bonne et Heureuse",
    year: "Année 2026",
    wishes: "🌴 Santé, Prospérité & Récoltes Abondantes 🌴",
    message: "Que cette nouvelle année vous apporte des récoltes exceptionnelles et une prospérité durable pour vous et vos familles.",
    thanksTitle: "Merci pour votre confiance !",
    thanks: "Toute l'équipe AgriCapital vous remercie pour votre soutien en 2025. Ensemble, nous avons posé les fondations d'une agriculture ivoirienne plus forte.",
    commitment: "En 2026, nous renforçons notre engagement : plus de plantations, plus d'accompagnement, plus d'impact pour nos producteurs partenaires.",
    cta: "DÉCOUVRIR NOS OFFRES 2026",
    subscriberPortal: "Espace Abonné",
    subscriberQuestion: "Déjà abonné AgriCapital ?"
  },
  en: {
    greeting: "Happy",
    year: "New Year 2026",
    wishes: "🌴 Health, Prosperity & Abundant Harvests 🌴",
    message: "May this new year bring you exceptional harvests and lasting prosperity for you and your families.",
    thanksTitle: "Thank you for your trust!",
    thanks: "The entire AgriCapital team thanks you for your support in 2025. Together, we have laid the foundations for a stronger Ivorian agriculture.",
    commitment: "In 2026, we strengthen our commitment: more plantations, more support, more impact for our partner producers.",
    cta: "DISCOVER OUR 2026 OFFERS",
    subscriberPortal: "Subscriber Portal",
    subscriberQuestion: "Already an AgriCapital subscriber?"
  },
  ar: {
    greeting: "سنة سعيدة",
    year: "2026",
    wishes: "🌴 صحة وازدهار ومحاصيل وفيرة 🌴",
    message: "نتمنى أن تجلب لكم هذه السنة الجديدة محاصيل استثنائية وازدهاراً دائماً لكم ولعائلاتكم.",
    thanksTitle: "شكراً لثقتكم!",
    thanks: "يشكركم فريق أجريكابيتال بأكمله على دعمكم في 2025. معاً، وضعنا أسس زراعة إيفوارية أقوى.",
    commitment: "في 2026، نعزز التزامنا: مزيد من المزارع، مزيد من الدعم، مزيد من التأثير.",
    cta: "اكتشف عروض 2026",
    subscriberPortal: "بوابة المشترك",
    subscriberQuestion: "هل أنت مشترك بالفعل؟"
  },
  es: {
    greeting: "¡Feliz",
    year: "Año Nuevo 2026!",
    wishes: "🌴 Salud, Prosperidad y Cosechas Abundantes 🌴",
    message: "Que este nuevo año les traiga cosechas excepcionales y prosperidad duradera para ustedes y sus familias.",
    thanksTitle: "¡Gracias por su confianza!",
    thanks: "Todo el equipo de AgriCapital les agradece su apoyo en 2025. Juntos, hemos sentado las bases de una agricultura marfileña más fuerte.",
    commitment: "En 2026, reforzamos nuestro compromiso: más plantaciones, más apoyo, más impacto para nuestros productores.",
    cta: "DESCUBRIR OFERTAS 2026",
    subscriberPortal: "Portal de Suscriptor",
    subscriberQuestion: "¿Ya es suscriptor de AgriCapital?"
  },
  de: {
    greeting: "Frohes",
    year: "Neues Jahr 2026",
    wishes: "🌴 Gesundheit, Wohlstand & Reiche Ernten 🌴",
    message: "Möge dieses neue Jahr Ihnen außergewöhnliche Ernten und dauerhaften Wohlstand für Sie und Ihre Familien bringen.",
    thanksTitle: "Danke für Ihr Vertrauen!",
    thanks: "Das gesamte AgriCapital-Team dankt Ihnen für Ihre Unterstützung in 2025. Gemeinsam haben wir die Grundlagen für eine stärkere ivorische Landwirtschaft gelegt.",
    commitment: "Im Jahr 2026 verstärken wir unser Engagement: mehr Plantagen, mehr Unterstützung, mehr Wirkung.",
    cta: "ANGEBOTE 2026 ENTDECKEN",
    subscriberPortal: "Abonnentenportal",
    subscriberQuestion: "Bereits AgriCapital-Abonnent?"
  },
  zh: {
    greeting: "新年快乐",
    year: "2026",
    wishes: "🌴 健康、繁荣与丰收 🌴",
    message: "愿新的一年为您和家人带来丰收和持久的繁荣。",
    thanksTitle: "感谢您的信任！",
    thanks: "AgriCapital全体团队感谢您在2025年的支持。我们共同为更强大的科特迪瓦农业奠定了基础。",
    commitment: "2026年，我们加强承诺：更多种植园，更多支持，更大影响力。",
    cta: "发现2026优惠",
    subscriberPortal: "订阅者门户",
    subscriberQuestion: "已是AgriCapital订阅者？"
  }
};

const COUNTDOWN_DURATION = 15;

const NewYearPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const { language } = useLanguage();
  const t = newYearTranslations[language] || newYearTranslations.fr;
  const isRTL = language === "ar";

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("agricapital_newyear_2026");
    
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
        sessionStorage.setItem("agricapital_newyear_2026", "true");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  }, []);

  const scrollToPartnership = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      const section = document.getElementById('partenariat');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
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
      className={`fixed inset-0 bg-black/80 z-[100000] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div 
        className={`relative w-full max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 ${
          isAnimating 
            ? 'translate-y-0 scale-100 opacity-100' 
            : 'translate-y-8 scale-95 opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #166534 100%)',
          animation: isAnimating ? 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Countdown timer */}
        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} z-30 flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5`}>
          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-white font-bold text-sm">{countdown}s</span>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 transition-all flex items-center justify-center`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Decorative elements */}
        <div className="absolute top-4 left-1/4 animate-pulse">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="absolute top-8 right-1/4 animate-pulse delay-300">
          <Star className="w-5 h-5 text-amber-300" />
        </div>
        <div className="absolute top-12 left-1/3 animate-bounce">
          <PartyPopper className="w-5 h-5 text-orange-400" />
        </div>

        {/* Fireworks background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-amber-300 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute top-1/5 right-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 p-4 sm:p-6 overflow-y-auto max-h-[92vh]">
          {/* Logo */}
          <div className="flex justify-center mb-3 pt-6">
            <img 
              src={logoAgriCapital} 
              alt="AgriCapital" 
              className="h-14 sm:h-18 w-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* New Year Greeting */}
          <div className="text-center mb-4">
            <p className="text-white/90 text-lg sm:text-xl font-light mb-1">{t.greeting}</p>
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 30px rgba(251, 191, 36, 0.5)'
              }}
            >
              {t.year}
            </h1>
            <p className="text-white/90 text-sm sm:text-base font-medium">{t.wishes}</p>
          </div>

          {/* Message */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 sm:p-4 mb-4 border border-white/20">
            <p className="text-white/90 text-sm sm:text-base text-center leading-relaxed">
              {t.message}
            </p>
          </div>

          {/* Thanks & Commitment */}
          <div className="space-y-3 mb-4">
            <div className="bg-gradient-to-r from-green-600/30 to-green-700/30 rounded-xl p-3 border border-green-500/30">
              <h3 className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-2">
                <Star className="w-4 h-4" />
                {t.thanksTitle}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">{t.thanks}</p>
            </div>
            
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl p-3 border border-amber-500/30">
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed">{t.commitment}</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={scrollToPartnership}
            className="w-full py-3 text-sm sm:text-base font-bold rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-white flex items-center justify-center gap-2 mb-3"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 4px 20px rgba(22, 163, 74, 0.4)'
            }}
          >
            {t.cta}
            <span className="text-lg">🌴</span>
          </button>

          {/* Subscriber Portal */}
          <div className="text-center mb-3">
            <p className="text-white/60 text-xs mb-1.5">{t.subscriberQuestion}</p>
            <button
              onClick={openSubscriberPortal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
              }}
            >
              {t.subscriberPortal}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap justify-center gap-3 text-white/80 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>05 64 55 17 17</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-amber-400" />
              <span>contact@agricapital.ci</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              <span>www.agricapital.ci</span>
            </div>
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

export default NewYearPopup;
