import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, MapPin, BarChart, Activity } from "lucide-react";

type DashboardStats = {
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  averageScore: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByLocation: Record<string, number>;
  recentLeads: Array<{
    id: string;
    full_name: string;
    created_at: string;
    status: string;
    score: number;
  }>;
};

export default function LeadDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setLoading(true);

      // Get all leads with their details and latest status
      const { data: leadsData, error: leadsError } = await supabase.from(
        "leads",
      ).select(`
          *,
          lead_details(*),
          lead_status_history(status, created_at)
        `);

      if (leadsError) throw leadsError;

      // Process the data
      const processedLeads = leadsData.map((lead) => {
        // Sort status history by created_at in descending order to get the latest
        const sortedStatusHistory = lead.lead_status_history.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          ...lead,
          latestStatus: sortedStatusHistory[0]?.status || "new_contact",
        };
      });

      // Calculate stats
      const totalLeads = processedLeads.length;

      // New leads this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newLeadsThisMonth = processedLeads.filter(
        (lead) => new Date(lead.created_at) >= startOfMonth,
      ).length;

      // Conversion rate (leads with status "contract_signed" / total leads)
      const convertedLeads = processedLeads.filter(
        (lead) => lead.latestStatus === "contract_signed",
      ).length;
      const conversionRate =
        totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Average score
      const totalScore = processedLeads.reduce((sum, lead) => {
        // Check if lead_details is an array and get the first element's score
        if (Array.isArray(lead.lead_details) && lead.lead_details.length > 0) {
          return sum + (lead.lead_details[0].score || 0);
        }
        return sum + (lead.lead_details?.score || 0);
      }, 0);
      const averageScore = totalLeads > 0 ? totalScore / totalLeads : 0;

      // Leads by status
      const leadsByStatus = processedLeads.reduce(
        (acc, lead) => {
          const status = lead.latestStatus;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Leads by source
      const leadsBySource = processedLeads.reduce(
        (acc, lead) => {
          let source;
          // Check if lead_details is an array and get the first element's source_channel
          if (
            Array.isArray(lead.lead_details) &&
            lead.lead_details.length > 0
          ) {
            source = lead.lead_details[0].source_channel || "unknown";
          } else {
            source = lead.lead_details?.source_channel || "unknown";
          }

          // Normalize empty strings to "unknown"
          if (source === "" || source === null || source === undefined)
            source = "unknown";

          acc[source] = (acc[source] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log("Fuentes de candidatos procesadas:", leadsBySource);

      // Leads by location
      const leadsByLocation = processedLeads.reduce(
        (acc, lead) => {
          const location = lead.location;
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Recent leads
      const recentLeads = processedLeads
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5)
        .map((lead) => {
          let score = 0;
          if (
            Array.isArray(lead.lead_details) &&
            lead.lead_details.length > 0
          ) {
            score = lead.lead_details[0].score || 0;
          } else {
            score = lead.lead_details?.score || 0;
          }

          return {
            id: lead.id,
            full_name: lead.full_name,
            created_at: lead.created_at,
            status: lead.latestStatus,
            score: score,
          };
        });

      setStats({
        totalLeads,
        newLeadsThisMonth,
        conversionRate,
        averageScore,
        leadsByStatus,
        leadsBySource,
        leadsByLocation,
        recentLeads,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "new_contact":
        return "bg-blue-100 text-blue-800";
      case "first_contact":
        return "bg-purple-100 text-purple-800";
      case "info_sent":
        return "bg-indigo-100 text-indigo-800";
      case "interview_scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "interview_completed":
        return "bg-orange-100 text-orange-800";
      case "proposal_sent":
        return "bg-pink-100 text-pink-800";
      case "negotiation":
        return "bg-red-100 text-red-800";
      case "contract_signed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "new_contact":
        return "Nuevo Contacto";
      case "first_contact":
        return "Primer Contacto";
      case "info_sent":
        return "Información Enviada";
      case "interview_scheduled":
        return "Entrevista Programada";
      case "interview_completed":
        return "Entrevista Completada";
      case "proposal_sent":
        return "Propuesta Enviada";
      case "negotiation":
        return "Negociación";
      case "contract_signed":
        return "Contrato Firmado";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  }

  function getSourceChannelLabel(source: string | undefined) {
    if (!source || source === "" || source === null) return "Desconocido";

    switch (source) {
      case "website":
        return "Sitio Web";
      case "referral":
        return "Referencia";
      case "social_media":
        return "Redes Sociales";
      case "event":
        return "Evento";
      case "advertisement":
        return "Publicidad";
      case "other":
        return "Otro";
      default:
        return source;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">Cargando panel...</div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6 text-center">
        Error al cargar los datos del panel
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: "1200px" }}>
      <h2 className="text-3xl font-bold mb-6">
        Panel de Gestión de Candidatos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Candidatos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newLeadsThisMonth} nuevos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Conversión
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <Progress value={stats.conversionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Puntuación Media
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageScore.toFixed(1)}
            </div>
            <Progress
              value={(stats.averageScore / 100) * 100}
              className="h-2 mt-2"
              indicatorClassName={
                stats.averageScore >= 80
                  ? "bg-green-500"
                  : stats.averageScore >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ubicaciones Principales
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {Object.entries(stats.leadsByLocation)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([location, count], index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-1"
                  >
                    <span className="truncate">{location}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen del Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className={getStatusColor(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                      <span className="ml-2">{count} candidatos</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {((count / stats.totalLeads) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(count / stats.totalLeads) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuentes de Candidatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.leadsBySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize">
                        {getSourceChannelLabel(source || "unknown")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} candidatos (
                        {((count / stats.totalLeads) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress
                      value={(count / stats.totalLeads) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidatos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{lead.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Añadido el {formatDate(lead.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(lead.status)}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                  <Badge className={getScoreColor(lead.score)}>
                    {lead.score}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
