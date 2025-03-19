import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getEmailSettings, saveEmailSettings } from "@/api/emailApi";
import { sendEmail } from "@/services/emailService";

type EmailSettings = {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
};

export default function EmailSettingsForm() {
  const [settings, setSettings] = useState<EmailSettings>({
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
    smtp_secure: false,
    from_email: "",
    from_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const data = await getEmailSettings();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await saveEmailSettings(settings);

      if (!result.success) {
        throw new Error(result.error || "Error saving settings");
      }

      toast({
        title: "Configuración guardada",
        description:
          "La configuración de email ha sido guardada correctamente.",
      });
    } catch (error) {
      console.error("Error saving email settings:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de email",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una dirección de email para la prueba",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const result = await sendEmail(
        {
          to: testEmailAddress,
          subject: "Prueba de configuración SMTP",
          content:
            "<p>Este es un email de prueba para verificar la configuración SMTP.</p>",
          isHtml: true,
        },
        {
          host: settings.smtp_host,
          port: settings.smtp_port,
          user: settings.smtp_user,
          password: settings.smtp_password,
          secure: settings.smtp_secure,
          fromEmail: settings.from_email,
          fromName: settings.from_name,
        },
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      toast({
        title: "Email de prueba enviado",
        description: `Se ha enviado un email de prueba a ${testEmailAddress}`,
      });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error al enviar email de prueba",
        description:
          error.message ||
          "Ha ocurrido un problema al enviar el email de prueba. Por favor, verifica la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando configuración...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Email</CardTitle>
        <CardDescription>
          Configura los ajustes SMTP para enviar emails desde la plataforma
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_host">Servidor SMTP</Label>
              <Input
                id="smtp_host"
                name="smtp_host"
                value={settings.smtp_host}
                onChange={handleChange}
                placeholder="smtp.ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_port">Puerto SMTP</Label>
              <Input
                id="smtp_port"
                name="smtp_port"
                type="number"
                value={settings.smtp_port}
                onChange={handleChange}
                placeholder="587"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp_user">Usuario SMTP</Label>
              <Input
                id="smtp_user"
                name="smtp_user"
                value={settings.smtp_user}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp_password">Contraseña SMTP</Label>
              <Input
                id="smtp_password"
                name="smtp_password"
                type="password"
                value={settings.smtp_password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="smtp_secure"
              checked={settings.smtp_secure}
              onCheckedChange={(checked) =>
                handleSwitchChange("smtp_secure", checked)
              }
            />
            <Label htmlFor="smtp_secure">Usar conexión segura (SSL/TLS)</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_email">Email de Remitente</Label>
              <Input
                id="from_email"
                name="from_email"
                value={settings.from_email}
                onChange={handleChange}
                placeholder="noreply@tuempresa.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_name">Nombre de Remitente</Label>
              <Input
                id="from_name"
                name="from_name"
                value={settings.from_name}
                onChange={handleChange}
                placeholder="CRM Franquicias de Seguros"
                required
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium mb-2">Probar Configuración</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="email@ejemplo.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="max-w-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
              >
                {isSendingTest ? "Enviando..." : "Enviar Email de Prueba"}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
