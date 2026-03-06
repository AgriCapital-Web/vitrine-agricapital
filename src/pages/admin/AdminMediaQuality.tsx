import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, CheckCircle2, XCircle, Image, Loader2, 
  Trash2, FolderOpen, RefreshCw, FileWarning, Zap
} from "lucide-react";
import { toast } from "sonner";

interface MediaAnalysis {
  src: string;
  name: string;
  width: number;
  height: number;
  sizeKB: number;
  format: string;
  score: number; // 0-100
  issues: string[];
  category: string;
  suggestedCategory: string;
  deleteRecommended: boolean;
}

// All project images to audit
const projectImages = [
  { src: "/src/assets/ag-2026-1.jpg", name: "ag-2026-1.jpg" },
  { src: "/src/assets/ag-2026-2.jpg", name: "ag-2026-2.jpg" },
  { src: "/src/assets/ag-2026-3.jpg", name: "ag-2026-3.jpg" },
  { src: "/src/assets/ag-2026-4.jpg", name: "ag-2026-4.jpg" },
  { src: "/src/assets/ag-2026-5.jpg", name: "ag-2026-5.jpg" },
  { src: "/src/assets/article-formation.jpg", name: "article-formation.jpg" },
  { src: "/src/assets/article-palmier-solidaire.jpg", name: "article-palmier-solidaire.jpg" },
  { src: "/src/assets/article-pepiniere.jpg", name: "article-pepiniere.jpg" },
  { src: "/src/assets/article-prospection.jpg", name: "article-prospection.jpg" },
  { src: "/src/assets/article-vavoua.jpg", name: "article-vavoua.jpg" },
  { src: "/src/assets/community-meeting-1.jpg", name: "community-meeting-1.jpg" },
  { src: "/src/assets/community-meeting-2.jpg", name: "community-meeting-2.jpg" },
  { src: "/src/assets/community-meeting-3.png", name: "community-meeting-3.png" },
  { src: "/src/assets/community-meeting-4.jpg", name: "community-meeting-4.jpg" },
  { src: "/src/assets/community-meeting-5.jpg", name: "community-meeting-5.jpg" },
  { src: "/src/assets/community-meeting-6.jpg", name: "community-meeting-6.jpg" },
  { src: "/src/assets/community-meeting-7.jpg", name: "community-meeting-7.jpg" },
  { src: "/src/assets/community-meeting-8.jpg", name: "community-meeting-8.jpg" },
  { src: "/src/assets/founder-inocent-koffi.jpg", name: "founder-inocent-koffi.jpg" },
  { src: "/src/assets/founder-palm-field.jpg", name: "founder-palm-field.jpg" },
  { src: "/src/assets/jalon-1.jpg", name: "jalon-1.jpg" },
  { src: "/src/assets/jalon-2.jpg", name: "jalon-2.jpg" },
  { src: "/src/assets/jalon-3.jpg", name: "jalon-3.jpg" },
  { src: "/src/assets/jalon-4.jpg", name: "jalon-4.jpg" },
  { src: "/src/assets/jalon-5.jpg", name: "jalon-5.jpg" },
  { src: "/src/assets/jalon-6.jpg", name: "jalon-6.jpg" },
  { src: "/src/assets/jalon-7.jpg", name: "jalon-7.jpg" },
  { src: "/src/assets/les-palmistes-logo.jpeg", name: "les-palmistes-logo.jpeg" },
  { src: "/src/assets/logo-agricapital-white.png", name: "logo-agricapital-white.png" },
  { src: "/src/assets/logo-white.png", name: "logo-white.png" },
  { src: "/src/assets/logo.png", name: "logo.png" },
  { src: "/src/assets/nursery-dec-2025-1.jpg", name: "nursery-dec-2025-1.jpg" },
  { src: "/src/assets/nursery-dec-2025-2.jpg", name: "nursery-dec-2025-2.jpg" },
  { src: "/src/assets/nursery-inspection-2026.jpg", name: "nursery-inspection-2026.jpg" },
  { src: "/src/assets/nursery-palm.jpg", name: "nursery-palm.jpg" },
  { src: "/src/assets/nursery-site.webp", name: "nursery-site.webp" },
  { src: "/src/assets/palm-oil-production.jpg", name: "palm-oil-production.jpg" },
  { src: "/src/assets/poster-agricapital.jpg", name: "poster-agricapital.jpg" },
  { src: "/src/assets/poster-agricapital.png", name: "poster-agricapital.png" },
  { src: "/src/assets/prospect-meeting-9.jpg", name: "prospect-meeting-9.jpg" },
  { src: "/src/assets/prospect-meeting-10.jpg", name: "prospect-meeting-10.jpg" },
  { src: "/src/assets/prospect-meeting-11.jpg", name: "prospect-meeting-11.jpg" },
  { src: "/src/assets/prospect-meeting-12.jpg", name: "prospect-meeting-12.jpg" },
  { src: "/src/assets/prospect-meeting-13.jpg", name: "prospect-meeting-13.jpg" },
  { src: "/src/assets/prospect-meeting-14.jpg", name: "prospect-meeting-14.jpg" },
  { src: "/src/assets/vavoua-land-2026.jpg", name: "vavoua-land-2026.jpg" },
  { src: "/src/assets/vavoua-site-2026.jpg", name: "vavoua-site-2026.jpg" },
];

