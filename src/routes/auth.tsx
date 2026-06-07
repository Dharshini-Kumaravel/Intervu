import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.navigate({ to: "/app" }); }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name } }
        });
        if (error) throw error;
        toast.success("Welcome to InterVU!");
        router.navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        router.navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally { setLoading(false); }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("Google sign-in failed"); setLoading(false); return; }
    if (result.redirected) return;
    router.navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-mint p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-primary-deep/20 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-primary-deep" />
          </div>
          <span className="font-bold text-primary-deep text-xl">InterVU</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-5xl font-bold text-primary-deep leading-tight">
            Crack any interview with <span className="bg-white/60 px-2 rounded-lg">data-driven</span> practice.
          </h1>
          <p className="text-primary-deep/80 text-lg max-w-md">
            Adaptive aptitude, coding & HR rounds. Real company simulations. Deep analytics on every answer.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {[
              { v: "10K+", l: "Practice Q's" },
              { v: "20+", l: "Companies" },
              { v: "AI", l: "Feedback" },
              { v: "Live", l: "Analytics" }
            ].map(s => (
              <div key={s.l} className="bg-white/60 backdrop-blur rounded-xl px-4 py-3 shadow-soft">
                <div className="text-2xl font-bold text-primary-deep">{s.v}</div>
                <div className="text-xs text-primary-deep/70">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-sm text-primary-deep/70">© InterVU · Prepare Smart. Interview Smarter.</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-mint flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-deep" />
            </div>
            <span className="font-bold text-primary-deep">InterVU</span>
          </Link>

          <h2 className="text-3xl font-bold text-foreground">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
          <p className="text-muted-foreground mt-1">{mode === "signin" ? "Sign in to continue your prep" : "Start your interview journey"}</p>

          <Tabs value={mode} onValueChange={v => setMode(v as any)} className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="mt-6 space-y-4">
              <Button type="button" variant="outline" className="w-full h-11" onClick={google} disabled={loading}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>

              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div></div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label>Display name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                )}
                <div>
                  <Label>Email</Label>
                  <div className="relative"><Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" /><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="pl-9" /></div>
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="relative"><Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" /><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-9" /></div>
                </div>
                <Button type="submit" className="w-full h-11 bg-gradient-mint text-primary-deep hover:opacity-90 font-semibold" disabled={loading}>
                  {loading ? "Please wait..." : (mode === "signin" ? "Sign In" : "Create Account")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
