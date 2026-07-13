import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Sparkles, Trophy, Award, MessageSquare, AlertCircle, RefreshCw, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/conversation-practice")({ component: ConversationPractice });

type QuestionPrompt = {
  id: string;
  question: string;
  hint: string;
  mockAnswers: Record<string, {
    grammar: number;
    confidence: number;
    pronunc: number;
    corrections: string[];
    polished: string;
  }>;
};

const PROMPTS: QuestionPrompt[] = [
  {
    id: "self_intro",
    question: "Introduce yourself. Tell me about your background and interests.",
    hint: "Talk about your name, department, coding interests, and keep it under 1 minute.",
    mockAnswers: {
      "default": {
        grammar: 84,
        confidence: 90,
        pronunc: 86,
        corrections: [
          "Avoid using local fillers like 'ahm' repeatedly.",
          "Change 'I did my project in React' to 'I developed a React application' for stronger impact.",
          "Keep steady pitch when speaking about college CGPA."
        ],
        polished: "Good morning. My name is Karthik, and I am pursuing my Bachelor's degree in Computer Science. I specialize in web technologies, particularly React.js and databases. Over the past year, I built an automated portal that helps students find placement materials, which improved my team collaboration skills. I am keen to apply my technical skills to a dynamic engineering role in your organization."
      }
    }
  },
  {
    id: "project_details",
    question: "Tell me about your final year project. What was your role?",
    hint: "Explain the main problem, tech stack, and your specific coding contribution.",
    mockAnswers: {
      "default": {
        grammar: 82,
        confidence: 88,
        pronunc: 80,
        corrections: [
          "Say 'The database architecture consists of...' instead of 'Database naanga MongoDB use ponom'.",
          "Pronounce 'Scalable' as 'Skay-luh-buhl' instead of 'Scal-able'.",
          "Explain your individual role first before describing the overall project."
        ],
        polished: "For my final year project, I developed an AI-based system to detect traffic anomalies. We utilized React for the frontend interface and Node.js with MongoDB for backend processing. As the lead database designer, I optimized our MongoDB queries, which reduced latency by twenty percent. This project taught me how to manage real-time databases and work in agile environments."
      }
    }
  }
];

