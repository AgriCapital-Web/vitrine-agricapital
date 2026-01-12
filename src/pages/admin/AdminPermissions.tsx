import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, Crown, Eye, Settings, Users, FileText, Mail, 
  BarChart3, Image, MessageSquare, Bell, Globe, Database,
  Lock, Unlock, Check, X, Save, Loader2, RefreshCw,
  Newspaper, Handshake, Star, Menu, Palette
} from "lucide-react";
import { toast } from "sonner";

type AppRole = "admin" | "moderator" | "user";

interface Permission {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface RolePermissions {
  role: AppRole;
  permissions: Record<string, boolean>;
}

const PERMISSIONS: Permission[] = [
  // Contenu
  { id: "news_view", label: "Voir les actualités", description: "Accès en lecture aux articles", icon: <Newspaper className="w-4 h-4" />, category: "Contenu" },
  { id: "news_create", label: "Créer des actualités", description: "Publier de nouveaux articles", icon: <Newspaper className="w-4 h-4" />, category: "Contenu" },
  { id: "news_edit", label: "Modifier les actualités", description: "Éditer les articles existants", icon: <Newspaper className="w-4 h-4" />, category: "Contenu" },
  { id: "news_delete", label: "Supprimer les actualités", description: "Supprimer des articles", icon: <Newspaper className="w-4 h-4" />, category: "Contenu" },
  { id: "pages_manage", label: "Gérer les pages", description: "Créer et modifier les pages", icon: <FileText className="w-4 h-4" />, category: "Contenu" },
  { id: "sections_manage", label: "Gérer les sections", description: "Configurer les sections de pages", icon: <Menu className="w-4 h-4" />, category: "Contenu" },
  { id: "media_manage", label: "Gérer les médias", description: "Upload et gestion des fichiers", icon: <Image className="w-4 h-4" />, category: "Contenu" },

  // Communication
  { id: "messages_view", label: "Voir les messages", description: "Lire les messages de contact", icon: <Mail className="w-4 h-4" />, category: "Communication" },
  { id: "messages_reply", label: "Répondre aux messages", description: "Envoyer des réponses", icon: <MessageSquare className="w-4 h-4" />, category: "Communication" },
  { id: "newsletter_manage", label: "Gérer la newsletter", description: "Envoyer des campagnes", icon: <Mail className="w-4 h-4" />, category: "Communication" },
  { id: "notifications_send", label: "Envoyer des notifications", description: "Push notifications", icon: <Bell className="w-4 h-4" />, category: "Communication" },
  
  // Partenariats
  { id: "partnerships_view", label: "Voir les demandes", description: "Accès aux demandes de partenariat", icon: <Handshake className="w-4 h-4" />, category: "Partenariats" },
  { id: "partnerships_manage", label: "Gérer les partenariats", description: "Approuver/rejeter les demandes", icon: <Handshake className="w-4 h-4" />, category: "Partenariats" },
  { id: "testimonials_manage", label: "Gérer les témoignages", description: "Modérer les avis", icon: <Star className="w-4 h-4" />, category: "Partenariats" },
  
  // Analytics
  { id: "analytics_view", label: "Voir les statistiques", description: "Dashboard analytique", icon: <BarChart3 className="w-4 h-4" />, category: "Analytics" },
  { id: "analytics_export", label: "Exporter les données", description: "Télécharger les rapports", icon: <BarChart3 className="w-4 h-4" />, category: "Analytics" },
  { id: "visitors_view", label: "Voir les visiteurs", description: "Carte et historique", icon: <Globe className="w-4 h-4" />, category: "Analytics" },
  
  // Administration
  { id: "users_view", label: "Voir les utilisateurs", description: "Liste des utilisateurs", icon: <Users className="w-4 h-4" />, category: "Administration" },
  { id: "users_manage", label: "Gérer les utilisateurs", description: "Créer/supprimer des comptes", icon: <Users className="w-4 h-4" />, category: "Administration" },
  { id: "roles_manage", label: "Gérer les rôles", description: "Attribuer des permissions", icon: <Shield className="w-4 h-4" />, category: "Administration" },
  { id: "settings_manage", label: "Paramètres du site", description: "Configuration générale", icon: <Settings className="w-4 h-4" />, category: "Administration" },
  { id: "backup_manage", label: "Gestion des backups", description: "Export/import des données", icon: <Database className="w-4 h-4" />, category: "Administration" },
  { id: "branding_manage", label: "Personnalisation", description: "Logo, couleurs, thème", icon: <Palette className="w-4 h-4" />, category: "Administration" },
];

// Default permissions by role
const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  admin: PERMISSIONS.map(p => p.id), // All permissions
  moderator: [
    "news_view", "news_create", "news_edit",
    "pages_manage", "sections_manage", "media_manage",
    "messages_view", "messages_reply",
    "partnerships_view", "partnerships_manage", "testimonials_manage",
    "analytics_view", "visitors_view",
    "users_view"
  ],
  user: [
    "news_view",
    "messages_view",
    "partnerships_view",
    "analytics_view"
  ]
};

