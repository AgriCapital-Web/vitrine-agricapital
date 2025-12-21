import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Layout, Info } from "lucide-react";

const sections = [
  { id: "hero", name: "Bannière d'accueil", description: "Titre principal et appel à l'action" },
  { id: "ambitions", name: "Nos Ambitions", description: "Section présentant les ambitions d'AgriCapital" },
  { id: "about", name: "À Propos", description: "Présentation de l'entreprise et sa mission" },
  { id: "approach", name: "Notre Approche", description: "Méthodologie et processus de travail" },
  { id: "impact", name: "Impact", description: "Chiffres clés et impact social" },
  { id: "milestones", name: "Jalons", description: "Historique et étapes importantes" },
  { id: "founder", name: "Fondateur", description: "Présentation d'Inocent KOFFI" },
  { id: "partnership", name: "Partenariat", description: "Types de partenariats proposés" },
  { id: "testimonials", name: "Témoignages", description: "Avis des partenaires et producteurs" },
  { id: "contact", name: "Contact", description: "Formulaire et informations de contact" },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

const AdminContent = () => {
  return (
    <AdminLayout title="Gestion du Contenu">
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Gestion du contenu multilingue</p>
              <p className="text-sm text-muted-foreground">
                Le contenu du site est géré via le fichier de traductions. Pour modifier le texte, 
                contactez le développeur ou accédez au code source via GitHub.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langues Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {languages.map((lang) => (
                <div key={lang.code} className="p-4 bg-muted rounded-lg text-center">
                  <span className="text-2xl">{lang.flag}</span>
                  <p className="font-medium mt-2">{lang.name}</p>
                  <p className="text-xs text-muted-foreground">/{lang.code}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Sections du Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">{section.name}</p>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Actif</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Routes Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Pages principales</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>/ - Accueil</li>
                  <li>/accueil - Accueil</li>
                  <li>/a-propos - À propos</li>
                  <li>/notre-approche - Notre approche</li>
                  <li>/impact - Impact</li>
                  <li>/partenariat - Partenariat</li>
                  <li>/temoignages - Témoignages</li>
                  <li>/contact - Contact</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Routes par langue</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>/fr - Français</li>
                  <li>/en - English</li>
                  <li>/ar - العربية</li>
                  <li>/es - Español</li>
                  <li>/de - Deutsch</li>
                  <li>/zh - 中文</li>
                  <li>/fr/impact - Impact (FR)</li>
                  <li>/en/about - About (EN)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
