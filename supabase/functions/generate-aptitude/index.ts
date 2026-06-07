import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { topic, subtopic, difficulty, count = 5 } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const sys = `You are an expert aptitude test creator. Generate ${count} ${difficulty} multiple-choice aptitude questions on topic "${topic}"${subtopic ? `, subtopic "${subtopic}"` : ""}. Each question must have 4 options A,B,C,D, exactly one correct answer, a clear explanation, a shortcut/trick, and an ideal time in seconds. Return only via the tool call.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sys }, { role: "user", content: "Generate now." }],
        tools: [{
          type: "function",
          function: {
            name: "emit_questions",
            description: "Return the generated aptitude questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "object", properties: { A: { type: "string" }, B: { type: "string" }, C: { type: "string" }, D: { type: "string" } }, required: ["A","B","C","D"] },
                      correct: { type: "string", enum: ["A","B","C","D"] },
                      explanation: { type: "string" },
                      shortcut: { type: "string" },
                      ideal_time_sec: { type: "number" }
                    },
                    required: ["question","options","correct","explanation","shortcut","ideal_time_sec"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "emit_questions" } }
      })
    });

    if (!resp.ok) {
      const t = await resp.text();
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limit, try again" : status === 402 ? "Add Lovable AI credits" : t }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
