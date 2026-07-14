import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Mic, Send, Loader2, MessageSquare, Sparkles, Play, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { hrInterviewAction } from "@/lib/ai-service";

export const Route = createFileRoute("/app/hr")({ component: HR });

type Turn = { question: string; answer: string; eval?: any };

function HR() {
  const { user } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState("Software Engineer");
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any>(null);

  const ask = async (history: Turn[]) => {
    setLoading(true);
    try {
      const data = await hrInterviewAction("next_question", { role, transcript: history });
      if (!data || data.error) throw new Error(data?.error || "Failed to fetch question");
      setCurrentQ(data?.question || "Tell me about yourself.");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const start = async () => { setStarted(true); setTurns([]); setReport(null); await ask([]); };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const ev = await hrInterviewAction("evaluate_answer", { lastAnswer: { question: currentQ, answer } });
      if (!ev || ev.error) throw new Error(ev?.error || "Failed to evaluate answer");
      const newTurn: Turn = { question: currentQ, answer, eval: ev };
      const updated = [...turns, newTurn];
      setTurns(updated); setAnswer("");
      if (updated.length >= 5) await finish(updated);
      else await ask(updated);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const finish = async (final: Turn[]) => {
    setLoading(true);
    try {
      const rep = await hrInterviewAction("final_report", { transcript: final });
      if (!rep || rep.error) throw new Error(rep?.error || "Failed to generate report");
      setReport(rep);
      if (user) {
        await supabase.from("hr_sessions").insert({
          user_id: user.id, mode: "smart", target_role: role,
          transcript: final as any, ai_feedback: rep,
          fluency_score: rep?.fluency_score || 0,
          confidence_score: rep?.confidence_score || 0,
          content_score: rep?.content_score || 0,
          overall_score: rep?.overall_score || 0
        });
      }
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const toggleVoice = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return toast.error("Speech recognition not supported in this browser");
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = "en-US";
    r.onresult = (e: any) => {
      let txt = ""; for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setAnswer(prev => prev + " " + txt);
    };
    r.onend = () => setRecording(false);
    recRef.current = r; r.start(); setRecording(true);
  };

  // Intro screen
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-float-soft" />
            <div className="relative space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center animate-float-soft">
                <MessageSquare className="w-7 h-7 text-primary-deep" />
              </div>
              <h1 className="text-3xl font-bold text-primary-deep">HR Interview Simulator</h1>
              <p className="text-primary-deep/80 max-w-md">
                5 AI-driven questions tailored to your target role. Type or speak your answers — get a detailed feedback report.
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-8 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">Target role</Label>
              <Input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="h-11"
              />
            </div>
            <Button
              onClick={start}
              className="w-full h-12 bg-gradient-mint text-primary-deep font-semibold hover:shadow-glow transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Start interview
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Report
  if (report) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden text-center">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
            <div className="relative space-y-2">
              <div className="text-xs text-primary-deep/70 uppercase tracking-widest">Overall HR Score</div>
              <div className="text-7xl font-bold text-primary-deep">{report.overall_score}<span className="text-3xl">/100</span></div>
              <p className="text-primary-deep/80 max-w-md mx-auto">{report.summary}</p>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 stagger">
          {[["Fluency", report.fluency_score], ["Confidence", report.confidence_score], ["Content", report.content_score]].map(([l, v]: any) => (
            <Card key={l} className="p-5 text-center hover-lift">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{l}</div>
              <div className="text-4xl font-bold text-primary-deep mt-2">{v}</div>
              <Progress value={v} className="h-1.5 mt-3" />
            </Card>
          ))}
        </div>

        <Card className="p-7 animate-slide-up">
          <h3 className="font-semibold mb-5 flex items-center gap-2 text-lg">
            <Sparkles className="w-4 h-4 text-primary-deep" /> AI report
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Block title="Strengths" items={report.strengths} tone="success" />
            <Block title="Weaknesses" items={report.weaknesses} tone="warning" />
            <Block title="Improvements" items={report.improvements} tone="info" />
          </div>
        </Card>

        <Card className="p-7 animate-slide-up">
          <h3 className="font-semibold mb-5 text-lg">Transcript review</h3>
          <div className="space-y-4">
            {turns.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="p-5 rounded-xl bg-secondary/40 space-y-2"
              >
                <div className="font-semibold text-sm">Q{i + 1}: {t.question}</div>
                <div className="text-sm text-foreground/80 leading-relaxed">A: {t.answer}</div>
                {t.eval && (
                  <div className="text-xs text-muted-foreground pt-1">
                    Fluency {t.eval.fluency} · Confidence {t.eval.confidence} · Relevance {t.eval.relevance}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setStarted(false); setReport(null); }} className="flex-1 h-11">
            New session
          </Button>
          <Button onClick={() => router.navigate({ to: "/app" })} className="flex-1 h-11 bg-gradient-mint text-primary-deep">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Interview in progress
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <Badge variant="secondary" className="bg-primary-soft text-primary-deep">{role}</Badge>
        <Badge>Question {turns.length + 1} of 5</Badge>
      </motion.div>
      <Progress value={(turns.length / 5) * 100} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={turns.length}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-8 space-y-5">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Interviewer asks</div>
              <h2 className="text-2xl font-semibold leading-snug">
                {loading && !currentQ ? <Loader2 className="w-6 h-6 animate-spin inline" /> : currentQ}
              </h2>
            </div>
            <Textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer or use the mic…"
              className="min-h-[180px] text-base leading-relaxed"
            />
            <div className="flex gap-3">
              <Button variant={recording ? "destructive" : "outline"} onClick={toggleVoice} className="h-11">
                {recording ? <><StopCircle className="w-4 h-4 mr-2" /> Stop</> : <><Mic className="w-4 h-4 mr-2" /> Voice</>}
              </Button>
              <Button
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                className="flex-1 h-11 bg-gradient-mint text-primary-deep font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit answer
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Block({ title, items, tone }: any) {
  const colors: any = {
    success: "bg-success/10 border-success/30",
    warning: "bg-warning/10 border-warning/30",
    info: "bg-info/10 border-info/30"
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[tone]}`}>
      <div className="font-semibold text-sm mb-3">{title}</div>
      <ul className="text-sm space-y-1.5 text-foreground/80">
        {(items || []).map((x: string, i: number) => <li key={i}>• {x}</li>)}
      </ul>
    </div>
  );
}
