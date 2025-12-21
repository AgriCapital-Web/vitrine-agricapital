import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Zap,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface AutoResponseTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  trigger_type: 'contact' | 'newsletter' | 'testimonial';
  variables: string[];
}

const defaultTemplates: AutoResponseTemplate[] = [
  {
    id: 'contact-default',
    name: 'Réponse automatique - Contact',
    subject: 'Nous avons bien reçu votre message - AgriCapital',
    body: `Bonjour {{name}},

Nous avons bien reçu votre message et nous vous remercions de votre intérêt pour AgriCapital.

Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais (généralement sous 24 à 48 heures ouvrées).

En attendant, n'hésitez pas à :
- Visiter notre site web : www.agricapital.ci
- Nous appeler au : 05 64 55 17 17
- Consulter nos offres de partenariat

Cordialement,
L'équipe AgriCapital

---
AgriCapital SARL
Gonaté, Daloa, Côte d'Ivoire
Tél: 05 64 55 17 17
Email: contact@agricapital.ci
Web: www.agricapital.ci`,
    is_active: true,
    trigger_type: 'contact',
    variables: ['name', 'email', 'subject', 'message'],
  },
  {
    id: 'newsletter-welcome',
    name: 'Bienvenue Newsletter',
    subject: 'Bienvenue dans la communauté AgriCapital !',
    body: `Bonjour,

Merci de vous être inscrit à notre newsletter !

Vous recevrez désormais nos dernières actualités, conseils agricoles et informations sur nos offres de partenariat.

En tant que membre de notre communauté, vous bénéficiez :
- D'informations exclusives sur la filière palmier à huile
- De conseils d'experts en agriculture
- D'un accès prioritaire à nos nouvelles offres

À très bientôt !

L'équipe AgriCapital

---
Se désinscrire : {{unsubscribe_link}}`,
    is_active: true,
    trigger_type: 'newsletter',
    variables: ['email', 'unsubscribe_link'],
  },
  {
    id: 'testimonial-thanks',
    name: 'Merci pour votre témoignage',
    subject: 'Merci pour votre témoignage - AgriCapital',
    body: `Bonjour {{first_name}},

Nous vous remercions sincèrement d'avoir pris le temps de partager votre expérience avec AgriCapital.

Votre témoignage est précieux pour nous et nous aide à continuer à améliorer nos services pour tous nos partenaires.

Votre avis sera examiné par notre équipe et, s'il est approuvé, il apparaîtra sur notre site web pour inspirer d'autres propriétaires terriens.

Merci encore pour votre confiance !

Cordialement,
L'équipe AgriCapital`,
    is_active: true,
    trigger_type: 'testimonial',
    variables: ['first_name', 'last_name'],
  },
];

const AdminAutoResponses = () => {
  const [templates, setTemplates] = useState<AutoResponseTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<AutoResponseTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editingTemplate) return;
    
    setTemplates(prev => 
      prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
    );
    setIsDialogOpen(false);
    setEditingTemplate(null);
    toast.success('Template sauvegardé');
  };

  const handleToggleActive = (id: string) => {
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, is_active: !t.is_active } : t)
    );
    toast.success('Statut mis à jour');
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
    toast.success(`Variable {{${variable}}} copiée`);
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      contact: 'Message de contact',
      newsletter: 'Inscription newsletter',
      testimonial: 'Nouveau témoignage',
    };
    return labels[type] || type;
  };

  const getTriggerColor = (type: string) => {
    const colors: Record<string, string> = {
      contact: 'bg-blue-100 text-blue-800',
      newsletter: 'bg-green-100 text-green-800',
      testimonial: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Réponses Automatiques">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Réponses Automatiques</h1>
            <p className="text-muted-foreground">
              Configurez les emails envoyés automatiquement aux visiteurs
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">Comment ça marche ?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Les réponses automatiques sont envoyées instantanément lorsqu'un visiteur effectue 
                  une action (envoie un message, s'inscrit à la newsletter, soumet un témoignage). 
                  Utilisez les variables entre doubles accolades pour personnaliser le contenu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getTriggerColor(template.trigger_type)}>
                        {getTriggerLabel(template.trigger_type)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Sujet: {template.subject}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => handleToggleActive(template.id)}
                    />
                    <Dialog open={isDialogOpen && editingTemplate?.id === template.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setEditingTemplate(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingTemplate({ ...template });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Modifier le template</DialogTitle>
                        </DialogHeader>
                        {editingTemplate && (
                          <div className="space-y-4">
                            <div>
                              <Label>Nom du template</Label>
                              <Input
                                value={editingTemplate.name}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  name: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label>Sujet de l'email</Label>
                              <Input
                                value={editingTemplate.subject}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  subject: e.target.value
                                })}
                              />
                            </div>
                            <div>
                              <Label>Variables disponibles</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {editingTemplate.variables.map((variable) => (
                                  <Button
                                    key={variable}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => copyVariable(variable)}
                                  >
                                    {copiedVar === variable ? (
                                      <Check className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Copy className="h-3 w-3 mr-1" />
                                    )}
                                    {`{{${variable}}}`}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label>Corps de l'email</Label>
                              <Textarea
                                value={editingTemplate.body}
                                onChange={(e) => setEditingTemplate({
                                  ...editingTemplate,
                                  body: e.target.value
                                })}
                                rows={15}
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground font-sans">
                    {template.body.slice(0, 200)}...
                  </pre>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>
                    {template.is_active 
                      ? 'Actif - Les emails sont envoyés automatiquement' 
                      : 'Inactif - Aucun email envoyé'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAutoResponses;
