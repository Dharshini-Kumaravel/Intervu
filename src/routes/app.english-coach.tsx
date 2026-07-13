import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Sparkles, Send, RefreshCw, Languages, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/english-coach")({ component: EnglishCoach });

type ContextKey = "hr" | "tech" | "gd" | "presentation" | "email" | "chat";

const CONTEXTS: Record<ContextKey, { label: string; desc: string }> = {
  hr: { label: "HR Interview 👔", desc: "For general HR questions and discussions" },
  tech: { label: "Technical Interview 💻", desc: "For coding reviews and logic explanations" },
  gd: { label: "Group Discussion 🗣️", desc: "For expressing opinion in a GD session" },
  presentation: { label: "Presentation 📊", desc: "For showcasing slides/projects" },
  email: { label: "Email Writing ✉️", desc: "For formal follow-ups and inquiries" },
  chat: { label: "Team Chat 💬", desc: "For slack or teams chat with colleagues" }
};

const TEMPLATES = [
  { tamil: "Sir enaku konjam time venum", eng: "Excuse me, sir, I would appreciate some additional time to complete the task." },
  { tamil: "Sir tomorrow project run panni kaaturein", eng: "Sir, I will run and demonstrate the project for you tomorrow." },
  { tamil: "Ithula enaku clear ah conceptual idea illa", eng: "I am not completely familiar with this specific concept, but I can walk you through my general understanding." },
  { tamil: "Enga college la network problem iruku", eng: "I apologize, but we are currently facing some connectivity issues at our campus." },
  { tamil: "Naa design side work panna interest ah iruken", eng: "I am highly interested in working on the user interface design aspects of the project." }
];

const TRANSLATION_MOCK: Record<string, Record<ContextKey, string>> = {
  "sir enaku konjam time venum": {
    hr: "Sir, I would appreciate it if you could grant me a brief moment to gather my thoughts.",
    tech: "Excuse me, I would appreciate some additional time to review my code implementation.",
    gd: "If I may add, I think we should take a moment to evaluate the alternative aspects first.",
    presentation: "I would like to request a few extra minutes to set up the presentation layout.",
    email: "Dear Sir, I would be grateful if you could extend the deadline to allow proper completion.",
    chat: "Hey team, I'll need a bit more time to wrap this task up. Thanks for understanding!"
  },
  "sir tomorrow project run panni kaaturein": {
    hr: "Sir, I look forward to presenting a live demonstration of my project tomorrow.",
    tech: "I will deploy the application and run the demo for you tomorrow during our session.",
    gd: "Let's align tomorrow when I run a demonstration of the proposed system.",
    presentation: "I will guide you through the live project demonstration in tomorrow's presentation.",
    email: "Dear Team, I am planning to demonstrate the working project during tomorrow's review meeting.",
    chat: "Hey folks, I will screen-share and walk you all through the working build tomorrow!"
  }
};

