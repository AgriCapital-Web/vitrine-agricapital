import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const CACHE_PREFIX = "agc_i18n_v1:";

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
};

const readCache = (lang: string, text: string): string | null => {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${lang}:${hash(text)}`);
  } catch {
    return null;
  }
};

const writeCache = (lang: string, text: string, value: string) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${lang}:${hash(text)}`, value);
  } catch {
    /* quota */
  }
};

/**
 * Traduit automatiquement des textes dynamiques (actualités, formulaires, contenus
 * créés après coup) vers la langue active. Les résultats sont mis en cache localement
 * et retombent toujours sur le texte source français en cas d'échec.
 */
export function useAutoTranslate(texts: (string | null | undefined)[], sourceLanguage = "fr") {
  const { language } = useLanguage();
  const source = texts.map((t) => t ?? "");
  const [result, setResult] = useState<string[]>(source);
  const [loading, setLoading] = useState(false);
  const signature = JSON.stringify(source);

  useEffect(() => {
    let cancelled = false;
    const items: string[] = JSON.parse(signature);

    if (language === sourceLanguage || items.every((t) => !t.trim())) {
      setResult(items);
      return;
    }

    const cached = items.map((t) => (t.trim() ? readCache(language, t) : ""));
    if (cached.every((c) => c !== null)) {
      setResult(cached as string[]);
      return;
    }

    const missingIdx = items.map((_, i) => i).filter((i) => cached[i] === null);
    setResult(items);
    setLoading(true);

    supabase.functions
      .invoke("auto-translate", {
        body: { texts: missingIdx.map((i) => items[i]), targetLanguage: language, sourceLanguage },
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.translations) {
          setResult(items);
          return;
        }
        const merged = [...items];
        missingIdx.forEach((idx, k) => {
          const value = data.translations[k];
          if (typeof value === "string" && value.trim()) {
            merged[idx] = value;
            writeCache(language, items[idx], value);
          }
        });
        items.forEach((t, i) => {
          if (cached[i]) merged[i] = cached[i] as string;
        });
        setResult(merged);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [language, signature, sourceLanguage]);

  return { translated: result, loading };
}

/** Variante pour un texte unique. */
export function useAutoTranslatedText(text?: string | null, sourceLanguage = "fr") {
  const { translated, loading } = useAutoTranslate([text], sourceLanguage);
  return { text: translated[0] ?? "", loading };
}
