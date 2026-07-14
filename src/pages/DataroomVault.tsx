import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Video, Presentation, Link2, LogOut, ShieldCheck } from "lucide-react";

type Signatory = { id: string; full_name: string; email: string; profile_type: string };
type Publication = {
  id: string; type: string; title: string; description: string | null;
  category: string | null; cover_url: string | null; views_count: number;
  created_at: string;
};

const typeIcon: Record<string, any> = {
  document: FileText, photo: ImageIcon, video: Video, presentation: Presentation, platform: Link2,
};

export default function DataroomVault() {
  const navigate = useNavigate();
  const [signatory, setSignatory] = useState<Signatory | null>(null);
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const raw = localStorage.getItem("dataroom_signatory");
    if (!raw) { navigate("/dataroom", { replace: true }); return; }
    setSignatory(JSON.parse(raw));
    (async () => {
      const { data } = await supabase.from("dataroom_publications")
        .select("*").eq("is_published", true).order("created_at", { ascending: false });
      setPubs((data ?? []) as any);
    })();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("dataroom_signatory");
    navigate("/dataroom");
  };

  const filtered = filter === "all" ? pubs : pubs.filter((p) => p.type === filter);

  return (
    <div className="min-h-screen bg-background relative">
      <Helmet><title>AgriCapital Cloud — Portail</title></Helmet>
      {/* Watermark */}
      {signatory && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-40 select-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] flex flex-wrap gap-16 rotate-[-25deg] text-primary font-bold text-xl p-16">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i}>AgriCapital · {signatory.email}</span>
            ))}
          </div>
        </div>
      )}

      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold text-sm">AgriCapital Cloud</div>
              <div className="text-xs text-muted-foreground">{signatory?.full_name} · {signatory?.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-2" />Quitter</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {[["all","Tout"],["document","Documents"],["photo","Photos"],["video","Vidéos"],["presentation","Présentations"],["platform","Plateformes"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
              {l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Aucune publication disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const Icon = typeIcon[p.type] ?? FileText;
              return (
                <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-12 h-12 text-primary/60" />
                    )}
                    <span className="absolute top-2 left-2 text-[10px] uppercase font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded">
                      {p.type}
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">{p.title}</h3>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>}
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{p.category ?? "—"}</span>
                      <span>{p.views_count} vues</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
