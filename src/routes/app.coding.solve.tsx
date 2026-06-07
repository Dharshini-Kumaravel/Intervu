import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PROBLEM_DETAILS } from "@/lib/intervu-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Play, Send, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/coding/solve")({
  validateSearch: (s) => z.object({ problem: z.string() }).parse(s),
  component: Solve
});

const DEFAULT_CODE: Record<string, string> = {
  javascript: "// Write your solution here\nfunction solve(input) {\n  // your code\n  return null;\n}\n",
  python: "# Write your solution here\ndef solve(input):\n    # your code\n    return None\n",
  java: "class Solution {\n    public Object solve(Object input) {\n        // your code\n        return null;\n    }\n}\n",
  cpp: "// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}\n"
};

function Solve() {
  const { problem } = Route.useSearch();
  const d = PROBLEM_DETAILS[problem];
  const { user } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    setLoading(true); setFeedback(null);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-coding", {
        body: { problem: `${problem}\n${d.statement}\nExample: ${d.example}`, code, language }
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setFeedback(data);
      await supabase.from("coding_attempts").insert({
        user_id: user.id, problem_title: problem, problem_statement: d.statement,
        difficulty: d.difficulty, topic: "Coding", language, code,
        correctness_score: data.correctness_score, efficiency_score: data.efficiency_score,
        complexity: `${data.time_complexity} time, ${data.space_complexity} space`,
        ai_feedback: data, status: data.correctness_score >= 80 ? "solved" : "attempted"
      });
      toast.success("Evaluation complete");
    } catch (e: any) {
      toast.error(e.message || "Evaluation failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5 animate-float-up">
      <div className="space-y-4">
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{problem}</h1>
            <Badge variant="secondary">{d.difficulty}</Badge>
          </div>
          <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{d.statement}</p>
          <div className="mt-3 p-3 rounded-lg bg-secondary/60 text-xs font-mono">{d.example}</div>
        </Card>

        {feedback && (
          <Card className="p-5 shadow-card animate-float-up">
            <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary-deep" /> AI Review</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <ScoreBlock label="Correctness" value={feedback.correctness_score} />
              <ScoreBlock label="Efficiency" value={feedback.efficiency_score} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <Pill label="Time" value={feedback.time_complexity} />
              <Pill label="Space" value={feedback.space_complexity} />
              <Pill label="Cases" value={`${feedback.passed_cases}/${feedback.total_cases}`} />
              <Pill label="Status" value={feedback.correctness_score >= 80 ? "Solved" : "Needs work"} />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div><div className="font-semibold mb-1 text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Summary</div><p className="text-foreground/80">{feedback.summary}</p></div>
              {feedback.bugs?.length > 0 && <div><div className="font-semibold mb-1 text-destructive flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Bugs</div><ul className="space-y-1">{feedback.bugs.map((b: string, i: number) => <li key={i}>• {b}</li>)}</ul></div>}
              {feedback.suggestions?.length > 0 && <div><div className="font-semibold mb-1">Suggestions</div><ul className="space-y-1">{feedback.suggestions.map((s: string, i: number) => <li key={i}>• {s}</li>)}</ul></div>}
              <div className="p-3 rounded-lg bg-info/10 text-foreground/90"><strong>Optimization:</strong> {feedback.optimization}</div>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-5 shadow-card flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Your Solution</h3>
          <Select value={language} onValueChange={(v) => { setLanguage(v); setCode(DEFAULT_CODE[v]); }}>
            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea value={code} onChange={e => setCode(e.target.value)} className="font-mono text-sm min-h-[400px] flex-1 bg-[oklch(0.98_0.01_165)]" spellCheck={false} />
        <div className="flex gap-2 mt-3">
          <Button variant="outline" disabled className="flex-1"><Play className="w-4 h-4 mr-1" /> Run (AI mode)</Button>
          <Button onClick={submit} disabled={loading} className="flex-1 bg-gradient-mint text-primary-deep font-semibold">
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            Submit for AI review
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ScoreBlock({ label, value }: any) {
  return (
    <div className="p-3 rounded-xl bg-secondary/60">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold text-primary-deep">{value}</div>
      <Progress value={value} className="h-1.5 mt-1" />
    </div>
  );
}
function Pill({ label, value }: any) {
  return <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/40"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-semibold">{value}</span></div>;
}
