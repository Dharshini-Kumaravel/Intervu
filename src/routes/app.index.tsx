import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Code2, MessageSquare, Building2, FileText, TrendingUp, Target, Flame, Trophy, Sparkles, Clock, Languages, HelpCircle, Mic2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const VOCAB_LIST = [
  { word: "Scalable", type: "Adjective", pronunciation: "/ˈskeɪ.lə.bəl/", tamilMeaning: "விரிவாக்கக்கூடிய (வளரக்கூடிய)", example: "Our web application is highly scalable and handles concurrent users easily." },
  { word: "Collaborate", type: "Verb", pronunciation: "/kəˈlæb.ə.reɪt/", tamilMeaning: "ஒன்றாக இணைந்து வேலை செய்வது", example: "I collaborated with a team of four to develop this internship portal." },
  { word: "Optimize", type: "Verb", pronunciation: "/ˈɒp.tɪ.maɪz/", tamilMeaning: "திறம்பட மேம்படுத்துவது (சீராக்குதல்)", example: "We optimized the database index, reducing response times by forty percent." },
  { word: "Robust", type: "Adjective", pronunciation: "/rəʊˈbʌst/", tamilMeaning: "வலிமையான மற்றும் உறுதியான", example: "We built a robust login system that protects user data from threats." },
  { word: "Feasible", type: "Adjective", pronunciation: "/ˈfiː.zə.bəl/", tamilMeaning: "செய்யக்கூடிய (சாத்தியமான)", example: "Using React with Supabase was the most feasible option for our prototype." }
];

