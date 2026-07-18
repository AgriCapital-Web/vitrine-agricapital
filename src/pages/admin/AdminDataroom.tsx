import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Download, Trash2, Plus, FileText, Users, MessageSquare, 
  FileSignature, Upload, Link2, Image as ImageIcon,
  Edit, Save, X, Eye, EyeOff, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BUCKET = "dataroom";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_BY_TYPE: Record<string, string[]> = {
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  photo: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  presentation: ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
};

const emptyForm = { 
  type: "document", 
  title: "", 
  description: "", 
  category: "", 
  file_url: "", 
  video_url: "", 
  platform_url: "", 
  platform_type: "website", 
  preview_title: "", 
  preview_description: "", 
  preview_image_url: "", 
  screenshot_url: "", 
  dynamic_fields: {} as Record<string, string>, 
  source_file_name: "", 
  source_file_size: 0, 
  source_mime_type: "",
  is_published: true,
  visibility: "public"
};

const makePlatformPreview = (url: string, type: string) => {
  const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  const host = parsed.hostname.replace(/^www\./, "");
  const title = host.split(".")[0]?.replace(/-/g, " ") || "Plateforme";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0f4f2f"/><text x="70" y="150" fill="#f59e0b" font-size="44" font-family="Arial" font-weight="700">AgriCapital Cloud</text><text x="70" y="300" fill="#fff" font-size="72" font-family="Arial" font-weight="800">${host}</text><text x="70" y="390" fill="#d9efe2" font-size="34" font-family="Arial">${type}</text></svg>`;
  return {
    normalizedUrl: parsed.toString(),
    previewTitle: title.charAt(0).toUpperCase() + title.slice(1),
    previewDescription: `Aperçu sécurisé de la plateforme ${host}`,
    previewImage: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    dynamicFields: { host, protocol: parsed.protocol.replace(":", ""), path: parsed.pathname, analyzed_at: new Date().toISOString() },
  };
};

