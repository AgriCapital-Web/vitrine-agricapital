import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Image, Palette, Type, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Setting {
  id: string;
  key: string;
  value: string | null;
  type: string;
  category: string;
  description: string | null;
}

const AdminBranding = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) {
      toast.error("Erreur lors du chargement");
      console.error(error);
    } else {
      setSettings(data || []);
      const initial: Record<string, string> = {};
      data?.forEach(s => {
        initial[s.key] = s.value || "";
      });
      setEditedSettings(initial);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const updates = Object.entries(editedSettings).map(([key, value]) => ({
      key,
      value,
    }));

    for (const update of updates) {
      await supabase
        .from('site_settings')
        .update({ value: update.value })
        .eq('key', update.key);
    }

    toast.success("Paramètres enregistrés");
    setIsSaving(false);
    fetchSettings();
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  const renderSettingInput = (setting: Setting) => {
    const value = editedSettings[setting.key] || "";

    if (setting.type === "color") {
      return (
        <div className="flex gap-2">
          <Input
            type="color"
            value={value}
            onChange={(e) => setEditedSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
            className="w-16 h-10 p-1"
          />
          <Input
            value={value}
            onChange={(e) => setEditedSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
            placeholder="#000000"
          />
        </div>
      );
    }

    if (setting.type === "image") {
      return (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => setEditedSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
            placeholder="URL de l'image"
          />
          {value && (
            <div className="w-20 h-20 rounded border bg-muted overflow-hidden">
              <img src={value} alt="" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => setEditedSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
        placeholder={setting.description || ""}
      />
    );
  };

  if (isLoading) {
    return (
      <AdminLayout title="Design & Branding">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Design & Branding">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Personnalisez l'apparence de votre site</p>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="branding" className="gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Couleurs</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Réseaux</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Identité Visuelle
                </CardTitle>
                <CardDescription>Logo, favicon et images de partage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory("branding").map((setting) => (
                  <div key={setting.id}>
                    <Label>{setting.description}</Label>
                    {renderSettingInput(setting)}
                  </div>
                ))}
                {getSettingsByCategory("seo").map((setting) => (
                  <div key={setting.id}>
                    <Label>{setting.description}</Label>
                    {renderSettingInput(setting)}
                  </div>
                ))}
                {getSettingsByCategory("general").filter(s => s.key === "site_name").map((setting) => (
                  <div key={setting.id}>
                    <Label>{setting.description}</Label>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Slogans multilingues</CardTitle>
                <CardDescription>Le slogan affiché selon la langue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory("general").filter(s => s.key.startsWith("site_slogan")).map((setting) => {
                  const lang = setting.key.split("_").pop()?.toUpperCase();
                  return (
                    <div key={setting.id}>
                      <Label>Slogan ({lang})</Label>
                      {renderSettingInput(setting)}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Palette de Couleurs
                </CardTitle>
                <CardDescription>Personnalisez les couleurs principales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory("design").map((setting) => (
                  <div key={setting.id}>
                    <Label>{setting.description}</Label>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de Contact</CardTitle>
                <CardDescription>Email, téléphone et adresse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory("contact").map((setting) => (
                  <div key={setting.id}>
                    <Label>{setting.description}</Label>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Réseaux Sociaux</CardTitle>
                <CardDescription>Liens vers vos pages sociales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory("social").map((setting) => (
                  <div key={setting.id}>
                    <Label>{setting.description}</Label>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminBranding;