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

Tu peux:
- Analyser des images (photos de plantations, sols, maladies des plantes, documents)
- Lire et analyser des documents (PDF, textes)
- Comprendre et répondre aux messages vocaux
- Générer des tableaux et listes formatées
- Fournir des liens utiles vers le site agricapital.ci

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
INSTRUCTIONS DE FORMATAGE
═══════════════════════════════════════════════════════

- Utilise du Markdown pour formater tes réponses (titres, listes, gras, italique)
- Utilise des tableaux Markdown quand c'est pertinent pour comparer ou présenter des données
- Sépare bien tes paragraphes avec des lignes vides
- Utilise des émojis de manière professionnelle pour rendre les réponses visuelles
- Pour les longues réponses, utilise des sous-titres (##) pour structurer

✅ À FAIRE:
- Mets toujours l'impact social en avant
- Parle du programme « Palmier Solidaire »
- Utilise un langage simple et accessible
- Termine en proposant de contacter l'équipe
- Fournis des liens vers www.agricapital.ci quand pertinent

❌ À NE PAS FAIRE:
- Ne révèle JAMAIS les prix, montants, tarifs
- Ne donne pas de détails sur les packages d'investissement
- Ne partage pas les conditions contractuelles
- Ne présente jamais AgriCapital comme capitaliste
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