function StatCard({ icon: Icon, label, value, hint }: any) {
  return (
    <Card className="p-6 bg-card/40 border border-border/40 hover:border-primary/20 hover:shadow-soft transition-all duration-300 relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
          <Icon className="w-5 h-5 text-primary-deep" />
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-2">{hint}</div>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ aptitude: 0, coding: 0, hr: 0, totalTests: 0, accuracy: 0, streak: 0, points: 0 });
  const [weekly, setWeekly] = useState<{ day: string; score: number }[]>([]);
  const [tip, setTip] = useState("AI Placement Coach Tip: Start with a quick English Speech Practice question to boost your fluency score!");
  const [vocabIdx, setVocabIdx] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, c, h, p] = await Promise.all([
        supabase.from("aptitude_attempts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("coding_attempts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("hr_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("profiles").select("*").eq("user_id", user.id).single()
      ]);

      const apt = a.data || []; 
      const cod = c.data || []; 
      const hr = h.data || [];
      const total = apt.length + cod.length + hr.length;
      const accAvg = apt.length ? apt.reduce((s, x) => s + Number(x.accuracy), 0) / apt.length : 0;

      setStats({
        aptitude: apt.length, coding: cod.length, hr: hr.length,
        totalTests: total, accuracy: Math.round(accAvg),
        streak: p.data?.streak_days || 0, points: p.data?.total_points || 0
      });

      // Weekly data
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const dayTests = apt.filter(x => x.created_at.slice(0, 10) === key);
        const score = dayTests.length ? Math.round(dayTests.reduce((s, x) => s + Number(x.accuracy), 0) / dayTests.length) : 0;
        return { day: d.toLocaleDateString(undefined, { weekday: "short" }), score };
      });
      setWeekly(days);
    })();
  }, [user]);

  const handleNextWord = () => {
    setVocabIdx((prev) => (prev + 1) % VOCAB_LIST.length);
  };

  const vocabWord = VOCAB_LIST[vocabIdx];

  const quickActions = [
    { to: "/app/aptitude", label: "Aptitude Prep", icon: Brain, color: "from-blue-500/10 to-blue-500/5" },
    { to: "/app/coding", label: "Coding Prep", icon: Code2, color: "from-green-500/10 to-green-500/5" },
    { to: "/app/hr", label: "HR Mock", icon: MessageSquare, color: "from-purple-500/10 to-purple-500/5" },
    { to: "/app/intervu", label: "InterVU AI Coach", icon: Building2, color: "from-orange-500/10 to-orange-500/5" },
    { to: "/app/resume", label: "ATS Resume", icon: FileText, color: "from-rose-500/10 to-rose-500/5" }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Practice. Improve. Get Placed. 🎉</h1>
          <p className="text-muted-foreground">Crack your dream placement with step-by-step bilingual preparation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/english-coach">
            <Button size="sm" className="bg-gradient-mint text-primary-deep font-semibold shadow-soft hover:opacity-90 transition-opacity">
              🗣️ AI English Coach
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Trophy} label="Total Points" value={stats.points} hint="Earn 5 XP per correct answer" />
        <StatCard icon={Flame} label="Day Streak" value={stats.streak} hint="Daily challenge resets at midnight" />
        <StatCard icon={Target} label="Avg Accuracy" value={`${stats.accuracy}%`} hint="Keep it above 75% for placement eligibility" />
        <StatCard icon={Clock} label="Sessions" value={stats.totalTests} hint="All test types combined" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="p-8 bg-card/30 backdrop-blur-md border border-border/40">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Weekly Performance</h2>
              <p className="text-sm text-muted-foreground mt-1">Your accuracy trend over the last 7 days</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(100,100,100,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(100,100,100,0.5)" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid rgba(100,100,100,0.2)',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="rgb(59, 130, 246)" 
                    strokeWidth={2} 
                    dot={{ fill: 'rgb(59, 130, 246)', r: 5 }} 
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bilingual Support Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* English Confidence Zone */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-md rounded-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🌱</span>
                  <h3 className="font-bold text-lg text-primary-deep">English Confidence Zone</h3>
                  <Badge className="bg-primary-deep text-white border-0 text-[9px] px-1.5 py-0 ml-auto font-mono">Bilingual</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Don't let language barriers hold you back. Learn core technical concepts gradually from Tamil to Professional English.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4">
                <Link to="/app/english-coach">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs border-primary/20 hover:bg-primary/20 transition-all font-medium">
                    🗣️ AI English Coach (Tamil ➔ English)
                  </Button>
                </Link>
                <Link to="/app/doubt-assistant">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs border-primary/20 hover:bg-primary/20 transition-all font-medium">
                    🤖 AI Doubt Assistant (5-Step Learning)
                  </Button>
                </Link>
                <Link to="/app/conversation-practice">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs border-primary/20 hover:bg-primary/20 transition-all font-medium">
                    🎙️ Speech Practice (Interactive Interview)
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Vocabulary Builder / Word of the Day */}
            <Card className="p-6 bg-card/40 border border-border/40 rounded-2xl flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="font-semibold text-sm text-foreground">Placement English of the Day</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleNextWord} 
                    className="text-xs text-primary-deep hover:text-primary hover:bg-transparent p-0 h-auto font-medium"
                  >
                    Next Word ➔
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-primary-deep">{vocabWord.word}</span>
                      <span className="text-xs text-muted-foreground">({vocabWord.type})</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{vocabWord.pronunciation}</div>
                  </div>
                  <div className="bg-secondary/50 p-2.5 rounded-lg border border-border/30">
                    <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Meaning in Tamil</div>
                    <div className="font-semibold text-sm text-foreground mt-0.5">{vocabWord.tamilMeaning}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Interview Usage Example</div>
                    <p className="text-xs italic text-foreground mt-1 bg-primary-soft/50 p-2.5 rounded-lg border-l-2 border-primary-deep font-sans leading-relaxed">
                      "{vocabWord.example}"
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* AI Tip & Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">AI Tip</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{tip}</p>
          </Card>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Progress</div>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Aptitude</span>
                <span className="text-sm font-semibold">{stats.aptitude}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.min(stats.aptitude * 10, 100)}%` }} />
              </div>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Coding</span>
                <span className="text-sm font-semibold">{stats.coding}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${Math.min(stats.coding * 10, 100)}%` }} />
              </div>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">HR</span>
                <span className="text-sm font-semibold">{stats.hr}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${Math.min(stats.hr * 10, 100)}%` }} />
              </div>
            </Card>

            {/* Placement Readiness Checklist */}
            <Card className="p-5 bg-card/60 border border-border/40 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <Target className="w-4 h-4 text-primary-deep" />
                <span className="font-bold text-xs text-foreground uppercase tracking-wider">Placement Checklist</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span className="text-muted-foreground line-through">Create profile</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {stats.totalTests > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success animate-scale-in" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                  )}
                  <span className={stats.totalTests > 0 ? "text-muted-foreground line-through" : "text-foreground"}>
                    Complete first session
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {stats.streak > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success animate-scale-in" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                  )}
                  <span className={stats.streak > 0 ? "text-muted-foreground line-through" : "text-foreground"}>
                    Start daily streak
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0" />
                  <span className="text-foreground">Upload ATS Resume</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Start</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.to} to={action.to}>
              <Card className={`p-5 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br ${action.color} border-border/50 group h-full`}>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-medium text-foreground text-sm">{action.label}</div>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}




