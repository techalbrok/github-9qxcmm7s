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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  role: z.string().min(1, { message: "Debes seleccionar un rol" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export default function EditUserDialog({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();
  const isSelfEdit = currentUser?.id === user.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name || "",
      role: user.role || "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name || "",
        role: user.role || "",
        password: "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Update user in public.users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: values.full_name,
          role: values.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Update user metadata if current user is updating themselves
      if (isSelfEdit) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: values.full_name },
        });

        if (updateError) throw updateError;
      }

      // If password is provided, update it
      if (values.password && values.password.length >= 8) {
        try {
          // Call the update-user edge function to update the password
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                userId: user.id,
                fullName: values.full_name,
                password: values.password,
              }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error updating user");
          }
        } catch (passwordError) {
          console.error("Error updating password:", passwordError);
          throw new Error(
            passwordError instanceof Error
              ? passwordError.message
              : "Error al actualizar la contraseña",
          );
        }
      }

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el usuario",
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
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario {user.email}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="superadmin">
                        Superadministrador
                      </SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSelfEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dejar en blanco para mantener la actual"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
