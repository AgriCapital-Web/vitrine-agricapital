import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader2, Send, Download, Mail } from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (!error && data) {
      setSubscribers(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet abonné ?")) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Abonné supprimé");
      fetchSubscribers();
    }
  };

  const handleExport = () => {
    const csv = subscribers.map(s => `${s.email},${s.subscribed_at}`).join('\n');
    const blob = new Blob([`Email,Date d'inscription\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  };

  const handleSendNewsletter = async () => {
    if (!subject || !message) {
      toast.error("Veuillez remplir le sujet et le message");
      return;
    }

    setIsSending(true);
    
    try {
      const activeSubscribers = subscribers.filter(s => s.is_active);
      
      for (const subscriber of activeSubscribers) {
        await supabase.functions.invoke('send-newsletter-welcome', {
          body: { 
            email: subscriber.email,
            subject,
            message,
            isNewsletter: true
          }
        });
      }

      toast.success(`Newsletter envoyée à ${activeSubscribers.length} abonnés`);
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout title="Gestion Newsletter">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Envoyer une Newsletter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sujet</label>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sujet de la newsletter"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contenu de la newsletter..."
                rows={6}
              />
            </div>
            <Button onClick={handleSendNewsletter} disabled={isSending} className="w-full">
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer à {subscribers.filter(s => s.is_active).length} abonnés
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Total abonnés</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-green-500">{subscribers.filter(s => s.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exporter en CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Liste des Abonnés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : subscribers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun abonné</p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{subscriber.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {new Date(subscriber.subscribed_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${subscriber.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {subscriber.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(subscriber.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminNewsletter;
