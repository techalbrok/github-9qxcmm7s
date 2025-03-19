import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the request body
    const { email, password, fullName, role } = await req.json();

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already exists in auth.users
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email);

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) throw error;

    // Verify user was created and has an ID
    if (!data || !data.user || !data.user.id) {
      throw new Error("User created but no ID was returned");
    }

    // Create user in public.users with role
    const { error: userError } = await supabase.from("users").insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      created_at: new Date().toISOString(),
    });

    if (userError) {
      // If there was an error creating the user in the public.users table,
      // we should try to delete the auth user to maintain consistency
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
      } catch (deleteError) {
        console.error("Error deleting auth user after failed user creation:", deleteError);
      }
      throw userError;
    }

    return new Response(
      JSON.stringify({ success: true, userId: data.user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create user",
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});