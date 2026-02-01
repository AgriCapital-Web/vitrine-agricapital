import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Image, Video, Calendar, Loader2, Sparkles, Wand2, Hash, FileText } from "lucide-react";

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
  const [generatingAI, setGeneratingAI] = useState(false);
  
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
      toast.success(editingArticle ? "Article mis à jour" : "Article créé avec succès");
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

  // AI Generation function
  const generateArticleWithAI = async () => {
    if (!formData.content_fr.trim()) {
      toast.error("Veuillez entrer une idée ou du contenu brut à développer");
      return;
    }

    setGeneratingAI(true);
    
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: `Tu es un rédacteur professionnel pour AgriCapital, une entreprise ivoirienne spécialisée dans l'accompagnement agricole et les plantations de palmiers à huile.

Voici une idée ou un contenu brut à transformer en article professionnel:
"${formData.content_fr}"

INSTRUCTIONS:
1. Génère un TITRE professionnel et accrocheur (max 80 caractères)
2. Rédige un ARTICLE COMPLET et bien structuré avec:
   - Une introduction engageante
   - Des paragraphes clairs avec sous-titres si nécessaire
   - Des points clés mis en **gras**
   - Un style professionnel mais accessible
   - Une conclusion avec call-to-action
3. Génère un EXTRAIT de 2-3 phrases pour l'aperçu
4. Propose 5 HASHTAGS pertinents

Réponds UNIQUEMENT au format JSON suivant:
{
  "title": "Le titre de l'article",
  "content": "Le contenu complet de l'article avec mise en forme markdown",
  "excerpt": "L'extrait court pour l'aperçu",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`,
          language: 'fr'
        }
      });

      if (response.error) throw response.error;

      // Parse the AI response
      const aiResponse = response.data?.response || response.data?.message;
      
      if (aiResponse) {
        try {
          // Extract JSON from response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Add hashtags to content
            const contentWithHashtags = parsed.content + 
              (parsed.hashtags ? `\n\n---\n\n${parsed.hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')}` : '');
            
            setFormData(prev => ({
              ...prev,
              title_fr: parsed.title || prev.title_fr,
              content_fr: contentWithHashtags,
              excerpt_fr: parsed.excerpt || prev.excerpt_fr
            }));
            
            toast.success("Article généré avec succès ! Vérifiez et ajustez si nécessaire.");
          } else {
            // If no JSON, use the raw response as content
            setFormData(prev => ({
              ...prev,
              content_fr: aiResponse
            }));
            toast.success("Contenu généré, veuillez ajouter un titre");
          }
        } catch (parseError) {
          // Use raw response if JSON parsing fails
          setFormData(prev => ({
            ...prev,
            content_fr: aiResponse
          }));
          toast.success("Contenu enrichi, veuillez vérifier la mise en forme");
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error("Erreur lors de la génération IA. Vérifiez votre connexion.");
    } finally {
      setGeneratingAI(false);
    }
  };

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
        const { error } = await supabase.storage
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
        const { error } = await supabase.storage
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
            <h2 className="text-xl sm:text-2xl font-bold">Actualités</h2>
            <p className="text-sm text-muted-foreground">Gérez les articles et publications avec l'IA</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-agri-green hover:bg-agri-green/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {editingArticle ? "Modifier l'article" : "Nouvel article avec IA"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content" className="text-xs sm:text-sm">
                    <Sparkles className="w-3 h-3 mr-1 hidden sm:inline" />
                    Contenu FR
                  </TabsTrigger>
                  <TabsTrigger value="content-en" className="text-xs sm:text-sm">EN</TabsTrigger>
                  <TabsTrigger value="media" className="text-xs sm:text-sm">
                    <Image className="w-3 h-3 mr-1 hidden sm:inline" />
                    Médias
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs sm:text-sm">Options</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  {/* AI Generation Section */}
                  <div className="bg-gradient-to-r from-agri-green/10 to-accent/10 rounded-lg p-4 border border-agri-green/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 className="w-5 h-5 text-agri-green" />
                      <span className="font-semibold text-sm">Assistant IA</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Écrivez votre idée ou contenu brut ci-dessous, puis cliquez sur "Générer avec IA" pour obtenir un article professionnel structuré avec titre, contenu formaté et hashtags.
                    </p>
                    <Button
                      type="button"
                      onClick={generateArticleWithAI}
                      disabled={generatingAI || !formData.content_fr.trim()}
                      className="bg-gradient-to-r from-agri-green to-green-600 hover:from-agri-green/90 hover:to-green-600/90"
                    >
                      {generatingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Générer l'article avec IA
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Titre (Français) *
                      {formData.title_fr && <Badge variant="secondary" className="text-xs">Généré</Badge>}
                    </Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Le titre sera généré par l'IA ou saisissez-le manuellement"
                      className="text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Extrait (Français)
                    </Label>
                    <Textarea
                      value={formData.excerpt_fr}
                      onChange={(e) => setFormData({ ...formData, excerpt_fr: e.target.value })}
                      placeholder="Résumé court pour l'aperçu (sera généré par l'IA)"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contenu / Idée (Français) *</Label>
                    <Textarea
                      value={formData.content_fr}
                      onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                      placeholder="Écrivez votre idée, notes ou contenu brut ici. L'IA le transformera en article professionnel structuré avec mise en forme, sous-titres et hashtags..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Astuce: Écrivez simplement vos idées, l'IA se charge de la mise en forme professionnelle.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="content-en" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      placeholder="Article title in English"
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
                      placeholder="Full article content in English (Markdown supported)"
                      rows={10}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-6">
                  {/* Images Upload */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Images (multiples)
                    </Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        disabled={uploadingImages}
                        className="w-full sm:w-auto"
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
                      <span className="text-xs text-muted-foreground">
                        Formats: JPG, PNG, WebP • Max: 10MB par image
                      </span>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img 
                              src={url} 
                              alt={`Image ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${
                                formData.featured_image === url ? 'ring-2 ring-agri-green ring-offset-2' : ''
                              }`}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 w-7 p-0"
                                onClick={() => setFormData({ ...formData, featured_image: url })}
                                title="Définir comme image principale"
                              >
                                ⭐
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 w-7 p-0"
                                onClick={() => setFormData({
                                  ...formData,
                                  images: formData.images.filter((_, i) => i !== index),
                                  featured_image: formData.featured_image === url ? "" : formData.featured_image
                                })}
                              >
                                ✕
                              </Button>
                            </div>
                            {formData.featured_image === url && (
                              <Badge className="absolute top-1 left-1 text-[10px]">
                                Principal
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Videos Upload */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Vidéos (multiples)
                    </Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("video-upload")?.click()}
                        disabled={uploadingVideos}
                        className="w-full sm:w-auto"
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
                      <span className="text-xs text-muted-foreground">
                        Formats: MP4, WebM • Max: 50MB par vidéo
                      </span>
                    </div>
                    {formData.videos.length > 0 && (
                      <div className="space-y-2">
                        {formData.videos.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate text-sm max-w-[200px]">{url.split('/').pop()}</span>
                            </div>
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
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="general">Général</option>
                        <option value="actualites">Actualités</option>
                        <option value="evenements">Événements</option>
                        <option value="partenariats">Partenariats</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="formation">Formation</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Auteur</Label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Nom de l'auteur"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Publier immédiatement</Label>
                        <p className="text-xs text-muted-foreground">L'article sera visible sur le site</p>
                      </div>
                      <Switch
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Article à la une</Label>
                        <p className="text-xs text-muted-foreground">Affiché en priorité sur la page d'accueil</p>
                      </div>
                      <Switch
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button 
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={!formData.title_fr || !formData.content_fr || saveMutation.isPending}
                  className="bg-agri-green hover:bg-agri-green/90 w-full sm:w-auto"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingArticle ? "Mettre à jour" : "Publier l'article"}
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
              <Card key={article.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {article.featured_image && (
                      <div className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0">
                        <img 
                          src={article.featured_image}
                          alt={article.title_fr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{article.title_fr}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {article.excerpt_fr || article.content_fr.substring(0, 120)}...
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views_count} vues
                            </span>
                            <Badge variant={article.is_published ? "default" : "secondary"} className="text-xs">
                              {article.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            {article.is_featured && (
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                                ⭐ À la une
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePublishMutation.mutate({ 
                              id: article.id, 
                              is_published: !article.is_published 
                            })}
                            title={article.is_published ? "Dépublier" : "Publier"}
                          >
                            {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(article)}
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer cet article définitivement ?")) {
                                deleteMutation.mutate(article.id);
                              }
                            }}
                            title="Supprimer"
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
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Aucun article pour le moment</p>
              <p className="text-sm mt-1">Créez votre premier article avec l'assistant IA</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNews;
