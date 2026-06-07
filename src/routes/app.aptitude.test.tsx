import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Clock, CheckCircle2, XCircle, Lightbulb, Loader2, ChevronRight, Bookmark } from "lucide-react";
import { toast } from "sonner";

const search = z.object({
  topic: z.string(),
  subtopic: z.string(),
  difficulty: z.string(),
  mode: z.enum(["practice", "test"]),
  count: z.coerce.number().default(5)
});

export const Route = createFileRoute("/app/aptitude/test")({
  validateSearch: (s) => search.parse(s),
  component: TakeAptitude
});

type Q = { question: string; options: { A: string; B: string; C: string; D: string }; correct: "A"|"B"|"C"|"D"; explanation: string; shortcut: string; ideal_time_sec: number };

function TakeAptitude() {
  const { topic, subtopic, difficulty, mode, count } = Route.useSearch();
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { sel: string | null; t: number }>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-aptitude", {
          body: { topic, subtopic, difficulty, count }
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
        if (!data?.questions?.length) throw new Error("No questions generated");
        setQuestions(data.questions);
      } catch (e: any) {
        toast.error(e.message || "Could not generate questions");
        router.navigate({ to: "/app/aptitude" });
      } finally { setLoading(false); }
    })();
  }, [topic, subtopic, difficulty, count, router]);

  // Timer
  useEffect(() => {
    if (loading) return;
    startRef.current = Date.now();
    setSeconds(0);
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [idx, loading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Generating {count} {difficulty} {topic} questions…</p>
      </div>
    );
  }
  if (!questions.length) return null;

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const choose = (opt: string) => {
    if (revealed && mode === "practice") return;
    setSelected(opt);
    if (mode === "practice") setRevealed(true);
  };

  const next = () => {
    setAnswers(a => ({ ...a, [idx]: { sel: selected, t: seconds } }));
    setSelected(null); setRevealed(false);
    if (!isLast) setIdx(i => i + 1);
    else void finish({ ...answers, [idx]: { sel: selected, t: seconds } });
  };

  const finish = async (final: Record<number, { sel: string | null; t: number }>) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const correctCount = questions.reduce((s, qq, i) => s + (final[i]?.sel === qq.correct ? 1 : 0), 0);
      const totalTime = Object.values(final).reduce((s, x) => s + x.t, 0);
      const idealTime = questions.reduce((s, qq) => s + qq.ideal_time_sec, 0);
      const accuracy = (correctCount / questions.length) * 100;

      const { data: attempt, error: aerr } = await supabase.from("aptitude_attempts").insert({
        user_id: user.id, topic, subtopic, difficulty, mode,
        total_questions: questions.length, correct_count: correctCount,
        accuracy, total_time_sec: totalTime, ideal_time_sec: idealTime
      }).select().single();
      if (aerr || !attempt) throw aerr;

      const logs = questions.map((qq, i) => {
        const sel = final[i]?.sel ?? null;
        const correct = sel === qq.correct;
        const tT = final[i]?.t ?? 0;
        let mistake_type: string | null = null;
        if (!correct && sel) {
          if (tT > qq.ideal_time_sec * 1.5) mistake_type = "time_pressure";
          else if (qq.shortcut?.toLowerCase().includes("calc")) mistake_type = "calculation";
          else mistake_type = "concept";
        }
        return {
          attempt_id: attempt.id, user_id: user.id,
          question_text: qq.question, options: qq.options as any,
          correct_answer: qq.correct, selected_answer: sel, is_correct: correct,
          time_taken_sec: tT, ideal_time_sec: qq.ideal_time_sec,
          explanation: qq.explanation, shortcut: qq.shortcut, mistake_type
        };
      });
      await supabase.from("aptitude_question_logs").insert(logs);

      // AI feedback
      const { data: ai } = await supabase.functions.invoke("analyze-aptitude", {
        body: { topic, results: questions.map((qq, i) => ({ q: qq.question, correct: qq.correct, sel: final[i]?.sel, time: final[i]?.t, ideal: qq.ideal_time_sec })) }
      });
      if (ai && !ai.error) {
        await supabase.from("aptitude_attempts").update({ ai_feedback: ai }).eq("id", attempt.id);
      }

      // Update points + streak
      await supabase.rpc; // placeholder no-op (RPC not defined — use direct update)
      const { data: prof } = await supabase.from("profiles").select("total_points,streak_days,last_active_date").eq("user_id", user.id).single();
      const today = new Date().toISOString().slice(0, 10);
      const last = prof?.last_active_date;
      let streak = prof?.streak_days || 0;
      if (last !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        streak = last === y.toISOString().slice(0, 10) ? streak + 1 : 1;
      }
      await supabase.from("profiles").update({
        total_points: (prof?.total_points || 0) + correctCount * 5,
        streak_days: streak, last_active_date: today
      }).eq("user_id", user.id);

      router.navigate({ to: "/app/aptitude/result", search: { id: attempt.id } });
    } catch (e: any) {
      toast.error(e.message || "Failed to save attempt");
      setSubmitting(false);
    }
  };

  const overTime = seconds > q.ideal_time_sec;
  const isCorrect = selected === q.correct;

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-float-up">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="secondary" className="bg-primary-soft text-primary-deep">{topic} · {subtopic} · {difficulty}</Badge>
          <h2 className="text-lg font-semibold mt-2">Question {idx + 1} of {questions.length}</h2>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-mono ${overTime ? "bg-warning/20 text-warning-foreground" : "bg-secondary"}`}>
          <Clock className="w-4 h-4" /> {seconds}s / {q.ideal_time_sec}s ideal
        </div>
      </div>
      <Progress value={((idx + 1) / questions.length) * 100} className="h-2" />

      <Card className="p-6 shadow-card">
        <p className="text-foreground leading-relaxed text-lg">{q.question}</p>
        <div className="mt-5 grid gap-2">
          {(["A", "B", "C", "D"] as const).map(k => {
            const isSel = selected === k;
            const isRight = revealed && k === q.correct;
            const isWrong = revealed && isSel && k !== q.correct;
            return (
              <button key={k} onClick={() => choose(k)}
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isRight ? "border-success bg-success/10" : isWrong ? "border-destructive bg-destructive/10" : isSel ? "border-primary bg-primary-soft" : "border-border hover:border-primary/60 hover:bg-primary-soft/30"}`}>
                <span className="w-8 h-8 rounded-lg bg-secondary font-bold text-sm flex items-center justify-center shrink-0">{k}</span>
                <span className="flex-1">{q.options[k]}</span>
                {isRight && <CheckCircle2 className="w-5 h-5 text-success" />}
                {isWrong && <XCircle className="w-5 h-5 text-destructive" />}
              </button>
            );
          })}
        </div>

        {revealed && mode === "practice" && (
          <div className="mt-5 space-y-3 animate-float-up">
            <div className={`p-4 rounded-xl ${isCorrect ? "bg-success/10" : "bg-destructive/10"}`}>
              <div className="font-semibold">{isCorrect ? "✅ Correct!" : `❌ Correct answer: ${q.correct}`}</div>
              <p className="text-sm mt-2 text-foreground/80">{q.explanation}</p>
            </div>
            <div className="p-4 rounded-xl bg-info/10 flex gap-3">
              <Lightbulb className="w-5 h-5 text-info shrink-0" />
              <div>
                <div className="font-semibold text-sm">Shortcut</div>
                <p className="text-sm mt-1 text-foreground/80">{q.shortcut}</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/60 text-sm flex justify-between">
              <span className="text-muted-foreground">Time taken</span>
              <span className={overTime ? "text-warning-foreground font-semibold" : "text-success font-semibold"}>{seconds}s vs ideal {q.ideal_time_sec}s</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <Button variant="ghost" size="sm"><Bookmark className="w-4 h-4 mr-1" /> Bookmark</Button>
          <Button onClick={next} disabled={!selected || submitting} className="bg-gradient-mint text-primary-deep hover:opacity-90 font-semibold">
            {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            {isLast ? "Finish" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
