import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, MessageSquare, Users, Image, Handshake, 
  Mail, Settings, FileText, Home, Send, Bell, Search, 
  Shield, TrendingUp, Layout, Database, Palette, Globe,
  FormInput, ImageIcon, MailOpen, Inbox,
  Bot, Reply, UserCircle
} from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const menuItems = [
  { icon: BarChart3, label: "Tableau de bord", path: "/admin/dashboard" },
  { icon: TrendingUp, label: "Analytiques", path: "/admin/analytics" },
  { icon: TrendingUp, label: "Analytics Avancés", path: "/admin/advanced-analytics" },
  { divider: true, label: "Site Web" },
  { icon: Layout, label: "Constructeur de site", path: "/admin/site-builder" },
  { divider: true, label: "Données" },
  { icon: MessageSquare, label: "Témoignages", path: "/admin/testimonials" },
  { icon: Users, label: "Abonnés Newsletter", path: "/admin/newsletter" },
  { icon: Handshake, label: "Partenariats", path: "/admin/partnerships" },
  { divider: true, label: "Communication" },
  { icon: Inbox, label: "Boîte de réception", path: "/admin/inbox" },
  { icon: Mail, label: "Messages Contact", path: "/admin/contact-messages" },
  { icon: Send, label: "Messagerie", path: "/admin/messaging" },
  { icon: MailOpen, label: "Emailing", path: "/admin/emailing" },
  { divider: true, label: "Intelligence Artificielle" },
  { icon: Bot, label: "Conversations IA", path: "/admin/ai-conversations" },
  { icon: UserCircle, label: "Contacts Visiteurs", path: "/admin/visitor-contacts" },
  { icon: Reply, label: "Réponses Auto", path: "/admin/auto-responses" },
  { divider: true, label: "Configuration" },
  { icon: Database, label: "CMS Avancé", path: "/admin/cms" },
  { icon: Palette, label: "Design & Branding", path: "/admin/branding" },
  { icon: Globe, label: "Langues & Traductions", path: "/admin/translations" },
  { icon: Search, label: "SEO", path: "/admin/seo" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: Bell, label: "Notifications Push", path: "/admin/push-notifications" },
  { icon: Shield, label: "Utilisateurs", path: "/admin/users" },
  { icon: Shield, label: "Permissions", path: "/admin/permissions" },
  { icon: Database, label: "Backup & Export", path: "/admin/backup" },
  { icon: Settings, label: "Paramètres", path: "/admin/settings" },
];

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const location = useLocation();

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className="w-64 lg:w-64 bg-card border-r border-border h-[100dvh] lg:fixed left-0 top-0 z-40 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3" onClick={handleClick}>
          <img src={logo} alt="AgriCapital" className="h-10 w-auto" />
          <div>
            <h1 className="font-bold text-foreground">AgriCapital</h1>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              if ('divider' in item && item.divider) {
                return (
                  <li key={`divider-${index}`} className="pt-4 pb-2">
                    <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </span>
                  </li>
                );
              }
              
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path!}
                    onClick={handleClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <Link
          to="/"
          onClick={handleClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span>Retour au site</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;