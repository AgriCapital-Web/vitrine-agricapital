import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Leaf, Target, CheckCircle, TrendingUp, Sprout, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

// Daloa nursery images
import nurseryImage1 from "@/assets/nursery-dec-2025-1.jpg";
import nurseryImage2 from "@/assets/nursery-dec-2025-2.jpg";
import nurserySite from "@/assets/nursery-site.webp";
import nurseryInspection from "@/assets/nursery-inspection-2026.jpg";
import founderPalm from "@/assets/founder-palm-field.jpg";

// Vavoua site images
import vavouaSite from "@/assets/vavoua-site-2026.jpg";
import vavouaLand from "@/assets/vavoua-land-2026.jpg";

// Launch photos
import jalonImage1 from "@/assets/jalon-1.jpg";
import jalonImage2 from "@/assets/jalon-2.jpg";
import jalonImage3 from "@/assets/jalon-3.jpg";
import jalonImage4 from "@/assets/jalon-4.jpg";
import jalonImage5 from "@/assets/jalon-5.jpg";
import jalonImage6 from "@/assets/jalon-6.jpg";
import jalonImage7 from "@/assets/jalon-7.jpg";

const Evolution = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const et = t.evolution || {
    title: "Évolution du Projet AgriCapital",
    subtitle: "Suivez notre progression et nos réalisations concrètes sur le terrain",
    backHome: "Retour à l'accueil",
    milestones: "Jalons du Projet",
    completed: "Réalisé",
    inProgress: "En cours",
    upcoming: "À venir",
    gallery: "Galerie Photos",
    hectares: "hectares de pépinière",
    communities: "localités sensibilisées",
    partners: "partenaires producteurs engagés",
    ctaTitle: "Rejoignez l'aventure AgriCapital",
    ctaSubtitle: "Devenez partenaire producteur et faites partie de cette success story",
    contactUs: "Nous contacter",
  };

  const milestones = [
    {
      date: "19 Novembre 2025",
      title: language === "fr" ? "Lancement Officiel" : "Official Launch",
      description: language === "fr" 
        ? "Lancement officiel d'AgriCapital avec la présentation du modèle innovant d'accompagnement agricole."
        : "Official launch of AgriCapital with the presentation of the innovative agricultural support model.",
      status: "completed",
      icon: Target,
    },
    {
      date: "19 Nov - 24 Déc 2025",
      title: language === "fr" ? "Pépinière Daloa — 100 ha" : "Daloa Nursery — 100 ha",
      description: language === "fr"
        ? "Installation complète du site de pépinière de plus de 100 hectares à Daloa avec système d'irrigation autonome."
        : "Complete installation of the 100+ hectare nursery site in Daloa with autonomous irrigation system.",
      status: "completed",
      icon: Sprout,
    },
    {
      date: language === "fr" ? "En cours" : "Ongoing",
      title: language === "fr" ? "Prospection Communautaire" : "Community Prospecting",
      description: language === "fr"
        ? "Engagement continu avec les communautés locales et identification des propriétaires fonciers et partenaires intéressés par le développement de plantations clé en main avec AgriCapital."
        : "Ongoing engagement with local communities and identification of landowners and partners interested in turnkey plantation development with AgriCapital.",
      status: "in_progress",
      icon: Users,
    },
    {
      date: "2026",
      title: language === "fr" ? "Site Vavoua — 100 ha (Prévu)" : "Vavoua Site — 100 ha (Planned)",
      description: language === "fr"
        ? "Ouverture d'un second site de pépinière de 100 hectares à Vavoua (secteur Vrouho), portant la capacité totale à 200 hectares."
        : "Opening of a second 100-hectare nursery site in Vavoua (Vrouho sector), bringing total capacity to 200 hectares.",
      status: "upcoming",
      icon: MapPin,
    },
  ];

  const daloaPhotos = [nurseryImage1, nurseryImage2, nurserySite, nurseryInspection, founderPalm];
  const vavouaPhotos = [vavouaSite, vavouaLand];
  const launchPhotos = [jalonImage1, jalonImage2, jalonImage3, jalonImage4, jalonImage5, jalonImage6, jalonImage7];

  const stats = [
    { value: "100+", label: et.hectares, icon: Leaf },
    { value: "50+", label: et.communities, icon: MapPin },
    { value: "200+", label: et.partners, icon: Users },
  ];

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 sm:py-16 bg-agri-green text-white">
          <div className="container mx-auto px-4">
            <Link to="/">
              <Button variant="ghost" className="mb-4 text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {et.backHome}
              </Button>
            </Link>
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{et.title}</h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">{et.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 -mt-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="text-center border-2 border-agri-green/20 shadow-lg">
                    <CardContent className="p-4 sm:p-6">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-agri-green" />
                      <p className="text-2xl sm:text-3xl font-bold text-agri-green">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">{et.milestones}</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <Card key={index} className={`border-l-4 ${
                    milestone.status === 'completed' ? 'border-l-agri-green bg-agri-green/5' :
                    milestone.status === 'in_progress' ? 'border-l-agri-orange bg-agri-orange/5' :
                    'border-l-muted bg-muted/10'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          milestone.status === 'completed' ? 'bg-agri-green/20 text-agri-green' :
                          milestone.status === 'in_progress' ? 'bg-agri-orange/20 text-agri-orange' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className={
                              milestone.status === 'completed' ? 'border-agri-green text-agri-green' :
                              milestone.status === 'in_progress' ? 'border-agri-orange text-agri-orange' :
                              'border-muted-foreground text-muted-foreground'
                            }>
                              <Calendar className="w-3 h-3 mr-1" />
                              {milestone.date}
                            </Badge>
                            {milestone.status === 'completed' && (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <CheckCircle className="w-3 h-3 mr-1" />{et.completed}
                              </Badge>
                            )}
                            {milestone.status === 'in_progress' && (
                              <Badge className="bg-amber-100 text-amber-700">{et.inProgress}</Badge>
                            )}
                            {milestone.status === 'upcoming' && (
                              <Badge variant="outline" className="text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />{et.upcoming}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold mb-2">{milestone.title}</h3>
                          <p className="text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Daloa Nursery Section */}
        <section className="py-12 sm:py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">{et.gallery}</h2>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-center mb-2 text-agri-green">
                <Sprout className="w-5 h-5 inline-block mr-2" />
                {language === "fr" ? "Pépinière de Daloa — 100 hectares (Déc. 2025)" : "Daloa Nursery — 100 hectares (Dec. 2025)"}
              </h3>
              <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto text-sm">
                {language === "fr"
                  ? "Site pleinement opérationnel avec système d'irrigation autonome, plants certifiés Tenera et équipe technique mobilisée."
                  : "Fully operational site with autonomous irrigation, certified Tenera seedlings and mobilized technical team."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {daloaPhotos.map((photo, index) => (
                  <div key={index} className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all aspect-[4/3]" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Pépinière Daloa ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* Vavoua Section */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-center mb-2 text-agri-orange">
                <MapPin className="w-5 h-5 inline-block mr-2" />
                {language === "fr" ? "Site de Vavoua — 100 hectares (Prévu 2026)" : "Vavoua Site — 100 hectares (Planned 2026)"}
              </h3>
              <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto text-sm">
                {language === "fr"
                  ? "Le second site de pépinière sera implanté à Vavoua, secteur Vrouho. Les terrains ont été identifiés et les prospections sont en cours."
                  : "The second nursery site will be established in Vavoua, Vrouho sector. Land has been identified and prospecting is underway."}
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {vavouaPhotos.map((photo, index) => (
                  <div key={index} className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all aspect-[4/3]" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Site Vavoua ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Photos */}
            <div>
              <h3 className="text-xl font-semibold text-center mb-6 text-agri-green">
                <Target className="w-5 h-5 inline-block mr-2" />
                {language === "fr" ? "Photos du Lancement — Novembre 2025" : "Launch Photos — November 2025"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
                {launchPhotos.map((photo, index) => (
                  <div key={index} className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all aspect-[4/3]" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Lancement ${index + 1}`} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">{et.ctaTitle}</CardTitle>
                <CardDescription>{et.ctaSubtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild className="bg-agri-green hover:bg-agri-green-dark">
                    <Link to="/#contact">{et.contactUs}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="tel:+2250564551717">📞 05 64 55 17 17</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && <img src={selectedImage} alt="AgriCapital" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Evolution;
