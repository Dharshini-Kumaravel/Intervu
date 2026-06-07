import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANIES, COMPANY_FLOW } from "@/lib/intervu-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Briefcase, Trophy, Loader2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/app/intervu")({ component: InterVU });

function InterVU() {
  const { user } = useAuth();
  const [type, setType] = useState<"service" | "product" | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("company_interviews").select("*").eq("user_id", user.id).eq("status", "in_progress").maybeSingle().then(({ data }) => setActive(data));
  }, [user]);

  const start = async () => {
    if (!user || !type || !company) return;
    setLoading(true);
    const flow = COMPANY_FLOW[type];
    const { data, error } = await supabase.from("company_interviews").insert({
      user_id: user.id, company_name: company, company_type: type,
      rounds: flow.map(r => ({ ...r, status: "pending", score: 0 })) as any,
      current_round: 0, status: "in_progress"
    }).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setActive(data);
  };

  const completeRound = async (score: number) => {
    if (!active) return;
    const rounds = [...(active.rounds || [])];
    rounds[active.current_round] = { ...rounds[active.current_round], status: "done", score };
    const next = active.current_round + 1;
    const isLast = next >= rounds.length;

    if (isLast) {
      const apt = rounds.find((r: any) => r.round.includes("Aptitude"))?.score || 0;
      const cod = rounds.filter((r: any) => r.round.toLowerCase().includes("coding")).reduce((s: number, r: any) => s + r.score, 0) / Math.max(rounds.filter((r: any) => r.round.toLowerCase().includes("coding")).length, 1);
      const hr = rounds.filter((r: any) => r.round.includes("HR") || r.round.includes("Behavioral") || r.round.includes("Technical")).reduce((s: number, r: any) => s + r.score, 0) / Math.max(rounds.filter((r: any) => r.round.includes("HR") || r.round.includes("Behavioral") || r.round.includes("Technical")).length, 1);
      const final = Math.round(apt * 0.2 + cod * 0.3 + hr * 0.5);
      await supabase.from("company_interviews").update({
        rounds: rounds as any, current_round: next, status: "completed",
        aptitude_score: Math.round(apt), coding_score: Math.round(cod),
        hr_content_score: Math.round(hr), communication_score: Math.round(hr),
        confidence_score: Math.round(hr), final_score: final
      }).eq("id", active.id);
      const { data } = await supabase.from("company_interviews").select("*").eq("id", active.id).single();
      setActive(data);
    } else {
      await supabase.from("company_interviews").update({ rounds: rounds as any, current_round: next }).eq("id", active.id);
      const { data } = await supabase.from("company_interviews").select("*").eq("id", active.id).single();
      setActive(data);
    }
  };

  const reset = async () => {
    if (active) await supabase.from("company_interviews").delete().eq("id", active.id);
    setActive(null); setType(null); setCompany(null);
  };

  // Completed report
  if (active && active.status === "completed") {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden text-center">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
            <div className="relative space-y-3">
              <Trophy className="w-12 h-12 text-primary-deep mx-auto animate-float-soft" />
              <h1 className="text-2xl font-bold text-primary-deep">{active.company_name} interview complete</h1>
              <div className="text-7xl font-bold text-primary-deep">
                {active.final_score}<span className="text-3xl">/100</span>
              </div>
              <Badge className="bg-white/60 text-primary-deep border-0">
                {active.final_score >= 70 ? "Ready" : active.final_score >= 50 ? "Needs work" : "Not ready yet"}
              </Badge>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
          {[["Aptitude", active.aptitude_score, "20%"], ["Coding", active.coding_score, "30%"], ["HR Content", active.hr_content_score, "20%"], ["Communication", active.communication_score, "15%"]].map(([l, v, w]: any) => (
            <Card key={l} className="p-5 hover-lift">
              <div className="text-xs text-muted-foreground">{l} <span className="text-[10px]">({w})</span></div>
              <div className="text-3xl font-bold text-primary-deep mt-2">{v}</div>
              <Progress value={v} className="h-1.5 mt-2" />
            </Card>
          ))}
        </div>

        <Card className="p-7 animate-slide-up">
          <h3 className="font-semibold mb-5 text-lg">Round-wise breakdown</h3>
          <div className="space-y-3">
            {(active.rounds || []).map((r: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/40"
              >
                <div>
                  <div className="font-medium">{r.round}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                </div>
                <Badge variant={r.score >= 70 ? "default" : "secondary"}>{r.score}/100</Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        <Button onClick={reset} className="w-full h-12 bg-gradient-mint text-primary-deep font-semibold">
          Start a new company interview
        </Button>
      </div>
    );
  }

  // In-progress round
  if (active) {
    const rounds = active.rounds || [];
    const cur = rounds[active.current_round];
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-7 bg-gradient-mint border-0 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
            <div className="relative space-y-3">
              <Badge className="bg-white/60 text-primary-deep border-0">
                {active.company_name} · {active.company_type}
              </Badge>
              <h1 className="text-2xl font-bold text-primary-deep">
                Round {active.current_round + 1} of {rounds.length}: {cur?.round}
              </h1>
              <p className="text-primary-deep/80">{cur?.description}</p>
              <Progress value={(active.current_round / rounds.length) * 100} className="h-2" />
            </div>
          </Card>
        </motion.div>

        <Card className="p-7 space-y-5">
          <p className="text-sm text-foreground/80 leading-relaxed">
            For demo purposes, simulate completing this round. In a full session you would be routed to the corresponding module
            (aptitude / coding / HR) and your score would be captured automatically. Pick the score to record:
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[60, 75, 90].map(s => (
              <Button
                key={s}
                onClick={() => completeRound(s)}
                variant={s === 75 ? "default" : "outline"}
                className={`h-12 ${s === 75 ? "bg-gradient-mint text-primary-deep" : ""}`}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> {s}
              </Button>
            ))}
          </div>
          <Button variant="ghost" onClick={reset} className="w-full text-destructive">Cancel interview</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Round sequence</h3>
          <div className="flex flex-wrap gap-2">
            {rounds.map((r: any, i: number) => (
              <Badge
                key={i}
                variant={i < active.current_round ? "default" : i === active.current_round ? "secondary" : "outline"}
                className={i < active.current_round ? "bg-success/20 text-success-foreground border-0" : ""}
              >
                {i + 1}. {r.round} {r.status === "done" && `(${r.score})`}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Selection screen
  return (
    <div className="max-w-5xl mx-auto py-4 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
          <Sparkles className="w-3 h-3 mr-1" /> Real interview flow
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">InterVU Company Mode</h1>
        <p className="text-muted-foreground max-w-xl">
          A real interview simulation tailored to the company you're targeting — round-by-round, scored end-to-end.
        </p>
      </motion.div>

      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 1 — Company type</h2>
        <div className="grid md:grid-cols-2 gap-5 stagger">
          {(["service", "product"] as const).map(t => (
            <Card
              key={t}
              onClick={() => { setType(t); setCompany(null); }}
              className={`p-6 cursor-pointer hover-lift ${type === t ? "ring-2 ring-primary bg-primary-soft" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-mint flex items-center justify-center">
                  {t === "service" ? <Briefcase className="w-6 h-6 text-primary-deep" /> : <Building2 className="w-6 h-6 text-primary-deep" />}
                </div>
                <div>
                  <div className="font-bold capitalize text-lg">{t}-based</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t === "service" ? "TCS, Infosys, Wipro…" : "Google, Amazon, Meta…"}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-foreground/70">
                {COMPANY_FLOW[t].length} rounds · {COMPANY_FLOW[t].reduce((s, r) => s + r.duration, 0)} min total
              </div>
            </Card>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {type && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 2 — Pick a {type} company</h2>
            <div className="flex flex-wrap gap-2.5 stagger">
              {COMPANIES[type].map(c => (
                <button
                  key={c}
                  onClick={() => setCompany(c)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:-translate-y-0.5 ${company === c ? "bg-primary-deep text-primary-foreground border-primary-deep shadow-glow" : "bg-card hover:bg-primary-soft border-border"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {type && company && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-5"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Step 3 — Review interview flow</h2>
            <Card className="p-7 space-y-5">
              <h3 className="font-semibold text-lg">Interview flow for {company}</h3>
              <div className="space-y-3">
                {COMPANY_FLOW[type].map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{r.round}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                    </div>
                    <Badge variant="outline">{r.duration} min</Badge>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={start}
                disabled={loading}
                className="w-full h-12 bg-gradient-mint text-primary-deep font-semibold hover:shadow-glow transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Start interview
              </Button>
            </Card>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
