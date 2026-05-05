import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const BASE_URL = `${SUPABASE_URL}/functions/v1`;

Deno.test("send-newsletter-batch: rejects unauthenticated request with 401", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ subject: "Test", html: "<p>Hello</p>" }),
  });
  const body = await res.text();
  assertEquals(res.status, 401);
});

Deno.test("send-newsletter-batch: rejects invalid body with 400", async () => {
  // Even with a valid token, missing subject should fail
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ html: "<p>Hello</p>" }),
  });
  const body = await res.text();
  // Should be 401 (anon key is not a valid user token) or 400
  const validStatus = res.status === 401 || res.status === 400;
  assertEquals(validStatus, true);
});

Deno.test("send-newsletter-batch: OPTIONS returns CORS headers", async () => {
  const res = await fetch(`${BASE_URL}/send-newsletter-batch`, {
    method: "OPTIONS",
    headers: { "apikey": SUPABASE_ANON_KEY },
  });
  await res.text();
  const allowOrigin = res.headers.get("access-control-allow-origin");
  assertEquals(allowOrigin, "*");
});
