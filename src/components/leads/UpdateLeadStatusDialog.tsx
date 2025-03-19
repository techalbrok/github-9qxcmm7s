import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";

const formSchema = z.object({
  status: z.string().min(1, { message: "El estado es obligatorio" }),
  notes: z.string().min(2, { message: "Las notas son obligatorias" }),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateLeadStatusDialogProps {
  leadId: string;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateLeadStatusDialog({
  leadId,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}: UpdateLeadStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: currentStatus,
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Insert new status
      const { error } = await supabase.from("lead_status_history").insert({
        lead_id: leadId,
        status: values.status,
        notes: values.notes,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: "El estado del lead ha sido actualizado correctamente.",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error al actualizar el estado",
        description:
          "Ha ocurrido un problema al actualizar el estado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Actualizar Estado del Lead</DialogTitle>
          <DialogDescription>
            Actualiza el estado del lead en el pipeline y añade notas sobre el
            cambio.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new_contact">
                        Nuevo Contacto
                      </SelectItem>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles sobre el cambio de estado"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Actualizar Estado"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
