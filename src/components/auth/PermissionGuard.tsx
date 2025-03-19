import { ReactNode, useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PermissionGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  showAlert?: boolean;
}

export default function PermissionGuard({
  children,
  allowedRoles,
  fallback,
  showAlert = true,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserRole() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
          setUserRole(null);
        } else {
          setUserRole(data);
          setHasPermission(data && allowedRoles.includes(data));
        }
      } catch (error) {
        console.error("Error in checkUserRole:", error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }

    checkUserRole();
  }, [user, allowedRoles]);

  if (loading) {
    return <div className="p-4">Verificando permisos...</div>;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAlert) {
      return (
        <div className="max-w-2xl mx-auto my-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso Restringido</AlertTitle>
            <AlertDescription>
              <p className="mb-4">
                No tienes los permisos necesarios para acceder a esta sección.
                Esta funcionalidad está disponible solo para usuarios con roles
                específicos.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/leads/dashboard")}
              >
                Volver al Dashboard
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}
