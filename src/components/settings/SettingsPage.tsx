import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailSettingsForm from "./EmailSettingsForm";
import AccountSettings from "./AccountSettings";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUserRole() {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error fetching user role:", error);
        } else {
          setUserRole(data || null);
        }
      } catch (error) {
        console.error("Error in getUserRole:", error);
      }
    }

    getUserRole();
  }, [user]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        {userRole === "superadmin" && (
          <Button onClick={() => navigate("/settings/users")}>
            <Users className="mr-2 h-4 w-4" /> Gestionar Usuarios
          </Button>
        )}
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <EmailSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}