import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/analytics")({ component: Analytics });

function Analytics() {
  const { user } = useAuth();
  const [apt, setApt] = useState<any[]>([]);
  const [cod, setCod] = useState<any[]>([]);
  const [hr, setHr] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("aptitude_attempts").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("coding_attempts").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("hr_sessions").select("*").eq("user_id", user.id).order("created_at")
    ]).then(([a, c, h]) => { setApt(a.data || []); setCod(c.data || []); setHr(h.data || []); });
  }, [user]);

  const topicMap: Record<string, { sum: number; n: number; t: number }> = {};
  apt.forEach(a => {
    topicMap[a.topic] = topicMap[a.topic] || { sum: 0, n: 0, t: 0 };
    topicMap[a.topic].sum += Number(a.accuracy); topicMap[a.topic].n++; topicMap[a.topic].t += a.total_time_sec;
  });
  const topicData = Object.entries(topicMap).map(([topic, v]) => ({
    topic: topic.split(" ")[0], accuracy: Math.round(v.sum / v.n), avgTime: Math.round(v.t / v.n)
  }));

  const trend = apt.slice(-15).map((a, i) => ({ x: `T${i + 1}`, accuracy: Math.round(Number(a.accuracy)) }));
  const codTrend = cod.slice(-15).map((c, i) => ({ x: `S${i + 1}`, score: c.correctness_score }));
  const hrTrend = hr.slice(-15).map((h, i) => ({ x: `H${i + 1}`, score: h.overall_score }));

  const radar = [
    { dim: "Aptitude", v: apt.length ? Math.round(apt.reduce((s, a) => s + Number(a.accuracy), 0) / apt.length) : 0 },
    { dim: "Coding", v: cod.length ? Math.round(cod.reduce((s, c) => s + c.correctness_score, 0) / cod.length) : 0 },
    { dim: "Efficiency", v: cod.length ? Math.round(cod.reduce((s, c) => s + c.efficiency_score, 0) / cod.length) : 0 },
    { dim: "HR Content", v: hr.length ? Math.round(hr.reduce((s, h) => s + (h.content_score || 0), 0) / hr.length) : 0 },
    { dim: "Confidence", v: hr.length ? Math.round(hr.reduce((s, h) => s + (h.confidence_score || 0), 0) / hr.length) : 0 },
    { dim: "Fluency", v: hr.length ? Math.round(hr.reduce((s, h) => s + (h.fluency_score || 0), 0) / hr.length) : 0 }
  ];

  const recent = [
    ...apt.map((a: any) => ({ ...a, _t: "Aptitude", _label: `${a.topic} · ${a.subtopic}`, _score: Math.round(Number(a.accuracy)) })),
    ...cod.map((c: any) => ({ ...c, _t: "Coding", _label: c.problem_title, _score: c.correctness_score })),
    ...hr.map((h: any) => ({ ...h, _t: "HR", _label: h.target_role, _score: h.overall_score }))
  ].sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto py-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
          <BarChart3 className="w-3 h-3 mr-1" /> Performance insights
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground max-w-xl">Deep performance breakdown across every module.</p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/60 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <Card className="p-7 lg:col-span-2 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-deep" /> Aptitude trend
                </h3>
                <Badge variant="outline" className="text-xs">Last 15</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 165)" vertical={false} />
                    <XAxis dataKey="x" fontSize={11} />
                    <YAxis fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Line type="monotone" dataKey="accuracy" stroke="oklch(0.55 0.12 165)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.85 0.10 165)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-7 hover-lift">
              <h3 className="font-semibold mb-4">Skill radar</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="oklch(0.92 0.02 165)" />
                    <PolarAngleAxis dataKey="dim" fontSize={10} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar dataKey="v" stroke="oklch(0.55 0.12 165)" fill="oklch(0.85 0.10 165)" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="aptitude">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-7">
              <h3 className="font-semibold mb-4">Topic-wise performance</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={topicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 165)" vertical={false} />
                    <XAxis dataKey="topic" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Bar dataKey="accuracy" fill="oklch(0.85 0.10 165)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avgTime" fill="oklch(0.65 0.12 200)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="coding">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="p-7">
              <h3 className="font-semibold mb-4">Coding accuracy trend</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={codTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 165)" vertical={false} />
                    <XAxis dataKey="x" fontSize={11} /><YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="oklch(0.65 0.12 200)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="hr">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="p-7">
              <h3 className="font-semibold mb-4">HR overall score trend</h3>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={hrTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 165)" vertical={false} />
                    <XAxis dataKey="x" fontSize={11} /><YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="oklch(0.75 0.13 75)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="recent">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="p-7">
              <h3 className="font-semibold mb-4">Recent attempts</h3>
              <div className="space-y-3 stagger">
                {recent.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">No attempts yet — start practicing!</div>
                ) : recent.map((x: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{x._t}</Badge>
                      <span className="text-sm font-medium">{x._label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(x.created_at).toLocaleDateString()}</span>
                      <Badge>{x._score}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
