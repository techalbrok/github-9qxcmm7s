import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  User,
  LogOut,
  Menu,
  X,
  BarChart2,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  PanelLeft,
  UserCog,
  ShieldCheck,
  Store,
  Building,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import RoleIndicator from "../auth/RoleIndicator";
import { supabase } from "../../../supabase/supabase";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserRole() {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("get_current_user_role");

        if (error) {
          console.error("Error checking user role:", error);
        } else {
          setUserRole(data);
        }
      } catch (error) {
        console.error("Error in checkUserRole:", error);
      }
    }

    checkUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 pt-16 mt-2">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 h-[calc(100vh-64px)] z-40 bg-white border-r transform transition-all duration-200 ease-in-out ${sidebarCollapsed ? "w-16" : "w-[300px]"}`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              {!sidebarCollapsed && (
                <h1 className="text-xl font-bold">Gestión de Candidatos</h1>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`${sidebarCollapsed ? "mx-auto" : ""}`}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <Link
                to="/leads/dashboard"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/dashboard") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
              >
                <LayoutDashboard className="h-5 w-5 min-w-5" />
                {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
              </Link>

              <Link
                to="/leads/list"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/list") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
              >
                <Users className="h-5 w-5 min-w-5" />
                {!sidebarCollapsed && <span className="ml-2">Candidatos</span>}
              </Link>

              <Link
                to="/leads/pipeline"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/pipeline") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
              >
                <PanelLeft className="h-5 w-5 min-w-5" />
                {!sidebarCollapsed && <span className="ml-2">Pipeline</span>}
              </Link>

              <Link
                to="/leads/tasks"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/tasks") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
              >
                <ListTodo className="h-5 w-5 min-w-5" />
                {!sidebarCollapsed && <span className="ml-2">Tareas</span>}
              </Link>

              <Link
                to="/franchises"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/franchises") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
              >
                <Store className="h-5 w-5 min-w-5" />
                {!sidebarCollapsed && <span className="ml-2">Franquicias</span>}
              </Link>

              <Link
                to="/settings"
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/settings") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
              >
                <Settings className="h-5 w-5 min-w-5" />
                {!sidebarCollapsed && (
                  <span className="ml-2">Configuración</span>
                )}
              </Link>

              {userRole === "superadmin" && (
                <Link
                  to="/settings/users"
                  className={`flex items-center ${sidebarCollapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/settings/users") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
                >
                  <UserCog className="h-5 w-5 min-w-5" />
                  {!sidebarCollapsed && (
                    <span className="ml-2">Gestión de Usuarios</span>
                  )}
                </Link>
              )}
            </nav>

            <div className="p-4 border-t">
              <div
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
              >
                <div
                  className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={user.email || ""}
                    />
                    <AvatarFallback>
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!sidebarCollapsed && (
                    <div className="ml-2">
                      <span className="text-sm font-medium truncate block">
                        {user.email}
                      </span>
                      <RoleIndicator className="mt-1" />
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? "ml-16" : "ml-[300px]"}`}
        >
          <main
            className="min-h-screen pt-4 px-4 mx-auto"
            style={{ maxWidth: "1200px" }}
          >
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
