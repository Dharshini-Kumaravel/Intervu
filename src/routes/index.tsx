import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      if (loading) return;
      router.navigate({ to: user ? "/app" : "/auth" });
    }, 1800);
    return () => clearTimeout(t);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft overflow-hidden relative">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="relative text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 120, damping: 12 }} className="inline-flex">
          <div className="w-24 h-24 rounded-3xl bg-gradient-mint flex items-center justify-center shadow-glow animate-pulse-ring">
            <Sparkles className="w-12 h-12 text-primary-deep" />
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 text-5xl font-bold tracking-tight text-primary-deep">
          InterVU
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-2 text-muted-foreground">
          Prepare Smart. Interview Smarter.
        </motion.p>
      </div>
    </div>
  );
}
