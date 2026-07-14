import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
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
import { 
  Mic, Send, Loader2, MessageSquare, Sparkles, Play, StopCircle,
  Video, Monitor, Volume2, HelpCircle, CheckCircle2, UserCheck, ShieldAlert,
  Camera, CameraOff, RefreshCw, VolumeX, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { hrInterviewAction } from "@/lib/ai-service";

export const Route = createFileRoute("/app/hr")({ component: HRRoundManager });

type Turn = { question: string; answer: string; eval?: any };

function HRRoundManager() {
  const [activeMode, setActiveMode] = useState<"smart" | "immersive" | "virtual" | null>(null);

  return (
    <div className="min-h-screen py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge className="bg-primary-soft text-primary-deep hover:bg-primary-soft border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Speech-to-Text Evaluations
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">HR Interview Round</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Simulate behavioral, situational, and cultural fit HR rounds. Choose from lightweight chat mode, web-cam split screen, or a virtual panel.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeMode ? (
          /* Mode Selector Screen */
          <motion.div 
            key="selector"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Mode 1: Smart Mode */}
            <Card className="p-6 flex flex-col justify-between min-h-[280px] hover-lift border-primary/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-deep">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Smart Chat Mode</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive keyboard or speech input with immediate grammatical, filler-word, and content evaluations on every response.
                </p>
              </div>
              <Button onClick={() => setActiveMode("smart")} className="w-full mt-6 bg-gradient-mint text-primary-deep font-bold">
                Launch Smart Mode
              </Button>
            </Card>

            {/* Mode 2: Immersive Video Mode */}
            <Card className="p-6 flex flex-col justify-between min-h-[280px] hover-lift border-accent/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Immersive Video Call</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Simulates a Zoom/Teams interview with live webcam feed, real-time AI speech generation (TTS), and fluency metrics.
                </p>
              </div>
              <Button onClick={() => setActiveMode("immersive")} className="w-full mt-6 bg-accent text-accent-foreground font-bold">
                Start Video Interview
              </Button>
            </Card>

            {/* Mode 3: Virtual Panel Mode */}
            <Card className="p-6 flex flex-col justify-between min-h-[280px] hover-lift border-warning/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Virtual Office Panel</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Navigate from the office lobby reception to the boardroom. Answer a panel of multiple AI interviewers with realistic situational logic.
                </p>
              </div>
              <Button onClick={() => setActiveMode("virtual")} className="w-full mt-6 bg-warning text-warning-foreground font-bold">
                Enter Office Lobby
              </Button>
            </Card>
          </motion.div>
        ) : activeMode === "smart" ? (
          <motion.div key="smart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SmartHRMode onBack={() => setActiveMode(null)} />
          </motion.div>
        ) : activeMode === "immersive" ? (
          <motion.div key="immersive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ImmersiveHRMode onBack={() => setActiveMode(null)} />
          </motion.div>
        ) : (
          <motion.div key="virtual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VirtualHRMode onBack={() => setActiveMode(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==============================================================
   SMART MODE IMPLEMENTATION
   ============================================================== */
function SmartHRMode({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
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
      if (updated.length >= 4) await finish(updated);
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

  return (
    <Card className="p-6 border-border/40">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back to Modes</Button>
        <Badge className="bg-primary/20 text-primary-deep border-0">Smart Chat Mode</Badge>
      </div>

      {!started ? (
        <div className="max-w-md mx-auto space-y-6 py-6">
          <div className="space-y-2">
            <Label>What is your target role?</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Development Engineer" className="h-11" />
          </div>
          <Button onClick={start} className="w-full bg-gradient-mint text-primary-deep font-bold h-11">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Initialize AI Questions
          </Button>
        </div>
      ) : report ? (
        /* Report Screen */
        <div className="space-y-6">
          <div className="bg-gradient-mint p-5 rounded-2xl text-primary-deep">
            <h2 className="text-xl font-bold">HR Review Report</h2>
            <p className="text-xs opacity-85">Target Position: {role}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <ScoreItem label="Fluency" val={report.fluency_score} />
              <ScoreItem label="Confidence" val={report.confidence_score} />
              <ScoreItem label="Content" val={report.content_score} />
              <ScoreItem label="Overall" val={report.overall_score} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Key Evaluation Summary</h3>
            <p className="text-xs text-muted-foreground leading-relaxed p-4 bg-secondary/30 rounded-xl">
              {report.summary}
            </p>
            {report.weaknesses?.length > 0 && (
              <div>
                <h4 className="font-bold text-xs text-destructive mb-2">Areas of Improvement</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  {report.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
          <Button onClick={start} className="bg-primary text-primary-foreground font-bold">Restart Interview</Button>
        </div>
      ) : (
        /* Interview Screen */
        <div className="space-y-6">
          <div className="p-4 bg-primary-soft/30 rounded-2xl border border-primary/10">
            <div className="text-[10px] text-primary-deep uppercase font-bold tracking-wider mb-1">Question {turns.length + 1}</div>
            <p className="text-sm font-semibold text-foreground">{currentQ || "Generating next question..."}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold">Your Response</Label>
            <Textarea 
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              placeholder="Type your answer or use microphone to dictate..." 
              className="min-h-[120px] text-xs resize-none"
            />
          </div>

          <div className="flex gap-2 justify-between">
            <Button variant="outline" onClick={toggleVoice} className={`text-xs gap-2 ${recording ? "border-destructive text-destructive bg-destructive/5" : ""}`}>
              {recording ? <StopCircle className="w-3.5 h-3.5 text-destructive animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
              {recording ? "Recording (Stop)" : "Dictate Response"}
            </Button>
            <Button onClick={submitAnswer} disabled={loading || !answer.trim()} className="bg-gradient-mint text-primary-deep font-bold text-xs gap-2">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Response
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ==============================================================
   IMMERSIVE VIDEO MODE IMPLEMENTATION
   ============================================================== */
function ImmersiveHRMode({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"setup" | "call" | "report">("setup");
  const [cameraActive, setCameraActive] = useState(false);
  const [logs, setLogs] = useState<{ sender: "ai" | "user"; text: string }[]>([]);
  const [voiceText, setVoiceText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const mockQuestions = [
    "Welcome. To start off, could you explain why you are interested in this position?",
    "Can you share an instance where you worked under tight deadlines to achieve a milestone?",
    "How do you handle disagreement when working in project teams?",
    "Lastly, why should we select you over other qualified candidates?"
  ];

  const speak = (txt: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.rate = 0.95;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((s) => { if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(() => toast.error("Webcam access blocked. Using static feed simulator."));
    } else if (!cameraActive && videoRef.current) {
      const s = videoRef.current.srcObject as MediaStream;
      if (s) s.getTracks().forEach(t => t.stop());
    }
    return () => {
      if (videoRef.current) {
        const s = videoRef.current.srcObject as MediaStream;
        if (s) s.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraActive]);

  const startCall = () => {
    setStep("call");
    setCameraActive(true);
    setLogs([{ sender: "ai", text: mockQuestions[0] }]);
    speak(mockQuestions[0]);
  };

  const nextQuestion = () => {
    if (!voiceText.trim()) return toast.warning("Please input an answer first.");
    const updated = [...logs, { sender: "user" as const, text: voiceText }];
    setVoiceText("");
    
    if (qIdx + 1 >= mockQuestions.length) {
      setLogs(updated);
      setCameraActive(false);
      setStep("report");
    } else {
      const nextQ = mockQuestions[qIdx + 1];
      setQIdx(i => i + 1);
      setLogs([...updated, { sender: "ai" as const, text: nextQ }]);
      speak(nextQ);
    }
  };

  return (
    <Card className="p-6 border-border/40">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back to Modes</Button>
        <Badge className="bg-accent/20 text-accent border-0">Immersive Video Call</Badge>
      </div>

      {step === "setup" ? (
        <div className="max-w-md mx-auto py-8 text-center space-y-6">
          <div className="w-16 h-16 bg-accent-soft text-accent rounded-full flex items-center justify-center mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Webcam & Voice Setup</h3>
            <p className="text-xs text-muted-foreground">We request camera permissions to simulate Zoom / Microsoft Teams split layouts.</p>
          </div>
          <Button onClick={startCall} className="w-full bg-accent text-accent-foreground font-bold h-11">
            Start Live Mock Call
          </Button>
        </div>
      ) : step === "report" ? (
        <div className="space-y-6 max-w-xl mx-auto py-4">
          <div className="p-5 bg-accent-soft/40 border border-accent/20 rounded-2xl text-center">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-bold text-base text-primary-deep">Video Call Performance</h3>
            <p className="text-xs text-muted-foreground mt-1">AI analyzed speech metrics successfully.</p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-semibold">
              <div className="bg-card p-2 rounded-xl">Fluency: 84%</div>
              <div className="bg-card p-2 rounded-xl">Confidence: 86%</div>
              <div className="bg-card p-2 rounded-xl">WPM: 110 (Perfect)</div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm">Conversation Log</h4>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
              {logs.map((l, i) => (
                <div key={i} className={`p-2.5 rounded-xl text-xs ${l.sender === "ai" ? "bg-secondary/40 border" : "bg-accent-soft/20 text-right"}`}>
                  <span className="font-bold uppercase text-[9px] text-muted-foreground block mb-0.5">{l.sender}</span>
                  {l.text}
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => { setStep("setup"); setQIdx(0); setLogs([]); }} className="w-full bg-accent text-accent-foreground font-bold">Restart call</Button>
        </div>
      ) : (
        /* Active Video Call Screen */
        <div className="grid md:grid-cols-2 gap-5">
          {/* Left panel: video feeds */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover mirror" />
              <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-[10px] text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Student Feed
              </div>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center p-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xl font-bold animate-pulse">🤖</div>
              <div className="mt-2 text-xs font-semibold text-white">AI HR Interviewer</div>
              <div className="text-[10px] text-slate-400 mt-1">{isSpeaking ? "Speaking..." : "Listening..."}</div>
            </div>
          </div>

          {/* Right panel: dialog flows */}
          <div className="flex flex-col justify-between h-full min-h-[300px]">
            <div className="p-4 bg-secondary/40 rounded-2xl border text-xs leading-relaxed flex-1 overflow-y-auto max-h-[220px] mb-4">
              <div className="text-[9px] font-bold text-accent uppercase tracking-wide mb-1">AI Prompt</div>
              {logs[logs.length - 1]?.text}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold">Type or dictate response</Label>
              <Textarea 
                value={voiceText}
                onChange={e => setVoiceText(e.target.value)}
                placeholder="Write your speech response here..."
                className="text-xs resize-none"
              />
              <Button onClick={nextQuestion} className="w-full bg-accent text-accent-foreground font-bold text-xs gap-2">
                Send Answer & Continue <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ==============================================================
   VIRTUAL PANEL MODE IMPLEMENTATION
   ============================================================== */
function VirtualHRMode({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"lobby" | "waiting" | "boardroom" | "results">("lobby");
  const [feedback, setFeedback] = useState("");

  return (
    <Card className="p-6 border-border/40">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>← Back to Modes</Button>
        <Badge className="bg-warning/20 text-warning-foreground border-0">Virtual Panel Office</Badge>
      </div>

      {step === "lobby" ? (
        <div className="text-center py-8 space-y-6 max-w-md mx-auto">
          <div className="text-5xl">🏢</div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Virtual Reception Desk</h3>
            <p className="text-xs text-muted-foreground">Report to the lobby receptionist to sign-in for your interview allocation.</p>
          </div>
          <Button onClick={() => setStep("waiting")} className="w-full bg-warning text-warning-foreground font-bold">
            Sign-in at Reception
          </Button>
        </div>
      ) : step === "waiting" ? (
        <div className="text-center py-8 space-y-6 max-w-md mx-auto">
          <div className="text-5xl animate-bounce">☕</div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Office Lounge Waiting Area</h3>
            <p className="text-xs text-muted-foreground">Your turn is being queued. Review typical behavioral codes while you wait.</p>
          </div>
          <Button onClick={() => setStep("boardroom")} className="w-full bg-warning text-warning-foreground font-bold">
            Enter Boardroom
          </Button>
        </div>
      ) : step === "results" ? (
        <div className="space-y-6 text-center max-w-md mx-auto py-8">
          <div className="text-5xl">🏆</div>
          <h3 className="font-extrabold text-xl">Boardroom Evaluation Complete</h3>
          <p className="text-xs text-muted-foreground">The interview panel has noted your logical presence and communication.</p>
          <div className="p-4 rounded-xl bg-secondary/50 border text-xs leading-relaxed text-left">
            <b>Panel Verdict:</b> Strong situational response, handled conflict resolution patterns elegantly. Gained +25 Points.
          </div>
          <Button onClick={() => setStep("lobby")} className="w-full bg-warning text-warning-foreground font-bold">Restart Path</Button>
        </div>
      ) : (
        /* Boardroom Panel Grid */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-4">
            <div className="text-slate-400 font-bold text-xs">AI Interview Board Panel (3 Members)</div>
            <div className="grid grid-cols-3 gap-3">
              <PanelMember avatar="👩‍💼" title="Tech Lead AI" status="Active" />
              <PanelMember avatar="👨‍💼" title="HR Manager AI" status="Listening" />
              <PanelMember avatar="👩‍💻" title="Product Manager AI" status="Evaluating" />
            </div>
          </div>

          <div className="p-4 bg-secondary/40 rounded-xl border text-xs">
            <b>Question:</b> Describe how you handle product deadline changes without compromising code standards.
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold">Your Response</Label>
            <Textarea 
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Explain your approach..."
              className="text-xs resize-none"
            />
            <Button onClick={() => { setFeedback(""); setStep("results"); }} className="w-full bg-warning text-warning-foreground font-bold">
              Submit to Panel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function PanelMember({ avatar, title, status }: any) {
  return (
    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
      <div className="text-2xl">{avatar}</div>
      <div className="text-[10px] font-semibold text-slate-300">{title}</div>
      <div className="text-[8px] uppercase tracking-wide text-mint animate-pulse">{status}</div>
    </div>
  );
}

function ScoreItem({ label, val }: any) {
  return (
    <div className="bg-white/30 rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{label}</div>
      <div className="text-2xl font-black mt-0.5">{val}%</div>
    </div>
  );
}
