import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SitePage {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  title_ar: string | null;
  title_es: string | null;
  title_de: string | null;
  title_zh: string | null;
  description_fr: string | null;
  description_en: string | null;
  meta_title_fr: string | null;
  meta_title_en: string | null;
  meta_description_fr: string | null;
  meta_description_en: string | null;
  is_active: boolean;
  is_home: boolean;
  order_index: number;
}

const defaultPage: Partial<SitePage> = {
  slug: "",
  title_fr: "",
  title_en: "",
  title_ar: "",
  title_es: "",
  title_de: "",
  title_zh: "",
  description_fr: "",
  description_en: "",
  meta_title_fr: "",
  meta_title_en: "",
  meta_description_fr: "",
  meta_description_en: "",
  is_active: true,
  is_home: false,
  order_index: 0,
};

const AdminPages = () => {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<SitePage> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .order('order_index');
    
    if (error) {
      toast.error("Erreur lors du chargement des pages");
      console.error(error);
    } else {
      setPages(data || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!editingPage?.slug || !editingPage?.title_fr) {
      toast.error("Le slug et le titre sont requis");
      return;
    }

    setIsSaving(true);
    
    if (editingPage.id) {
      const { error } = await supabase
        .from('site_pages')
        .update({
          slug: editingPage.slug,
          title_fr: editingPage.title_fr,
          title_en: editingPage.title_en,
          title_ar: editingPage.title_ar,
          title_es: editingPage.title_es,
          title_de: editingPage.title_de,
          title_zh: editingPage.title_zh,
          description_fr: editingPage.description_fr,
          description_en: editingPage.description_en,
          meta_title_fr: editingPage.meta_title_fr,
          meta_title_en: editingPage.meta_title_en,
          meta_description_fr: editingPage.meta_description_fr,
          meta_description_en: editingPage.meta_description_en,
          is_active: editingPage.is_active,
          is_home: editingPage.is_home,
        })
        .eq('id', editingPage.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        console.error(error);
      } else {
        toast.success("Page mise à jour");
        fetchPages();
      }
    } else {
      const { error } = await supabase
        .from('site_pages')
        .insert({
          slug: editingPage.slug,
          title_fr: editingPage.title_fr,
          title_en: editingPage.title_en,
          title_ar: editingPage.title_ar,
          title_es: editingPage.title_es,
          title_de: editingPage.title_de,
          title_zh: editingPage.title_zh,
          description_fr: editingPage.description_fr,
          description_en: editingPage.description_en,
          meta_title_fr: editingPage.meta_title_fr,
          meta_title_en: editingPage.meta_title_en,
          meta_description_fr: editingPage.meta_description_fr,
          meta_description_en: editingPage.meta_description_en,
          is_active: editingPage.is_active,
          is_home: editingPage.is_home,
          order_index: pages.length,
        });

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("Page créée");
        fetchPages();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    setEditingPage(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette page ?")) return;

    const { error } = await supabase
      .from('site_pages')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success("Page supprimée");
      fetchPages();
    }
  };

  const toggleActive = async (page: SitePage) => {
    const { error } = await supabase
      .from('site_pages')
      .update({ is_active: !page.is_active })
      .eq('id', page.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      fetchPages();
    }
  };

  const openEditDialog = (page?: SitePage) => {
    setEditingPage(page ? { ...page } : { ...defaultPage });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout title="Gestion des Pages">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-muted-foreground">Créez, modifiez et gérez les pages de votre site</p>
          </div>
          <Button onClick={() => openEditDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle page
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Aucune page créée</p>
              <Button onClick={() => openEditDialog()}>Créer votre première page</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab hidden sm:block" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{page.title_fr}</h3>
                          {page.is_home && (
                            <Badge variant="secondary">Accueil</Badge>
                          )}
                          <Badge variant={page.is_active ? "default" : "outline"}>
                            {page.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(page)}
                        title={page.is_active ? "Désactiver" : "Activer"}
                      >
                        {page.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(page)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(page.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage?.id ? "Modifier la page" : "Nouvelle page"}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="translations">Traductions</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={editingPage?.slug || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="ma-nouvelle-page"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      L'URL sera: agricapital.ci/{editingPage?.slug || "slug"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="title_fr">Titre (Français)</Label>
                    <Input
                      id="title_fr"
                      value={editingPage?.title_fr || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, title_fr: e.target.value }))}
                      placeholder="Titre de la page"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description_fr">Description (Français)</Label>
                    <Textarea
                      id="description_fr"
                      value={editingPage?.description_fr || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, description_fr: e.target.value }))}
                      placeholder="Description de la page"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Page active</Label>
                      <p className="text-sm text-muted-foreground">Afficher cette page sur le site</p>
                    </div>
                    <Switch
                      checked={editingPage?.is_active || false}
                      onCheckedChange={(checked) => setEditingPage(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Page d'accueil</Label>
                      <p className="text-sm text-muted-foreground">Définir comme page principale</p>
                    </div>
                    <Switch
                      checked={editingPage?.is_home || false}
                      onCheckedChange={(checked) => setEditingPage(prev => ({ ...prev, is_home: checked }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="translations" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  {[
                    { code: "en", name: "Anglais", flag: "🇬🇧" },
                    { code: "ar", name: "Arabe", flag: "🇸🇦" },
                    { code: "es", name: "Espagnol", flag: "🇪🇸" },
                    { code: "de", name: "Allemand", flag: "🇩🇪" },
                    { code: "zh", name: "Chinois", flag: "🇨🇳" },
                  ].map((lang) => (
                    <div key={lang.code}>
                      <Label>{lang.flag} Titre ({lang.name})</Label>
                      <Input
                        value={(editingPage as any)?.[`title_${lang.code}`] || ""}
                        onChange={(e) => setEditingPage(prev => ({ ...prev, [`title_${lang.code}`]: e.target.value }))}
                        placeholder={`Titre en ${lang.name}`}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div>
                    <Label>Meta Title (FR)</Label>
                    <Input
                      value={editingPage?.meta_title_fr || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, meta_title_fr: e.target.value }))}
                      placeholder="Titre SEO"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 60 caractères</p>
                  </div>

                  <div>
                    <Label>Meta Description (FR)</Label>
                    <Textarea
                      value={editingPage?.meta_description_fr || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, meta_description_fr: e.target.value }))}
                      placeholder="Description SEO"
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 160 caractères</p>
                  </div>

                  <div>
                    <Label>Meta Title (EN)</Label>
                    <Input
                      value={editingPage?.meta_title_en || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, meta_title_en: e.target.value }))}
                      placeholder="SEO Title"
                    />
                  </div>

                  <div>
                    <Label>Meta Description (EN)</Label>
                    <Textarea
                      value={editingPage?.meta_description_en || ""}
                      onChange={(e) => setEditingPage(prev => ({ ...prev, meta_description_en: e.target.value }))}
                      placeholder="SEO Description"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingPage?.id ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPages;