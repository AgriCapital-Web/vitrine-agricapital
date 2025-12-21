import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  testimonial: string;
  photo_url: string | null;
  approved: boolean;
  status: string | null;
  is_agricapital_subscriber: boolean | null;
  created_at: string;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
    setIsLoading(false);
  };

  const handleApprove = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ approved: approve })
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(approve ? "Témoignage approuvé" : "Témoignage rejeté");
      fetchTestimonials();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Témoignage supprimé");
      fetchTestimonials();
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'pending') return !t.approved;
    if (filter === 'approved') return t.approved;
    return true;
  });

  const getStatusLabel = (status: string | null, isSubscriber: boolean | null) => {
    if (!status) return null;
    const statusLabels: Record<string, string> = {
      'partner': 'Partenaire',
      'farmer': 'Planteur',
      'investor': 'Investisseur',
      'employee': 'Employé',
      'visitor': 'Visiteur',
    };
    let label = statusLabels[status] || status;
    if (status === 'farmer' && isSubscriber) {
      label += ' - Souscripteur AgriCapital';
    }
    return label;
  };

  return (
    <AdminLayout title="Gestion des Témoignages">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer" onClick={() => setFilter('all')}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{testimonials.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setFilter('pending')}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-500">{testimonials.filter(t => !t.approved).length}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setFilter('approved')}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-500">{testimonials.filter(t => t.approved).length}</p>
              <p className="text-sm text-muted-foreground">Approuvés</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Tous</Button>
          <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>En attente</Button>
          <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>Approuvés</Button>
        </div>

        {/* Testimonials list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun témoignage</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className={`${!testimonial.approved ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {testimonial.photo_url && (
                      <img
                        src={testimonial.photo_url}
                        alt={`${testimonial.first_name} ${testimonial.last_name}`}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">
                            {testimonial.first_name} {testimonial.last_name}
                          </h3>
                          {testimonial.email && (
                            <p className="text-sm text-muted-foreground">{testimonial.email}</p>
                          )}
                          {getStatusLabel(testimonial.status, testimonial.is_agricapital_subscriber) && (
                            <p className="text-sm text-primary">{getStatusLabel(testimonial.status, testimonial.is_agricapital_subscriber)}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${testimonial.approved ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {testimonial.approved ? 'Approuvé' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-foreground">{testimonial.testimonial}</p>
                      <div className="flex gap-2 pt-2">
                        {!testimonial.approved && (
                          <Button size="sm" onClick={() => handleApprove(testimonial.id, true)} className="gap-1">
                            <Check className="w-3 h-3" /> Approuver
                          </Button>
                        )}
                        {testimonial.approved && (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(testimonial.id, false)} className="gap-1">
                            <X className="w-3 h-3" /> Rejeter
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)} className="gap-1">
                          <Trash2 className="w-3 h-3" /> Supprimer
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

export default AdminTestimonials;
