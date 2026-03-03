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
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Image, Video, Calendar, Loader2, Sparkles, Wand2, Hash, FileText, Globe, Languages, ImagePlus, Clapperboard } from "lucide-react";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";

// Enhanced markdown to HTML converter
const markdownToHtml = (md: string): string => {
  let html = md
    // Tables
    .replace(/^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, body) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const rows = body.trim().split('\n').map((row: string) => 
        row.split('|').map((c: string) => c.trim()).filter(Boolean)
      );
      return `<table class="w-full border-collapse my-4"><thead><tr>${headers.map((h: string) => `<th class="border border-border bg-muted px-3 py-2 text-left font-semibold">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row: string[]) => `<tr>${row.map((c: string) => `<td class="border border-border px-3 py-2">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    })
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-6 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-4">$1</h1>')
    // Text formatting
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 mb-1">$2</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 list-disc">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-border">')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/50 rounded-r">$1</blockquote>')
    // Paragraphs - double newlines
    .replace(/\n{2,}/g, '</p><p class="mb-4 leading-relaxed">')
    // Regular lines
    .replace(/^(?!<[hultbdo]|<li|<hr|<block|<table)(.+)$/gm, '<p class="mb-4 leading-relaxed">$1</p>')
    .replace(/<p class="mb-4 leading-relaxed"><\/p>/g, '');

  return html;
};

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
  const [translating, setTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState("");
  
  const [formData, setFormData] = useState({
    slug: "",
    title_fr: "",
    title_en: "",
    title_ar: "",
    title_es: "",
    title_de: "",
    title_zh: "",
    content_fr: "",
    content_en: "",
    content_ar: "",
    content_es: "",
    content_de: "",
    content_zh: "",
    excerpt_fr: "",
    excerpt_en: "",
    excerpt_ar: "",
    excerpt_es: "",
    excerpt_de: "",
    excerpt_zh: "",
    featured_image: "",
    images: [] as string[],
    videos: [] as string[],
    category: "general",
    is_published: false,
    is_featured: false,
    author: "AgriCapital"
  });

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
        const { error } = await supabase.from("news").update(payload).eq("id", editingArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert([payload]);
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

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("news")
        .update({ is_published, published_at: is_published ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success("Statut mis à jour");
    }
  });

  // Auto-translate to all languages
  const translateToAllLanguages = async () => {
    if (!formData.title_fr || !formData.content_fr) {
      toast.error("L'article en français est requis avant la traduction");
      return;
    }

    setTranslating(true);
    const languages = [
      { code: 'en', name: 'Anglais' },
      { code: 'ar', name: 'Arabe' },
      { code: 'es', name: 'Espagnol' },
      { code: 'de', name: 'Allemand' },
      { code: 'zh', name: 'Chinois' },
    ];

    const plainContent = formData.content_fr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    for (const lang of languages) {
      setTranslationProgress(`Traduction en ${lang.name}...`);
      try {
        const { data, error } = await supabase.functions.invoke('translate-article', {
          body: {
            title: formData.title_fr,
            content: plainContent.slice(0, 4000),
            excerpt: formData.excerpt_fr || "",
            targetLanguage: lang.code,
          }
        });

        if (error) throw error;

        if (data) {
          setFormData(prev => ({
            ...prev,
            [`title_${lang.code}`]: data.title || prev[`title_${lang.code}` as keyof typeof prev],
            [`content_${lang.code}`]: data.content ? markdownToHtml(data.content) : prev[`content_${lang.code}` as keyof typeof prev],
            [`excerpt_${lang.code}`]: data.excerpt || prev[`excerpt_${lang.code}` as keyof typeof prev],
          }));
        }
      } catch (error) {
        console.error(`Translation error (${lang.code}):`, error);
        toast.error(`Erreur traduction ${lang.name}`);
      }
    }

    setTranslating(false);
    setTranslationProgress("");
    toast.success("Traduction automatique terminée pour 5 langues !");
  };

  // AI Generation function - improved prompt
  const generateArticleWithAI = async () => {
    if (!formData.content_fr.trim()) {
      toast.error("Veuillez entrer une idée ou du contenu brut à développer");
      return;
    }

    setGeneratingAI(true);
    const plainText = formData.content_fr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Tu es un rédacteur en chef professionnel pour AgriCapital, une entreprise sociale ivoirienne pilotant le programme "Palmier Solidaire".

MISSION : Transformer cette idée brute en un article de presse professionnel, moderne, bien structuré et engageant.

═══ CONTEXTE ═══
- AgriCapital = entreprise SOCIALE (pas une ONG, pas capitaliste)
- Ton : professionnel, chaleureux, inspirant, orienté impact social
- Public cible : partenaires, investisseurs sociaux, communautés rurales
- JAMAIS mentionner de montants financiers (confidentialité)
- Orthographe et grammaire irréprochables

═══ IDÉE À DÉVELOPPER ═══
"${plainText}"

═══ STRUCTURE ATTENDUE ═══
Génère un article professionnel avec :

1. **TITRE** : En MAJUSCULES, percutant, max 80 caractères
2. **CONTENU** en Markdown :
   - **Introduction** : 2-3 phrases d'accroche en italique (*texte*)
   - **Développement** : 3-5 paragraphes bien séparés avec sous-titres (## ou ###)
   - Utilise des **listes à puces** pour les points clés
   - Inclus un **tableau Markdown** si pertinent (comparaisons, données, étapes)
   - **Paragraphes aérés** : chaque paragraphe fait 3-4 phrases max, séparés par des lignes vides
   - **Citations** ou points forts en gras
   - **Conclusion** inspirante avec appel à l'action
3. **EXTRAIT** : Résumé accrocheur de 2-3 phrases
4. **HASHTAGS** : 5-7 hashtags pertinents
5. **CATÉGORIE** : une parmi [actualites, evenements, partenariats, agriculture, formation, general]

═══ FORMAT JSON STRICT ═══
{
  "title": "TITRE EN MAJUSCULES",
  "content": "Contenu complet en Markdown avec paragraphes bien espacés, sous-titres, listes, tableaux...",
  "excerpt": "Extrait court et accrocheur",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "actualites"
}`
            }
          ],
          language: 'fr'
        }
      });

      if (response.error) throw response.error;

      let fullText = '';
      const reader = response.data.getReader?.();
      
      if (reader) {
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ') || line.trim() === '') continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullText += content;
              } catch { /* skip partial */ }
            }
          }
        }
      } else {
        fullText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      }

      if (fullText) {
        try {
          const jsonMatch = fullText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const contentWithHashtags = parsed.content + 
              (parsed.hashtags ? `\n\n---\n\n${parsed.hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')}` : '');
            
            const htmlContent = markdownToHtml(contentWithHashtags);
            
            const newFormData = {
              ...formData,
              title_fr: parsed.title || formData.title_fr,
              content_fr: htmlContent,
              excerpt_fr: parsed.excerpt || formData.excerpt_fr,
              category: parsed.category || formData.category,
            };
            setFormData(newFormData);
            toast.success("Article généré ! Traduction automatique en cours...");

            // Auto-translate to all languages after generation
            setTranslating(true);
            const langs = [
              { code: 'en', name: 'Anglais' },
              { code: 'ar', name: 'Arabe' },
              { code: 'es', name: 'Espagnol' },
              { code: 'de', name: 'Allemand' },
              { code: 'zh', name: 'Chinois' },
            ];
            const plainForTranslation = (parsed.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const titleForTranslation = parsed.title || newFormData.title_fr;
            const excerptForTranslation = parsed.excerpt || newFormData.excerpt_fr || '';

            for (const lang of langs) {
              setTranslationProgress(`Traduction en ${lang.name}...`);
              try {
                const { data: trData, error: trError } = await supabase.functions.invoke('translate-article', {
                  body: {
                    title: titleForTranslation,
                    content: plainForTranslation.slice(0, 4000),
                    excerpt: excerptForTranslation,
                    targetLanguage: lang.code,
                  }
                });
                if (trError) throw trError;
                if (trData) {
                  setFormData(prev => ({
                    ...prev,
                    [`title_${lang.code}`]: trData.title || prev[`title_${lang.code}` as keyof typeof prev],
                    [`content_${lang.code}`]: trData.content ? markdownToHtml(trData.content) : prev[`content_${lang.code}` as keyof typeof prev],
                    [`excerpt_${lang.code}`]: trData.excerpt || prev[`excerpt_${lang.code}` as keyof typeof prev],
                  }));
                }
              } catch (trErr) {
                console.error(`Auto-translation error (${lang.code}):`, trErr);
              }
            }
            setTranslating(false);
            setTranslationProgress("");
            toast.success("Article généré et traduit en 5 langues !");
          } else {
            setFormData(prev => ({ ...prev, content_fr: markdownToHtml(fullText) }));
            toast.success("Contenu généré, veuillez ajouter un titre");
          }
        } catch {
          setFormData(prev => ({ ...prev, content_fr: markdownToHtml(fullText) }));
          toast.success("Contenu enrichi, vérifiez la mise en forme");
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error("Erreur lors de la génération IA");
    } finally {
      setGeneratingAI(false);
    }
  };

  // AI Image Generation
  const generateAIImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Décrivez l'image à générer");
      return;
    }
    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article-image', {
        body: { prompt: imagePrompt, quality: "high" }
      });
      if (error) throw error;
      if (data?.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
          featured_image: prev.featured_image || data.url,
        }));
        setImagePrompt("");
        toast.success("Image IA générée et ajoutée !");
      }
    } catch (error: any) {
      console.error("AI image error:", error);
      toast.error(error?.message || "Erreur lors de la génération d'image");
    } finally {
      setGeneratingImage(false);
    }
  };

  // AI Video Generation (placeholder - uses prompt description)
  const generateAIVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error("Décrivez la vidéo à générer");
      return;
    }
    setGeneratingVideo(true);
    toast.info("Génération vidéo en cours... Cela peut prendre quelques minutes.");
    try {
      // Generate a still image first, then we note it as a video concept
      const { data, error } = await supabase.functions.invoke('generate-article-image', {
        body: { prompt: `Cinematic still frame for video: ${videoPrompt}. Professional documentary style, Ivory Coast agriculture context.`, quality: "high" }
      });
      if (error) throw error;
      if (data?.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
        setVideoPrompt("");
        toast.success("Image de couverture vidéo générée ! La génération vidéo complète sera disponible prochainement.");
      }
    } catch (error: any) {
      console.error("AI video error:", error);
      toast.error(error?.message || "Erreur lors de la génération");
    } finally {
      setGeneratingVideo(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "", title_fr: "", title_en: "", title_ar: "", title_es: "", title_de: "", title_zh: "",
      content_fr: "", content_en: "", content_ar: "", content_es: "", content_de: "", content_zh: "",
      excerpt_fr: "", excerpt_en: "", excerpt_ar: "", excerpt_es: "", excerpt_de: "", excerpt_zh: "",
      featured_image: "", images: [], videos: [],
      category: "general", is_published: false, is_featured: false, author: "AgriCapital"
    });
    setEditingArticle(null);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    const a = article as any;
    setFormData({
      slug: a.slug, title_fr: a.title_fr, title_en: a.title_en || "", title_ar: a.title_ar || "",
      title_es: a.title_es || "", title_de: a.title_de || "", title_zh: a.title_zh || "",
      content_fr: a.content_fr, content_en: a.content_en || "", content_ar: a.content_ar || "",
      content_es: a.content_es || "", content_de: a.content_de || "", content_zh: a.content_zh || "",
      excerpt_fr: a.excerpt_fr || "", excerpt_en: a.excerpt_en || "", excerpt_ar: a.excerpt_ar || "",
      excerpt_es: a.excerpt_es || "", excerpt_de: a.excerpt_de || "", excerpt_zh: a.excerpt_zh || "",
      featured_image: a.featured_image || "",
      images: Array.isArray(a.images) ? a.images : [],
      videos: Array.isArray(a.videos) ? a.videos : [],
      category: a.category, is_published: a.is_published, is_featured: a.is_featured, author: a.author
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
        const { error } = await supabase.storage.from("media").upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
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
        const { error } = await supabase.storage.from("media").upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...uploadedUrls] }));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Actualités & Blogs</h2>
            <p className="text-sm text-muted-foreground">Éditeur IA avancé avec traduction automatique multilingue</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-agri-green hover:bg-agri-green/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {editingArticle ? "Modifier l'article" : "Nouvel article IA"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content" className="text-xs sm:text-sm">
                    <Sparkles className="w-3 h-3 mr-1 hidden sm:inline" />
                    Contenu FR
                  </TabsTrigger>
                  <TabsTrigger value="translations" className="text-xs sm:text-sm">
                    <Languages className="w-3 h-3 mr-1 hidden sm:inline" />
                    Traductions
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-xs sm:text-sm">
                    <Image className="w-3 h-3 mr-1 hidden sm:inline" />
                    Médias
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs sm:text-sm">Options</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  {/* AI Generation Section */}
                  <div className="bg-gradient-to-r from-agri-green/10 to-accent/10 rounded-xl p-4 border border-agri-green/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Wand2 className="w-5 h-5 text-agri-green" />
                      <span className="font-semibold text-sm">Assistant IA Avancé</span>
                      <Badge variant="secondary" className="text-[10px]">Gemini 3</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Écrivez votre idée ci-dessous. L'IA génère un article professionnel structuré avec sous-titres, tableaux, listes et hashtags. Puis traduisez automatiquement en 5 langues.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        onClick={generateArticleWithAI}
                        disabled={generatingAI || translating || !formData.content_fr.trim()}
                        className="bg-gradient-to-r from-agri-green to-green-600 hover:from-agri-green/90 hover:to-green-600/90"
                      >
                        {generatingAI ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-2" />Générer avec IA</>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={translateToAllLanguages}
                        disabled={translating || generatingAI || !formData.title_fr || !formData.content_fr}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        {translating ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{translationProgress}</>
                        ) : (
                          <><Globe className="w-4 h-4 mr-2" />Traduire en 5 langues</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Titre (Français) *
                      {formData.title_fr && <Badge variant="secondary" className="text-xs">✓</Badge>}
                    </Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Le titre sera généré par l'IA ou saisissez-le manuellement"
                      className="text-base font-bold"
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
                      className="italic"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contenu / Idée (Français) *</Label>
                    <WYSIWYGEditor
                      content={formData.content_fr}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_fr: content }))}
                      placeholder="Écrivez votre idée ici. L'IA la transformera en article professionnel..."
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Écrivez simplement vos idées, l'IA se charge de la mise en forme professionnelle avec sous-titres, tableaux et paragraphes aérés.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="translations" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Traductions multilingues</h3>
                      <p className="text-xs text-muted-foreground">Générées automatiquement par l'IA ou saisissez manuellement</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={translateToAllLanguages}
                      disabled={translating || !formData.title_fr || !formData.content_fr}
                    >
                      {translating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Globe className="w-3 h-3 mr-1" />}
                      Tout traduire
                    </Button>
                  </div>

                  {[
                    { code: 'en', label: '🇬🇧 English', flag: 'EN' },
                    { code: 'ar', label: '🇸🇦 العربية', flag: 'AR' },
                    { code: 'es', label: '🇪🇸 Español', flag: 'ES' },
                    { code: 'de', label: '🇩🇪 Deutsch', flag: 'DE' },
                    { code: 'zh', label: '🇨🇳 中文', flag: 'ZH' },
                  ].map(lang => (
                    <details key={lang.code} className="border rounded-lg">
                      <summary className="p-3 cursor-pointer hover:bg-muted/50 flex items-center justify-between">
                        <span className="font-medium text-sm">{lang.label}</span>
                        {formData[`title_${lang.code}` as keyof typeof formData] ? (
                          <Badge variant="secondary" className="text-[10px]">✓ Traduit</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Vide</Badge>
                        )}
                      </summary>
                      <div className="p-3 space-y-3 border-t">
                        <div className="space-y-1">
                          <Label className="text-xs">Titre ({lang.flag})</Label>
                          <Input
                            value={formData[`title_${lang.code}` as keyof typeof formData] as string}
                            onChange={(e) => setFormData(prev => ({ ...prev, [`title_${lang.code}`]: e.target.value }))}
                            placeholder={`Title in ${lang.label}`}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Extrait ({lang.flag})</Label>
                          <Textarea
                            value={formData[`excerpt_${lang.code}` as keyof typeof formData] as string}
                            onChange={(e) => setFormData(prev => ({ ...prev, [`excerpt_${lang.code}`]: e.target.value }))}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Contenu ({lang.flag})</Label>
                          <Textarea
                            value={formData[`content_${lang.code}` as keyof typeof formData] as string}
                            onChange={(e) => setFormData(prev => ({ ...prev, [`content_${lang.code}`]: e.target.value }))}
                            rows={6}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </details>
                  ))}
                </TabsContent>
                
                <TabsContent value="media" className="space-y-6">
                  {/* AI Image Generation */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-300/30">
                    <div className="flex items-center gap-2 mb-3">
                      <ImagePlus className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-sm">Génération d'images IA</span>
                      <Badge variant="secondary" className="text-[10px]">Gemini Image</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Décrivez l'image souhaitée. L'IA génère une photo ultra-réaliste dans le contexte ivoirien et agricole.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Ex: Pépinière de palmiers à huile à Daloa avec des ouvriers agricoles"
                        className="flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={generateAIImage}
                        disabled={generatingImage || !imagePrompt.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shrink-0"
                      >
                        {generatingImage ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</>
                        ) : (
                          <><ImagePlus className="w-4 h-4 mr-2" />Générer</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* AI Video Generation */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-300/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Clapperboard className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-sm">Génération vidéo IA</span>
                      <Badge variant="secondary" className="text-[10px]">Bientôt</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Décrivez la scène. L'IA génère une image cinématique de couverture. La vidéo complète sera bientôt disponible.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Ex: Vue aérienne d'une plantation de palmiers au coucher du soleil"
                        className="flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={generateAIVideo}
                        disabled={generatingVideo || !videoPrompt.trim()}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shrink-0"
                      >
                        {generatingVideo ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</>
                        ) : (
                          <><Clapperboard className="w-4 h-4 mr-2" />Générer</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Upload Images */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Images ({formData.images.length})
                    </Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button
                        type="button" variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        disabled={uploadingImages}
                        className="w-full sm:w-auto"
                      >
                        {uploadingImages ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Importer des images
                      </Button>
                      <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      <span className="text-xs text-muted-foreground">JPG, PNG, WebP • Max 10MB</span>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img src={url} alt={`Image ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${formData.featured_image === url ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0"
                                onClick={() => setFormData({ ...formData, featured_image: url })} title="Image principale">⭐</Button>
                              <Button size="sm" variant="destructive" className="h-7 w-7 p-0"
                                onClick={() => setFormData({
                                  ...formData,
                                  images: formData.images.filter((_, i) => i !== index),
                                  featured_image: formData.featured_image === url ? "" : formData.featured_image
                                })}>✕</Button>
                            </div>
                            {formData.featured_image === url && <Badge className="absolute top-1 left-1 text-[10px]">Principal</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Videos */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2"><Video className="w-4 h-4" />Vidéos ({formData.videos.length})</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Button type="button" variant="outline"
                        onClick={() => document.getElementById("video-upload")?.click()}
                        disabled={uploadingVideos} className="w-full sm:w-auto">
                        {uploadingVideos ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Importer des vidéos
                      </Button>
                      <input id="video-upload" type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
                      <span className="text-xs text-muted-foreground">MP4, WebM • Max 50MB</span>
                    </div>
                    {formData.videos.length > 0 && (
                      <div className="space-y-2">
                        {formData.videos.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate text-sm max-w-[200px]">{url.split('/').pop()}</span>
                            </div>
                            <Button size="sm" variant="destructive"
                              onClick={() => setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== index) })}>
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
                      <select value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background">
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
                      <Input value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Nom de l'auteur" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Publier immédiatement</Label>
                        <p className="text-xs text-muted-foreground">Visible sur le site</p>
                      </div>
                      <Switch checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Article à la une</Label>
                        <p className="text-xs text-muted-foreground">Priorité sur la page d'accueil</p>
                      </div>
                      <Switch checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Annuler</Button>
                <Button 
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={!formData.title_fr || !formData.content_fr || saveMutation.isPending}
                  className="bg-agri-green hover:bg-agri-green/90 w-full sm:w-auto">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {article.featured_image && (
                      <div className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0">
                        <img src={article.featured_image} alt={article.title_fr} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{article.title_fr}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {article.excerpt_fr || article.content_fr.replace(/<[^>]*>/g, '').substring(0, 120)}...
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />{article.views_count} vues
                            </span>
                            <Badge variant={article.is_published ? "default" : "secondary"} className="text-xs">
                              {article.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            {article.is_featured && (
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">⭐ À la une</Badge>
                            )}
                            {(article as any).title_en && (
                              <Badge variant="outline" className="text-[10px]">🌍 Multilingue</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost"
                            onClick={() => togglePublishMutation.mutate({ id: article.id, is_published: !article.is_published })}>
                            {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(article)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                            onClick={() => { if (confirm("Supprimer cet article ?")) deleteMutation.mutate(article.id); }}>
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
