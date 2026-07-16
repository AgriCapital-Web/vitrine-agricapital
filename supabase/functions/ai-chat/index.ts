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
- Si une information n'est pas présente, oriente vers l'équipe AgriCapital par téléphone, WhatsApp ou email.
- Ne jamais inventer de prix, de rendement, de condition contractuelle, de promesse financière ou de donnée non vérifiée.
- Ne cite pas de personne nommément, sauf demande explicite. Parle au nom de l'équipe AgriCapital.
- N'utilise pas Markdown lourd : pas de **, pas de #, pas de tableaux Markdown. Utilise du texte simple.

🚨 RÈGLES ABSOLUES - CONFIDENTIALITÉ STRICTE:
Tu ne dois JAMAIS révéler:
- Les prix des offres, montants ou tarifs
- Les détails internes des contrats
- Les mécanismes financiers internes

POSITIONNEMENT STRATÉGIQUE:
AgriCapital est un OPÉRATEUR ET PROMOTEUR AGRICOLE professionnel.
Mets en avant:
- La création de patrimoine agricole durable
- L'accompagnement professionnel et sécurisé
- Les 4 formules : PalmInvest, PalmInvest+, TerraPalm, TerraPalm+ (sans prix)
- La garantie d'écoulement sur 25 ans
- L'Espace Client Digital AgriCapital (client.agricapital.ci)

AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans le palmier à huile.
📍 Siège: Gonaté, Daloa, Côte d'Ivoire.
📞 Contact: +225 05 64 55 17 17 | contact@agricapital.ci | www.agricapital.ci
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

  try {
    const { messages, visitorId, language = 'fr', attachment } = await req.json();
    const sanitizedVisitorId = (visitorId || 'anonymous').slice(0, 100);

    const apiMessages: any[] = [
      { role: "system", content: `${SITE_CONTEXT}\n\nLangue: ${language}` }
    ];

    // Build messages with attachment support
    const limitedMessages = messages.slice(-10);
    for (let i = 0; i < limitedMessages.length; i++) {
      const msg = limitedMessages[i];
      if (i === limitedMessages.length - 1 && attachment && attachment.content) {
        // Handle multimodal
        const contentParts: any[] = [];
        if (attachment.type === 'image') {
          const base64Data = attachment.content.includes(',') ? attachment.content.split(',')[1] : attachment.content;
          const mimeType = attachment.content.includes('data:') ? attachment.content.split(';')[0].split(':')[1] : 'image/jpeg';
          contentParts.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } });
          contentParts.push({ type: "text", text: msg.content || "Analyse cette image." });
        } else {
          contentParts.push({ type: "text", text: `[Pièce jointe: ${attachment.name}]\n${msg.content}` });
        }
        apiMessages.push({ role: msg.role, content: contentParts });
      } else {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    let response: Response | null = null;
    let usedModel = "";
    let lastError = "";
    let retries = 0;

    for (const model of MODELS) {
      usedModel = model;
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
          break;
        }
        lastError = `HTTP ${r.status}`;
        retries++;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Network error";
        retries++;
      }
    }

    if (!response || !response.body) {
      throw new Error(`All models failed. Last error: ${lastError}`);
    }

    // Log the event
    const duration = Date.now() - startTime;
    supabase.from('audit_logs').insert({
      action: 'ai_chat_request',
      entity_type: 'ai_assistant',
      metadata: {
        model: usedModel,
        language,
        visitorId: sanitizedVisitorId,
        retries,
        duration_ms: duration,
        status: 'success'
      }
    }).then();

    // Log chat history
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
    
    supabase.from('audit_logs').insert({
      action: 'ai_chat_error',
      entity_type: 'ai_assistant',
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
        duration_ms: duration,
        status: 'error'
      }
    }).then();

    return new Response(JSON.stringify({ error: "Service indisponible" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
