import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Leaf, Target, CheckCircle, TrendingUp, Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

// Import nursery images
import nurseryImage1 from "@/assets/nursery-dec-2025-1.jpg";
import nurseryImage2 from "@/assets/nursery-dec-2025-2.jpg";
import jalonImage1 from "@/assets/jalon-1.jpg";
import jalonImage2 from "@/assets/jalon-2.jpg";
import jalonImage3 from "@/assets/jalon-3.jpg";
import jalonImage4 from "@/assets/jalon-4.jpg";
import jalonImage5 from "@/assets/jalon-5.jpg";
import jalonImage6 from "@/assets/jalon-6.jpg";
import jalonImage7 from "@/assets/jalon-7.jpg";
import nurserySite from "@/assets/nursery-site.webp";
import nurseryPalm from "@/assets/nursery-palm.jpg";

const Evolution = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get evolution translations with fallback
  const et = t.evolution || {
    title: "Évolution du Projet AgriCapital",
    subtitle: "Suivez notre progression et nos réalisations concrètes sur le terrain",
    backHome: "Retour à l'accueil",
    nurseryTitle: "Site de Pépinière - 100+ Hectares",
    nurseryDesc: "Notre site de pépinière moderne, pleinement installé entre le 19 novembre et le 24 décembre 2025",
    launchTitle: "Lancement Officiel",
    launchDate: "19 Novembre 2025",
    launchDesc: "Lancement officiel d'AgriCapital avec la présentation du modèle innovant d'accompagnement agricole.",
    nurserySetupTitle: "Installation de la Pépinière",
    nurserySetupDate: "19 Nov - 24 Déc 2025",
    nurserySetupDesc: "Installation complète de notre site de pépinière de plus de 100 hectares.",
    communityTitle: "Rencontres Communautaires",
    communityDesc: "Engagement continu avec les communautés locales du Haut-Sassandra.",
    gallery: "Galerie Photos",
    recentPhotos: "Photos Récentes - Décembre 2025",
    launchPhotos: "Photos du Lancement - Novembre 2025",
    milestones: "Jalons du Projet",
    completed: "Réalisé",
    inProgress: "En cours",
    upcoming: "À venir",
    hectares: "hectares de pépinière",
    communities: "localités sensibilisées",
    partners: "partenaires producteurs engagés",
    viewMore: "Voir en grand",
    ctaTitle: "Rejoignez l'aventure AgriCapital",
    ctaSubtitle: "Devenez partenaire producteur et faites partie de cette success story",
    contactUs: "Nous contacter"
  };

  const milestones = [
    {
      date: et.launchDate,
      title: et.launchTitle,
      description: et.launchDesc,
      status: "completed",
      icon: Target
    },
    {
      date: et.nurserySetupDate,
      title: et.nurserySetupTitle,
      description: et.nurserySetupDesc,
      status: "completed",
      icon: Sprout
    },
    {
      date: language === "fr" ? "En cours" : language === "en" ? "Ongoing" : language === "ar" ? "مستمر" : language === "es" ? "En curso" : language === "de" ? "Laufend" : "进行中",
      title: et.communityTitle,
      description: et.communityDesc,
      status: "in_progress",
      icon: Users
    }
  ];

  const recentPhotos = [
    nurseryImage1,
    nurseryImage2,
    nurserySite,
    nurseryPalm
  ];

  const launchPhotos = [
    jalonImage1,
    jalonImage2,
    jalonImage3,
    jalonImage4,
    jalonImage5,
    jalonImage6,
    jalonImage7
  ];

  const stats = [
    { value: "100+", label: et.hectares, icon: Leaf },
    { value: "50+", label: et.communities, icon: MapPin },
    { value: "200+", label: et.partners, icon: Users }
  ];

  return (
    <>
      <SEOHead />
      <Navigation />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero Section */}
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {et.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
                {et.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
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

        {/* Milestones Timeline */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              {et.milestones}
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <Card key={index} className={`border-l-4 ${
                    milestone.status === 'completed' 
                      ? 'border-l-agri-green bg-agri-green/5' 
                      : milestone.status === 'in_progress'
                      ? 'border-l-agri-orange bg-agri-orange/5'
                      : 'border-l-muted'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          milestone.status === 'completed' 
                            ? 'bg-agri-green/20 text-agri-green' 
                            : milestone.status === 'in_progress'
                            ? 'bg-agri-orange/20 text-agri-orange'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant={
                              milestone.status === 'completed' ? 'default' :
                              milestone.status === 'in_progress' ? 'secondary' : 'outline'
                            } className={
                              milestone.status === 'completed' ? 'bg-agri-green' :
                              milestone.status === 'in_progress' ? 'bg-agri-orange text-white' : ''
                            }>
                              <Calendar className="w-3 h-3 mr-1" />
                              {milestone.date}
                            </Badge>
                            {milestone.status === 'completed' && (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {et.completed}
                              </Badge>
                            )}
                            {milestone.status === 'in_progress' && (
                              <Badge className="bg-amber-100 text-amber-700">
                                {et.inProgress}
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

        {/* Recent Photos Gallery */}
        <section className="py-12 sm:py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
              {et.gallery}
            </h2>
            
            {/* December 2025 Photos */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-center mb-6 text-agri-green">
                <Sprout className="w-5 h-5 inline-block mr-2" />
                {et.recentPhotos}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {recentPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all aspect-[4/3]"
                    onClick={() => setSelectedImage(photo)}
                  >
                    <img
                      src={photo}
                      alt={`Pépinière AgriCapital ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Photos */}
            <div>
              <h3 className="text-xl font-semibold text-center mb-6 text-agri-orange">
                <Target className="w-5 h-5 inline-block mr-2" />
                {et.launchPhotos}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
                {launchPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all aspect-[4/3]"
                    onClick={() => setSelectedImage(photo)}
                  >
                    <img
                      src={photo}
                      alt={`Lancement AgriCapital ${index + 1}`}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  {et.ctaTitle}
                </CardTitle>
                <CardDescription>
                  {et.ctaSubtitle}
                </CardDescription>
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

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="AgriCapital"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Evolution;
