import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Code2, Zap, BookOpen, ChevronRight, Target, Flame, 
  Award, TrendingUp, Sparkles, Building2, BookMarked, 
  Terminal, ShieldCheck, Cpu, Layout, HelpCircle, ArrowRight 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/coding")({ component: CodingHub });

const CODING_CATEGORIES = [
  { name: "Arrays", emoji: "📦", count: "15 problems", description: "Contiguous memory lists, sorting, two pointers, hashing" },
  { name: "Strings", emoji: "📝", count: "12 problems", description: "Anagrams, palindromes, sliding window pattern, parsing" },
  { name: "Linked Lists", emoji: "🔗", count: "10 problems", description: "Pointers manipulation, cycles detection, merging lists" },
  { name: "Trees", emoji: "🌳", count: "18 problems", description: "Binary trees, BST traversals, DFS, BFS search logic" },
  { name: "Graphs", emoji: "📊", count: "14 problems", description: "Matrix traversals, Dijkstra, topological sorting" },
  { name: "Dynamic Programming", emoji: "⚡", count: "20 problems", description: "Memoization, tabulation, knapsack, optimization" }
];

const CODING_COMPANIES = [
  { name: "Amazon", difficulty: "Medium-Hard", pattern: "Online Assessment - 90 min limit", topics: "Trees, Graphs, Hashing", questions: 2 },
  { name: "Google", difficulty: "Hard", pattern: "Direct Technical Round", topics: "Graphs, Dynamic Programming, Trees", questions: 2 },
  { name: "Microsoft", difficulty: "Medium", pattern: "Codility Assessment - 60 min limit", topics: "Arrays, Strings, LinkedLists", questions: 3 },
  { name: "Meta", difficulty: "Medium-Hard", pattern: "Technical Interview - 45 min limit", topics: "Two Pointers, Hashing, Binary Trees", questions: 2 }
];

