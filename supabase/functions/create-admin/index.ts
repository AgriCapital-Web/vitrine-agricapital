import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const normalizeSecret = (value: string | undefined) =>
  value?.trim().replace(/^['"]|['"]$/g, "");

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("Create-admin function called, method:", req.method);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin secret from environment variable
    const expectedSecret = normalizeSecret(Deno.env.get("ADMIN_INIT_SECRET"));
    const authHeader = normalizeSecret(req.headers.get("x-admin-secret") ?? undefined);
    
    console.log("Auth header received:", authHeader ? "present" : "missing");
    console.log("Expected secret configured:", expectedSecret ? "yes" : "no");
    
    if (!expectedSecret) {
      console.log("ADMIN_INIT_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Admin initialization not configured", success: false }),
        { 
          status: 503, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (authHeader !== expectedSecret) {
      console.log("Unauthorized access attempt - secrets don't match");
      return new Response(
        JSON.stringify({ error: "Unauthorized", success: false }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Supabase URL:", supabaseUrl ? "configured" : "missing");
    console.log("Service role key:", supabaseServiceRoleKey ? "configured" : "missing");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get admin credentials from environment variables
    const adminEmail = normalizeSecret(Deno.env.get("ADMIN_EMAIL"))?.toLowerCase();
    const adminPassword = normalizeSecret(Deno.env.get("ADMIN_PASSWORD"));
    
    if (!adminEmail || !adminPassword) {
      console.log("Admin credentials not configured");
      return new Response(
        JSON.stringify({ error: "Admin credentials not configured", success: false }),
        { 
          status: 503, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!isValidEmail(adminEmail)) {
      console.error("Invalid ADMIN_EMAIL format");
      return new Response(
        JSON.stringify({ error: "ADMIN_EMAIL has an invalid format", success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // One-time setup only: if an admin role already exists, refuse.
    const { data: existingAdminRoles, error: adminRoleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (adminRoleError) {
      console.error("Error checking existing admin roles:", adminRoleError);
      throw adminRoleError;
    }

    if (existingAdminRoles && existingAdminRoles.length > 0) {
      console.log("Setup already completed - refusing to run again");
      return new Response(
        JSON.stringify({ error: "Setup already completed", success: false }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the admin auth user exists (without touching its credentials)
    console.log("Checking if admin exists...");
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    const existingAdmin = existingUsers?.users?.find(
      (user) => user.email === adminEmail
    );

    if (existingAdmin) {
      console.log("Admin user exists, granting role only (no credential change)");

      const { error: roleInsertError } = await supabase
        .from("user_roles")
        .insert({ user_id: existingAdmin.id, role: "admin" });

      if (roleInsertError) {
        console.error("Error inserting role:", roleInsertError);
        throw roleInsertError;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", existingAdmin.id)
        .maybeSingle();

      if (!profileData) {
        await supabase.from("profiles").insert({ user_id: existingAdmin.id });
      }

      return new Response(
        JSON.stringify({
          message: "Admin role granted to the existing account",
          success: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    // Create new admin user
    console.log("Creating new admin user...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: "Inocent",
        last_name: "KOFFI",
      }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }

    console.log("Admin user created successfully");

    // Add admin role and profile
    if (newUser?.user) {
      console.log("Adding admin role...");
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: newUser.user.id,
        role: "admin",
      });

      if (roleError) {
        console.error("Error adding role:", roleError);
        throw roleError;
      }
      console.log("Admin role added successfully");

      // Create profile
      console.log("Creating admin profile...");
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: newUser.user.id,
        first_name: "Inocent",
        last_name: "KOFFI",
        phone: "0759566087",
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't throw, profile creation is not critical
      } else {
        console.log("Admin profile created successfully");
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Admin created successfully", 
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred", success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
