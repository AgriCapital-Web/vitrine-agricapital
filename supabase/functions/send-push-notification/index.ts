import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: "contact_message" | "newsletter_subscription" | "testimonial";
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { type, title, message, data } = payload;

    // Enregistrer la notification dans la base de données
    const { data: notification, error: notifError } = await supabase
      .from("admin_notifications")
      .insert({
        type,
        title,
        message,
        data: data || {},
      })
      .select()
      .single();

    if (notifError) {
      console.error("Error saving notification:", notifError);
      throw notifError;
    }

    // Récupérer tous les abonnements push des admins
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
    }

    // Note: Pour les notifications push Web, vous auriez besoin de VAPID keys
    // et d'un service comme web-push. Pour l'instant, nous utilisons
    // les notifications en temps réel via Supabase Realtime.

    console.log(`Notification created: ${notification.id}`);
    console.log(`Found ${subscriptions?.length || 0} push subscriptions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification,
        subscriptions_count: subscriptions?.length || 0 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-push-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
