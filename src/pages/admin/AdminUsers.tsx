import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Shield, Trash2, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "moderator" | "user";
  created_at: string;
  email?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Veuillez entrer un email");
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error("Veuillez entrer un email valide");
      return;
    }

    setIsCreatingAdmin(true);

    try {
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: "@AgriCapital2025",
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError || !userData.user) {
        toast.error("Erreur lors de la création du compte: " + (signUpError?.message || "Utilisateur non créé"));
        setIsCreatingAdmin(false);
        return;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userData.user.id,
          role: "admin",
        });

      if (roleError) {
        toast.error("Erreur lors de l'attribution du rôle");
      } else {
        toast.success("Administrateur créé avec succès. Mot de passe temporaire: @AgriCapital2025");
        setNewAdminEmail("");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rôle utilisateur ?")) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Rôle utilisateur supprimé");
      fetchUsers();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-500";
      case "moderator":
        return "bg-amber-500/20 text-amber-500";
      default:
        return "bg-blue-500/20 text-blue-500";
    }
  };

  return (
    <AdminLayout title="Gestion des Utilisateurs">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Administrateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Modérateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {users.filter((u) => u.role === "moderator").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Admin Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Créer un Administrateur
            </CardTitle>
            <CardDescription>
              Ajoutez un nouvel administrateur au système. Le mot de passe par défaut sera: @AgriCapital2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="max-w-md"
              />
              <Button onClick={handleCreateAdmin} disabled={isCreatingAdmin}>
                {isCreatingAdmin && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Créer l'administrateur
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs avec Rôles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucun utilisateur avec rôle trouvé
              </p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">
                          Créé le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
