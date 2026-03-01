import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, MessageSquare, Users, Handshake, 
  Mail, Settings, Search, Bell, Shield, TrendingUp, 
  Database, Globe, Bot, UserCircle, Newspaper, Home
} from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const menuItems = [
  { icon: BarChart3, label: "Tableau de bord", path: "/admin/dashboard" },
  { icon: TrendingUp, label: "Analytiques", path: "/admin/advanced-analytics" },
  { divider: true, label: "Contenu" },
  { icon: Newspaper, label: "Actualités / Blogs", path: "/admin/news" },
  { icon: MessageSquare, label: "Témoignages", path: "/admin/testimonials" },
  { icon: Users, label: "Newsletter", path: "/admin/newsletter" },
  { icon: Handshake, label: "Partenariats", path: "/admin/partnership-requests" },
  { divider: true, label: "Communication" },
  { icon: Mail, label: "Messagerie", path: "/admin/communications" },
  { icon: Bot, label: "Conversations IA", path: "/admin/ai-conversations" },
  { icon: UserCircle, label: "Contacts Visiteurs", path: "/admin/visitor-contacts" },
  { divider: true, label: "Configuration" },
  { icon: Globe, label: "Traductions", path: "/admin/translations" },
  { icon: Search, label: "SEO", path: "/admin/seo" },
  { icon: Bell, label: "Notifications", path: "/admin/push-notifications" },
  { icon: Shield, label: "Utilisateurs", path: "/admin/users" },
  { icon: Database, label: "Base de données", path: "/admin/database" },
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