import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Pencil, Trash2, GripVertical, Save, Copy,
  LayoutGrid, Image, Quote, List, Layers
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";

const blocTypes = [
  { value: "text", label: "Texte", icon: List },
  { value: "features", label: "Fonctionnalités", icon: LayoutGrid },
  { value: "gallery", label: "Galerie", icon: Image },
  { value: "quote", label: "Citation", icon: Quote },
  { value: "cards", label: "Cartes", icon: Layers },
  { value: "cta", label: "Appel à l'action", icon: LayoutGrid },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

interface Bloc {
  id: string;
  key: string;
  type: string;
  is_active: boolean;
  content_fr: string | null;
  content_en: string | null;
  content_ar: string | null;
  content_es: string | null;
  content_de: string | null;
  content_zh: string | null;
  created_at: string;
}

const AdminBlocs = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBloc, setEditingBloc] = useState<Bloc | null>(null);
  const [selectedLang, setSelectedLang] = useState("fr");
  const [formData, setFormData] = useState({
    key: "",
    type: "text",
    content_fr: "",
    content_en: "",
    content_ar: "",
    content_es: "",
    content_de: "",
    content_zh: "",
    is_active: true,
  });
  
  const queryClient = useQueryClient();

  const { data: blocs, isLoading } = useQuery({
    queryKey: ['admin-blocs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Bloc[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('site_content')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocs'] });
      toast.success("Bloc créé");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('site_content')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocs'] });
      toast.success("Bloc mis à jour");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocs'] });
      toast.success("Bloc supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('site_content')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocs'] });
      toast.success("Statut mis à jour");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (bloc: Bloc) => {
      const { id, created_at, ...rest } = bloc;
      const { error } = await supabase
        .from('site_content')
        .insert({ ...rest, key: `${rest.key}_copy` });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blocs'] });
      toast.success("Bloc dupliqué");
    },
    onError: () => toast.error("Erreur lors de la duplication"),
  });

  const resetForm = () => {
    setFormData({
      key: "",
      type: "text",
      content_fr: "",
      content_en: "",
      content_ar: "",
      content_es: "",
      content_de: "",
      content_zh: "",
      is_active: true,
    });
    setEditingBloc(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (bloc: Bloc) => {
    setEditingBloc(bloc);
    setFormData({
      key: bloc.key,
      type: bloc.type,
      content_fr: bloc.content_fr || "",
      content_en: bloc.content_en || "",
      content_ar: bloc.content_ar || "",
      content_es: bloc.content_es || "",
      content_de: bloc.content_de || "",
      content_zh: bloc.content_zh || "",
      is_active: bloc.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.key) {
      toast.error("La clé est requise");
      return;
    }

    const data = {
      key: formData.key,
      type: formData.type,
      content_fr: formData.content_fr || null,
      content_en: formData.content_en || null,
      content_ar: formData.content_ar || null,
      content_es: formData.content_es || null,
      content_de: formData.content_de || null,
      content_zh: formData.content_zh || null,
      is_active: formData.is_active,
    };

    if (editingBloc) {
      updateMutation.mutate({ id: editingBloc.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getBlocIcon = (type: string) => {
    const blocType = blocTypes.find(t => t.value === type);
    const IconComponent = blocType?.icon || List;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <AdminLayout title="Gestion des Blocs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            Gérez les blocs de contenu réutilisables du site
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau bloc
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocs?.map((bloc) => (
              <Card key={bloc.id} className="relative group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getBlocIcon(bloc.type)}
                      <CardTitle className="text-base truncate">{bloc.key}</CardTitle>
                    </div>
                    <Switch
                      checked={bloc.is_active}
                      onCheckedChange={(checked) => 
                        toggleMutation.mutate({ id: bloc.id, is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-3">
                    {blocTypes.find(t => t.value === bloc.type)?.label || bloc.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {bloc.content_fr?.replace(/<[^>]*>/g, '').substring(0, 100) || "Aucun contenu"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(bloc)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateMutation.mutate(bloc)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Supprimer ce bloc ?")) {
                          deleteMutation.mutate(bloc.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {blocs?.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun bloc créé</p>
                  <p className="text-sm mt-2">
                    Créez des blocs de contenu réutilisables pour enrichir vos pages
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBloc ? "Modifier le bloc" : "Nouveau bloc"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé unique *</label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="Ex: hero_title, feature_card_1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Utilisez des underscores, sans espaces ni caractères spéciaux
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blocTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu multilingue</label>
                <Tabs value={selectedLang} onValueChange={setSelectedLang}>
                  <TabsList className="flex flex-wrap h-auto">
                    {languages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code} className="gap-1">
                        <span>{lang.flag}</span>
                        <span className="hidden sm:inline">{lang.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {languages.map((lang) => (
                    <TabsContent key={lang.code} value={lang.code}>
                      <WYSIWYGEditor
                        content={(formData as any)[`content_${lang.code}`] || ""}
                        onChange={(content) => setFormData({ 
                          ...formData, 
                          [`content_${lang.code}`]: content 
                        })}
                        placeholder={`Contenu en ${lang.name}...`}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <label className="text-sm">Bloc actif</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  <Save className="w-4 h-4" />
                  {editingBloc ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBlocs;
