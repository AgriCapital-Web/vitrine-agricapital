import logoWhite from "@/assets/logo-white.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import Newsletter from "./Newsletter";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-agri-green text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <img 
              src={logoWhite} 
              alt="AgriCapital Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-white/80 text-sm mb-4">
              {t.footer.description}
            </p>
            <p className="text-white/70 text-sm font-medium">
              {t.footer.capitalSocial}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("accueil")}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("apropos")}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("approche")}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  {t.nav.approach}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("impact")}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  {t.nav.impact}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("partenariat")}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  {t.nav.partnership}
                </button>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  <HelpCircle size={14} />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.contact.title}</h3>
            <div className="space-y-3 text-sm">
              <p className="text-white/80">
                <strong className="text-white">{t.contact.address.title}:</strong><br />
                {t.contact.address.value}
              </p>
              <p className="text-white/80">
                <strong className="text-white">{t.contact.email.title}:</strong><br />
                <a href="mailto:contact@agricapital.ci" className="hover:text-white transition-colors">
                  {t.contact.email.value}
                </a>
              </p>
              <p className="text-white/80">
                <strong className="text-white">{t.contact.phone.title}:</strong><br />
                <a href="https://wa.me/2250564551717" className="hover:text-white transition-colors">
                  +225 05 64 55 17 17
                </a>
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t.newsletter?.title || "Newsletter"}</h3>
            <p className="text-white/80 text-sm mb-4">
              {t.newsletter?.subtitle || "Restez informé de nos actualités"}
            </p>
            <Newsletter />
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-white/70 text-sm">
            © 2025 {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
