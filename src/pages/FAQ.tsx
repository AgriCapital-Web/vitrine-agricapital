import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, Mail, MessageCircle, ChevronRight, Leaf, Users, TrendingUp, Shield, Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("general");
  const navigate = useNavigate();

  // Get FAQ translations with fallback
  const ft = t.faq || {
    title: "Foire Aux Questions",
    subtitle: "Trouvez rapidement les réponses à vos questions.",
    categories: {
      general: "Général",
      offers: "Nos Offres",
      investment: "Investissement",
      support: "Accompagnement",
      guarantees: "Garanties",
      company: "L'Entreprise",
    },
    noQuestions: "Aucune question dans cette catégorie.",
    ctaTitle: "Vous n'avez pas trouvé votre réponse ?",
    ctaSubtitle: "Notre équipe est disponible pour répondre à toutes vos questions.",
    contactUs: "Nous contacter",
  };

  const categories = [
    { id: "general", label: ft.categories.general, icon: HelpCircle },
    { id: "offres", label: ft.categories.offers, icon: Leaf },
    { id: "investissement", label: ft.categories.investment, icon: TrendingUp },
    { id: "accompagnement", label: ft.categories.support, icon: Users },
    { id: "garanties", label: ft.categories.guarantees, icon: Shield },
    { id: "entreprise", label: ft.categories.company, icon: Building2 },
  ];

  const faqItems: FAQItem[] = [
    // GÉNÉRAL
    {
      category: "general",
      question: "Qu'est-ce qu'AgriCapital ?",
      answer: "AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans l'accompagnement agricole et les services intégrés, notamment dans la création et le développement de plantations de palmiers à huile. Nous agissons comme un facilitateur d'accès à la culture du palmier à huile, avec pour ambition de rendre cette activité accessible aux populations, sans barrières financières ni techniques."
    },
    {
      category: "general",
      question: "Où se trouve AgriCapital ?",
      answer: "Notre siège est situé à Gonaté, Daloa, dans la région du Haut-Sassandra en Côte d'Ivoire. Nous intervenons dans plusieurs régions du pays avec un focus particulier sur le Haut-Sassandra qui offre des conditions idéales pour la culture du palmier à huile."
    },
    {
      category: "general",
      question: "AgriCapital est-elle une entreprise légale ?",
      answer: "Oui, AGRICAPITAL SARL est une entreprise formellement constituée et opérationnelle. Elle est immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) sous le numéro CI-DAL-01-2025-B12-13435, avec un capital social de 5 000 000 FCFA."
    },
    {
      category: "general",
      question: "Qui peut bénéficier des services d'AgriCapital ?",
      answer: "Notre modèle s'adresse à : (1) Les propriétaires terriens souhaitant valoriser leurs terres, (2) Les petits producteurs ne disposant pas de moyens financiers, (3) Les professionnels du secteur public et privé (commerçants, artisans, entrepreneurs) sans terre, (4) Toute personne désireuse de participer au secteur agricole du palmier à huile."
    },
    
    // OFFRES - MISE À JOUR AVEC PROMO LANCEMENT
    {
      category: "offres",
      question: "Quelles sont les offres proposées par AgriCapital ?",
      answer: "Nous proposons 3 offres principales avec une PROMO LANCEMENT de -33% jusqu'au 31 mars 2026 : (1) PalmElite - Offre Intégrale Premium pour les propriétaires terriens (droit d'accès: 20 000F/ha au lieu de 30 000F), (2) PalmInvest - Investissement Sans Terre pour les salariés, artisans et commerçants (droit d'accès: 30 000F/ha au lieu de 45 000F), (3) TerraPalm - Valorisation Foncière Sans Effort pour les propriétaires ne souhaitant pas exploiter eux-mêmes (droit d'accès: 10 000F/ha au lieu de 15 000F)."
    },
    {
      category: "offres",
      question: "Qu'est-ce que l'offre PalmElite ?",
      answer: "PalmElite est notre offre Premium destinée aux planteurs PROPRIÉTAIRES de terre agricole. Le droit d'accès est de 20 000F/ha (ancien prix: 30 000F/ha, soit -33%). L'abonnement est modulable au choix: 65F/ha/jour, 1 900F/ha/mois, 5 500F/ha/trimestre ou 20 000F/ha/an. Vous restez 100% propriétaire de votre plantation. Condition spéciale: attester la propriété de la parcelle souscrite."
    },
    {
      category: "offres",
      question: "Qu'est-ce que l'offre PalmInvest ?",
      answer: "PalmInvest est conçue pour les salariés publics/privés, artisans et commerçants SANS terre agricole. Le droit d'accès est de 30 000F/ha (ancien prix: 45 000F/ha, soit -33%). Abonnement modulable au choix: 120F/ha/jour, 3 400F/ha/mois, 9 500F/ha/trimestre ou 35 400F/ha/an. Avantages: diversification financière intelligente avec 50% de la plantation à l'entrée en production. Condition spéciale: attester la capacité de mettre en valeur la superficie souscrite."
    },
    {
      category: "offres",
      question: "Qu'est-ce que l'offre TerraPalm ?",
      answer: "TerraPalm est destinée aux propriétaires de terre agricole ne souhaitant pas exploiter eux-mêmes. Le droit d'accès est de 10 000F/ha (ancien prix: 15 000F/ha, soit -33%) en paiement UNIQUE. La gestion complète est assurée par AgriCapital et l'exploitant avant l'entrée en production. Vous recevez 50% de la plantation dès l'entrée en production. Condition spéciale: attester la propriété de la parcelle souscrite."
    },
    {
      category: "offres",
      question: "Quelle est la durée de la promotion de lancement ?",
      answer: "La promotion de lancement avec une réduction de 33% sur les droits d'accès est valable jusqu'au 31 mars 2026. C'est une opportunité exceptionnelle pour rejoindre AgriCapital dans les meilleures conditions possibles."
    },
    
    // INVESTISSEMENT
    {
      category: "investissement",
      question: "Quel est le principe d'investissement chez AgriCapital ?",
      answer: "Nous déployons un dispositif d'investissement permettant de participer au financement de projets agricoles structurants. Il s'agit de superficies organisées et encadrées, avec une logique de participation aux performances générées, dans un cadre rigoureux, transparent et orienté création de valeur durable à moyen et long terme."
    },
    {
      category: "investissement",
      question: "Quelles sont les conditions du package d'investissement ?",
      answer: "Les conditions sont: Valeur unitaire de 50 000 FCFA par unité, seuil minimum d'investissement de 25 unités, soit un montant minimum requis de 1 250 000 FCFA. Ce format offre une exposition simple, lisible et structurée à un projet agricole porteur."
    },
    {
      category: "investissement",
      question: "Quel est le retour sur investissement espéré ?",
      answer: "Le palmier à huile entre en production généralement entre 3 et 4 ans après plantation. La production augmente progressivement pour atteindre son pic vers la 7ème année et reste stable pendant 20-25 ans. Le modèle est conçu pour générer des revenus sur le moyen et long terme avec notre garantie de rachat sur 20 ans."
    },
    
    // ACCOMPAGNEMENT
    {
      category: "accompagnement",
      question: "Quel accompagnement propose AgriCapital ?",
      answer: "Notre modèle intégré comprend: la plantation clé en main avec fourniture de plants certifiés premium (Tenera tolérants fusariose) et tous les intrants (NPK, fongicides, insecticides), le suivi technique continu par nos techniciens qualifiés, des formations aux bonnes pratiques, des visites de suivi mensuelles, la structuration et l'organisation des projets agricoles, et la sécurisation du modèle sur le long terme."
    },
    {
      category: "accompagnement",
      question: "D'où proviennent les plants de palmier ?",
      answer: "Nos plants proviennent de semences certifiées d'origine Iro Lamé, fournies par notre partenaire Les Palmistes. Il s'agit de la variété Tenera, tolérante à la fusariose, garantissant des plants de haute qualité, productifs et résistants aux maladies, essentiels pour une plantation rentable."
    },
    {
      category: "accompagnement",
      question: "Que fournit le partenaire producteur ?",
      answer: "Le partenaire producteur fournit: la parcelle (pour PalmElite et TerraPalm), la main-d'œuvre locale pour les travaux de nettoyage, défrichage, trouaison, plantation, désherbage et entretien courant, le respect des instructions techniques, et l'engagement sur la durée du projet. Nous appelons nos clients 'partenaires producteurs' car nous construisons ensemble."
    },
    {
      category: "accompagnement",
      question: "Quelles sont les étapes de l'accompagnement ?",
      answer: "Notre approche se déroule en 5 étapes: (1) Prospection et Qualification - identification et évaluation des terrains, (2) Création et Développement - mise en place de la plantation, (3) Suivi et Formation - accompagnement continu par techniciens qualifiés, (4) Récolte et Commercialisation - organisation et débouchés garantis, (5) Règlement et Bénéfices - paiement rapide sous 48h après pesée."
    },
    
    // GARANTIES
    {
      category: "garanties",
      question: "Quelle garantie de rachat offre AgriCapital ?",
      answer: "AgriCapital s'engage à racheter 100% de la production de régimes de palmier frais à des prix du marché, et ce pendant une durée minimum de 20 ans. Cette garantie assure des débouchés stables et des revenus prévisibles pour tous nos partenaires producteurs."
    },
    {
      category: "garanties",
      question: "Comment AgriCapital sécurise-t-elle les investissements ?",
      answer: "La sécurisation passe par: un modèle économique éprouvé, des partenariats industriels solides pour la commercialisation, un accompagnement technique de qualité réduisant les risques d'échec, la transparence et la traçabilité complète des opérations, et notre engagement contractuel sur 20 ans."
    },
    {
      category: "garanties",
      question: "Qui sont les partenaires industriels d'AgriCapital ?",
      answer: "AgriCapital développe des partenariats avec des industriels du secteur pour sécuriser l'approvisionnement en régimes de palmier frais certifiés, traçables et de qualité supérieure. Ces partenariats garantissent des débouchés commerciaux stables pour toute la production."
    },
    
    // ENTREPRISE
    {
      category: "entreprise",
      question: "Quelle est l'expérience de l'équipe AgriCapital ?",
      answer: "Le fondateur Inocent KOFFI possède 12 années d'immersion dans les communautés rurales ivoiriennes, ayant parcouru plus de 360 localités dans 8 régions. Cette expérience terrain approfondie a permis de comprendre les besoins réels des producteurs et de concevoir un modèle adapté à leurs réalités."
    },
    {
      category: "entreprise",
      question: "Quelle est la vision d'AgriCapital ?",
      answer: "Notre vision est de bâtir un écosystème agricole intégré pour un développement durable. Nous voulons stimuler l'économie rurale, améliorer les conditions de vie des communautés agricoles, contribuer à l'autosuffisance alimentaire, renforcer l'économie nationale et impacter positivement les générations futures."
    },
    {
      category: "entreprise",
      question: "Quelles sont les valeurs d'AgriCapital ?",
      answer: "Nos valeurs fondamentales sont: l'Accompagnement Permanent (présence continue de nos équipes), l'Innovation Agricole (modèles adaptés et techniques modernes), le Développement Rural Durable (impact positif à long terme), et la Transparence et Excellence (relations de confiance et standards rigoureux)."
    },
    {
      category: "entreprise",
      question: "Comment contacter AgriCapital ?",
      answer: "Vous pouvez nous joindre par téléphone/WhatsApp au +225 05 64 55 17 17, par email à contact@agricapital.ci, ou visiter notre site web www.agricapital.ci. Notre siège est situé à Gonaté, Daloa, Côte d'Ivoire."
    },
  ];

  const filteredFAQ = faqItems.filter(item => item.category === activeCategory);

  const scrollToContact = () => {
    navigate('/#contact');
  };

  return (
    <>
      <SEOHead />
      <Navigation />
      
      <main className="pt-20 min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-agri-green to-agri-green-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {ft.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              {ft.subtitle}
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                      activeCategory === cat.id 
                        ? "bg-agri-green hover:bg-agri-green-dark text-white" 
                        : ""
                    }`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-4 sm:px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-5">
                    <span className="text-sm sm:text-base font-medium pr-4">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4 sm:pb-5 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{ft.noQuestions}</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-agri-green/10 to-accent/10">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl sm:text-2xl">
                  {ft.ctaTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  {ft.ctaSubtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={scrollToContact}
                    className="bg-agri-green hover:bg-agri-green-dark"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {ft.contactUs}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <a href="tel:+2250564551717">
                      <Phone className="w-4 h-4 mr-2" />
                      05 64 55 17 17
                    </a>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <a href="mailto:contact@agricapital.ci">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
