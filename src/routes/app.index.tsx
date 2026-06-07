import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Code2, MessageSquare, Building2, FileText, TrendingUp, Target, Flame, Trophy, Sparkles, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function StatCard({ icon: Icon, label, value, hint }: any) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-border transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-2">{hint}</div>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ aptitude: 0, coding: 0, hr: 0, totalTests: 0, accuracy: 0, streak: 0, points: 0 });
  const [weekly, setWeekly] = useState<{ day: string; score: number }[]>([]);
  const [tip, setTip] = useState("Start your practice session today!");

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

  const quickActions = [
    { to: "/app/aptitude", label: "Aptitude", icon: Brain, color: "from-blue-500/10 to-blue-500/5" },
    { to: "/app/coding", label: "Coding", icon: Code2, color: "from-green-500/10 to-green-500/5" },
    { to: "/app/hr", label: "HR Interview", icon: MessageSquare, color: "from-purple-500/10 to-purple-500/5" },
    { to: "/app/intervu", label: "InterVU", icon: Building2, color: "from-orange-500/10 to-orange-500/5" },
    { to: "/app/resume", label: "Resume", icon: FileText, color: "from-rose-500/10 to-rose-500/5" }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Your AI-powered interview preparation platform</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Trophy} label="Total Points" value={stats.points} hint="Keep practicing" />
        <StatCard icon={Flame} label="Day Streak" value={stats.streak} hint="Stay consistent" />
        <StatCard icon={Target} label="Avg Accuracy" value={`${stats.accuracy}%`} hint="Overall" />
        <StatCard icon={Clock} label="Sessions" value={stats.totalTests} hint="All modules" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="p-8 bg-card/50 backdrop-blur border-border/50">
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