const CATEGORIES = [
  { value: "actualite", label: "📰 Actualité", color: "bg-blue-100 text-blue-800" },
  { value: "terrain", label: "🌿 Terrain / Pépinière", color: "bg-green-100 text-green-800" },
  { value: "institutionnel", label: "🏛️ Institutionnel", color: "bg-purple-100 text-purple-800" },
  { value: "communautaire", label: "🤝 Communautaire", color: "bg-orange-100 text-orange-800" },
  { value: "logo", label: "🎨 Logo / Branding", color: "bg-pink-100 text-pink-800" },
  { value: "doublon", label: "⚠️ Doublon potentiel", color: "bg-yellow-100 text-yellow-800" },
];

function categorizeImage(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("logo") || n.includes("poster") || n.includes("branding")) return "logo";
  if (n.includes("article") || n.includes("ag-2026")) return "actualite";
  if (n.includes("nursery") || n.includes("palm") || n.includes("vavoua") || n.includes("jalon")) return "terrain";
  if (n.includes("community") || n.includes("prospect") || n.includes("meeting")) return "communautaire";
  if (n.includes("founder")) return "institutionnel";
  return "actualite";
}

function analyzeImage(img: HTMLImageElement, name: string): MediaAnalysis {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const issues: string[] = [];
  let score = 100;
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";

  // Resolution check
  if (w < 400 || h < 300) {
    issues.push("Résolution trop faible (< 400x300)");
    score -= 30;
  } else if (w < 800 || h < 600) {
    issues.push("Résolution moyenne (< 800x600)");
    score -= 10;
  }

  // Aspect ratio check
  const ratio = w / h;
  if (ratio > 3 || ratio < 0.3) {
    issues.push("Format inhabituel (ratio extrême)");
    score -= 15;
  }

  // Format check
  if (ext === "png" && !name.includes("logo") && !name.includes("poster")) {
    issues.push("PNG non-logo (préférer JPG/WebP)");
    score -= 5;
  }

  // Duplicate detection
  const baseName = name.replace(/[-_]\d+\.\w+$/, "");
  const duplicateCount = projectImages.filter(i => 
    i.name.replace(/[-_]\d+\.\w+$/, "") === baseName
  ).length;
  if (duplicateCount > 3) {
    issues.push(`Série de ${duplicateCount} images similaires`);
    score -= 5;
  }

  // Case-sensitive duplicate check
  const lowerName = name.toLowerCase();
  const caseVariants = projectImages.filter(i => 
    i.name.toLowerCase() === lowerName && i.name !== name
  );
  if (caseVariants.length > 0) {
    issues.push("Doublon avec casse différente");
    score -= 20;
  }

  const suggestedCategory = categorizeImage(name);
  const deleteRecommended = score < 40 || caseVariants.length > 0;

  return {
    src: img.src,
    name,
    width: w,
    height: h,
    sizeKB: 0, // Can't get real file size from img element
    format: ext.toUpperCase(),
    score: Math.max(0, score),
    issues,
    category: suggestedCategory,
    suggestedCategory,
    deleteRecommended,
  };
}

