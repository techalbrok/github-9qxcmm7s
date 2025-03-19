import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "../ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Loader2,
  User,
  Calendar,
  Phone,
  Mail,
  Info,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  status: string;
  lead_details: {
    interest_level: number;
    score: number;
    investment_capacity: string;
    source_channel: string;
  }[];
};

type LeadsByStage = {
  [key: string]: Lead[];
};

export default function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<LeadsByStage>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const stages = [
    { id: "new_contact", name: "Nuevo Contacto", color: "#3b82f6" },
    { id: "first_contact", name: "Primer Contacto", color: "#8b5cf6" },
    { id: "info_sent", name: "Información Enviada", color: "#6366f1" },
    {
      id: "interview_scheduled",
      name: "Entrevista Programada",
      color: "#eab308",
    },
    {
      id: "interview_completed",
      name: "Entrevista Completada",
      color: "#f97316",
    },
    { id: "proposal_sent", name: "Propuesta Enviada", color: "#ec4899" },
    { id: "negotiation", name: "Negociación", color: "#ef4444" },
    { id: "contract_signed", name: "Contrato Firmado", color: "#22c55e" },
  ];

  useEffect(() => {
    async function checkUserRole() {
      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
          return;
        }

        setUserRole(data);
        setIsAuthorized(data === "superadmin" || data === "admin");
      } catch (error) {
        console.error("Error in checkUserRole:", error);
      }
    }

    checkUserRole();
    fetchLeads();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      organizeLeadsByStage();
    }
  }, [leads]);

  // Make sure the droppable areas are ready before rendering
  const [isDroppableEnabled, setIsDroppableEnabled] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready for react-beautiful-dnd
    const timer = setTimeout(() => {
      setIsDroppableEnabled(true);
    }, 100);

    return () => clearTimeout(timer);
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

      // Process leads to get current status
      const processedLeads = data?.map((lead) => {
        // Get the most recent status from lead_status_history
        const statusHistory = lead.lead_status_history || [];
        const sortedHistory = [...statusHistory].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        const currentStatus =
          sortedHistory.length > 0 ? sortedHistory[0].status : "new_contact";

        return {
          ...lead,
          status: currentStatus,
        };
      });

      setLeads(processedLeads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los candidatos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function organizeLeadsByStage() {
    const organized: LeadsByStage = {};

    // Initialize all stages with empty arrays
    stages.forEach((stage) => {
      organized[stage.id] = [];
    });

    // Populate stages with leads
    leads.forEach((lead) => {
      const stageId = lead.status || "new_contact";
      if (organized[stageId]) {
        organized[stageId].push(lead);
      } else {
        // If stage doesn't exist, put in new_contact as fallback
        organized["new_contact"].push(lead);
      }
    });

    setLeadsByStage(organized);
  }

  async function handleDragEnd(result: any) {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Check if user is authorized to move leads
    if (!isAuthorized) {
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para mover candidatos en el pipeline",
        variant: "destructive",
      });
      return;
    }

    // Find the lead that was dragged
    const leadId = draggableId;
    const newStatus = destination.droppableId;

    try {
      // First update the UI immediately for better user experience
      // Find the lead to move
      const leadToMove = leads.find((lead) => lead.id === leadId);
      if (!leadToMove) return;

      // Create a copy of the current state
      const updatedLeadsByStage = { ...leadsByStage };

      // Remove from source
      updatedLeadsByStage[source.droppableId] = updatedLeadsByStage[
        source.droppableId
      ].filter((lead) => lead.id !== leadId);

      // Add to destination with updated status
      const updatedLead = { ...leadToMove, status: newStatus };
      updatedLeadsByStage[newStatus] = [
        ...updatedLeadsByStage[newStatus],
        updatedLead,
      ];

      // Update the state immediately
      setLeadsByStage(updatedLeadsByStage);

      // Also update the main leads array
      const updatedLeads = leads.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead,
      );
      setLeads(updatedLeads);

      // Get the current user ID
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      const userId = currentUser?.id;

      // Update the lead status in the database
      const { error } = await supabase.from("lead_status_history").insert({
        lead_id: leadId,
        status: newStatus,
        notes: `Candidato movido a la etapa ${getStageNameById(newStatus)}`,
        created_by: userId,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Candidato movido a ${getStageNameById(newStatus)}`,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del candidato",
        variant: "destructive",
      });
      // Refresh the data to ensure UI is in sync with database
      fetchLeads();
    }
  }

  function getStageNameById(stageId: string): string {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.name : stageId;
  }

  function getStageColorById(stageId: string): string {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.color : "#64748b";
  }

  function getInterestLevelColor(level: number): string {
    switch (level) {
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-green-100 text-green-800";
      case 5:
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando pipeline...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: "1600px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Candidatos</h2>
          <p className="text-muted-foreground mt-1">
            {leads.length} candidatos en total • Arrastra y suelta para mover
            candidatos entre etapas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mostrar/ocultar ayuda</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-default"
                >
                  {isAuthorized ? (
                    <Unlock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isAuthorized
                    ? "Tienes permisos para mover candidatos"
                    : "Modo de solo lectura - No puedes mover candidatos"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-blue-800">
                Cómo usar el Pipeline
              </h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>
                  • Cada columna representa una etapa en el proceso de ventas
                </li>
                <li>
                  • Haz clic en una tarjeta para ver los detalles completos del
                  candidato
                </li>
                {isAuthorized ? (
                  <li>
                    • Arrastra y suelta las tarjetas para mover candidatos entre
                    etapas
                  </li>
                ) : (
                  <li>
                    • Solo los administradores pueden mover candidatos entre
                    etapas
                  </li>
                )}
                <li>
                  • Los colores de las etiquetas indican el nivel de interés del
                  candidato
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {isDroppableEnabled ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4" style={{ minWidth: "1400px" }}>
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex flex-col"
                  style={{ width: "250px", minWidth: "250px" }}
                >
                  <div
                    className="rounded-t-lg p-3 border border-b-0 border-gray-200"
                    style={{
                      backgroundColor: `${stage.color}10`,
                      borderColor: `${stage.color}30`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className="font-medium"
                        style={{ color: stage.color }}
                      >
                        {stage.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="ml-1"
                        style={{
                          borderColor: `${stage.color}40`,
                          color: stage.color,
                        }}
                      >
                        {leadsByStage[stage.id]?.length || 0}
                      </Badge>
                    </div>
                  </div>

                  <Droppable droppableId={stage.id} key={stage.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-gray-50 rounded-b-lg p-2 border border-gray-200 flex-1 min-h-[500px] overflow-y-auto"
                        style={{ borderColor: `${stage.color}30` }}
                      >
                        {leadsByStage[stage.id]?.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-24 text-center p-4 text-sm text-muted-foreground">
                            <p>No hay candidatos en esta etapa</p>
                          </div>
                        )}

                        {leadsByStage[stage.id] &&
                          leadsByStage[stage.id].map((lead, index) => (
                            <Draggable
                              key={lead.id}
                              draggableId={lead.id}
                              index={index}
                              isDragDisabled={!isAuthorized}
                            >
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-2 ${isAuthorized ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} hover:shadow-md transition-shadow ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                  onClick={() => navigate(`/leads/${lead.id}`)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center">
                                        <Avatar className="h-6 w-6 mr-2">
                                          <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.full_name}`}
                                          />
                                          <AvatarFallback>
                                            {lead.full_name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <h4 className="font-medium text-sm">
                                          {lead.full_name}
                                        </h4>
                                      </div>
                                      {lead.lead_details?.[0]
                                        ?.interest_level && (
                                        <Badge
                                          className={`${getInterestLevelColor(
                                            lead.lead_details[0].interest_level,
                                          )} ml-2`}
                                        >
                                          Interés:{" "}
                                          {lead.lead_details[0].interest_level}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="text-xs text-gray-500 space-y-1">
                                      <div className="flex items-center">
                                        <Mail className="h-3 w-3 mr-1" />
                                        <span className="truncate">
                                          {lead.email}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        <span>{lead.phone}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        <span>{lead.location}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>
                                          {formatDate(lead.created_at)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                                      <span className="text-xs">
                                        {getSourceChannelLabel(
                                          lead.lead_details?.[0]
                                            ?.source_channel,
                                        )}
                                      </span>

                                      {lead.lead_details?.[0]?.score && (
                                        <div className="flex items-center">
                                          <span className="text-xs font-medium mr-1">
                                            {lead.lead_details[0].score}
                                          </span>
                                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                            <div
                                              className="h-1.5 rounded-full"
                                              style={{
                                                width: `${Math.min(
                                                  (lead.lead_details[0].score /
                                                    100) *
                                                    100,
                                                  100,
                                                )}%`,
                                                backgroundColor: stage.color,
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      ) : (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Preparando pipeline...</span>
        </div>
      )}
    </div>
  );
}
