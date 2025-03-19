import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PanelLeft,
  ListTodo,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`h-full bg-white border-r transform transition-all duration-200 ease-in-out ${collapsed ? "w-16" : "w-[300px]"}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          {!collapsed && (
            <h1 className="text-xl font-bold">Gestión de Candidatos</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={`${collapsed ? "mx-auto" : ""}`}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/leads/dashboard"
            className={`flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/dashboard") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
          >
            <LayoutDashboard className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-2">Dashboard</span>}
          </Link>

          <Link
            to="/leads/list"
            className={`flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/list") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
          >
            <Users className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-2">Candidatos</span>}
          </Link>

          <Link
            to="/leads/pipeline"
            className={`flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/pipeline") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
          >
            <PanelLeft className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-2">Pipeline</span>}
          </Link>

          <Link
            to="/leads/tasks"
            className={`flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/leads/tasks") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
          >
            <ListTodo className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-2">Tareas</span>}
          </Link>

          <Link
            to="/franchises"
            className={`flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/franchises") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
          >
            <Store className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-2">Franquicias</span>}
          </Link>

          <Link
            to="/settings"
            className={`flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 rounded-md hover:bg-gray-100 ${isActive("/settings") ? "bg-gray-100 text-primary" : "text-gray-700"}`}
          >
            <Settings className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-2">Configuración</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
