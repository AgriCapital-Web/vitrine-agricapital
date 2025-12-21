import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email").max(255, "Email too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message too long"),
  pageOrigin: z.string().optional(),
});

// HTML escaping to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Simple rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }
  
  if (limit.count >= 3) {
    return false;
  }
  
  limit.count++;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validated = contactSchema.parse(body);
    const { name, email, subject, message, pageOrigin } = validated;

    // Rate limiting by email
    const rateLimitKey = email.toLowerCase();
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Trop de tentatives. Veuillez réessayer dans une heure."
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending contact email from:", email);

    // Sanitize all user inputs before embedding in HTML
    const emailHtml = `
      <h2>Nouveau message – Formulaire site vitrine AgriCapital</h2>
      <p><strong>Nom complet :</strong> ${escapeHtml(name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message :</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      ${pageOrigin ? `<p><em>Page d'origine : ${escapeHtml(pageOrigin)}</em></p>` : ''}
      <hr>
      <p><em>— Email reçu depuis le site vitrine AgriCapital (https://agricapital.ci)</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "AgriCapital Contact <onboarding@resend.dev>",
      to: ["contact@agricapital.ci", "inocent.koffi@agricapital.ci"],
      subject: "Nouveau message – Formulaire site vitrine AgriCapital",
      html: emailHtml,
      reply_to: email,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Email envoyé avec succès",
      data: emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    // Log detailed error server-side for debugging
    console.error("Error in send-contact-email function:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Return generic error message to client (prevent information leakage)
    let statusCode = 500;
    let errorMessage = "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer plus tard.";
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      statusCode = 400;
      errorMessage = "Données du formulaire invalides. Veuillez vérifier vos informations.";
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
