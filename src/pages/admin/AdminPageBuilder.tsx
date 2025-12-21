import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye,
  Globe,
  FileText,
  Home,
  Loader2,
  GripVertical,
  Settings,
  Search,
  ExternalLink
} from "lucide-react";
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

interface Page {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  title_ar: string | null;
  is_active: boolean;
  is_home: boolean;
  order_index: number;
  meta_title_fr: string | null;
  meta_description_fr: string | null;
}

const SortablePageItem = ({ page, onEdit, onDelete, onToggle }: { 
  page: Page; 
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={`${!page.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-secondary rounded">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {page.is_home && <Home className="w-4 h-4 text-agri-orange" />}
            <h3 className="font-semibold truncate">{page.title_fr}</h3>
          </div>
          <p className="text-sm text-muted-foreground">/{page.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          <Switch 
            checked={page.is_active}
            onCheckedChange={(checked) => onToggle(page.id, checked)}
          />
          <Button variant="ghost" size="icon" onClick={() => window.open(`/${page.slug}`, '_blank')}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(page)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          {!page.is_home && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(page.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminPageBuilder = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: pages, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_pages')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data as Page[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (page: { id?: string; slug: string; title_fr: string; title_en?: string; title_ar?: string; meta_title_fr?: string; meta_description_fr?: string; is_active?: boolean; is_home?: boolean; order_index?: number }) => {
      if (page.id) {
        const { error } = await supabase
          .from('site_pages')
          .update({
            slug: page.slug,
            title_fr: page.title_fr,
            title_en: page.title_en,
            title_ar: page.title_ar,
            meta_title_fr: page.meta_title_fr,
            meta_description_fr: page.meta_description_fr,
            is_active: page.is_active,
            is_home: page.is_home,
          })
          .eq('id', page.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_pages')
          .insert([{
            slug: page.slug,
            title_fr: page.title_fr,
            title_en: page.title_en,
            title_ar: page.title_ar,
            meta_title_fr: page.meta_title_fr,
            meta_description_fr: page.meta_description_fr,
            is_active: page.is_active ?? true,
            is_home: page.is_home ?? false,
            order_index: page.order_index ?? 0,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success("Page sauvegardée");
      setIsDialogOpen(false);
      setEditingPage(null);
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success("Page supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('site_pages')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase.from('site_pages').update({ order_index: index }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !pages) return;

    const oldIndex = pages.findIndex(p => p.id === active.id);
    const newIndex = pages.findIndex(p => p.id === over.id);
    const newOrder = arrayMove(pages, oldIndex, newIndex);
    
    reorderMutation.mutate(newOrder.map(p => p.id));
  };

  const filteredPages = pages?.filter(page => 
    page.title_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    slug: "",
    title_fr: "",
    title_en: "",
    title_ar: "",
    meta_title_fr: "",
    meta_description_fr: "",
    is_active: true,
    is_home: false,
  });

  const openDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        slug: page.slug,
        title_fr: page.title_fr,
        title_en: page.title_en || "",
        title_ar: page.title_ar || "",
        meta_title_fr: page.meta_title_fr || "",
        meta_description_fr: page.meta_description_fr || "",
        is_active: page.is_active,
        is_home: page.is_home,
      });
    } else {
      setEditingPage(null);
      setFormData({
        slug: "",
        title_fr: "",
        title_en: "",
        title_ar: "",
        meta_title_fr: "",
        meta_description_fr: "",
        is_active: true,
        is_home: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      ...formData,
      ...(editingPage ? { id: editingPage.id } : { order_index: (pages?.length || 0) }),
    };
    saveMutation.mutate(data);
  };

  return (
    <AdminLayout title="Constructeur de pages">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Constructeur de pages</h1>
            <p className="text-muted-foreground">Créez et gérez vos pages avec drag & drop</p>
          </div>
          <Button onClick={() => openDialog()} className="bg-agri-green hover:bg-agri-green-dark">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle page
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-agri-green" />
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredPages?.map(p => p.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {filteredPages?.map((page) => (
                  <SortablePageItem
                    key={page.id}
                    page={page}
                    onEdit={openDialog}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onToggle={(id, active) => toggleMutation.mutate({ id, is_active: active })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Modifier la page" : "Nouvelle page"}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="translations">Traductions</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="ma-page"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre (FR)</Label>
                  <Input 
                    value={formData.title_fr}
                    onChange={(e) => setFormData({...formData, title_fr: e.target.value})}
                    placeholder="Titre de la page"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Page active</Label>
                  <Switch 
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="translations" className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre (EN)</Label>
                  <Input 
                    value={formData.title_en}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                    placeholder="Page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre (AR)</Label>
                  <Input 
                    value={formData.title_ar}
                    onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                    placeholder="عنوان الصفحة"
                    dir="rtl"
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input 
                    value={formData.meta_title_fr}
                    onChange={(e) => setFormData({...formData, meta_title_fr: e.target.value})}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea 
                    value={formData.meta_description_fr}
                    onChange={(e) => setFormData({...formData, meta_description_fr: e.target.value})}
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending || !formData.slug || !formData.title_fr}
                className="bg-agri-green hover:bg-agri-green-dark"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPageBuilder;
