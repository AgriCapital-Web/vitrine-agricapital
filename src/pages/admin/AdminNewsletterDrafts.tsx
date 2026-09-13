import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, FileEdit, Loader2, Mail, RefreshCw, Save, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Draft = {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  html_content: string | null;
  plain_text: string | null;
  audience_type: string;
  status: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

const audienceLabels: Record<string, string> = {
  all: "Tous les contacts",
  subscribers: "Abonnés newsletter",
  prospects: "Prospects",
  investors: "Investisseurs",
  partners: "Partenaires",
  clients: "Clients",
  testimonials: "Témoignants",
  members: "Membres",
  custom: "Personnalisé",
};

const stripHtml = (html: string) =>
  html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const AdminNewsletterDrafts = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", preheader: "", html_content: "", audience_type: "all" });

  const selected = useMemo(() => drafts.find((d) => d.id === selectedId) || null, [drafts, selectedId]);

  const load = async (keepId?: string | null) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_campaigns")
      .select("id,name,subject,preheader,html_content,plain_text,audience_type,status,image_url,video_url,created_at,updated_at")
      .in("status", ["draft", "ready"])
      .order("updated_at", { ascending: false });
    if (error) toast.error("Chargement des brouillons impossible");
    const list = (data || []) as Draft[];
    setDrafts(list);
    const next = keepId && list.some((d) => d.id === keepId) ? keepId : list[0]?.id ?? null;
    setSelectedId(next);
    const d = list.find((x) => x.id === next);
    if (d) {
      setForm({
        name: d.name || "",
        subject: d.subject || "",
        preheader: d.preheader || "",
        html_content: d.html_content || "",
        audience_type: d.audience_type || "all",
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const select = (d: Draft) => {
    setSelectedId(d.id);
    setForm({
      name: d.name || "",
      subject: d.subject || "",
      preheader: d.preheader || "",
      html_content: d.html_content || "",
      audience_type: d.audience_type || "all",
    });
  };

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!form.subject.trim() || form.subject.trim().length < 6) e.push("Objet trop court");
    if (stripHtml(form.html_content).length < 80) e.push("Contenu trop court");
    return e;
  }, [form]);

  const save = async (status?: string) => {
    if (!selectedId) return;
    setSaving(true);
    const { error } = await supabase
      .from("email_campaigns")
      .update({
        name: form.name.trim() || form.subject.trim(),
        subject: form.subject.trim(),
        preheader: form.preheader.trim(),
        html_content: form.html_content,
        plain_text: stripHtml(form.html_content),
        audience_type: form.audience_type,
        ...(status ? { status } : {}),
      })
      .eq("id", selectedId);
    setSaving(false);
    if (error) { toast.error("Enregistrement impossible"); return false; }
    toast.success("Brouillon enregistré");
    await load(selectedId);
    return true;
  };

  const generateDraft = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-auto-send", { body: { mode: "draft" } });
      if (error) throw error;
      if (data?.success === false) throw new Error("Contenu généré insuffisant, réessayez");
      toast.success("Nouveau brouillon généré");
      await load(data?.campaignId ?? null);
    } catch (err: any) {
      toast.error(err?.message || "Génération impossible");
    } finally {
      setGenerating(false);
    }
  };

  const approveAndSend = async () => {
    if (!selectedId) return;
    if (errors.length) return toast.error(`Envoi bloqué : ${errors[0]}`);
    if (!confirm("Valider ce brouillon et l'envoyer à tous les abonnés du segment choisi ?")) return;
    setSending(true);
    try {
      const ok = await save("ready");
      if (!ok) return;
      const { data, error } = await supabase.functions.invoke("send-newsletter-batch", {
        body: {
          campaignId: selectedId,
          subject: form.subject,
          preheader: form.preheader,
          html: form.html_content,
          audienceType: form.audience_type,
        },
      });
      if (error) throw error;
      toast.success(`Envoi terminé : ${data?.totalSent || 0} envoyé(s), ${data?.totalFailed || 0} échec(s)`);
      await load(selectedId);
    } catch (err: any) {
      toast.error(err?.message || "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout title="Brouillons newsletter">
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-foreground">Validation avant diffusion</p>
              <p className="text-sm text-muted-foreground">
                Chaque brouillon programmé arrive par email à agricapital.ci@gmail.com et s'affiche ici. Rien n'est envoyé aux abonnés sans votre validation.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => load(selectedId)} className="gap-2"><RefreshCw className="w-4 h-4" /> Actualiser</Button>
              <Button onClick={generateDraft} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Générer un brouillon
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> Brouillons</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : drafts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 px-4">Aucun brouillon en attente</p>
              ) : (
                <ul className="divide-y divide-border max-h-[520px] overflow-auto">
                  {drafts.map((d) => (
                    <li key={d.id}>
                      <button
                        onClick={() => select(d)}
                        className={`w-full text-left px-4 py-3 transition-colors ${selectedId === d.id ? "bg-muted" : "hover:bg-muted/50"}`}
                      >
                        <p className="font-medium text-foreground truncate">{d.subject || d.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{d.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={d.status === "ready" ? "default" : "outline"} className="text-[10px]">
                            {d.status === "ready" ? "Validée" : "Brouillon"}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(d.updated_at).toLocaleString("fr-FR")}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileEdit className="w-5 h-5" /> Relecture et modification</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {!selected ? (
                <p className="text-muted-foreground py-8 text-center">Sélectionnez un brouillon à relire.</p>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Titre interne</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Objet de l'email</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-2"><Label>Pré-header (aperçu boîte de réception)</Label><Input value={form.preheader} onChange={(e) => setForm((f) => ({ ...f, preheader: e.target.value }))} /></div>
                  <div className="space-y-2">
                    <Label>Destinataires</Label>
                    <Select value={form.audience_type} onValueChange={(v) => setForm((f) => ({ ...f, audience_type: v }))}>
                      <SelectTrigger className="w-full md:w-72"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(audienceLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu de la newsletter</Label>
                    <WYSIWYGEditor value={form.html_content} onChange={(value) => setForm((f) => ({ ...f, html_content: value }))} rows={16} />
                  </div>

                  {errors.length > 0 && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5" /><span>{errors.join(" · ")}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => save()} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer les modifications
                    </Button>
                    <Button variant="secondary" onClick={() => save("ready")} disabled={saving || errors.length > 0} className="gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Marquer comme validée
                    </Button>
                    <Button onClick={approveAndSend} disabled={sending || errors.length > 0} className="gap-2 ml-auto">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Valider et envoyer à tous
                    </Button>
                  </div>

                  <div className="border rounded-md bg-background p-4">
                    <p className="text-xs text-muted-foreground mb-3">Aperçu tel que reçu</p>
                    <div className="mb-4 rounded-md bg-muted/30 p-3 text-sm">
                      <p><strong>Objet :</strong> {form.subject || "—"}</p>
                      <p><strong>Aperçu :</strong> {form.preheader || "—"}</p>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.html_content || "<p>Aucun contenu</p>" }} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletterDrafts;
