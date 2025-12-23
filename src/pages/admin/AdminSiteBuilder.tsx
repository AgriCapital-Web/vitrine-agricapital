import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit2, Eye, EyeOff, GripVertical, Save, ChevronDown, ChevronRight,
  FileText, Layout, Layers, Image, Globe, Settings, ExternalLink, Home, Search,
  Loader2, Copy, MoreVertical, Pencil, RefreshCw, Menu, ImageIcon, BarChart3,
  Table, FormInput, Link2, Code, Palette, Languages, Megaphone, Database, Smartphone,
  Monitor, Tablet, Upload, Download, History, Undo, Redo, Check, X, Play, Pause,
  FolderOpen, File, Folder, Grid3X3, List, ChevronUp, PanelLeft, PanelRight
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Types
interface Page {
  id: string;
  slug: string;
  title_fr: string;
  title_en?: string;
  is_active: boolean;
  is_home: boolean;
  order_index: number;
  updated_at: string;
}

interface Section {
  id: string;
  name: string;
  type: string;
  page_id: string | null;
  content_fr?: string;
  content_en?: string;
  is_active: boolean;
  order_index: number;
  settings?: any;
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  category?: string;
  is_active: boolean;
}

// Component types for the builder
const componentTypes = [
  { value: "hero", label: "Bannière Hero", icon: "🎯", description: "Section d'en-tête principale" },
  { value: "content", label: "Contenu Texte", icon: "📝", description: "Bloc de texte riche" },
  { value: "features", label: "Fonctionnalités", icon: "⚡", description: "Grille de fonctionnalités" },
  { value: "gallery", label: "Galerie", icon: "🖼️", description: "Galerie d'images" },
  { value: "testimonials", label: "Témoignages", icon: "💬", description: "Avis clients" },
  { value: "contact", label: "Contact", icon: "📧", description: "Formulaire de contact" },
  { value: "cta", label: "Appel à l'action", icon: "🔔", description: "Bouton d'action" },
  { value: "stats", label: "Statistiques", icon: "📊", description: "Chiffres clés" },
  { value: "pricing", label: "Tarifs", icon: "💰", description: "Tableau de prix" },
  { value: "team", label: "Équipe", icon: "👥", description: "Membres de l'équipe" },
  { value: "faq", label: "FAQ", icon: "❓", description: "Questions fréquentes" },
  { value: "video", label: "Vidéo", icon: "🎬", description: "Lecteur vidéo" },
  { value: "map", label: "Carte", icon: "🗺️", description: "Localisation" },
  { value: "custom", label: "Personnalisé", icon: "🔧", description: "Code HTML/CSS" },
];

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

// Sidebar navigation items
const sidebarItems = [
  { id: "dashboard", label: "Tableau de bord", icon: Layout },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "sections", label: "Sections", icon: Layers },
  { id: "menu", label: "Menu / Navigation", icon: Menu },
  { id: "media", label: "Médiathèque", icon: ImageIcon },
  { id: "forms", label: "Formulaires", icon: FormInput },
  { id: "components", label: "Composants", icon: Grid3X3 },
  { id: "design", label: "Design & Branding", icon: Palette },
  { id: "translations", label: "Langues", icon: Languages },
  { id: "seo", label: "SEO", icon: Search },
  { id: "settings", label: "Paramètres", icon: Settings },
];

