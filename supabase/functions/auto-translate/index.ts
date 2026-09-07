import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  ar: "Arabic",
  es: "Spanish",
  de: "German",
  zh: "Chinese (Simplified)",
  bci: "Baoulé (Ivorian Baule, official Ivorian practical orthography: a b c d e ɛ f g gb h i j k kp l m n ny ŋ o ɔ p r s t u v w y z)",
  dyu: "Dioula / Julakan (Manding, official Latin orthography: a b c d e ɛ f g h i j k l m n ɲ ŋ o ɔ p r s t u w y z)",
};

const WINDOW_MS = 60_000;

/** Lexique métier imposé pour garantir la cohérence des langues ivoiriennes. */
const GLOSSARY: Record<string, string> = {
  bci: [
    "terre = asiɛ",
    "plantation = fie",
    "palmier à huile = mmɛ waka (huile de palme = mmɛ ngo)",
    "propriétaire = fie fuɛ",
    "revenus = sika ng'ɔ ba",
    "contrat = ndɛ nga be klɛli",
    "paiement = sika tualɛ",
    "investir = fa sika sie",
    "agriculture = fie dilɛ",
    "récolte = fie nun ninnge kpɛlɛ",
    "partenariat = afiɛn kolɛ",
    "client = atɔnvɔfuɛ",
    "équipe = aniaan mun",
    "avenir = ainman",
    "projet = junman kunngba",
  ].join("; "),
  dyu: [
    "terre = dugukolo",
    "plantation = foro",
    "palmier à huile = tulusun (huile de palme = tulu)",
    "propriétaire = tigi",
    "revenus = nafolo / wari min bɛ sɔrɔ",
    "contrat = bɛnkan sɛbɛn",
    "paiement = sara",
    "investir = wari don baara la",
    "agriculture = sɛnɛ",
    "récolte = suman tigɛli",
    "partenariat = jɛɲɔgɔnya",
    "client = san-baga",
    "équipe = jɛkulu",
    "avenir = sini",
    "projet = baara laɲini",
  ].join("; "),
};

/** Caractères autorisés par orthographe officielle (contrôle post-traduction). */
const ALLOWED: Record<string, RegExp> = {
  bci: /^[\p{L}\p{N}\p{M}\s'’‘"“”.,;:!?()\[\]{}%°+\-–—/\\@#&*_=<>|~`$€]+$/u,
  dyu: /^[\p{L}\p{N}\p{M}\s'’‘"“”.,;:!?()\[\]{}%°+\-–—/\\@#&*_=<>|~`$€]+$/u,
};
const FORBIDDEN: Record<string, RegExp> = {
  // Caractères jamais utilisés dans les orthographes officielles ivoiriennes
  bci: /[qxàâäéèêëîïôöùûüçQX]/,
  dyu: /[qvxàâäéèêëîïôöùûüçQVX]/,
};

const MAX_PER_WINDOW = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_PER_WINDOW;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { texts, targetLanguage, sourceLanguage = "fr" } = await req.json();
    if (!Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return new Response(JSON.stringify({ error: "texts[] and targetLanguage are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (targetLanguage === sourceLanguage) {
      return new Response(JSON.stringify({ translations: texts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LANG_NAMES[targetLanguage]) {
      return new Response(JSON.stringify({ error: "Unsupported target language" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const items = texts.slice(0, 100).map((t: unknown) => String(t ?? "").slice(0, 5000));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are AgriCapital's professional localization engine. Translate each item faithfully, keeping the exact same meaning, tone, HTML tags, placeholders ({{x}}, %s) and ALL numbers, dates, units, percentages and currencies unchanged (36 mois, 143 plants/ha, 25 ans, 75 %). Never translate brand names (AgriCapital, PalmInvest, TerraPalm, KAPITA, WhatsApp, Google, LinkedIn), email addresses or URLs/domains. For Baoulé (bci) and Dioula (dyu), use ONLY the official Ivorian Latin orthography and the imposed business glossary; never use French letters absent from those alphabets (q, x, v for dyu, accented vowels à é è ê î ô û ä ë ï ö ü ç). Reply ONLY with a JSON object of the form {\"translations\": [\"...\"]} in the same order and with the same length as the input.",
          },
          {
            role: "user",
            content: `Source language: ${LANG_NAMES[sourceLanguage] || sourceLanguage}\nTarget language: ${LANG_NAMES[targetLanguage]}${
              GLOSSARY[targetLanguage] ? `\nMANDATORY GLOSSARY (use exactly these terms): ${GLOSSARY[targetLanguage]}` : ""
            }\n\nITEMS:\n${JSON.stringify(items)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`AI gateway failed [${res.status}]: ${body}`);
      return new Response(JSON.stringify({ error: "Translation failed", status: res.status, details: body }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : null;
    const translations = Array.isArray(parsed?.translations) ? parsed.translations : items;

    // Passe de vérification orthographique : repli sur le français si caractères interdits
    const checked = translations.map((tr: unknown, i: number) => {
      const value = typeof tr === "string" ? tr : "";
      if (!value.trim()) return items[i];
      const bad = FORBIDDEN[targetLanguage];
      const allowed = ALLOWED[targetLanguage];
      if (bad && bad.test(value)) {
        console.warn(`orthographe ${targetLanguage} invalide, repli français: ${value.slice(0, 80)}`);
        return items[i];
      }
      if (allowed && !allowed.test(value)) return items[i];
      return value;
    });

    return new Response(JSON.stringify({ translations: checked }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("auto-translate error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
