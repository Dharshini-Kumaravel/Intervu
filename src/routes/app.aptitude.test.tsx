import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { 
  Clock, CheckCircle2, XCircle, Lightbulb, Loader2, 
  ChevronRight, Bookmark, Sparkles, Building2, HelpCircle, 
  BookOpen, Compass 
} from "lucide-react";
import { toast } from "sonner";
import { generateAptitudeQuestions, analyzeAptitudeAttempt } from "@/lib/ai-service";

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

type Q = {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A"|"B"|"C"|"D";
  tamil_explanation: string;
  easy_english: string;
  shortcut_method: string;
  traditional_method: string;
  common_mistake: string;
  similar_question: string;
  difficulty_level: string;
  interview_tip: string;
  ideal_time_sec: number;
};

function TakeAptitude() {
  const { topic, subtopic, difficulty, mode, count } = Route.useSearch();
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { sel: string | null; t: number; conf: string | null }>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<"Very Confident" | "Somewhat Confident" | "Guess" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showTamil, setShowTamil] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const questionsData = await generateAptitudeQuestions(topic, subtopic, difficulty, count);
        if (!questionsData || !questionsData.length) throw new Error("No questions generated");
        setQuestions(questionsData);
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
        <p className="text-muted-foreground font-semibold">Generating {count} {difficulty} {topic} questions…</p>
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

  const selectConfidence = (level: "Very Confident" | "Somewhat Confident" | "Guess") => {
    setConfidence(level);
  };

  const next = () => {
    setAnswers(a => ({ ...a, [idx]: { sel: selected, t: seconds, conf: confidence } }));
    setSelected(null); 
    setConfidence(null);
    setRevealed(false);
    if (!isLast) setIdx(i => i + 1);
    else void finish({ ...answers, [idx]: { sel: selected, t: seconds, conf: confidence } });
  };

  const finish = async (final: Record<number, { sel: string | null; t: number; conf: string | null }>) => {
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
          else if (qq.shortcut_method?.toLowerCase().includes("calc")) mistake_type = "calculation";
          else mistake_type = "concept";
        }
        return {
          attempt_id: attempt.id, user_id: user.id,
          question_text: qq.question, options: qq.options as any,
          correct_answer: qq.correct, selected_answer: sel, is_correct: correct,
          time_taken_sec: tT, ideal_time_sec: qq.ideal_time_sec,
          explanation: qq.tamil_explanation || qq.easy_english, 
          shortcut: qq.shortcut_method, mistake_type
        };
      });
      await supabase.from("aptitude_question_logs").insert(logs);

      // AI feedback
      try {
        const ai = await analyzeAptitudeAttempt(topic, questions.map((qq, i) => ({ q: qq.question, correct: qq.correct, sel: final[i]?.sel, time: final[i]?.t, ideal: qq.ideal_time_sec })));
        if (ai && !ai.error) {
          await supabase.from("aptitude_attempts").update({ ai_feedback: ai }).eq("id", attempt.id);
        }
      } catch (e) {
        console.warn("Failed to save analyze-aptitude feedback:", e);
      }

      // Update points + streak
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

      router.navigate({ to: "/app/aptitude/results", search: { id: attempt.id } });
    } catch (e: any) {
      toast.error(e.message || "Failed to save attempt");
      setSubmitting(false);
    }
  };

  const overTime = seconds > q.ideal_time_sec;
  const isCorrect = selected === q.correct;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-float-up py-4">
      {/* Progress & Info Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Badge variant="secondary" className="bg-primary-soft text-primary-deep font-semibold">
            {topic} · {subtopic} · {difficulty}
          </Badge>
          <h2 className="text-xl font-bold mt-2 text-foreground">Question {idx + 1} of {questions.length}</h2>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono font-bold ${overTime ? "bg-warning/20 text-warning-foreground animate-pulse" : "bg-secondary"}`}>
          <Clock className="w-4 h-4" /> {seconds}s / {q.ideal_time_sec}s ideal
        </div>
      </div>
      <Progress value={((idx + 1) / questions.length) * 100} className="h-2" />

      {/* Main Question Card */}
      <Card className="p-6 sm:p-8 shadow-glow border border-border/40 bg-card/65 backdrop-blur-md rounded-3xl">
        <p className="text-foreground leading-relaxed text-xl font-medium">{q.question}</p>
        
        {/* MCQ Choices */}
        <div className="mt-6 grid gap-3">
          {(["A", "B", "C", "D"] as const).map(k => {
            const isSel = selected === k;
            const isRight = revealed && k === q.correct;
            const isWrong = revealed && isSel && k !== q.correct;
            return (
              <button 
                key={k} 
                onClick={() => choose(k)}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  isRight 
                    ? "border-success bg-success/10 shadow-glow text-success-foreground" 
                    : isWrong 
                      ? "border-destructive bg-destructive/10 text-destructive-foreground" 
                      : isSel 
                        ? "border-primary bg-primary-soft text-foreground" 
                        : "border-border hover:border-primary/60 hover:bg-primary-soft/30 text-foreground/90"
                }`}
              >
                <span className="w-8 h-8 rounded-xl bg-secondary font-extrabold text-sm flex items-center justify-center shrink-0">{k}</span>
                <span className="flex-1 font-medium">{q.options[k]}</span>
                {isRight && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                {isWrong && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Confidence Meter (USP Requirement) */}
        {selected && (
          <div className="mt-6 p-4 rounded-2xl bg-secondary/30 border border-border/40 animate-scale-in">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-wider">How confident are you?</div>
            <div className="grid grid-cols-3 gap-2.5">
              {(["Very Confident", "Somewhat Confident", "Guess"] as const).map(level => (
                <button
                  key={level}
                  onClick={() => selectConfidence(level)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    confidence === level 
                      ? "bg-primary-deep text-primary-foreground border-primary-deep shadow-glow" 
                      : "bg-card hover:bg-primary-soft border-border text-foreground/80"
                  }`}
                >
                  {level === "Very Confident" && "😎 "}
                  {level === "Somewhat Confident" && "🤔 "}
                  {level === "Guess" && "🎲 "}
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Practice Mode AI Evaluation & Explanation (Bilingual Tamil + English) */}
        {revealed && mode === "practice" && (
          <div className="mt-8 space-y-5 animate-float-up">
            
            {/* Status Header & Bilingual Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <Badge className="bg-success text-white border-0 py-1 font-bold">✅ Correct!</Badge>
                ) : (
                  <Badge className="bg-destructive text-white border-0 py-1 font-bold">❌ Correct answer: {q.correct}</Badge>
                )}
                <span className="text-xs text-muted-foreground">Difficulty: {q.difficulty_level || difficulty}</span>
              </div>
              <Button 
                onClick={() => setShowTamil(!showTamil)}
                variant="outline" 
                size="sm" 
                className="bg-primary-soft text-primary-deep border-primary/20 hover:bg-primary/20 font-bold"
              >
                ❤️ {showTamil ? "Show in Easy English" : "தமிழ் விளக்கவுரை"}
              </Button>
            </div>

            {/* Explanation Content Box */}
            <div className="p-5 rounded-2xl bg-primary-soft/30 border border-primary/10">
              <h4 className="font-bold text-sm text-primary-deep mb-2">
                {showTamil ? "தமிழ் விளக்கம் ❤️ (Bilingual Explanation)" : "Easy English Explanation"}
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                {showTamil ? q.tamil_explanation : q.easy_english}
              </p>
            </div>

            {/* Structured Methodology Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Shortcut Method */}
              <div className="p-4 rounded-2xl bg-info-soft/30 border border-info/10 space-y-2">
                <div className="font-bold text-sm text-info-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-info" />
                  <span>Shortcut Method</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{q.shortcut_method}</p>
              </div>

              {/* Traditional Method */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-2">
                <div className="font-bold text-sm text-foreground/80 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>Traditional Method</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{q.traditional_method}</p>
              </div>
            </div>

            {/* Common Mistakes & Similar Question */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Common Mistakes */}
              <div className="p-4 rounded-2xl bg-warning-soft/30 border border-warning/10 space-y-2">
                <div className="font-bold text-sm text-warning-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span>Common Mistakes</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{q.common_mistake}</p>
              </div>

              {/* Company Interview Tip */}
              <div className="p-4 rounded-2xl bg-accent-soft/30 border border-accent/10 space-y-2">
                <div className="font-bold text-sm text-accent flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-accent" />
                  <span>Company Placement Tip</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{q.interview_tip}</p>
              </div>
            </div>

            {/* Similar Question recap */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-1.5 text-xs">
              <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Similar Question Pattern
              </span>
              <p className="text-foreground/80">{q.similar_question}</p>
            </div>

            {/* Session Time metrics */}
            <div className="p-3.5 rounded-xl bg-secondary/50 text-xs flex justify-between">
              <span className="text-muted-foreground font-medium">Time Taken</span>
              <span className={overTime ? "text-warning-foreground font-bold" : "text-success font-bold"}>
                {seconds}s vs ideal {q.ideal_time_sec}s
              </span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-between items-center mt-8 border-t pt-5">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Bookmark className="w-4 h-4 mr-1.5" /> Bookmark Q
          </Button>
          <Button 
            onClick={next} 
            disabled={!selected || submitting || (mode === "practice" && !revealed)}
            className="bg-gradient-mint text-primary-deep hover:opacity-90 font-bold px-6 py-2.5 rounded-xl gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            {isLast ? "Submit & Finish" : "Next Question"} 
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
