import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Mail, Inbox, Send, Archive, Trash2, Star, StarOff, RefreshCw,
  Search, Filter, MoreVertical, Reply, Forward, Paperclip,
  ChevronLeft, Clock, User, AlertCircle, CheckCircle, Loader2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
  isStarred?: boolean;
}

const AdminInbox = () => {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox");

  // Fetch emails from edge function
  const { data: emailData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-emails", activeFolder],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const response = await supabase.functions.invoke("fetch-imap-emails", {
        body: { folder: activeFolder.toUpperCase(), limit: 50 },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });

  // Also fetch contact_messages from database
  const { data: contactMessages } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    },
  });

  const emails = emailData?.emails || [];
  const isDemo = emailData?.isDemo;

  // Combine IMAP emails with contact form messages
  const allMessages = [
    ...emails,
    ...(contactMessages?.map(msg => ({
      id: msg.id,
      from: msg.email,
      to: "contact@agricapital.ci",
      subject: msg.subject || "Message de contact",
      date: msg.created_at,
      body: `<strong>De:</strong> ${msg.name}<br/><strong>Email:</strong> ${msg.email}<br/><br/>${msg.message}`,
      isRead: msg.status === "read",
      isContactForm: true,
    })) || []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredMessages = allMessages.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = filteredMessages.filter(e => !e.isRead).length;

  const handleSelectEmail = (email: Email & { isContactForm?: boolean }) => {
    setSelectedEmail(email);
    if (email.isContactForm && !email.isRead) {
      markAsReadMutation.mutate(email.id);
    }
  };

  const folders = [
    { id: "inbox", label: "Boîte de réception", icon: Inbox, count: unreadCount },
    { id: "sent", label: "Envoyés", icon: Send, count: 0 },
    { id: "starred", label: "Favoris", icon: Star, count: 0 },
    { id: "archive", label: "Archives", icon: Archive, count: 0 },
    { id: "trash", label: "Corbeille", icon: Trash2, count: 0 },
  ];

  return (
    <AdminLayout title="Boîte Mail">
      <div className="flex h-[calc(100vh-180px)] -m-6">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card p-4 flex flex-col">
          <Button className="w-full mb-6 bg-primary">
            <Mail className="w-4 h-4 mr-2" />
            Nouveau message
          </Button>

          <nav className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeFolder === folder.id 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{folder.label}</span>
                  </div>
                  {folder.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          {/* IMAP Status */}
          <div className="mt-auto pt-4 border-t">
            {isDemo ? (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <div>
                  <p className="font-medium">Mode démo</p>
                  <p className="text-amber-500">Configurez IMAP pour les vrais emails</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <div>
                  <p className="font-medium">IMAP connecté</p>
                  <p className="text-green-500">contact@agricapital.ci</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email list */}
        <div className="w-96 border-r flex flex-col">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{folders.find(f => f.id === activeFolder)?.label}</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucun message</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredMessages.map((email: Email & { isContactForm?: boolean }) => (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                      selectedEmail?.id === email.id ? "bg-muted" : ""
                    } ${!email.isRead ? "bg-blue-50/50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!email.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                          <span className={`text-sm truncate ${!email.isRead ? "font-semibold" : ""}`}>
                            {email.from.split("<")[0].trim() || email.from}
                          </span>
                        </div>
                        <p className={`text-sm truncate mt-1 ${!email.isRead ? "font-medium" : "text-muted-foreground"}`}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {email.body.replace(/<[^>]*>/g, "").substring(0, 80)}...
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(email.date), { addSuffix: true, locale: fr })}
                        </p>
                        {email.isContactForm && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Formulaire
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Email content */}
        <div className="flex-1 flex flex-col">
          {selectedEmail ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setSelectedEmail(null)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Reply className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Forward className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Star className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Marquer comme non lu</DropdownMenuItem>
                      <DropdownMenuItem>Signaler comme spam</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl">
                  <h1 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h1>
                  
                  <div className="flex items-start gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{selectedEmail.from}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedEmail.date), "PPP 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        À: {selectedEmail.to}
                      </p>
                    </div>
                  </div>

                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>
              </ScrollArea>

              {/* Quick reply */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input placeholder="Répondre rapidement..." className="flex-1" />
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Sélectionnez un email</p>
                <p className="text-sm">Cliquez sur un message pour l'afficher</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInbox;
