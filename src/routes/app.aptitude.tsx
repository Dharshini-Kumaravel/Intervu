import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, BookOpen, ChevronRight, Target } from "lucide-react";

export const Route = createFileRoute("/app/aptitude")({ component: AptitudeHub });

function AptitudeHub() {
  return (
    <div className="min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <Badge className="mb-4 bg-primary-soft text-primary-deep border-0">
            <Brain className="w-3 h-3 mr-2" />
            Aptitude Mastery
          </Badge>
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Master Aptitude Tests
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practice quantitative aptitude, logical reasoning, and verbal ability with AI-generated questions and detailed feedback.
          </p>
        </motion.div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Practice Mode */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/app/aptitude/instructions">
              <Card className="p-8 hover-lift cursor-pointer h-full bg-gradient-to-br from-primary-soft/50 to-accent/20 border-primary/30 hover:border-primary/60 transition-all group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <BookOpen className="w-8 h-8 text-primary-deep" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">Practice Mode</h2>
                <p className="text-muted-foreground mb-6">
                  Choose topics and practice at your own pace with instant feedback and detailed explanations.
                </p>
                <Button className="gap-2">
                  Start Practicing
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            </Link>
          </motion.div>

          {/* Test Mode */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/app/aptitude/instructions">
              <Card className="p-8 hover-lift cursor-pointer h-full bg-gradient-to-br from-accent-soft/50 to-primary/20 border-accent/30 hover:border-accent/60 transition-all group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">Test Mode</h2>
                <p className="text-muted-foreground mb-6">
                  Take timed tests with a set number of questions to simulate real exam conditions and track progress.
                </p>
                <Button className="gap-2" variant="secondary">
                  Start Test
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "📊", label: "Topics", value: "4" },
            { icon: "🎯", label: "Subtopics", value: "20+" },
            { icon: "⏱️", label: "Avg. Time", value: "20-45 min" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="p-6 text-center bg-card/50 backdrop-blur border-border/50">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
