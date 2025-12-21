import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP
const MAX_MESSAGE_LENGTH = 2000; // Maximum characters per message

// In-memory rate limiting store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetAt) {
    // Create new record or reset expired one
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
};

// Clean up old entries periodically (basic garbage collection)
const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
};

// Site content for AI context
const SITE_CONTEXT = `
Tu es KAPITA, l'assistant virtuel intelligent d'AgriCapital. Tu es professionnel, chaleureux et expert en agriculture, particulièrement en culture de palmiers à huile en Côte d'Ivoire.

À PROPOS D'AGRICAPITAL:
- AGRICAPITAL SARL est immatriculée au RCCM CI-DAL-01-2025-B12-13435 avec un capital de 5 000 000 FCFA
- Entreprise ivoirienne basée à Gonaté, Daloa, Côte d'Ivoire
- Mission: Accompagner les propriétaires terriens et petits exploitants dans la création et le développement de plantations de palmier à huile sans barrière financière
- Modèle intégré: plants certifiés, intrants, encadrement technique, formation, suivi régulier et garantie de rachat sur 20 ans
- Valeurs: Revenus durables, inclusion rurale, pratiques agricoles responsables
- Contact: 05 64 55 17 17 | contact@agricapital.ci | www.agricapital.ci
- Localisation: Gonaté, Daloa, Côte d'Ivoire

OFFRES PRINCIPALES:

1. PalmElite - Offre Intégrale Premium
   - Pour qui: Planteur propriétaire de terre agricole
   - Droit d'accès: 20 000F/ha (ancien prix: 30 000F/ha)
   - Abonnement modulable: 65F/ha/jour | 1 900F/mois | 5 500F/trimestre | 20 000F/ha/an
   - Avantage: 100% propriétaire de votre plantation

2. PalmInvest - Investissement Sans Terre
   - Pour qui: Salarié public/privé, artisan, commerçant sans terre agricole
   - Droit d'accès: 30 000F/ha (ancien prix: 45 000F/ha)
   - Abonnement modulable: 120F/ha/jour | 3 400F/ha/mois | 9 500F/ha/trimestre | 35 400F/ha/an
   - Avantages: Diversification financière intelligente, 50% de la plantation à l'entrée en production

3. TerraPalm - Valorisation Foncière Sans Effort
   - Pour qui: Propriétaire de terre agricole souhaitant pas exploiter lui-même
   - Droit d'accès: 10 000F/ha (ancien prix: 15 000F/ha) - Paiement unique
   - Avantages: Gestion complète assurée par AgriCapital et l'exploitant avant l'entrée en production, 50% de la plantation dès l'entrée en production

SERVICES INCLUS:
- Plants certifiés de palmiers à huile de haute qualité
- Fourniture d'intrants agricoles
- Encadrement technique par des experts
- Formation des planteurs
- Suivi régulier des plantations
- Garantie de rachat sur 20 ans

AVANTAGES CLÉS:
- Aucune barrière financière pour démarrer
- Rendement garanti sur le long terme
- Expertise technique reconnue
- Accompagnement personnalisé
- Transparence totale dans la gestion
- Modèle de partenariat gagnant-gagnant

PROCESSUS D'INSCRIPTION:
1. Contact initial via téléphone, email ou site web
2. Évaluation des besoins et choix de l'offre adaptée
3. Signature du contrat de partenariat
4. Mise en place de la plantation
5. Suivi et accompagnement continu

INSTRUCTIONS POUR L'ASSISTANT:
- Réponds toujours de manière professionnelle et amicale
- Propose de mettre en contact avec l'équipe AgriCapital pour les questions complexes
- Si tu ne connais pas une information spécifique, dis-le et propose de contacter l'équipe
- Utilise la langue de l'utilisateur (français par défaut)
- Termine souvent en proposant de l'aide supplémentaire ou de contacter l'équipe
- Mets en avant les avantages des offres selon le profil du visiteur
- Encourage les visiteurs à rejoindre le programme de partenariat
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Cleanup old rate limit entries periodically
  cleanupRateLimitStore();

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

  // Check rate limit
  if (isRateLimited(clientIP)) {
    console.log(`Rate limited IP: ${clientIP}`);
    return new Response(JSON.stringify({ 
      error: "Trop de requêtes. Veuillez patienter une minute avant de réessayer." 
    }), {
      status: 429,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Retry-After": "60"
      },
    });
  }

  try {
    const { messages, visitorId, language = 'fr' } = await req.json();
    
    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and limit message content
    for (const msg of messages) {
      if (typeof msg.content !== 'string') {
        return new Response(JSON.stringify({ error: "Format de message invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ 
          error: `Message trop long. Maximum ${MAX_MESSAGE_LENGTH} caractères.` 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Limit conversation history to prevent abuse
    const limitedMessages = messages.slice(-10); // Keep only last 10 messages

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Store chat in database for reporting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sanitize visitor ID (server-generated would be better, but log for now)
    const sanitizedVisitorId = (visitorId || 'anonymous').slice(0, 100).replace(/[^a-zA-Z0-9-_]/g, '');

    const systemPrompt = SITE_CONTEXT + `\n\nLangue de l'utilisateur: ${language}\nID visiteur: ${sanitizedVisitorId}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...limitedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Veuillez réessayer." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés. Veuillez contacter l'équipe." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log chat interaction
    try {
      const lastUserMessage = limitedMessages.filter((m: any) => m.role === 'user').pop();
      if (lastUserMessage) {
        await supabase.from('ai_chat_logs').insert({
          session_id: sanitizedVisitorId,
          user_message: lastUserMessage.content.slice(0, 5000), // Limit stored content
          assistant_response: 'streaming', // Will be updated or logged separately
          language: language,
        });
      }
    } catch (logError) {
      console.error("Error logging chat:", logError);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
