// Endpoint désactivé de façon permanente.
// L'exécution de SQL arbitraire via HTTP a été retirée pour raisons de sécurité.
// Les migrations doivent passer par l'outillage de migration (CLI / tableau de bord).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-migrate-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({ error: "This endpoint has been permanently disabled." }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
