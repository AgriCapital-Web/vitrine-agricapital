// AgriCapital Cloud — login with email + access code
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(v: string): Promise<string> {
  const data = new TextEncoder().encode(v);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, code, action } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "resend") {
      // Do not leak whether the email exists
      return new Response(JSON.stringify({ ok: true, message: "Si votre e-mail existe, un code vous sera renvoyé." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!code) return new Response(JSON.stringify({ error: "Code requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const hash = await sha256(code);
    const { data: sig } = await supabase
      .from("dataroom_signatories")
      .select("id, full_name, email, profile_type")
      .eq("email", email)
      .eq("access_code_hash", hash)
      .maybeSingle();

    if (!sig) {
      return new Response(JSON.stringify({ error: "E-mail ou code invalide" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log access
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent") ?? null;
    await supabase.from("dataroom_access_logs").insert({
      signatory_id: sig.id, action: "login", ip_address: ip, user_agent: ua,
    });

    return new Response(JSON.stringify({ ok: true, signatory: sig }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