const AdminMediaQuality = () => {
  const [analyses, setAnalyses] = useState<MediaAnalysis[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterIssue, setFilterIssue] = useState("all");

  const runScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    const results: MediaAnalysis[] = [];

    for (let i = 0; i < projectImages.length; i++) {
      const item = projectImages[i];
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => {
            results.push(analyzeImage(img, item.name));
            resolve();
          };
          img.onerror = () => {
            results.push({
              src: item.src,
              name: item.name,
              width: 0, height: 0, sizeKB: 0,
              format: item.name.split(".").pop()?.toUpperCase() || "?",
              score: 0,
              issues: ["❌ Image introuvable ou corrompue"],
              category: categorizeImage(item.name),
              suggestedCategory: categorizeImage(item.name),
              deleteRecommended: true,
            });
            resolve();
          };
          // Use the import path for Vite
          const modules = import.meta.glob("/src/assets/*", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
          const key = `/src/assets/${item.name}`;
          img.src = modules[key] || item.src;
        });
      } catch {
        // skip
      }
      setScanProgress(Math.round(((i + 1) / projectImages.length) * 100));
    }

    setAnalyses(results.sort((a, b) => a.score - b.score));
    setIsScanning(false);

    // Auto-select recommended deletions
    const toDelete = new Set<string>();
    results.filter(r => r.deleteRecommended).forEach(r => toDelete.add(r.name));
    setSelectedForDelete(toDelete);

    toast.success(`Analyse terminée : ${results.length} médias scannés`);
  }, []);

  useEffect(() => { runScan(); }, [runScan]);

  const filteredAnalyses = analyses.filter(a => {
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    if (filterIssue === "issues" && a.issues.length === 0) return false;
    if (filterIssue === "ok" && a.issues.length > 0) return false;
    if (filterIssue === "delete" && !a.deleteRecommended) return false;
    return true;
  });

  const stats = {
    total: analyses.length,
    excellent: analyses.filter(a => a.score >= 80).length,
    warning: analyses.filter(a => a.score >= 40 && a.score < 80).length,
    critical: analyses.filter(a => a.score < 40).length,
    avgScore: analyses.length ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length) : 0,
  };

  const categoryGroups = CATEGORIES.map(cat => ({
    ...cat,
    count: analyses.filter(a => a.category === cat.value).length,
  }));

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800 border-green-200">✓ {score}%</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⚠ {score}%</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">✗ {score}%</Badge>;
  };

  return (
    <AdminLayout title="Qualité Média & Tri Photos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">Détection automatique des images floues, lourdes ou hors format</p>
          <Button onClick={runScan} disabled={isScanning} className="gap-2">
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isScanning ? "Analyse en cours..." : "Relancer le scan"}
          </Button>
        </div>

        {isScanning && (
          <Card>
            <CardContent className="py-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyse des médias...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!isScanning && analyses.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Image className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
                <p className="text-xs text-muted-foreground">Excellentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                <p className="text-xs text-muted-foreground">À améliorer</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Critiques</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="quality">
          <TabsList>
            <TabsTrigger value="quality">🔍 Qualité</TabsTrigger>
            <TabsTrigger value="categories">📁 Par catégorie</TabsTrigger>
            <TabsTrigger value="cleanup">🗑️ Nettoyage</TabsTrigger>
          </TabsList>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <div className="flex gap-3">
              <Select value={filterIssue} onValueChange={setFilterIssue}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les images</SelectItem>
                  <SelectItem value="issues">Avec problèmes</SelectItem>
                  <SelectItem value="ok">Sans problème</SelectItem>
                  <SelectItem value="delete">Suppression suggérée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnalyses.map((a) => (
                <Card key={a.name} className={a.deleteRecommended ? "border-red-300 bg-red-50/30" : ""}>
                  <div className="aspect-video relative bg-muted overflow-hidden rounded-t-lg">
                    <img 
                      src={a.src} 
                      alt={a.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    <div className="absolute top-2 right-2">
                      {getScoreBadge(a.score)}
                    </div>
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{a.width}×{a.height}</span>
                      <span>•</span>
                      <span>{a.format}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORIES.find(c => c.value === a.category)?.label || a.category}
                    </Badge>
                    {a.issues.length > 0 && (
                      <div className="space-y-1">
                        {a.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-destructive">
                            <FileWarning className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {categoryGroups.filter(g => g.count > 0).map((group) => (
              <div key={group.value}>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={group.color}>{group.label}</Badge>
                  <span className="text-sm text-muted-foreground">{group.count} images</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {analyses
                    .filter(a => a.category === group.value)
                    .map((a) => (
                      <div key={a.name} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={a.src} 
                            alt={a.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                          />
                        </div>
                        <div className="absolute top-1 right-1">{getScoreBadge(a.score)}</div>
                        <p className="text-[10px] mt-1 truncate text-muted-foreground">{a.name}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Cleanup Tab */}
          <TabsContent value="cleanup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  Suggestions de suppression
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Images recommandées pour suppression (doublons, casse différente, score critique). 
                  <strong> Aucune suppression automatique</strong> — vous validez chaque image.
                </p>

                {analyses.filter(a => a.deleteRecommended).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>Aucune suppression recommandée. Vos médias sont en bon état !</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {analyses.filter(a => a.deleteRecommended).map((a) => (
                        <div key={a.name} className="flex items-center gap-3 p-3 rounded-lg border bg-red-50/50">
                          <Checkbox
                            checked={selectedForDelete.has(a.name)}
                            onCheckedChange={(checked) => {
                              const next = new Set(selectedForDelete);
                              if (checked) next.add(a.name); else next.delete(a.name);
                              setSelectedForDelete(next);
                            }}
                          />
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img src={a.src} alt="" className="w-full h-full object-cover" 
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.name}</p>
                            <p className="text-xs text-destructive">{a.issues.join(" • ")}</p>
                          </div>
                          {getScoreBadge(a.score)}
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={selectedForDelete.size === 0}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Confirmer la suppression ({selectedForDelete.size})
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Vous êtes sur le point de marquer <strong>{selectedForDelete.size}</strong> image(s) pour suppression.
              Ces fichiers font partie du code source — la suppression nécessite une action dans le repository.
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {Array.from(selectedForDelete).map(name => (
                <div key={name} className="text-xs p-2 bg-muted rounded">{name}</div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
              <Button variant="destructive" onClick={() => {
                toast.success(`${selectedForDelete.size} image(s) marquées pour suppression. Soumettez la demande à votre développeur.`);
                setDeleteDialogOpen(false);
              }}>
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMediaQuality;
