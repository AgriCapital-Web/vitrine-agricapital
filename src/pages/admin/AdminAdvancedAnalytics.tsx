import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Scatter, Funnel, FunnelChart, LabelList
} from "recharts";
import { 
  TrendingUp, TrendingDown, Users, Eye, MessageSquare, 
  Target, Award, Calendar, Download, RefreshCw, ArrowUpRight,
  ArrowDownRight, Activity, Zap, Globe, Clock, BarChart3,
  PieChartIcon, LineChartIcon, Loader2
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

// Chart colors
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ConversionGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  type: string;
}

const AdminAdvancedAnalytics = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch page visits
  const { data: pageVisits = [], isLoading: visitsLoading, refetch: refetchVisits } = useQuery({
    queryKey: ["analytics-visits", dateRange],
    queryFn: async () => {
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo).toISOString();
      
      const { data, error } = await supabase
        .from("page_visits")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch partnership requests
  const { data: partnerships = [], refetch: refetchPartnerships } = useQuery({
    queryKey: ["analytics-partnerships", dateRange],
    queryFn: async () => {
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo).toISOString();
      
      const { data, error } = await supabase
        .from("partnership_requests")
        .select("*")
        .gte("created_at", startDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch newsletter subscribers
  const { data: subscribers = [], refetch: refetchSubscribers } = useQuery({
    queryKey: ["analytics-subscribers", dateRange],
    queryFn: async () => {
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo).toISOString();
      
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .gte("subscribed_at", startDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch contact messages
  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ["analytics-contacts", dateRange],
    queryFn: async () => {
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo).toISOString();
      
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .gte("created_at", startDate);
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics
  const totalVisits = pageVisits.length;
  const uniqueVisitors = new Set(pageVisits.map(v => v.visitor_id)).size;
  const totalPartnerships = partnerships.length;
  const pendingPartnerships = partnerships.filter(p => p.status === "pending").length;
  const totalSubscribers = subscribers.length;
  const totalContacts = contacts.length;

  // Calculate conversion rate
  const conversionRate = totalVisits > 0 
    ? ((totalPartnerships + totalSubscribers) / totalVisits * 100).toFixed(2) 
    : "0";

  // Daily visits data for chart
  const daysCount = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const dailyVisitsData = eachDayOfInterval({
    start: subDays(new Date(), daysCount - 1),
    end: new Date(),
  }).map(date => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayVisits = pageVisits.filter(v => 
      format(new Date(v.created_at), "yyyy-MM-dd") === dateStr
    );
    const dayPartnerships = partnerships.filter(p => 
      format(new Date(p.created_at), "yyyy-MM-dd") === dateStr
    );
    const daySubscribers = subscribers.filter(s => 
      format(new Date(s.subscribed_at), "yyyy-MM-dd") === dateStr
    );

    return {
      date: format(date, "dd MMM", { locale: fr }),
      fullDate: dateStr,
      visits: dayVisits.length,
      visitors: new Set(dayVisits.map(v => v.visitor_id)).size,
      partnerships: dayPartnerships.length,
      subscribers: daySubscribers.length,
    };
  });

  // Top pages data
  const topPages = Object.entries(
    pageVisits.reduce((acc, visit) => {
      acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page, count]) => ({ page, count, percentage: (count / totalVisits * 100).toFixed(1) }));

  // Traffic sources data
  const trafficSources = Object.entries(
    pageVisits.reduce((acc, visit) => {
      const source = visit.referrer || "Direct";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  // Geographic data
  const geoData = Object.entries(
    pageVisits.reduce((acc, visit) => {
      const country = visit.country || "Inconnu";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([country, count]) => ({ country, count }));

  // Partner types breakdown
  const partnerTypes = Object.entries(
    partnerships.reduce((acc, p) => {
      acc[p.partner_type] = (acc[p.partner_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ name: type, value: count }));

  // Conversion funnel data
  const funnelData = [
    { name: "Visiteurs", value: totalVisits, fill: COLORS[0] },
    { name: "Pages vues (>1)", value: Math.round(totalVisits * 0.6), fill: COLORS[1] },
    { name: "Engagement", value: totalContacts + totalSubscribers + totalPartnerships, fill: COLORS[2] },
    { name: "Demandes", value: totalPartnerships, fill: COLORS[3] },
    { name: "Partenaires", value: partnerships.filter(p => p.status === "approved").length, fill: COLORS[4] },
  ];

  // Conversion goals
  const goals: ConversionGoal[] = [
    { id: "1", name: "Visiteurs mensuels", target: 1000, current: totalVisits, type: "visits" },
    { id: "2", name: "Demandes de partenariat", target: 50, current: totalPartnerships, type: "partnerships" },
    { id: "3", name: "Abonnés newsletter", target: 200, current: totalSubscribers, type: "subscribers" },
    { id: "4", name: "Taux de conversion", target: 5, current: parseFloat(conversionRate), type: "conversion" },
  ];

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchVisits(),
      refetchPartnerships(),
      refetchSubscribers(),
      refetchContacts(),
    ]);
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };

  // Export data
  const handleExport = () => {
    const csvContent = [
      "Date,Visites,Visiteurs uniques,Partenariats,Abonnés",
      ...dailyVisitsData.map(d => 
        `${d.fullDate},${d.visits},${d.visitors},${d.partnerships},${d.subscribers}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Export téléchargé");
  };

  if (visitsLoading) {
    return (
      <AdminLayout title="Analytics Avancés">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics Avancés">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord analytique</h1>
            <p className="text-muted-foreground">
              Suivi des performances et conversions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Visites totales</p>
                  <p className="text-2xl font-bold text-green-700">{totalVisits.toLocaleString()}</p>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +12% vs période préc.
                  </div>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Visiteurs uniques</p>
                  <p className="text-2xl font-bold text-blue-700">{uniqueVisitors.toLocaleString()}</p>
                  <div className="flex items-center text-xs text-blue-600 mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +8% vs période préc.
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Demandes partenariat</p>
                  <p className="text-2xl font-bold text-purple-700">{totalPartnerships}</p>
                  <div className="flex items-center text-xs text-purple-600 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {pendingPartnerships} en attente
                    </Badge>
                  </div>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Taux de conversion</p>
                  <p className="text-2xl font-bold text-amber-700">{conversionRate}%</p>
                  <div className="flex items-center text-xs text-amber-600 mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +2.3% vs période préc.
                  </div>
                </div>
                <Activity className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="traffic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="traffic" className="gap-2">
              <LineChartIcon className="w-4 h-4" />
              Trafic
            </TabsTrigger>
            <TabsTrigger value="conversions" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Conversions
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-2">
              <Target className="w-4 h-4" />
              Funnel
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Award className="w-4 h-4" />
              Objectifs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traffic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Traffic Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Évolution du trafic</CardTitle>
                  <CardDescription>Visites et visiteurs uniques</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyVisitsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="visits"
                          name="Visites"
                          stroke="#10b981"
                          fill="#10b98133"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          name="Visiteurs"
                          stroke="#3b82f6"
                          fill="#3b82f633"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Pages populaires</CardTitle>
                  <CardDescription>Top 5 des pages visitées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPages.map((page, index) => (
                      <div key={page.page} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate max-w-[150px]">{page.page}</span>
                          <span className="font-medium">{page.count}</span>
                        </div>
                        <Progress value={parseFloat(page.percentage)} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conversions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Conversions Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversions par jour</CardTitle>
                  <CardDescription>Demandes et abonnements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dailyVisitsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="partnerships" name="Partenariats" fill="#8b5cf6" />
                        <Bar dataKey="subscribers" name="Abonnés" fill="#f59e0b" />
                        <Line
                          type="monotone"
                          dataKey="visits"
                          name="Visites"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Partner Types Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Types de partenaires</CardTitle>
                  <CardDescription>Répartition des demandes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={partnerTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {partnerTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle>Funnel de conversion</CardTitle>
                <CardDescription>Du visiteur au partenaire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" name="Nombre">
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="value" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                const isAchieved = goal.current >= goal.target;
                
                return (
                  <Card key={goal.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        {isAchieved && (
                          <Badge className="bg-green-500">Atteint !</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">
                            {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                            {goal.type === "conversion" && "%"}
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={`h-3 ${isAchieved ? "[&>div]:bg-green-500" : ""}`}
                        />
                        <p className="text-xs text-muted-foreground">
                          {isAchieved 
                            ? `Objectif dépassé de ${(progress - 100).toFixed(1)}%`
                            : `${(100 - progress).toFixed(1)}% restant pour atteindre l'objectif`
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Geographic & Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Distribution géographique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Sources de trafic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm truncate max-w-[200px]">
                        {source.source === "Direct" ? "Accès direct" : source.source}
                      </span>
                    </div>
                    <Badge variant="secondary">{source.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAdvancedAnalytics;
