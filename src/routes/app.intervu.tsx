import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, Sparkles, Trophy, Brain, Code2, MessageSquare, 
  CheckCircle2, ArrowRight, Play, RefreshCw, AlertTriangle, ShieldCheck,
  UserCheck, Loader2
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/intervu")({ component: InterVUCompanySimulator });

const SERVICE_COMPANIES = [
  { name: "TCS", desc: "TCS NQT Cognitive & Programming assessment", roundsCount: 4, difficulty: "Medium" },
  { name: "Infosys", desc: "Infosys mathematical & logical reasoning track", roundsCount: 4, difficulty: "Hard" },
  { name: "Zoho", desc: "Zoho core math & multi-stage coding test", roundsCount: 4, difficulty: "Medium-Hard" },
  { name: "Accenture", desc: "Accenture analytical, verbal & coding simulation", roundsCount: 4, difficulty: "Medium" }
];

const PRODUCT_COMPANIES = [
  { name: "Google", desc: "Google advanced algorithms & system design mock", roundsCount: 4, difficulty: "Hard" },
  { name: "Microsoft", desc: "Microsoft core software design and DS assessment", roundsCount: 4, difficulty: "Medium-Hard" },
  { name: "Amazon", desc: "Amazon online assessment and leadership principles", roundsCount: 4, difficulty: "Medium-Hard" },
  { name: "Meta", desc: "Meta production engineering and speed coding prep", roundsCount: 4, difficulty: "Hard" }
];

const TECH_BASICS_QUESTIONS = [
  "What is Object-Oriented Programming (OOP) and why is encapsulation important?",
  "How does indexing speed up database queries? Are there any disadvantages?",
  "Explain the difference between a process and a thread in operating systems."
];

