import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showInitButton, setShowInitButton] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        if (roleData) {
          navigate('/admin/dashboard');
        }
      }
    };
    checkAuth();
    
    // Check if admin exists
    checkAdminExists();
  }, [navigate]);

  const checkAdminExists = async () => {
    // Always show init button - user can click it and it will tell them if admin exists
    setShowInitButton(true);
  };

  const handleInitAdmin = async () => {
    setIsInitializing(true);
    try {
      console.log("Initializing admin account...");
      
      const { data, error } = await supabase.functions.invoke('create-admin', {
        headers: {
          'x-admin-secret': 'agricapital-init-2025'
        },
        body: {}
      });

      console.log("Response:", data, error);

      if (error) {
        console.error("Function error:", error);
        toast.error("Erreur: " + (error?.message || "Initialisation échouée"));
      } else if (data?.success) {
        toast.success(data?.message === "Admin already exists" 
          ? "Compte admin existant. Identifiants pré-remplis."
          : "Compte admin créé ! Connectez-vous maintenant.");
        setShowInitButton(false);
        setEmail("admin@agricapital.ci");
        setPassword("@AgriCapital2025");
      }
    } catch (error: any) {
      console.error("Catch error:", error);
      toast.error("Erreur réseau: " + (error?.message || "Vérifiez votre connexion"));
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Identifiants incorrects");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .single();

        if (!roleData) {
          await supabase.auth.signOut();
          toast.error("Accès non autorisé");
          setIsLoading(false);
          return;
        }

        toast.success("Connexion réussie");
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        toast.error("Erreur lors de l'envoi de l'email");
      } else {
        toast.success("Email de réinitialisation envoyé");
        setIsResetMode(false);
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-strong">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="AgriCapital" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isResetMode ? "Réinitialiser le mot de passe" : "Administration"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showInitButton && (
            <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Première utilisation ? Initialisez le compte administrateur.
              </p>
              <Button
                onClick={handleInitAdmin}
                disabled={isInitializing}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initialisation...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Initialiser le compte Admin
                  </>
                )}
              </Button>
            </div>
          )}

          <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@agricapital.ci"
                className="bg-background border-border"
                required
              />
            </div>

            {!isResetMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background border-border pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isResetMode ? "Envoyer l'email" : "Se connecter"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsResetMode(!isResetMode)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {isResetMode ? "Retour à la connexion" : "Mot de passe oublié ?"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
