import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  parent_id: string | null;
  label_fr: string;
  label_en: string | null;
  label_ar: string | null;
  label_es: string | null;
  label_de: string | null;
  label_zh: string | null;
  url: string | null;
  target: string;
  is_active: boolean;
  order_index: number;
}

const AdminMenuNav = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_menu')
      .select('*')
      .order('order_index');
    
    if (error) {
      toast.error("Erreur lors du chargement");
      console.error(error);
    } else {
      setMenuItems(data || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!editingItem?.label_fr) {
      toast.error("Le label est requis");
      return;
    }

    setIsSaving(true);

    const itemData = {
      label_fr: editingItem.label_fr,
      label_en: editingItem.label_en,
      label_ar: editingItem.label_ar,
      label_es: editingItem.label_es,
      label_de: editingItem.label_de,
      label_zh: editingItem.label_zh,
      url: editingItem.url,
      target: editingItem.target || "_self",
      is_active: editingItem.is_active ?? true,
      parent_id: editingItem.parent_id || null,
    };

    if (editingItem.id) {
      const { error } = await supabase
        .from('site_menu')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        console.error(error);
      } else {
        toast.success("Élément mis à jour");
        fetchMenuItems();
      }
    } else {
      const { error } = await supabase
        .from('site_menu')
        .insert({
          ...itemData,
          order_index: menuItems.length,
        });

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("Élément créé");
        fetchMenuItems();
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet élément de menu ?")) return;

    const { error } = await supabase
      .from('site_menu')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Élément supprimé");
      fetchMenuItems();
    }
  };

  const toggleActive = async (item: MenuItem) => {
    const { error } = await supabase
      .from('site_menu')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);

    if (error) {
      toast.error("Erreur");
    } else {
      fetchMenuItems();
    }
  };

  const openEditDialog = (item?: MenuItem) => {
    setEditingItem(item ? { ...item } : { is_active: true, target: "_self" });
    setIsDialogOpen(true);
  };

  const rootItems = menuItems.filter(item => !item.parent_id);
  const getChildren = (parentId: string) => menuItems.filter(item => item.parent_id === parentId);

  return (
    <AdminLayout title="Menu & Navigation">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">Gérez la structure de navigation de votre site</p>
          <Button onClick={() => openEditDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel élément
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : menuItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Aucun élément de menu</p>
              <Button onClick={() => openEditDialog()}>Créer un élément</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {rootItems.map((item) => (
              <div key={item.id}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.label_fr}</span>
                            <Badge variant={item.is_active ? "default" : "outline"}>
                              {item.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.url}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(item)}>
                          {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sub-items */}
                {getChildren(item.id).map((child) => (
                  <Card key={child.id} className="ml-8 mt-2">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <div>
                            <span className="text-sm font-medium">{child.label_fr}</span>
                            <p className="text-xs text-muted-foreground">{child.url}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(child)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(child.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.id ? "Modifier l'élément" : "Nouvel élément de menu"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Label (Français) *</Label>
                <Input
                  value={editingItem?.label_fr || ""}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, label_fr: e.target.value }))}
                  placeholder="Accueil"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Label (Anglais)</Label>
                  <Input
                    value={editingItem?.label_en || ""}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, label_en: e.target.value }))}
                    placeholder="Home"
                  />
                </div>
                <div>
                  <Label>Label (Arabe)</Label>
                  <Input
                    value={editingItem?.label_ar || ""}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, label_ar: e.target.value }))}
                    placeholder="الرئيسية"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label>URL / Lien</Label>
                <Input
                  value={editingItem?.url || ""}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="/a-propos ou https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Parent</Label>
                  <Select
                    value={editingItem?.parent_id || "none"}
                    onValueChange={(value) => setEditingItem(prev => ({ 
                      ...prev, 
                      parent_id: value === "none" ? null : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun (racine)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun (racine)</SelectItem>
                      {rootItems
                        .filter(item => item.id !== editingItem?.id)
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label_fr}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ouvrir dans</Label>
                  <Select
                    value={editingItem?.target || "_self"}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, target: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Même fenêtre</SelectItem>
                      <SelectItem value="_blank">Nouvel onglet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Visible</Label>
                <Switch
                  checked={editingItem?.is_active ?? true}
                  onCheckedChange={(checked) => setEditingItem(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem?.id ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMenuNav;