import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Layout, Image, MessageSquare, Users, BarChart3, FileText, 
  Video, MapPin, HelpCircle, Mail, Star, Megaphone, ArrowRight,
  Zap, Shield, Target, Award, Clock, Globe, Smartphone, Search,
  Plus, Eye, Copy, Check
} from "lucide-react";
import { toast } from "sonner";

// Section Templates Library
export const sectionTemplates = [
  // Hero Sections
  {
    id: "hero-classic",
    category: "hero",
    name: "Hero Classique",
    description: "Grande image avec titre et bouton CTA",
    icon: Layout,
    preview: "/placeholder.svg",
    settings: {
      layout: "centered",
      hasImage: true,
      hasOverlay: true,
      ctaButtons: 2,
    },
    defaultContent: {
      title: "Votre titre principal ici",
      subtitle: "Une description concise qui explique votre proposition de valeur",
      ctaPrimary: "Commencer",
      ctaSecondary: "En savoir plus",
    },
  },
  {
    id: "hero-split",
    category: "hero",
    name: "Hero Split",
    description: "Texte à gauche, image à droite",
    icon: Layout,
    preview: "/placeholder.svg",
    settings: {
      layout: "split",
      imagePosition: "right",
      hasStats: true,
    },
    defaultContent: {
      title: "Innovation et Excellence",
      subtitle: "Découvrez notre approche unique",
      stats: [
        { value: "500+", label: "Clients" },
        { value: "10M", label: "Investis" },
      ],
    },
  },
  {
    id: "hero-video",
    category: "hero",
    name: "Hero Vidéo",
    description: "Vidéo en arrière-plan",
    icon: Video,
    preview: "/placeholder.svg",
    settings: {
      hasVideo: true,
      autoplay: true,
      muted: true,
    },
    defaultContent: {
      title: "Une expérience immersive",
      videoUrl: "",
    },
  },
  
  // Feature Sections
  {
    id: "features-grid",
    category: "features",
    name: "Grille de fonctionnalités",
    description: "4 à 6 fonctionnalités en grille",
    icon: Zap,
    preview: "/placeholder.svg",
    settings: {
      columns: 3,
      hasIcons: true,
      style: "cards",
    },
    defaultContent: {
      title: "Nos fonctionnalités",
      features: [
        { icon: "shield", title: "Sécurité", description: "Protection maximale" },
        { icon: "zap", title: "Performance", description: "Rapidité garantie" },
        { icon: "globe", title: "Global", description: "Présence mondiale" },
      ],
    },
  },
  {
    id: "features-alternating",
    category: "features",
    name: "Fonctionnalités alternées",
    description: "Image et texte alternés",
    icon: Layout,
    preview: "/placeholder.svg",
    settings: {
      style: "alternating",
      hasAnimation: true,
    },
    defaultContent: {
      sections: [
        { title: "Première fonctionnalité", description: "Description détaillée", image: "" },
        { title: "Deuxième fonctionnalité", description: "Description détaillée", image: "" },
      ],
    },
  },
  {
    id: "features-icons",
    category: "features",
    name: "Icônes et texte",
    description: "Grandes icônes avec descriptions",
    icon: Star,
    preview: "/placeholder.svg",
    settings: {
      iconSize: "large",
      columns: 4,
    },
    defaultContent: {
      features: [
        { icon: "target", title: "Objectifs", description: "Atteignez vos buts" },
        { icon: "award", title: "Excellence", description: "Qualité supérieure" },
        { icon: "clock", title: "Rapidité", description: "Délais respectés" },
        { icon: "shield", title: "Fiabilité", description: "Confiance totale" },
      ],
    },
  },
  
  // Testimonial Sections
  {
    id: "testimonials-carousel",
    category: "testimonials",
    name: "Carousel témoignages",
    description: "Témoignages en carousel",
    icon: MessageSquare,
    preview: "/placeholder.svg",
    settings: {
      autoplay: true,
      showAvatar: true,
      showRating: true,
    },
    defaultContent: {
      title: "Ce que disent nos clients",
    },
  },
  {
    id: "testimonials-grid",
    category: "testimonials",
    name: "Grille témoignages",
    description: "Témoignages en grille masonry",
    icon: MessageSquare,
    preview: "/placeholder.svg",
    settings: {
      style: "masonry",
      columns: 3,
    },
    defaultContent: {
      title: "Témoignages",
    },
  },
  {
    id: "testimonials-featured",
    category: "testimonials",
    name: "Témoignage vedette",
    description: "Un grand témoignage mis en avant",
    icon: Star,
    preview: "/placeholder.svg",
    settings: {
      style: "featured",
      hasVideo: false,
    },
    defaultContent: {
      title: "Notre meilleur ambassadeur",
    },
  },
  
  // CTA Sections
  {
    id: "cta-simple",
    category: "cta",
    name: "CTA Simple",
    description: "Appel à l'action simple",
    icon: Megaphone,
    preview: "/placeholder.svg",
    settings: {
      style: "centered",
      hasBackground: true,
    },
    defaultContent: {
      title: "Prêt à commencer ?",
      subtitle: "Rejoignez-nous dès aujourd'hui",
      buttonText: "Commencer maintenant",
    },
  },
  {
    id: "cta-newsletter",
    category: "cta",
    name: "Newsletter",
    description: "Formulaire d'inscription newsletter",
    icon: Mail,
    preview: "/placeholder.svg",
    settings: {
      hasName: false,
      style: "inline",
    },
    defaultContent: {
      title: "Restez informé",
      placeholder: "Votre email",
      buttonText: "S'inscrire",
    },
  },
  {
    id: "cta-download",
    category: "cta",
    name: "Téléchargement",
    description: "CTA de téléchargement avec preview",
    icon: FileText,
    preview: "/placeholder.svg",
    settings: {
      showPreview: true,
      fileType: "pdf",
    },
    defaultContent: {
      title: "Téléchargez notre brochure",
      buttonText: "Télécharger PDF",
    },
  },
  
  // Stats Sections
  {
    id: "stats-counter",
    category: "stats",
    name: "Compteurs animés",
    description: "Chiffres qui s'animent",
    icon: BarChart3,
    preview: "/placeholder.svg",
    settings: {
      animated: true,
      columns: 4,
    },
    defaultContent: {
      stats: [
        { value: 1500, suffix: "+", label: "Clients satisfaits" },
        { value: 50, suffix: "M", label: "FCFA investis" },
        { value: 100, suffix: "%", label: "Transparent" },
        { value: 24, suffix: "/7", label: "Support" },
      ],
    },
  },
  {
    id: "stats-infographic",
    category: "stats",
    name: "Infographie",
    description: "Stats avec graphiques",
    icon: BarChart3,
    preview: "/placeholder.svg",
    settings: {
      hasCharts: true,
      style: "modern",
    },
    defaultContent: {
      title: "Nos résultats en chiffres",
    },
  },
  
  // Team Sections
  {
    id: "team-grid",
    category: "team",
    name: "Équipe en grille",
    description: "Membres avec photos et rôles",
    icon: Users,
    preview: "/placeholder.svg",
    settings: {
      columns: 4,
      showSocial: true,
    },
    defaultContent: {
      title: "Notre équipe",
      members: [],
    },
  },
  {
    id: "team-featured",
    category: "team",
    name: "Fondateur vedette",
    description: "Focus sur le fondateur",
    icon: Users,
    preview: "/placeholder.svg",
    settings: {
      style: "featured",
      showBio: true,
    },
    defaultContent: {
      title: "Notre fondateur",
    },
  },
  
  // Gallery Sections
  {
    id: "gallery-masonry",
    category: "gallery",
    name: "Galerie Masonry",
    description: "Images en disposition masonry",
    icon: Image,
    preview: "/placeholder.svg",
    settings: {
      style: "masonry",
      lightbox: true,
    },
    defaultContent: {
      title: "Notre galerie",
    },
  },
  {
    id: "gallery-carousel",
    category: "gallery",
    name: "Galerie Carousel",
    description: "Images en carousel",
    icon: Image,
    preview: "/placeholder.svg",
    settings: {
      autoplay: true,
      showThumbnails: true,
    },
    defaultContent: {
      title: "Découvrez en images",
    },
  },
  
  // Contact Sections
  {
    id: "contact-form",
    category: "contact",
    name: "Formulaire de contact",
    description: "Formulaire avec carte",
    icon: Mail,
    preview: "/placeholder.svg",
    settings: {
      showMap: true,
      showInfo: true,
    },
    defaultContent: {
      title: "Contactez-nous",
    },
  },
  {
    id: "contact-simple",
    category: "contact",
    name: "Contact simple",
    description: "Coordonnées seulement",
    icon: Mail,
    preview: "/placeholder.svg",
    settings: {
      showForm: false,
      style: "minimal",
    },
    defaultContent: {
      title: "Nous contacter",
    },
  },
  
  // FAQ Sections
  {
    id: "faq-accordion",
    category: "faq",
    name: "FAQ Accordéon",
    description: "Questions en accordéon",
    icon: HelpCircle,
    preview: "/placeholder.svg",
    settings: {
      style: "accordion",
      searchable: true,
    },
    defaultContent: {
      title: "Questions fréquentes",
      questions: [],
    },
  },
  {
    id: "faq-categories",
    category: "faq",
    name: "FAQ par catégories",
    description: "FAQ organisée en onglets",
    icon: HelpCircle,
    preview: "/placeholder.svg",
    settings: {
      style: "tabs",
      categories: ["Général", "Technique", "Paiement"],
    },
    defaultContent: {
      title: "Centre d'aide",
    },
  },
  
  // Map Sections
  {
    id: "map-fullwidth",
    category: "map",
    name: "Carte pleine largeur",
    description: "Carte interactive grande",
    icon: MapPin,
    preview: "/placeholder.svg",
    settings: {
      height: "400px",
      showMarkers: true,
    },
    defaultContent: {
      title: "Notre localisation",
    },
  },
  
  // Pricing Sections
  {
    id: "pricing-cards",
    category: "pricing",
    name: "Cartes de prix",
    description: "3 offres en cartes",
    icon: Target,
    preview: "/placeholder.svg",
    settings: {
      columns: 3,
      highlightMiddle: true,
    },
    defaultContent: {
      title: "Nos offres",
      plans: [],
    },
  },
];

