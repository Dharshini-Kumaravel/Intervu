import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({ to: "/auth" });
    } else if (user) {
      // Safeguard: Ensure user has a profile record even if trigger failed
      (async () => {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (!prof) {
          await supabase.from("profiles").insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Student",
            avatar_url: user.user_metadata?.avatar_url || "",
            streak_days: 0,
            total_points: 0
          });
        }
      })();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-soft">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
