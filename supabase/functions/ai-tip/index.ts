import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { context } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a motivating interview coach. Give one short, specific tip (max 25 words)." },
          { role: "user", content: `Context: ${JSON.stringify(context).slice(0, 1500)}` }
        ]
      })
    });
    if (!resp.ok) {
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ tip: "Practice 5 quant questions today to build speed.", error: status === 429 ? "Rate limit" : status === 402 ? "Add credits" : null }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const d = await resp.json();
    const tip = d?.choices?.[0]?.message?.content?.trim() || "Stay consistent — small daily practice beats long weekend cramming.";
    return new Response(JSON.stringify({ tip }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ tip: "Keep practicing — consistency wins!" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