function CodingHub() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    solvedCount: 8,
    accuracy: 82,
    easySolved: 5,
    mediumSolved: 3,
    hardSolved: 0,
    streak: 4,
    readiness: 76
  });
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase
          .from("coding_attempts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          setAttempts(data);
          const solved = data.filter(a => a.status === "solved");
          const easy = solved.filter(a => a.difficulty === "Easy").length;
          const med = solved.filter(a => a.difficulty === "Medium").length;
          const hard = solved.filter(a => a.difficulty === "Hard").length;
          const accuracy = Math.round((solved.length / data.length) * 100);

          setStats(prev => ({
            ...prev,
            solvedCount: solved.length,
            easySolved: easy,
            mediumSolved: med,
            hardSolved: hard,
            accuracy: accuracy || 82,
            readiness: Math.min(100, 60 + solved.length * 2)
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
            <Code2 className="w-3 h-3 mr-2 text-mint" />
            AI-Enhanced Compiler Workspace
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Learn Coding Logic in <span className="text-mint">Tamil + English</span> Dry Runs
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Execute algorithms, review code quality under Big-O parameters, and mock interview with Amazon/Google coding formats.
          </p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-secondary/40 backdrop-blur-md rounded-2xl h-auto p-1.5 gap-2 border border-border/40 w-full sm:w-auto flex-wrap">
          <TabsTrigger value="dashboard" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">🚀 Dashboard & Streak</TabsTrigger>
          <TabsTrigger value="problems" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">🌳 Practice Problems</TabsTrigger>
          <TabsTrigger value="company" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">🏢 Company Coding Mode</TabsTrigger>
          <TabsTrigger value="path" className="rounded-xl py-2 px-4 data-[state=active]:bg-card">🎓 AI Learning Path</TabsTrigger>
        </TabsList>

        {/* Tab 1: Dashboard */}
        <TabsContent value="dashboard" className="space-y-6 outline-none">
          {/* Daily Streak & Overview Metrics */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily Streak card */}
            <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-card to-primary-soft/30 border-primary/30 flex flex-col justify-between min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-mint text-primary-deep border-0 py-1 font-bold">Coding Streak</Badge>
                <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                  <Flame className="w-4 h-4" /> {stats.streak} Day Coding Streak
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Today's Practice: Two Sum</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                  A classic hashing problem frequently asked at Amazon. Code in JavaScript/Python and review with step-by-step dry run animations.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <Link to="/app/coding/solve" search={{ problem: "Two Sum" }} className="w-full sm:w-auto">
                  <Button className="w-full bg-gradient-mint text-primary-deep hover:opacity-90 font-bold gap-2">
                    Solve Two Sum <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground font-medium">Languages: JS, Python, C, C++, Java</span>
              </div>
            </Card>

            {/* Placement Readiness */}
            <Card className="p-6 border-accent/20 bg-card/65 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm text-foreground">AI Technical Readiness</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Interview Readiness Score</span>
                      <span className="font-bold text-primary-deep">{stats.readiness}%</span>
                    </div>
                    <Progress value={stats.readiness} className="h-2" />
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground leading-relaxed border border-border/30">
                    🏆 <b>Placement Verdict:</b> Solved {stats.solvedCount} questions with {stats.accuracy}% accuracy. Strong in Arrays, but we recommend revising Trees next.
                  </div>
                </div>
              </div>
              <Link to="/app/coding/solve" search={{ problem: "Maximum Subarray" }} className="w-full mt-4">
                <Button variant="outline" className="w-full text-xs font-semibold hover:bg-primary-soft">
                  Optimize Maximum Subarray
                </Button>
              </Link>
            </Card>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon="🎯" label="Problems Solved" value={stats.solvedCount} desc="Targeting 50+ for placement" />
            <StatCard icon="📊" label="Compiler Accuracy" value={`${stats.accuracy}%`} desc="Percentage of correct runs" />
            <StatCard icon="⚡" label="LeetCode Easy" value={stats.easySolved} desc="Foundational challenges" />
            <StatCard icon="🔥" label="LeetCode Medium/Hard" value={stats.mediumSolved + stats.hardSolved} desc="Core optimization challenges" />
          </div>
        </TabsContent>

        {/* Tab 2: Problems */}
        <TabsContent value="problems" className="space-y-6 outline-none">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Data Structures & Algorithms</h2>
              <p className="text-sm text-muted-foreground">Select a category to browse specific coding questions.</p>
            </div>
            <Link to="/app/coding/instructions">
              <Button className="bg-primary text-primary-foreground font-bold">Browse All Problems</Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CODING_CATEGORIES.map(cat => (
              <Card key={cat.name} className="p-6 hover-lift flex flex-col justify-between min-h-[200px]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl bg-secondary/50 p-2.5 rounded-2xl">{cat.emoji}</span>
                    <Badge variant="secondary" className="bg-primary-soft text-primary-deep border-0">{cat.count}</Badge>
                  </div>
                  <h3 className="font-bold text-base mt-4 text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                </div>
                <Link to="/app/coding/instructions" className="w-full mt-4">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-primary-deep flex justify-between p-0 border-t pt-3 rounded-none">
                    <span>Solve {cat.name} problems</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Company Coding Mode */}
        <TabsContent value="company" className="space-y-6 outline-none">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Company Coding Assessments</h2>
            <p className="text-sm text-muted-foreground">Practice coding rounds simulating Amazon, Google, and Microsoft specifications.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CODING_COMPANIES.map(company => (
              <Card key={company.name} className="p-6 flex flex-col justify-between min-h-[220px] hover-lift">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary-deep">
                      <Building2 className="w-5 h-5" />
                      <span>{company.name} Coding Mode</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{company.difficulty}</Badge>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground mt-3 leading-relaxed">
                    <div><b>Format:</b> {company.pattern}</div>
                    <div><b>Frequently Asked Topics:</b> {company.topics}</div>
                    <div><b>Round Length:</b> {company.questions} core coding questions</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedCompany(company)}
                  className="w-full mt-5 bg-gradient-mint text-primary-deep font-bold text-xs"
                >
                  Configure {company.name} Coding Round
                </Button>
              </Card>
            ))}
          </div>

          {/* Selected Company Mock Modal Overlay */}
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
                      <span>{selectedCompany.name} Mock Round</span>
                    </div>
                    <Badge className="bg-mint text-primary-deep border-0">{selectedCompany.difficulty}</Badge>
                  </div>

                  <div className="space-y-3.5 p-4 bg-secondary/30 rounded-2xl text-sm">
                    <div className="flex justify-between"><b>Format:</b> <span>{selectedCompany.pattern}</span></div>
                    <div className="flex justify-between"><b>Interview Scope:</b> <span className="text-right text-xs max-w-[200px]">{selectedCompany.topics}</span></div>
                    <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                      🤖 AI will evaluate under strict Time & Space complexities expected in {selectedCompany.name} interviews.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setSelectedCompany(null)} className="flex-1">Cancel</Button>
                    <Link 
                      to="/app/coding/solve" 
                      search={{ 
                        problem: selectedCompany.name === "Amazon" ? "Two Sum" : "Maximum Subarray" 
                      }} 
                      className="flex-1"
                    >
                      <Button onClick={() => setSelectedCompany(null)} className="w-full bg-gradient-mint text-primary-deep font-bold">
                        Start Mock Coding
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Tab 4: AI Learning Path */}
        <TabsContent value="path" className="space-y-6 outline-none">
          <div className="space-y-1 bg-gradient-mint/20 border border-mint/20 p-5 rounded-3xl mb-6">
            <h2 className="text-lg font-bold text-primary-deep flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Customized Placement Coding Track
            </h2>
            <p className="text-xs text-primary-deep/80 max-w-xl">
              Our AI diagnostic evaluates your correct and incorrect submissions to map out a step-by-step career path.
            </p>
          </div>

          <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            
            {/* Step 1: diagnostics result */}
            <PathNode 
              step="1" 
              title="Tree Basics & Diagnostic" 
              status="solved" 
              desc="Learn Binary Tree Node definitions, pointers setup, and structure recursion logic."
            />
            
            {/* Step 2: Binary tree traversals */}
            <PathNode 
              step="2" 
              title="DFS & BFS Binary Tree Traversals" 
              status="solved" 
              desc="Inorder, Preorder, and Postorder recursive traversal logic, and Iterative traversals."
            />

            {/* Step 3: Binary Search Trees */}
            <PathNode 
              step="3" 
              title="Binary Search Tree (BST) Searching & Inserting" 
              status="attempted" 
              desc="Implement BST property (left child < parent < right child) for O(log N) retrieval."
            />

            {/* Step 4: LeetCode Easy Drill */}
            <PathNode 
              step="4" 
              title="LeetCode Tree Easy Challenges" 
              status="locked" 
              desc="Solve Maximum Depth of Binary Tree, Same Tree, Invert Binary Tree in JS/Python."
            />

            {/* Step 5: Mock Interview coaching */}
            <PathNode 
              step="5" 
              title="Mock coding Round - Trees" 
              status="locked" 
              desc="Simulated 45 minute video + coding round evaluating time complexity constraints."
            />
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

function PathNode({ step, title, status, desc }: any) {
  const statusColors = {
    solved: "bg-success text-success-foreground border-success",
    attempted: "bg-warning text-warning-foreground border-warning animate-pulse",
    locked: "bg-secondary text-muted-foreground border-border"
  };
  
  return (
    <div className="relative space-y-1.5 mb-8 last:mb-0">
      <div className="absolute -left-[30px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-card shadow-soft z-10">
        {status === "solved" ? "✓" : step}
      </div>
      <div className="flex items-center gap-3">
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
        <Badge className={`text-[9px] px-2 py-0.5 border-0 font-extrabold uppercase ${statusColors[status]}`}>{status}</Badge>
      </div>
      <p className="text-xs text-muted-foreground max-w-xl">{desc}</p>
    </div>
  );
}
