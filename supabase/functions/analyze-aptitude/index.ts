import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { topic, results } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const sys = `You are an aptitude coach. Analyze the user's test performance and return concise actionable insights. Topic: ${topic}. Results JSON includes per-question correctness, time taken vs ideal, and chosen vs correct.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(results).slice(0, 6000) }
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_feedback",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                tips: { type: "array", items: { type: "string" } },
                mistake_breakdown: {
                  type: "object",
                  properties: {
                    concept: { type: "number" },
                    calculation: { type: "number" },
                    time_pressure: { type: "number" }
                  },
                  required: ["concept","calculation","time_pressure"]
                },
                recommended_topics: { type: "array", items: { type: "string" } },
                recommended_difficulty: { type: "string" }
              },
              required: ["summary","strengths","weaknesses","tips","mistake_breakdown","recommended_topics","recommended_difficulty"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "emit_feedback" } }
      })
    });
    if (!resp.ok) {
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limit" : status === 402 ? "Add Lovable AI credits" : "AI error" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
