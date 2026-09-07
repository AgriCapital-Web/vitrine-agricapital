// Utilitaire interne de migration SQL (protégé par MIGRATE_SECRET).
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-migrate-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const accepted = [
    Deno.env.get("MIGRATE_SECRET_2026"),
    Deno.env.get("MIGRATE_SECRET"),
  ].filter((v): v is string => typeof v === "string" && v.length > 0);
  const provided = req.headers.get("x-migrate-secret") ?? "";
  if (accepted.length === 0 || !accepted.includes(provided)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sql = "";
  try {
    const body = await req.json();
    sql = String(body?.sql ?? "");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!sql.trim()) {
    return new Response(JSON.stringify({ error: "Empty sql" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "SUPABASE_DB_URL missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const client = new Client(dbUrl);
  try {
    await client.connect();
    await client.queryArray(sql);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e?.message ?? e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    try { await client.end(); } catch { /* ignore */ }
  }
});
