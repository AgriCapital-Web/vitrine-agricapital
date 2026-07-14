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
import { Download, Trash2, Plus, FileText, Users, MessageSquare, FileSignature } from "lucide-react";

export default function AdminDataroom() {
  const [pubs, setPubs] = useState<any[]>([]);
  const [sigs, setSigs] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [form, setForm] = useState({ type: "document", title: "", description: "", category: "", file_url: "", video_url: "", platform_url: "" });

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
    const { error } = await supabase.from("dataroom_publications").insert(form);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    toast({ title: "Publication créée" });
    setForm({ type: "document", title: "", description: "", category: "", file_url: "", video_url: "", platform_url: "" });
    load();
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
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="document">Document</option><option value="photo">Photo</option>
                    <option value="video">Vidéo</option><option value="presentation">Présentation</option>
                    <option value="platform">Fiche Plateforme</option>
                  </select>
                </div>
                <div><Label>Catégorie</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>URL fichier / image</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} /></div>
                <div><Label>URL vidéo (YouTube/Vimeo/MP4)</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>URL plateforme</Label><Input value={form.platform_url} onChange={(e) => setForm({ ...form, platform_url: e.target.value })} /></div>
                <Button onClick={addPub}><Plus className="w-4 h-4 mr-2" />Ajouter la publication</Button>
              </CardContent>
            </Card>
            <div className="grid gap-2">
              {pubs.map((p) => (
                <Card key={p.id}><CardContent className="p-3 flex justify-between items-center">
                  <div><div className="font-semibold text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.type} · {p.category ?? "—"} · {p.views_count} vues</div></div>
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
