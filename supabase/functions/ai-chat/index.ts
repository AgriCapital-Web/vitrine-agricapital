import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_MESSAGE_LENGTH = 5000;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
};

const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
};

// Site context for AI
const SITE_CONTEXT = `
Tu es KAPITA, l'assistant virtuel intelligent d'AgriCapital. Tu es professionnel, chaleureux et expert en agriculture, particulièrement en culture de palmiers à huile en Côte d'Ivoire.

Tu peux:
- Analyser des images (photos de plantations, sols, maladies des plantes, documents)
- Lire et analyser des documents (PDF, textes)
- Comprendre et répondre aux messages vocaux
- Générer des réponses vocales si demandé

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

INSTRUCTIONS:
- Réponds toujours de manière professionnelle et amicale
- Si on t'envoie une image, analyse-la en détail et fournis des conseils pertinents
- Si on t'envoie un document, lis-le et réponds aux questions le concernant
- Si on t'envoie un message vocal, traite-le comme un texte normal
- Utilise la langue de l'utilisateur (français par défaut)
- Termine souvent en proposant de l'aide supplémentaire ou de contacter l'équipe
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  cleanupRateLimitStore();

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

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
    const { messages, visitorId, language = 'fr', attachment } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const limitedMessages = messages.slice(-10);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sanitizedVisitorId = (visitorId || 'anonymous').slice(0, 100).replace(/[^a-zA-Z0-9-_]/g, '');

    // Build messages with multimodal content if attachment exists
    const apiMessages: any[] = [
      { role: "system", content: `${SITE_CONTEXT}\n\nLangue de l'utilisateur: ${language}\nID visiteur: ${sanitizedVisitorId}` }
    ];

    // Add previous messages
    for (let i = 0; i < limitedMessages.length - 1; i++) {
      apiMessages.push({
        role: limitedMessages[i].role,
        content: limitedMessages[i].content
      });
    }

    // Handle the last message with potential attachment
    const lastMessage = limitedMessages[limitedMessages.length - 1];
    
    if (attachment && attachment.content) {
      // Build multimodal content for Gemini Vision
      const contentParts: any[] = [];
      
      if (attachment.type === 'image') {
        // Handle image - extract base64 data
        const base64Data = attachment.content.includes(',') 
          ? attachment.content.split(',')[1] 
          : attachment.content;
        
        const mimeType = attachment.content.includes('data:') 
          ? attachment.content.split(';')[0].split(':')[1] 
          : 'image/jpeg';

        contentParts.push({
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Data}`
          }
        });
        
        contentParts.push({
          type: "text",
          text: `L'utilisateur a envoyé cette image (${attachment.name || 'image'}). Analyse-la en détail et fournis des conseils pertinents en agriculture si applicable, sinon réponds de manière appropriée. ${lastMessage.content || 'Que peux-tu me dire sur cette image ?'}`
        });
      } else if (attachment.type === 'document') {
        // Handle document - extract text or base64
        const base64Data = attachment.content.includes(',') 
          ? attachment.content.split(',')[1] 
          : attachment.content;
        
        contentParts.push({
          type: "text",
          text: `L'utilisateur a envoyé un document (${attachment.name || 'document'}). Contenu encodé en base64: ${base64Data.substring(0, 1000)}... Analyse ce document et réponds aux questions le concernant. ${lastMessage.content || 'Que contient ce document ?'}`
        });
      } else if (attachment.type === 'audio') {
        // Handle audio message
        contentParts.push({
          type: "text",
          text: `L'utilisateur a envoyé un message vocal. Malheureusement, je ne peux pas encore traiter directement l'audio, mais je suis prêt à aider avec toute question textuelle. Pouvez-vous reformuler votre demande par écrit ?`
        });
      }

      apiMessages.push({
        role: lastMessage.role,
        content: contentParts
      });
    } else {
      apiMessages.push({
        role: lastMessage.role,
        content: lastMessage.content
      });
    }

    // Use Gemini Pro for vision/multimodal, Flash for text-only
    const model = attachment && attachment.type === 'image' 
      ? "google/gemini-2.5-pro" 
      : "google/gemini-2.5-flash";

    console.log(`Using model: ${model}, has attachment: ${!!attachment}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
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
          user_message: lastUserMessage.content.slice(0, 5000),
          assistant_response: attachment ? `[${attachment.type}] streaming` : 'streaming',
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
