import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Zap, BookOpen, ChevronRight, Target } from "lucide-react";

export const Route = createFileRoute("/app/coding")({ component: CodingHub });

function CodingHub() {
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
            <Code2 className="w-3 h-3 mr-2" />
            Technical Excellence
          </Badge>
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Solve Coding Problems
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master data structures and algorithms with real coding challenges, test cases, and AI-powered code evaluation.
          </p>
        </motion.div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Problem Practice */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/app/coding/instructions">
              <Card className="p-8 hover-lift cursor-pointer h-full bg-gradient-to-br from-primary-soft/50 to-accent/20 border-primary/30 hover:border-primary/60 transition-all group">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <BookOpen className="w-8 h-8 text-primary-deep" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">Problem Practice</h2>
                <p className="text-muted-foreground mb-6">
                  Solve curated coding problems across different difficulty levels and data structure categories.
                </p>
                <Button className="gap-2">
                  Browse Problems
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Card>
            </Link>
          </motion.div>

          {/* Solution Review */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 h-full bg-gradient-to-br from-accent-soft/50 to-primary/20 border-accent/30 opacity-75 cursor-not-allowed">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <Target className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Solution Review</h2>
              <p className="text-muted-foreground mb-6">
                Get AI-powered feedback on time complexity, space efficiency, and code quality.
              </p>
              <Button className="gap-2" variant="secondary" disabled>
                Coming Soon
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Topics Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Practice Topics</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: "📦", name: "Arrays", count: "15 problems" },
              { emoji: "📝", name: "Strings", count: "12 problems" },
              { emoji: "🔗", name: "Linked Lists", count: "10 problems" },
              { emoji: "🌳", name: "Trees", count: "18 problems" },
              { emoji: "📊", name: "Graphs", count: "14 problems" },
              { emoji: "⚡", name: "DP", count: "20 problems" }
            ].map((topic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Card className="p-6 text-center hover-lift cursor-pointer">
                  <div className="text-4xl mb-3">{topic.emoji}</div>
                  <h3 className="font-semibold text-foreground">{topic.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{topic.count}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "📚", label: "Topics", value: "6" },
            { icon: "🎯", label: "Total Problems", value: "100+" },
            { icon: "⏱️", label: "Avg. Time", value: "30-45 min" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
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
