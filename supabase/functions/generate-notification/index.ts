import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userData } = await req.json();
    
    // Validate request
    if (!type || !userData) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare system prompt for notification generation
    const systemPrompt = `Tu es un assistant IA spécialisé dans la communication client pour AgriCapital.
Ton rôle est de générer des messages de notification automatiques personnalisés, professionnels et sécurisés.

RÈGLES DE GÉNÉRATION :
1. Commence TOUJOURS par : "Message généré automatiquement, ne pas répondre."
2. Ton professionnel, concis et engageant (2-3 phrases maximum).
3. Inclus le nom de l'utilisateur pour la personnalisation.
4. Génère un lien d'action fictif pertinent (ex: [LienSecurise], [LienConfirmation]).
5. Le message doit être clair et inciter à l'action appropriée.

TYPES DE NOTIFICATIONS ET CONTEXTE :
- Inscription : Bienvenue + confirmation.
- Connexion : Alerte de sécurité.
- Réinitialisation mot de passe : Lien sécurisé.
- Opportunités : Annonce pour abonnés.
- Administratif : Information importante.
- Sécurité : Activité suspecte.

FORMAT DE RÉPONSE ATTENDU (JSON STRICT) :
{
  "utilisateur": {
    "nom": "Nom complet de l'utilisateur",
    "telephone": "Numéro de téléphone"
  },
  "type_notification": "Type de l'événement",
  "message": "Le message complet généré"
}`;

    // Prepare user prompt based on event type
    const userPrompt = `Génère une notification pour l'événement "${type}" concernant l'utilisateur suivant :
Nom : ${userData.firstName} ${userData.lastName}
Téléphone : ${userData.phone || "Non renseigné"}
Statut : ${userData.status || "Standard"}

Le message doit être adapté à cet événement spécifique.`;

    // Call AI Gateway
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
          { role: "user", content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error("Failed to generate notification");
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    // Parse JSON response from AI
    let parsedContent;
    try {
      // Try to find JSON block in content
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        parsedContent = {
          utilisateur: {
            nom: `${userData.firstName} ${userData.lastName}`,
            telephone: userData.phone
          },
          type_notification: type,
          message: aiContent // Fallback to raw content
        };
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      parsedContent = {
        utilisateur: {
          nom: `${userData.firstName} ${userData.lastName}`,
          telephone: userData.phone
        },
        type_notification: type,
        message: aiContent
      };
    }

    // Log notification to database (optional, for history)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("admin_notifications").insert({
      title: `Notification: ${type}`,
      message: parsedContent.message,
      type: "system_notification",
      data: parsedContent
    });

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});