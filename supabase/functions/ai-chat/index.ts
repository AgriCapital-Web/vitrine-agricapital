import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_CONTEXT = `
Tu es KAPITA, l'assistante virtuelle d'AgriCapital. Tu réponds comme une conseillère professionnelle, claire, chaleureuse et factuelle.

RÈGLE DE SOURCE VÉRIFIÉE:
- Réponds uniquement avec les informations présentes dans ce contexte.
- Si une information n'est pas présente, oriente vers l'équipe AgriCapital.
- Ne jamais inventer de prix, de rendement ou de donnée non vérifiée.
- N'utilise pas Markdown lourd. Utilise du texte simple.

🚨 RÈGLES ABSOLUES - CONFIDENTIALITÉ STRICTE:
- Ne jamais révéler les prix, montants ou détails internes des contrats.

POSITIONNEMENT STRATÉGIQUE:
- AgriCapital est un OPÉRATEUR ET PROMOTEUR AGRICOLE.
- Mets en avant : patrimoine agricole durable, 4 formules (PalmInvest, PalmInvest+, TerraPalm, TerraPalm+), garantie d'écoulement, Espace Client Digital.

AGRICAPITAL SARL est une entreprise ivoirienne.
Siège: Gonaté, Daloa, Côte d'Ivoire.
Contact: +225 05 64 55 17 17 | contact@agricapital.ci
`;

const MODELS = [
  "google/gemini-1.5-flash",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-5-sonnet-20240620",
  "google/gemini-1.5-pro"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let lastError = "";
  let usedModel = "";
  let retries = 0;
  let success = false;

  try {
    const { messages, visitorId, language = 'fr', attachment } = await req.json();
    const sanitizedVisitorId = (visitorId || 'anonymous').slice(0, 100);

    const apiMessages = [
      { role: "system", content: `${SITE_CONTEXT}\nLangue: ${language}` },
      ...messages.slice(-10)
    ];

    let response: Response | null = null;

    for (const model of MODELS) {
      usedModel = model;
      console.log(`KAPITA - Trying model: ${model}`);
      
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model, messages: apiMessages, stream: true }),
        });

        if (r.ok) {
          response = r;
          success = true;
          break;
        }
        
        lastError = `HTTP ${r.status}: ${await r.text().then(t => t.slice(0, 100))}`;
        retries++;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Network error";
        retries++;
      }
    }

    if (!response || !response.body) {
      throw new Error(`All models failed. Last error: ${lastError}`);
    }

    // Logging to audit_logs (as operational log)
    const logMetadata = {
      model: usedModel,
      retries,
      duration_ms: Date.now() - startTime,
      status: success ? "success" : "failure",
      error: success ? null : lastError,
      visitorId: sanitizedVisitorId,
      language
    };

    // We don't await this to avoid delaying the response, but Supabase handles it
    supabase.from('audit_logs').insert({
      action: 'ai_chat_completion',
      entity_type: 'ai_assistant',
      metadata: logMetadata
    }).then(({error}) => {
      if (error) console.error("Failed to log to audit_logs:", error);
    });

    // Also log to existing ai_chat_logs for history
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
    if (lastUserMsg) {
      supabase.from('ai_chat_logs').insert({
        session_id: sanitizedVisitorId,
        user_message: (typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '[multimodal]').slice(0, 2000),
        assistant_response: 'streaming',
        language
      }).then();
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Chat error:", error);
    
    // Log failure
    supabase.from('audit_logs').insert({
      action: 'ai_chat_failure',
      entity_type: 'ai_assistant',
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: duration,
        status: "failure",
        retries
      }
    }).then();

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur interne" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
