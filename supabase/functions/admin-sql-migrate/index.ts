// Utilitaire interne de migration SQL.
// Double verrouillage : JWT d'un administrateur authentifié ET secret de migration.
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-migrate-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // 1) Secret de migration
  const accepted = [
    Deno.env.get("MIGRATE_SECRET_2026"),
    Deno.env.get("MIGRATE_SECRET"),
  ].filter((v): v is string => typeof v === "string" && v.length > 0);
  const provided = req.headers.get("x-migrate-secret") ?? "";
  if (accepted.length === 0 || !accepted.includes(provided)) {
    return json({ error: "Unauthorized" }, 401);
  }

  // 2) Identité administrateur authentifiée (obligatoire)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const token = authHeader.slice(7);

  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: userData, error: userErr } = await anon.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userErr || !userId) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return json({ error: "Forbidden" }, 403);

  let sql = "";
  try {
    const body = await req.json();
    sql = String(body?.sql ?? "");
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!sql.trim()) return json({ error: "Empty sql" }, 400);
  if (sql.length > 200_000) return json({ error: "Payload too large" }, 413);

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return json({ error: "Server configuration error" }, 500);

  console.log(`admin-sql-migrate invoked by ${userId} (${sql.length} chars)`);

  const client = new Client(dbUrl);
  try {
    await client.connect();
    await client.queryArray(sql);
    return json({ success: true });
  } catch (e) {
    console.error("admin-sql-migrate failed", e);
    return json({ success: false, error: "Migration failed" }, 400);
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
});
