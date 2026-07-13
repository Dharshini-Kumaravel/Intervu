import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APTITUDE_TOPICS } from "@/lib/intervu-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, BookOpen, Zap, Target, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/aptitude/instructions")({ component: AptitudeHome });

function AptitudeHome() {
  const [topic, setTopic] = useState<typeof APTITUDE_TOPICS[number] | null>(null);
  const [subtopic, setSubtopic] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div className="space-y-2">
          <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
            <Sparkles className="w-3 h-3 mr-1" /> AI-generated questions
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Aptitude Practice</h1>
          <p className="text-muted-foreground max-w-lg">
            Build sharp problem-solving instincts. Pick a topic, choose a subtopic, then jump into focused practice or a timed test.
          </p>
        </div>
      </motion.div>

      {/* Step 1 — Topic */}
      <Section step={1} title="Pick a topic" subtitle="Choose the broad area you'd like to train.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {APTITUDE_TOPICS.map(t => (
            <Card
              key={t.name}
              onClick={() => { setTopic(t); setSubtopic(null); }}
              className={`p-6 cursor-pointer hover-lift ${topic?.name === t.name ? "ring-2 ring-primary bg-primary-soft" : ""}`}
            >
              <div className="text-4xl mb-3 animate-float-soft">{t.icon}</div>
              <div className="font-semibold text-base">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.subtopics.length} subtopics</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Step 2 — Subtopic */}
      <AnimatePresence>
        {topic && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Section step={2} title="Pick a subtopic" subtitle={`Subtopics in ${topic.name}.`}>
              <div className="flex flex-wrap gap-2.5 stagger">
                {topic.subtopics.map(s => (
                  <button
                    key={s}
                    onClick={() => setSubtopic(s)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:-translate-y-0.5 ${subtopic === s ? "bg-primary-deep text-primary-foreground border-primary-deep shadow-glow" : "bg-card hover:bg-primary-soft border-border"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 — Difficulty / Mode */}
      <AnimatePresence>
        {topic && subtopic && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Section step={3} title="Choose difficulty & mode" subtitle="Practice gives instant feedback. Test mode is timed.">
              <div className="grid md:grid-cols-2 gap-5">
                <Card className="p-7 hover-lift">
                  <div className="flex items-center gap-2 mb-5 font-semibold">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary-deep" />
                    </div>
                    <span>Practice mode</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">5 Q's</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Easy", "Medium", "Hard"].map(d => (
                      <ModeLink key={d} topic={topic.name} subtopic={subtopic} difficulty={d} mode="practice" label={d} count={5} />
                    ))}
                  </div>
                </Card>
                <Card className="p-7 hover-lift">
                  <div className="flex items-center gap-2 mb-5 font-semibold">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary-deep" />
                    </div>
                    <span>Test mode</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">10 Q's · timed</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["Easy", "Medium", "Hard"].map(d => (
                      <ModeLink key={d} topic={topic.name} subtopic={subtopic} difficulty={d} mode="test" label={d} count={10} />
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-5 mt-5 bg-gradient-mint border-0 animate-scale-in">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-deep" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary-deep">{topic.name} · {subtopic}</div>
                    <div className="text-xs text-primary-deep/70 mt-0.5">Practice gives instant feedback. Test gives final analytics.</div>
                  </div>
                </div>
              </Card>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ step, title, subtitle, children }: any) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-gradient-mint text-primary-deep text-sm font-bold flex items-center justify-center shadow-soft">{step}</span>
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ModeLink({ topic, subtopic, difficulty, mode, label, count }: any) {
  return (
    <Link to="/app/aptitude/test" search={{ topic, subtopic, difficulty, mode, count }} className="group">
      <Button variant="outline" className="w-full group-hover:bg-primary-soft group-hover:border-primary transition-all">
        {label} <ChevronRight className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
      </Button>
    </Link>
  );
}
