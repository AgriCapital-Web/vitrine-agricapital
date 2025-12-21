import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Language = "fr" | "en" | "ar" | "es" | "de" | "zh";

interface SEOData {
  title: string;
  description: string;
  slogan: string;
  locale: string;
}

const seoTranslations: Record<Language, SEOData> = {
  fr: {
    title: "AgriCapital - Le partenaire idéal des producteurs agricoles en Côte d'Ivoire",
    description: "AgriCapital propose un modèle innovant d'accompagnement agricole permettant aux petits producteurs et propriétaires terriens d'accéder à la filière palmier à huile sans barrière financière.",
    slogan: "Cultivons ensemble l'avenir de l'agriculture ivoirienne",
    locale: "fr_FR",
  },
  en: {
    title: "AgriCapital - The ideal partner for agricultural producers in Côte d'Ivoire",
    description: "AgriCapital offers an innovative agricultural support model enabling small producers and landowners to access the oil palm industry without financial barriers.",
    slogan: "Transforming Ivorian agriculture together",
    locale: "en_US",
  },
  ar: {
    title: "أجري كابيتال - الشريك المثالي للمنتجين الزراعيين في كوت ديفوار",
    description: "تقدم أجري كابيتال نموذجًا مبتكرًا للدعم الزراعي يمكّن صغار المنتجين وأصحاب الأراضي من الوصول إلى صناعة زيت النخيل دون حواجز مالية.",
    slogan: "نزرع معًا مستقبل الزراعة الإيفوارية",
    locale: "ar_SA",
  },
  es: {
    title: "AgriCapital - El socio ideal de los productores agrícolas en Costa de Marfil",
    description: "AgriCapital ofrece un modelo innovador de apoyo agrícola que permite a los pequeños productores y propietarios de tierras acceder a la industria del aceite de palma sin barreras financieras.",
    slogan: "Cultivemos juntos el futuro de la agricultura marfileña",
    locale: "es_ES",
  },
  de: {
    title: "AgriCapital - Der ideale Partner für landwirtschaftliche Produzenten in der Elfenbeinküste",
    description: "AgriCapital bietet ein innovatives landwirtschaftliches Unterstützungsmodell, das Kleinbauern und Landbesitzern den Zugang zur Palmölindustrie ohne finanzielle Barrieren ermöglicht.",
    slogan: "Gemeinsam die Zukunft der ivorischen Landwirtschaft gestalten",
    locale: "de_DE",
  },
  zh: {
    title: "农业资本 - 科特迪瓦农业生产者的理想合作伙伴",
    description: "农业资本提供创新的农业支持模式，使小型生产者和土地所有者能够无需金融障碍进入油棕产业。",
    slogan: "共同培育科特迪瓦农业的未来",
    locale: "zh_CN",
  },
};

const validLanguages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || "/";
  
  // Detect language from path
  let lang: Language = "fr";
  const pathParts = pathParam.split("/").filter(Boolean);
  
  if (pathParts.length > 0 && validLanguages.includes(pathParts[0] as Language)) {
    lang = pathParts[0] as Language;
  }

  const seo = seoTranslations[lang];
  const baseUrl = "https://agricapital.ci";
  const currentUrl = lang === "fr" ? baseUrl : `${baseUrl}/${lang}`;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${seo.title} | ${seo.slogan}</title>
  <meta name="title" content="${seo.title}">
  <meta name="description" content="${seo.description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${currentUrl}">
  <meta property="og:title" content="${seo.title}">
  <meta property="og:description" content="${seo.description}">
  <meta property="og:image" content="${baseUrl}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${seo.locale}">
  <meta property="og:site_name" content="AgriCapital">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${currentUrl}">
  <meta name="twitter:title" content="${seo.title}">
  <meta name="twitter:description" content="${seo.description}">
  <meta name="twitter:image" content="${baseUrl}/og-image.png">
  
  <!-- Canonical -->
  <link rel="canonical" href="${currentUrl}">
  
  <!-- Hreflang -->
  <link rel="alternate" hreflang="fr" href="${baseUrl}">
  <link rel="alternate" hreflang="en" href="${baseUrl}/en">
  <link rel="alternate" hreflang="ar" href="${baseUrl}/ar">
  <link rel="alternate" hreflang="es" href="${baseUrl}/es">
  <link rel="alternate" hreflang="de" href="${baseUrl}/de">
  <link rel="alternate" hreflang="zh" href="${baseUrl}/zh">
  <link rel="alternate" hreflang="x-default" href="${baseUrl}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${baseUrl}/favicon.png">
  
  <!-- Redirect to main site for browsers -->
  <meta http-equiv="refresh" content="0; url=${currentUrl}">
</head>
<body>
  <p>Redirecting to <a href="${currentUrl}">${seo.title}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
});
