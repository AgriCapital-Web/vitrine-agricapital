import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_MESSAGE_LENGTH = 8000;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return true;
  record.count++;
  return false;
};

const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) rateLimitStore.delete(ip);
  }
};

const SITE_CONTEXT = `
Tu es KAPITA, l'assistant virtuel intelligent d'AgriCapital. Tu es professionnel, chaleureux et expert en agriculture, particulièrement en culture de palmiers à huile en Côte d'Ivoire.

🚨 RÈGLES ABSOLUES - CONFIDENTIALITÉ STRICTE:
Tu ne dois JAMAIS révéler:
- Les prix des offres, montants ou tarifs
- Les détails internes des contrats
- Les mécanismes financiers internes
- Les conditions de résiliation
- Les stratégies commerciales confidentielles

🎯 POSITIONNEMENT STRATÉGIQUE:
AgriCapital est un OPÉRATEUR ET PROMOTEUR AGRICOLE professionnel. Tu dois TOUJOURS mettre en avant:
- La création de patrimoine agricole durable
- L'accompagnement professionnel et sécurisé
- Les 4 formules : PalmInvest, PalmInvest+, TerraPalm, TerraPalm+ (sans prix)
- La garantie d'écoulement sur 25 ans
- La sécurisation foncière et contractuelle

Tu peux:
- Analyser des images (photos de plantations, sols, maladies des plantes)
- Lire et analyser des documents
- Comprendre et répondre aux messages vocaux
- Fournir des liens utiles vers le site agricapital.ci

═══════════════════════════════════════════════════════
À PROPOS D'AGRICAPITAL
═══════════════════════════════════════════════════════

AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans la création et la gestion de plantations de palmiers à huile clé en main.

📍 Siège: Gonaté, Daloa, Côte d'Ivoire (région du Haut-Sassandra)
📞 Contact: +225 05 64 55 17 17 | contact@agricapital.ci | www.agricapital.ci

🌱 MISSION:
Permettre à chacun de devenir planteur de palmier à huile dans un cadre sécurisé et professionnel.

📊 CAPACITÉ OPÉRATIONNELLE:
- Pépinière de 120 hectares en croissance active
- 50 hectares disponibles pour implantation immédiate
- 500+ hectares de terres identifiées
- Garantie d'écoulement sur 25 ans

👥 DEUX PROFILS CLIENTS:
1. Clients AVEC terre : formules TerraPalm et TerraPalm+
2. Clients SANS terre : formules PalmInvest et PalmInvest+

🗺️ ZONE: Haut-Sassandra (Daloa)

👤 LE FONDATEUR - **Inocent KOFFI**:
Plus de 12 années d'expertise dans les communautés rurales ivoiriennes.

═══════════════════════════════════════════════════════
INSTRUCTIONS DE FORMATAGE
═══════════════════════════════════════════════════════

- Utilise du Markdown pour formater tes réponses
- Utilise des émojis de manière professionnelle
- Pour les longues réponses, utilise des sous-titres

✅ À FAIRE:
- Mets toujours en avant le patrimoine agricole durable
- Parle des 4 formules (sans prix ni détails financiers)
- Utilise un langage professionnel et commercial
- Termine en proposant de contacter l'équipe ou rejoindre la liste d'attente

❌ À NE PAS FAIRE:
- Ne révèle JAMAIS les prix, montants, tarifs
- Ne parle PAS de "Palmier Solidaire" ni de programme social/ONG
- Ne mentionne pas "360 localités" ni "200 producteurs"
- Ne présente pas AgriCapital comme une ONG ou association
- Ne parle pas de subventions ou d'impact social
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  cleanupRateLimitStore();

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || "unknown";

  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({ error: "Trop de requêtes. Veuillez patienter." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
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
      if (typeof msg.content !== 'string' && !Array.isArray(msg.content)) {
        return new Response(JSON.stringify({ error: "Format de message invalide" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const textContent = typeof msg.content === 'string' ? msg.content : '';
      if (textContent.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ error: `Message trop long. Maximum ${MAX_MESSAGE_LENGTH} caractères.` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const limitedMessages = messages.slice(-12);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const sanitizedVisitorId = (visitorId || 'anonymous').slice(0, 100).replace(/[^a-zA-Z0-9-_]/g, '');

    const apiMessages: any[] = [
      { role: "system", content: `${SITE_CONTEXT}\n\nLangue de l'utilisateur: ${language}\nID visiteur: ${sanitizedVisitorId}` }
    ];

    for (let i = 0; i < limitedMessages.length - 1; i++) {
      apiMessages.push({ role: limitedMessages[i].role, content: limitedMessages[i].content });
    }

    const lastMessage = limitedMessages[limitedMessages.length - 1];
    
    if (attachment && attachment.content) {
      const contentParts: any[] = [];
      
      if (attachment.type === 'image') {
        const base64Data = attachment.content.includes(',') ? attachment.content.split(',')[1] : attachment.content;
        const mimeType = attachment.content.includes('data:') ? attachment.content.split(';')[0].split(':')[1] : 'image/jpeg';
        contentParts.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } });
        contentParts.push({ type: "text", text: `L'utilisateur a envoyé cette image (${attachment.name || 'image'}). Analyse-la en détail. ${lastMessage.content || 'Que peux-tu me dire sur cette image ?'}` });
      } else if (attachment.type === 'document') {
        const base64Data = attachment.content.includes(',') ? attachment.content.split(',')[1] : attachment.content;
        contentParts.push({ type: "text", text: `L'utilisateur a envoyé un document (${attachment.name || 'document'}). Contenu: ${base64Data.substring(0, 2000)}... ${lastMessage.content || 'Que contient ce document ?'}` });
      } else if (attachment.type === 'audio') {
        const base64Data = attachment.content.includes(',') ? attachment.content.split(',')[1] : attachment.content;
        let transcribedText = "";
        
        try {
          const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
          if (ELEVENLABS_API_KEY) {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const mimeType = attachment.content.includes('data:') ? attachment.content.split(';')[0].split(':')[1] : 'audio/webm';
            const formData = new FormData();
            formData.append("file", new Blob([bytes.buffer as ArrayBuffer], { type: mimeType }), attachment.name || "voice.webm");
            formData.append("model_id", "scribe_v1");
            
            const transcribeResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
              method: "POST",
              headers: { "xi-api-key": ELEVENLABS_API_KEY },
              body: formData,
            });
            
            if (transcribeResponse.ok) {
              const result = await transcribeResponse.json();
              transcribedText = result.text || "";
            }
          }
        } catch (e) {
          console.error("Transcription error:", e);
        }
        
        contentParts.push({
          type: "text",
          text: transcribedText 
            ? `L'utilisateur a envoyé un message vocal. Transcription: "${transcribedText}". Réponds naturellement.`
            : `L'utilisateur a envoyé un message vocal mais la transcription a échoué. Demande-lui de reformuler.`
        });
      }

      apiMessages.push({ role: lastMessage.role, content: contentParts });
    } else {
      apiMessages.push({ role: lastMessage.role, content: lastMessage.content });
    }

    // Use latest models
    const model = attachment && attachment.type === 'image' 
      ? "google/gemini-2.5-pro" 
      : "google/gemini-3-flash-preview";

    console.log(`Model: ${model}, attachment: ${!!attachment}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages: apiMessages, stream: true }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const lastUserMessage = limitedMessages.filter((m: any) => m.role === 'user').pop();
      if (lastUserMessage) {
        const msgText = typeof lastUserMessage.content === 'string' ? lastUserMessage.content : '[multimodal]';
        await supabase.from('ai_chat_logs').insert({
          session_id: sanitizedVisitorId,
          user_message: msgText.slice(0, 5000),
          assistant_response: 'streaming',
          language,
        });
      }
    } catch (logError) {
      console.error("Log error:", logError);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
