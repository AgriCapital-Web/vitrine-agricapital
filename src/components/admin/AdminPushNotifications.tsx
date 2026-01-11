import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, BellRing, BellOff, Settings, Volume2, VolumeX, 
  MessageSquare, Users, Mail, AlertCircle, CheckCircle2,
  Smartphone, Monitor, Trash2, TestTube
} from "lucide-react";
import { toast } from "sonner";

interface NotificationSettings {
  partnership_requests: boolean;
  contact_messages: boolean;
  newsletter_subscriptions: boolean;
  testimonials: boolean;
  sound_enabled: boolean;
  desktop_enabled: boolean;
}

interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const AdminPushNotifications = () => {
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>({
    partnership_requests: true,
    contact_messages: true,
    newsletter_subscriptions: true,
    testimonials: true,
    sound_enabled: true,
    desktop_enabled: true,
  });

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Fetch recent notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-push-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as RealtimeNotification[];
    },
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("Les notifications ne sont pas supportées par ce navigateur");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsEnabled(result === "granted");
      
      if (result === "granted") {
        toast.success("Notifications activées !");
        // Show a test notification
        new Notification("AgriCapital Admin", {
          body: "Les notifications sont maintenant activées !",
          icon: "/favicon.png",
          tag: "permission-granted",
        });
      } else if (result === "denied") {
        toast.error("Permission refusée. Activez les notifications dans les paramètres du navigateur.");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Erreur lors de la demande de permission");
    }
  }, []);

  // Show desktop notification
  const showNotification = useCallback((title: string, body: string, tag?: string) => {
    if (!settings.desktop_enabled || permission !== "granted") return;

    const notification = new Notification(title, {
      body,
      icon: "/favicon.png",
      tag: tag || `notification-${Date.now()}`,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Play sound if enabled
    if (settings.sound_enabled) {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [permission, settings.desktop_enabled, settings.sound_enabled]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!isEnabled) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Partnership requests channel
    if (settings.partnership_requests) {
      const partnershipChannel = supabase
        .channel("partnership-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "partnership_requests" },
          (payload) => {
            const data = payload.new as any;
            showNotification(
              "Nouvelle demande de partenariat",
              `${data.first_name} ${data.last_name} - ${data.partner_type}`,
              `partnership-${data.id}`
            );
            queryClient.invalidateQueries({ queryKey: ["admin-push-notifications"] });
          }
        )
        .subscribe();
      channels.push(partnershipChannel);
    }

    // Contact messages channel
    if (settings.contact_messages) {
      const contactChannel = supabase
        .channel("contact-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "contact_messages" },
          (payload) => {
            const data = payload.new as any;
            showNotification(
              "Nouveau message de contact",
              `De: ${data.name} - ${data.subject || "Sans sujet"}`,
              `contact-${data.id}`
            );
            queryClient.invalidateQueries({ queryKey: ["admin-push-notifications"] });
          }
        )
        .subscribe();
      channels.push(contactChannel);
    }

    // Newsletter subscriptions channel
    if (settings.newsletter_subscriptions) {
      const newsletterChannel = supabase
        .channel("newsletter-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "newsletter_subscribers" },
          (payload) => {
            const data = payload.new as any;
            showNotification(
              "Nouvel abonné newsletter",
              `Email: ${data.email}`,
              `newsletter-${data.id}`
            );
            queryClient.invalidateQueries({ queryKey: ["admin-push-notifications"] });
          }
        )
        .subscribe();
      channels.push(newsletterChannel);
    }

    // Testimonials channel
    if (settings.testimonials) {
      const testimonialChannel = supabase
        .channel("testimonial-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "testimonials" },
          (payload) => {
            const data = payload.new as any;
            showNotification(
              "Nouveau témoignage",
              `De: ${data.first_name} ${data.last_name}`,
              `testimonial-${data.id}`
            );
            queryClient.invalidateQueries({ queryKey: ["admin-push-notifications"] });
          }
        )
        .subscribe();
      channels.push(testimonialChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [isEnabled, settings, showNotification, queryClient]);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-push-notifications"] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-push-notifications"] });
      toast.success("Toutes les notifications marquées comme lues");
    },
  });

  // Test notification
  const sendTestNotification = () => {
    if (permission !== "granted") {
      toast.error("Veuillez d'abord activer les notifications");
      return;
    }
    showNotification(
      "Test de notification",
      "Ceci est une notification de test pour vérifier que tout fonctionne correctement.",
      "test-notification"
    );
    toast.success("Notification de test envoyée !");
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "partnership_request":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "contact_message":
        return <Mail className="w-4 h-4 text-green-500" />;
      case "newsletter_subscription":
        return <BellRing className="w-4 h-4 text-purple-500" />;
      case "testimonial":
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications Push
          </CardTitle>
          <CardDescription>
            Recevez des alertes en temps réel pour les nouvelles demandes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {permission === "granted" ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : permission === "denied" ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Bell className="w-6 h-6 text-amber-500" />
              )}
              <div>
                <p className="font-medium">
                  {permission === "granted"
                    ? "Notifications activées"
                    : permission === "denied"
                    ? "Notifications bloquées"
                    : "Notifications non configurées"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {permission === "granted"
                    ? "Vous recevrez des alertes en temps réel"
                    : permission === "denied"
                    ? "Modifiez les paramètres du navigateur pour activer"
                    : "Cliquez pour activer les notifications"}
                </p>
              </div>
            </div>
            {permission !== "granted" && (
              <Button onClick={requestPermission}>
                <BellRing className="w-4 h-4 mr-2" />
                Activer
              </Button>
            )}
          </div>

          {/* Notification Types Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Types de notifications
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <Label>Demandes de partenariat</Label>
                </div>
                <Switch
                  checked={settings.partnership_requests}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, partnership_requests: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-500" />
                  <Label>Messages de contact</Label>
                </div>
                <Switch
                  checked={settings.contact_messages}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, contact_messages: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-purple-500" />
                  <Label>Abonnements newsletter</Label>
                </div>
                <Switch
                  checked={settings.newsletter_subscriptions}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, newsletter_subscriptions: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <Label>Témoignages</Label>
                </div>
                <Switch
                  checked={settings.testimonials}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, testimonials: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Audio & Display Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Options supplémentaires</h4>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                {settings.sound_enabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <Label>Son</Label>
                <Switch
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, sound_enabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Monitor className="w-4 h-4" />
                <Label>Bureau</Label>
                <Switch
                  checked={settings.desktop_enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, desktop_enabled: checked }))
                  }
                />
              </div>

              <Button variant="outline" onClick={sendTestNotification}>
                <TestTube className="w-4 h-4 mr-2" />
                Tester
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Notifications récentes
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} non lues</Badge>
              )}
            </CardTitle>
            <CardDescription>Historique des alertes reçues</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    notification.is_read ? "bg-muted/30" : "bg-primary/5 border border-primary/20"
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune notification</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPushNotifications;
