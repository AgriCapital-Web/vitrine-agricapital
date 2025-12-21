import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle, Search, FileText, Image, Link as LinkIcon } from "lucide-react";

const seoLanguages = [
  { code: "fr", name: "Français", flag: "🇫🇷", status: "active" },
  { code: "en", name: "English", flag: "🇬🇧", status: "active" },
  { code: "ar", name: "العربية", flag: "🇸🇦", status: "active" },
  { code: "es", name: "Español", flag: "🇪🇸", status: "active" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", status: "active" },
  { code: "zh", name: "中文", flag: "🇨🇳", status: "active" },
];

const seoChecklist = [
  { item: "Meta title multilingue", status: true, description: "Titres traduits dans toutes les langues" },
  { item: "Meta description multilingue", status: true, description: "Descriptions traduites et optimisées" },
  { item: "Keywords multilingues", status: true, description: "Mots-clés traduits pour chaque langue" },
  { item: "Open Graph tags", status: true, description: "Tags pour partage Facebook/LinkedIn" },
  { item: "Twitter Cards", status: true, description: "Tags pour partage Twitter optimisé" },
  { item: "Canonical URLs", status: true, description: "URLs canoniques par langue" },
  { item: "Schema.org (JSON-LD)", status: true, description: "Données structurées pour Google" },
  { item: "Sitemap XML", status: false, description: "À générer automatiquement" },
  { item: "Robots.txt", status: true, description: "Fichier de configuration crawlers" },
  { item: "Hreflang tags", status: false, description: "Liens alternatifs entre langues" },
];

const AdminSEO = () => {
  return (
    <AdminLayout title="SEO & Référencement">
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Langues Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">6</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">85%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pages Indexées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Image className="w-4 h-4" />
                Images Optimisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">100%</p>
            </CardContent>
          </Card>
        </div>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              SEO Multilingue
            </CardTitle>
            <CardDescription>
              Configuration SEO pour chaque langue supportée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seoLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-4 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">
                      Actif
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Meta title configuré</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Meta description configurée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Keywords configurés</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    URL: agricapital.ci/{lang.code === "fr" ? "" : lang.code}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Checklist SEO
            </CardTitle>
            <CardDescription>
              État de l'optimisation pour les moteurs de recherche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {seoChecklist.map((check, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {check.status ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{check.item}</p>
                      <p className="text-xs text-muted-foreground">{check.description}</p>
                    </div>
                  </div>
                  <Badge className={check.status ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"}>
                    {check.status ? "Complété" : "En attente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              URLs et Routes Configurées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Routes de Section (Français)</h4>
                <div className="flex flex-wrap gap-2">
                  {["/accueil", "/a-propos", "/notre-approche", "/impact", "/jalons", "/fondateur", "/partenariat", "/temoignages", "/contact"].map((route) => (
                    <Badge key={route} variant="outline">{route}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Routes de Section (Anglais)</h4>
                <div className="flex flex-wrap gap-2">
                  {["/home", "/about", "/approach", "/milestones", "/founder", "/partnership", "/testimonials"].map((route) => (
                    <Badge key={route} variant="outline">{route}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Routes de Langue</h4>
                <div className="flex flex-wrap gap-2">
                  {["/fr", "/en", "/ar", "/es", "/de", "/zh"].map((route) => (
                    <Badge key={route} variant="secondary">{route}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Routes Combinées (Langue + Section)</h4>
                <p className="text-sm text-muted-foreground">
                  Format: /:lang/:section (ex: /en/about, /ar/contact, /zh/partnership)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSEO;
