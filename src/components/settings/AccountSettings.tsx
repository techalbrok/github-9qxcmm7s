import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
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
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccountSettings() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  async function fetchUserData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserData(data);
        form.reset({
          full_name: data.full_name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update user metadata in auth.users
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: values.full_name },
      });

      if (metadataError) throw metadataError;

      // Update user in public.users
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: values.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (userError) throw userError;

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });

      // Refresh user data
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "superadmin":
        return "Superadministrador";
      case "admin":
        return "Administrador";
      case "user":
        return "Usuario";
      default:
        return role;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Cargando datos del perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={userData?.avatar_url} />
          <AvatarFallback>
            {userData?.full_name?.[0] || userData?.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{userData?.full_name}</h3>
          <p className="text-muted-foreground">{userData?.email}</p>
          <p className="text-sm mt-1">
            Rol:{" "}
            <span className="font-medium">
              {getRoleLabel(userData?.role || "user")}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Editar Perfil</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
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
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
