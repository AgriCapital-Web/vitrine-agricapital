import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Copy, Upload, Image, Video, FileText, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  alt_text_fr: string | null;
  alt_text_en: string | null;
  type: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

const categories = [
  { value: "logo", label: "Logos" },
  { value: "hero", label: "Bannières" },
  { value: "gallery", label: "Galerie" },
  { value: "team", label: "Équipe" },
  { value: "partners", label: "Partenaires" },
  { value: "misc", label: "Divers" },
];

const AdminMedia = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newMedia, setNewMedia] = useState({
    name: "",
    url: "",
    alt_text_fr: "",
    alt_text_en: "",
    type: "image",
    category: "misc",
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_media')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Erreur lors du chargement");
      console.error(error);
    } else {
      setMedia(data || []);
    }
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!newMedia.name || !newMedia.url) {
      toast.error("Le nom et l'URL sont requis");
      return;
    }

    const { error } = await supabase
      .from('site_media')
      .insert({
        name: newMedia.name,
        url: newMedia.url,
        alt_text_fr: newMedia.alt_text_fr,
        alt_text_en: newMedia.alt_text_en,
        type: newMedia.type,
        category: newMedia.category,
      });

    if (error) {
      toast.error("Erreur lors de l'ajout");
      console.error(error);
    } else {
      toast.success("Média ajouté");
      fetchMedia();
      setIsDialogOpen(false);
      setNewMedia({
        name: "",
        url: "",
        alt_text_fr: "",
        alt_text_en: "",
        type: "image",
        category: "misc",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return;

    const { error } = await supabase
      .from('site_media')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Média supprimé");
      fetchMedia();
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copiée");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = selectedCategory === "all" 
    ? media 
    : media.filter(m => m.category === selectedCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "document": return FileText;
      default: return Image;
    }
  };

  return (
    <AdminLayout title="Médiathèque">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-muted-foreground">Gérez vos images, vidéos et documents</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucun média</p>
              <Button onClick={() => setIsDialogOpen(true)}>Ajouter un média</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-square relative bg-muted">
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.alt_text_fr || item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => copyUrl(item.url, item.id)}
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    {item.category && (
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {categories.find(c => c.value === item.category)?.label || item.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un média</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={newMedia.name}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du fichier"
                />
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  value={newMedia.url}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newMedia.type}
                    onValueChange={(value) => setNewMedia(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={newMedia.category}
                    onValueChange={(value) => setNewMedia(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Texte alternatif (FR)</Label>
                <Input
                  value={newMedia.alt_text_fr}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, alt_text_fr: e.target.value }))}
                  placeholder="Description de l'image"
                />
              </div>

              <div>
                <Label>Texte alternatif (EN)</Label>
                <Input
                  value={newMedia.alt_text_en}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, alt_text_en: e.target.value }))}
                  placeholder="Image description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAdd}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;