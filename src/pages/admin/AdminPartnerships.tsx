import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Building2, Users, Target, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Partnership {
  id: string;
  name: string;
  type: string;
  description: string | null;
  benefits: string | null;
  status: string;
  partner_count: number;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
}

const AdminPartnerships = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    benefits: "",
    status: "active",
    partner_count: 0,
    logo_url: "",
    contact_email: "",
    contact_phone: ""
  });

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const fetchPartnerships = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPartnerships(data);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      benefits: "",
      status: "active",
      partner_count: 0,
      logo_url: "",
      contact_email: "",
      contact_phone: ""
    });
    setEditingPartnership(null);
  };

  const handleOpenDialog = (partnership?: Partnership) => {
    if (partnership) {
      setEditingPartnership(partnership);
      setFormData({
        name: partnership.name,
        type: partnership.type,
        description: partnership.description || "",
        benefits: partnership.benefits || "",
        status: partnership.status,
        partner_count: partnership.partner_count,
        logo_url: partnership.logo_url || "",
        contact_email: partnership.contact_email || "",
        contact_phone: partnership.contact_phone || ""
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error("Le nom et le type sont obligatoires");
      return;
    }

    if (editingPartnership) {
      const { error } = await supabase
        .from('partnerships')
        .update(formData)
        .eq('id', editingPartnership.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
      } else {
        toast.success("Partenariat mis à jour");
        setShowDialog(false);
        resetForm();
        fetchPartnerships();
      }
    } else {
      const { error } = await supabase
        .from('partnerships')
        .insert(formData);

      if (error) {
        toast.error("Erreur lors de la création");
      } else {
        toast.success("Partenariat créé");
        setShowDialog(false);
        resetForm();
        fetchPartnerships();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce partenariat ?")) return;

    const { error } = await supabase
      .from('partnerships')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Partenariat supprimé");
      fetchPartnerships();
    }
  };

  const totalPartners = partnerships.reduce((sum, p) => sum + (p.partner_count || 0), 0);
  const activePartnerships = partnerships.filter(p => p.status === 'active').length;

  return (
    <AdminLayout title="Gestion des Partenariats">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Handshake className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{partnerships.length}</p>
                  <p className="text-sm text-muted-foreground">Types de partenariats</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{activePartnerships}</p>
                  <p className="text-sm text-muted-foreground">Partenariats actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalPartners}</p>
                  <p className="text-sm text-muted-foreground">Total partenaires</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Dialog open={showDialog} onOpenChange={(open) => {
                setShowDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full h-full" onClick={() => handleOpenDialog()}>
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Partenariat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPartnership ? "Modifier le Partenariat" : "Nouveau Partenariat"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nom *</Label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nom du partenariat"
                        />
                      </div>
                      <div>
                        <Label>Type *</Label>
                        <Input 
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          placeholder="Ex: Partenaire Foncier"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du partenariat"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Avantages</Label>
                      <Textarea 
                        value={formData.benefits}
                        onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                        placeholder="Avantages pour les partenaires"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Statut</Label>
                        <Select 
                          value={formData.status}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                            <SelectItem value="pending">En développement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Nombre de partenaires</Label>
                        <Input 
                          type="number"
                          value={formData.partner_count}
                          onChange={(e) => setFormData(prev => ({ ...prev, partner_count: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email de contact</Label>
                        <Input 
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input 
                          value={formData.contact_phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                          placeholder="+225 XX XX XX XX"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>URL du logo</Label>
                      <Input 
                        value={formData.logo_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <Button onClick={handleSubmit} className="w-full">
                      {editingPartnership ? "Mettre à jour" : "Créer"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Partnerships List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {partnerships.map((partnership) => (
              <Card 
                key={partnership.id} 
                className={`cursor-pointer transition-all ${
                  selectedPartnership === partnership.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPartnership(
                  selectedPartnership === partnership.id ? null : partnership.id
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold">{partnership.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${
                          partnership.status === 'active' 
                            ? 'bg-green-500/20 text-green-500' 
                            : partnership.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {partnership.status === 'active' ? 'Actif' : 
                           partnership.status === 'pending' ? 'En développement' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-primary">{partnership.type}</p>
                      <p className="text-muted-foreground">{partnership.description}</p>
                      
                      {selectedPartnership === partnership.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          {partnership.benefits && (
                            <div>
                              <p className="text-sm font-medium">Avantages:</p>
                              <p className="text-sm text-muted-foreground">{partnership.benefits}</p>
                            </div>
                          )}
                          {(partnership.contact_email || partnership.contact_phone) && (
                            <div>
                              <p className="text-sm font-medium">Contact:</p>
                              <p className="text-sm text-muted-foreground">
                                {partnership.contact_email} {partnership.contact_phone && `| ${partnership.contact_phone}`}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Partenaires actifs:</span>
                            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                              {partnership.partner_count}+
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{partnership.partner_count}+</span>
                      <div className="flex flex-col gap-1 ml-4">
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(partnership);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(partnership.id);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPartnerships;
