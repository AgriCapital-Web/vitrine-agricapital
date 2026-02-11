import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, Mail, MessageCircle, ChevronRight, Leaf, Users, TrendingUp, Shield, Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
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
      answer: "AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans l'accompagnement agricole inclusif. Elle pilote le programme « Palmier Solidaire », un modèle innovant permettant aux familles rurales vulnérables d'accéder à la filière palmier à huile avec accompagnement technique complet et garantie d'écoulement de la production."
    },
    {
      category: "general",
      question: "Qu'est-ce que le programme Palmier Solidaire ?",
      answer: "Le programme « Palmier Solidaire » vise à améliorer durablement les conditions de vie des familles rurales vulnérables à travers une agriculture inclusive, durable et résiliente au changement climatique. Il cible prioritairement les femmes, les jeunes et les chefs de ménages dans la région du Haut-Sassandra."
    },
    {
      category: "general",
      question: "Où se trouve AgriCapital ?",
      answer: "Notre siège est situé à Gonaté, Daloa, dans la région du Haut-Sassandra en Côte d'Ivoire. Notre zone d'intervention couvre Daloa, Vavoua, Zoukougbeu et Issia."
    },
    {
      category: "general",
      question: "AgriCapital est-elle une entreprise légale ?",
      answer: "Oui, AGRICAPITAL SARL est formellement constituée et opérationnelle, immatriculée au RCCM sous le numéro CI-DAL-01-2025-B12-13435."
    },
    {
      category: "general",
      question: "Qui peut bénéficier du programme ?",
      answer: "Le programme s'adresse aux familles rurales vulnérables, principalement les femmes, les jeunes et les chefs de ménages disposant de terres à valoriser. Il est aussi ouvert aux propriétaires terriens, producteurs et toute personne souhaitant participer au développement de la filière palmier à huile."
    },
    
    // ACCOMPAGNEMENT
    {
      category: "accompagnement",
      question: "En quoi consiste l'accompagnement d'AgriCapital ?",
      answer: "Notre accompagnement intégré comprend : la fourniture de plants certifiés Tenera et intrants adaptés, le suivi technique continu par des techniciens qualifiés, des formations pratiques sur les techniques agricoles durables, des sessions dédiées aux femmes et jeunes sur l'entrepreneuriat rural, et la garantie d'écoulement de la production."
    },
    {
      category: "accompagnement",
      question: "Que fournit le bénéficiaire ?",
      answer: "Le bénéficiaire apporte sa parcelle de terre et la main-d'œuvre locale pour les travaux de terrain (nettoyage, défrichage, trouaison, plantation, entretien). AgriCapital fournit les intrants, l'expertise technique et la garantie commerciale."
    },
    {
      category: "accompagnement",
      question: "D'où proviennent les plants de palmier ?",
      answer: "Nos plants proviennent de semences certifiées d'origine Iro Lamé, fournies par notre partenaire Les Palmistes. Il s'agit de la variété Tenera, tolérante à la fusariose, garantissant des plants de haute qualité et productifs."
    },
    {
      category: "accompagnement",
      question: "Quelles sont les étapes du programme ?",
      answer: "Le programme se déroule en 5 étapes : (1) Prospection et mobilisation des familles bénéficiaires, (2) Mise en place des plantations avec plants certifiés, (3) Renforcement des capacités et formations, (4) Suivi technique et accompagnement continu, (5) Accès au marché avec garantie d'écoulement."
    },
    
    // GARANTIES
    {
      category: "garanties",
      question: "Quelle garantie d'écoulement offre AgriCapital ?",
      answer: "AgriCapital s'engage à assurer l'écoulement de 100% de la production de régimes de palmier frais à des prix du marché, pendant une durée minimum de 20 ans. Cette garantie assure des débouchés stables et des revenus prévisibles pour tous les bénéficiaires."
    },
    {
      category: "garanties",
      question: "Comment AgriCapital sécurise-t-elle le programme ?",
      answer: "La sécurisation repose sur : un modèle solidaire éprouvé, des partenariats industriels pour la commercialisation, un accompagnement technique réduisant les risques, la transparence et la traçabilité des opérations, et un engagement contractuel à long terme."
    },
    
    // IMPACT SOCIAL
    {
      category: "offres",
      question: "Quels sont les objectifs sociaux du programme ?",
      answer: "D'ici 2030, le programme vise à accompagner 1 000 familles rurales (dont 60% de femmes et jeunes), valoriser 500 hectares de terres sous-exploitées, renforcer les capacités techniques des bénéficiaires, accroître les revenus agricoles et la sécurité alimentaire, et contribuer à la résilience climatique."
    },
    {
      category: "offres",
      question: "Comment le programme favorise-t-il l'autonomisation des femmes ?",
      answer: "Le programme intègre des sessions de formation spécifiques pour les femmes et les jeunes, couvrant la gestion agricole et l'entrepreneuriat rural. 60% des bénéficiaires ciblés sont des femmes et des jeunes, avec des groupes d'entraide communautaire dédiés."
    },
    {
      category: "offres",
      question: "Comment le programme contribue-t-il à la résilience climatique ?",
      answer: "Le programme promeut des pratiques agricoles respectueuses de l'environnement, utilise des variétés de plants adaptées au climat local, et sensibilise les bénéficiaires sur la protection de l'environnement et les bonnes pratiques durables."
    },
    
    // INVESTISSEMENT (reformulé sans montants)
    {
      category: "investissement",
      question: "Comment puis-je soutenir le programme Palmier Solidaire ?",
      answer: "Plusieurs formes de partenariat sont possibles : partenariat foncier (mise à disposition de terres), partenariat technique, partenariat institutionnel (ONG, fondations), ou partenariat financier. Contactez notre équipe pour discuter des modalités adaptées à votre situation."
    },
    {
      category: "investissement",
      question: "Le programme est-il ouvert aux institutions et fondations ?",
      answer: "Absolument. Le programme Palmier Solidaire est conçu pour accueillir des partenaires institutionnels, des fondations et des ONG souhaitant contribuer au développement rural durable et à l'autonomisation des communautés vulnérables en Côte d'Ivoire."
    },
    
    // ENTREPRISE
    {
      category: "entreprise",
      question: "Quelle est l'expérience de l'équipe AgriCapital ?",
      answer: "Le fondateur Inocent KOFFI possède 12 années d'expérience professionnelle terrain, ayant parcouru plus de 360 localités dans 8 régions de Côte d'Ivoire. Cette connaissance approfondie des réalités rurales a permis de concevoir le programme Palmier Solidaire, adapté aux besoins réels des communautés."
    },
    {
      category: "entreprise",
      question: "Quelle est la vision d'AgriCapital ?",
      answer: "Notre vision est d'améliorer durablement les conditions de vie des familles rurales à travers une agriculture inclusive et résiliente. Nous voulons stimuler l'économie rurale, contribuer à la sécurité alimentaire, réduire l'exode rural et impacter positivement les générations futures."
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
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-agri-green text-white">
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
