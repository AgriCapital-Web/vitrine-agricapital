import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit2, Eye, EyeOff, GripVertical, Save, ChevronDown, ChevronRight,
  FileText, Layout, Layers, Image, Globe, Settings, ExternalLink, Home, Search,
  Loader2, Copy, MoreVertical, Pencil, RefreshCw
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sectionTypes = [
  { value: "hero", label: "Bannière Hero", icon: "🎯" },
  { value: "content", label: "Contenu Texte", icon: "📝" },
  { value: "features", label: "Fonctionnalités", icon: "⚡" },
  { value: "gallery", label: "Galerie", icon: "🖼️" },
  { value: "testimonials", label: "Témoignages", icon: "💬" },
  { value: "contact", label: "Contact", icon: "📧" },
  { value: "cta", label: "Appel à l'action", icon: "🔔" },
  { value: "custom", label: "Personnalisé", icon: "🔧" },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

// Sortable Section Item
const SortableSectionItem = ({ section, onEdit, onDelete, onToggle }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
      <button {...attributes} {...listeners} className="p-1 hover:bg-muted rounded cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">{sectionTypes.find(t => t.value === section.type)?.icon}</span>
          <span className="font-medium text-sm truncate">{section.name}</span>
          <Badge variant={section.is_active ? "default" : "secondary"} className="text-xs">
            {section.is_active ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Switch checked={section.is_active} onCheckedChange={(checked) => onToggle(section.id, checked)} />
        <Button variant="ghost" size="icon" onClick={() => onEdit(section)}><Edit2 className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(section.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </div>
    </div>
  );
};

const AdminSiteBuilder = () => {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [expandedPages, setExpandedPages] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Page form state
  const [pageForm, setPageForm] = useState({
    slug: "", title_fr: "", title_en: "", title_ar: "", title_es: "", title_de: "", title_zh: "",
    description_fr: "", description_en: "", meta_title_fr: "", meta_description_fr: "",
    is_active: true, is_home: false,
  });

  // Section form state
  const [sectionForm, setSectionForm] = useState({
    name: "", type: "content", page_id: "",
    content_fr: "", content_en: "", content_ar: "", content_es: "", content_de: "", content_zh: "",
    is_active: true,
  });

  // Fetch pages with their sections
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['site-builder-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_pages')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  // Fetch all sections
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['site-builder-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_sections')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  // Fetch media
  const { data: media } = useQuery({
    queryKey: ['site-builder-media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_media').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Page mutations
  const savePageMutation = useMutation({
    mutationFn: async (page: any) => {
      if (page.id) {
        const { error } = await supabase.from('site_pages').update(page).eq('id', page.id);
        if (error) throw error;
      } else {
        const maxOrder = pages?.reduce((max, p) => Math.max(max, p.order_index), -1) ?? -1;
        const { error } = await supabase.from('site_pages').insert({ ...page, order_index: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-builder-pages'] });
      toast.success(editingPage ? "Page mise à jour" : "Page créée");
      setIsPageDialogOpen(false);
      resetPageForm();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('site_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-builder-pages'] });
      toast.success("Page supprimée");
    },
  });

  const togglePageMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('site_pages').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-builder-pages'] }),
  });

  // Section mutations
  const saveSectionMutation = useMutation({
    mutationFn: async (section: any) => {
      if (section.id) {
        const { error } = await supabase.from('site_sections').update(section).eq('id', section.id);
        if (error) throw error;
      } else {
        const maxOrder = sections?.filter(s => s.page_id === section.page_id).reduce((max, s) => Math.max(max, s.order_index), -1) ?? -1;
        const { error } = await supabase.from('site_sections').insert({ ...section, order_index: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-builder-sections'] });
      toast.success(editingSection ? "Section mise à jour" : "Section créée");
      setIsSectionDialogOpen(false);
      resetSectionForm();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('site_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-builder-sections'] });
      toast.success("Section supprimée");
    },
  });

  const toggleSectionMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('site_sections').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-builder-sections'] }),
  });

  const reorderSectionsMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      for (const update of updates) {
        await supabase.from('site_sections').update({ order_index: update.order_index }).eq('id', update.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-builder-sections'] }),
  });

  const resetPageForm = () => {
    setPageForm({
      slug: "", title_fr: "", title_en: "", title_ar: "", title_es: "", title_de: "", title_zh: "",
      description_fr: "", description_en: "", meta_title_fr: "", meta_description_fr: "",
      is_active: true, is_home: false,
    });
    setEditingPage(null);
  };

  const resetSectionForm = () => {
    setSectionForm({
      name: "", type: "content", page_id: "",
      content_fr: "", content_en: "", content_ar: "", content_es: "", content_de: "", content_zh: "",
      is_active: true,
    });
    setEditingSection(null);
  };

  const openPageDialog = (page?: any) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        slug: page.slug || "", title_fr: page.title_fr || "", title_en: page.title_en || "",
        title_ar: page.title_ar || "", title_es: page.title_es || "", title_de: page.title_de || "",
        title_zh: page.title_zh || "", description_fr: page.description_fr || "",
        description_en: page.description_en || "", meta_title_fr: page.meta_title_fr || "",
        meta_description_fr: page.meta_description_fr || "", is_active: page.is_active, is_home: page.is_home,
      });
    } else {
      resetPageForm();
    }
    setIsPageDialogOpen(true);
  };

  const openSectionDialog = (section?: any, pageId?: string) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        name: section.name, type: section.type, page_id: section.page_id || "",
        content_fr: section.content_fr || "", content_en: section.content_en || "",
        content_ar: section.content_ar || "", content_es: section.content_es || "",
        content_de: section.content_de || "", content_zh: section.content_zh || "",
        is_active: section.is_active,
      });
    } else {
      resetSectionForm();
      if (pageId) setSectionForm(prev => ({ ...prev, page_id: pageId }));
    }
    setIsSectionDialogOpen(true);
  };

  const handleSavePage = () => {
    if (!pageForm.slug || !pageForm.title_fr) {
      toast.error("Slug et titre français requis");
      return;
    }
    savePageMutation.mutate({ ...pageForm, ...(editingPage ? { id: editingPage.id } : {}) });
  };

  const handleSaveSection = () => {
    if (!sectionForm.name) {
      toast.error("Nom requis");
      return;
    }
    saveSectionMutation.mutate({
      ...sectionForm,
      page_id: sectionForm.page_id || null,
      ...(editingSection ? { id: editingSection.id } : {}),
    });
  };

  const handleDragEnd = (event: DragEndEvent, pageId: string | null) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const pageSections = sections?.filter(s => s.page_id === pageId) || [];
    const oldIndex = pageSections.findIndex(s => s.id === active.id);
    const newIndex = pageSections.findIndex(s => s.id === over.id);
    const newOrder = arrayMove(pageSections, oldIndex, newIndex);
    
    reorderSectionsMutation.mutate(newOrder.map((s, i) => ({ id: s.id, order_index: i })));
  };

  const togglePageExpanded = (pageId: string) => {
    setExpandedPages(prev => 
      prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
    );
  };

  const filteredPages = pages?.filter(p => 
    p.title_fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPageSections = (pageId: string | null) => 
    sections?.filter(s => s.page_id === pageId).sort((a, b) => a.order_index - b.order_index) || [];

  const globalSections = getPageSections(null);

  return (
    <AdminLayout title="Constructeur de Site">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Constructeur de Site</h1>
            <p className="text-muted-foreground">Gérez toutes vos pages, sections et contenus</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openPageDialog()} className="bg-agri-green hover:bg-agri-green-dark">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle page
            </Button>
            <Button variant="outline" onClick={() => openSectionDialog()}>
              <Layers className="w-4 h-4 mr-2" />
              Nouvelle section
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-agri-green/10 to-agri-green/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="text-2xl font-bold text-agri-green">{pages?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-agri-green/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sections</p>
                  <p className="text-2xl font-bold text-blue-600">{sections?.length || 0}</p>
                </div>
                <Layers className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Médias</p>
                  <p className="text-2xl font-bold text-purple-600">{media?.length || 0}</p>
                </div>
                <Image className="w-8 h-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-agri-orange/10 to-agri-orange/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Langues</p>
                  <p className="text-2xl font-bold text-agri-orange">6</p>
                </div>
                <Globe className="w-8 h-8 text-agri-orange/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pages List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Pages du site
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pagesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : (
                  <ScrollArea className="max-h-[600px]">
                    <div className="divide-y">
                      {filteredPages?.map((page) => {
                        const pageSections = getPageSections(page.id);
                        const isExpanded = expandedPages.includes(page.id);

                        return (
                          <Collapsible key={page.id} open={isExpanded} onOpenChange={() => togglePageExpanded(page.id)}>
                            <div className={`p-4 ${!page.is_active ? 'opacity-60' : ''}`}>
                              <div className="flex items-center gap-3">
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </Button>
                                </CollapsibleTrigger>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {page.is_home && <Home className="w-4 h-4 text-agri-orange" />}
                                    <span className="font-semibold truncate">{page.title_fr}</span>
                                    <Badge variant={page.is_active ? "default" : "secondary"} className="text-xs">
                                      {page.is_active ? "Actif" : "Inactif"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">/{page.slug} • {pageSections.length} section(s)</p>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Switch
                                    checked={page.is_active}
                                    onCheckedChange={(checked) => togglePageMutation.mutate({ id: page.id, is_active: checked })}
                                  />
                                  <Button variant="ghost" size="icon" onClick={() => window.open(`/${page.slug}`, '_blank')}>
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openPageDialog(page)}>
                                        <Pencil className="w-4 h-4 mr-2" /> Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openSectionDialog(undefined, page.id)}>
                                        <Plus className="w-4 h-4 mr-2" /> Ajouter section
                                      </DropdownMenuItem>
                                      {!page.is_home && (
                                        <DropdownMenuItem 
                                          className="text-destructive" 
                                          onClick={() => {
                                            if (confirm("Supprimer cette page ?")) deletePageMutation.mutate(page.id);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            <CollapsibleContent>
                              <div className="px-4 pb-4 pl-16 space-y-2">
                                {pageSections.length > 0 ? (
                                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, page.id)}>
                                    <SortableContext items={pageSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                      {pageSections.map(section => (
                                        <SortableSectionItem
                                          key={section.id}
                                          section={section}
                                          onEdit={openSectionDialog}
                                          onDelete={(id) => { if (confirm("Supprimer?")) deleteSectionMutation.mutate(id); }}
                                          onToggle={(id, active) => toggleSectionMutation.mutate({ id, is_active: active })}
                                        />
                                      ))}
                                    </SortableContext>
                                  </DndContext>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">Aucune section</p>
                                )}
                                <Button variant="outline" size="sm" onClick={() => openSectionDialog(undefined, page.id)}>
                                  <Plus className="w-3 h-3 mr-1" /> Ajouter section
                                </Button>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Global Sections */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sections globales
                </CardTitle>
                <CardDescription>Visibles sur toutes les pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {globalSections.length > 0 ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, null)}>
                    <SortableContext items={globalSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {globalSections.map(section => (
                        <SortableSectionItem
                          key={section.id}
                          section={section}
                          onEdit={openSectionDialog}
                          onDelete={(id) => { if (confirm("Supprimer?")) deleteSectionMutation.mutate(id); }}
                          onToggle={(id, active) => toggleSectionMutation.mutate({ id, is_active: active })}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">Aucune section globale</p>
                )}
                <Button variant="outline" className="w-full" onClick={() => openSectionDialog()}>
                  <Plus className="w-4 h-4 mr-2" /> Section globale
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/', '_blank')}>
                  <Eye className="w-4 h-4 mr-2" /> Voir le site
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => queryClient.invalidateQueries()}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Page Dialog */}
        <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Slug (URL) *</Label>
                    <Input value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} placeholder="ma-page" />
                  </div>
                  <div className="space-y-2">
                    <Label>Titre FR *</Label>
                    <Input value={pageForm.title_fr} onChange={(e) => setPageForm({ ...pageForm, title_fr: e.target.value })} placeholder="Titre de la page" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description FR</Label>
                  <Textarea value={pageForm.description_fr} onChange={(e) => setPageForm({ ...pageForm, description_fr: e.target.value })} rows={3} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Page active</Label>
                  <Switch checked={pageForm.is_active} onCheckedChange={(checked) => setPageForm({ ...pageForm, is_active: checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Page d'accueil</Label>
                  <Switch checked={pageForm.is_home} onCheckedChange={(checked) => setPageForm({ ...pageForm, is_home: checked })} />
                </div>
              </TabsContent>

              <TabsContent value="translations" className="space-y-4">
                {languages.filter(l => l.code !== 'fr').map(lang => (
                  <div key={lang.code} className="space-y-2">
                    <Label>{lang.flag} Titre ({lang.name})</Label>
                    <Input
                      value={(pageForm as any)[`title_${lang.code}`] || ""}
                      onChange={(e) => setPageForm({ ...pageForm, [`title_${lang.code}`]: e.target.value })}
                      dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input value={pageForm.meta_title_fr} onChange={(e) => setPageForm({ ...pageForm, meta_title_fr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea value={pageForm.meta_description_fr} onChange={(e) => setPageForm({ ...pageForm, meta_description_fr: e.target.value })} rows={3} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSavePage} disabled={savePageMutation.isPending} className="bg-agri-green hover:bg-agri-green-dark">
                {savePageMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Section Dialog */}
        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSection ? "Modifier la section" : "Nouvelle section"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} placeholder="Nom de la section" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={sectionForm.type} onValueChange={(v) => setSectionForm({ ...sectionForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sectionTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Page associée</Label>
                  <Select value={sectionForm.page_id} onValueChange={(v) => setSectionForm({ ...sectionForm, page_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Globale (toutes)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Globale</SelectItem>
                      {pages?.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title_fr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contenu multilingue</Label>
                <Tabs value={selectedLang} onValueChange={setSelectedLang}>
                  <TabsList className="flex-wrap h-auto">
                    {languages.map(lang => (
                      <TabsTrigger key={lang.code} value={lang.code} className="gap-1">
                        {lang.flag} {lang.code.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {languages.map(lang => (
                    <TabsContent key={lang.code} value={lang.code}>
                      <WYSIWYGEditor
                        content={(sectionForm as any)[`content_${lang.code}`] || ""}
                        onChange={(v) => setSectionForm({ ...sectionForm, [`content_${lang.code}`]: v })}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="flex items-center justify-between">
                <Label>Section active</Label>
                <Switch checked={sectionForm.is_active} onCheckedChange={(checked) => setSectionForm({ ...sectionForm, is_active: checked })} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSaveSection} disabled={saveSectionMutation.isPending} className="bg-agri-green hover:bg-agri-green-dark">
                {saveSectionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSiteBuilder;
