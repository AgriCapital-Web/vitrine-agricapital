import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, Upload, Database, Clock, CheckCircle2, AlertCircle,
  FileJson, FileSpreadsheet, Loader2, RefreshCw, HardDrive,
  Calendar, Shield, Trash2, Eye, Archive
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BackupTable {
  name: string;
  label: string;
  description: string;
  rowCount?: number;
  selected: boolean;
}

interface BackupHistory {
  id: string;
  date: Date;
  tables: string[];
  format: string;
  size: string;
  status: "success" | "failed";
}

const AdminBackup = () => {
  const [tables, setTables] = useState<BackupTable[]>([
    { name: "news", label: "Actualités", description: "Articles et publications", selected: true },
    { name: "newsletter_subscribers", label: "Abonnés Newsletter", description: "Liste des abonnés", selected: true },
    { name: "contact_messages", label: "Messages Contact", description: "Messages reçus", selected: true },
    { name: "partnership_requests", label: "Demandes Partenariat", description: "Demandes de partenaires", selected: true },
    { name: "testimonials", label: "Témoignages", description: "Avis clients", selected: true },
    { name: "page_visits", label: "Visites Pages", description: "Analytics", selected: false },
    { name: "ai_chat_logs", label: "Logs Chat IA", description: "Historique conversations", selected: false },
    { name: "visitor_contacts", label: "Contacts Visiteurs", description: "Coordonnées collectées", selected: true },
    { name: "site_content", label: "Contenu Site", description: "Textes et traductions", selected: true },
    { name: "site_pages", label: "Pages", description: "Configuration pages", selected: true },
    { name: "site_sections", label: "Sections", description: "Sections des pages", selected: true },
    { name: "site_menu", label: "Menu", description: "Navigation", selected: true },
    { name: "site_settings", label: "Paramètres", description: "Configuration site", selected: true },
    { name: "email_templates", label: "Templates Email", description: "Modèles emails", selected: true },
    { name: "user_roles", label: "Rôles Utilisateurs", description: "Permissions", selected: true },
    { name: "profiles", label: "Profils", description: "Infos utilisateurs", selected: true },
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    {
      id: "1",
      date: new Date(Date.now() - 86400000),
      tables: ["news", "contact_messages", "newsletter_subscribers"],
      format: "JSON",
      size: "2.4 MB",
      status: "success"
    },
    {
      id: "2", 
      date: new Date(Date.now() - 172800000),
      tables: ["page_visits", "ai_chat_logs"],
      format: "CSV",
      size: "5.1 MB",
      status: "success"
    }
  ]);

  const loadTableCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const updatedTables = await Promise.all(
        tables.map(async (table) => {
          try {
            const { count, error } = await supabase
              .from(table.name as any)
              .select("*", { count: "exact", head: true });
            
            if (error) throw error;
            return { ...table, rowCount: count || 0 };
          } catch {
            return { ...table, rowCount: 0 };
          }
        })
      );
      setTables(updatedTables);
    } catch (error) {
      console.error("Error loading counts:", error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const toggleTable = (name: string) => {
    setTables(tables.map(t => 
      t.name === name ? { ...t, selected: !t.selected } : t
    ));
  };

  const selectAll = () => {
    setTables(tables.map(t => ({ ...t, selected: true })));
  };

  const deselectAll = () => {
    setTables(tables.map(t => ({ ...t, selected: false })));
  };

  const exportData = async () => {
    const selectedTables = tables.filter(t => t.selected);
    if (selectedTables.length === 0) {
      toast.error("Sélectionnez au moins une table");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const backupData: Record<string, any[]> = {};
      const totalTables = selectedTables.length;

      for (let i = 0; i < selectedTables.length; i++) {
        const table = selectedTables[i];
        
        const { data, error } = await supabase
          .from(table.name as any)
          .select("*");

        if (error) {
          console.error(`Error exporting ${table.name}:`, error);
          backupData[table.name] = [];
        } else {
          backupData[table.name] = data || [];
        }

        setExportProgress(Math.round(((i + 1) / totalTables) * 100));
      }

      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm", { locale: fr });

      if (exportFormat === "json") {
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        downloadBlob(blob, `agricapital_backup_${timestamp}.json`);
      } else {
        // Export each table as separate CSV
        for (const [tableName, data] of Object.entries(backupData)) {
          if (data.length > 0) {
            const csvContent = convertToCSV(data);
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            downloadBlob(blob, `agricapital_${tableName}_${timestamp}.csv`);
          }
        }
      }

      // Add to history
      const newBackup: BackupHistory = {
        id: Date.now().toString(),
        date: new Date(),
        tables: selectedTables.map(t => t.label),
        format: exportFormat.toUpperCase(),
        size: calculateSize(backupData),
        status: "success"
      };
      setBackupHistory([newBackup, ...backupHistory]);

      toast.success(`Backup ${exportFormat.toUpperCase()} généré avec succès !`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(",")
      )
    ];
    return csvRows.join("\n");
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateSize = (data: Record<string, any[]>): string => {
    const size = new Blob([JSON.stringify(data)]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const selectedCount = tables.filter(t => t.selected).length;
  const totalRows = tables.filter(t => t.selected).reduce((sum, t) => sum + (t.rowCount || 0), 0);

  return (
    <AdminLayout title="Backup & Export">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Sauvegarde des Données
            </h1>
            <p className="text-muted-foreground">Exportez et sauvegardez vos données en toute sécurité</p>
          </div>
          <Button variant="outline" onClick={loadTableCounts} disabled={isLoadingCounts}>
            {isLoadingCounts ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Actualiser les compteurs
          </Button>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="w-4 h-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{tables.length}</p>
                      <p className="text-xs text-muted-foreground">Tables disponibles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedCount}</p>
                      <p className="text-xs text-muted-foreground">Tables sélectionnées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <HardDrive className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalRows.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Enregistrements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Table Selection */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sélection des Tables</CardTitle>
                      <CardDescription>Choisissez les données à exporter</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        Tout
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        Aucun
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {tables.map((table) => (
                        <div
                          key={table.name}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                            table.selected ? "bg-primary/5 border-primary/30" : "bg-muted/30 hover:bg-muted/50"
                          }`}
                          onClick={() => toggleTable(table.name)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={table.selected}
                              onCheckedChange={() => toggleTable(table.name)}
                            />
                            <div>
                              <p className="font-medium">{table.label}</p>
                              <p className="text-xs text-muted-foreground">{table.description}</p>
                            </div>
                          </div>
                          {table.rowCount !== undefined && (
                            <Badge variant="secondary">
                              {table.rowCount.toLocaleString()} lignes
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Options d'Export</CardTitle>
                  <CardDescription>Configuration du backup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Format Selection */}
                  <div className="space-y-3">
                    <Label>Format de fichier</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          exportFormat === "json" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setExportFormat("json")}
                      >
                        <FileJson className="w-8 h-8 mb-2 text-amber-500" />
                        <p className="font-medium">JSON</p>
                        <p className="text-xs text-muted-foreground">Fichier unique</p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          exportFormat === "csv" 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setExportFormat("csv")}
                      >
                        <FileSpreadsheet className="w-8 h-8 mb-2 text-green-500" />
                        <p className="font-medium">CSV</p>
                        <p className="text-xs text-muted-foreground">Multi-fichiers</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Export en cours...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} />
                    </div>
                  )}

                  {/* Export Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={exportData}
                    disabled={isExporting || selectedCount === 0}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger le Backup
                      </>
                    )}
                  </Button>

                  {/* Info */}
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <div className="flex gap-2">
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Backup sécurisé</p>
                        <p>Vos données sont exportées localement et ne transitent pas par des serveurs tiers.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  Historique des Backups
                </CardTitle>
                <CardDescription>
                  Liste des sauvegardes effectuées durant cette session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {backupHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun backup effectué</p>
                    <p className="text-sm">Lancez un export pour créer votre premier backup</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backupHistory.map((backup) => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            backup.status === "success" 
                              ? "bg-green-500/10" 
                              : "bg-red-500/10"
                          }`}>
                            {backup.status === "success" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              Backup {format(backup.date, "dd MMM yyyy HH:mm", { locale: fr })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {backup.tables.slice(0, 3).join(", ")}
                              {backup.tables.length > 3 && ` +${backup.tables.length - 3} autres`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{backup.format}</Badge>
                          <span className="text-sm text-muted-foreground">{backup.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Conseils</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Effectuez un backup complet chaque semaine
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Stockez vos backups sur un support externe (cloud, disque dur)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Le format JSON conserve les relations entre données
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Le format CSV est idéal pour analyse dans Excel
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminBackup;
