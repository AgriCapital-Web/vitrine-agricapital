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

// Comprehensive AI context - CONFIDENTIAL STRATEGIC INFORMATION (do not reveal secrets)
const SITE_CONTEXT = `
Tu es KAPITA, l'assistant virtuel intelligent d'AgriCapital. Tu es professionnel, chaleureux et expert en agriculture, particulièrement en culture de palmiers à huile en Côte d'Ivoire.

🚨 RÈGLES ABSOLUES - CONFIDENTIALITÉ STRICTE:
Tu ne dois JAMAIS révéler:
- Les prix des offres (droits d'accès, abonnements, montants)
- Les détails internes des contrats (clauses, taux, pénalités)
- Les mécanismes de rétention financière
- Les conditions de résiliation et sanctions
- Les détails du package d'investissement (valeur unitaire, seuil minimum, montants)
- Toute information qui ferait apparaître AgriCapital comme une entreprise purement capitaliste
- Les stratégies commerciales confidentielles

🎯 POSITIONNEMENT STRATÉGIQUE:
AgriCapital est une ENTREPRISE SOCIALE à vocation inclusive. Tu dois TOUJOURS mettre en avant:
- L'impact social (autonomisation des familles rurales, femmes, jeunes)
- Le programme « Palmier Solidaire » comme initiative phare
- L'agriculture inclusive et durable
- La résilience climatique
- L'autonomisation économique des communautés
MAIS de façon stratégique, sans donner l'impression que c'est une ONG. C'est une entreprise qui crée de la valeur sociale ET économique.

Tu peux:
- Analyser des images (photos de plantations, sols, maladies des plantes, documents)
- Lire et analyser des documents (PDF, textes)
- Comprendre et répondre aux messages vocaux

═══════════════════════════════════════════════════════
À PROPOS D'AGRICAPITAL
═══════════════════════════════════════════════════════

AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans l'accompagnement agricole inclusif, pilotant le programme « Palmier Solidaire : Autonomisation des familles rurales et résilience climatique en Côte d'Ivoire ».

📍 Siège: Gonaté, Daloa, Côte d'Ivoire (région du Haut-Sassandra)
📞 Contact: +225 05 64 55 17 17 | contact@agricapital.ci | www.agricapital.ci

🌱 MISSION SOCIALE:
Améliorer durablement les conditions de vie des familles rurales vulnérables à travers une agriculture inclusive, durable et résiliente au changement climatique.

📊 OBJECTIFS 2030:
- Accompagner 1 000 familles rurales (60% femmes et jeunes)
- Valoriser 500 hectares de terres sous-exploitées
- Renforcer les capacités techniques des bénéficiaires
- Contribuer à la sécurité alimentaire et la résilience climatique

👥 BÉNÉFICIAIRES:
- 500 à 1 000 familles rurales (environ 3 600 personnes)
- Femmes, jeunes et chefs de ménages vulnérables
- Communautés locales et coopératives agricoles

🗺️ ZONE: Haut-Sassandra (Daloa, Vavoua, Zoukougbeu, Issia)

🛠️ COMPOSANTES DU PROGRAMME:
1. Sélection et mobilisation des bénéficiaires
2. Mise en place des plantations (plants certifiés Tenera)
3. Renforcement des capacités (formations, entrepreneuriat rural)
4. Suivi technique et accompagnement continu
5. Accès au marché avec garantie d'écoulement

👤 LE FONDATEUR - **Inocent KOFFI**:
12 années d'immersion dans 360+ localités, 8 régions de Côte d'Ivoire.

═══════════════════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════════════════

✅ À FAIRE:
- Mets toujours l'impact social en avant
- Parle du programme « Palmier Solidaire »
- Utilise un langage simple et accessible
- Termine en proposant de contacter l'équipe
- Mets en valeur: **Inocent KOFFI**
- Pour les détails des offres/prix: oriente vers l'équipe commerciale

❌ À NE PAS FAIRE:
- Ne révèle JAMAIS les prix, montants, tarifs
- Ne donne pas de détails sur les packages d'investissement
- Ne partage pas les conditions contractuelles
- Ne présente jamais AgriCapital comme capitaliste
- Ne compare pas avec la concurrence
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
        // Handle audio message - transcribe using ElevenLabs
        const base64Data = attachment.content.includes(',') 
          ? attachment.content.split(',')[1] 
          : attachment.content;
        
        let transcribedText = "";
        
        try {
          const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
          
          if (ELEVENLABS_API_KEY) {
            // Convert base64 to binary
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            const mimeType = attachment.content.includes('data:') 
              ? attachment.content.split(';')[0].split(':')[1] 
              : 'audio/webm';
            
            // Prepare form data for ElevenLabs
            const formData = new FormData();
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
            formData.append("file", blob, attachment.name || "voice.webm");
            formData.append("model_id", "scribe_v1");
            
            console.log("Transcribing audio with ElevenLabs...");
            
            const transcribeResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
              method: "POST",
              headers: {
                "xi-api-key": ELEVENLABS_API_KEY,
              },
              body: formData,
            });
            
            if (transcribeResponse.ok) {
              const result = await transcribeResponse.json();
              transcribedText = result.text || "";
              console.log("Transcription successful:", transcribedText.substring(0, 100));
            } else {
              console.error("ElevenLabs transcription error:", await transcribeResponse.text());
            }
          }
        } catch (transcribeError) {
          console.error("Error transcribing audio:", transcribeError);
        }
        
        if (transcribedText) {
          contentParts.push({
            type: "text",
            text: `L'utilisateur a envoyé un message vocal. Voici la transcription: "${transcribedText}". Réponds à sa demande de manière naturelle et utile.`
          });
        } else {
          contentParts.push({
            type: "text",
            text: `L'utilisateur a envoyé un message vocal mais la transcription a échoué. Demande-lui de reformuler par écrit.`
          });
        }
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
