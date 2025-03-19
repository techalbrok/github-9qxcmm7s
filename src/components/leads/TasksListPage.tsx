import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  Users,
  BookOpen,
  MoreVertical,
  Loader2,
  Search,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Task = {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  type: string;
  assigned_to: string | null;
  created_at: string;
  lead: {
    full_name: string;
    email: string;
  };
};

export default function TasksListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          lead:lead_id(full_name, email)
        `,
        )
        .order("due_date", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleTaskCompletion(taskId: string, completed: boolean) {
    setCompletingTask(taskId);
    try {
      // Actualizar la fecha de completado si la tarea se marca como completada
      const updateData = completed
        ? { completed, completed_at: new Date().toISOString() }
        : { completed, completed_at: null };

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
              }
            : task,
        ),
      );

      toast({
        title: completed ? "Tarea completada" : "Tarea marcada como pendiente",
        description: "El estado de la tarea ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive",
      });
    } finally {
      setCompletingTask(null);
    }
  }

  function getTaskIcon(type: string) {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "training":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  }

  function getTaskTypeLabel(type: string) {
    switch (type) {
      case "call":
        return "Llamada";
      case "email":
        return "Email";
      case "meeting":
        return "Reunión";
      case "training":
        return "Formación";
      default:
        return type;
    }
  }

  function formatDate(dateString: string) {
    return format(new Date(dateString), "PPP", { locale: es });
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: "1200px" }}>
      <h2 className="text-2xl font-bold mb-6">Lista de Tareas</h2>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tareas o leads..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtrar
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Tareas Pendientes ({pendingTasks.length})
          </h3>
          {pendingTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay tareas pendientes
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-2">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => {
                              if (typeof checked === "boolean") {
                                handleTaskCompletion(task.id, checked);
                              }
                            }}
                            disabled={completingTask === task.id}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge
                            variant="outline"
                            className="mt-1 flex items-center space-x-1 w-fit"
                          >
                            {getTaskIcon(task.type)}
                            <span>{getTaskTypeLabel(task.type)}</span>
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleTaskCompletion(task.id, true)}
                            disabled={completingTask === task.id}
                          >
                            Marcar como completada
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate(`/leads/${task.lead_id}`)}
                          >
                            Ver detalles del lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Vence: {formatDate(task.due_date)}</span>
                      </div>
                      <div
                        className="flex items-center cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/leads/${task.lead_id}`)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        <span>{task.lead.full_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            Tareas Completadas ({completedTasks.length})
          </h3>
          {completedTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay tareas completadas
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-2">
                        <div className="pt-0.5">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => {
                              if (typeof checked === "boolean") {
                                handleTaskCompletion(task.id, checked);
                              }
                            }}
                            disabled={completingTask === task.id}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium line-through text-muted-foreground">
                            {task.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className="mt-1 flex items-center space-x-1 w-fit opacity-70"
                          >
                            {getTaskIcon(task.type)}
                            <span>{getTaskTypeLabel(task.type)}</span>
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleTaskCompletion(task.id, false)}
                            disabled={completingTask === task.id}
                          >
                            Marcar como pendiente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate(`/leads/${task.lead_id}`)}
                          >
                            Ver detalles del lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground line-through mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Completada:{" "}
                          {formatDate(task.completed_at || task.created_at)}
                        </span>
                      </div>
                      <div
                        className="flex items-center cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/leads/${task.lead_id}`)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        <span>{task.lead.full_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
