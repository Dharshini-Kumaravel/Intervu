import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Trophy, Video, Volume2, Mic, MicOff, ArrowRight, CheckCircle2, 
  HelpCircle, UserCheck, ShieldAlert, Brain, Monitor, Eye, Camera, CameraOff, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/intervu")({ component: InterVUPlatform });

type InterviewType = "hr" | "technical" | "behavioral";

const MOCK_QUESTIONS: Record<InterviewType, string[]> = {
  hr: [
    "Tell me about yourself and your background.",
    "Why do you want to join our company?",
    "Where do you see yourself in five years?"
  ],
  technical: [
    "What is the difference between an Array and a Linked List?",
    "Explain the concept of OOP Encapsulation.",
    "How does indexing improve database query performance?"
  ],
  behavioral: [
    "Describe a time when you faced a conflict in a project team and how you resolved it.",
    "Tell me about a major mistake you made and what you learned from it.",
    "How do you handle working under tight placement deadlines?"
  ]
};

function InterVUPlatform() {
  const [activeMode, setActiveMode] = useState<"smart" | "immersive" | "virtual" | null>(null);
  
  // Smart Mode States
  const [smartStep, setSmartStep] = useState<"setup" | "interview" | "report">("setup");
  const [smartType, setSmartType] = useState<InterviewType>("hr");
  const [smartQIdx, setSmartQIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [smartReport, setSmartReport] = useState<any>(null);
  
  // Immersive Mode States
  const [immersiveStep, setImmersiveStep] = useState<"setup" | "call" | "report">("setup");
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [chatLog, setChatLog] = useState<{ sender: "ai" | "user"; text: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Virtual VR Mode States
  const [vrStep, setVrStep] = useState<"reception" | "waiting" | "room" | "panel" | "report">("reception");
  const [vrLogs, setVrLogs] = useState<string[]>([]);
  
  // Global Audio feedback state
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Trigger TTS question
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartSmart = () => {
    setSmartStep("interview");
    setSmartQIdx(0);
    setVoiceText("");
    setSmartReport(null);
    speakText(MOCK_QUESTIONS[smartType][0]);
  };

  const handleVoiceInputSimulate = () => {
    if (isRecording) {
      setIsRecording(false);
      // Populate text
      if (smartType === "hr") {
        setVoiceText("Hello, my name is Karthik, I did CSE in my college. I have completed React and MongoDB projects and am looking for placement.");
      } else {
        setVoiceText("Encapsulation is like hiding variables in a class. We make variables private and use public getters and setters to protect data.");
      }
      toast.success("Voice answer captured!");
    } else {
      setVoiceText("");
      setIsRecording(true);
      toast.info("Recording voice response... Speak now.");
    }
  };

  const handleSmartSubmit = () => {
    if (!voiceText.trim()) {
      toast.warning("Please record your voice response first.");
      return;
    }
    
    // Simulate AI feedback review
    const mockReport = {
      grammar: 88,
      fluency: 82,
      accuracy: smartType === "technical" ? 92 : 85,
      confidence: 90,
      fillers: ["Uh", "Umm", "like"],
      speed: "120 WPM (Good)",
      polished: smartType === "hr"
        ? "Good morning. My name is Karthik, and I am pursuing my Bachelor's degree in Computer Science. I specialize in web technologies and database systems. Over the past year, I collaborated in team projects, creating full-stack React portals. I am eager to apply my technical skills in a professional engineering role at your organization."
        : "Encapsulation is a core OOP concept where variables and methods are wrapped inside a single unit or class. By declaring fields private and exposing them only through public getter and setter methods, we enforce data hiding and safeguard system integrity."
    };
    
    setSmartReport(mockReport);
    setSmartStep("report");
    toast.success("Response reviewed successfully!");
  };

  // Immersive Camera flow
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          toast.error("Webcam access denied. Displaying static simulation.");
          setHasCameraAccess(false);
        });
    } else if (!cameraActive && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [cameraActive]);

  const handleStartImmersive = () => {
    setImmersiveStep("call");
    setCameraActive(true);
    setHasCameraAccess(true);
    const initialQ = "Welcome to your mock interview session. Let's start. Tell me about your main skills and database interests.";
    setChatLog([{ sender: "ai", text: initialQ }]);
    speakText(initialQ);
  };

  const handleImmersiveReplySimulate = () => {
    const userAnswers = [
      "I am strong in Java, SQL, and web development. I built React web apps with Node.js.",
      "Yes, my project handles data indexing in MongoDB to optimize queries by thirty percent.",
      "Thank you for this feedback. I will continue to practice my speaking pace."
    ];
    
    const nextAiQuestions = [
      "Excellent. How do you handle schema updates in database tables?",
      "Perfect. We are done with the round. I'll prepare your analytical report shortly."
    ];
    
    const currentCount = chatLog.filter(c => c.sender === "user").length;
    if (currentCount >= userAnswers.length) {
      setImmersiveStep("report");
      setCameraActive(false);
      return;
    }
    
    const newLog = [...chatLog, { sender: "user" as const, text: userAnswers[currentCount] }];
    setChatLog(newLog);
    
    if (currentCount < nextAiQuestions.length) {
      setTimeout(() => {
        const nextQ = nextAiQuestions[currentCount];
        setChatLog(prev => [...prev, { sender: "ai" as const, text: nextQ }]);
        speakText(nextQ);
      }, 1000);
    } else {
      setTimeout(() => {
        setImmersiveStep("report");
        setCameraActive(false);
      }, 1200);
    }
  };

  // VR Flow actions
  const addVrLog = (log: string) => {
    setVrLogs(prev => [log, ...prev]);
  };

  const handleVrStep = (next: typeof vrStep, logText: string) => {
    setVrStep(next);
    addVrLog(logText);
  };

  const resetAll = () => {
    setActiveMode(null);
    setSmartStep("setup");
    setImmersiveStep("setup");
    setVrStep("reception");
    setVrLogs([]);
    setCameraActive(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 animate-float-up">
      {/* Header */}
      <div className="border-b border-border/40 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center shadow-soft">
            <Video className="w-6 h-6 text-primary-deep" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">InterVU AI Interview Platform</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Practice placement interviews with three progression modes: Voice, Video, and Virtual VR.
            </p>
          </div>
        </div>
        {activeMode && (
          <Button variant="outline" size="sm" onClick={resetAll}>
            ➔ Selection Menu
          </Button>
        )}
      </div>

      {/* Mode Selection Menu */}
      {!activeMode && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mode 1: Smart Mode */}
            <Card className="p-6 bg-card/40 border border-border/40 rounded-3xl hover:border-primary/40 hover:shadow-soft transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary-deep border-0 font-mono text-[9px] px-2 py-0.5">Mode 1</Badge>
                  <span className="text-2xl group-hover:scale-110 transition-transform">🟢</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Smart Mode</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Practice with AI, Anytime.</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  AI interviewer asks question in audio. Record your response and get scored instantly on grammar, confidence, fluency, and fillers.
                </p>
              </div>
              <Button 
                onClick={() => setActiveMode("smart")} 
                className="w-full mt-6 bg-secondary hover:bg-primary/20 text-foreground group-hover:bg-primary group-hover:text-primary-foreground font-semibold text-xs h-10 rounded-xl"
              >
                Launch Smart Mode
              </Button>
            </Card>

            {/* Mode 2: Immersive Mode */}
            <Card className="p-6 bg-card/40 border border-border/40 rounded-3xl hover:border-primary/40 hover:shadow-soft transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary-deep border-0 font-mono text-[9px] px-2 py-0.5">Mode 2</Badge>
                  <span className="text-2xl group-hover:scale-110 transition-transform">💻</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Immersive Mode</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Experience an Online Interview.</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Simulates a Zoom/Google Meet video call with an active AI Interviewer Avatar. Test camera focus, technical logic, and live responses.
                </p>
              </div>
              <Button 
                onClick={() => setActiveMode("immersive")} 
                className="w-full mt-6 bg-secondary hover:bg-primary/20 text-foreground group-hover:bg-primary group-hover:text-primary-foreground font-semibold text-xs h-10 rounded-xl"
              >
                Launch Immersive Mode
              </Button>
            </Card>

            {/* Mode 3: Virtual Mode */}
            <Card className="p-6 bg-card/40 border border-border/40 rounded-3xl hover:border-primary/40 hover:shadow-soft transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-primary/20 text-primary-deep border-0 font-mono text-[9px] px-2 py-0.5">Mode 3</Badge>
                  <span className="text-2xl group-hover:scale-110 transition-transform">🥽</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Virtual Mode</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Feel the Real Interview.</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Walk through a 3D simulated corporate office: receptionist check-in, waiting lobby, boardroom panel panel, and body gesture report.
                </p>
              </div>
              <Button 
                onClick={() => setActiveMode("virtual")} 
                className="w-full mt-6 bg-secondary hover:bg-primary/20 text-foreground group-hover:bg-primary group-hover:text-primary-foreground font-semibold text-xs h-10 rounded-xl"
              >
                Launch VR Simulation
              </Button>
            </Card>
          </div>

          {/* Interactive Progression Roadmap Info */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl">
            <h4 className="font-bold text-sm text-primary-deep uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-deep" /> InterVU Progression Evolution
            </h4>
            <div className="grid sm:grid-cols-4 gap-4 items-center">
              <div className="bg-card/60 p-4 rounded-2xl border border-border/40 text-center">
                <div className="text-lg font-bold text-primary-deep">1. Smart Mode</div>
                <div className="text-[10px] text-muted-foreground mt-1">Voice practice to build confidence</div>
              </div>
              <div className="text-center text-muted-foreground font-mono hidden sm:block">➔</div>
              <div className="bg-card/60 p-4 rounded-2xl border border-border/40 text-center">
                <div className="text-lg font-bold text-primary-deep">2. Immersive</div>
                <div className="text-[10px] text-muted-foreground mt-1">AI Video Room standard interviews</div>
              </div>
              <div className="text-center text-muted-foreground font-mono hidden sm:block">➔</div>
              <div className="bg-card/60 p-4 rounded-2xl border border-border/40 text-center">
                <div className="text-lg font-bold text-primary-deep">3. Virtual VR</div>
                <div className="text-[10px] text-muted-foreground mt-1">Lobby & panel gesture feedback</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* active modes containers */}
      <AnimatePresence mode="wait">
        {/* SMART MODE */}
        {activeMode === "smart" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
            {smartStep === "setup" && (
              <Card className="p-6 space-y-5 bg-card/40 border border-border/40 rounded-3xl">
                <div>
                  <h2 className="text-xl font-bold">🟢 Smart Mode Configuration</h2>
                  <p className="text-xs text-muted-foreground mt-1">Setup your AI voice round parameters.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Interview Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["hr", "technical", "behavioral"] as InterviewType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setSmartType(t)}
                        className={`p-3 rounded-xl border text-sm font-semibold capitalize transition-all ${smartType === t ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/40 text-foreground border-border/40"}`}
                      >
                        {t} Round
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleStartSmart} className="w-full bg-gradient-mint text-primary-deep font-semibold">
                  Start voice round <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Card>
            )}

            {smartStep === "interview" && (
              <Card className="p-6 bg-card/30 border border-border/40 rounded-3xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-border/30">
                  <Badge className="bg-primary/20 text-primary-deep border-0 capitalize">{smartType} Round</Badge>
                  <span className="text-xs text-muted-foreground font-mono">Question {smartQIdx + 1} of 3</span>
                </div>

                {/* AI Text Question Box */}
                <div className="p-5 bg-secondary/50 border border-border/30 rounded-2xl space-y-3">
                  <div className="text-[10px] text-primary-deep font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> AI Interviewer Voice
                  </div>
                  <p className="text-lg font-bold leading-relaxed text-foreground">
                    "{MOCK_QUESTIONS[smartType][smartQIdx]}"
                  </p>
                  {isAiSpeaking && (
                    <div className="flex gap-0.5 items-center">
                      {[1, 2, 3, 2, 1, 2, 3, 2, 1].map((v, idx) => (
                        <motion.span
                          key={idx}
                          animate={{ height: [3, v * 4, 3] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.05 }}
                          className="w-0.5 bg-primary-deep"
                          style={{ height: "3px" }}
                        />
                      ))}
                      <span className="text-[9px] text-muted-foreground ml-2">Speaking...</span>
                    </div>
                  )}
                </div>

                {/* Voice Input Box */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Your Recorded Answer</label>
                  <textarea
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    placeholder="Click the microphone to record your voice answer..."
                    className="w-full min-h-[100px] p-4 bg-secondary/40 border border-border/50 rounded-2xl text-sm focus:outline-none text-foreground placeholder:text-muted-foreground/60 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handleVoiceInputSimulate}
                      className={`h-11 rounded-xl px-4 text-xs ${isRecording ? "bg-red-500 text-white animate-pulse-ring" : ""}`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 mr-1.5" /> : <Mic className="w-4 h-4 mr-1.5 text-primary-deep" />}
                      {isRecording ? "Stop Recording" : "Record voice answer"}
                    </Button>
                    
                    <Button onClick={handleSmartSubmit} className="bg-primary-deep text-white font-semibold text-xs h-10 px-5 rounded-xl">
                      Submit answer ➔
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {smartStep === "report" && smartReport && (
              <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl space-y-6">
                <div className="text-center pb-4 border-b border-border/30">
                  <Trophy className="w-10 h-10 text-warning mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground">Voice round results</h2>
                  <p className="text-xs text-muted-foreground">Grammar, Fluency, and filler evaluation.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ScoreBlock label="Grammar Score" value={smartReport.grammar} />
                  <ScoreBlock label="Fluency Score" value={smartReport.fluency} />
                  <ScoreBlock label="Technical Content" value={smartReport.accuracy} />
                  <ScoreBlock label="Confidence" value={smartReport.confidence} />
                </div>

                <div className="bg-card/60 p-4 rounded-2xl border border-border/40 grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Filler words used</div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {smartReport.fillers.map((f: string) => (
                        <Badge key={f} className="bg-destructive/15 text-destructive-foreground hover:bg-destructive/20 border-0 font-mono text-[10px]">
                          "{f}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Speaking speed</div>
                    <div className="font-semibold text-sm text-foreground mt-2">{smartReport.speed}</div>
                  </div>
                </div>

                <div className="bg-card/80 p-5 rounded-2xl border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-primary-deep uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary-deep" /> Suggested Professional Answer
                    </h4>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary-deep p-0" onClick={() => speakText(smartReport.polished)}>
                      <Volume2 className="w-4 h-4 mr-1" /> Pronounce suggestion
                    </Button>
                  </div>
                  <p className="text-xs italic text-foreground leading-relaxed">
                    "{smartReport.polished}"
                  </p>
                </div>

                <Button onClick={() => setSmartStep("setup")} className="w-full bg-secondary hover:bg-primary/20 text-foreground font-semibold">
                  Practice again
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* IMMERSIVE MODE */}
        {activeMode === "immersive" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto space-y-6">
            {immersiveStep === "setup" && (
              <Card className="p-6 space-y-5 bg-card/40 border border-border/40 rounded-3xl">
                <div>
                  <h2 className="text-xl font-bold">💻 Immersive Mode Configuration</h2>
                  <p className="text-xs text-muted-foreground mt-1">This mode simulates a direct online Google Meet call.</p>
                </div>
                <div className="p-4 bg-primary-soft/50 rounded-2xl border border-primary/20 space-y-2">
                  <div className="text-xs font-semibold text-primary-deep uppercase flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> Camera check requested
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Allow camera access to display your live feed during the mock call to simulate eye contact feedback.
                  </p>
                </div>
                <Button onClick={handleStartImmersive} className="w-full bg-gradient-mint text-primary-deep font-semibold">
                  Launch Google Meet Room <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Card>
            )}

            {immersiveStep === "call" && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Meeting call interface */}
                <div className="md:col-span-2 space-y-4">
                  {/* Virtual Video grid */}
                  <div className="grid grid-cols-2 gap-4 h-[300px]">
                    {/* Panel 1: AI Interviewer */}
                    <div className="bg-slate-950 rounded-2xl overflow-hidden relative border border-border/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
                        <Sparkles className="w-8 h-8 text-primary-deep animate-float-soft" />
                      </div>
                      <Badge className="absolute bottom-2 left-2 bg-black/60 border-0 font-mono text-[9px]">
                        AI Interviewer (Avatar)
                      </Badge>
                    </div>

                    {/* Panel 2: User Feed */}
                    <div className="bg-slate-950 rounded-2xl overflow-hidden relative border border-border/40 flex items-center justify-center">
                      {hasCameraAccess ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <CameraOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <div className="text-xs">Camera Feed disabled</div>
                        </div>
                      )}
                      <Badge className="absolute bottom-2 left-2 bg-black/60 border-0 font-mono text-[9px]">
                        You (Student)
                      </Badge>
                    </div>
                  </div>

                  {/* Reply Action console */}
                  <Card className="p-4 bg-card/40 border border-border/40 rounded-2xl flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Click right to simulate voice replies during call.
                    </span>
                    <Button onClick={handleImmersiveReplySimulate} className="bg-primary-deep text-white font-semibold text-xs h-9 px-4 rounded-xl">
                      Simulate voice reply ➔
                    </Button>
                  </Card>
                </div>

                {/* Dialog Chat log panel */}
                <Card className="p-5 bg-card/30 border border-border/40 rounded-3xl flex flex-col justify-between h-[360px]">
                  <div className="overflow-y-auto space-y-3 flex-1 pr-1 scrollbar-thin">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Meeting Chat log</div>
                    {chatLog.map((c, i) => (
                      <div key={i} className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${c.sender === "ai" ? "bg-primary-soft text-primary-deep border border-primary/10 mr-auto" : "bg-secondary text-foreground ml-auto"}`}>
                        <div className="font-bold uppercase text-[8px] opacity-75 mb-0.5">{c.sender === "ai" ? "AI Panel" : "You"}</div>
                        "{c.text}"
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setImmersiveStep("report")} className="w-full text-destructive text-xs border-t border-border/30 pt-3 mt-3 rounded-none hover:bg-transparent">
                    End Call & Generate report
                  </Button>
                </Card>
              </div>
            )}

            {immersiveStep === "report" && (
              <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl space-y-6">
                <div className="text-center pb-4 border-b border-border/30">
                  <UserCheck className="w-10 h-10 text-success mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-foreground">AI Meeting Performance</h2>
                  <p className="text-xs text-muted-foreground">Detailed metrics from video round session.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreBlock label="Communication" value={86} />
                  <ScoreBlock label="Confidence" value={88} />
                  <ScoreBlock label="Eye Contact" value={78} />
                  <ScoreBlock label="Resume depth" value={92} />
                </div>

                <div className="p-4 bg-card/60 rounded-2xl border border-border/40 space-y-3">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-primary-deep" /> AI camera posture suggestions
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 pl-1">
                    <li>• Keep your chin parallel to camera height to maintain a confident looking gesture.</li>
                    <li>• Avoid looking down at keyboard during technical coding discussions.</li>
                    <li>• Good facial smile metric recorded (84% friendliness index).</li>
                  </ul>
                </div>

                <Button onClick={() => setImmersiveStep("setup")} className="w-full bg-secondary hover:bg-primary/20 text-foreground font-semibold">
                  Start new call round
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* VIRTUAL VR MODE */}
        {activeMode === "virtual" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* VR Walkthrough Scene (Left 2 Cols) */}
              <div className="md:col-span-2 space-y-4">
                <Card className="p-6 bg-slate-950 border border-border/40 rounded-3xl h-[340px] relative overflow-hidden flex flex-col justify-between text-white">
                  {/* Decorative background lights simulating VR environment */}
                  <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <Badge className="bg-primary-deep text-white border-0 font-mono text-[9px] px-2 py-0.5">
                      VR Headset Simulation Mode
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">Environment: Corporate Office</span>
                  </div>

                  {/* Rendering specific environment */}
                  <div className="text-center space-y-4 my-auto relative">
                    <AnimatePresence mode="wait">
                      {vrStep === "reception" && (
                        <motion.div key="reception" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                          <span className="text-5xl">🏢</span>
                          <h3 className="text-xl font-bold">1. Reception area check-in</h3>
                          <p className="text-xs text-slate-300 max-w-sm mx-auto">
                            "Please swipe your placement badge and verify your candidate register profile."
                          </p>
                          <Button size="sm" className="bg-primary-deep text-white border-0 mt-4 text-xs h-9 rounded-xl" onClick={() => handleVrStep("waiting", "Checked in at reception desk. Swiped ID badge.")}>
                            Proceed to waiting lobby ➔
                          </Button>
                        </motion.div>
                      )}

                      {vrStep === "waiting" && (
                        <motion.div key="waiting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                          <span className="text-5xl">🛋️</span>
                          <h3 className="text-xl font-bold">2. Waiting lobby hall</h3>
                          <p className="text-xs text-slate-300 max-w-sm mx-auto">
                            "Candidates, please keep your files ready. The AI interview panel will call your name."
                          </p>
                          <Button size="sm" className="bg-primary-deep text-white border-0 mt-4 text-xs h-9 rounded-xl" onClick={() => handleVrStep("room", "Entered corporate waiting lobby. Ready candidate profiles.")}>
                            Proceed to Interview Room ➔
                          </Button>
                        </motion.div>
                      )}

                      {vrStep === "room" && (
                        <motion.div key="room" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                          <span className="text-5xl">🚪</span>
                          <h3 className="text-xl font-bold">3. Entering HR cabin</h3>
                          <p className="text-xs text-slate-300 max-w-sm mx-auto">
                            "Knock and enter. Sit straight facing the AI Panel interview board."
                          </p>
                          <Button size="sm" className="bg-primary-deep text-white border-0 mt-4 text-xs h-9 rounded-xl" onClick={() => handleVrStep("panel", "Entered HR Interview room. Seated facing panel.")}>
                            Sit facing AI Panel ➔
                          </Button>
                        </motion.div>
                      )}

                      {vrStep === "panel" && (
                        <motion.div key="panel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                          <span className="text-5xl">👨‍💼👩‍💼👨‍💻</span>
                          <h3 className="text-xl font-bold">4. AI Panel Interview</h3>
                          <p className="text-xs text-slate-300 max-w-sm mx-auto">
                            The panel is analyzing your hand tracking, eye contact focus, and speech parameters...
                          </p>
                          <Button size="sm" className="bg-success text-success-foreground border-0 mt-4 text-xs h-9 rounded-xl" onClick={() => handleVrStep("report", "Answered panel questions. VR metrics complete.")}>
                            End Interview & Get VR metrics ➔
                          </Button>
                        </motion.div>
                      )}

                      {vrStep === "report" && (
                        <motion.div key="report" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                          <span className="text-5xl">🏆</span>
                          <h3 className="text-xl font-bold">VR Placement Readiness Scored</h3>
                          <p className="text-xs text-slate-300 max-w-sm mx-auto">
                            Hand gesture: Stable (82%) · Posture: Neutral (90%) · Gaze: Professional (80%).
                          </p>
                          <Button size="sm" variant="outline" className="text-white border-white/20 mt-4 text-xs h-9 rounded-xl" onClick={() => { setVrStep("reception"); setVrLogs([]); }}>
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restart Simulation
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono text-center">
                    VR Headset telemetry tracking is active.
                  </div>
                </Card>
              </div>

              {/* VR Event Logger (Right 1 Col) */}
              <Card className="p-5 bg-card/30 border border-border/40 rounded-3xl h-[340px] flex flex-col">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">VR Event Telemetry</div>
                <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 scrollbar-thin text-xs text-muted-foreground">
                  {vrLogs.length === 0 ? (
                    <div className="text-center py-12 italic">Waiting for check-in to trace events...</div>
                  ) : (
                    vrLogs.map((l, i) => (
                      <div key={i} className="p-2 bg-secondary/50 border border-border/30 rounded-xl leading-relaxed flex items-start gap-1.5">
                        <span className="text-primary-deep font-bold font-mono">›</span>
                        <span>{l}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreBlock({ label, value }: any) {
  return (
    <div className="p-4 rounded-2xl bg-card/50 border border-border/40 text-center shadow-soft">
      <div className="text-2xl font-bold font-mono text-primary-deep">{value}%</div>
      <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wider leading-tight">
        {label}
      </div>
      <Progress value={value} className="h-1 mt-2.5" />
    </div>
  );
}
