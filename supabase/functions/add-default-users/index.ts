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
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    console.log("Supabase URL:", supabaseUrl);
    console.log("Service Key available:", !!supabaseServiceKey);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const defaultUsers = [
      {
        email: "aheras@albroksa.com",
        password: "00000000",
        fullName: "Alba Heras",
        role: "admin",
      },
      {
        email: "mchaves@albroksa.com",
        password: "00000000",
        fullName: "Marcos Chaves",
        role: "admin",
      },
      {
        email: "amirat@albroksa.com",
        password: "00000000",
        fullName: "Ángel Mirat",
        role: "user",
      },
    ];

    const results = [];

    for (const userData of defaultUsers) {
      const { email, password, fullName, role } = userData;

      try {
        console.log(`Processing user: ${email}`);

        // Check if user already exists in auth.users
        const { data: existingUsers, error: checkError } = await supabase
          .from("users")
          .select("*")
          .eq("email", email);

        if (checkError) {
          console.error(`Error checking if user exists: ${email}`, checkError);
          throw checkError;
        }

        if (existingUsers && existingUsers.length > 0) {
          console.log(`User already exists: ${email}`);
          results.push({
            email,
            status: "skipped",
            message: "User already exists",
          });
          continue;
        }

        // Create the user
        console.log(`Creating user: ${email}`);
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

        if (error) {
          console.error(`Error creating user: ${email}`, error);
          results.push({
            email,
            status: "error",
            message: error.message,
          });
          continue;
        }

        // Verify user was created and has an ID
        if (!data || !data.user || !data.user.id) {
          console.error(`User created but no ID returned: ${email}`);
          results.push({
            email,
            status: "error",
            message: "User created but no ID was returned",
          });
          continue;
        }

        // Create user in public.users with role
        console.log(`Creating user in public.users: ${email}`);
        const { error: userError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          created_at: new Date().toISOString(),
        });

        if (userError) {
          console.error(
            `Error creating user in public.users: ${email}`,
            userError,
          );
          results.push({
            email,
            status: "partial",
            message: `Auth user created but failed to create in public.users: ${userError.message}`,
          });
          continue;
        }

        console.log(`User created successfully: ${email}`);
        results.push({
          email,
          status: "success",
          message: "User created successfully",
        });
      } catch (userError) {
        console.error(`Unexpected error processing user: ${email}`, userError);
        results.push({
          email,
          status: "error",
          message: userError.message || "Unexpected error",
        });
      }
    }

    console.log("All users processed. Results:", results);
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating default users:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create default users",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