function EnglishCoach() {
  const [input, setInput] = useState("");
  const [context, setContext] = useState<ContextKey>("hr");
  const [output, setOutput] = useState("");
  const [translating, setTranslating] = useState(false);
  const [isWavePlaying, setIsWavePlaying] = useState(false);

  const handleTranslate = () => {
    if (!input.trim()) {
      toast.warning("Please enter a Tamil or Tanglish phrase first.");
      return;
    }
    setTranslating(true);
    setTimeout(() => {
      const cleanKey = input.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const matched = TRANSLATION_MOCK[cleanKey];
      if (matched && matched[context]) {
        setOutput(matched[context]);
      } else {
        // Dynamic fallback generation simulating LLM
        const fallbackWordMap: Record<ContextKey, string> = {
          hr: `Regarding your query "${input}", I would express it as: "I have successfully worked on similar areas and look forward to contributing."`,
          tech: `In a technical context for "${input}": "I implemented this functionality using robust algorithms to achieve optimal efficiency."`,
          gd: `In a discussion about "${input}": "I agree with that point, and I believe we should also consider the scalability factor."`,
          presentation: `For your project showcase: "As you can see, this module handles the input flow smoothly."`,
          email: `Subject: Follow-up regarding placement preparation\n\nDear Sir/Madam,\nI am writing to express my interest in preparing for the upcoming rounds.`,
          chat: `Hey team, regarding the topic: "I am actively working on resolving the bottlenecks."`
        };
        setOutput(fallbackWordMap[context]);
      }
      setTranslating(false);
      toast.success("Phrased successfully!");
    }, 900);
  };

  const handleSpeak = () => {
    if (!output) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(output);
      utterance.rate = 0.9; // Speak slightly slower for Tamil medium students to understand clearly
      utterance.onstart = () => setIsWavePlaying(true);
      utterance.onend = () => setIsWavePlaying(false);
      utterance.onerror = () => setIsWavePlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in this browser.");
    }
  };

  const handleTemplateClick = (item: typeof TEMPLATES[0]) => {
    setInput(item.tamil);
    // Auto translate to the currently selected context
    setTranslating(true);
    setTimeout(() => {
      const cleanKey = item.tamil.toLowerCase().trim();
      const matched = TRANSLATION_MOCK[cleanKey];
      if (matched && matched[context]) {
        setOutput(matched[context]);
      } else {
        setOutput(item.eng);
      }
      setTranslating(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-float-up">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center shadow-soft">
            <Languages className="w-6 h-6 text-primary-deep" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI English Coach</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tamil to Professional English converter tailored specifically for placement rounds.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Templates Panel (Left Col) */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-deep" /> Common Examples
          </h2>
          <div className="space-y-2">
            {TEMPLATES.map((t, idx) => (
              <Card 
                key={idx} 
                onClick={() => handleTemplateClick(t)}
                className="p-3.5 bg-card/40 border border-border/30 hover:border-primary/40 hover:shadow-soft cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="text-xs text-primary-deep font-semibold">தமிழ்: {t.tamil}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1 italic">➔ English: {t.eng}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Translation Console (Right 2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Main workspace */}
          <Card className="p-6 bg-card/30 backdrop-blur-lg border border-border/40 rounded-3xl relative overflow-hidden">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <div className="space-y-4">
              {/* Input Area */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Enter Tamil or Tanglish Phrase
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., sir enaku project explain panna dynamic options support iruka..."
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-secondary/50 border border-border/60 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary-deep focus:border-primary-deep resize-none transition-all"
                />
              </div>

              {/* Context Selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Select Target Placement Context
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(CONTEXTS).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setContext(key as ContextKey)}
                      className={`px-3 py-2.5 text-xs text-left rounded-xl border transition-all ${
                        context === key
                          ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold"
                          : "bg-secondary/40 text-foreground border-border/40 hover:border-border"
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[9px] opacity-75 mt-0.5 font-normal truncate">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setInput(""); setOutput(""); }}
                  className="border-border/60 text-xs text-muted-foreground hover:bg-secondary/50"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Clear
                </Button>
                <Button 
                  onClick={handleTranslate} 
                  disabled={translating}
                  size="sm"
                  className="bg-primary-deep text-white hover:opacity-90 text-xs font-semibold px-4"
                >
                  {translating ? (
                    <>Translating...</>
                  ) : (
                    <>
                      Translate to English <Send className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Translation Output Card */}
          <AnimatePresence mode="wait">
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-deep" />
                      <span className="font-bold text-xs uppercase tracking-wider text-primary-deep">
                        AI Placement-Ready Phrasing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSpeak}
                        className="bg-background border-border/60 text-xs hover:bg-secondary/30"
                      >
                        <Volume2 className={`w-4 h-4 mr-1.5 ${isWavePlaying ? "text-primary animate-bounce" : ""}`} />
                        Pronounce
                      </Button>
                    </div>
                  </div>

                  <p className="text-lg font-medium text-foreground leading-relaxed">
                    "{output}"
                  </p>

                  {/* Waveform visual animation */}
                  {isWavePlaying && (
                    <div className="flex items-center gap-0.5 mt-4 justify-start h-5">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1].map((val, idx) => (
                        <motion.span
                          key={idx}
                          animate={{ height: [4, val * 3, 4] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: idx * 0.03 }}
                          className="w-1 bg-primary-deep rounded-full"
                          style={{ height: "4px" }}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">Slow pronunciation speed active</span>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-background/50 rounded-xl border border-border/30">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Placement Tip:</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Say this statement with confidence. Maintain steady eye contact and avoid rushed speed. Practicing this 3 times increases muscle memory.
                    </p>
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