function ConversationPractice() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isWavePlaying, setIsWavePlaying] = useState(false);

  const activePrompt = PROMPTS[activeIdx];

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate input text capture
      setAnswerText("Hello, my name is Karthik... I am from Tamil medium background but I learned React and did college project. I want to improve communication and get placed.");
      toast.success("Speech captured successfully!");
    } else {
      setAnswerText("");
      setEvaluation(null);
      setIsRecording(true);
      toast.info("Listening... Speak clearly into your mic.");
    }
  };

  const handleEvaluate = () => {
    if (!answerText.trim()) {
      toast.warning("Please type or speak your response first.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Return evaluation
      setEvaluation(activePrompt.mockAnswers["default"]);
      setLoading(false);
      toast.success("AI Evaluation complete!");
    }, 1100);
  };

  const handleSpeakPolished = () => {
    if (!evaluation?.polished) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(evaluation.polished);
      utterance.rate = 0.85; // Slow down rate slightly for easy comprehension
      utterance.onstart = () => setIsWavePlaying(true);
      utterance.onend = () => setIsWavePlaying(false);
      utterance.onerror = () => setIsWavePlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech playback not supported in this browser.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-float-up">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center shadow-soft">
            <Mic className="w-6 h-6 text-primary-deep" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Speech Practice</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Practice speaking for placement interviews. Get instant AI score, grammar reports, and pronunciation coaching.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Prompts list (Left Col) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Select Interview Prompt
          </h2>
          <div className="space-y-2">
            {PROMPTS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => { setActiveIdx(idx); setEvaluation(null); setAnswerText(""); }}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  activeIdx === idx
                    ? "bg-primary/20 border-primary shadow-soft"
                    : "bg-card/40 border-border/40 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-deep" />
                  <span className="font-bold text-xs text-primary-deep uppercase">Prompt {idx + 1}</span>
                </div>
                <div className="font-semibold text-sm text-foreground mt-2 line-clamp-2">{p.question}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Console Workspace (Right 2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-card/30 backdrop-blur-lg border border-border/40 rounded-3xl relative overflow-hidden">
            <div className="space-y-4">
              {/* Active Prompt box */}
              <div className="p-4 bg-primary-soft/40 border border-primary/20 rounded-2xl">
                <span className="text-[10px] bg-primary-deep text-white font-bold px-1.5 py-0.5 rounded uppercase">AI Question</span>
                <p className="font-bold text-base text-foreground mt-2 leading-relaxed">
                  "{activePrompt.question}"
                </p>
                <div className="text-xs text-muted-foreground mt-2 italic">
                  💡 Hint: {activePrompt.hint}
                </div>
              </div>

              {/* Input Area */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Your Answer (Type or speak)
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Click the mic below and start speaking, or type your response directly here..."
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-secondary/50 border border-border/60 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary-deep focus:border-primary-deep resize-none transition-all"
                />
              </div>

              {/* Mic Controls & Evaluation Action */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMicToggle}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? "bg-red-500 text-white animate-pulse-ring shadow-glow"
                        : "bg-secondary hover:bg-border text-foreground"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-primary-deep" />}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {isRecording ? "Recording active... Speak now." : "Click microphone to start voice answer"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleEvaluate}
                    disabled={loading || !answerText.trim()}
                    className="bg-primary-deep text-white hover:opacity-90 font-semibold px-4 text-xs h-10 rounded-xl"
                  >
                    {loading ? "Analyzing..." : "Evaluate Answer 📈"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Evaluation Report */}
          <AnimatePresence>
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-primary/10 blur-2xl" />

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-warning" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary-deep">AI Speech Scorecard</span>
                    </div>
                    <Badge className="bg-primary-deep text-white border-0 text-[10px]">Evaluation Complete</Badge>
                  </div>

                  {/* Score rings */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { l: "Grammar & Vocab", v: evaluation.grammar, color: "text-blue-500" },
                      { l: "Fluency & Pronunc", v: evaluation.pronunc, color: "text-green-500" },
                      { l: "Confidence", v: evaluation.confidence, color: "text-purple-500" }
                    ].map((score, sIdx) => (
                      <div key={sIdx} className="bg-background/40 p-4 rounded-2xl border border-border/30 text-center">
                        <div className={`text-2xl font-bold font-mono ${score.color}`}>{score.v}%</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wide leading-tight">
                          {score.l}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Corrections / Tips */}
                  <div className="space-y-3 mb-6 bg-background/50 p-4 rounded-2xl border border-border/30">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-warning" /> Areas for Improvement
                    </h4>
                    <ul className="space-y-2 pl-1">
                      {evaluation.corrections.map((tip: string, idx: number) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary font-bold">↳</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Polished Version */}
                  <div className="space-y-3 bg-secondary/40 p-5 rounded-2xl border border-border/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-primary-deep uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-primary-deep" /> Polished English Draft
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSpeakPolished}
                        className="bg-background border-border/60 text-xs py-1 h-7"
                      >
                        <Volume2 className={`w-3.5 h-3.5 mr-1 ${isWavePlaying ? "text-primary animate-bounce" : ""}`} />
                        Listen
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-foreground leading-relaxed italic">
                      "{evaluation.polished}"
                    </p>

                    {/* Waveform for playback */}
                    {isWavePlaying && (
                      <div className="flex items-center gap-0.5 mt-3 h-4">
                        {[1, 2, 3, 2, 1, 2, 3, 2, 1, 2, 3, 2, 1].map((v, i) => (
                          <motion.span
                            key={i}
                            animate={{ height: [3, v * 3.5, 3] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.04 }}
                            className="w-0.5 bg-primary-deep"
                            style={{ height: "3px" }}
                          />
                        ))}
                        <span className="text-[9px] text-muted-foreground ml-2">Native English speed feedback</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
