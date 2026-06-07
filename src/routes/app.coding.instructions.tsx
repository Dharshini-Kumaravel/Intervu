import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { CODING_TOPICS, PROBLEM_DETAILS } from "@/lib/intervu-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/coding/instructions")({ component: CodingHome });

function CodingHome() {
  const [topic, setTopic] = useState(CODING_TOPICS[0].name);
  const cur = CODING_TOPICS.find(t => t.name === topic)!;
  const colors: Record<string, string> = {
    Easy: "bg-success/15 text-success-foreground",
    Medium: "bg-warning/15 text-warning-foreground",
    Hard: "bg-destructive/15 text-destructive"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
          <Sparkles className="w-3 h-3 mr-1" /> AI-evaluated
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Coding Practice</h1>
        <p className="text-muted-foreground max-w-xl">
          Solve curated problems and get instant AI feedback on correctness, complexity and optimization.
        </p>
      </motion.div>

      {/* Topic filters */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Topics</h2>
        <div className="flex gap-2.5 flex-wrap stagger">
          {CODING_TOPICS.map(t => (
            <button
              key={t.name}
              onClick={() => setTopic(t.name)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:-translate-y-0.5 ${topic === t.name ? "bg-primary-deep text-primary-foreground border-primary-deep shadow-glow" : "bg-card hover:bg-primary-soft border-border"}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>

      {/* Problems */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">{topic}</h2>
            <p className="text-xs text-muted-foreground">{cur.problems.length} problems</p>
          </div>
        </div>
        <motion.div
          key={topic}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {cur.problems.map(p => {
            const d = PROBLEM_DETAILS[p];
            return (
              <motion.div
                key={p}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to="/app/coding/solve" search={{ problem: p }}>
                  <Card className="p-6 hover-lift cursor-pointer h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-mint flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-primary-deep" />
                      </div>
                      <Badge className={colors[d?.difficulty || "Easy"] + " border-0"}>{d?.difficulty}</Badge>
                    </div>
                    <div className="font-semibold text-base mb-1.5">{p}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{d?.statement?.slice(0, 110)}…</p>
                    <div className="text-xs text-primary-deep mt-4 flex items-center gap-1 font-medium group">
                      Solve problem
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}
