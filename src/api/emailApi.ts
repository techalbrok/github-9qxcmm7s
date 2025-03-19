import { supabase } from "../../supabase/supabase";
import { Tables } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";

type EmailSettings = Tables<"email_settings">;

export async function getEmailSettings(): Promise<EmailSettings | null> {
  try {
    const { data, error } = await supabase
      .from("email_settings")
      .select("*")
      .single();

    if (error) {
      if (error.code !== "PGRST116") { // PGRST116 is "no rows returned"
        console.error("Error fetching email settings:", error);
        toast({
          title: "Error",
          description: "No se pudo obtener la configuración de email",
          variant: "destructive"
        });
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getEmailSettings:", error);
    toast({
      title: "Error",
      description: "Error al obtener la configuración de email",
      variant: "destructive"
    });
    return null;
  }
}

export async function saveEmailSettings(
  settings: Partial<EmailSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("email_settings")
      .select("id")
      .single();

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from("email_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSettings.id);
    } else {
      // Insert new settings
      result = await supabase
        .from("email_settings")
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    if (result.error) throw result.error;

    return { success: true };
  } catch (error) {
    console.error("Error saving email settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}

export async function logCommunication(
  leadId: string,
  subject: string,
  content: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from("communications").insert({
      lead_id: leadId,
      type: "email",
      content: `Asunto: ${subject}\n\n${content}`,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging communication:", error);
    toast({
      title: "Error",
      description: "No se pudo registrar la comunicación",
      variant: "destructive"
    });
    return false;
  }
}