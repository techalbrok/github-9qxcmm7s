import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Activity,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Loader2,
  Pencil,
  MoreVertical,
} from "lucide-react";
import SendEmailDialog from "../email/SendEmailDialog";
import { toast } from "@/components/ui/use-toast";
import EditLeadForm from "./EditLeadForm";
import DeleteLeadDialog from "./DeleteLeadDialog";
import AddTaskDialog from "./AddTaskDialog";
import AddCommunicationDialog from "./AddCommunicationDialog";
import EditCommunicationDialog from "./EditCommunicationDialog";
import UpdateLeadStatusDialog from "./UpdateLeadStatusDialog";
import TasksList from "./TasksList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  lead_details: {
    previous_experience: string;
    investment_capacity: string;
    source_channel: string;
    interest_level: number;
    additional_comments: string;
    score: number;
  };
  lead_status_history: {
    id: string;
    status: string;
    notes: string;
    created_at: string;
    created_by: string;
    users: {
      full_name: string;
      avatar_url: string;
    } | null;
  }[];
  communications: {
    id: string;
    type: string;
    content: string;
    created_at: string;
    created_by: string;
    users: {
      full_name: string;
      avatar_url: string;
    } | null;
  }[];
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showAddCommunicationDialog, setShowAddCommunicationDialog] =
    useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [showEditCommunicationDialog, setShowEditCommunicationDialog] =
    useState(false);
  const [communicationToEdit, setCommunicationToEdit] = useState<string | null>(
    null,
  );
  const [showDeleteCommunicationDialog, setShowDeleteCommunicationDialog] =
    useState(false);
  const [communicationToDelete, setCommunicationToDelete] = useState<
    string | null
  >(null);
  const [isDeletingCommunication, setIsDeletingCommunication] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);

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
    if (id) {
      fetchLeadDetails(id);
    }
  }, [id]);

  async function fetchLeadDetails(leadId: string) {
    try {
      setLoading(true);
      console.log("Fetching lead details for ID:", leadId);

      // Force refresh the data from the server with no cache
      await supabase.auth.refreshSession();

      // Clear any potential cache by using a timestamp parameter
      const timestamp = new Date().getTime();
      console.log(`Fetching with cache-busting timestamp: ${timestamp}`);

      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          *,
          lead_details(*),
          lead_status_history(id, status, created_at, notes, created_by),
          communications(id, type, content, created_at, created_by)
        `,
        )
        .eq("id", leadId)
        .single();

      console.log("Raw lead data from database:", data);
      console.log("Raw lead_details from database:", data?.lead_details);

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      console.log("Lead data fetched:", data);
      console.log("Lead details:", data.lead_details);

      // Sort status history by created_at in descending order
      const sortedStatusHistory = data.lead_status_history
        ? data.lead_status_history.sort(
            (a, b) =>
              new Date(b.created_at || Date.now()).getTime() -
              new Date(a.created_at || Date.now()).getTime(),
          )
        : [];

      // Sort communications by created_at in descending order
      const sortedCommunications = data.communications
        ? data.communications.sort(
            (a, b) =>
              new Date(b.created_at || Date.now()).getTime() -
              new Date(a.created_at || Date.now()).getTime(),
          )
        : [];

      // Add empty users object to each status and communication
      const statusWithUsers = sortedStatusHistory.map((status) => ({
        ...status,
        users: null,
      }));

      const communicationsWithUsers = sortedCommunications.map((comm) => ({
        ...comm,
        users: null,
      }));

      console.log("Processed status history:", statusWithUsers);
      console.log("Processed communications:", communicationsWithUsers);

      // Ensure lead_details has all properties even if they're null
      // Handle lead_details as an array or single object
      const leadDetails =
        Array.isArray(data.lead_details) && data.lead_details.length > 0
          ? data.lead_details[0]
          : data.lead_details || {};

      const normalizedLeadDetails = {
        previous_experience:
          leadDetails.previous_experience !== null &&
          leadDetails.previous_experience !== undefined
            ? leadDetails.previous_experience
            : "",
        additional_comments:
          leadDetails.additional_comments !== null &&
          leadDetails.additional_comments !== undefined
            ? leadDetails.additional_comments
            : "",
        investment_capacity:
          leadDetails.investment_capacity !== null &&
          leadDetails.investment_capacity !== undefined &&
          leadDetails.investment_capacity !== ""
            ? leadDetails.investment_capacity
            : "no",
        source_channel:
          leadDetails.source_channel !== null &&
          leadDetails.source_channel !== undefined &&
          leadDetails.source_channel !== ""
            ? leadDetails.source_channel
            : "website",
        interest_level:
          leadDetails.interest_level !== null &&
          leadDetails.interest_level !== undefined
            ? leadDetails.interest_level
            : 3,
        score:
          leadDetails.score !== null && leadDetails.score !== undefined
            ? leadDetails.score
            : 0,
      };

      const processedLead = {
        ...data,
        lead_details: normalizedLeadDetails,
        lead_status_history: statusWithUsers,
        communications: communicationsWithUsers,
      };

      console.log("Processed lead data:", processedLead);
      setLead(processedLead);
    } catch (error) {
      console.error("Error fetching lead details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del lead",
        variant: "destructive",
      });
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

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString();
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

  function getCommunicationTypeLabel(type: string) {
    switch (type) {
      case "call":
        return "Llamada";
      case "email":
        return "Email";
      case "meeting":
        return "Reunión";
      case "training":
        return "Formación";
      default:
        return type;
    }
  }

  function handleLeadDeleted() {
    toast({
      title: "Lead eliminado",
      description: "El lead ha sido eliminado correctamente.",
    });
    navigate("/leads/list");
  }

  function handleLeadUpdated() {
    setShowEditForm(false);
    fetchLeadDetails(id!);
  }

  function handleTaskAdded() {
    setShowAddTaskDialog(false);
    fetchLeadDetails(id!);
  }

  function handleCommunicationAdded() {
    setShowAddCommunicationDialog(false);
    fetchLeadDetails(id!);
    setActiveTab("communications");
  }

  async function handleDeleteCommunication(communicationId: string) {
    try {
      setIsDeletingCommunication(true);
      const { error } = await supabase
        .from("communications")
        .delete()
        .eq("id", communicationId);

      if (error) throw error;

      toast({
        title: "Comunicación eliminada",
        description: "La comunicación ha sido eliminada correctamente.",
      });

      fetchLeadDetails(id!);
      setShowDeleteCommunicationDialog(false);
      setCommunicationToDelete(null);
    } catch (error) {
      console.error("Error deleting communication:", error);
      toast({
        title: "Error al eliminar la comunicación",
        description:
          "Ha ocurrido un problema al eliminar la comunicación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCommunication(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Cargando detalles del lead...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Lead no encontrado</p>
        <Button onClick={() => navigate("/leads")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Leads
        </Button>
      </div>
    );
  }

  if (showEditForm) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => setShowEditForm(false)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Detalles
        </Button>
        <EditLeadForm
          leadId={lead.id}
          onSuccess={handleLeadUpdated}
          onCancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/leads")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Leads
        </Button>
        <div className="flex space-x-2">
          {(userRole === "superadmin" || userRole === "admin") && (
            <>
              <Button variant="outline" onClick={() => setShowEditForm(true)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteLeadDialog
          leadId={lead.id}
          leadName={lead.full_name}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onDeleted={handleLeadDeleted}
        />
      )}

      {showUpdateStatusDialog && (
        <UpdateLeadStatusDialog
          leadId={lead.id}
          currentStatus={lead.lead_status_history[0]?.status || "new_contact"}
          isOpen={showUpdateStatusDialog}
          onClose={() => setShowUpdateStatusDialog(false)}
          onSuccess={() => fetchLeadDetails(id!)}
        />
      )}

      {showSendEmailDialog && (
        <SendEmailDialog
          isOpen={showSendEmailDialog}
          onClose={() => setShowSendEmailDialog(false)}
          recipientEmail={lead.email}
          recipientName={lead.full_name}
          leadId={lead.id}
        />
      )}

      {showAddTaskDialog && (
        <AddTaskDialog
          leadId={lead.id}
          isOpen={showAddTaskDialog}
          onClose={() => setShowAddTaskDialog(false)}
          onSuccess={handleTaskAdded}
        />
      )}

      {showAddCommunicationDialog && (
        <AddCommunicationDialog
          leadId={lead.id}
          isOpen={showAddCommunicationDialog}
          onClose={() => setShowAddCommunicationDialog(false)}
          onSuccess={handleCommunicationAdded}
        />
      )}

      {communicationToEdit && (
        <EditCommunicationDialog
          communicationId={communicationToEdit}
          isOpen={showEditCommunicationDialog}
          onClose={() => {
            setShowEditCommunicationDialog(false);
            setCommunicationToEdit(null);
          }}
          onSuccess={() => {
            fetchLeadDetails(id!);
            setActiveTab("communications");
          }}
        />
      )}

      <AlertDialog
        open={showDeleteCommunicationDialog}
        onOpenChange={setShowDeleteCommunicationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la comunicación. Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCommunication}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (communicationToDelete) {
                  handleDeleteCommunication(communicationToDelete);
                }
              }}
              disabled={isDeletingCommunication}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeletingCommunication ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{lead.full_name}</CardTitle>
                <p className="text-muted-foreground">
                  Añadido el {formatDate(lead.created_at)}
                </p>
              </div>
              <Badge
                className={getStatusColor(
                  lead.lead_status_history[0]?.status || "new_contact",
                )}
              >
                {getStatusLabel(
                  lead.lead_status_history[0]?.status || "new_contact",
                )}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{lead.location}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Nivel de Interés: {lead.lead_details?.interest_level || 0}
                      /5
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      ¿Dispone de local?:{" "}
                      {lead.lead_details?.investment_capacity === "yes"
                        ? "Sí"
                        : lead.lead_details?.investment_capacity === "no"
                          ? "No"
                          : "No especificado"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Puntuación: </span>
                    <Badge
                      className={`ml-2 ${getScoreColor(lead.lead_details?.score || 0)}`}
                    >
                      {lead.lead_details?.score || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm">
                      Canal de Origen:{" "}
                      {lead.lead_details?.source_channel || "No especificado"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Experiencia Previa</h3>
                  <p className="text-muted-foreground">
                    {lead.lead_details?.previous_experience !== null &&
                    lead.lead_details?.previous_experience !== ""
                      ? lead.lead_details.previous_experience
                      : "No se proporcionó información"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Comentarios Adicionales</h3>
                  <p className="text-muted-foreground">
                    {lead.lead_details?.additional_comments !== null &&
                    lead.lead_details?.additional_comments !== ""
                      ? lead.lead_details.additional_comments
                      : "No se proporcionaron comentarios"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Historial de Estado</TabsTrigger>
              <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Estado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lead.lead_status_history.map((status) => (
                      <div
                        key={status.id}
                        className="border-l-2 border-gray-200 pl-4 py-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className={getStatusColor(status.status)}>
                              {getStatusLabel(status.status)}
                            </Badge>
                            <p className="mt-2">{status.notes}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(status.created_at)}
                          </div>
                        </div>
                        {status.users && (
                          <div className="flex items-center mt-2">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={status.users.avatar_url || undefined}
                              />
                              <AvatarFallback>
                                {status.users.full_name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {status.users.full_name || "System"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="communications" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Comunicaciones</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowAddCommunicationDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Añadir
                  </Button>
                </CardHeader>
                <CardContent>
                  {lead.communications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No hay comunicaciones registradas aún
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {lead.communications.map((comm) => (
                        <div
                          key={comm.id}
                          className="border-l-2 border-gray-200 pl-4 py-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 mr-2">
                              <Badge variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {getCommunicationTypeLabel(comm.type)}
                              </Badge>
                              <p className="mt-2 whitespace-pre-line">
                                {comm.content}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <div className="text-sm text-muted-foreground mr-2">
                                {formatDateTime(comm.created_at)}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCommunicationToEdit(comm.id);
                                      setShowEditCommunicationDialog(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCommunicationToDelete(comm.id);
                                      setShowDeleteCommunicationDialog(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {comm.users && (
                            <div className="flex items-center mt-2">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage
                                  src={comm.users.avatar_url || undefined}
                                />
                                <AvatarFallback>
                                  {comm.users.full_name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {comm.users.full_name || "System"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tareas</CardTitle>
                  <Button size="sm" onClick={() => setShowAddTaskDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Añadir
                  </Button>
                </CardHeader>
                <CardContent>
                  <TasksList
                    leadId={lead.id}
                    onTasksChange={fetchLeadDetails.bind(null, lead.id)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole === "superadmin" || userRole === "admin" ? (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setShowUpdateStatusDialog(true)}
                  >
                    Actualizar Estado
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddCommunicationDialog(true)}
                  >
                    Añadir Comunicación
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddTaskDialog(true)}
                  >
                    Programar Tarea
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSendEmailDialog(true)}
                  >
                    Enviar Email
                  </Button>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-center">
                  <p className="text-muted-foreground">Modo de solo lectura</p>
                  <p className="text-xs mt-1">
                    No tienes permisos para realizar acciones
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cronología</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...lead.lead_status_history, ...lead.communications]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {"status" in item ? (
                          <Activity className="h-4 w-4 text-primary" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {"status" in item ? (
                            <>Estado cambiado a {getStatusLabel(item.status)}</>
                          ) : (
                            <>
                              Comunicación de{" "}
                              {getCommunicationTypeLabel(item.type)}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
