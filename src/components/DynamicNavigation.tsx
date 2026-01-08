import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageNames } from "@/lib/translations";
import { useDynamicMenu } from "@/hooks/useDynamicMenu";
import { useVisitorCount } from "@/hooks/useVisitorCount";
import logo from "@/assets/logo.png";

const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

// Complete fallback menu with FAQ and News
const fallbackMenu = [
  { id: "home", label_fr: "Accueil", label_en: "Home", label_ar: "الرئيسية", label_es: "Inicio", label_de: "Startseite", label_zh: "首页", url: "#hero" },
  { id: "about", label_fr: "À propos", label_en: "About", label_ar: "من نحن", label_es: "Nosotros", label_de: "Über uns", label_zh: "关于我们", url: "#apropos" },
  { id: "approach", label_fr: "Approche", label_en: "Approach", label_ar: "النهج", label_es: "Enfoque", label_de: "Ansatz", label_zh: "方法", url: "#approche" },
  { id: "impact", label_fr: "Impact", label_en: "Impact", label_ar: "التأثير", label_es: "Impacto", label_de: "Wirkung", label_zh: "影响", url: "#impact" },
  { id: "partnership", label_fr: "Partenariat", label_en: "Partnership", label_ar: "شراكة", label_es: "Asociación", label_de: "Partnerschaft", label_zh: "合作", url: "#partenariat" },
  { id: "news", label_fr: "Actualités", label_en: "News", label_ar: "الأخبار", label_es: "Noticias", label_de: "Nachrichten", label_zh: "新闻", url: "/actualites" },
  { id: "faq", label_fr: "FAQ", label_en: "FAQ", label_ar: "الأسئلة الشائعة", label_es: "FAQ", label_de: "FAQ", label_zh: "常见问题", url: "/faq" },
  { id: "contact", label_fr: "Contact", label_en: "Contact", label_ar: "اتصل", label_es: "Contacto", label_de: "Kontakt", label_zh: "联系", url: "#contact" },
];

const visitorTranslations = {
  fr: "Visiteurs",
  en: "Visitors",
  ar: "الزوار",
  es: "Visitantes",
  de: "Besucher",
  zh: "访客"
};

const DynamicNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileLangMenu, setShowMobileLangMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);
  const { menuItems, isLoading } = useDynamicMenu();
  const { totalVisitors } = useVisitorCount();

  // Use fallback menu if database menu is empty
  const displayMenu = menuItems.length > 0 ? menuItems : fallbackMenu;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(event.target as Node)) {
        setShowMobileLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get localized label
  const getLabel = (item: any) => {
    const langKey = `label_${language}`;
    return item[langKey] || item.label_fr || item.label || "";
  };

  const handleNavClick = (url: string | null, target?: string) => {
    if (!url) return;
    
    if (url.startsWith('#')) {
      const sectionId = url.substring(1);
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
      
      if (isHomePage) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to homepage with hash
        window.location.href = '/' + url;
      }
    } else if (target === '_blank') {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
    setIsOpen(false);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
    setShowMobileLangMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft" style={{ zIndex: 99999 }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick("#hero")}>
            <img src={logo} alt="AgriCapital" className="h-10 md:h-12" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {displayMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.url, (item as any).target)}
                className="text-foreground hover:text-primary transition-smooth font-medium text-sm xl:text-base whitespace-nowrap"
              >
                {getLabel(item)}
              </button>
            ))}
            
            {/* Visitor Counter */}
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm bg-muted/50 px-3 py-1.5 rounded-full">
              <Users size={14} />
              <span className="font-medium">{totalVisitors.toLocaleString()}</span>
              <span className="hidden xl:inline text-xs">{visitorTranslations[language as keyof typeof visitorTranslations]}</span>
            </div>
            
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLangMenu(!showLangMenu);
                }}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth font-medium px-3 py-2 rounded-lg hover:bg-secondary/50"
                aria-label="Select language"
              >
                <Globe size={18} />
                <span className="uppercase text-sm">{language}</span>
              </button>
              {showLangMenu && (
                <>
                  <div 
                    className="fixed inset-0"
                    style={{ zIndex: 999998 }}
                    onClick={() => setShowLangMenu(false)}
                  />
                  <div 
                    className="fixed right-4 mt-2 rounded-lg shadow-2xl py-2 min-w-[160px] bg-white border border-gray-200"
                    style={{ zIndex: 999999, top: '70px' }}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-100 ${
                          language === lang ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <Button
              onClick={() => handleNavClick("#contact")}
              className="bg-gradient-accent border-0 text-white hover:opacity-90 transition-smooth"
            >
              {t.nav.contact}
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Visitor Counter Mobile */}
            <div className="flex items-center gap-1 text-muted-foreground text-xs bg-muted/50 px-2 py-1 rounded-full">
              <Users size={12} />
              <span className="font-medium">{totalVisitors.toLocaleString()}</span>
            </div>
            
            <div className="relative" ref={mobileLangMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileLangMenu(!showMobileLangMenu);
                }}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-secondary/50"
                aria-label="Select language"
              >
                <Globe size={18} />
                <span className="uppercase text-xs font-medium">{language}</span>
              </button>
              {showMobileLangMenu && (
                <>
                  <div 
                    className="fixed inset-0"
                    style={{ zIndex: 999998 }}
                    onClick={() => setShowMobileLangMenu(false)}
                  />
                  <div 
                    className="fixed right-4 mt-2 rounded-lg shadow-2xl py-2 min-w-[180px] bg-white border border-gray-200"
                    style={{ zIndex: 999999, top: '60px' }}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-100 ${
                          language === lang ? "bg-green-50 text-green-700 font-semibold" : "text-gray-700"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button
              className="text-foreground p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-background">
            <div className="flex flex-col gap-3">
              {displayMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.url, (item as any).target)}
                  className="text-foreground hover:text-primary transition-smooth font-medium text-left py-2"
                >
                  {getLabel(item)}
                </button>
              ))}
              <Button
                onClick={() => handleNavClick("#contact")}
                className="bg-gradient-accent border-0 text-white hover:opacity-90 transition-smooth w-full mt-2"
              >
                {t.nav.contact}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DynamicNavigation;
