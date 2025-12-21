import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, EyeOff, FileText, Inbox, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

interface SiteForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  status: string;
  created_at: string;
}

const fieldTypes = [
  { value: "text", label: "Texte" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Téléphone" },
  { value: "textarea", label: "Zone de texte" },
  { value: "number", label: "Nombre" },
  { value: "select", label: "Liste déroulante" },
  { value: "checkbox", label: "Case à cocher" },
  { value: "date", label: "Date" },
];

const AdminForms = () => {
  const [forms, setForms] = useState<SiteForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<Partial<SiteForm> | null>(null);
  const [newField, setNewField] = useState<Partial<FormField>>({
    name: "",
    label: "",
    type: "text",
    required: false,
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_forms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Erreur lors du chargement");
      console.error(error);
    } else {
      const parsedForms = (data || []).map(form => ({
        ...form,
        fields: Array.isArray(form.fields) ? form.fields as unknown as FormField[] : [],
        settings: typeof form.settings === 'object' && form.settings !== null ? form.settings as Record<string, any> : {},
      }));
      setForms(parsedForms);
    }
    setIsLoading(false);
  };

  const fetchSubmissions = async (formId: string) => {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      const parsed = (data || []).map(sub => ({
        ...sub,
        data: typeof sub.data === 'object' && sub.data !== null ? sub.data as Record<string, any> : {},
      }));
      setSubmissions(parsed);
    }
  };

  const handleSaveForm = async () => {
    if (!editingForm?.name || !editingForm?.slug) {
      toast.error("Le nom et le slug sont requis");
      return;
    }

    const formData = {
      name: editingForm.name,
      slug: editingForm.slug,
      description: editingForm.description,
      fields: JSON.parse(JSON.stringify(editingForm.fields || [])),
      is_active: editingForm.is_active ?? true,
    };

    if (editingForm.id) {
      const { error } = await supabase
        .from('site_forms')
        .update(formData)
        .eq('id', editingForm.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        console.error(error);
      } else {
        toast.success("Formulaire mis à jour");
        fetchForms();
      }
    } else {
      const { error } = await supabase
        .from('site_forms')
        .insert([formData]);

      if (error) {
        toast.error("Erreur lors de la création");
        console.error(error);
      } else {
        toast.success("Formulaire créé");
        fetchForms();
      }
    }

    setIsDialogOpen(false);
    setEditingForm(null);
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm("Supprimer ce formulaire et toutes ses soumissions ?")) return;

    const { error } = await supabase
      .from('site_forms')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Formulaire supprimé");
      fetchForms();
    }
  };

  const toggleFormActive = async (form: SiteForm) => {
    const { error } = await supabase
      .from('site_forms')
      .update({ is_active: !form.is_active })
      .eq('id', form.id);

    if (error) {
      toast.error("Erreur");
    } else {
      fetchForms();
    }
  };

  const addField = () => {
    if (!newField.name || !newField.label) {
      toast.error("Nom et label requis");
      return;
    }

    const field: FormField = {
      id: Date.now().toString(),
      name: newField.name,
      label: newField.label,
      type: newField.type || "text",
      required: newField.required || false,
      placeholder: newField.placeholder,
    };

    setEditingForm(prev => ({
      ...prev,
      fields: [...(prev?.fields || []), field],
    }));

    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
    });
  };

  const removeField = (fieldId: string) => {
    setEditingForm(prev => ({
      ...prev,
      fields: (prev?.fields || []).filter(f => f.id !== fieldId),
    }));
  };

  const openSubmissions = (formId: string) => {
    setSelectedFormId(formId);
    fetchSubmissions(formId);
    setIsSubmissionsOpen(true);
  };

  return (
    <AdminLayout title="Gestion des Formulaires">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">Créez et gérez vos formulaires</p>
          <Button onClick={() => { setEditingForm({ fields: [], is_active: true }); setIsDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau formulaire
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucun formulaire créé</p>
              <Button onClick={() => { setEditingForm({ fields: [], is_active: true }); setIsDialogOpen(true); }}>
                Créer un formulaire
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{form.name}</h3>
                        <Badge variant={form.is_active ? "default" : "outline"}>
                          {form.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge variant="secondary">
                          {form.fields?.length || 0} champs
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">/{form.slug}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSubmissions(form.id)}
                        className="gap-2"
                      >
                        <Inbox className="w-4 h-4" />
                        Soumissions
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFormActive(form)}
                      >
                        {form.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingForm(form); setIsDialogOpen(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Form Editor Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingForm?.id ? "Modifier le formulaire" : "Nouveau formulaire"}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="fields">Champs</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div>
                  <Label>Nom du formulaire</Label>
                  <Input
                    value={editingForm?.name || ""}
                    onChange={(e) => setEditingForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact, Inscription, etc."
                  />
                </div>

                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingForm?.slug || ""}
                    onChange={(e) => setEditingForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="contact-form"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={editingForm?.description || ""}
                    onChange={(e) => setEditingForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du formulaire"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Formulaire actif</Label>
                  <Switch
                    checked={editingForm?.is_active ?? true}
                    onCheckedChange={(checked) => setEditingForm(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ajouter un champ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Nom (technique)</Label>
                        <Input
                          value={newField.name || ""}
                          onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="email"
                        />
                      </div>
                      <div>
                        <Label>Label (affiché)</Label>
                        <Input
                          value={newField.label || ""}
                          onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                          placeholder="Adresse email"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newField.type || "text"}
                          onValueChange={(value) => setNewField(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newField.required || false}
                            onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
                          />
                          <Label>Requis</Label>
                        </div>
                      </div>
                    </div>
                    <Button onClick={addField} size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Ajouter
                    </Button>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Champs du formulaire</Label>
                  {(editingForm?.fields || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun champ ajouté
                    </p>
                  ) : (
                    (editingForm?.fields || []).map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{field.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {field.name} • {fieldTypes.find(t => t.value === field.type)?.label}
                            {field.required && " • Requis"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(field.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveForm}>
                {editingForm?.id ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submissions Dialog */}
        <Dialog open={isSubmissionsOpen} onOpenChange={setIsSubmissionsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Soumissions du formulaire</DialogTitle>
            </DialogHeader>

            {submissions.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune soumission</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={sub.status === "new" ? "default" : "secondary"}>
                          {sub.status === "new" ? "Nouveau" : sub.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(sub.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(sub.data).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span>{" "}
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminForms;