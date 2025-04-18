import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  phone: z
    .string()
    .min(6, { message: "Por favor, introduce un teléfono válido." }),
  location: z.string().min(2, { message: "La ubicación es obligatoria." }),
  previous_experience: z.string().optional(),
  investment_capacity: z
    .string()
    .min(1, { message: "La capacidad de inversión es obligatoria." }),
  source_channel: z
    .string()
    .min(1, { message: "El canal de origen es obligatorio." }),
  interest_level: z
    .string()
    .min(1, { message: "El nivel de interés es obligatorio." }),
  additional_comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditLeadFormProps {
  leadId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function EditLeadForm({ leadId, onSuccess, onCancel }: EditLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      previous_experience: "",
      investment_capacity: "",
      source_channel: "",
      interest_level: "",
      additional_comments: "",
    },
  });

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
  }, []);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("leads")
          .select(
            `
            *,
            lead_details(*)
          `,
          )
          .eq("id", leadId)
          .single();

        if (error) throw error;

        if (data) {
          console.log("Lead data loaded:", data);
          console.log("Lead details loaded:", data.lead_details);

          // Handle lead_details as an array or single object
          const leadDetails =
            Array.isArray(data.lead_details) && data.lead_details.length > 0
              ? data.lead_details[0]
              : data.lead_details || {};

          // Asegurarse de que todos los campos tengan valores por defecto
          const formData = {
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            previous_experience:
              leadDetails.previous_experience !== null &&
              leadDetails.previous_experience !== undefined
                ? leadDetails.previous_experience
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
                ? String(leadDetails.interest_level)
                : "3",
            additional_comments:
              leadDetails.additional_comments !== null &&
              leadDetails.additional_comments !== undefined
                ? leadDetails.additional_comments
                : "",
          };

          console.log("Lead details loaded for form:", {
            previous_experience: leadDetails.previous_experience,
            investment_capacity: leadDetails.investment_capacity,
            source_channel: leadDetails.source_channel,
            interest_level: leadDetails.interest_level,
            additional_comments: leadDetails.additional_comments,
          });

          console.log("Form data to set:", formData);
          form.reset(formData);
        }
      } catch (error) {
        console.error("Error fetching lead data:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar los datos del lead",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [leadId, form]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      console.log("Updating lead with values:", values);

      // Force refresh the session to ensure we have the latest data
      await supabase.auth.refreshSession();

      // Update leads table
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .update({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          location: values.location,
        })
        .eq("id", leadId)
        .select();

      if (leadError) {
        console.error("Error updating lead:", leadError);
        throw leadError;
      }

      console.log("Lead updated:", leadData);

      // Check if lead_details exists for this lead
      const { data: existingDetails, error: checkError } = await supabase
        .from("lead_details")
        .select("*")
        .eq("lead_id", leadId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking lead details:", checkError);
        throw checkError;
      }

      let detailsOperation;
      if (existingDetails) {
        // Update existing lead_details
        detailsOperation = supabase
          .from("lead_details")
          .update({
            previous_experience:
              values.previous_experience !== undefined
                ? values.previous_experience
                : "",
            investment_capacity:
              values.investment_capacity !== undefined &&
              values.investment_capacity !== ""
                ? values.investment_capacity
                : "no",
            source_channel:
              values.source_channel !== undefined &&
              values.source_channel !== ""
                ? values.source_channel
                : "website",
            interest_level:
              values.interest_level !== undefined
                ? parseInt(values.interest_level)
                : 3,
            additional_comments:
              values.additional_comments !== undefined
                ? values.additional_comments
                : "",
            // Recalculate score
            score: calculateLeadScore(values),
            // Add updated_at timestamp
            updated_at: new Date().toISOString(),
          })
          .eq("lead_id", leadId);
      } else {
        // Insert new lead_details if it doesn't exist
        detailsOperation = supabase.from("lead_details").insert({
          lead_id: leadId,
          previous_experience:
            values.previous_experience !== undefined
              ? values.previous_experience
              : "",
          investment_capacity:
            values.investment_capacity !== undefined &&
            values.investment_capacity !== ""
              ? values.investment_capacity
              : "no",
          source_channel:
            values.source_channel !== undefined && values.source_channel !== ""
              ? values.source_channel
              : "website",
          interest_level:
            values.interest_level !== undefined
              ? parseInt(values.interest_level)
              : 3,
          additional_comments:
            values.additional_comments !== undefined
              ? values.additional_comments
              : "",
          score: calculateLeadScore(values),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const { data: detailsData, error: detailsError } =
        await detailsOperation.select();

      console.log("Lead details operation result:", {
        detailsData,
        detailsError,
      });

      if (detailsError) {
        console.error("Error updating lead details:", detailsError);
        throw detailsError;
      }

      console.log("Lead details updated:", detailsData);

      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado correctamente.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/leads/${leadId}`);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Error al actualizar el lead",
        description:
          "Ha ocurrido un problema al actualizar el lead. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Simple scoring function - can be expanded with more complex logic
  function calculateLeadScore(values: FormValues): number {
    let score = 0;

    // Interest level contributes up to 50 points
    score += parseInt(values.interest_level) * 10;

    // Local availability contributes up to 50 points
    switch (values.investment_capacity) {
      case "yes":
        score += 50;
        break;
      case "no":
        score += 10;
        break;
    }

    // Previous experience can add bonus points
    if (values.previous_experience && values.previous_experience.length > 0) {
      score += 10;
    }

    // Additional comments can add bonus points
    if (values.additional_comments && values.additional_comments.length > 0) {
      score += 5;
    }

    console.log("Calculated score:", score, "for values:", values);
    return score;
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 mb-4">
          No tienes permisos para editar leads. Contacta con un administrador si
          necesitas acceso.
        </p>
        <Button
          variant="outline"
          onClick={onCancel || (() => navigate(`/leads/${leadId}`))}
        >
          Volver a detalles
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos del lead...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Editar Lead</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ciudad, País" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="previous_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiencia Previa</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa cualquier experiencia relevante en el sector de seguros"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investment_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Dispone de local?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal de Origen</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione canal de origen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="website">Sitio Web</SelectItem>
                      <SelectItem value="referral">Referencia</SelectItem>
                      <SelectItem value="social_media">
                        Redes Sociales
                      </SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="advertisement">Publicidad</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de Interés</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione nivel de interés" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Bajo</SelectItem>
                      <SelectItem value="2">2 - Bajo</SelectItem>
                      <SelectItem value="3">3 - Medio</SelectItem>
                      <SelectItem value="4">4 - Alto</SelectItem>
                      <SelectItem value="5">5 - Muy Alto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="additional_comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios Adicionales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cualquier información adicional sobre el lead"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EditLeadForm;
