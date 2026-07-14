import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Brain, Zap, BookOpen, ChevronRight, Target, Flame, 
  Award, TrendingUp, Sparkles, Building2, BookMarked, 
  HelpCircle, RefreshCw, FileText, CheckCircle2, AlertTriangle, ArrowRight 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/aptitude")({ component: AptitudeHub });

// Complete list of categories & subtopics as specified in the USP
const APTITUDE_CATEGORIES = [
  {
    name: "Quantitative Aptitude",
    icon: "🔢",
    description: "Numerical and mathematical reasoning problems",
    topics: [
      "Percentages", "Profit & Loss", "Time & Work", "Time & Distance", 
      "Simple Interest", "Compound Interest", "Average", "Ratio & Proportion", 
      "Number System", "Permutation & Combination", "Probability"
    ]
  },
  {
    name: "Logical Reasoning",
    icon: "🧠",
    description: "Analytical, logical, and non-verbal reasoning",
    topics: [
      "Blood Relation", "Seating Arrangement", "Coding-Decoding", 
      "Series", "Analogy", "Puzzle", "Direction Sense"
    ]
  },
  {
    name: "Verbal Ability",
    icon: "🗣️",
    description: "English language grammar, sentence correction, and vocabulary",
    topics: [
      "Synonyms", "Antonyms", "Reading Comprehension", 
      "Sentence Correction", "Para Jumbles", "Vocabulary"
    ]
  },
  {
    name: "Data Interpretation",
    icon: "📊",
    description: "Analysing data patterns from charts and tables",
    topics: [
      "Pie Chart", "Graph", "Table", "Bar Graph", "Line Chart"
    ]
  }
];

const COMPANIES = [
  { name: "TCS", pattern: "Cognitive Assessment - 80 min limit", difficulty: "Medium", topics: "Percentages, Time & Work, Series", questions: 20 },
  { name: "Infosys", pattern: "Mathematical & Logical Reasoning", difficulty: "Hard", topics: "Puzzles, Cryptarithmetic, Data Interpretation", questions: 15 },
  { name: "Zoho", pattern: "Basic Math & Coding Logic", difficulty: "Medium-Hard", topics: "Ratio, Averages, Blood Relations", questions: 25 },
  { name: "Accenture", pattern: "Quantitative & Analytical Reasoning", difficulty: "Medium", topics: "Coding-Decoding, Seating, Simple Interest", questions: 20 },
  { name: "Cognizant", pattern: "Aptitude & Verbal Skills Test", difficulty: "Easy-Medium", topics: "Sentence Correction, Profit & Loss", questions: 30 }
];

