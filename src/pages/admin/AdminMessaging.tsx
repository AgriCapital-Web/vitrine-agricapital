import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, Phone, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminMessaging = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Email state
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  // SMS state
  const [smsTo, setSmsTo] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // WhatsApp state
  const [whatsappTo, setWhatsappTo] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const handleSendEmail = async () => {
    if (!emailTo || !emailSubject || !emailMessage) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          to: emailTo,
          subject: emailSubject,
          message: emailMessage,
          from: "AgriCapital <contact@agricapital.ci>"
        }
      });

      if (error) throw error;
      
      toast.success("Email envoyé avec succès");
      setEmailTo("");
      setEmailSubject("");
      setEmailMessage("");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!whatsappTo || !whatsappMessage) {
      toast.error("Veuillez remplir le numéro et le message");
      return;
    }

    const phone = whatsappTo.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    toast.success("WhatsApp ouvert dans un nouvel onglet");
  };

  const handleOpenSMS = () => {
    if (!smsTo || !smsMessage) {
      toast.error("Veuillez remplir le numéro et le message");
      return;
    }

    const encodedMessage = encodeURIComponent(smsMessage);
    window.open(`sms:${smsTo}?body=${encodedMessage}`, '_blank');
    toast.info("Application SMS ouverte");
  };

  return (
    <AdminLayout title="Messagerie">
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <Phone className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Envoyer un Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Destinataire</label>
                <Input 
                  type="email"
                  value={emailTo} 
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sujet</label>
                <Input 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Sujet de l'email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  value={emailMessage} 
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={6}
                />
              </div>
              <Button onClick={handleSendEmail} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Envoyer l'email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Envoyer un SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600">
                  L'envoi de SMS nécessite une intégration avec un fournisseur SMS. 
                  Cette fonction ouvrira votre application SMS par défaut.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Numéro de téléphone</label>
                <Input 
                  type="tel"
                  value={smsTo} 
                  onChange={(e) => setSmsTo(e.target.value)}
                  placeholder="+225 05 64 55 17 17"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  value={smsMessage} 
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Votre message SMS..."
                  rows={4}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">{smsMessage.length}/160 caractères</p>
              </div>
              <Button onClick={handleOpenSMS} className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Ouvrir l'application SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Envoyer via WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Numéro WhatsApp</label>
                <Input 
                  type="tel"
                  value={whatsappTo} 
                  onChange={(e) => setWhatsappTo(e.target.value)}
                  placeholder="+225 05 64 55 17 17"
                />
                <p className="text-xs text-muted-foreground mt-1">Format international avec indicatif pays</p>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  value={whatsappMessage} 
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Votre message WhatsApp..."
                  rows={4}
                />
              </div>
              <Button onClick={handleOpenWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ouvrir WhatsApp
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminMessaging;
