import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GripVertical, Plus, Trash2, Edit2, Eye, EyeOff, Save, 
  Monitor, Tablet, Smartphone, RefreshCw, Undo, Redo,
  ChevronUp, ChevronDown, Copy, Settings, Palette, Type,
  Image as ImageIcon, Layout, Layers, Code, X, Check, Loader2
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface Section {
  id: string;
  name: string;
  type: string;
  page_id: string | null;
  content_fr?: string;
  content_en?: string;
  is_active: boolean;
  order_index: number;
  settings?: unknown;
}

interface Page {
  id: string;
  slug: string;
  title_fr: string;
  title_en?: string;
  is_active: boolean;
  is_home: boolean;
}

interface VisualPageEditorProps {
  page: Page;
  sections: Section[];
  onClose: () => void;
}

const componentTypes = [
  { value: "hero", label: "Bannière Hero", icon: "🎯", color: "bg-blue-100 border-blue-300" },
  { value: "content", label: "Contenu Texte", icon: "📝", color: "bg-green-100 border-green-300" },
  { value: "features", label: "Fonctionnalités", icon: "⚡", color: "bg-yellow-100 border-yellow-300" },
  { value: "gallery", label: "Galerie", icon: "🖼️", color: "bg-pink-100 border-pink-300" },
  { value: "testimonials", label: "Témoignages", icon: "💬", color: "bg-purple-100 border-purple-300" },
  { value: "contact", label: "Contact", icon: "📧", color: "bg-teal-100 border-teal-300" },
  { value: "cta", label: "Appel à l'action", icon: "🔔", color: "bg-orange-100 border-orange-300" },
  { value: "stats", label: "Statistiques", icon: "📊", color: "bg-indigo-100 border-indigo-300" },
  { value: "faq", label: "FAQ", icon: "❓", color: "bg-cyan-100 border-cyan-300" },
];

// Draggable section component in the editor
const DraggableSectionItem = ({ 
  section, 
  isSelected, 
  onClick, 
  onEdit, 
  onDelete, 
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  section: Section;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeConfig = componentTypes.find(t => t.value === section.type) || componentTypes[1];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-4 border-2 rounded-lg transition-all cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-primary border-primary shadow-lg' 
          : `${typeConfig.color} hover:shadow-md`
      } ${!section.is_active ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="ml-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeConfig.icon}</span>
          <div>
            <p className="font-medium">{section.name}</p>
            <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst}>
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active indicator */}
      {!section.is_active && (
        <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
          Masqué
        </Badge>
      )}
    </div>
  );
};

// Component palette item
const PaletteItem = ({ type, onAdd }: { type: typeof componentTypes[0]; onAdd: () => void }) => (
  <button
    onClick={onAdd}
    className={`p-3 rounded-lg border-2 ${type.color} hover:scale-105 transition-transform text-center w-full`}
  >
    <span className="text-xl block mb-1">{type.icon}</span>
    <span className="text-xs font-medium">{type.label}</span>
  </button>
);

