import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const t = {
  fr: {
    title: "Proposer une actualité",
    desc: "Partagez une information vérifiée concernant AgriCapital. Elle sera relue avant publication.",
    name: "Nom complet", email: "Email", phone: "Téléphone", org: "Organisation",
    articleTitle: "Titre de l'actualité", content: "Votre texte", source: "Lien source (facultatif)",
    submit: "Envoyer la proposition", sent: "Merci, votre proposition a bien été transmise.",
    error: "Envoi impossible pour le moment. Réessayez.",
  },
  en: {
    title: "Submit a news item",
    desc: "Share verified information about AgriCapital. It will be reviewed before publication.",
    name: "Full name", email: "Email", phone: "Phone", org: "Organisation",
    articleTitle: "News title", content: "Your text", source: "Source link (optional)",
    submit: "Send submission", sent: "Thank you, your submission has been received.",
    error: "Could not send right now. Please retry.",
  },
};

const NewsSubmissionForm = () => {
  const { language } = useLanguage();
  const tr = (t as any)[language] || t.fr;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    author_name: "", author_email: "", author_phone: "", organization: "",
    title: "", content: "", source_url: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("news_submissions").insert({
      author_name: form.author_name,
      author_email: form.author_email,
      author_phone: form.author_phone || null,
      organization: form.organization || null,
      title: form.title,
      content: form.content,
      source_url: form.source_url || null,
      language,
    });
    setLoading(false);
    if (error) {
      toast.error(tr.error);
      return;
    }
    toast.success(tr.sent);
    setForm({ author_name: "", author_email: "", author_phone: "", organization: "", title: "", content: "", source_url: "" });
  };

  return (
    <section className="py-12 bg-background" id="proposer-actualite">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>{tr.title}</CardTitle>
            <CardDescription>{tr.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="ns-name">{tr.name}</Label>
                <Input id="ns-name" required value={form.author_name} onChange={(e) => set("author_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ns-email">{tr.email}</Label>
                <Input id="ns-email" type="email" required value={form.author_email} onChange={(e) => set("author_email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ns-phone">{tr.phone}</Label>
                <Input id="ns-phone" value={form.author_phone} onChange={(e) => set("author_phone", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ns-org">{tr.org}</Label>
                <Input id="ns-org" value={form.organization} onChange={(e) => set("organization", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="ns-title">{tr.articleTitle}</Label>
                <Input id="ns-title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="ns-content">{tr.content}</Label>
                <Textarea id="ns-content" required rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="ns-source">{tr.source}</Label>
                <Input id="ns-source" type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {tr.submit}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsSubmissionForm;
