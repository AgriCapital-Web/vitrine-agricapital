import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, Users, MessageSquare, BarChart3, Eye, 
  Check, X, Trash2, UserPlus, Loader2, Mail 
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface Testimonial {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  testimonial: string;
  photo_url: string | null;
  approved: boolean;
  created_at: string;
}

interface PageVisit {
  page_path: string;
  visit_count: number;
}

const AdminDashboard = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [topPages, setTopPages] = useState<PageVisit[]>([]);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      await supabase.auth.signOut();
      navigate('/admin');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchTestimonials(), fetchAnalytics(), fetchNewsletter()]);
    setIsLoading(false);
  };

  const fetchNewsletter = async () => {
    const { count } = await supabase
      .from('newsletter_subscribers' as any)
      .select('*', { count: 'exact', head: true });
    setNewsletterCount(count || 0);
  };

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
  };

  const fetchAnalytics = async () => {
    // Total visits
    const { count: total } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true });
    setTotalVisits(total || 0);

    // Today visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
    setTodayVisits(todayCount || 0);

    // Top pages
    const { data: visits } = await supabase
      .from('page_visits')
      .select('page_path');
    
    if (visits) {
      const pageCount: Record<string, number> = {};
      visits.forEach(v => {
        pageCount[v.page_path] = (pageCount[v.page_path] || 0) + 1;
      });
      const sorted = Object.entries(pageCount)
        .map(([page_path, visit_count]) => ({ page_path, visit_count }))
        .sort((a, b) => b.visit_count - a.visit_count)
        .slice(0, 10);
      setTopPages(sorted);
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Veuillez entrer un email");
      return;
    }
    setIsCreatingAdmin(true);

    try {
      // Create user with default password
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: '@AgriCapital',
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError || !userData.user) {
        toast.error("Erreur lors de la création du compte");
        setIsCreatingAdmin(false);
        return;
      }

      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin',
        });

      if (roleError) {
        toast.error("Erreur lors de l'attribution du rôle");
      } else {
        toast.success("Administrateur créé avec succès");
        setNewAdminEmail("");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="AgriCapital" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-foreground">Administration</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Témoignages
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Visiteurs Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{totalVisits}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent" />
                    Visiteurs Aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{todayVisits}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Témoignages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{testimonials.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials.filter(t => t.approved).length} approuvés
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    Newsletter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{newsletterCount}</p>
                  <p className="text-sm text-muted-foreground">abonnés</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Pages les plus visitées</CardTitle>
              </CardHeader>
              <CardContent>
                {topPages.length === 0 ? (
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {topPages.map((page, index) => (
                      <div key={page.page_path} className="flex items-center justify-between">
                        <span className="text-foreground">
                          {index + 1}. {page.page_path || '/'}
                        </span>
                        <span className="text-muted-foreground">{page.visit_count} visites</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-6">
            <div className="grid gap-6">
              {testimonials.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Aucun témoignage</p>
                  </CardContent>
                </Card>
              ) : (
                testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className={`bg-card border-border ${!testimonial.approved ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-primary'}`}>
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
                              <p className="text-xs text-muted-foreground">
                                {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${testimonial.approved ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                              {testimonial.approved ? 'Approuvé' : 'En attente'}
                            </span>
                          </div>
                          <p className="text-foreground">{testimonial.testimonial}</p>
                          <div className="flex gap-2 pt-2">
                            {!testimonial.approved && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(testimonial.id, true)}
                                className="bg-primary hover:bg-primary/90 gap-1"
                              >
                                <Check className="w-3 h-3" /> Approuver
                              </Button>
                            )}
                            {testimonial.approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(testimonial.id, false)}
                                className="gap-1"
                              >
                                <X className="w-3 h-3" /> Rejeter
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(testimonial.id)}
                              className="gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Créer un administrateur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md"
                  />
                  <Button
                    onClick={handleCreateAdmin}
                    disabled={isCreatingAdmin}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isCreatingAdmin && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Créer
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Le mot de passe par défaut sera : @AgriCapital
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
