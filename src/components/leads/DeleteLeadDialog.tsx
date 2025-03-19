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
import { useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface DeleteLeadDialogProps {
  leadId: string;
  leadName: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteLeadDialog({
  leadId,
  leadName,
  isOpen,
  onClose,
  onDeleted,
}: DeleteLeadDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete lead and all related data (cascade delete should handle related records)
      const { error } = await supabase.from("leads").delete().eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Lead eliminado",
        description: "El lead ha sido eliminado correctamente.",
      });

      onDeleted();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Error al eliminar el lead",
        description:
          "Ha ocurrido un problema al eliminar el lead. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el lead{" "}
            <strong>{leadName}</strong> y todos sus datos relacionados. Esta
            acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
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
  );
}
