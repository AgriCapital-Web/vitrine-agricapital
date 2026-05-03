import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Leaf, Target, CheckCircle, TrendingUp, Sprout, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

import nurseryPepiniere from "@/assets/nursery-pepiniere-daloa.jpg";
import nurseryImage2 from "@/assets/nursery-dec-2025-2.jpg";
import nurserySite from "@/assets/nursery-site.webp";
import nurseryInspection from "@/assets/nursery-inspection-2026.jpg";
import founderPalm from "@/assets/founder-palm-field.jpg";
import vavouaSite from "@/assets/vavoua-site-2026.jpg";
import vavouaLand from "@/assets/vavoua-land-2026.jpg";
import jalonImage1 from "@/assets/jalon-1.jpg";
import jalonImage2 from "@/assets/jalon-2.jpg";
import jalonImage3 from "@/assets/jalon-3.jpg";
import jalonImage4 from "@/assets/jalon-4.jpg";
import jalonImage5 from "@/assets/jalon-5.jpg";
import jalonImage6 from "@/assets/jalon-6.jpg";
import jalonImage7 from "@/assets/jalon-7.jpg";

const Evolution = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const texts = {
    fr: {
      title: "Évolution du Projet",
      subtitle: "Suivez la progression opérationnelle d'AgriCapital sur le terrain",
      backHome: "Retour à l'accueil",
      milestones: "Jalons Clés",
      completed: "Réalisé",
      inProgress: "En cours",
      upcoming: "À venir",
      gallery: "Galerie Terrain",
      hectares: "ha de pépinière active",
      lands: "ha identifiés sur le territoire",
      waitlist: "souscripteurs en liste d'attente",
      ctaTitle: "Créez votre patrimoine agricole",
      ctaSubtitle: "Rejoignez la liste d'attente et soyez parmi les premiers souscripteurs d'AgriCapital.",
      contactUs: "Nous contacter",
      daloaTitle: "Pépinière de Daloa — 120 hectares",
      daloaDesc: "Site pleinement opérationnel : système d'irrigation autonome, plants certifiés Tenera, équipe technique mobilisée.",
      vavouaTitle: "Site de Vavoua — 100 hectares (Prévu 2026)",
      vavouaDesc: "Second site de pépinière dans le secteur Vrouho. Terrains identifiés, prospections en cours.",
      launchTitle: "Photos du Lancement — Novembre 2025",
      m1: { date: "19 Novembre 2025", title: "Lancement des Opérations Terrain", desc: "Démarrage officiel d'AgriCapital avec l'installation de l'infrastructure opérationnelle et le début des activités sur le terrain." },
      m2: { date: "Nov – Déc 2025", title: "Pépinière Daloa — 120 ha", desc: "Installation complète de la pépinière de 120 hectares à Daloa avec irrigation autonome et plants certifiés Tenera." },
      m3: { date: "En cours", title: "Déploiement Commercial", desc: "Ouverture de la liste d'attente, prospection communautaire active et premiers engagements de souscripteurs intéressés par les formules PalmInvest et TerraPalm." },
      m4: { date: "2026", title: "Site Vavoua — 100 ha", desc: "Ouverture d'un second site de pépinière à Vavoua (secteur Vrouho), portant la capacité totale à plus de 200 hectares." },
    },
    en: {
      title: "Project Evolution",
      subtitle: "Track AgriCapital's operational progress on the ground",
      backHome: "Back to home",
      milestones: "Key Milestones",
      completed: "Completed",
      inProgress: "In Progress",
      upcoming: "Upcoming",
      gallery: "Field Gallery",
      hectares: "ha of active nursery",
      lands: "ha identified across the territory",
      waitlist: "subscribers on waitlist",
      ctaTitle: "Create your agricultural heritage",
      ctaSubtitle: "Join the waitlist and be among the first AgriCapital subscribers.",
      contactUs: "Contact us",
      daloaTitle: "Daloa Nursery — 120 hectares",
      daloaDesc: "Fully operational site: autonomous irrigation, certified Tenera seedlings, mobilized technical team.",
      vavouaTitle: "Vavoua Site — 100 hectares (Planned 2026)",
      vavouaDesc: "Second nursery site in the Vrouho sector. Land identified, prospecting underway.",
      launchTitle: "Launch Photos — November 2025",
      m1: { date: "November 19, 2025", title: "Field Operations Launch", desc: "Official start of AgriCapital with operational infrastructure installation and field activities." },
      m2: { date: "Nov – Dec 2025", title: "Daloa Nursery — 120 ha", desc: "Complete installation of the 120-hectare nursery in Daloa with autonomous irrigation and certified Tenera plants." },
      m3: { date: "Ongoing", title: "Commercial Deployment", desc: "Waitlist opening, active community prospecting and first subscriber commitments for PalmInvest and TerraPalm formulas." },
      m4: { date: "2026", title: "Vavoua Site — 100 ha", desc: "Opening of a second nursery site in Vavoua (Vrouho sector), bringing total capacity to over 200 hectares." },
    },
  };

  const t = texts[language as keyof typeof texts] || texts.fr;

  const milestones = [
    { ...t.m1, status: "completed", icon: Target },
    { ...t.m2, status: "completed", icon: Sprout },
    { ...t.m3, status: "in_progress", icon: Users },
    { ...t.m4, status: "upcoming", icon: MapPin },
  ];

  const daloaPhotos = [nurseryPepiniere, nurseryImage2, nurserySite, nurseryInspection, founderPalm];
  const vavouaPhotos = [vavouaSite, vavouaLand];
  const launchPhotos = [jalonImage1, jalonImage2, jalonImage3, jalonImage4, jalonImage5, jalonImage6, jalonImage7];

  const stats = [
    { value: "120+", label: t.hectares, icon: Leaf },
    { value: "500+", label: t.lands, icon: MapPin },
    { value: "200+", label: t.waitlist, icon: Users },
  ];

  const statusStyles = {
    completed: { border: "border-l-primary", bg: "bg-primary/5", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", iconBg: "bg-primary/10 text-primary" },
    in_progress: { border: "border-l-accent", bg: "bg-accent/5", badge: "bg-amber-50 text-amber-700 border-amber-200", iconBg: "bg-accent/10 text-accent" },
    upcoming: { border: "border-l-border", bg: "bg-muted/30", badge: "bg-muted text-muted-foreground border-border", iconBg: "bg-muted text-muted-foreground" },
  };

  return (
    <>
      <SEOHead />
      <DynamicNavigation />

      <main className="pt-16 min-h-screen bg-background">
        {/* Hero — clean editorial */}
        <section className="relative py-20 sm:py-28 bg-gradient-primary text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMGgyMHYyMEgzMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-40" />
          <div className="container mx-auto px-4 relative">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-6 text-white/70 hover:text-white hover:bg-white/10 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t.backHome}
              </Button>
            </Link>
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-4 text-white">{t.title}</h1>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed">{t.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-0 -mt-10 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-card rounded-xl border border-border shadow-medium p-4 sm:p-6 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-primary/70" />
                    <p className="text-2xl sm:text-3xl font-bold text-foreground font-sans">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl text-center mb-12 sm:mb-16">{t.milestones}</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {milestones.map((ms, i) => {
                const Icon = ms.icon;
                const style = statusStyles[ms.status as keyof typeof statusStyles];
                return (
                  <div key={i} className={`rounded-xl border-l-4 ${style.border} ${style.bg} border border-border p-5 sm:p-6`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {ms.date}
                          </span>
                          <Badge variant="outline" className={`text-xs ${style.badge}`}>
                            {ms.status === "completed" && <><CheckCircle className="w-3 h-3 mr-1" />{t.completed}</>}
                            {ms.status === "in_progress" && t.inProgress}
                            {ms.status === "upcoming" && <><Clock className="w-3 h-3 mr-1" />{t.upcoming}</>}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold font-sans mb-1.5">{ms.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ms.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl text-center mb-12 sm:mb-16">{t.gallery}</h2>

            {/* Daloa */}
            <div className="mb-16">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sprout className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold font-sans text-primary">{t.daloaTitle}</h3>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">{t.daloaDesc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
                {daloaPhotos.map((photo, i) => (
                  <div key={i} className="cursor-pointer overflow-hidden rounded-xl shadow-soft hover:shadow-medium transition-all aspect-[4/3] group" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Daloa ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* Vavoua */}
            <div className="mb-16">
              <div className="flex items-center gap-2 justify-center mb-2">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold font-sans text-accent">{t.vavouaTitle}</h3>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">{t.vavouaDesc}</p>
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                {vavouaPhotos.map((photo, i) => (
                  <div key={i} className="cursor-pointer overflow-hidden rounded-xl shadow-soft hover:shadow-medium transition-all aspect-[4/3] group" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Vavoua ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            {/* Launch */}
            <div>
              <div className="flex items-center gap-2 justify-center mb-6">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold font-sans text-primary">{t.launchTitle}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-6xl mx-auto">
                {launchPhotos.map((photo, i) => (
                  <div key={i} className="cursor-pointer overflow-hidden rounded-xl shadow-soft hover:shadow-medium transition-all aspect-[4/3] group" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Launch ${i + 1}`} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl mb-3">{t.ctaTitle}</h2>
              <p className="text-muted-foreground mb-8 text-lg">{t.ctaSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  <Link to="/#contact">{t.contactUs}</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-lg">
                  <a href="tel:+2250564551717">📞 05 64 55 17 17</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-card">
          {selectedImage && <img src={selectedImage} alt="AgriCapital" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Evolution;
