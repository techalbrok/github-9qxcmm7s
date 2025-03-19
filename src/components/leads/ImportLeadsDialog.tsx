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

type Lead = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  source_channel?: string;
  interest_level?: string;
  investment_capacity?: string;
  previous_experience?: string;
  additional_comments?: string;
};

interface ImportLeadsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportLeadsDialog({
  isOpen,
  onClose,
  onSuccess,
}: ImportLeadsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<Lead[]>([]);

  const requiredFields = ["full_name", "email", "phone", "location"];

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
      const data = parseCSV<Lead>(text);
      const { isValid, errors } = validateCSVData<Lead>(data, requiredFields);

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

  const importLeads = async () => {
    if (!parsedData.length || !validationSuccess) return;

    setIsLoading(true);
    try {
      // Start a transaction to insert leads and their details
      const timestamp = new Date().toISOString();

      for (const lead of parsedData) {
        // Extract lead details
        const {
          source_channel,
          interest_level,
          investment_capacity,
          previous_experience,
          additional_comments,
          ...leadData
        } = lead;

        // Insert the lead
        const { data: leadInsertData, error: leadError } = await supabase
          .from("leads")
          .insert({
            ...leadData,
            created_at: timestamp,
          })
          .select();

        if (leadError) throw leadError;

        if (!leadInsertData || leadInsertData.length === 0) {
          throw new Error("No se pudo insertar el candidato");
        }

        const leadId = leadInsertData[0].id;

        // Insert lead details
        const { error: detailsError } = await supabase
          .from("lead_details")
          .insert({
            lead_id: leadId,
            source_channel: source_channel || "other",
            interest_level: parseInt(interest_level || "50"),
            investment_capacity: investment_capacity || "medium",
            previous_experience: previous_experience || "",
            additional_comments: additional_comments || "",
            score: parseInt(interest_level || "50"),
            created_at: timestamp,
          });

        if (detailsError) throw detailsError;

        // Insert initial status
        const { error: statusError } = await supabase
          .from("lead_status_history")
          .insert({
            lead_id: leadId,
            status: "new_contact",
            notes: "Importado desde CSV",
            created_at: timestamp,
          });

        if (statusError) throw statusError;
      }

      toast({
        title: "Importación exitosa",
        description: `Se importaron ${parsedData.length} candidatos correctamente.`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error importing leads:", error);
      toast({
        title: "Error",
        description: "No se pudieron importar los candidatos",
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
          <DialogTitle>Importar Candidatos desde CSV</DialogTitle>
          <DialogDescription>
            Sube un archivo CSV con los datos de los candidatos. El archivo debe
            contener las columnas: full_name, email, phone, location.
            Opcionalmente puede incluir source_channel, interest_level,
            investment_capacity, previous_experience y additional_comments.
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
                Se encontraron {parsedData.length} candidatos válidos para
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
            <Button type="button" onClick={importLeads} disabled={isLoading}>
              {isLoading ? "Importando..." : "Importar Candidatos"}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