export const VisualPageEditor = ({ page, sections: initialSections, onClose }: VisualPageEditorProps) => {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<Section[]>(initialSections.sort((a, b) => a.order_index - b.order_index));
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", content_fr: "", content_en: "" });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Update local sections when initial changes
  useEffect(() => {
    setSections(initialSections.sort((a, b) => a.order_index - b.order_index));
  }, [initialSections]);

  // Mutations
  const saveSectionMutation = useMutation({
    mutationFn: async (section: Partial<Section> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      if (section.name !== undefined) updateData.name = section.name;
      if (section.content_fr !== undefined) updateData.content_fr = section.content_fr;
      if (section.content_en !== undefined) updateData.content_en = section.content_en;
      if (section.is_active !== undefined) updateData.is_active = section.is_active;
      if (section.order_index !== undefined) updateData.order_index = section.order_index;
      
      const { error } = await supabase.from('site_sections').update(updateData).eq('id', section.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-sections'] });
      toast.success("Section mise à jour");
      setPreviewKey(k => k + 1);
    },
    onError: (e) => toast.error(`Erreur: ${e.message}`),
  });

  const addSectionMutation = useMutation({
    mutationFn: async (section: Omit<Section, 'id'>) => {
      const { error } = await supabase.from('site_sections').insert({
        name: section.name,
        type: section.type,
        page_id: section.page_id,
        content_fr: section.content_fr,
        content_en: section.content_en,
        is_active: section.is_active,
        order_index: section.order_index,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-sections'] });
      toast.success("Section ajoutée");
      setPreviewKey(k => k + 1);
      setHasChanges(true);
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
      setPreviewKey(k => k + 1);
      setSelectedSection(null);
    },
  });

  const reorderSectionsMutation = useMutation({
    mutationFn: async (orderedSections: { id: string; order_index: number }[]) => {
      for (const sec of orderedSections) {
        await supabase.from('site_sections').update({ order_index: sec.order_index }).eq('id', sec.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-sections'] });
      setPreviewKey(k => k + 1);
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);

    const newSections = arrayMove(sections, oldIndex, newIndex);
    setSections(newSections);

    // Save new order
    const orderedSections = newSections.map((s, i) => ({ id: s.id, order_index: i }));
    reorderSectionsMutation.mutate(orderedSections);
    setHasChanges(true);
  };

  const handleAddSection = (type: string) => {
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order_index)) : -1;
    const typeConfig = componentTypes.find(t => t.value === type);
    addSectionMutation.mutate({
      name: `Nouvelle ${typeConfig?.label || 'section'}`,
      type,
      page_id: page.id,
      content_fr: `<h2>${typeConfig?.label}</h2><p>Contenu à personnaliser...</p>`,
      content_en: "",
      is_active: true,
      order_index: maxOrder + 1,
      settings: {},
    });
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setEditForm({
      name: section.name,
      content_fr: section.content_fr || "",
      content_en: section.content_en || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSection) return;
    saveSectionMutation.mutate({
      id: selectedSection.id,
      name: editForm.name,
      content_fr: editForm.content_fr,
      content_en: editForm.content_en,
    });
    setIsEditing(false);
    setHasChanges(true);
  };

  const handleToggleSection = (section: Section) => {
    saveSectionMutation.mutate({ id: section.id, is_active: !section.is_active });
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: !s.is_active } : s));
    setHasChanges(true);
  };

  const handleDeleteSection = (section: Section) => {
    if (confirm(`Supprimer la section "${section.name}" ?`)) {
      deleteSectionMutation.mutate(section.id);
      setSections(prev => prev.filter(s => s.id !== section.id));
      setHasChanges(true);
    }
  };

  const handleMoveSection = (section: Section, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = arrayMove(sections, currentIndex, newIndex);
    setSections(newSections);

    const orderedSections = newSections.map((s, i) => ({ id: s.id, order_index: i }));
    reorderSectionsMutation.mutate(orderedSections);
    setHasChanges(true);
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">{page.title_fr}</h1>
            <p className="text-sm text-muted-foreground">/{page.slug}</p>
          </div>
          {hasChanges && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Modifications non publiées
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Preview mode switcher */}
          <div className="flex border rounded-lg p-1 bg-muted/30">
            <Button 
              variant={previewMode === "desktop" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              variant={previewMode === "tablet" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => setPreviewMode("tablet")}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button 
              variant={previewMode === "mobile" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={() => setPreviewKey(k => k + 1)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir
          </Button>
          
          <Button className="bg-green-600 hover:bg-green-700" onClick={onClose}>
            <Check className="w-4 h-4 mr-2" />
            Terminer
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Section list */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Sections de la page</h2>
            <p className="text-xs text-muted-foreground">Glissez pour réorganiser</p>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <DraggableSectionItem
                      key={section.id}
                      section={section}
                      isSelected={selectedSection?.id === section.id}
                      onClick={() => setSelectedSection(section)}
                      onEdit={() => handleEditSection(section)}
                      onDelete={() => handleDeleteSection(section)}
                      onToggle={() => handleToggleSection(section)}
                      onMoveUp={() => handleMoveSection(section, 'up')}
                      onMoveDown={() => handleMoveSection(section, 'down')}
                      isFirst={index === 0}
                      isLast={index === sections.length - 1}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeDragId ? (
                  <div className="p-4 bg-white rounded-lg shadow-xl border-2 border-primary">
                    <span className="text-2xl">{componentTypes.find(t => t.value === sections.find(s => s.id === activeDragId)?.type)?.icon}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune section</p>
                <p className="text-xs">Ajoutez des sections depuis la palette</p>
              </div>
            )}
          </ScrollArea>

          {/* Add section palette */}
          <div className="border-t p-4">
            <h3 className="font-medium mb-3 text-sm">Ajouter une section</h3>
            <div className="grid grid-cols-3 gap-2">
              {componentTypes.slice(0, 6).map((type) => (
                <PaletteItem key={type.value} type={type} onAdd={() => handleAddSection(type.value)} />
              ))}
            </div>
          </div>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 bg-muted/30 p-6 overflow-auto flex justify-center">
          <div 
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{ width: getPreviewWidth(), maxWidth: "100%" }}
          >
            <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-full px-4 py-1 text-xs text-muted-foreground text-center">
                  agricapital.ci/{page.slug}
                </div>
              </div>
            </div>
            <iframe
              key={previewKey}
              src={`/?preview=true&page=${page.slug}`}
              className="w-full border-0"
              style={{ height: "calc(100vh - 200px)" }}
              title="Preview"
            />
          </div>
        </div>

        {/* Right panel - Section editor */}
        {selectedSection && (
          <div className="w-96 border-l bg-card flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Éditer la section</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSection(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <Label>Nom de la section</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <Tabs defaultValue="fr">
                  <TabsList className="w-full">
                    <TabsTrigger value="fr" className="flex-1">🇫🇷 FR</TabsTrigger>
                    <TabsTrigger value="en" className="flex-1">🇬🇧 EN</TabsTrigger>
                  </TabsList>
                  <TabsContent value="fr" className="mt-4">
                    <Label className="mb-2 block">Contenu français</Label>
                    <WYSIWYGEditor
                      content={editForm.content_fr}
                      onChange={(v) => setEditForm(prev => ({ ...prev, content_fr: v }))}
                    />
                  </TabsContent>
                  <TabsContent value="en" className="mt-4">
                    <Label className="mb-2 block">Contenu anglais</Label>
                    <WYSIWYGEditor
                      content={editForm.content_en}
                      onChange={(v) => setEditForm(prev => ({ ...prev, content_en: v }))}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <Button 
                className="w-full" 
                onClick={handleSaveEdit}
                disabled={saveSectionMutation.isPending}
              >
                {saveSectionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualPageEditor;
