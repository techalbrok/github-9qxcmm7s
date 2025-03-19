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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";

const formSchema = z.object({
  title: z.string().min(2, { message: "El título es obligatorio" }),
  description: z.string().optional(),
  type: z.enum(["call", "email", "meeting", "training"]),
  due_date: z.date({
    required_error: "La fecha de vencimiento es obligatoria",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskDialogProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTaskDialog({
  leadId,
  isOpen,
  onClose,
  onSuccess,
}: AddTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "call",
      due_date: new Date(),
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) return;

    setIsSubmitting(true);
    try {
      console.log("Insertando tarea con valores:", {
        lead_id: leadId,
        title: values.title,
        description: values.description || null,
        due_date: values.due_date.toISOString(),
        type: values.type,
        completed: false,
      });

      // Insert task with essential fields and explicit defaults
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          title: values.title,
          description: values.description || null,
          due_date: values.due_date.toISOString(),
          type: values.type,
          completed: false,
        })
        .select();

      console.log("Respuesta de inserción de tarea:", { data, error });

      if (error) throw error;

      toast({
        title: "Tarea creada",
        description: "La tarea ha sido creada correctamente.",
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error al crear la tarea",
        description:
          "Ha ocurrido un problema al crear la tarea. Por favor, inténtalo de nuevo.",
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
          <DialogTitle>Añadir Nueva Tarea</DialogTitle>
          <DialogDescription>
            Crea una nueva tarea para este lead. Las tareas te ayudan a seguir
            las acciones pendientes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Llamar para seguimiento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Tarea</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo de tarea" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Llamada</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Reunión</SelectItem>
                      <SelectItem value="training">Formación</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales sobre la tarea"
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
                  "Guardar Tarea"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
