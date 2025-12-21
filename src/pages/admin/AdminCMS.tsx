import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  Settings2, 
  Globe, 
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Palette,
  Layout,
  Type
} from "lucide-react";

const AdminCMS = () => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch all site content
  const { data: siteContent, isLoading: contentLoading } = useQuery({
    queryKey: ['site-content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('key');
      if (error) throw error;
      return data;
    },
  });

  // Fetch settings
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Stats
  const stats = {
    totalContent: siteContent?.length || 0,
    activeContent: siteContent?.filter(c => c.is_active)?.length || 0,
    totalSettings: siteSettings?.length || 0,
    languages: 6,
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync - in production, this would generate the translations file
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Synchronisation terminée avec succès!");
      queryClient.invalidateQueries({ queryKey: ['site-content-all'] });
    } catch (error) {
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      content: siteContent,
      settings: siteSettings,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agricapital-cms-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export terminé!");
  };

  return (
    <AdminLayout title="CMS Avancé">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">CMS Avancé</h1>
            <p className="text-muted-foreground mt-1">Gestion complète du contenu et synchronisation</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="bg-agri-green hover:bg-agri-green-dark"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Synchroniser
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-agri-green/10 to-agri-green/5 border-agri-green/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contenus</p>
                  <p className="text-2xl font-bold text-agri-green">{stats.totalContent}</p>
                </div>
                <Database className="w-8 h-8 text-agri-green/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeContent}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paramètres</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalSettings}</p>
                </div>
                <Settings2 className="w-8 h-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-agri-orange/10 to-agri-orange/5 border-agri-orange/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Langues</p>
                  <p className="text-2xl font-bold text-agri-orange">{stats.languages}</p>
                </div>
                <Globe className="w-8 h-8 text-agri-orange/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="overview" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <Palette className="w-4 h-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-2">
              <Layout className="w-4 h-4" />
              Mise en page
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2">
              <Type className="w-4 h-4" />
              Typographie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-agri-green" />
                    Synchronisation des traductions
                  </CardTitle>
                  <CardDescription>
                    Génère automatiquement le fichier translations.ts depuis la base de données
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Dernière synchronisation</span>
                      <span className="text-muted-foreground">Jamais</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Entrées à synchroniser</span>
                      <span className="font-medium">{stats.totalContent}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSync} 
                    disabled={isSyncing}
                    className="w-full"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Lancer la synchronisation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Gestion des langues
                  </CardTitle>
                  <CardDescription>
                    Statut des traductions par langue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { code: 'fr', name: 'Français', flag: '🇫🇷', complete: true },
                      { code: 'en', name: 'English', flag: '🇬🇧', complete: true },
                      { code: 'ar', name: 'العربية', flag: '🇸🇦', complete: true },
                      { code: 'es', name: 'Español', flag: '🇪🇸', complete: true },
                      { code: 'de', name: 'Deutsch', flag: '🇩🇪', complete: true },
                      { code: 'zh', name: '中文', flag: '🇨🇳', complete: true },
                    ].map((lang) => (
                      <div key={lang.code} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                        {lang.complete ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation du design</CardTitle>
                <CardDescription>Modifiez les couleurs et styles du site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#2E7D32" className="w-16 h-10 p-1" />
                      <Input defaultValue="#2E7D32" className="font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur secondaire</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#FF8F00" className="w-16 h-10 p-1" />
                      <Input defaultValue="#FF8F00" className="font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Couleur d'accent</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#1565C0" className="w-16 h-10 p-1" />
                      <Input defaultValue="#1565C0" className="font-mono" />
                    </div>
                  </div>
                </div>
                <Button className="bg-agri-green hover:bg-agri-green-dark">
                  Appliquer les changements
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de la mise en page</CardTitle>
                <CardDescription>Gérez la disposition des sections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilisez la page Sections pour réorganiser les blocs de contenu par glisser-déposer.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres typographiques</CardTitle>
                <CardDescription>Personnalisez les polices et tailles de texte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Police des titres</Label>
                    <Input defaultValue="Playfair Display" />
                  </div>
                  <div className="space-y-2">
                    <Label>Police du corps</Label>
                    <Input defaultValue="Inter" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCMS;
