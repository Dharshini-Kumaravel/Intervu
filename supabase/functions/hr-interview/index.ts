import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, role, transcript, lastAnswer } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    if (action === "next_question") {
      const sys = `You are a friendly but professional HR interviewer for a ${role || "software"} role. Ask one concise interview question. Vary between behavioral, situational, and motivational. Avoid repeats from the transcript.`;
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: `Transcript so far: ${JSON.stringify(transcript || []).slice(0, 4000)}\nAsk the next question only — no preamble.` }
          ]
        })
      });
      if (!resp.ok) {
        const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
        return new Response(JSON.stringify({ error: status === 429 ? "Rate limit" : status === 402 ? "Add credits" : "AI error" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const d = await resp.json();
      const q = d?.choices?.[0]?.message?.content?.trim() || "Tell me about yourself.";
      return new Response(JSON.stringify({ question: q }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "evaluate_answer") {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Evaluate a single HR interview answer. Be specific and constructive." },
            { role: "user", content: `Question: ${lastAnswer.question}\nAnswer: ${lastAnswer.answer}` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "emit_eval",
              parameters: {
                type: "object",
                properties: {
                  ideal_points: { type: "array", items: { type: "string" } },
                  missing_points: { type: "array", items: { type: "string" } },
                  fluency: { type: "number" },
                  confidence: { type: "number" },
                  clarity: { type: "number" },
                  relevance: { type: "number" },
                  depth: { type: "number" },
                  filler_words: { type: "array", items: { type: "string" } },
                  feedback: { type: "string" }
                },
                required: ["ideal_points","missing_points","fluency","confidence","clarity","relevance","depth","filler_words","feedback"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "emit_eval" } }
        })
      });
      if (!resp.ok) {
        const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
        return new Response(JSON.stringify({ error: status === 429 ? "Rate limit" : status === 402 ? "Add credits" : "AI error" }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const d = await resp.json();
      const args = d?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      return new Response(JSON.stringify(typeof args === "string" ? JSON.parse(args) : args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "final_report") {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Produce a comprehensive HR interview final report with overall scores 0-100." },
            { role: "user", content: `Transcript: ${JSON.stringify(transcript).slice(0, 8000)}` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "emit_report",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number" },
                  fluency_score: { type: "number" },
                  confidence_score: { type: "number" },
                  content_score: { type: "number" },
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  summary: { type: "string" }
                },
                required: ["overall_score","fluency_score","confidence_score","content_score","strengths","weaknesses","improvements","summary"]
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "emit_report" } }
        })
      });
      const d = await resp.json();
      const args = d?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      return new Response(JSON.stringify(typeof args === "string" ? JSON.parse(args) : args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
