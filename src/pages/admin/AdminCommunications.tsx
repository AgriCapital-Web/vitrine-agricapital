import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, Send, FileText, Users, Signature, Plus, Trash2, 
  Loader2, Edit, Eye, Check, Clock, AlertCircle, Inbox,
  MessageSquare, Phone, RefreshCw, Star, Archive, User,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
}

interface EmailSignature {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

interface EmailRecipient {
  id: string;
  email: string;
  name: string | null;
  group_name: string;
  is_active: boolean;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  read_at: string | null;
}

const AdminCommunications = () => {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  
  // Compose email state
  const [composeEmail, setComposeEmail] = useState({
    to: "",
    subject: "",
    body: "",
    templateId: "",
    signatureId: "",
  });
  const [isSending, setIsSending] = useState(false);

  // Template & Signature dialogs
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "" });
  const [newSignature, setNewSignature] = useState({ name: "", content: "" });

  // Fetch contact messages
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  // Fetch signatures
  const { data: signatures = [] } = useQuery({
    queryKey: ["email-signatures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_signatures")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EmailSignature[];
    },
  });

  // Fetch recipients
  const { data: recipients = [] } = useQuery({
    queryKey: ["email-recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_recipients")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as EmailRecipient[];
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from("contact_messages")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] }),
  });

  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === "new") {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleSendEmail = async () => {
    if (!composeEmail.to || !composeEmail.subject || !composeEmail.body) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSending(true);
    try {
      const signature = signatures.find(s => s.id === composeEmail.signatureId);
      const fullBody = signature 
        ? `${composeEmail.body}<br/><br/>${signature.content}`
        : composeEmail.body;

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: composeEmail.to,
          subject: composeEmail.subject,
          html: fullBody,
        },
      });

      if (error) throw error;
      
      toast.success("Email envoyé avec succès");
      setComposeEmail({ to: "", subject: "", body: "", templateId: "", signatureId: "" });
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject) {
      toast.error("Nom et sujet requis");
      return;
    }

    const { error } = await supabase.from("email_templates").insert(newTemplate);
    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Template créé");
      setNewTemplate({ name: "", subject: "", body: "" });
      setShowTemplateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    }
  };

  const handleCreateSignature = async () => {
    if (!newSignature.name || !newSignature.content) {
      toast.error("Nom et contenu requis");
      return;
    }

    const { error } = await supabase.from("email_signatures").insert(newSignature);
    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Signature créée");
      setNewSignature({ name: "", content: "" });
      setShowSignatureDialog(false);
      queryClient.invalidateQueries({ queryKey: ["email-signatures"] });
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComposeEmail(prev => ({
        ...prev,
        subject: template.subject,
        body: template.body,
        templateId,
      }));
    }
  };

  const handleReply = (message: ContactMessage) => {
    setComposeEmail({
      to: message.email,
      subject: `Re: ${message.subject || "Votre message"}`,
      body: "",
      templateId: "",
      signatureId: "",
    });
    setActiveTab("compose");
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unreadCount = messages.filter(m => m.status === "new").length;

  const stats = {
    total: messages.length,
    unread: unreadCount,
    templates: templates.length,
    signatures: signatures.length,
  };

  return (
    <AdminLayout title="Communications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Inbox className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unread}</p>
                  <p className="text-xs text-muted-foreground">Non lus</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.templates}</p>
                  <p className="text-xs text-muted-foreground">Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Signature className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.signatures}</p>
                  <p className="text-xs text-muted-foreground">Signatures</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compose" className="gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Composer</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="signatures" className="gap-2">
              <Signature className="w-4 h-4" />
              <span className="hidden sm:inline">Signatures</span>
            </TabsTrigger>
          </TabsList>

          {/* Inbox */}
          <TabsContent value="inbox">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Messages list */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Messages reçus</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => refetchMessages()}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {messagesLoading ? (
                      <div className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </div>
                    ) : filteredMessages.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Aucun message
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredMessages.map((message) => (
                          <button
                            key={message.id}
                            onClick={() => handleSelectMessage(message)}
                            className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                              selectedMessage?.id === message.id ? "bg-muted" : ""
                            } ${message.status === "new" ? "bg-blue-50/50" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              {message.status === "new" && (
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${message.status === "new" ? "font-semibold" : ""}`}>
                                  {message.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {message.subject || "Sans sujet"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: fr })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Message detail */}
              <Card className="lg:col-span-2">
                {selectedMessage ? (
                  <>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedMessage.subject || "Sans sujet"}</CardTitle>
                          <CardDescription>
                            De: {selectedMessage.name} ({selectedMessage.email})
                          </CardDescription>
                        </div>
                        <Button onClick={() => handleReply(selectedMessage)}>
                          <Send className="w-4 h-4 mr-2" />
                          Répondre
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        Reçu le {format(new Date(selectedMessage.created_at), "PPP 'à' HH:mm", { locale: fr })}
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="h-[500px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Sélectionnez un message</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Compose */}
          <TabsContent value="compose">
            <Card>
              <CardHeader>
                <CardTitle>Composer un email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select onValueChange={applyTemplate} value={composeEmail.templateId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Signature</Label>
                    <Select 
                      value={composeEmail.signatureId} 
                      onValueChange={(v) => setComposeEmail(prev => ({ ...prev, signatureId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une signature" />
                      </SelectTrigger>
                      <SelectContent>
                        {signatures.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destinataire</Label>
                  <Input
                    type="email"
                    value={composeEmail.to}
                    onChange={(e) => setComposeEmail(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="email@exemple.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sujet</Label>
                  <Input
                    value={composeEmail.subject}
                    onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Sujet de l'email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={composeEmail.body}
                    onChange={(e) => setComposeEmail(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Votre message..."
                    rows={8}
                  />
                </div>

                <Button onClick={handleSendEmail} disabled={isSending} className="w-full md:w-auto">
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Envoyer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Templates d'email</CardTitle>
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" /> Nouveau</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nom du template"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sujet</Label>
                        <Input
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Sujet de l'email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contenu</Label>
                        <Textarea
                          value={newTemplate.body}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                          placeholder="Corps de l'email"
                          rows={6}
                        />
                      </div>
                      <Button onClick={handleCreateTemplate} className="w-full">Créer</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun template
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.subject}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signatures */}
          <TabsContent value="signatures">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Signatures</CardTitle>
                <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" /> Nouveau</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une signature</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input
                          value={newSignature.name}
                          onChange={(e) => setNewSignature(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nom de la signature"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contenu</Label>
                        <Textarea
                          value={newSignature.content}
                          onChange={(e) => setNewSignature(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Contenu de la signature"
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleCreateSignature} className="w-full">Créer</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {signatures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune signature
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {signatures.map((signature) => (
                      <div key={signature.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {signature.name}
                              {signature.is_default && <Badge variant="secondary">Par défaut</Badge>}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{signature.content}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunications;
