import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Image, Video, Calendar, Loader2 } from "lucide-react";

interface NewsArticle {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  content_fr: string;
  content_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  featured_image: string | null;
  images: string[];
  videos: string[];
  category: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  author: string;
  views_count: number;
  created_at: string;
}

const AdminNews = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: "",
    title_fr: "",
    title_en: "",
    content_fr: "",
    content_en: "",
    excerpt_fr: "",
    excerpt_en: "",
    featured_image: "",
    images: [] as string[],
    videos: [] as string[],
    category: "general",
    is_published: false,
    is_featured: false,
    author: "AgriCapital"
  });

  // Fetch news
  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NewsArticle[];
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = data.slug || data.title_fr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const payload = {
        ...data,
        slug,
        images: JSON.stringify(data.images),
        videos: JSON.stringify(data.videos),
        published_at: data.is_published ? new Date().toISOString() : null
      };

      if (editingArticle) {
        const { error } = await supabase
          .from("news")
          .update(payload)
          .eq("id", editingArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("news")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success(editingArticle ? "Article mis à jour" : "Article créé");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement");
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Article supprimé");
    }
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("news")
        .update({ 
          is_published, 
          published_at: is_published ? new Date().toISOString() : null 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Statut mis à jour");
    }
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      title_fr: "",
      title_en: "",
      content_fr: "",
      content_en: "",
      excerpt_fr: "",
      excerpt_en: "",
      featured_image: "",
      images: [],
      videos: [],
      category: "general",
      is_published: false,
      is_featured: false,
      author: "AgriCapital"
    });
    setEditingArticle(null);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      slug: article.slug,
      title_fr: article.title_fr,
      title_en: article.title_en || "",
      content_fr: article.content_fr,
      content_en: article.content_en || "",
      excerpt_fr: article.excerpt_fr || "",
      excerpt_en: article.excerpt_en || "",
      featured_image: article.featured_image || "",
      images: Array.isArray(article.images) ? article.images : [],
      videos: Array.isArray(article.videos) ? article.videos : [],
      category: article.category,
      is_published: article.is_published,
      is_featured: article.is_featured,
      author: article.author
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileName = `news/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("media")
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        featured_image: prev.featured_image || uploadedUrls[0]
      }));
      
      toast.success(`${uploadedUrls.length} image(s) téléchargée(s)`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingVideos(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileName = `news/videos/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("media")
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...uploadedUrls]
      }));
      
      toast.success(`${uploadedUrls.length} vidéo(s) téléchargée(s)`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploadingVideos(false);
    }
  };

  return (
    <AdminLayout title="Gestion des Actualités">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Actualités</h2>
            <p className="text-muted-foreground">Gérez les articles et publications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-agri-green hover:bg-agri-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Modifier l'article" : "Nouvel article"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenu FR</TabsTrigger>
                  <TabsTrigger value="content-en">Contenu EN</TabsTrigger>
                  <TabsTrigger value="media">Médias</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre (Français) *</Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Titre de l'article"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extrait (Français)</Label>
                    <Textarea
                      value={formData.excerpt_fr}
                      onChange={(e) => setFormData({ ...formData, excerpt_fr: e.target.value })}
                      placeholder="Résumé court pour l'aperçu"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (Français) *</Label>
                    <Textarea
                      value={formData.content_fr}
                      onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                      placeholder="Contenu complet de l'article (Markdown supporté)"
                      rows={10}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="content-en" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      placeholder="Article title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Excerpt (English)</Label>
                    <Textarea
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                      placeholder="Short summary for preview"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (English)</Label>
                    <Textarea
                      value={formData.content_en}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      placeholder="Full article content (Markdown supported)"
                      rows={10}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-6">
                  {/* Images Upload */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Images
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        disabled={uploadingImages}
                      >
                        {uploadingImages ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Ajouter des images
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Image ${index + 1}`}
                              className={`w-full aspect-square object-cover rounded-lg ${
                                formData.featured_image === url ? 'ring-2 ring-agri-green' : ''
                              }`}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setFormData({ ...formData, featured_image: url })}
                              >
                                ⭐
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setFormData({
                                  ...formData,
                                  images: formData.images.filter((_, i) => i !== index),
                                  featured_image: formData.featured_image === url ? "" : formData.featured_image
                                })}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Videos Upload */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Vidéos
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("video-upload")?.click()}
                        disabled={uploadingVideos}
                      >
                        {uploadingVideos ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Ajouter des vidéos
                      </Button>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                    </div>
                    {formData.videos.length > 0 && (
                      <div className="space-y-2">
                        {formData.videos.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="truncate text-sm">{url.split('/').pop()}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setFormData({
                                ...formData,
                                videos: formData.videos.filter((_, i) => i !== index)
                              })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label>Publier immédiatement</Label>
                      <Switch
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Article à la une</Label>
                      <Switch
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={!formData.title_fr || !formData.content_fr || saveMutation.isPending}
                  className="bg-agri-green hover:bg-agri-green/90"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingArticle ? "Mettre à jour" : "Publier"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* News List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-agri-green" />
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid gap-4">
            {news.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {article.featured_image && (
                      <img 
                        src={article.featured_image}
                        alt={article.title_fr}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{article.title_fr}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.excerpt_fr || article.content_fr.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views_count} vues
                            </span>
                            <Badge variant={article.is_published ? "default" : "secondary"}>
                              {article.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePublishMutation.mutate({ 
                              id: article.id, 
                              is_published: !article.is_published 
                            })}
                          >
                            {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(article)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer cet article ?")) {
                                deleteMutation.mutate(article.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun article pour le moment
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNews;
