import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Pencil, Trash2, Save, Search, Globe, 
  Languages, FileText, Filter
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

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

const contentTypes = [
  { value: "text", label: "Texte" },
  { value: "title", label: "Titre" },
  { value: "button", label: "Bouton" },
  { value: "label", label: "Label" },
  { value: "placeholder", label: "Placeholder" },
  { value: "message", label: "Message" },
];

interface Translation {
  id: string;
  key: string;
  type: string;
  content_fr: string | null;
  content_en: string | null;
  content_ar: string | null;
  content_es: string | null;
  content_de: string | null;
  content_zh: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminTranslations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [selectedLang, setSelectedLang] = useState("fr");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
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

  const { data: translations, isLoading } = useQuery({
    queryKey: ['admin-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('key', { ascending: true });
      if (error) throw error;
      return data as Translation[];
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
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
      toast.success("Traduction créée");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message || "Erreur lors de la création"),
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
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
      toast.success("Traduction mise à jour");
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
      queryClient.invalidateQueries({ queryKey: ['admin-translations'] });
      toast.success("Traduction supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
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
    setEditingTranslation(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      type: translation.type,
      content_fr: translation.content_fr || "",
      content_en: translation.content_en || "",
      content_ar: translation.content_ar || "",
      content_es: translation.content_es || "",
      content_de: translation.content_de || "",
      content_zh: translation.content_zh || "",
      is_active: translation.is_active,
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

    if (editingTranslation) {
      updateMutation.mutate({ id: editingTranslation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredTranslations = translations?.filter((t) => {
    const matchesSearch = 
      t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content_en?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const getContentPreview = (translation: Translation) => {
    return translation.content_fr || translation.content_en || "—";
  };

  return (
    <AdminLayout title="Langues & Traductions">
      <div className="space-y-6">
        {/* Language Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langues Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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

        {/* Translations Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Traductions du Site
              </CardTitle>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle traduction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par clé ou contenu..."
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTranslations?.map((translation) => (
                  <div 
                    key={translation.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {translation.key}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {contentTypes.find(t => t.value === translation.type)?.label || translation.type}
                        </Badge>
                        {!translation.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactif</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {getContentPreview(translation)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(translation)}
                        className="gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="hidden sm:inline">Modifier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Supprimer cette traduction ?")) {
                            deleteMutation.mutate(translation.id);
                          }
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredTranslations?.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune traduction trouvée</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTranslation ? "Modifier la traduction" : "Nouvelle traduction"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé unique *</label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="Ex: hero.title"
                    disabled={!!editingTranslation}
                  />
                  <p className="text-xs text-muted-foreground">
                    Utilisez des points pour organiser (ex: nav.home, hero.title)
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
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu par langue</label>
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
                      <Textarea
                        value={(formData as any)[`content_${lang.code}`] || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [`content_${lang.code}`]: e.target.value 
                        })}
                        placeholder={`Contenu en ${lang.name}...`}
                        className="min-h-[150px]"
                        dir={lang.code === "ar" ? "rtl" : "ltr"}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  <Save className="w-4 h-4" />
                  {editingTranslation ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTranslations;
