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
  type: z.enum(["call", "email", "meeting", "training", "other"]),
  content: z.string().min(2, { message: "El contenido es obligatorio" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCommunicationDialogProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: string;
  initialContent?: string;
}

export default function AddCommunicationDialog({
  leadId,
  isOpen,
  onClose,
  onSuccess,
  initialType = "call",
  initialContent = "",
}: AddCommunicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialType as "call" | "email" | "meeting" | "training" | "other",
      content: initialContent,
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Insert communication
      const { error } = await supabase.from("communications").insert({
        lead_id: leadId,
        type: values.type,
        content: values.content,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Comunicación registrada",
        description: "La comunicación ha sido registrada correctamente.",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating communication:", error);
      toast({
        title: "Error al registrar la comunicación",
        description:
          "Ha ocurrido un problema al registrar la comunicación. Por favor, inténtalo de nuevo.",
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
          <DialogTitle>Añadir Comunicación</DialogTitle>
          <DialogDescription>
            Registra una comunicación con este lead para mantener un historial
            completo de interacciones.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Comunicación</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo de comunicación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Llamada</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Reunión</SelectItem>
                      <SelectItem value="training">Formación</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles de la comunicación"
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
                  "Guardar Comunicación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
