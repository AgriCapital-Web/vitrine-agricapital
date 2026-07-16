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
import { Download, Trash2, Plus, FileText, Users, MessageSquare, FileSignature, Upload, Link2, Image as ImageIcon } from "lucide-react";

const BUCKET = "dataroom";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_BY_TYPE: Record<string, string[]> = {
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  photo: ["image/jpeg", "image/png", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  presentation: ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
};

const emptyForm = { type: "document", title: "", description: "", category: "", file_url: "", video_url: "", platform_url: "", platform_type: "website", preview_title: "", preview_description: "", preview_image_url: "", screenshot_url: "", dynamic_fields: {} as Record<string, string>, source_file_name: "", source_file_size: 0, source_mime_type: "" };

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

  const load = async () => {
    const [p, s, c, i] = await Promise.all([
      supabase.from("dataroom_publications").select("*").order("created_at", { ascending: false }),
      supabase.from("dataroom_signatories").select("*").order("created_at", { ascending: false }),
      supabase.from("dataroom_comments").select("*, dataroom_signatories(full_name,email), dataroom_publications(title)").order("created_at", { ascending: false }),
      supabase.from("dataroom_intents").select("*, dataroom_signatories(full_name,email), dataroom_publications(title)").order("created_at", { ascending: false }),
    ]);
    setPubs(p.data ?? []); setSigs(s.data ?? []); setComments(c.data ?? []); setIntents(i.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const addPub = async () => {
    if (!form.title) return toast({ title: "Titre requis", variant: "destructive" });
    setSaving(true);
    let payload: any = { ...form };
    try {
      if (form.type === "platform") {
        if (!form.platform_url) return toast({ title: "URL plateforme requise", variant: "destructive" });
        const preview = makePlatformPreview(form.platform_url, form.platform_type);
        payload = { ...payload, platform_url: preview.normalizedUrl, preview_title: payload.preview_title || preview.previewTitle, preview_description: payload.preview_description || preview.previewDescription, preview_image_url: preview.previewImage, screenshot_url: preview.previewImage, cover_url: preview.previewImage, dynamic_fields: preview.dynamicFields };
      } else {
        if (!selectedFile) return toast({ title: "Téléversement requis", description: "Les URL externes sont désactivées : choisissez un fichier depuis le gestionnaire interne.", variant: "destructive" });
        const allowed = ALLOWED_BY_TYPE[form.type] || [];
        if (!allowed.includes(selectedFile.type)) return toast({ title: "Type de fichier non autorisé", description: allowed.join(", "), variant: "destructive" });
        if (selectedFile.size > MAX_FILE_SIZE) return toast({ title: "Fichier trop volumineux", description: "Taille maximale : 25 Mo", variant: "destructive" });
        const path = `${form.type}/${crypto.randomUUID()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, selectedFile, { contentType: selectedFile.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
        payload = { ...payload, file_url: path, video_url: null, platform_url: null, cover_url: selectedFile.type.startsWith("image/") ? signed?.signedUrl : null, source_file_name: selectedFile.name, source_file_size: selectedFile.size, source_mime_type: selectedFile.type };
      }
      const { error } = await supabase.from("dataroom_publications").insert(payload as any);
      if (error) throw error;
      toast({ title: "Publication créée" });
      setForm(emptyForm); setSelectedFile(null); load();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
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

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">AgriCapital Cloud — Data Room</h1>
          <p className="text-sm text-muted-foreground">Gestion du portail documentaire confidentiel</p>
        </div>

        <Tabs defaultValue="pubs">
          <TabsList>
            <TabsTrigger value="pubs"><FileText className="w-4 h-4 mr-2" />Publications</TabsTrigger>
            <TabsTrigger value="nda"><FileSignature className="w-4 h-4 mr-2" />NDA / Signataires</TabsTrigger>
            <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-2" />Commentaires</TabsTrigger>
            <TabsTrigger value="intents"><Users className="w-4 h-4 mr-2" />Intentions</TabsTrigger>
          </TabsList>

          <TabsContent value="pubs" className="space-y-4">
            <Card>
              <CardContent className="p-4 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={form.type} onChange={(e) => { setForm({ ...emptyForm, type: e.target.value }); setSelectedFile(null); }}>
                    <option value="document">Document</option><option value="photo">Photo</option>
                    <option value="video">Vidéo</option><option value="presentation">Présentation</option>
                    <option value="platform">Fiche Plateforme</option>
                  </select>
                </div>
                <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                {form.type === "platform" ? (<>
                  <div><Label>Type de plateforme</Label><select className="w-full h-10 rounded-md border bg-background px-3" value={form.platform_type} onChange={(e) => setForm({ ...form, platform_type: e.target.value })}><option value="website">Site web</option><option value="dashboard">Dashboard</option><option value="payment">Paiement</option><option value="document_portal">Portail documents</option><option value="communication">Communication</option><option value="other">Autre</option></select></div>
                  <div><Label>URL plateforme à analyser</Label><Input value={form.platform_url} onChange={(e) => setForm({ ...form, platform_url: e.target.value })} placeholder="https://..." /></div>
                  <div><Label>Titre aperçu</Label><Input value={form.preview_title} onChange={(e) => setForm({ ...form, preview_title: e.target.value })} /></div>
                  <div><Label>Description aperçu</Label><Input value={form.preview_description} onChange={(e) => setForm({ ...form, preview_description: e.target.value })} /></div>
                </>) : (<div className="md:col-span-2 rounded-md border border-dashed p-4 space-y-2"><Label className="flex items-center gap-2"><Upload className="w-4 h-4" />Téléversement interne obligatoire</Label><Input type="file" accept={(ALLOWED_BY_TYPE[form.type] || []).join(",")} onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} /><p className="text-xs text-muted-foreground">Types autorisés : {(ALLOWED_BY_TYPE[form.type] || []).join(", ")} · max 25 Mo</p>{selectedFile && <p className="text-xs font-medium">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</p>}</div>)}
                <Button onClick={addPub} disabled={saving}><Plus className="w-4 h-4 mr-2" />Ajouter la publication</Button>
              </CardContent>
            </Card>
            <div className="grid gap-2">
              {pubs.map((p) => (
                <Card key={p.id}><CardContent className="p-3 flex justify-between items-center">
                  <div><div className="font-semibold text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">{p.type === "platform" ? <Link2 className="w-3 h-3" /> : p.cover_url ? <ImageIcon className="w-3 h-3" /> : null}{p.type} · {p.category ?? "—"} · {p.views_count} vues{p.source_file_name ? ` · ${p.source_file_name}` : ""}</div></div>
                  <Button variant="ghost" size="sm" onClick={() => delPub(p.id)}><Trash2 className="w-4 h-4" /></Button>
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nda">
            <div className="grid gap-2">
              {sigs.map((s) => (
                <Card key={s.id}><CardContent className="p-3 flex justify-between items-center gap-3">
                  <div className="min-w-0"><div className="font-semibold text-sm truncate">{s.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.email} · {s.profile_type} · {new Date(s.nda_signed_at).toLocaleString()}</div></div>
                  {s.id_document_url && <Button variant="ghost" size="sm" title="Pièce d'identité"><Download className="w-4 h-4" /></Button>}
                </CardContent></Card>
              ))}
              {sigs.length === 0 && <p className="text-sm text-muted-foreground">Aucun NDA signé pour le moment.</p>}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="grid gap-2">
              {comments.map((c: any) => (
                <Card key={c.id}><CardContent className="p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">{c.dataroom_signatories?.full_name} · {c.dataroom_publications?.title}</div>
                  <div className="text-sm">{c.body}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant={c.approved ? "default" : "outline"} onClick={() => approveComment(c.id, !c.approved)}>{c.approved ? "Approuvé" : "Approuver"}</Button>
                  </div>
                </CardContent></Card>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground">Aucun commentaire.</p>}
            </div>
          </TabsContent>

          <TabsContent value="intents">
            <div className="grid gap-2">
              {intents.map((i: any) => (
                <Card key={i.id}><CardContent className="p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">{i.dataroom_signatories?.full_name} · {i.intent_type} · {new Date(i.created_at).toLocaleString()}</div>
                  <div className="text-sm">{i.message}</div>
                </CardContent></Card>
              ))}
              {intents.length === 0 && <p className="text-sm text-muted-foreground">Aucune intention.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
