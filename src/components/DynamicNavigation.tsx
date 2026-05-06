import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageNames } from "@/lib/translations";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo-agricapital-v2.png";

const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

interface SubMenuItem {
  label: Record<Language, string>;
  action: string;
  isRoute?: boolean;
}

interface MenuItem {
  label: Record<Language, string>;
  action?: string;
  isRoute?: boolean;
  children?: SubMenuItem[];
}

const menuConfig: MenuItem[] = [
  {
    label: { fr: "Accueil", en: "Home", ar: "الرئيسية", es: "Inicio", de: "Startseite", zh: "首页" },
    action: "hero",
  },
  {
    label: { fr: "Découvrir", en: "Discover", ar: "اكتشف", es: "Descubrir", de: "Entdecken", zh: "发现" },
    children: [
      { label: { fr: "À Propos", en: "About", ar: "من نحن", es: "Nosotros", de: "Über uns", zh: "关于" }, action: "apropos" },
      { label: { fr: "Notre Capacité", en: "Capacity", ar: "القدرة", es: "Capacidad", de: "Kapazität", zh: "能力" }, action: "impact" },
      { label: { fr: "Évolution", en: "Evolution", ar: "التطور", es: "Evolución", de: "Entwicklung", zh: "发展" }, action: "/evolution", isRoute: true },
    ],
  },
  {
    label: { fr: "Nos Offres", en: "Offers", ar: "عروضنا", es: "Ofertas", de: "Angebote", zh: "方案" },
    children: [
      { label: { fr: "Comment ça marche", en: "How It Works", ar: "كيف يعمل", es: "Cómo funciona", de: "So funktioniert's", zh: "运作方式" }, action: "approche" },
      { label: { fr: "Partenariat", en: "Partnership", ar: "شراكة", es: "Asociación", de: "Partnerschaft", zh: "合作" }, action: "partenariat" },
    ],
  },
  {
    label: { fr: "Équipe", en: "Team", ar: "الفريق", es: "Equipo", de: "Team", zh: "团队" },
    action: "equipe",
  },
  {
    label: { fr: "Ressources", en: "Resources", ar: "الموارد", es: "Recursos", de: "Ressourcen", zh: "资源" },
    children: [
      { label: { fr: "Actualités", en: "News", ar: "الأخبار", es: "Noticias", de: "Nachrichten", zh: "新闻" }, action: "/actualites", isRoute: true },
      { label: { fr: "Témoignages", en: "Testimonials", ar: "الشهادات", es: "Testimonios", de: "Referenzen", zh: "推荐" }, action: "temoignages" },
      { label: { fr: "FAQ", en: "FAQ", ar: "الأسئلة", es: "FAQ", de: "FAQ", zh: "常见问题" }, action: "/faq", isRoute: true },
    ],
  },
];

const DynamicNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileLangMenu, setShowMobileLangMenu] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setShowLangMenu(false);
      if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(event.target as Node)) setShowMobileLangMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    setOpenSubmenu(null);
    setOpenMobileSubmenu(null);
    const isHome = location.pathname === "/" || location.pathname.match(/^\/(fr|en|ar|es|de|zh)$/);
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const handleItemClick = (action: string, isRoute?: boolean) => {
    if (isRoute) {
      navigate(action);
      setIsOpen(false);
      setOpenSubmenu(null);
      setOpenMobileSubmenu(null);
    } else {
      scrollToSection(action);
    }
  };

  const getLabel = (labels: Record<Language, string>) => labels[language] || labels.fr;

  const handleSubmenuEnter = (label: string) => {
    clearTimeout(submenuTimeoutRef.current);
    setOpenSubmenu(label);
  };

  const handleSubmenuLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => setOpenSubmenu(null), 250);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled ? "bg-background/98 backdrop-blur-md shadow-medium" : "bg-background/95 backdrop-blur-sm"
      } border-b border-border`}
      style={{ zIndex: 99999 }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => scrollToSection("hero")}>
            <img src={logo} alt="AgriCapital" className="h-10 sm:h-12 lg:h-14 w-auto" />
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-0.5">
            {menuConfig.map((item) => {
              const label = getLabel(item.label);
              return (
                <div
                  key={label}
                  className="relative"
                  onMouseEnter={() => item.children && handleSubmenuEnter(label)}
                  onMouseLeave={() => item.children && handleSubmenuLeave()}
                >
                  {item.children ? (
                    <>
                      <button className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-muted/60">
                        {label}
                        <ChevronDown size={13} className={`transition-transform duration-200 ${openSubmenu === label ? "rotate-180" : ""}`} />
                      </button>
                      {openSubmenu === label && (
                        <div
                          className="absolute top-full left-0 pt-1"
                          style={{ zIndex: 999999 }}
                          onMouseEnter={() => handleSubmenuEnter(label)}
                          onMouseLeave={handleSubmenuLeave}
                        >
                          <div className="bg-card backdrop-blur-lg rounded-xl shadow-strong border border-border py-2 min-w-[220px]">
                            {item.children.map((child) => (
                              <button
                                key={getLabel(child.label)}
                                onClick={() => handleItemClick(child.action, child.isRoute)}
                                className="w-full px-4 py-3 text-left text-sm text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-colors font-medium"
                              >
                                {getLabel(child.label)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item.action!, item.isRoute)}
                      className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-muted/60"
                    >
                      {label}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Language */}
            <div className="relative ml-1" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition-colors text-sm font-medium px-2.5 py-2 rounded-lg hover:bg-muted/60"
              >
                <Globe size={16} />
                <span className="uppercase text-xs tracking-wide">{language}</span>
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 mt-1 rounded-xl shadow-strong py-2 min-w-[160px] bg-card border border-border" style={{ zIndex: 999999 }}>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 ${language === lang ? "text-primary font-semibold bg-primary/5" : "text-foreground/70"}`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-gradient-accent border-0 text-white hover:opacity-90 transition-all ml-2 rounded-lg shadow-soft text-sm font-semibold"
              size="sm"
            >
              {t.nav.contact}
            </Button>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-1">
            <div className="relative" ref={mobileLangMenuRef}>
              <button
                onClick={() => setShowMobileLangMenu(!showMobileLangMenu)}
                className="flex items-center gap-1 text-foreground/70 hover:text-foreground p-2 rounded-lg"
              >
                <Globe size={18} />
                <span className="uppercase text-xs font-medium">{language}</span>
              </button>
              {showMobileLangMenu && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={() => setShowMobileLangMenu(false)} />
                  <div className="fixed right-4 mt-2 rounded-xl shadow-strong py-2 min-w-[170px] bg-card border border-border" style={{ zIndex: 999999, top: "60px" }}>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setShowMobileLangMenu(false); }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${language === lang ? "text-primary font-semibold bg-primary/5" : "text-foreground/70"}`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="text-foreground p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-3 border-t border-border bg-background max-h-[75vh] overflow-y-auto">
            <div className="flex flex-col gap-0.5">
              {menuConfig.map((item) => {
                const label = getLabel(item.label);
                return (
                  <div key={label}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => setOpenMobileSubmenu(openMobileSubmenu === label ? null : label)}
                          className="flex items-center justify-between w-full text-foreground/80 hover:text-foreground font-medium text-left px-3 py-3 rounded-lg hover:bg-muted/40 text-sm"
                        >
                          {label}
                          <ChevronDown size={15} className={`transition-transform ${openMobileSubmenu === label ? "rotate-180" : ""}`} />
                        </button>
                        {openMobileSubmenu === label && (
                          <div className="ml-3 border-l-2 border-primary/15 pl-3 flex flex-col gap-0.5 mb-1">
                            {item.children.map((child) => (
                              <button
                                key={getLabel(child.label)}
                                onClick={() => handleItemClick(child.action, child.isRoute)}
                                className="text-sm text-muted-foreground hover:text-foreground font-medium text-left px-3 py-2.5 rounded-lg hover:bg-muted/40"
                              >
                                {getLabel(child.label)}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleItemClick(item.action!, item.isRoute)}
                        className="text-foreground/80 hover:text-foreground font-medium text-left px-3 py-3 rounded-lg hover:bg-muted/40 text-sm"
                      >
                        {label}
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="pt-2 px-3">
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="bg-gradient-accent border-0 text-white hover:opacity-90 w-full rounded-lg text-sm font-semibold"
                >
                  {t.nav.contact}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DynamicNavigation;
