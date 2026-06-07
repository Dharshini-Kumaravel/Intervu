import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Brain, Code2, MessageSquare, Sparkles, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/weekly")({ component: Weekly });

function Weekly() {
  const items = [
    { to: "/app/aptitude", icon: Brain, title: "15 Aptitude Questions", desc: "Mixed topics from quant, logical & verbal" },
    { to: "/app/coding", icon: Code2, title: "2 Coding Problems", desc: "One easy + one medium difficulty" },
    { to: "/app/hr", icon: MessageSquare, title: "5 HR Questions", desc: "Behavioral and situational mix" }
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-float-soft" />
          <div className="relative space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center animate-float-soft">
              <CalendarDays className="w-7 h-7 text-primary-deep" />
            </div>
            <h1 className="text-3xl font-bold text-primary-deep">Weekly Test</h1>
            <p className="text-primary-deep/80 max-w-md">
              A balanced 30-question challenge across aptitude, coding & HR. Take it once a week to see how you stack up.
            </p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="space-y-4"
      >
        {items.map((it) => (
          <motion.div
            key={it.to}
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={it.to}>
              <Card className="p-6 hover-lift cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <it.icon className="w-6 h-6 text-primary-deep" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{it.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary-deep transition" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 bg-info/5 border-info/20">
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <Sparkles className="w-4 h-4 text-info shrink-0" />
            <span>Tip: dedicate ~1 hour. Your weekly score appears on the dashboard.</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
