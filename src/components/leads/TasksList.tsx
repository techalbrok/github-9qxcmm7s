import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Phone,
  Mail,
  Users,
  BookOpen,
  MoreVertical,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AddCommunicationDialog from "./AddCommunicationDialog";
import EditTaskDialog from "./EditTaskDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
};

interface TasksListProps {
  leadId: string;
  onTasksChange: () => void;
}

export default function TasksList({ leadId, onTasksChange }: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [leadId]);

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("lead_id", leadId)
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

      if (completed) {
        // Find the task that was completed
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          setSelectedTask(task);
          setShowCommunicationDialog(true);
        }
      }

      onTasksChange();
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

  async function handleDeleteTask(taskId: string) {
    try {
      setIsDeleting(true);
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente",
      });

      onTasksChange();
      setShowDeleteDialog(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

  function handleCommunicationSuccess() {
    onTasksChange();
    fetchTasks();
  }

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span>Cargando tareas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedTask && (
        <AddCommunicationDialog
          leadId={leadId}
          isOpen={showCommunicationDialog}
          onClose={() => {
            setShowCommunicationDialog(false);
            setSelectedTask(null);
          }}
          onSuccess={handleCommunicationSuccess}
          initialType={selectedTask.type}
          initialContent={`Tarea completada: ${selectedTask.title}\n\n${selectedTask.description || ""}`}
        />
      )}

      {taskToEdit && (
        <EditTaskDialog
          taskId={taskToEdit}
          isOpen={showEditTaskDialog}
          onClose={() => {
            setShowEditTaskDialog(false);
            setTaskToEdit(null);
          }}
          onSuccess={() => {
            fetchTasks();
            onTasksChange();
          }}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la tarea. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (taskToDelete) {
                  handleDeleteTask(taskToDelete);
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div>
        <h3 className="font-medium mb-2">
          Tareas Pendientes ({pendingTasks.length})
        </h3>
        {pendingTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay tareas pendientes
          </p>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <Card key={task.id} className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
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
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <p className="font-medium">{task.title}</p>
                          <Badge
                            variant="outline"
                            className="ml-2 flex items-center space-x-1"
                          >
                            {getTaskIcon(task.type)}
                            <span>{getTaskTypeLabel(task.type)}</span>
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Vence:{" "}
                          {format(new Date(task.due_date), "PPP", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          onClick={() => {
                            setTaskToEdit(task.id);
                            setShowEditTaskDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setTaskToDelete(task.id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">
            Tareas Completadas ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <Card key={task.id} className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <div className="pt-0.5">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => {
                            if (typeof checked === "boolean") {
                              handleTaskCompletion(task.id, checked);
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <p className="font-medium line-through text-muted-foreground">
                            {task.title}
                          </p>
                          <Badge
                            variant="outline"
                            className="ml-2 flex items-center space-x-1 opacity-70"
                          >
                            {getTaskIcon(task.type)}
                            <span>{getTaskTypeLabel(task.type)}</span>
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-through">
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Completada:{" "}
                          {format(
                            new Date(task.completed_at || task.created_at),
                            "PPP",
                            {
                              locale: es,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleTaskCompletion(task.id, false)}
                        >
                          Marcar como pendiente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setTaskToEdit(task.id);
                            setShowEditTaskDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setTaskToDelete(task.id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
