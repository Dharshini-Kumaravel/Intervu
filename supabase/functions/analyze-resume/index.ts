import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { resumeText, targetRole } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an ATS expert and senior recruiter. Analyze the resume against the target role. Be precise and actionable." },
          { role: "user", content: `Target role: ${targetRole || "Software Engineer"}\n\nResume:\n${(resumeText || "").slice(0, 8000)}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_analysis",
            parameters: {
              type: "object",
              properties: {
                ats_score: { type: "number" },
                skills_score: { type: "number" },
                projects_score: { type: "number" },
                experience_score: { type: "number" },
                missing_keywords: { type: "array", items: { type: "string" } },
                weak_statements: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
                generated_questions: { type: "array", items: { type: "string" } },
                role_match: { type: "string" }
              },
              required: ["ats_score","skills_score","projects_score","experience_score","missing_keywords","weak_statements","suggestions","generated_questions","role_match"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "emit_analysis" } }
      })
    });
    if (!resp.ok) {
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limit" : status === 402 ? "Add credits" : "AI error" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const d = await resp.json();
    const args = d?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(JSON.stringify(typeof args === "string" ? JSON.parse(args) : args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
