import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageNames } from "@/lib/translations";
import { useDynamicMenu } from "@/hooks/useDynamicMenu";
import logo from "@/assets/logo.png";

const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

// Fallback menu for when database is empty
const fallbackMenu = [
  { id: "home", label: "Accueil", url: "#hero" },
  { id: "about", label: "À propos", url: "#apropos" },
  { id: "approach", label: "Notre approche", url: "#approche" },
  { id: "impact", label: "Impact", url: "#impact" },
  { id: "milestones", label: "Jalons", url: "#jalons" },
  { id: "testimonials", label: "Témoignages", url: "#temoignages" },
  { id: "partnership", label: "Partenariat", url: "#partenariat" },
  { id: "faq", label: "FAQ", url: "/faq" },
  { id: "contact", label: "Contact", url: "#contact" },
];

const DynamicNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileLangMenu, setShowMobileLangMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);
  const { menuItems, isLoading } = useDynamicMenu();

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
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick("#accueil")}>
            <img src={logo} alt="AgriCapital" className="h-12" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {displayMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.url, (item as any).target)}
                className="text-foreground hover:text-primary transition-smooth font-medium"
              >
                {item.label}
              </button>
            ))}
            
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
                <span className="uppercase">{language}</span>
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
          <div className="md:hidden flex items-center gap-3">
            <div className="relative" ref={mobileLangMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileLangMenu(!showMobileLangMenu);
                }}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-secondary/50"
                aria-label="Select language"
              >
                <Globe size={20} />
                <span className="uppercase text-sm font-medium">{language}</span>
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
          <div className="md:hidden py-4 border-t border-border bg-background">
            <div className="flex flex-col gap-4">
              {displayMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.url, (item as any).target)}
                  className="text-foreground hover:text-primary transition-smooth font-medium text-left"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => handleNavClick("#contact")}
                className="bg-gradient-accent border-0 text-white hover:opacity-90 transition-smooth w-full"
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
