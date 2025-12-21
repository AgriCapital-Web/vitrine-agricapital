import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  User, 
  Bot, 
  Search, 
  Calendar, 
  Globe, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface ChatLog {
  id: string;
  session_id: string;
  user_message: string;
  assistant_response: string;
  language: string | null;
  created_at: string;
}

interface GroupedConversation {
  session_id: string;
  messages: ChatLog[];
  language: string | null;
  first_message_at: string;
  last_message_at: string;
}

const AdminAIConversations = () => {
  const [conversations, setConversations] = useState<GroupedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    todayMessages: 0,
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Group by session_id
      const grouped = (data || []).reduce((acc, log) => {
        const existing = acc.find(g => g.session_id === log.session_id);
        if (existing) {
          existing.messages.push(log);
          if (new Date(log.created_at) < new Date(existing.first_message_at)) {
            existing.first_message_at = log.created_at;
          }
          if (new Date(log.created_at) > new Date(existing.last_message_at)) {
            existing.last_message_at = log.created_at;
          }
        } else {
          acc.push({
            session_id: log.session_id,
            messages: [log],
            language: log.language,
            first_message_at: log.created_at,
            last_message_at: log.created_at,
          });
        }
        return acc;
      }, [] as GroupedConversation[]);

      // Sort messages within each conversation
      grouped.forEach(conv => {
        conv.messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });

      setConversations(grouped);

      // Calculate stats
      const today = new Date().toDateString();
      const todayMessages = (data || []).filter(
        log => new Date(log.created_at).toDateString() === today
      ).length;

      setStats({
        totalConversations: grouped.length,
        totalMessages: data?.length || 0,
        todayMessages,
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const getLanguageLabel = (lang: string | null) => {
    const labels: Record<string, string> = {
      fr: 'Français',
      en: 'English',
      ar: 'العربية',
      es: 'Español',
      de: 'Deutsch',
      zh: '中文',
    };
    return labels[lang || 'fr'] || lang || 'Français';
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return conv.messages.some(
      msg => 
        msg.user_message.toLowerCase().includes(searchLower) ||
        msg.assistant_response.toLowerCase().includes(searchLower) ||
        msg.session_id.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    const rows: string[] = ['Session ID,Date,Langue,Message Utilisateur,Réponse Assistant'];
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        const userMsg = msg.user_message.replace(/"/g, '""').replace(/\n/g, ' ');
        const assistantMsg = msg.assistant_response.replace(/"/g, '""').replace(/\n/g, ' ');
        rows.push(
          `"${msg.session_id}","${format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm')}","${msg.language || 'fr'}","${userMsg}","${assistantMsg}"`
        );
      });
    });
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversations-ia-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  return (
    <AdminLayout title="Conversations IA">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conversations IA</h1>
            <p className="text-muted-foreground">Historique complet des échanges avec KAPITA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchConversations} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalConversations}</p>
                  <p className="text-sm text-muted-foreground">Conversations totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-sm text-muted-foreground">Messages totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayMessages}</p>
                  <p className="text-sm text-muted-foreground">Messages aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Chargement des conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune conversation trouvée</p>
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conv) => (
              <Card key={conv.session_id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSession(conv.session_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">
                          Visiteur: {conv.session_id.slice(0, 20)}...
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(conv.first_message_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                          <span className="mx-1">•</span>
                          <Globe className="h-3 w-3" />
                          {getLanguageLabel(conv.language)}
                          <span className="mx-1">•</span>
                          <Badge variant="secondary" className="text-xs">
                            {conv.messages.length} messages
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {expandedSessions.has(conv.session_id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSessions.has(conv.session_id) && (
                  <CardContent className="border-t">
                    <ScrollArea className="max-h-96">
                      <div className="space-y-4 p-4">
                        {conv.messages.map((msg, idx) => (
                          <div key={msg.id || idx} className="space-y-3">
                            {/* User message */}
                            <div className="flex gap-3">
                              <div className="p-2 bg-blue-100 rounded-full h-fit">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">Visiteur</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(msg.created_at), "HH:mm")}
                                  </span>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                                  {msg.user_message}
                                </div>
                              </div>
                            </div>
                            
                            {/* Assistant response */}
                            {msg.assistant_response && msg.assistant_response !== 'streaming' && (
                              <div className="flex gap-3">
                                <div className="p-2 bg-green-100 rounded-full h-fit">
                                  <Bot className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-green-700">KAPITA</span>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                                    {msg.assistant_response}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAIConversations;
