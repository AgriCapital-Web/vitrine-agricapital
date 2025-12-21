import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Factory, Wrench, Heart, CheckCircle2 } from "lucide-react";
import lesPalmistesLogo from "@/assets/les-palmistes-logo.jpeg";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Partners list - easy to extend
const partners = [
  {
    id: 1,
    logo: lesPalmistesLogo,
    nameKey: "name",
    descKey: "desc",
  },
  // Add more partners here as they join
  // {
  //   id: 2,
  //   logo: partnerLogo2,
  //   nameKey: "name2",
  //   descKey: "desc2",
  // },
];

const Partnership = () => {
  const { t } = useLanguage();
  
  const opportunities = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: t.partnership.opportunities.investor.title,
      description: t.partnership.opportunities.investor.desc,
    },
    {
      icon: <Factory className="w-8 h-8" />,
      title: t.partnership.opportunities.industrial?.title || "Partenaires Industriels",
      description: t.partnership.opportunities.industrial?.desc || "Collaborer pour sécuriser l'approvisionnement en régimes de palmier frais certifiés, traçables et de qualité supérieure.",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: t.partnership.opportunities.technical?.title || "Partenaires Techniques",
      description: t.partnership.opportunities.technical?.desc || "S'associer pour renforcer l'expertise agronomique, la formation des producteurs et la certification des pratiques agricoles durables.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t.partnership.opportunities.institution.title,
      description: t.partnership.opportunities.institution.desc,
    },
  ];

  const advantages = [
    t.partnership.advantages.demand || "Demande confirmée par une enquête terrain rigoureuse",
    t.partnership.advantages.team || "Équipe expérimentée et ancrée localement depuis plus de 10 ans",
    t.partnership.advantages.approach || "Approche innovante répondant à un besoin réel et structurel",
    t.partnership.advantages.expansion || "Fort potentiel d'expansion régional",
    t.partnership.advantages.sdg || "Impact mesurable et aligné avec les ODD",
    t.partnership.advantages.transparency || "Transparence et relations basées sur la confiance",
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="partenariat" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.partnership.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.partnership.subtitle}
          </p>
        </div>

        {/* Current Partners - Always Carousel */}
        <div className="mb-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            {t.partnership.currentPartner.title}
          </h3>
          
          <Carousel 
            className="w-full"
            opts={{
              align: "center",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/2">
                  <Card className="bg-primary/10 border-primary h-full">
                    <CardContent className="p-6 md:p-8 flex flex-col items-center">
                      <div className="bg-white rounded-2xl p-6 shadow-medium w-full max-w-md mb-4">
                        <img
                          src={partner.logo}
                          alt="Les Palmistes - Fournisseur de semences certifiées"
                          className="w-full h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="text-xl font-bold text-foreground mb-2 text-center">
                        {t.partnership.currentPartner.name}
                      </h4>
                      <p className="text-muted-foreground text-center">
                        {t.partnership.currentPartner.desc}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {partners.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-12" />
                <CarouselNext className="hidden md:flex -right-12" />
              </>
            )}
          </Carousel>
          
          <p className="text-center text-muted-foreground mt-4">
            {t.partnership.otherPartnerships}
          </p>
        </div>

        {/* Opportunities */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            {t.partnership.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {opportunities.map((opp, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-8">
                  <div className="text-accent mb-4">{opp.icon}</div>
                  <h4 className="text-xl font-bold text-foreground mb-4">{opp.title}</h4>
                  <p className="text-muted-foreground leading-relaxed mb-6">{opp.description}</p>
                  <Button
                    onClick={scrollToContact}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-smooth"
                  >
                    {t.partnership.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div className="bg-background rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            {t.partnership.advantages.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground text-lg">{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partnership;