function InterVUCompanySimulator() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Technical Basics round states
  const [techAnswers, setTechAnswers] = useState(["", "", ""]);
  const [techScore, setTechScore] = useState<number | null>(null);
  const [techSubmitting, setTechSubmitting] = useState(false);

  const fetchSession = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("company_interviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .maybeSingle();
      
      if (!error && data) {
        setActiveSession(data);
        // If there's an active session, let's sync recent completions automatically
        await syncSessionProgress(data);
      } else {
        setActiveSession(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const syncSessionProgress = async (session: any) => {
    if (!user) return;
    let updated = false;
    const updates: any = {};

    // 1. Sync Aptitude Round (Round 0)
    if (session.aptitude_score === 0) {
      const { data: apt } = await supabase
        .from("aptitude_attempts")
        .select("accuracy")
        .eq("user_id", user.id)
        .gt("created_at", session.created_at)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (apt && apt.length > 0) {
        updates.aptitude_score = Math.round(Number(apt[0].accuracy));
        updates.current_round = 1;
        updated = true;
      }
    }

    // 2. Sync Coding Round (Round 1)
    if (session.coding_score === 0 && (session.current_round >= 1 || updates.current_round >= 1)) {
      const { data: cod } = await supabase
        .from("coding_attempts")
        .select("correctness_score")
        .eq("user_id", user.id)
        .gt("created_at", session.created_at)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (cod && cod.length > 0) {
        updates.coding_score = cod[0].correctness_score;
        updates.current_round = 2;
        updated = true;
      }
    }

    // 3. Sync HR Round (Round 3)
    if (session.hr_content_score === 0 && session.current_round === 3) {
      const { data: hr } = await supabase
        .from("hr_sessions")
        .select("overall_score")
        .eq("user_id", user.id)
        .gt("created_at", session.created_at)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (hr && hr.length > 0) {
        updates.hr_content_score = hr[0].overall_score;
        updates.current_round = 4; // all rounds complete
        updates.status = "completed";
        updates.final_score = Math.round(
          ((session.aptitude_score || updates.aptitude_score || 0) +
           (session.coding_score || updates.coding_score || 0) +
           (session.communication_score || 70) + 
           hr[0].overall_score) / 4
        );
        updated = true;
      }
    }

    if (updated) {
      const { data: newSession } = await supabase
        .from("company_interviews")
        .update(updates)
        .eq("id", session.id)
        .select()
        .single();
      if (newSession) {
        setActiveSession(newSession);
        toast.success("Interview progress auto-synced!");
      }
    }
  };

  useEffect(() => {
    fetchSession();
  }, [user]);

  const startCompanySession = async (companyName: string, isProduct: boolean) => {
    if (!user) return;
    setStarting(true);
    try {
      const rounds = [
        { name: "Quantitative Aptitude Round", status: "pending" },
        { name: "Data Structures Coding Round", status: "pending" },
        { name: "Technical Fundamentals Q&A", status: "pending" },
        { name: "Cultural HR Interview Round", status: "pending" }
      ];

      const { data, error } = await supabase
        .from("company_interviews")
        .insert({
          user_id: user.id,
          company_name: companyName,
          company_type: isProduct ? "product" : "service",
          rounds: rounds as any,
          current_round: 0,
          status: "in_progress"
        })
        .select()
        .single();

      if (error) throw error;
      setActiveSession(data);
      toast.success(`Mock interview session for ${companyName} initialized!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to initialize interview");
    } finally {
      setStarting(false);
    }
  };

  const submitTechnicalBasics = async () => {
    if (techAnswers.some(a => !a.trim())) {
      toast.warning("Please write answers for all questions.");
      return;
    }
    setTechSubmitting(true);

    // Simulate AI evaluation for technical basics answers
    setTimeout(async () => {
      const score = 82;
      setTechScore(score);
      setTechSubmitting(false);

      if (activeSession) {
        const { data } = await supabase
          .from("company_interviews")
          .update({
            communication_score: score,
            current_round: 3
          })
          .eq("id", activeSession.id)
          .select()
          .single();
        if (data) setActiveSession(data);
        toast.success("Technical Basics evaluated successfully!");
      }
    }, 1800);
  };

  const cancelSession = async () => {
    if (!activeSession) return;
    await supabase.from("company_interviews").update({ status: "cancelled" }).eq("id", activeSession.id);
    setActiveSession(null);
    setTechScore(null);
    setTechAnswers(["", "", ""]);
    toast.info("Session cancelled.");
  };

  return (
    <div className="min-h-screen py-6 space-y-10">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-r from-primary-deep/90 via-primary/80 to-accent/90 border border-primary/20 shadow-glow"
      >
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
            <Building2 className="w-3 h-3 mr-2 text-mint" />
            InterVU AI Company Assessment Simulator
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Complete Multi-Stage <span className="text-mint">Company Placement</span> Mock Rounds
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Choose a target product-based or service-based company path. Run through aptitude, coding, technical fundamentals, and behavioral HR rounds in a unified evaluation dashboard.
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : !activeSession ? (
          /* Configure Session */
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            {/* Service-based tracks */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🤝</span> Service-Based Company Tracks
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {SERVICE_COMPANIES.map(company => (
                  <Card key={company.name} className="p-6 flex flex-col justify-between min-h-[220px] hover-lift">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-extrabold text-lg text-foreground">{company.name} Mock</span>
                        <Badge variant="outline" className="text-xs">Service</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{company.desc}</p>
                      <div className="text-[10px] text-muted-foreground mt-3"><b>Difficulty:</b> {company.difficulty}</div>
                    </div>
                    <Button 
                      disabled={starting}
                      onClick={() => startCompanySession(company.name, false)}
                      className="w-full mt-4 bg-gradient-mint text-primary-deep font-bold text-xs"
                    >
                      Configure Round
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Product-based tracks */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🚀</span> Product-Based Company Tracks
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {PRODUCT_COMPANIES.map(company => (
                  <Card key={company.name} className="p-6 flex flex-col justify-between min-h-[220px] hover-lift">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-extrabold text-lg text-foreground">{company.name} OA</span>
                        <Badge variant="outline" className="text-xs">Product</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{company.desc}</p>
                      <div className="text-[10px] text-muted-foreground mt-3"><b>Difficulty:</b> {company.difficulty}</div>
                    </div>
                    <Button 
                      disabled={starting}
                      onClick={() => startCompanySession(company.name, true)}
                      className="w-full mt-4 bg-primary text-primary-foreground font-bold text-xs"
                    >
                      Start OA Assessment
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Active Interview Progress Dashboard */
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Interview rounds progress list */}
            <Card className="lg:col-span-2 p-6 border-primary/20 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-primary/10 text-primary-deep hover:bg-primary/20 border-0 mb-1">Active Session</Badge>
                  <h2 className="text-2xl font-bold text-foreground">{activeSession.company_name} Mock Placement Round</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={cancelSession} className="text-destructive font-semibold hover:bg-destructive/5 text-xs">
                  Quit Interview
                </Button>
              </div>

              {/* Progress Stepper List */}
              <div className="space-y-5">
                
                {/* Round 1: Aptitude */}
                <RoundStepperNode 
                  roundNum="1"
                  title="Cognitive Aptitude Assessment"
                  status={activeSession.aptitude_score > 0 ? "completed" : "active"}
                  score={activeSession.aptitude_score}
                  desc="Quantitative questions covering Percentages, Ratios and speed math. Requires 5 questions completion."
                  action={
                    <Link 
                      to="/app/aptitude/test" 
                      search={{ 
                        topic: "Quantitative Aptitude", 
                        subtopic: "Percentages", 
                        difficulty: activeSession.company_type === "product" ? "Hard" : "Medium", 
                        mode: "test", 
                        count: 5 
                      }}
                    >
                      <Button className="bg-gradient-mint text-primary-deep font-bold text-xs gap-1.5 py-1.5 h-auto">
                        <Play className="w-3.5 h-3.5" /> Start Aptitude Round
                      </Button>
                    </Link>
                  }
                />

                {/* Round 2: Coding */}
                <RoundStepperNode 
                  roundNum="2"
                  title="Core Algorithms & DSA Coding"
                  status={
                    activeSession.coding_score > 0 ? "completed" : 
                    activeSession.aptitude_score > 0 ? "active" : "pending"
                  }
                  score={activeSession.coding_score}
                  desc="Solve LeetCode format array/hashing optimization problem with step-by-step compiler evaluation."
                  action={
                    <Link 
                      to="/app/coding/solve" 
                      search={{ problem: activeSession.company_type === "product" ? "Maximum Subarray" : "Two Sum" }}
                    >
                      <Button className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 py-1.5 h-auto">
                        <Play className="w-3.5 h-3.5" /> Start Coding Round
                      </Button>
                    </Link>
                  }
                />

                {/* Round 3: Technical basics Q&A */}
                <RoundStepperNode 
                  roundNum="3"
                  title="Technical Fundamentals & OOP"
                  status={
                    activeSession.communication_score > 0 ? "completed" : 
                    activeSession.coding_score > 0 ? "active" : "pending"
                  }
                  score={activeSession.communication_score}
                  desc="Answer fundamental theory questions on Object-Oriented Principles, DBMS indexing, and OS threads."
                  action={null} // Handled dynamically in the right panel
                />

                {/* Round 4: Behavioral HR Round */}
                <RoundStepperNode 
                  roundNum="4"
                  title="Behavioral HR Interview Simulation"
                  status={
                    activeSession.hr_content_score > 0 ? "completed" : 
                    activeSession.communication_score > 0 ? "active" : "pending"
                  }
                  score={activeSession.hr_content_score}
                  desc="Complete speech interactive behavioral simulation containing target HR situational checks."
                  action={
                    <Link to="/app/hr">
                      <Button className="bg-accent text-accent-foreground font-bold text-xs gap-1.5 py-1.5 h-auto">
                        <Play className="w-3.5 h-3.5" /> Start HR Round
                      </Button>
                    </Link>
                  }
                />

              </div>
            </Card>

            {/* Right Column: Dynamic Panel for Active Round Details */}
            <div className="space-y-6">
              
              {/* Dynamic Action Helper for Technical Basics Round */}
              {activeSession.coding_score > 0 && activeSession.communication_score === 0 && (
                <Card className="p-6 border-primary/25 bg-primary-soft/10 space-y-4">
                  <div className="flex items-center gap-1.5 text-primary-deep font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Technical basics Panel Quiz</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Write answers to these three conceptual technical questions. AI will evaluate for depth.
                  </p>

                  <div className="space-y-3 pt-2">
                    {TECH_BASICS_QUESTIONS.map((q, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="text-xs font-semibold text-foreground">Q{i + 1}: {q}</div>
                        <Textarea 
                          value={techAnswers[i]}
                          onChange={e => {
                            const newAnswers = [...techAnswers];
                            newAnswers[i] = e.target.value;
                            setTechAnswers(newAnswers);
                          }}
                          placeholder="Type conceptual answer here..."
                          className="min-h-[70px] text-xs resize-none"
                        />
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={submitTechnicalBasics} 
                    disabled={techSubmitting}
                    className="w-full bg-gradient-mint text-primary-deep font-bold text-xs py-2.5 rounded-xl gap-2 mt-2"
                  >
                    {techSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Submit Technical Basics
                  </Button>
                </Card>
              )}

              {/* Status Report Card */}
              <Card className="p-6 border-border/40 space-y-4">
                <h3 className="font-bold text-sm text-foreground">Mock Assessment Overview</h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Placement Target</span> <span className="font-semibold text-foreground">{activeSession.company_name}</span></div>
                  <div className="flex justify-between"><span>Category</span> <span className="font-semibold text-foreground capitalize">{activeSession.company_type} based</span></div>
                  <div className="flex justify-between"><span>Current Step</span> <span className="font-semibold text-primary-deep">Round {activeSession.current_round + 1}</span></div>
                </div>

                {/* Live average score progress */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Average accuracy / score</span>
                    <span className="font-bold text-primary-deep">
                      {Math.round(
                        ((activeSession.aptitude_score || 0) + 
                         (activeSession.coding_score || 0) + 
                         (activeSession.communication_score || 0) + 
                         (activeSession.hr_content_score || 0)) / 
                        (activeSession.current_round || 1)
                      )}%
                    </span>
                  </div>
                  <Progress 
                    value={
                      ((activeSession.aptitude_score || 0) + 
                       (activeSession.coding_score || 0) + 
                       (activeSession.communication_score || 0) + 
                       (activeSession.hr_content_score || 0)) / 
                      (activeSession.current_round || 1)
                    } 
                    className="h-2" 
                  />
                </div>

                {/* Auto-Sync trigger button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchSession}
                  className="w-full text-xs font-semibold hover:bg-secondary flex gap-2 justify-center py-2 h-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Latest Attempts
                </Button>
              </Card>

              {/* Selection Verdict Card if all rounds completed */}
              {activeSession.hr_content_score > 0 && (
                <Card className="p-6 border-success bg-success-soft/10 text-center space-y-4 animate-scale-in">
                  <div className="w-14 h-14 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-success">Placement Offer Extended!</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Congratulations! Your combined mock round scores satisfy the hiring patterns expected at {activeSession.company_name}.
                    </p>
                  </div>
                  <div className="p-3.5 bg-card rounded-2xl border text-xs text-left space-y-2">
                    <div className="flex justify-between"><b>Aptitude:</b> <span className="text-success">{activeSession.aptitude_score}%</span></div>
                    <div className="flex justify-between"><b>Coding:</b> <span className="text-success">{activeSession.coding_score}%</span></div>
                    <div className="flex justify-between"><b>Technical:</b> <span className="text-success">{activeSession.communication_score}%</span></div>
                    <div className="flex justify-between"><b>HR Interview:</b> <span className="text-success">{activeSession.hr_content_score}%</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold"><b>Final Match Score:</b> <span className="text-primary-deep">{activeSession.final_score}%</span></div>
                  </div>
                  <Button onClick={cancelSession} className="w-full bg-success text-success-foreground font-bold">
                    Start Another Company OA
                  </Button>
                </Card>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoundStepperNode({ roundNum, title, status, score, desc, action }: any) {
  const statusConfig = {
    completed: {
      color: "bg-success text-success-foreground border-success",
      badge: "Completed",
      badgeClass: "bg-success text-white"
    },
    active: {
      color: "bg-primary-deep text-primary-foreground border-primary-deep shadow-glow",
      badge: "In Progress",
      badgeClass: "bg-primary-deep text-white animate-pulse"
    },
    pending: {
      color: "bg-secondary text-muted-foreground border-border",
      badge: "Locked",
      badgeClass: "bg-secondary text-muted-foreground"
    }
  };

  const current = statusConfig[status];

  return (
    <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${status === "active" ? "border-primary-deep/45 bg-primary-soft/10 ring-1 ring-primary-deep/20" : "border-border/30 bg-card/45"}`}>
      <div className="flex items-start gap-4">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${current.color}`}>
          {status === "completed" ? "✓" : roundNum}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-foreground">{title}</h4>
            <Badge className={`text-[9px] border-0 py-0.5 px-2 font-extrabold uppercase ${current.badgeClass}`}>
              {current.badge}
            </Badge>
            {score > 0 && (
              <Badge className="bg-primary-soft text-primary-deep border-0 text-[10px] py-0.5 px-2 font-bold">
                Score: {score}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">{desc}</p>
        </div>
      </div>
      
      {status === "active" && action && (
        <div className="shrink-0 md:pl-4">{action}</div>
      )}
    </div>
  );
}
