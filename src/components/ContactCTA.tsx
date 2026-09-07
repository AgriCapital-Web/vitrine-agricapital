import React from "react";

/** Portail public de prise de contact AgriCapital. */
export const CONTACT_PORTAL_URL = "https://app.agricapital.ci/leads/public";

/** Libellé multilingue du bouton « Me faire contacter ». */
export const contactCtaLabel = (language?: string) => {
  switch (language) {
    case "en":
      return "Contact me";
    case "ar":
      return "اتصلوا بي";
    case "es":
      return "Contáctenme";
    case "de":
      return "Kontaktiert mich";
    case "zh":
      return "请联系我";
    default:
      return "Me faire contacter";
  }
};

interface ContactCTAProps {
  children: React.ReactNode;
  className?: string;
}

/** Enveloppe un bouton pour l'ouvrir sur le portail de contact AgriCapital. */
const ContactCTA = ({ children, className }: ContactCTAProps) => (
  <a
    href={CONTACT_PORTAL_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex ${className ?? ""}`}
  >
    {children}
  </a>
);

export default ContactCTA;