export default function AdminDataroom() {
  const [pubs, setPubs] = useState<any[]>([]);
  const [sigs, setSigs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const [p, s, c, i] = await Promise.all([
      supabase.from("dataroom_publications").select("*").order("created_at", { ascending: false }),
      supabase.from("dataroom_signatories").select("*").order("created_at", { ascending: false }),
      supabase.from("dataroom_comments").select("*, dataroom_signatories(full_name,email), dataroom_publications(title)").order("created_at", { ascending: false }),
      supabase.from("dataroom_intents").select("*, dataroom_signatories(full_name,email), dataroom_publications(title)").order("created_at", { ascending: false }),
    ]);
    setPubs(p.data ?? []); 
    setSigs(s.data ?? []); 
    setComments(c.data ?? []); 
    setIntents(i.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title) return toast({ title: "Titre requis", variant: "destructive" });
    setSaving(true);
    let payload: any = { ...form };
    
    try {
      if (editingId) {
        // Update
        const { error } = await supabase.from("dataroom_publications").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Publication mise à jour" });
      } else {
        // Create
        if (form.type === "platform") {
          if (!form.platform_url) return toast({ title: "URL plateforme requise", variant: "destructive" });
          const preview = makePlatformPreview(form.platform_url, form.platform_type);
          payload = { 
            ...payload, 
            platform_url: preview.normalizedUrl, 
            preview_title: payload.preview_title || preview.previewTitle, 
            preview_description: payload.preview_description || preview.previewDescription, 
            preview_image_url: preview.previewImage, 
            screenshot_url: preview.previewImage, 
            cover_url: preview.previewImage, 
            dynamic_fields: preview.dynamicFields 
          };
        } else {
          if (!selectedFile) return toast({ title: "Téléversement requis", description: "Veuillez choisir un fichier.", variant: "destructive" });
          const allowed = ALLOWED_BY_TYPE[form.type] || [];
          if (!allowed.includes(selectedFile.type)) return toast({ title: "Type de fichier non autorisé", variant: "destructive" });
          if (selectedFile.size > MAX_FILE_SIZE) return toast({ title: "Fichier trop volumineux", description: "Max 25 Mo", variant: "destructive" });
          
          const path = `${form.type}/${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, selectedFile, { contentType: selectedFile.type, upsert: false });
          if (uploadError) throw uploadError;
          
          const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
          payload = { 
            ...payload, 
            file_url: path, 
            video_url: null, 
            platform_url: null, 
            cover_url: selectedFile.type.startsWith("image/") ? signed?.signedUrl : null, 
            source_file_name: selectedFile.name, 
            source_file_size: selectedFile.size, 
            source_mime_type: selectedFile.type 
          };
        }
        const { error } = await supabase.from("dataroom_publications").insert(payload);
        if (error) throw error;
        toast({ title: "Publication créée" });
      }
      
      setForm(emptyForm); 
      setSelectedFile(null); 
      setEditingId(null);
      load();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: any) => {
    setForm({
      ...emptyForm,
      ...p
    });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
  };

  const delPub = async (id: string) => {
    if (!confirm("Supprimer cette publication ?")) return;
    await supabase.from("dataroom_publications").delete().eq("id", id);
    load();
  };

  const approveComment = async (id: string, v: boolean) => {
    await supabase.from("dataroom_comments").update({ approved: v }).eq("id", id);
    load();
  };

  const downloadFile = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
    if (error) return toast({ title: "Erreur de téléchargement", description: error.message, variant: "destructive" });
    window.open(data.signedUrl, '_blank');
  };

  return (
    <AdminLayout title="AgriCapital Cloud — Data Room">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AgriCapital Cloud — Data Room</h1>
            <p className="text-sm text-muted-foreground">Gestion du portail documentaire confidentiel</p>
          </div>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-2" /> Annuler l'édition
            </Button>
          )}
        </div>

        <Tabs defaultValue="pubs">
          <TabsList className="mb-4">
            <TabsTrigger value="pubs"><FileText className="w-4 h-4 mr-2" />Publications</TabsTrigger>
            <TabsTrigger value="nda"><FileSignature className="w-4 h-4 mr-2" />NDA / Signataires</TabsTrigger>
            <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-2" />Commentaires</TabsTrigger>
            <TabsTrigger value="intents"><Users className="w-4 h-4 mr-2" />Intentions</TabsTrigger>
          </TabsList>

          <TabsContent value="pubs" className="space-y-6">
            <Card className={editingId ? "border-primary bg-primary/5" : ""}>
              <CardContent className="p-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {editingId ? "Modifier la publication" : "Nouvelle publication"}
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setForm({ ...form, is_published: !form.is_published })}
                      className={form.is_published ? "text-green-600" : "text-amber-600"}
                    >
                      {form.is_published ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                      {form.is_published ? "Publié" : "Brouillon"}
                    </Button>
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <Label>Type</Label>
                    <select 
                      className="w-full h-10 rounded-md border bg-background px-3" 
                      value={form.type} 
                      onChange={(e) => { setForm({ ...emptyForm, type: e.target.value }); setSelectedFile(null); }}
                    >
                      <option value="document">Document</option>
                      <option value="photo">Photo</option>
                      <option value="video">Vidéo</option>
                      <option value="presentation">Présentation</option>
                      <option value="platform">Fiche Plateforme</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <Label>Catégorie</Label>
                  <Input 
                    placeholder="Ex: Finance, Juridique, Technique..."
                    value={form.category || ""} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })} 
                  />
                </div>
                
                <div className={editingId ? "md:col-span-1" : "md:col-span-2"}>
                  <Label>Titre *</Label>
                  <Input 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={form.description || ""} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    placeholder="Description détaillée visible par les investisseurs"
                  />
                </div>

                {form.type === "platform" ? (
                  <>
                    <div>
                      <Label>Type de plateforme</Label>
                      <select 
                        className="w-full h-10 rounded-md border bg-background px-3" 
                        value={form.platform_type || "website"} 
                        onChange={(e) => setForm({ ...form, platform_type: e.target.value })}
                      >
                        <option value="website">Site web</option>
                        <option value="dashboard">Dashboard</option>
                        <option value="payment">Paiement</option>
                        <option value="document_portal">Portail documents</option>
                        <option value="communication">Communication</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div>
                      <Label>URL plateforme</Label>
                      <Input 
                        value={form.platform_url || ""} 
                        onChange={(e) => setForm({ ...form, platform_url: e.target.value })} 
                        placeholder="https://..." 
                      />
                    </div>
                  </>
                ) : !editingId ? (
                  <div className="md:col-span-2 rounded-md border border-dashed p-4 space-y-2 bg-muted/50">
                    <Label className="flex items-center gap-2"><Upload className="w-4 h-4" />Téléversement obligatoire</Label>
                    <Input 
                      type="file" 
                      accept={(ALLOWED_BY_TYPE[form.type] || []).join(",")} 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Types autorisés : {(ALLOWED_BY_TYPE[form.type] || []).join(", ")} · max 25 Mo
                    </p>
                    {selectedFile && <p className="text-xs font-medium text-primary">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</p>}
                  </div>
                ) : (
                  <div className="md:col-span-2 p-3 bg-muted rounded-md text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Fichier : {form.source_file_name || "Lien externe"}</span>
                    </div>
                    {form.file_url && (
                      <Button variant="ghost" size="sm" onClick={() => downloadFile(form.file_url)}>
                        <Download className="w-3 h-3 mr-2" /> Voir/Télécharger
                      </Button>
                    )}
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingId && (
                    <Button variant="ghost" onClick={cancelEdit}>Annuler</Button>
                  )}
                  <Button onClick={handleSave} disabled={saving} className="min-w-[150px]">
                    {saving ? "Enregistrement..." : editingId ? <><Save className="w-4 h-4 mr-2" />Enregistrer</> : <><Plus className="w-4 h-4 mr-2" />Ajouter</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Liste des publications
                <Badge variant="outline">{pubs.length}</Badge>
              </h3>
              {pubs.map((p) => (
                <Card key={p.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {p.type === "platform" ? <Link2 className="w-6 h-6 text-blue-500" /> : 
                         p.type === "photo" ? <ImageIcon className="w-6 h-6 text-green-500" /> :
                         p.type === "video" ? <ImageIcon className="w-6 h-6 text-purple-500" /> :
                         <FileText className="w-6 h-6 text-amber-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{p.title}</span>
                          {!p.is_published && <Badge variant="secondary" className="text-[10px] h-4">BROUILLON</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-1">
                          <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{p.type}</span>
                          <span>{p.category || "Sans catégorie"}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views_count} vues</span>
                          {p.source_file_name && <span className="truncate max-w-[150px] italic">({p.source_file_name})</span>}
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0">
                      {p.file_url && (
                        <Button variant="ghost" size="icon" onClick={() => downloadFile(p.file_url)} title="Télécharger">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {p.platform_url && (
                        <Button variant="ghost" size="icon" asChild title="Ouvrir">
                          <a href={p.platform_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => startEdit(p)} title="Modifier">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => delPub(p.id)} title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pubs.length === 0 && (
                <div className="text-center py-12 border rounded-lg border-dashed">
                  <p className="text-muted-foreground text-sm">Aucune publication trouvée.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="nda">
            <div className="grid gap-2">
              {sigs.map((s) => (
                <Card key={s.id}><CardContent className="p-3 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{s.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.email} · {s.profile_type} · {new Date(s.nda_signed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {s.id_document_url && (
                      <Button variant="outline" size="sm" onClick={() => downloadFile(s.id_document_url)}>
                        <Download className="w-4 h-4 mr-2" /> ID
                      </Button>
                    )}
                  </div>
                </CardContent></Card>
              ))}
              {sigs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun NDA signé pour le moment.</p>}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid gap-2">
              {comments.map((c: any) => (
                <Card key={c.id}><CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-xs text-muted-foreground font-medium">
                      {c.dataroom_signatories?.full_name} sur <span className="text-foreground">{c.dataroom_publications?.title}</span>
                    </div>
                    <Badge variant={c.approved ? "default" : "outline"} className={c.approved ? "bg-green-500 hover:bg-green-600" : ""}>
                      {c.approved ? "Approuvé" : "En attente"}
                    </Badge>
                  </div>
                  <div className="text-sm border-l-2 pl-3 py-1 italic">{c.body}</div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant={c.approved ? "outline" : "default"} onClick={() => approveComment(c.id, !c.approved)}>
                      {c.approved ? "Retirer l'approbation" : "Approuver le commentaire"}
                    </Button>
                  </div>
                </CardContent></Card>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun commentaire.</p>}
            </div>
          </TabsContent>

          <TabsContent value="intents">
            <div className="grid gap-2">
              {intents.map((i: any) => (
                <Card key={i.id}><CardContent className="p-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="text-xs text-muted-foreground font-medium">
                      {i.dataroom_signatories?.full_name} · {new Date(i.created_at).toLocaleString()}
                    </div>
                    <Badge>{i.intent_type}</Badge>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1">Cible : {i.dataroom_publications?.title || "Général"}</div>
                  <div className="text-sm bg-muted p-2 rounded">{i.message}</div>
                </CardContent></Card>
              ))}
              {intents.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune intention manifestée.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
