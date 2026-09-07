import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const CACHE_PREFIX = "agc_dom_i18n_v1:";
const BATCH_SIZE = 40;

/** Marques et termes à ne jamais traduire. */
const BRANDS = ["AgriCapital", "PalmInvest", "TerraPalm", "KAPITA", "WhatsApp", "Google", "LinkedIn"];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
};

const readCache = (lang: string, text: string): string | null => {
  try { return localStorage.getItem(`${CACHE_PREFIX}${lang}:${hash(text)}`); } catch { return null; }
};
const writeCache = (lang: string, text: string, value: string) => {
  try { localStorage.setItem(`${CACHE_PREFIX}${lang}:${hash(text)}`, value); } catch { /* quota */ }
};

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG", "PATH", "TEXTAREA", "IFRAME"]);

/** Un texte est traduisible s'il contient au moins deux lettres et n'est pas une pure donnée. */
const isTranslatable = (raw: string) => {
  const text = raw.trim();
  if (text.length < 2) return false;
  if (!/[A-Za-zÀ-ÿ]{2,}/.test(text)) return false;              // chiffres, unités, symboles
  if (/^[\d\s.,%°+\-–—/:()]+$/.test(text)) return false;
  if (/^[\w.+-]+@[\w.-]+$/.test(text)) return false;             // email
  if (/^(https?:\/\/|www\.)/i.test(text)) return false;          // url
  if (/^[a-z0-9.-]+\.(ci|com|app|org|net|dev)$/i.test(text)) return false; // domaine
  if (BRANDS.some((b) => b.toLowerCase() === text.toLowerCase())) return false;
  return true;
};

const shouldSkipNode = (node: Text) => {
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.hasAttribute?.("data-no-translate")) return true;
    if (el.getAttribute?.("translate") === "no") return true;
    el = el.parentElement;
  }
  return false;
};

/**
 * Forçage global de la traduction : parcourt les nœuds de texte rendus,
 * les envoie par lots à l'edge function `auto-translate` et réécrit le DOM.
 * Cache localStorage par langue, repli systématique sur le français.
 */
const AutoTranslateDOM = () => {
  const { language } = useLanguage();
  const originals = useRef(new WeakMap<Text, string>());
  const pending = useRef(new Set<Text>());
  const inflight = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    // Zone admin : jamais traduite
    const isAdmin = () => window.location.pathname.startsWith("/admin");

    const restore = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const t = n as Text;
        const orig = originals.current.get(t);
        if (orig !== undefined && t.nodeValue !== orig) t.nodeValue = orig;
      }
    };

    if (language === "fr" || isAdmin()) {
      restore();
      return;
    }

    const collect = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n: Node | null = root.nodeType === Node.TEXT_NODE ? root : walker.nextNode();
      while (n) {
        const t = n as Text;
        const source = originals.current.get(t) ?? t.nodeValue ?? "";
        if (isTranslatable(source) && !shouldSkipNode(t)) {
          if (!originals.current.has(t)) originals.current.set(t, source);
          const cached = readCache(language, source.trim());
          if (cached) {
            const lead = source.match(/^\s*/)?.[0] ?? "";
            const tail = source.match(/\s*$/)?.[0] ?? "";
            t.nodeValue = `${lead}${cached}${tail}`;
          } else {
            pending.current.add(t);
          }
        }
        n = walker.nextNode();
      }
    };

    const flush = async () => {
      if (inflight.current || pending.current.size === 0) return;
      const nodes = Array.from(pending.current).slice(0, BATCH_SIZE);
      nodes.forEach((n) => pending.current.delete(n));
      const texts = nodes.map((n) => (originals.current.get(n) ?? n.nodeValue ?? "").trim());
      inflight.current = true;
      try {
        const { data, error } = await supabase.functions.invoke("auto-translate", {
          body: { texts, targetLanguage: language, sourceLanguage: "fr" },
        });
        if (error || !Array.isArray(data?.translations)) {
          console.warn("[i18n] auto-translate indisponible, repli français", error?.message);
        } else {
          nodes.forEach((node, i) => {
            const value = data.translations[i];
            if (typeof value === "string" && value.trim()) {
              writeCache(language, texts[i], value.trim());
              if (node.isConnected) node.nodeValue = value;
            }
          });
        }
      } catch (e) {
        console.warn("[i18n] échec de traduction, repli français", e);
      } finally {
        inflight.current = false;
        if (pending.current.size > 0) schedule();
      }
    };

    const schedule = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, 250);
    };

    collect(document.body);
    schedule();

    const observer = new MutationObserver((mutations) => {
      if (isAdmin()) return;
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) collect(node);
        });
        if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) collect(m.target);
      }
      schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (timer.current) window.clearTimeout(timer.current);
      pending.current.clear();
    };
  }, [language]);

  return null;
};

export default AutoTranslateDOM;
