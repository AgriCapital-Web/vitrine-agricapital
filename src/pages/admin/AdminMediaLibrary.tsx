import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Image, 
  Upload, 
  Trash2, 
  Search, 
  Grid3X3, 
  List,
  Eye,
  Copy,
  Loader2,
  Plus,
  Filter,
  FileUp,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const AdminMediaLibrary = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [newMedia, setNewMedia] = useState({
    name: "",
    url: "",
    category: "",
    alt_text_fr: "",
    alt_text_en: ""
  });

  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_media')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(10);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setUploadProgress(80);

      const { error: dbError } = await supabase
        .from('site_media')
        .insert([{
          name: file.name,
          url: urlData.publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          category: 'upload'
        }]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success("Fichier uploadé avec succès !");
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'upload");
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const addMediaMutation = useMutation({
    mutationFn: async (media: typeof newMedia) => {
      const { error } = await supabase
        .from('site_media')
        .insert([media]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success("Média ajouté avec succès");
      setIsAddDialogOpen(false);
      setNewMedia({ name: "", url: "", category: "", alt_text_fr: "", alt_text_en: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (media: any) => {
      if (media.url && media.url.includes('/media/')) {
        const pathMatch = media.url.match(/\/media\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from('media').remove([pathMatch[1]]);
        }
      }
      
      const { error } = await supabase
        .from('site_media')
        .delete()
        .eq('id', media.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success("Média supprimé");
      setSelectedMedia(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} est trop volumineux (max 10MB)`);
        return;
      }
      uploadFileMutation.mutate(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const categories = [...new Set(mediaItems?.map(m => m.category).filter(Boolean) || [])];
  
  const filteredMedia = mediaItems?.filter(media => {
    const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         media.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || media.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée!");
  };

  return (
    <AdminLayout title="Médiathèque">
      <div className="space-y-6">
        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver 
              ? 'border-agri-green bg-agri-green/10' 
              : 'border-muted-foreground/30 hover:border-agri-green/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-agri-green" />
              <p className="text-muted-foreground">Upload en cours...</p>
              <Progress value={uploadProgress} className="max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                ou cliquez pour sélectionner (max 10MB par fichier)
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-agri-green hover:bg-agri-green-dark"
              >
                <Upload className="w-4 h-4 mr-2" />
                Sélectionner des fichiers
              </Button>
            </>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">Fichiers uploadés</h2>
            <p className="text-muted-foreground text-sm">
              {mediaItems?.length || 0} fichier(s) dans la médiathèque
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter via URL
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un média via URL</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input 
                    value={newMedia.name}
                    onChange={(e) => setNewMedia({...newMedia, name: e.target.value})}
                    placeholder="Nom du média"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input 
                    value={newMedia.url}
                    onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Input 
                    value={newMedia.category}
                    onChange={(e) => setNewMedia({...newMedia, category: e.target.value})}
                    placeholder="galerie, hero, logo..."
                  />
                </div>
                <Button 
                  onClick={() => addMediaMutation.mutate(newMedia)}
                  disabled={addMediaMutation.isPending || !newMedia.name || !newMedia.url}
                  className="w-full bg-agri-green hover:bg-agri-green-dark"
                >
                  {addMediaMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat || ""}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Media Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-agri-green" />
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-2"
          }>
            {filteredMedia?.map((media) => (
              <Card 
                key={media.id}
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-agri-green/50 ${
                  selectedMedia?.id === media.id ? 'ring-2 ring-agri-green' : ''
                } ${viewMode === 'list' ? 'flex flex-row items-center' : ''}`}
                onClick={() => setSelectedMedia(media)}
              >
                <CardContent className={`p-2 ${viewMode === 'list' ? 'flex items-center gap-4 w-full' : ''}`}>
                  {media.type === 'image' ? (
                    <div className={viewMode === 'grid' ? "aspect-square" : "w-16 h-16 flex-shrink-0"}>
                      <img 
                        src={media.url} 
                        alt={media.alt_text_fr || media.name}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={`bg-secondary flex items-center justify-center rounded ${
                      viewMode === 'grid' ? "aspect-square" : "w-16 h-16 flex-shrink-0"
                    }`}>
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className={viewMode === 'list' ? "flex-1 min-w-0" : "mt-2"}>
                    <p className="text-sm font-medium truncate">{media.name}</p>
                    {media.category && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {media.category}
                      </span>
                    )}
                  </div>
                  {viewMode === 'list' && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); copyToClipboard(media.url); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); window.open(media.url, '_blank'); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Selected Media Actions */}
        {selectedMedia && (
          <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedMedia.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedMedia.url}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMedia(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(selectedMedia.url)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier URL
                </Button>
                <Button variant="outline" onClick={() => window.open(selectedMedia.url, '_blank')}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => deleteMediaMutation.mutate(selectedMedia)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredMedia?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun média trouvé</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMediaLibrary;
