import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, ChevronRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/app/daily")({ component: Daily });

function Daily() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-float-soft" />
          <div className="relative space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center animate-float-soft">
              <Zap className="w-7 h-7 text-primary-deep" />
            </div>
            <Badge className="bg-white/60 text-primary-deep border-0">
              <Calendar className="w-3 h-3 mr-1" /> {today}
            </Badge>
            <h1 className="text-3xl font-bold text-primary-deep">Daily Challenge</h1>
            <p className="text-primary-deep/80 max-w-md">
              Five quick questions to keep your streak alive — about 7 minutes of focused practice.
            </p>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link
          to="/app/aptitude/test"
          search={{ topic: "Quantitative Aptitude", subtopic: "Percentages", difficulty: "Medium", mode: "test", count: 5 }}
        >
          <Card className="p-7 hover-lift cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-deep" />
                </div>
                <div>
                  <div className="font-semibold text-base">Today's Quant — Percentages</div>
                  <div className="text-xs text-muted-foreground mt-1">5 questions · ~7 min · Medium</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary-deep transition" />
            </div>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}