const AdminPermissions = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([
    { role: "admin", permissions: Object.fromEntries(PERMISSIONS.map(p => [p.id, true])) },
    { role: "moderator", permissions: Object.fromEntries(PERMISSIONS.map(p => [p.id, DEFAULT_ROLE_PERMISSIONS.moderator.includes(p.id)])) },
    { role: "user", permissions: Object.fromEntries(PERMISSIONS.map(p => [p.id, DEFAULT_ROLE_PERMISSIONS.user.includes(p.id)])) },
  ]);
  const [selectedRole, setSelectedRole] = useState<AppRole>("moderator");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [...new Set(PERMISSIONS.map(p => p.category))];

  const getCurrentRolePermissions = () => {
    return rolePermissions.find(rp => rp.role === selectedRole)?.permissions || {};
  };

  const togglePermission = (permissionId: string) => {
    if (selectedRole === "admin") {
      toast.error("Les permissions admin ne peuvent pas être modifiées");
      return;
    }

    setRolePermissions(prev => prev.map(rp => {
      if (rp.role === selectedRole) {
        return {
          ...rp,
          permissions: {
            ...rp.permissions,
            [permissionId]: !rp.permissions[permissionId]
          }
        };
      }
      return rp;
    }));
    setHasChanges(true);
  };

  const toggleCategory = (category: string, enabled: boolean) => {
    if (selectedRole === "admin") {
      toast.error("Les permissions admin ne peuvent pas être modifiées");
      return;
    }

    const categoryPermissions = PERMISSIONS.filter(p => p.category === category).map(p => p.id);
    
    setRolePermissions(prev => prev.map(rp => {
      if (rp.role === selectedRole) {
        const updatedPermissions = { ...rp.permissions };
        categoryPermissions.forEach(pid => {
          updatedPermissions[pid] = enabled;
        });
        return { ...rp, permissions: updatedPermissions };
      }
      return rp;
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (selectedRole === "admin") return;
    
    setRolePermissions(prev => prev.map(rp => {
      if (rp.role === selectedRole) {
        return {
          ...rp,
          permissions: Object.fromEntries(
            PERMISSIONS.map(p => [p.id, DEFAULT_ROLE_PERMISSIONS[selectedRole].includes(p.id)])
          )
        };
      }
      return rp;
    }));
    setHasChanges(true);
    toast.info("Permissions réinitialisées aux valeurs par défaut");
  };

  const savePermissions = async () => {
    setIsSaving(true);
    
    // Simulate API call - in production, this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage for persistence demo
    localStorage.setItem("agricapital_permissions", JSON.stringify(rolePermissions));
    
    setIsSaving(false);
    setHasChanges(false);
    toast.success("Permissions sauvegardées avec succès");
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case "admin": return <Crown className="w-5 h-5" />;
      case "moderator": return <Shield className="w-5 h-5" />;
      case "user": return <Eye className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: AppRole) => {
    switch (role) {
      case "admin": return "text-red-500 bg-red-500/10";
      case "moderator": return "text-amber-500 bg-amber-500/10";
      case "user": return "text-blue-500 bg-blue-500/10";
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case "admin": return "Administrateur";
      case "moderator": return "Modérateur";
      case "user": return "Utilisateur";
    }
  };

  const currentPermissions = getCurrentRolePermissions();
  const enabledCount = Object.values(currentPermissions).filter(Boolean).length;

  return (
    <AdminLayout title="Gestion des Permissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Permissions & Rôles
            </h1>
            <p className="text-muted-foreground">Configurez les accès pour chaque type d'utilisateur</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetToDefaults} disabled={selectedRole === "admin"}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={savePermissions} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-4">
          {(["admin", "moderator", "user"] as AppRole[]).map((role) => {
            const roleData = rolePermissions.find(rp => rp.role === role);
            const count = Object.values(roleData?.permissions || {}).filter(Boolean).length;
            
            return (
              <Card 
                key={role}
                className={`cursor-pointer transition-all ${
                  selectedRole === role 
                    ? "ring-2 ring-primary border-primary" 
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getRoleColor(role)}`}>
                      {getRoleIcon(role)}
                    </div>
                    <div>
                      <p className="font-medium">{getRoleLabel(role)}</p>
                      <p className="text-xs text-muted-foreground">
                        {count}/{PERMISSIONS.length} permissions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Warning */}
        {selectedRole === "admin" && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">Rôle Administrateur</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Les administrateurs ont accès à toutes les fonctionnalités. Ces permissions ne peuvent pas être modifiées pour des raisons de sécurité.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Permissions pour {getRoleLabel(selectedRole)}</CardTitle>
                <CardDescription>
                  {enabledCount} permissions actives sur {PERMISSIONS.length}
                </CardDescription>
              </div>
              <Badge variant={selectedRole === "admin" ? "destructive" : "secondary"}>
                {selectedRole === "admin" ? (
                  <><Lock className="w-3 h-3 mr-1" /> Verrouillé</>
                ) : (
                  <><Unlock className="w-3 h-3 mr-1" /> Modifiable</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryPermissions = PERMISSIONS.filter(p => p.category === category);
                  const enabledInCategory = categoryPermissions.filter(p => currentPermissions[p.id]).length;
                  const allEnabled = enabledInCategory === categoryPermissions.length;
                  const noneEnabled = enabledInCategory === 0;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{category}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {enabledInCategory}/{categoryPermissions.length}
                          </span>
                          {selectedRole !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCategory(category, !allEnabled)}
                            >
                              {allEnabled ? "Désactiver tout" : "Activer tout"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {categoryPermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              currentPermissions[permission.id]
                                ? "bg-primary/5 border-primary/20"
                                : "bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded ${
                                currentPermissions[permission.id]
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {permission.icon}
                              </div>
                              <div>
                                <p className="font-medium">{permission.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={currentPermissions[permission.id]}
                              onCheckedChange={() => togglePermission(permission.id)}
                              disabled={selectedRole === "admin"}
                            />
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé des Accès</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {(["admin", "moderator", "user"] as AppRole[]).map((role) => {
                const roleData = rolePermissions.find(rp => rp.role === role);
                const permissions = roleData?.permissions || {};
                
                return (
                  <div key={role} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded ${getRoleColor(role)}`}>
                        {getRoleIcon(role)}
                      </div>
                      <span className="font-medium">{getRoleLabel(role)}</span>
                    </div>
                    <div className="space-y-1">
                      {categories.map(cat => {
                        const catPerms = PERMISSIONS.filter(p => p.category === cat);
                        const enabled = catPerms.filter(p => permissions[p.id]).length;
                        const percent = Math.round((enabled / catPerms.length) * 100);
                        
                        return (
                          <div key={cat} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{cat}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-xs w-8">{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPermissions;
