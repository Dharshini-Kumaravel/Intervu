import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { problem, code, language } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const sys = `You are an expert code reviewer. Evaluate the user's solution. Be strict but fair. Score correctness (0-100) by tracing the logic against the problem. Score efficiency (0-100) by estimating time/space complexity. Identify bugs and propose an optimized approach.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Problem:\n${problem}\n\nLanguage: ${language}\n\nCode:\n${code}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_review",
            parameters: {
              type: "object",
              properties: {
                correctness_score: { type: "number" },
                efficiency_score: { type: "number" },
                time_complexity: { type: "string" },
                space_complexity: { type: "string" },
                passed_cases: { type: "number" },
                total_cases: { type: "number" },
                bugs: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
                optimization: { type: "string" },
                summary: { type: "string" }
              },
              required: ["correctness_score","efficiency_score","time_complexity","space_complexity","passed_cases","total_cases","bugs","suggestions","optimization","summary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "emit_review" } }
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