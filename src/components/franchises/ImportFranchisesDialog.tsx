import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileInput } from "@/components/ui/file-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { parseCSV, validateCSVData } from "@/utils/csvUtils";
import { supabase } from "../../../supabase/supabase";
import { toast } from "@/components/ui/use-toast";

type Franchise = {
  name: string;
  contact_person: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website?: string;
  tesis_code?: string;
};

interface ImportFranchisesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportFranchisesDialog({
  isOpen,
  onClose,
  onSuccess,
}: ImportFranchisesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<Franchise[]>([]);

  const requiredFields = [
    "name",
    "contact_person",
    "address",
    "city",
    "province",
    "phone",
    "email",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      setValidationSuccess(false);
      setParsedData([]);
    }
  };

  const validateFile = async () => {
    if (!file) return;

    setIsLoading(true);
    setValidationErrors([]);
    setValidationSuccess(false);

    try {
      const text = await file.text();
      const data = parseCSV<Franchise>(text);
      const { isValid, errors } = validateCSVData<Franchise>(
        data,
        requiredFields,
      );

      if (isValid) {
        setValidationSuccess(true);
        setParsedData(data);
      } else {
        setValidationErrors(errors);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setValidationErrors([
        "Error al procesar el archivo CSV. Verifique el formato.",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const importFranchises = async () => {
    if (!parsedData.length || !validationSuccess) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("franchises").insert(
        parsedData.map((franchise) => ({
          ...franchise,
          created_at: new Date().toISOString(),
        })),
      );

      if (error) throw error;

      toast({
        title: "Importación exitosa",
        description: `Se importaron ${parsedData.length} franquicias correctamente.`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error importing franchises:", error);
      toast({
        title: "Error",
        description: "No se pudieron importar las franquicias",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Franquicias desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de las franquicias. El archivo
            debe contener las columnas: name, contact_person, address, city,
            province, phone, email. Opcionalmente puede incluir website y
            tesis_code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <FileInput
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {file && (
            <div className="text-sm">
              <p className="font-medium">Archivo seleccionado:</p>
              <p>{file.name}</p>
            </div>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errores de validación</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Validación exitosa
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Se encontraron {parsedData.length} franquicias válidas para
                importar.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          {!validationSuccess ? (
            <Button
              type="button"
              onClick={validateFile}
              disabled={!file || isLoading}
            >
              {isLoading ? "Validando..." : "Validar CSV"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={importFranchises}
              disabled={isLoading}
            >
              {isLoading ? "Importando..." : "Importar Franquicias"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
