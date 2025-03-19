import { Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";

export function LeadsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which tab is active based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/leads/pipeline")) return "pipeline";
    if (path.includes("/leads/new")) return "new";
    if (path.includes("/leads/list")) return "list";
    if (path.includes("/leads/tasks")) return "tasks";
    if (path.includes("/leads/dashboard") || path === "/leads")
      return "dashboard";
    return "dashboard"; // Default to dashboard view
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case "dashboard":
        navigate("/leads/dashboard");
        break;
      case "list":
        navigate("/leads/list");
        break;
      case "pipeline":
        navigate("/leads/pipeline");
        break;
      case "new":
        navigate("/leads/new");
        break;
      case "tasks":
        navigate("/leads/tasks");
        break;
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 md:px-6 h-full bg-background">
      <Tabs
        value={getActiveTab()}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Panel</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="new">Nuevo Candidato</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

export default LeadsLayout;
