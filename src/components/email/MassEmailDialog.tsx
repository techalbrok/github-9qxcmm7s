import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import EmailEditor, { EmailData } from "./EmailEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmailSettings } from "@/api/emailApi";
import { sendMassEmails } from "@/services/emailService";
import { logCommunication } from "@/api/emailApi";

interface MassEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Lead = {
  id: string;
  full_name: string;
  email: string;
  status?: string;
};

export default function MassEmailDialog({
  isOpen,
  onClose,
}: MassEmailDialogProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen, filterStatus]);

  async function fetchLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          id,
          full_name,
          email,
          lead_status_history(status, created_at)
        `,
        )
        .order("full_name");

      if (error) throw error;

      // Process the data to get the latest status for each lead
      const processedLeads = data.map((lead) => {
        // Sort status history by created_at in descending order
        const sortedStatusHistory = lead.lead_status_history.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          id: lead.id,
          full_name: lead.full_name,
          email: lead.email,
          status: sortedStatusHistory[0]?.status || "new_contact",
        };
      });

      // Filter by status if needed
      const filteredLeads =
        filterStatus === "all"
          ? processedLeads
          : processedLeads.filter((lead) => lead.status === filterStatus);

      setLeads(filteredLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    }
  };

  const handleSendEmail = async (emailData: EmailData) => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Error",
        description: "No se ha seleccionado ningún lead",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Get email settings
      const settingsData = await getEmailSettings();

      if (!settingsData) {
        throw new Error("No se encontró la configuración de email");
      }

      // Get selected leads
      const selectedLeadsData = leads.filter((lead) =>
        selectedLeads.includes(lead.id),
      );

      // Send emails to all selected leads
      const result = await sendMassEmails(
        selectedLeadsData.map((lead) => ({ id: lead.id, email: lead.email })),
        {
          subject: emailData.subject,
          content: emailData.content,
          isHtml: emailData.isHtml,
        },
        {
          host: settingsData.smtp_host,
          port: settingsData.smtp_port,
          user: settingsData.smtp_user,
          password: settingsData.smtp_password,
          secure: settingsData.smtp_secure,
          fromEmail: settingsData.from_email,
          fromName: settingsData.from_name,
        },
      );

      // Log communications for successful emails
      const successfulLeads = selectedLeadsData.filter(
        (lead) => !result.failedEmails?.includes(lead.email),
      );

      for (const lead of successfulLeads) {
        await logCommunication(lead.id, emailData.subject, emailData.content);
      }

      if (result.success) {
        toast({
          title: "Emails enviados",
          description: result.message,
        });
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error sending mass emails:", error);
      toast({
        title: "Error al enviar emails",
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un problema al enviar los emails. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Email Masivo</DialogTitle>
          <DialogDescription>
            Selecciona los leads a los que quieres enviar un email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedLeads.length === leads.length && leads.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">Seleccionar todos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="filter-status">Filtrar por estado:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="new_contact">Nuevo Contacto</SelectItem>
                  <SelectItem value="first_contact">Primer Contacto</SelectItem>
                  <SelectItem value="info_sent">Información Enviada</SelectItem>
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
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando leads...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-4">No se encontraron leads</div>
          ) : (
            <div className="border rounded-md max-h-[200px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="w-10 p-2"></th>
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t">
                      <td className="p-2 text-center">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={(checked) =>
                            handleSelectLead(lead.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-2">{lead.full_name}</td>
                      <td className="p-2">{lead.email}</td>
                      <td className="p-2">
                        {getStatusLabel(lead.status || "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4">
            <EmailEditor
              onSend={handleSendEmail}
              onCancel={onClose}
              initialSubject=""
              initialContent=""
              showToField={false}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
