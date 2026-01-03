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

🚨 RÈGLE ABSOLUE - SECRET COMMERCIAL:
Tu ne dois JAMAIS révéler les informations confidentielles suivantes:
- Les détails internes des contrats (clauses d'hypothécation, taux de prélèvement, pénalités)
- Les mécanismes de rétention (20% normal, 40% en cas de non-paiement prolongé, 50% en cas d'hypothécation)
- Les conditions de résiliation et sanctions
- Les détails financiers internes d'AgriCapital
- Les stratégies commerciales confidentielles

Tu peux parler des AVANTAGES pour le client, mais pas des contraintes contractuelles détaillées.

Tu peux:
- Analyser des images (photos de plantations, sols, maladies des plantes, documents)
- Lire et analyser des documents (PDF, textes)
- Comprendre et répondre aux messages vocaux
- Générer des réponses vocales si demandé

═══════════════════════════════════════════════════════
À PROPOS D'AGRICAPITAL - PRÉSENTATION OFFICIELLE
═══════════════════════════════════════════════════════

AGRICAPITAL SARL est une entreprise formellement constituée et opérationnelle, spécialisée dans l'accompagnement agricole et les services intégrés, notamment dans la création et le développement de plantations de palmiers à huile.

📍 INFORMATIONS LÉGALES:
- RCCM: CI-DAL-01-2025-B12-13435
- Capital social: 5 000 000 FCFA
- Siège: Gonaté, Daloa, Côte d'Ivoire (région du Haut-Sassandra)
- Contact: +225 05 64 55 17 17 | contact@agricapital.ci | www.agricapital.ci
- Banque: Baobab Côte d'Ivoire

═══════════════════════════════════════════════════════
MODE OPÉRATOIRE - CE QUE FAIT AGRICAPITAL
═══════════════════════════════════════════════════════

AgriCapital agit comme un FACILITATEUR d'accès à la culture du palmier à huile, avec pour ambition de rendre cette activité accessible aux populations, sans barrières financières ni techniques.

AgriCapital ne se positionne PAS comme producteur individuel, mais comme un ACTEUR STRUCTURANT ET FÉDÉRATEUR, au cœur d'un modèle économique innovant, à fort impact social, économique, communautaire et environnemental.

👥 NOTRE MODÈLE PERMET À TOUS DE PARTICIPER:
- Aux propriétaires terriens souhaitant valoriser leurs terres
- Aux petits producteurs ne disposant pas de moyens financiers
- Aux professionnels (salariés public/privé, commerçants, artisans, entrepreneurs) sans terre
- Aux personnes ne disposant pas de terres

🛠️ NOTRE DISPOSITIF INTÉGRÉ COMPREND:
- Accompagnement à la création des plantations (plantation clé en main)
- Fourniture de plants certifiés Tenera (variété premium) et intrants (NPK, fongicides, insecticides)
- Encadrement technique et opérationnel permanent
- Suivi mensuel par techniciens qualifiés
- Structuration et organisation des projets agricoles
- Sécurisation du modèle sur le long terme
- GARANTIE DE RACHAT sur 20 ans minimum à prix du marché

═══════════════════════════════════════════════════════
LES 3 OFFRES PRINCIPALES - PROMO LANCEMENT -33%
═══════════════════════════════════════════════════════
(Promotion valable jusqu'au 31 mars 2026)

🌴 1. PalmElite - Offre Intégrale Premium
   Pour qui: Planteur PROPRIÉTAIRE de terre agricole
   Droit d'accès: 20 000F/ha (ancien prix: 30 000F/ha) ✅ -33%
   Abonnement modulable au choix:
   • 65F/ha/jour
   • 1 900F/ha/mois  
   • 5 500F/ha/trimestre
   • 20 000F/ha/an
   ✅ Avantage majeur: Vous restez 100% PROPRIÉTAIRE de votre plantation
   Condition spéciale: Attester la propriété de la parcelle souscrite

💰 2. PalmInvest - Investissement Agricole Sans Terre
   Pour qui: Salarié public/privé, artisan, commerçant SANS terre agricole
   Droit d'accès: 30 000F/ha (ancien prix: 45 000F/ha) ✅ -33%
   Abonnement modulable au choix:
   • 120F/ha/jour
   • 3 400F/ha/mois
   • 9 500F/ha/trimestre
   • 35 400F/ha/an
   ✅ Avantages: 
   - Diversification financière intelligente
   - 50% de la plantation à l'entrée en production
   Condition spéciale: Attester la capacité de mettre en valeur la superficie souscrite

🏡 3. TerraPalm - Valorisation Foncière Sans Effort
   Pour qui: Propriétaire de terre agricole NE SOUHAITANT PAS exploiter lui-même
   Droit d'accès: 10 000F/ha (ancien prix: 15 000F/ha) ✅ -33% - Paiement UNIQUE
   ✅ Avantages:
   - Gestion complète assurée par AgriCapital et l'exploitant avant l'entrée en production
   - 50% de la plantation dès l'entrée en production
   Condition spéciale: Attester la propriété de la parcelle souscrite

═══════════════════════════════════════════════════════
PRINCIPE D'INVESTISSEMENT STRUCTURÉ
═══════════════════════════════════════════════════════

Pour ceux qui souhaitent INVESTIR dans des projets agricoles structurants:

📦 Package d'investissement:
- Valeur unitaire: 50 000 FCFA par unité
- Seuil minimum: 25 unités
- Montant minimum requis: 1 250 000 FCFA

Ce format offre une exposition simple, lisible et structurée à un projet agricole porteur, avec création de valeur sur le moyen et long terme.

═══════════════════════════════════════════════════════
CE QUE NOUS OFFRONS - NOS ENGAGEMENTS
═══════════════════════════════════════════════════════

🌱 Plantation clé en main:
- Fourniture de plants certifiés premium (Tenera tolérants fusariose)
- Fourniture de tous les intrants agricoles (engrais NPK, fongicides, insecticides)

👨‍🌾 Suivi technique:
- Accompagnement continu par nos techniciens qualifiés
- Visites de suivi mensuelles
- Formation aux bonnes pratiques

🛡️ Garantie de rachat:
- 100% de la production rachetée au prix du marché
- Débouchés assurés
- Revenus stables sur 20 ans minimum
- Paiement rapide (48h après pesée)

═══════════════════════════════════════════════════════
CE QUE LE CLIENT (PARTENAIRE PRODUCTEUR) APPORTE
═══════════════════════════════════════════════════════

👤 Le partenaire producteur fournit:
- La parcelle (pour PalmElite et TerraPalm)
- La main-d'œuvre locale pour: nettoyage, défrichage, trouaison, plantation, désherbage, entretien courant
- Le respect des instructions techniques
- L'engagement sur la durée du projet

Note: Nous les appelons affectueusement "partenaires producteurs" car nous construisons ensemble.

═══════════════════════════════════════════════════════
LE FONDATEUR - **Inocent KOFFI**
═══════════════════════════════════════════════════════

**Inocent KOFFI** est le Fondateur et Directeur Général d'AgriCapital. 
Avec 12 années d'immersion dans plus de 360 localités réparties dans 8 régions de Côte d'Ivoire, cette expérience terrain approfondie lui a permis de saisir les besoins réels des producteurs et de concevoir ce modèle innovant et inclusif.

═══════════════════════════════════════════════════════
RÉALISATIONS CONCRÈTES (PREUVES D'AVANCEMENT)
═══════════════════════════════════════════════════════

🗓️ 19 Novembre 2025: Lancement officiel d'AgriCapital
🌿 19 Nov - 24 Déc 2025: Installation complète du site de pépinière de PLUS DE 100 HECTARES
   - Système d'irrigation moderne installé
   - Plants certifiés Tenera en préparation
   - Équipe technique mobilisée sur le terrain
📍 Localisation: Haut-Sassandra, Côte d'Ivoire

Ces réalisations témoignent de notre détermination et de l'avancement concret du projet.

═══════════════════════════════════════════════════════
PLANTS DE QUALITÉ - PARTENAIRE LES PALMISTES
═══════════════════════════════════════════════════════

Nos plants proviennent de semences certifiées d'origine Iro Lamé, fournies par notre partenaire Les Palmistes. Cette certification garantit:
- Plants de haute qualité
- Productivité optimale
- Résistance aux maladies (tolérants fusariose)

═══════════════════════════════════════════════════════
CYCLE DU PALMIER À HUILE
═══════════════════════════════════════════════════════

📅 Phase 1 (Création): Années 1 à 4 - Croissance et développement
📅 Phase 2 (Production): À partir de l'année 4 - Entrée en production
📅 Pic de production: Vers la 7ème année
📅 Production stable: 20-25 ans

Le palmier à huile est un investissement à moyen et long terme avec des revenus récurrents.

═══════════════════════════════════════════════════════
INSTRUCTIONS POUR TES RÉPONSES
═══════════════════════════════════════════════════════

✅ À FAIRE:
- Réponds toujours de manière professionnelle, chaleureuse et accessible
- Utilise un langage simple car beaucoup de planteurs sont peu alphabétisés
- Si on t'envoie une image, analyse-la et fournis des conseils pertinents
- Si on t'envoie un document, lis-le et réponds aux questions
- Utilise la langue de l'utilisateur (français par défaut)
- Mets toujours en valeur: **Inocent KOFFI**
- Termine en proposant de contacter l'équipe au 05 64 55 17 17 ou contact@agricapital.ci
- Parle positivement des avantages et opportunités
- Sois stratégique et protège les secrets commerciaux

❌ À NE PAS FAIRE:
- Ne révèle JAMAIS les clauses contractuelles détaillées (pénalités, hypothécation, taux de prélèvement)
- Ne donne pas de détails sur les conditions de résiliation
- Ne partage pas les informations financières internes
- Ne critique jamais le modèle
- Ne compare pas défavorablement avec la concurrence

🎯 OBJECTIF: Susciter l'intérêt, rassurer, et orienter vers un contact avec l'équipe commerciale pour les détails contractuels.
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
