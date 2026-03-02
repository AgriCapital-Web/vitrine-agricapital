import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, quality = "standard" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Un prompt est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Use pro model for higher quality, flash for standard
    const model = quality === "high"
      ? "google/gemini-3-pro-image-preview"
      : "google/gemini-2.5-flash-image";

    const enhancedPrompt = `Generate a highly realistic, professional photograph for an article about agriculture in Ivory Coast (Côte d'Ivoire), West Africa.

STYLE: Ultra-realistic photograph, natural lighting, professional press quality, warm African tones.
CONTEXT: Rural Ivory Coast, palm oil agriculture, community development, African people.
SUBJECT: ${prompt}

IMPORTANT:
- Must look like a REAL photograph, NOT AI-generated
- Feature authentic Ivorian/African people and landscapes when relevant
- Natural warm lighting, lush green vegetation typical of Côte d'Ivoire
- Professional composition suitable for a news article or report
- No text, watermarks, or artificial elements`;

    console.log(`Generating image with model: ${model}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: enhancedPrompt }],
        modalities: ["image", "text"],
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
      const errorText = await response.text();
      console.error("Image generation error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error("No image generated");
    }

    // Upload to storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `news/ai-generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, bytes.buffer as ArrayBuffer, { contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload generated image");
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);

    return new Response(JSON.stringify({ 
      url: urlData.publicUrl,
      message: "Image générée avec succès" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erreur lors de la génération" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
