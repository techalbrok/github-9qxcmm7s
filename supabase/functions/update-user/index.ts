import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const { userId, fullName, password } = await req.json();

    // Validate required fields
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if user exists before trying to update
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (userError) {
      throw userError;
    }

    if (!userData || !userData.user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateData: any = {};

    // Add user metadata if fullName is provided
    if (fullName) {
      updateData.user_metadata = {
        ...userData.user.user_metadata,
        full_name: fullName,
      };
    }

    // Add password if provided
    if (password) {
      updateData.password = password;
    }

    // Update the user
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      updateData,
    );

    if (error) {
      throw error;
    }

    console.log("User updated successfully:", userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update user" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
