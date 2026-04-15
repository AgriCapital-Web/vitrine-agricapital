import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawInput, mediaOption } = await req.json();

    if (!rawInput || typeof rawInput !== "string" || rawInput.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Un texte ou une idée est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const mediaInstruction = {
      "with-image": "Suggère UN prompt détaillé pour générer une image ultra-réaliste dans le champ 'imagePrompts' (tableau d'un seul élément). L'image doit représenter un contexte ivoirien authentique.",
      "with-video": "Suggère UN prompt détaillé pour générer une vidéo courte dans le champ 'videoPrompt'. Contexte ivoirien authentique.",
      "with-both": "Suggère UN prompt image dans 'imagePrompts' ET UN prompt vidéo dans 'videoPrompt'. Contexte ivoirien.",
      "with-gallery": "Suggère 3-4 prompts d'images variées et complémentaires dans 'imagePrompts' (tableau de 3-4 éléments). Contexte agricole ivoirien.",
      "text-only": "Pas de média. Laisse 'imagePrompts' comme tableau vide et 'videoPrompt' vide.",
    }[mediaOption || "text-only"] || "";

    const systemPrompt = `Tu es un rédacteur en chef professionnel de niveau international, expert en agriculture tropicale et développement durable en Côte d'Ivoire.

CONTEXTE ÉDITORIAL:
- AgriCapital est une entreprise ivoirienne spécialisée dans la création de plantations de palmiers à huile clé en main
- Ton: professionnel, chaleureux, inspirant, orienté patrimoine agricole
- Public: particuliers et professionnels, propriétaires fonciers, partenaires, presse
- Fondateur: **Inocent KOFFI** (toujours en gras)
- JAMAIS mentionner de montants financiers (confidentialité absolue)
- Orthographe et grammaire irréprochables
- NE JAMAIS utiliser les termes: "souscripteurs", "investisseurs agricoles", "Palmier Solidaire", "ONG", "impact social", "acte de jouissance"
- Utiliser plutôt: "particuliers et professionnels", "propriétaires fonciers", "contrats sécurisés", "patrimoine agricole"

INSTRUCTIONS DE RÉDACTION:
1. TITRE: En MAJUSCULES, percutant, max 80 caractères, professionnel
2. CONTENU: Article complet en Markdown, minimum 600 mots:
   - Introduction: 2-3 phrases d'accroche en italique (*texte*)
   - Développement: 3-5 sections avec sous-titres (## Titre Section)
   - Paragraphes aérés de 3-4 phrases max, séparés par des lignes vides
   - Utilise des **listes à puces** pour les points clés
   - **TABLEAUX MARKDOWN OBLIGATOIRES** quand le sujet implique des comparaisons, étapes, données chiffrées ou chronologies:
     | Critère | Détail |
     |---------|--------|
     | Exemple | Valeur |
   - Les tableaux doivent être bien formatés avec alignement
   - Points forts en **gras**
   - Conclusion inspirante avec perspective ou appel à l'action
3. EXTRAIT: Résumé accrocheur de 2-3 phrases en italique
4. HASHTAGS: 5-7 hashtags pertinents sans le #
5. CATÉGORIE: Choisir parmi [actualites, evenements, partenariats, agriculture, formation, general]
6. SLUG: URL-friendly en minuscules avec tirets

QUALITÉ:
- Indétectable comme contenu IA
- Factuel, précis, jamais flatteur ou exagéré
- Posture de journaliste rigoureux et respectueux
- Aucun superlatif creux, aucune formule marketing vide
- Contenu immédiatement publiable sans retouche
- Articles bien structurés pour lecture mobile ET desktop

${mediaInstruction}

RÉPONSE STRICTEMENT EN JSON:
{
  "title": "TITRE EN MAJUSCULES",
  "content": "Contenu complet en Markdown avec tableaux si pertinent...",
  "excerpt": "Extrait court et accrocheur",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "actualites",
  "slug": "titre-en-minuscules",
  "imagePrompts": ["description détaillée pour image IA en contexte ivoirien..."],
  "videoPrompt": ""
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transforme cette idée en article professionnel complet:\n\n"${rawInput.slice(0, 5000)}"` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    const parseAIJson = (text: string) => {
      try {
        return JSON.parse(text);
      } catch {
        const fenced = text.match(/```json\s*([\s\S]*?)```/i)?.[1] || text.match(/```\s*([\s\S]*?)```/i)?.[1] || text;
        const objectLike = fenced.match(/\{[\s\S]*\}/)?.[0];
        if (!objectLike) throw new Error("Failed to parse AI response as JSON");
        return JSON.parse(objectLike);
      }
    };

    const article = parseAIJson(rawContent);

    if (!article?.title || !article?.content) {
      throw new Error("Réponse IA incomplète");
    }

    return new Response(JSON.stringify(article), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate article error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Erreur lors de la génération",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
