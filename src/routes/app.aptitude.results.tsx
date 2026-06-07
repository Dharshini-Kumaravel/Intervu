import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Lightbulb, TrendingUp, Brain, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/aptitude/results")({
  validateSearch: (s) => z.object({ id: z.string() }).parse(s),
  component: Result
});

function Result() {
  const { id } = Route.useSearch();
  const [attempt, setAttempt] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: a } = await supabase.from("aptitude_attempts").select("*").eq("id", id).single();
      const { data: l } = await supabase.from("aptitude_question_logs").select("*").eq("attempt_id", id).order("created_at");
      setAttempt(a); setLogs(l || []);
    })();
  }, [id]);

  if (!attempt) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const correct = attempt.correct_count;
  const incorrect = attempt.total_questions - correct;
  const ai = attempt.ai_feedback;
  const avgTime = Math.round(attempt.total_time_sec / attempt.total_questions);
  const idealAvg = Math.round(attempt.ideal_time_sec / attempt.total_questions);
  const timeDeviation = Math.round(((attempt.total_time_sec - attempt.ideal_time_sec) / attempt.ideal_time_sec) * 100);

  return (
    <div className="space-y-5 animate-float-up">
      {/* Header summary */}
      <Card className="p-6 bg-gradient-mint border-0 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
        <div className="relative grid md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-primary-deep/70 uppercase tracking-wider">Score</div>
            <div className="text-5xl font-bold text-primary-deep">{Math.round(Number(attempt.accuracy))}%</div>
            <Badge className="mt-2 bg-white/60 text-primary-deep border-0">{attempt.topic} · {attempt.subtopic}</Badge>
          </div>
          <Stat label="Correct" value={`${correct}/${attempt.total_questions}`} />
          <Stat label="Avg time" value={`${avgTime}s`} />
          <Stat label="Time deviation" value={`${timeDeviation > 0 ? "+" : ""}${timeDeviation}%`} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-3">Accuracy</h3>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ name: "Correct", value: correct }, { name: "Incorrect", value: incorrect }]} dataKey="value" innerRadius={50} outerRadius={70}>
                  <Cell fill="oklch(0.70 0.15 155)" /><Cell fill="oklch(0.62 0.21 25)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success" /> Correct {correct}</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive" /> Incorrect {incorrect}</span>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-3">Time per question</h3>
          <div className="h-44">
            <ResponsiveContainer>
              <BarChart data={logs.map((l, i) => ({ q: `Q${i + 1}`, taken: l.time_taken_sec, ideal: l.ideal_time_sec }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 165)" vertical={false} />
                <XAxis dataKey="q" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="taken" fill="oklch(0.85 0.10 165)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ideal" fill="oklch(0.65 0.12 200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Brain className="w-4 h-4" /> Mistake breakdown</h3>
          {ai?.mistake_breakdown ? (
            <div className="space-y-3">
              {Object.entries(ai.mistake_breakdown).map(([k, v]: any) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1 capitalize"><span>{k.replace("_", " ")}</span><span>{v}</span></div>
                  <Progress value={Math.min(Number(v) * 20, 100)} className="h-2" />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Analysis pending…</p>}
        </Card>
      </div>

      {ai && (
        <Card className="p-5 shadow-card">
          <h3 className="font-semibold flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-info" /> AI feedback</h3>
          <p className="text-sm text-foreground/80 mb-4">{ai.summary}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Block title="Strengths" items={ai.strengths} tone="success" />
            <Block title="Weaknesses" items={ai.weaknesses} tone="warning" />
            <Block title="Tips" items={ai.tips} tone="info" />
          </div>
          <div className="mt-4 p-3 rounded-xl bg-primary-soft text-sm">
            <strong>Recommended next:</strong> {ai.recommended_topics?.join(", ")} at <Badge variant="secondary">{ai.recommended_difficulty}</Badge> difficulty.
          </div>
        </Card>
      )}

      <Card className="p-5 shadow-card">
        <h3 className="font-semibold mb-3">Question-by-question review</h3>
        <div className="space-y-3">
          {logs.map((l, i) => (
            <div key={l.id} className={`p-4 rounded-xl border ${l.is_correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-start gap-3">
                {l.is_correct ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="font-medium">Q{i + 1}. {l.question_text}</div>
                  <div className="text-sm mt-2 grid sm:grid-cols-2 gap-1">
                    <div>Your answer: <span className="font-semibold">{l.selected_answer || "—"}</span> ({l.options?.[l.selected_answer] || "skipped"})</div>
                    <div>Correct: <span className="font-semibold text-success">{l.correct_answer}</span> ({l.options?.[l.correct_answer]})</div>
                  </div>
                  <div className="text-sm mt-2 text-foreground/70"><strong>Explanation:</strong> {l.explanation}</div>
                  <div className="text-sm mt-1 text-foreground/70"><strong>Shortcut:</strong> {l.shortcut}</div>
                  <div className="flex gap-2 mt-2 text-xs">
                    <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> {l.time_taken_sec}s vs {l.ideal_time_sec}s</Badge>
                    {l.mistake_type && <Badge variant="outline" className="capitalize">{l.mistake_type.replace("_", " ")}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Link to="/app/aptitude"><Button variant="outline">Back to topics</Button></Link>
        <Link to="/app"><Button className="bg-gradient-mint text-primary-deep">Back to dashboard</Button></Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-white/60 rounded-xl p-3">
      <div className="text-xs text-primary-deep/70 uppercase">{label}</div>
      <div className="text-2xl font-bold text-primary-deep">{value}</div>
    </div>
  );
}

function Block({ title, items, tone }: any) {
  const colors: any = { success: "bg-success/10 border-success/30", warning: "bg-warning/10 border-warning/30", info: "bg-info/10 border-info/30" };
  return (
    <div className={`rounded-xl border p-4 ${colors[tone]}`}>
      <div className="font-semibold text-sm mb-2">{title}</div>
      <ul className="text-xs space-y-1">
        {(items || []).map((x: string, i: number) => <li key={i}>• {x}</li>)}
      </ul>
    </div>
  );
}
