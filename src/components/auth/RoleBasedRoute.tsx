import { Navigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useEffect, useState } from "react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleBasedRoute({
  children,
  allowedRoles,
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        } else {
          setUserRole(data?.role || null);
        }
      } catch (error) {
        console.error("Error in getUserRole:", error);
        setUserRole(null);
      } finally {
        setCheckingRole(false);
      }
    }

    getUserRole();
  }, [user]);

  if (loading || checkingRole) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/leads/dashboard" />;
  }

  return <>{children}</>;
}
