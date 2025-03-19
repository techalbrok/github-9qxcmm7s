import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import EmailEditor, { EmailData } from "./EmailEditor";
import { getEmailSettings } from "@/api/emailApi";
import { sendEmail } from "@/services/emailService";
import { logCommunication } from "@/api/emailApi";

interface SendEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  leadId: string;
}

export default function SendEmailDialog({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  leadId,
}: SendEmailDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (emailData: EmailData) => {
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "No se ha especificado un destinatario",
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

      // Send email using the SMTP service
      const result = await sendEmail(
        {
          to: recipientEmail,
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
        leadId,
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      // Log the communication
      await logCommunication(leadId, emailData.subject, emailData.content);

      toast({
        title: "Email enviado",
        description: `El email ha sido enviado a ${recipientEmail}`,
      });

      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error al enviar el email",
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un problema al enviar el email. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar Email</DialogTitle>
          <DialogDescription>
            Enviar un email a {recipientName} ({recipientEmail})
          </DialogDescription>
        </DialogHeader>

        <EmailEditor
          onSend={handleSendEmail}
          onCancel={onClose}
          initialTo={recipientEmail}
          showToField={false}
        />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
