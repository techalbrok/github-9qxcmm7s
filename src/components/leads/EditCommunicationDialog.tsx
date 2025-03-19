import { useState, useEffect } from "react";
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

const formSchema = z.object({
  type: z.enum(["call", "email", "meeting", "training", "other"]),
  content: z.string().min(2, { message: "El contenido es obligatorio" }),
});

function EditCommunicationDialog({
  communicationId,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "call",
      content: "",
    },
  });

  useEffect(() => {
    if (isOpen && communicationId) {
      fetchCommunicationData();
    }
  }, [isOpen, communicationId]);

  async function fetchCommunicationData() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("id", communicationId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          type: data.type,
          content: data.content,
        });
      }
    } catch (error) {
      console.error("Error fetching communication data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar los datos de la comunicación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("communications")
        .update({
          type: values.type,
          content: values.content,
        })
        .eq("id", communicationId);

      if (error) throw error;

      toast({
        title: "Comunicación actualizada",
        description: "La comunicación ha sido actualizada correctamente.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating communication:", error);
      toast({
        title: "Error al actualizar la comunicación",
        description:
          "Ha ocurrido un problema al actualizar la comunicación. Por favor, inténtalo de nuevo.",
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
          <DialogTitle>Editar Comunicación</DialogTitle>
          <DialogDescription>
            Modifica los detalles de esta comunicación.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos de la comunicación...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Comunicación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    "Guardar Cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditCommunicationDialog;