// Categories for organization
export const templateCategories = [
  { id: "all", label: "Tous", icon: Layout },
  { id: "hero", label: "Hero", icon: Layout },
  { id: "features", label: "Fonctionnalités", icon: Zap },
  { id: "testimonials", label: "Témoignages", icon: MessageSquare },
  { id: "cta", label: "Call to Action", icon: Megaphone },
  { id: "stats", label: "Statistiques", icon: BarChart3 },
  { id: "team", label: "Équipe", icon: Users },
  { id: "gallery", label: "Galerie", icon: Image },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "map", label: "Carte", icon: MapPin },
  { id: "pricing", label: "Tarifs", icon: Target },
];

interface SectionTemplatesProps {
  onSelectTemplate: (template: typeof sectionTemplates[0]) => void;
  selectedPageId?: string;
}

const SectionTemplates = ({ onSelectTemplate, selectedPageId }: SectionTemplatesProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<typeof sectionTemplates[0] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = sectionTemplates.filter(template => {
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyTemplate = (template: typeof sectionTemplates[0]) => {
    navigator.clipboard.writeText(JSON.stringify(template.defaultContent, null, 2));
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Contenu copié !");
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un template..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {templateCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 mr-1" />
                {cat.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card 
              key={template.id} 
              className="group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            >
              {/* Preview Image */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-muted-foreground/50" />
                </div>
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Utiliser
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {templateCategories.find(c => c.id === template.category)?.label}
                  </Badge>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCopyTemplate(template)}
                  >
                    {copiedId === template.id ? (
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copier
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun template trouvé</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.icon && <previewTemplate.icon className="w-5 h-5" />}
              {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview Area */}
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                {previewTemplate?.icon && <previewTemplate.icon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />}
                <p className="text-lg font-medium">{previewTemplate?.name}</p>
                <p className="text-sm text-muted-foreground">{previewTemplate?.description}</p>
              </div>
            </div>

            {/* Settings Preview */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Paramètres disponibles</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex flex-wrap gap-2">
                  {previewTemplate?.settings && Object.entries(previewTemplate.settings).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Default Content Preview */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Contenu par défaut</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">
                  {JSON.stringify(previewTemplate?.defaultContent, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Fermer
            </Button>
            <Button onClick={() => {
              if (previewTemplate) {
                onSelectTemplate(previewTemplate);
                setPreviewTemplate(null);
              }
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Utiliser ce template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionTemplates;