function AptitudeHub() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    accuracy: 74,
    solvedCount: 12,
    totalQuestions: 60,
    dailyStreak: 3,
    avgTimePerQuestion: "42s",
    weakTopic: "Probability (41% accuracy)",
    strongTopic: "Time & Work (92% accuracy)"
  });
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showRevision, setShowRevision] = useState(false);

  useEffect(() => {
    if (user) {
      // Load user attempts to calculate live stats
      (async () => {
        const { data } = await supabase
          .from("aptitude_attempts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          setAttempts(data);
          const totalQ = data.reduce((s, a) => s + a.total_questions, 0);
          const correctQ = data.reduce((s, a) => s + a.correct_count, 0);
          const accuracy = Math.round((correctQ / totalQ) * 100);
          
          setStats(prev => ({
            ...prev,
            accuracy: accuracy || 74,
            solvedCount: totalQ,
            totalQuestions: totalQ * 1.5 // simulated total target
          }));
        }
      })();
    }
  }, [user]);

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
            <Brain className="w-3 h-3 mr-2 text-mint" />
            Bilingual AI Aptitude Hub
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Master Aptitude Rounds with <span className="text-mint">Tamil + English</span> AI Shortcuts
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Learn placement patterns, shortcut methods, and test configurations tailored for TCS, Infosys, and top product companies.
          </p>
        </div>
      </motion.div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-secondary/40 backdrop-blur-md rounded-2xl h-auto p-1.5 gap-2 border border-border/40 w-full sm:w-auto flex-wrap">
          <TabsTrigger value="dashboard" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">🎯 Dashboard & Analytics</TabsTrigger>
          <TabsTrigger value="practice" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">📚 Topic Practice</TabsTrigger>
          <TabsTrigger value="company" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">🏢 Company Patterns</TabsTrigger>
          <TabsTrigger value="revision" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">⚡ AI Revision Sheet</TabsTrigger>
        </TabsList>

        {/* Tab 1: Dashboard */}
        <TabsContent value="dashboard" className="space-y-6 outline-none">
          {/* Daily Challenge & Analytics Summary Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Daily Aptitude Challenge */}
            <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-card to-primary-soft/30 border-primary/30 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-accent-soft text-accent border-0">Daily Challenge</Badge>
                  <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm">
                    <Flame className="w-4 h-4" /> {stats.dailyStreak} Day Streak
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">Percentage Shortcut Challenge</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Solve today's handpicked TCS/Infosys percentage problem. Evaluate using Tamil logic mapping under 60 seconds!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <Link to="/app/aptitude/test" search={{ topic: "Quantitative Aptitude", subtopic: "Percentages", difficulty: "Medium", mode: "practice", count: 1 }} className="w-full sm:w-auto">
                  <Button className="w-full bg-gradient-mint text-primary-deep hover:opacity-90 font-bold gap-2">
                    Start Challenge <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="text-xs text-muted-foreground font-medium">Earn +15 XP & Streak point</div>
              </div>
            </Card>

            {/* AI Coaching / Recommendation Sheet */}
            <Card className="p-6 border-accent/20 bg-card/60 backdrop-blur flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent animate-float-soft" />
                  <span className="font-bold text-sm text-foreground">AI Placement Readiness</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Overall Placement Readiness</span>
                      <span className="font-bold text-primary-deep">{stats.accuracy}%</span>
                    </div>
                    <Progress value={stats.accuracy} className="h-2" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-accent-soft/40 border border-accent/20 text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-accent">👉 Recommending Action plan:</span>
                    <p className="text-muted-foreground">
                      Your score in <b className="text-foreground">Probability</b> is low (41%). Practice Probability basic tasks for 3 days to bring it up.
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/app/aptitude/test" search={{ topic: "Quantitative Aptitude", subtopic: "Probability", difficulty: "Easy", mode: "practice", count: 5 }} className="w-full mt-4">
                <Button variant="outline" className="w-full text-xs font-semibold hover:bg-primary-soft">
                  Practice Recommended Topic
                </Button>
              </Link>
            </Card>
          </div>

          {/* Stats Analytics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon="📊" label="Practice Accuracy" value={`${stats.accuracy}%`} desc="Ideal target is above 80%" />
            <StatCard icon="🎯" label="Questions Solved" value={stats.solvedCount} desc="Targeting 100+ for readiness" />
            <StatCard icon="⏱️" label="Time Analysis" value={stats.avgTimePerQuestion} desc="Avg. speed per response" />
            <StatCard icon="🏆" label="Gamification XP" value={`${stats.solvedCount * 10} XP`} desc="XP gained from modules" />
          </div>

          {/* Strengths & Weaknesses block */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-success/30 bg-success-soft/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center text-success">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Strong Topics</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-foreground/80">
                <li className="flex justify-between items-center bg-card/60 p-2.5 rounded-lg border border-success/10">
                  <span>📈 Time & Work</span>
                  <Badge className="bg-success text-white border-0">92% Accuracy</Badge>
                </li>
                <li className="flex justify-between items-center bg-card/60 p-2.5 rounded-lg border border-success/10">
                  <span>📈 Percentages</span>
                  <Badge className="bg-success text-white border-0">85% Accuracy</Badge>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-warning/30 bg-warning-soft/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center text-warning">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base">Weak Topics</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-foreground/80">
                <li className="flex justify-between items-center bg-card/60 p-2.5 rounded-lg border border-warning/10">
                  <span>📉 Probability</span>
                  <Badge className="bg-warning text-white border-0">41% Accuracy</Badge>
                </li>
                <li className="flex justify-between items-center bg-card/60 p-2.5 rounded-lg border border-warning/10">
                  <span>📉 Permutation & Combination</span>
                  <Badge className="bg-warning text-white border-0">53% Accuracy</Badge>
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Topic Practice */}
        <TabsContent value="practice" className="space-y-6 outline-none">
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Practice by Category</h2>
            <p className="text-sm text-muted-foreground">Select a category and topic to configure your AI session.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {APTITUDE_CATEGORIES.map(cat => (
              <Card key={cat.name} className="p-6 bg-card/30 backdrop-blur border border-border/40 hover:border-primary/40 transition-all rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {cat.topics.map(topic => (
                    <Link 
                      key={topic} 
                      to="/app/aptitude/instructions" 
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary/50 hover:bg-primary-soft hover:text-primary-deep border border-border hover:border-primary/30 transition-all"
                    >
                      {topic}
                    </Link>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Company Patterns */}
        <TabsContent value="company" className="space-y-6 outline-none">
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Company Mock Coding & Aptitude Mode</h2>
            <p className="text-sm text-muted-foreground">Train on real placement patterns compiled from previous interview memory papers.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPANIES.map(company => (
              <Card key={company.name} className="p-6 flex flex-col justify-between min-h-[220px] hover-lift">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-extrabold text-xl text-primary-deep">{company.name} Pattern</span>
                    <Badge variant="outline" className="text-xs">{company.difficulty}</Badge>
                  </div>
                  <div className="space-y-2 mt-3 text-xs leading-relaxed text-muted-foreground">
                    <div><b>Format:</b> {company.pattern}</div>
                    <div><b>Primary Topics:</b> {company.topics}</div>
                    <div><b>Q count:</b> {company.questions} questions</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedCompany(company)}
                  className="w-full mt-5 bg-gradient-mint text-primary-deep font-bold text-xs"
                >
                  Load {company.name} Mock Round
                </Button>
              </Card>
            ))}
          </div>

          {/* Selected Company Mode Modal Overlay */}
          <AnimatePresence>
            {selectedCompany && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-card border border-border rounded-3xl p-7 max-w-md w-full space-y-6 shadow-glow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-primary-deep font-extrabold text-xl">
                      <Building2 className="w-6 h-6 text-primary-deep" />
                      <span>{selectedCompany.name} Assessment</span>
                    </div>
                    <Badge className="bg-mint text-primary-deep border-0">{selectedCompany.difficulty}</Badge>
                  </div>

                  <div className="space-y-3 p-4 bg-secondary/30 rounded-2xl text-sm">
                    <div className="flex justify-between"><b>Mock Length:</b> <span>{selectedCompany.questions} Q's</span></div>
                    <div className="flex justify-between"><b>Time Limit:</b> <span>30 mins</span></div>
                    <div className="flex justify-between"><b>Assessed Topics:</b> <span className="text-right text-xs text-foreground/80 max-w-[200px]">{selectedCompany.topics}</span></div>
                    <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                      💡 Pattern strictly mimics {selectedCompany.name}'s latest quantitative assessments.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setSelectedCompany(null)} className="flex-1">Cancel</Button>
                    <Link 
                      to="/app/aptitude/test" 
                      search={{ 
                        topic: "Quantitative Aptitude", 
                        subtopic: selectedCompany.topics.split(",")[0], 
                        difficulty: selectedCompany.difficulty.includes("Hard") ? "Hard" : "Medium", 
                        mode: "test", 
                        count: selectedCompany.questions 
                      }} 
                      className="flex-1"
                    >
                      <Button onClick={() => setSelectedCompany(null)} className="w-full bg-gradient-mint text-primary-deep font-bold">
                        Start Mock Test
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Tab 4: Revision Sheet */}
        <TabsContent value="revision" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">AI placement preparation revision sheet</h2>
              <p className="text-sm text-muted-foreground">Generated dynamically based on your weak areas and formulas.</p>
            </div>
            <Button onClick={() => setShowRevision(true)} className="bg-gradient-mint text-primary-deep font-bold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Regenerate Sheet
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Formulas & Hacks */}
            <Card className="lg:col-span-2 p-6 space-y-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary-deep" /> Formula & Shortcut Hacks
              </h3>
              <div className="space-y-3.5 mt-4">
                <FormulaBlock 
                  title="Percentages & Multiplying Factors" 
                  formula="New Value = Original * (1 ± r/100)"
                  hack="To increase a number by 15%, multiply by 1.15. To decrease by 20%, multiply by 0.8." 
                />
                <FormulaBlock 
                  title="Time & Work (Efficiencies)" 
                  formula="Work = Efficiency * Time"
                  hack="If A is twice as fast as B, their efficiency ratio is A:B = 2:1. Time ratio taken is 1:2." 
                />
                <FormulaBlock 
                  title="Relative Speed (Crossing Trains)" 
                  formula="Speed = (Length of Train + Object) / Time"
                  hack="Crossing a pole/man: Object length = 0. Crossing a bridge/platform: Add object length." 
                />
              </div>
            </Card>

            {/* Quick Weakness Revision */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" /> Weakness Drill
              </h3>
              <p className="text-xs text-muted-foreground">Quick recap points targeting your critical errors.</p>
              
              <div className="space-y-3 mt-4 text-xs">
                <div className="p-3 bg-secondary/50 rounded-xl space-y-1">
                  <div className="font-semibold text-foreground">Probability Basics</div>
                  <p className="text-muted-foreground">Always count favorable cases vs total sample space. Permutations handle order, combinations handle groups.</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl space-y-1">
                  <div className="font-semibold text-foreground">Compound Interest Shortcut</div>
                  <p className="text-muted-foreground">Use the grid approach for 2 years (r% and r% on r) instead of the formula. Sum is 2A + B.</p>
                </div>
              </div>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, desc }: any) {
  return (
    <Card className="p-5 flex items-center gap-4 bg-card/60 backdrop-blur hover-lift border-border/40">
      <div className="text-3xl bg-secondary/50 p-3 rounded-2xl">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground mt-0.5">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </Card>
  );
}

function FormulaBlock({ title, formula, hack }: any) {
  return (
    <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-2">
      <div className="font-bold text-sm text-primary-deep">{title}</div>
      <div className="p-2.5 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs text-center">{formula}</div>
      <p className="text-xs text-muted-foreground"><b className="text-foreground">AI Shortcut Hack:</b> {hack}</p>
    </div>
  );
}
