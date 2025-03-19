import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImportFranchisesDialog from "./ImportFranchisesDialog";

type Franchise = {
  id: string;
  name: string;
  contact_person: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  website: string;
  tesis_code: string;
  created_at: string;
};

export default function FranchisesList() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFranchises();
  }, []);

  async function fetchFranchises() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFranchises(data || []);
    } catch (error) {
      console.error("Error fetching franchises:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las franquicias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredFranchises = franchises.filter(
    (franchise) =>
      franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.contact_person
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      franchise.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.tesis_code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Franquicias en Vigor</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" /> Importar CSV
          </Button>
          <Button onClick={() => navigate("/franchises/new")}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Franquicia
          </Button>
        </div>
      </div>

      {showImportDialog && (
        <ImportFranchisesDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onSuccess={fetchFranchises}
        />
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, contacto, localidad, provincia o código Tesis..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Franquicias Activas</CardTitle>
          <CardDescription>
            Listado de franquicias que han firmado contrato
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Cargando franquicias...</span>
            </div>
          ) : filteredFranchises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No se encontraron franquicias con esos criterios"
                : "No hay franquicias registradas"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFranchises.map((franchise) => (
                <Card
                  key={franchise.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/franchises/${franchise.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {franchise.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {franchise.contact_person}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {franchise.tesis_code || "Sin código"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <p>{franchise.address}</p>
                          <p>
                            {franchise.city}, {franchise.province}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{franchise.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{franchise.email}</span>
                      </div>
                      {franchise.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a
                            href={
                              franchise.website.startsWith("http")
                                ? franchise.website
                                : `https://${franchise.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {franchise.website.replace(/^https?:\/\//i, "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