// Sortable component
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const AdvancedSiteBuilder = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLang, setSelectedLang] = useState("fr");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);
  
  // Dialog states
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

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
    is_active: true, settings: {},
  });

  // Queries
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['builder-pages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_pages').select('*').order('order_index');
      if (error) throw error;
      return data as Page[];
    },
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['builder-sections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_sections').select('*').order('order_index');
      if (error) throw error;
      return data as Section[];
    },
  });

  const { data: menuItems } = useQuery({
    queryKey: ['builder-menu'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_menu').select('*').order('order_index');
      if (error) throw error;
      return data;
    },
  });

  const { data: media } = useQuery({
    queryKey: ['builder-media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_media').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as MediaItem[];
    },
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['builder-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Mutations
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
      queryClient.invalidateQueries({ queryKey: ['builder-pages'] });
      toast.success(editingPage ? "Page mise à jour" : "Page créée");
      setIsPageDialogOpen(false);
      resetPageForm();
      setPendingChanges(prev => [...prev, `page-${Date.now()}`]);
    },
    onError: (e) => toast.error(`Erreur: ${e.message}`),
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('site_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-pages'] });
      toast.success("Page supprimée");
    },
  });

  const saveSectionMutation = useMutation({
    mutationFn: async (section: any) => {
      if (section.id) {
        const { error } = await supabase.from('site_sections').update(section).eq('id', section.id);
        if (error) throw error;
      } else {
        const pageSections = sections?.filter(s => s.page_id === section.page_id) || [];
        const maxOrder = pageSections.reduce((max, s) => Math.max(max, s.order_index), -1);
        const { error } = await supabase.from('site_sections').insert({ ...section, order_index: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-sections'] });
      toast.success(editingSection ? "Section mise à jour" : "Section créée");
      setIsSectionDialogOpen(false);
      resetSectionForm();
      setPendingChanges(prev => [...prev, `section-${Date.now()}`]);
    },
    onError: (e) => toast.error(`Erreur: ${e.message}`),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('site_sections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-sections'] });
      toast.success("Section supprimée");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ table, id, is_active }: { table: "site_pages" | "site_sections"; id: string; is_active: boolean }) => {
      const { error } = await supabase.from(table).update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-pages'] });
      queryClient.invalidateQueries({ queryKey: ['builder-sections'] });
    },
  });

  // Form helpers
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
      is_active: true, settings: {},
    });
    setEditingSection(null);
  };

  const openPageDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        slug: page.slug || "", title_fr: page.title_fr || "", title_en: page.title_en || "",
        title_ar: "", title_es: "", title_de: "", title_zh: "",
        description_fr: "", description_en: "", meta_title_fr: "", meta_description_fr: "",
        is_active: page.is_active, is_home: page.is_home,
      });
    } else {
      resetPageForm();
    }
    setIsPageDialogOpen(true);
  };

  const openSectionDialog = (section?: Section, pageId?: string) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        name: section.name, type: section.type, page_id: section.page_id || "",
        content_fr: section.content_fr || "", content_en: section.content_en || "",
        content_ar: "", content_es: "", content_de: "", content_zh: "",
        is_active: section.is_active, settings: section.settings || {},
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Handle reordering logic here
  };

  // Filter and stats
  const filteredPages = pages?.filter(p =>
    p.title_fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPageSections = (pageId: string | null) =>
    sections?.filter(s => s.page_id === pageId).sort((a, b) => a.order_index - b.order_index) || [];

  const stats = {
    pages: pages?.length || 0,
    sections: sections?.length || 0,
    media: media?.length || 0,
    menu: menuItems?.length || 0,
    pending: pendingChanges.length,
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className={`flex flex-col h-full bg-card border-r transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!sidebarCollapsed && (
          <h2 className="font-bold text-lg">Constructeur</h2>
        )}
        <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Pending changes indicator */}
      {pendingChanges.length > 0 && !sidebarCollapsed && (
        <div className="p-4 border-t bg-amber-50">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {pendingChanges.length} modification(s) en attente
          </div>
        </div>
      )}
    </div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre site</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            Prévisualiser
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Megaphone className="w-4 h-4 mr-2" />
            Publier ({pendingChanges.length})
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Pages</p>
                <p className="text-2xl font-bold text-blue-700">{stats.pages}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Sections</p>
                <p className="text-2xl font-bold text-purple-700">{stats.sections}</p>
              </div>
              <Layers className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600">Médias</p>
                <p className="text-2xl font-bold text-pink-700">{stats.media}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-pink-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600">Menu</p>
                <p className="text-2xl font-bold text-teal-700">{stats.menu}</p>
              </div>
              <Menu className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Langues</p>
                <p className="text-2xl font-bold text-amber-700">6</p>
              </div>
              <Languages className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col" onClick={() => { setActiveTab("pages"); openPageDialog(); }}>
              <Plus className="w-6 h-6 mb-2" />
              Nouvelle page
            </Button>
            <Button variant="outline" className="h-24 flex-col" onClick={() => { setActiveTab("sections"); openSectionDialog(); }}>
              <Layers className="w-6 h-6 mb-2" />
              Nouvelle section
            </Button>
            <Button variant="outline" className="h-24 flex-col" onClick={() => setActiveTab("media")}>
              <Upload className="w-6 h-6 mb-2" />
              Uploader média
            </Button>
            <Button variant="outline" className="h-24 flex-col" onClick={() => setActiveTab("menu")}>
              <Menu className="w-6 h-6 mb-2" />
              Gérer menu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent pages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pages récentes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("pages")}>
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pages?.slice(0, 5).map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {page.is_home && <Home className="w-4 h-4 text-amber-500" />}
                  <div>
                    <p className="font-medium">{page.title_fr}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={page.is_active ? "default" : "secondary"}>
                    {page.is_active ? "Actif" : "Brouillon"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openPageDialog(page)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render pages tab
  const renderPages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Gérez toutes les pages de votre site</p>
        </div>
        <Button onClick={() => openPageDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle page
        </Button>
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

      {/* Pages list */}
      <Card>
        <CardContent className="p-0">
          {pagesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredPages?.map(p => p.id) || []} strategy={verticalListSortingStrategy}>
                <div className="divide-y">
                  {filteredPages?.map((page) => (
                    <div key={page.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {page.is_home && <Home className="w-4 h-4 text-amber-500" />}
                          <span className="font-medium">{page.title_fr}</span>
                          <Badge variant={page.is_active ? "default" : "secondary"} className="text-xs">
                            {page.is_active ? "Actif" : "Brouillon"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getPageSections(page.id).length} sections</Badge>
                        <Switch
                          checked={page.is_active}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ table: 'site_pages', id: page.id, is_active: checked })}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPageDialog(page)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openSectionDialog(undefined, page.id)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter section
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedPageId(page.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir sections
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Supprimer cette page ?")) {
                                  deletePageMutation.mutate(page.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Page sections panel */}
      {selectedPageId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sections de la page</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openSectionDialog(undefined, selectedPageId)}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPageId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getPageSections(selectedPageId).map((section) => (
                <div key={section.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span className="text-lg">{componentTypes.find(t => t.value === section.type)?.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{section.name}</p>
                    <p className="text-xs text-muted-foreground">{section.type}</p>
                  </div>
                  <Switch
                    checked={section.is_active}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ table: 'site_sections', id: section.id, is_active: checked })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openSectionDialog(section)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Supprimer cette section ?")) {
                        deleteSectionMutation.mutate(section.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {getPageSections(selectedPageId).length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucune section</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render sections tab
  const renderSections = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sections</h1>
          <p className="text-muted-foreground">Tous les blocs de contenu disponibles</p>
        </div>
        <Button onClick={() => openSectionDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle section
        </Button>
      </div>

      {/* Component palette */}
      <Card>
        <CardHeader>
          <CardTitle>Types de sections disponibles</CardTitle>
          <CardDescription>Glissez-déposez pour ajouter à une page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {componentTypes.map((type) => (
              <div
                key={type.value}
                className="p-4 border rounded-lg text-center hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  setSectionForm(prev => ({ ...prev, type: type.value }));
                  openSectionDialog();
                }}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="text-sm font-medium mt-2">{type.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing sections */}
      <Card>
        <CardHeader>
          <CardTitle>Sections existantes ({sections?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections?.map((section) => {
              const page = pages?.find(p => p.id === section.page_id);
              return (
                <div key={section.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-lg">{componentTypes.find(t => t.value === section.type)?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{section.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {page ? `Page: ${page.title_fr}` : 'Section globale'}
                    </p>
                  </div>
                  <Badge variant={section.is_active ? "default" : "secondary"}>
                    {section.is_active ? "Actif" : "Inactif"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openSectionDialog(section)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render media tab
  const renderMedia = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Médiathèque</h1>
          <p className="text-muted-foreground">Images, vidéos et documents</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Upload className="w-4 h-4 mr-2" />
          Uploader
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media?.map((item) => (
          <Card key={item.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary">
            <div className="aspect-square bg-muted relative">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <File className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-2">
              <p className="text-xs truncate">{item.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "pages":
        return renderPages();
      case "sections":
        return renderSections();
      case "media":
        return renderMedia();
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Settings className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">{sidebarItems.find(i => i.id === activeTab)?.label}</h2>
              <p className="text-muted-foreground">Cette section est en cours de développement</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout title="Constructeur de Site">
      <div className="flex h-[calc(100vh-120px)] -m-6">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="w-96 border-l bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Aperçu</h3>
              <div className="flex gap-1">
                <Button variant={previewMode === "desktop" ? "secondary" : "ghost"} size="icon" onClick={() => setPreviewMode("desktop")}>
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button variant={previewMode === "tablet" ? "secondary" : "ghost"} size="icon" onClick={() => setPreviewMode("tablet")}>
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button variant={previewMode === "mobile" ? "secondary" : "ghost"} size="icon" onClick={() => setPreviewMode("mobile")}>
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className={`bg-white rounded-lg shadow-lg overflow-hidden mx-auto ${
              previewMode === "mobile" ? "w-[320px]" : previewMode === "tablet" ? "w-[768px] max-w-full" : "w-full"
            }`}>
              <iframe
                src="/"
                className="w-full h-[600px] border-0"
                title="Preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* Page Dialog */}
      <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Modifier la page" : "Nouvelle page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slug (URL)</Label>
                <Input
                  value={pageForm.slug}
                  onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  placeholder="ma-page"
                />
              </div>
              <div>
                <Label>Titre (Français)</Label>
                <Input
                  value={pageForm.title_fr}
                  onChange={(e) => setPageForm(prev => ({ ...prev, title_fr: e.target.value }))}
                  placeholder="Ma nouvelle page"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Titre (Anglais)</Label>
                <Input
                  value={pageForm.title_en}
                  onChange={(e) => setPageForm(prev => ({ ...prev, title_en: e.target.value }))}
                  placeholder="My new page"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={pageForm.description_fr}
                  onChange={(e) => setPageForm(prev => ({ ...prev, description_fr: e.target.value }))}
                  placeholder="Description de la page..."
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={pageForm.is_active}
                  onCheckedChange={(checked) => setPageForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Page active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={pageForm.is_home}
                  onCheckedChange={(checked) => setPageForm(prev => ({ ...prev, is_home: checked }))}
                />
                <Label>Page d'accueil</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSavePage} disabled={savePageMutation.isPending}>
              {savePageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Modifier la section" : "Nouvelle section"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de la section</Label>
                <Input
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ma section"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={sectionForm.type} onValueChange={(v) => setSectionForm(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Page associée (optionnel)</Label>
              <Select value={sectionForm.page_id} onValueChange={(v) => setSectionForm(prev => ({ ...prev, page_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Section globale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Section globale</SelectItem>
                  {pages?.map((page) => (
                    <SelectItem key={page.id} value={page.id}>{page.title_fr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs defaultValue="fr">
              <TabsList>
                {languages.map((lang) => (
                  <TabsTrigger key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="fr">
                <WYSIWYGEditor
                  content={sectionForm.content_fr}
                  onChange={(v) => setSectionForm(prev => ({ ...prev, content_fr: v }))}
                />
              </TabsContent>
              <TabsContent value="en">
                <WYSIWYGEditor
                  content={sectionForm.content_en}
                  onChange={(v) => setSectionForm(prev => ({ ...prev, content_en: v }))}
                />
              </TabsContent>
              <TabsContent value="ar">
                <WYSIWYGEditor
                  content={sectionForm.content_ar}
                  onChange={(v) => setSectionForm(prev => ({ ...prev, content_ar: v }))}
                />
              </TabsContent>
              <TabsContent value="es">
                <WYSIWYGEditor
                  content={sectionForm.content_es}
                  onChange={(v) => setSectionForm(prev => ({ ...prev, content_es: v }))}
                />
              </TabsContent>
              <TabsContent value="de">
                <WYSIWYGEditor
                  content={sectionForm.content_de}
                  onChange={(v) => setSectionForm(prev => ({ ...prev, content_de: v }))}
                />
              </TabsContent>
              <TabsContent value="zh">
                <WYSIWYGEditor
                  content={sectionForm.content_zh}
                  onChange={(v) => setSectionForm(prev => ({ ...prev, content_zh: v }))}
                />
              </TabsContent>
            </Tabs>
            <div className="flex items-center gap-2">
              <Switch
                checked={sectionForm.is_active}
                onCheckedChange={(checked) => setSectionForm(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Section active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveSection} disabled={saveSectionMutation.isPending}>
              {saveSectionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdvancedSiteBuilder;
