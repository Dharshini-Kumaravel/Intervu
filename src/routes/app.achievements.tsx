import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Target, Brain, Code2, MessageSquare, Award, Star, Zap, Crown } from "lucide-react";

export const Route = createFileRoute("/app/achievements")({ component: Achievements });

const BADGES = [
  { key: "first_test", title: "First Step", desc: "Complete your first test", icon: Star, threshold: (s: any) => s.totalTests >= 1 },
  { key: "streak_3", title: "On Fire", desc: "3-day streak", icon: Flame, threshold: (s: any) => s.streak >= 3 },
  { key: "streak_7", title: "Unstoppable", desc: "7-day streak", icon: Flame, threshold: (s: any) => s.streak >= 7 },
  { key: "apt_10", title: "Quant Crusher", desc: "10 aptitude tests", icon: Brain, threshold: (s: any) => s.apt >= 10 },
  { key: "code_5", title: "Code Warrior", desc: "5 coding problems", icon: Code2, threshold: (s: any) => s.cod >= 5 },
  { key: "hr_3", title: "Smooth Talker", desc: "3 HR sessions", icon: MessageSquare, threshold: (s: any) => s.hr >= 3 },
  { key: "accuracy_80", title: "Sharpshooter", desc: "Avg 80%+ accuracy", icon: Target, threshold: (s: any) => s.accuracy >= 80 },
  { key: "points_500", title: "Half-K Hero", desc: "500 points", icon: Award, threshold: (s: any) => s.points >= 500 },
  { key: "points_1k", title: "Grandmaster", desc: "1000 points", icon: Crown, threshold: (s: any) => s.points >= 1000 },
  { key: "speed", title: "Speedster", desc: "Beat ideal time on 5 questions", icon: Zap, threshold: (s: any) => s.fastQ >= 5 }
];

function Achievements() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, c, h, p, q, lb] = await Promise.all([
        supabase.from("aptitude_attempts").select("*").eq("user_id", user.id),
        supabase.from("coding_attempts").select("*").eq("user_id", user.id),
        supabase.from("hr_sessions").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("aptitude_question_logs").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("display_name,total_points,streak_days").order("total_points", { ascending: false }).limit(10)
      ]);
      const apt = a.data || []; const cod = c.data || []; const hr = h.data || [];
      const fastQ = (q.data || []).filter((x: any) => x.is_correct && x.time_taken_sec < x.ideal_time_sec).length;
      const accuracy = apt.length ? apt.reduce((s, x) => s + Number(x.accuracy), 0) / apt.length : 0;
      setStats({ totalTests: apt.length + cod.length + hr.length, apt: apt.length, cod: cod.length, hr: hr.length, accuracy, points: p.data?.total_points || 0, streak: p.data?.streak_days || 0, fastQ });
      setLeaderboard(lb.data || []);
    })();
  }, [user]);

  if (!stats) return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading…</div>;

  const earnedCount = BADGES.filter(b => b.threshold(stats)).length;

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
          <Trophy className="w-3 h-3 mr-1" /> Your milestones
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground max-w-xl">Earn badges, climb the leaderboard, build the streak.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard icon={Trophy} value={stats.points} label="Total points" highlight />
        <StatCard icon={Flame} value={stats.streak} label="Day streak" />
        <StatCard icon={Star} value={earnedCount} label="Badges earned" />
        <StatCard icon={Target} value={`${Math.round(stats.accuracy)}%`} label="Avg accuracy" />
      </div>

      <Tabs defaultValue="badges">
        <TabsList className="bg-secondary/60 p-1">
          <TabsTrigger value="badges">Badges ({earnedCount}/{BADGES.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-6">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {BADGES.map(b => {
              const earned = b.threshold(stats);
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.key}
                  variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={`p-6 rounded-2xl border transition-all ${earned ? "bg-gradient-mint border-primary/40 hover-lift" : "bg-secondary/30 border-border opacity-60 grayscale"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${earned ? "bg-white/60 animate-float-soft" : "bg-secondary"}`}>
                      <Icon className={`w-6 h-6 ${earned ? "text-primary-deep" : "text-muted-foreground"}`} />
                    </div>
                    <div className={`font-semibold text-base ${earned ? "text-primary-deep" : ""}`}>{b.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{b.desc}</div>
                    {earned && <Badge className="mt-3 bg-white/60 text-primary-deep border-0">Earned</Badge>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card className="p-7">
            <h3 className="font-semibold mb-5 flex items-center gap-2">
              <Crown className="w-4 h-4 text-warning" /> Top 10 learners
            </h3>
            <div className="space-y-3 stagger">
              {leaderboard.map((u, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl transition hover:scale-[1.01] ${i < 3 ? "bg-gradient-mint" : "bg-secondary/40"}`}
                >
                  <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${i === 0 ? "bg-warning text-white" : i === 1 ? "bg-muted-foreground/30" : i === 2 ? "bg-orange-300" : "bg-secondary"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 truncate font-medium">{u.display_name || "Anonymous"}</div>
                  <div className="text-sm font-bold text-primary-deep">{u.total_points} pts</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, highlight }: any) {
  return (
    <Card className={`p-6 hover-lift relative overflow-hidden ${highlight ? "bg-gradient-mint border-0" : ""}`}>
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/30" />
      <Icon className={`w-6 h-6 ${highlight ? "text-primary-deep" : "text-warning"} relative`} />
      <div className={`text-3xl font-bold mt-3 relative ${highlight ? "text-primary-deep" : ""}`}>{value}</div>
      <div className={`text-xs mt-1 relative ${highlight ? "text-primary-deep/70" : "text-muted-foreground"}`}>{label}</div>
    </Card>
  );
}
