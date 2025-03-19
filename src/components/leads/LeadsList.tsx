import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Upload,
  ArrowUpDown,
  X,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MassEmailDialog from "../email/MassEmailDialog";
import ImportLeadsDialog from "./ImportLeadsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { es } from "date-fns/locale";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  lead_details: {
    interest_level: number;
    source_channel: string;
    score: number;
  };
  lead_status_history: {
    status: string;
    created_at: string;
  }[];
};

type SortOption = {
  field: string;
  direction: "asc" | "desc";
};

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMassEmailDialog, setShowMassEmailDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "created_at",
    direction: "desc",
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserRole() {
      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
          return;
        }

        setUserRole(data);
      } catch (error) {
        console.error("Error in checkUserRole:", error);
      }
    }

    checkUserRole();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          *,
          lead_details(*),
          lead_status_history(status, created_at)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process the data to get the latest status for each lead
      const processedLeads = data.map((lead) => {
        // Sort status history by created_at in descending order
        const sortedStatusHistory = lead.lead_status_history.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          ...lead,
          lead_status_history: sortedStatusHistory,
        };
      });

      setLeads(processedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads
    .filter(
      (lead) =>
        (lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
        // Filter by status if selected
        (statusFilter === "all" ||
          (lead.lead_status_history[0]?.status || "new_contact") ===
            statusFilter) &&
        // Filter by source if selected
        (sourceFilter === "all" ||
          (Array.isArray(lead.lead_details)
            ? lead.lead_details[0]?.source_channel
            : lead.lead_details?.source_channel) === sourceFilter) &&
        // Filter by date if selected
        (dateFilter === undefined ||
          new Date(lead.created_at).toDateString() ===
            dateFilter.toDateString()),
    )
    .sort((a, b) => {
      const direction = sortOption.direction === "asc" ? 1 : -1;

      switch (sortOption.field) {
        case "full_name":
          return direction * a.full_name.localeCompare(b.full_name);
        case "email":
          return direction * a.email.localeCompare(b.email);
        case "location":
          return direction * a.location.localeCompare(b.location);
        case "score":
          const scoreA =
            Array.isArray(a.lead_details) && a.lead_details.length > 0
              ? a.lead_details[0].score || 0
              : a.lead_details?.score || 0;
          const scoreB =
            Array.isArray(b.lead_details) && b.lead_details.length > 0
              ? b.lead_details[0].score || 0
              : b.lead_details?.score || 0;
          return direction * (scoreA - scoreB);
        case "created_at":
        default:
          return (
            direction *
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime())
          );
      }
    });

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

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: "1200px" }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Candidatos</h2>
        {(userRole === "superadmin" || userRole === "admin") && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" /> Importar CSV
            </Button>
            <Button onClick={() => navigate("/leads/new")}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Candidato
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar candidatos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={showFilters ? "bg-slate-100" : ""}
            >
              <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtros</h4>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="new_contact">Nuevo Contacto</SelectItem>
                    <SelectItem value="first_contact">
                      Primer Contacto
                    </SelectItem>
                    <SelectItem value="info_sent">
                      Información Enviada
                    </SelectItem>
                    <SelectItem value="interview_scheduled">
                      Entrevista Programada
                    </SelectItem>
                    <SelectItem value="interview_completed">
                      Entrevista Completada
                    </SelectItem>
                    <SelectItem value="proposal_sent">
                      Propuesta Enviada
                    </SelectItem>
                    <SelectItem value="negotiation">Negociación</SelectItem>
                    <SelectItem value="contract_signed">
                      Contrato Firmado
                    </SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fuente</label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las fuentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fuentes</SelectItem>
                    <SelectItem value="website">Sitio Web</SelectItem>
                    <SelectItem value="referral">Referencia</SelectItem>
                    <SelectItem value="social_media">Redes Sociales</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="advertisement">Publicidad</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de creación</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFilter ? (
                        format(dateFilter, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("");
                    setSourceFilter("");
                    setDateFilter(undefined);
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Limpiar
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Ordenar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Ordenar por</h4>

              <div className="grid gap-1">
                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() =>
                    setSortOption({
                      field: "full_name",
                      direction:
                        sortOption.field === "full_name" &&
                        sortOption.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Nombre
                  {sortOption.field === "full_name" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() =>
                    setSortOption({
                      field: "email",
                      direction:
                        sortOption.field === "email" &&
                        sortOption.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Email
                  {sortOption.field === "email" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() =>
                    setSortOption({
                      field: "location",
                      direction:
                        sortOption.field === "location" &&
                        sortOption.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Ubicación
                  {sortOption.field === "location" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() =>
                    setSortOption({
                      field: "score",
                      direction:
                        sortOption.field === "score" &&
                        sortOption.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Puntuación
                  {sortOption.field === "score" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() =>
                    setSortOption({
                      field: "created_at",
                      direction:
                        sortOption.field === "created_at" &&
                        sortOption.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                >
                  Fecha de creación
                  {sortOption.field === "created_at" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {(userRole === "superadmin" || userRole === "admin") && (
          <Button onClick={() => setShowMassEmailDialog(true)}>
            <Send className="mr-2 h-4 w-4" /> Email Masivo
          </Button>
        )}
      </div>

      {showMassEmailDialog && (
        <MassEmailDialog
          isOpen={showMassEmailDialog}
          onClose={() => setShowMassEmailDialog(false)}
        />
      )}

      {showImportDialog && (
        <ImportLeadsDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onSuccess={fetchLeads}
        />
      )}

      {loading ? (
        <div className="text-center py-10">Cargando candidatos...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron candidatos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {lead.full_name}
                    </h3>
                    <Badge
                      className={getStatusColor(
                        lead.lead_status_history[0]?.status || "new_contact",
                      )}
                    >
                      {getStatusLabel(
                        lead.lead_status_history[0]?.status || "new_contact",
                      )}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{lead.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{lead.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Añadido el {formatDate(lead.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Fuente:</span>
                    <Badge variant="outline" className="ml-2">
                      {getSourceChannelLabel(
                        Array.isArray(lead.lead_details) &&
                          lead.lead_details.length > 0
                          ? lead.lead_details[0].source_channel
                          : lead.lead_details?.source_channel || "unknown",
                      )}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Puntuación:</span>
                    <Badge
                      className={`ml-2 ${getScoreColor(
                        Array.isArray(lead.lead_details) &&
                          lead.lead_details.length > 0
                          ? lead.lead_details[0].score || 0
                          : lead.lead_details?.score || 0,
                      )}`}
                    >
                      {Array.isArray(lead.lead_details) &&
                      lead.lead_details.length > 0
                        ? lead.lead_details[0].score || 0
                        : lead.lead_details?.score || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
