import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";
import { 
  Mail, Send, FileText, Users, Signature, Plus, Trash2, 
  Loader2, Edit, Eye, Check, Clock, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import DOMPurify from "dompurify";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
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

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

const AdminEmailing = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Form states
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "", variables: "" });
  const [newSignature, setNewSignature] = useState({ name: "", content: "" });
  const [newRecipient, setNewRecipient] = useState({ email: "", name: "", group_name: "general" });
  
  // Compose email
  const [composeEmail, setComposeEmail] = useState({
    recipients: [] as string[],
    subject: "",
    body: "",
    signature: "",
    templateId: ""
  });

  // Dialogs
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showRecipientDialog, setShowRecipientDialog] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchTemplates(),
      fetchSignatures(),
      fetchRecipients(),
      fetchEmailLogs()
    ]);
    setIsLoading(false);
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTemplates(data as EmailTemplate[]);
  };

  const fetchSignatures = async () => {
    const { data } = await supabase
      .from('email_signatures')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSignatures(data as EmailSignature[]);
  };

  const fetchRecipients = async () => {
    const { data } = await supabase
      .from('email_recipients')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRecipients(data as EmailRecipient[]);
  };

  const fetchEmailLogs = async () => {
    const { data } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setEmailLogs(data as EmailLog[]);
  };

  // Template CRUD
  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const variables = newTemplate.variables.split(',').map(v => v.trim()).filter(Boolean);
    
    const { error } = await supabase.from('email_templates').insert({
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      variables
    });

    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Template créé");
      setNewTemplate({ name: "", subject: "", body: "", variables: "" });
      setShowTemplateDialog(false);
      fetchTemplates();
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Supprimer ce template ?")) return;
    await supabase.from('email_templates').delete().eq('id', id);
    toast.success("Template supprimé");
    fetchTemplates();
  };

  // Signature CRUD
  const handleCreateSignature = async () => {
    if (!newSignature.name || !newSignature.content) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const { error } = await supabase.from('email_signatures').insert(newSignature);

    if (error) {
      toast.error("Erreur lors de la création");
    } else {
      toast.success("Signature créée");
      setNewSignature({ name: "", content: "" });
      setShowSignatureDialog(false);
      fetchSignatures();
    }
  };

  const handleDeleteSignature = async (id: string) => {
    if (!confirm("Supprimer cette signature ?")) return;
    await supabase.from('email_signatures').delete().eq('id', id);
    toast.success("Signature supprimée");
    fetchSignatures();
  };

  const handleSetDefaultSignature = async (id: string) => {
    await supabase.from('email_signatures').update({ is_default: false }).neq('id', id);
    await supabase.from('email_signatures').update({ is_default: true }).eq('id', id);
    toast.success("Signature par défaut mise à jour");
    fetchSignatures();
  };

  // Recipient CRUD
  const handleCreateRecipient = async () => {
    if (!newRecipient.email) {
      toast.error("L'email est obligatoire");
      return;
    }

    const { error } = await supabase.from('email_recipients').insert(newRecipient);

    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Destinataire ajouté");
      setNewRecipient({ email: "", name: "", group_name: "general" });
      setShowRecipientDialog(false);
      fetchRecipients();
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (!confirm("Supprimer ce destinataire ?")) return;
    await supabase.from('email_recipients').delete().eq('id', id);
    toast.success("Destinataire supprimé");
    fetchRecipients();
  };

  // Send email
  const handleSendEmail = async () => {
    if (composeEmail.recipients.length === 0 || !composeEmail.subject || !composeEmail.body) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSending(true);

    try {
      const fullBody = composeEmail.signature 
        ? `${composeEmail.body}<br/><br/>${composeEmail.signature}`
        : composeEmail.body;

      for (const recipientId of composeEmail.recipients) {
        const recipient = recipients.find(r => r.id === recipientId);
        if (!recipient) continue;

        // Log the email
        await supabase.from('email_logs').insert({
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          subject: composeEmail.subject,
          body: fullBody,
          status: 'sending'
        });

        // Send via edge function
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: recipient.email,
            subject: composeEmail.subject,
            html: fullBody
          }
        });

        if (error) {
          console.error('Email send error:', error);
        }
      }

      toast.success(`Email envoyé à ${composeEmail.recipients.length} destinataire(s)`);
      setComposeEmail({ recipients: [], subject: "", body: "", signature: "", templateId: "" });
      fetchEmailLogs();
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComposeEmail(prev => ({
        ...prev,
        subject: template.subject,
        body: template.body,
        templateId
      }));
    }
  };

  const applySignature = (signatureId: string) => {
    const signature = signatures.find(s => s.id === signatureId);
    if (signature) {
      setComposeEmail(prev => ({
        ...prev,
        signature: signature.content
      }));
    }
  };

  const recipientGroups = [...new Set(recipients.map(r => r.group_name))];

  return (
    <AdminLayout title="Module d'Emailing">
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Composer</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="signatures" className="flex items-center gap-2">
            <Signature className="w-4 h-4" />
            <span className="hidden sm:inline">Signatures</span>
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Destinataires</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
        </TabsList>

        {/* Compose Email */}
        <TabsContent value="compose">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Composer un Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                  <div>
                    <Label>Signature</Label>
                    <Select onValueChange={applySignature}>
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

                <div>
                  <Label>Sujet</Label>
                  <Input 
                    value={composeEmail.subject}
                    onChange={(e) => setComposeEmail(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Sujet de l'email"
                  />
                </div>

                <div>
                  <Label>Contenu</Label>
                  <WYSIWYGEditor
                    content={composeEmail.body}
                    onChange={(body) => setComposeEmail(prev => ({ ...prev, body }))}
                  />
                </div>

                <Button 
                  onClick={handleSendEmail} 
                  disabled={isSending || composeEmail.recipients.length === 0}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer à {composeEmail.recipients.length} destinataire(s)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destinataires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipientGroups.map(group => (
                  <div key={group} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium capitalize">{group}</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const groupRecipients = recipients.filter(r => r.group_name === group && r.is_active).map(r => r.id);
                          setComposeEmail(prev => ({
                            ...prev,
                            recipients: [...new Set([...prev.recipients, ...groupRecipients])]
                          }));
                        }}
                      >
                        Tout sélectionner
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {recipients.filter(r => r.group_name === group).map(recipient => (
                        <label 
                          key={recipient.id} 
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={composeEmail.recipients.includes(recipient.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setComposeEmail(prev => ({
                                  ...prev,
                                  recipients: [...prev.recipients, recipient.id]
                                }));
                              } else {
                                setComposeEmail(prev => ({
                                  ...prev,
                                  recipients: prev.recipients.filter(id => id !== recipient.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{recipient.name || recipient.email}</p>
                            {recipient.name && (
                              <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Templates d'Email</CardTitle>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nom du template</Label>
                      <Input 
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Bienvenue nouveau client"
                      />
                    </div>
                    <div>
                      <Label>Sujet</Label>
                      <Input 
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Sujet de l'email"
                      />
                    </div>
                    <div>
                      <Label>Variables (séparées par des virgules)</Label>
                      <Input 
                        value={newTemplate.variables}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, variables: e.target.value }))}
                        placeholder="nom, email, date"
                      />
                    </div>
                    <div>
                      <Label>Contenu</Label>
                      <WYSIWYGEditor
                        content={newTemplate.body}
                        onChange={(body) => setNewTemplate(prev => ({ ...prev, body }))}
                      />
                    </div>
                    <Button onClick={handleCreateTemplate} className="w-full">
                      Créer le Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun template</p>
              ) : (
                <div className="grid gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                          {template.variables && template.variables.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {template.variables.map((v: string) => (
                                <span key={v} className="text-xs px-2 py-1 bg-muted rounded">{`{{${v}}}`}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>
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
              <CardTitle>Signatures Email</CardTitle>
              <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Signature
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une Signature</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nom</Label>
                      <Input 
                        value={newSignature.name}
                        onChange={(e) => setNewSignature(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Signature principale"
                      />
                    </div>
                    <div>
                      <Label>Contenu</Label>
                      <WYSIWYGEditor
                        content={newSignature.content}
                        onChange={(content) => setNewSignature(prev => ({ ...prev, content }))}
                      />
                    </div>
                    <Button onClick={handleCreateSignature} className="w-full">
                      Créer la Signature
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {signatures.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune signature</p>
              ) : (
                <div className="grid gap-4">
                  {signatures.map(signature => (
                    <div key={signature.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{signature.name}</h3>
                            {signature.is_default && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Par défaut</span>
                            )}
                          </div>
                          <div 
                            className="text-sm text-muted-foreground mt-2 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(signature.content) }}
                          />
                        </div>
                        <div className="flex gap-2">
                          {!signature.is_default && (
                            <Button size="sm" variant="outline" onClick={() => handleSetDefaultSignature(signature.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSignature(signature.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipients */}
        <TabsContent value="recipients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestion des Destinataires</CardTitle>
              <Dialog open={showRecipientDialog} onOpenChange={setShowRecipientDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un Destinataire
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un Destinataire</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email *</Label>
                      <Input 
                        type="email"
                        value={newRecipient.email}
                        onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Input 
                        value={newRecipient.name}
                        onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom complet"
                      />
                    </div>
                    <div>
                      <Label>Groupe</Label>
                      <Input 
                        value={newRecipient.group_name}
                        onChange={(e) => setNewRecipient(prev => ({ ...prev, group_name: e.target.value }))}
                        placeholder="general"
                      />
                    </div>
                    <Button onClick={handleCreateRecipient} className="w-full">
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipientGroups.map(group => (
                  <div key={group}>
                    <h4 className="font-medium mb-2 capitalize">{group} ({recipients.filter(r => r.group_name === group).length})</h4>
                    <div className="space-y-2">
                      {recipients.filter(r => r.group_name === group).map(recipient => (
                        <div key={recipient.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{recipient.name || recipient.email}</p>
                            {recipient.name && <p className="text-sm text-muted-foreground">{recipient.email}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${recipient.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {recipient.is_active ? 'Actif' : 'Inactif'}
                            </span>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteRecipient(recipient.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Emails</CardTitle>
            </CardHeader>
            <CardContent>
              {emailLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun email envoyé</p>
              ) : (
                <div className="space-y-2">
                  {emailLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          À: {log.recipient_name || log.recipient_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.status === 'sent' && (
                          <span className="flex items-center gap-1 text-xs text-green-500">
                            <Check className="w-3 h-3" /> Envoyé
                          </span>
                        )}
                        {log.status === 'pending' && (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Clock className="w-3 h-3" /> En attente
                          </span>
                        )}
                        {log.status === 'failed' && (
                          <span className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="w-3 h-3" /> Échec
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminEmailing;
