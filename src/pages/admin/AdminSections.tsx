import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Pencil, Trash2, GripVertical, Save, Layout
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const sectionTypes = [
  { value: "hero", label: "Bannière Hero" },
  { value: "content", label: "Contenu Texte" },
  { value: "features", label: "Fonctionnalités" },
  { value: "gallery", label: "Galerie" },
  { value: "testimonials", label: "Témoignages" },
  { value: "contact", label: "Contact" },
  { value: "cta", label: "Appel à l'action" },
  { value: "custom", label: "Personnalisé" },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

interface Section {
  id: string;
  name: string;
  type: string;
  page_id: string | null;
  order_index: number;
  is_active: boolean;
  content_fr: string | null;
  content_en: string | null;
  content_ar: string | null;
  content_es: string | null;
  content_de: string | null;
  content_zh: string | null;
  settings: any;
  created_at: string;
}

interface SortableSectionItemProps {
  section: Section;
  pages: any[] | undefined;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, is_active: boolean) => void;
}

const SortableSectionItem = ({ section, pages, onEdit, onDelete, onToggle }: SortableSectionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/50 border-b border-border last:border-0 ${isDragging ? 'bg-muted shadow-lg rounded-lg' : ''}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{section.name}</p>
            <Badge variant="outline" className="text-xs">
              {sectionTypes.find(t => t.value === section.type)?.label || section.type}
            </Badge>
            <Badge variant={section.is_active ? "default" : "secondary"} className="text-xs">
              {section.is_active ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {pages?.find(p => p.id === section.page_id)?.title_fr || "Globale"} • Ordre: {section.order_index}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <Switch
          checked={section.is_active}
          onCheckedChange={(checked) => onToggle(section.id, checked)}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(section)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (confirm("Supprimer cette section ?")) {
              onDelete(section.id);
            }
          }}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

const AdminSections = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedLang, setSelectedLang] = useState("fr");
  const [formData, setFormData] = useState({
    name: "",
    type: "content",
    page_id: "",
    content_fr: "",
    content_en: "",
    content_ar: "",
    content_es: "",
    content_de: "",
    content_zh: "",
    is_active: true,
  });
  
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as Section[];
    },
  });

  const { data: pages } = useQuery({
    queryKey: ['admin-pages-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_pages')
        .select('id, title_fr, slug')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const maxOrder = sections?.reduce((max, s) => Math.max(max, s.order_index), -1) ?? -1;
      const { error } = await supabase
        .from('site_sections')
        .insert({
          ...data,
          order_index: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      toast.success("Section créée");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('site_sections')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      toast.success("Section mise à jour");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_sections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      toast.success("Section supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('site_sections')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      toast.success("Statut mis à jour");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('site_sections')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] });
      toast.success("Ordre mis à jour");
    },
    onError: () => toast.error("Erreur lors de la réorganisation"),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && sections) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      const updates = newSections.map((section, index) => ({
        id: section.id,
        order_index: index,
      }));

      reorderMutation.mutate(updates);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "content",
      page_id: "",
      content_fr: "",
      content_en: "",
      content_ar: "",
      content_es: "",
      content_de: "",
      content_zh: "",
      is_active: true,
    });
    setEditingSection(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      type: section.type,
      page_id: section.page_id || "",
      content_fr: section.content_fr || "",
      content_en: section.content_en || "",
      content_ar: section.content_ar || "",
      content_es: section.content_es || "",
      content_de: section.content_de || "",
      content_zh: section.content_zh || "",
      is_active: section.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Le nom est requis");
      return;
    }

    const data = {
      name: formData.name,
      type: formData.type,
      page_id: formData.page_id || null,
      content_fr: formData.content_fr || null,
      content_en: formData.content_en || null,
      content_ar: formData.content_ar || null,
      content_es: formData.content_es || null,
      content_de: formData.content_de || null,
      content_zh: formData.content_zh || null,
      is_active: formData.is_active,
    };

    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AdminLayout title="Gestion des Sections">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-muted-foreground">
              Gérez les sections de contenu du site
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Glissez-déposez pour réorganiser l'ordre des sections
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle section
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {sections && sections.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        pages={pages}
                        onEdit={handleEdit}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onToggle={(id, is_active) => toggleMutation.mutate({ id, is_active })}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune section créée</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? "Modifier la section" : "Nouvelle section"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de la section *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bannière principale"
                  />
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
                      {sectionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Page associée</label>
                <Select
                  value={formData.page_id}
                  onValueChange={(value) => setFormData({ ...formData, page_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Section globale (toutes les pages)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Globale</SelectItem>
                    {pages?.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title_fr} (/{page.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <label className="text-sm">Section active</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  <Save className="w-4 h-4" />
                  {editingSection ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSections;
