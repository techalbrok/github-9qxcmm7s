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
import { toast } from "@/components/ui/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  contact_person: z
    .string()
    .min(2, {
      message: "La persona de contacto debe tener al menos 2 caracteres",
    }),
  address: z
    .string()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  city: z
    .string()
    .min(2, { message: "La localidad debe tener al menos 2 caracteres" }),
  province: z
    .string()
    .min(2, { message: "La provincia debe tener al menos 2 caracteres" }),
  phone: z
    .string()
    .min(9, { message: "El teléfono debe tener al menos 9 caracteres" }),
  email: z.string().email({ message: "Debe ser un email válido" }),
  website: z.string().optional(),
  tesis_code: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FranchiseFormProps {
  isEdit?: boolean;
}

export default function FranchiseForm({ isEdit = false }: FranchiseFormProps) {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      address: "",
      city: "",
      province: "",
      phone: "",
      email: "",
      website: "",
      tesis_code: "",
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

    if (isEdit && id) {
      fetchFranchiseData(id);
    }
  }, [isEdit, id]);

  async function fetchFranchiseData(franchiseId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .eq("id", franchiseId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          name: data.name || "",
          contact_person: data.contact_person || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          tesis_code: data.tesis_code || "",
        });
      }
    } catch (error) {
      console.error("Error fetching franchise data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de la franquicia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!isAuthorized) {
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para realizar esta acción",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      let operation;

      if (isEdit && id) {
        // Update existing franchise
        operation = supabase
          .from("franchises")
          .update({
            name: values.name,
            contact_person: values.contact_person,
            address: values.address,
            city: values.city,
            province: values.province,
            phone: values.phone,
            email: values.email,
            website: values.website,
            tesis_code: values.tesis_code,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      } else {
        // Create new franchise
        operation = supabase.from("franchises").insert({
          name: values.name,
          contact_person: values.contact_person,
          address: values.address,
          city: values.city,
          province: values.province,
          phone: values.phone,
          email: values.email,
          website: values.website,
          tesis_code: values.tesis_code,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const { error, data } = await operation;

      if (error) throw error;

      toast({
        title: isEdit ? "Franquicia actualizada" : "Franquicia creada",
        description: isEdit
          ? "La franquicia ha sido actualizada correctamente"
          : "La franquicia ha sido creada correctamente",
      });

      navigate("/franchises");
    } catch (error) {
      console.error("Error saving franchise:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la franquicia",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 mb-4">
          No tienes permisos para gestionar franquicias. Contacta con un
          administrador si necesitas acceso.
        </p>
        <Button variant="outline" onClick={() => navigate("/franchises")}>
          Volver al listado
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos de la franquicia...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? "Editar Franquicia" : "Nueva Franquicia"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Franquicia</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la franquicia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre y apellidos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección Completa</FormLabel>
                <FormControl>
                  <Input placeholder="Calle, número, piso, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Localidad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input placeholder="Provincia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Página Web (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="www.ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tesis_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Tesis (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Código identificativo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/franchises")}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Actualizando..." : "Creando..."}
                </>
              ) : isEdit ? (
                "Actualizar Franquicia"
              ) : (
                "Crear Franquicia"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
