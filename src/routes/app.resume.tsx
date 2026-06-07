import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { FileText, Sparkles, Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/resume")({ component: Resume });

function Resume() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (f: File) => {
    if (f.type === "text/plain") {
      const t = await f.text(); setText(t);
    } else {
      toast.info("For PDFs/DOCX, please paste the text content into the box below.");
    }
  };

  const analyze = async () => {
    if (!text.trim() || !user) return;
    setLoading(true); setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", { body: { resumeText: text, targetRole: role } });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setAnalysis(data);
      await supabase.from("resume_analyses").insert({
        user_id: user.id, raw_text: text.slice(0, 8000), target_role: role,
        ats_score: data.ats_score, skills_score: data.skills_score,
        projects_score: data.projects_score, experience_score: data.experience_score,
        missing_keywords: data.missing_keywords, suggestions: data.suggestions,
        generated_questions: data.generated_questions
      });
      toast.success("Analysis complete");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  // Results view — separate screen so it breathes
  if (analysis) {
    return (
      <div className="max-w-5xl mx-auto py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button variant="ghost" onClick={() => setAnalysis(null)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Analyze another
          </Button>
          <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
            <Sparkles className="w-3 h-3 mr-1" /> Analysis complete
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-float-soft" />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-xs text-primary-deep/70 uppercase tracking-widest">ATS Score</div>
                <div className="text-7xl font-bold text-primary-deep mt-2">
                  {analysis.ats_score}<span className="text-3xl">/100</span>
                </div>
                <p className="text-sm text-primary-deep/80 mt-3 max-w-md">{analysis.role_match}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["Skills", analysis.skills_score], ["Projects", analysis.projects_score], ["Experience", analysis.experience_score]].map(([l, v]: any) => (
                  <div key={l} className="bg-white/60 rounded-xl p-4 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-primary-deep/70">{l}</div>
                    <div className="text-2xl font-bold text-primary-deep mt-1">{v}</div>
                    <Progress value={v} className="h-1 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 stagger">
          <Card className="p-6 hover-lift">
            <div className="font-semibold mb-3">Missing keywords</div>
            <p className="text-xs text-muted-foreground mb-4">Add these to boost role match.</p>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_keywords?.map((k: string, i: number) => (
                <Badge key={i} variant="outline" className="text-destructive border-destructive/30">{k}</Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6 hover-lift">
            <div className="font-semibold mb-3">Weak statements</div>
            <p className="text-xs text-muted-foreground mb-4">Rewrite these for more impact.</p>
            <ul className="text-sm space-y-2 text-foreground/80">
              {analysis.weak_statements?.map((w: string, i: number) => <li key={i}>• {w}</li>)}
            </ul>
          </Card>

          <Card className="p-6 hover-lift">
            <div className="font-semibold mb-3">Suggestions</div>
            <ul className="text-sm space-y-2 text-foreground/80">
              {analysis.suggestions?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
            </ul>
          </Card>

          <Card className="p-6 bg-info/5 hover-lift">
            <div className="font-semibold mb-3">Likely HR questions</div>
            <p className="text-xs text-muted-foreground mb-4">Generated from your resume.</p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-foreground/80">
              {analysis.generated_questions?.map((q: string, i: number) => <li key={i}>{q}</li>)}
            </ol>
          </Card>
        </div>
      </div>
    );
  }

  // Input view
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <Badge variant="secondary" className="bg-primary-soft text-primary-deep">
          <Sparkles className="w-3 h-3 mr-1" /> AI-powered ATS
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="text-muted-foreground max-w-xl">
          Paste your resume to get an ATS score, keyword gap analysis, and AI-generated HR questions tailored to your profile.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <Label>Target role</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} className="h-11" placeholder="e.g. Frontend Engineer" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Resume text</Label>
              <span className="text-xs text-muted-foreground">{text.length} chars</span>
            </div>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your full resume content here…"
              className="min-h-[320px] font-mono text-xs leading-relaxed"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="sm:flex-1">
              <input type="file" accept=".txt,.md" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Button asChild variant="outline" className="w-full h-11">
                <span><Upload className="w-4 h-4 mr-2" /> Upload .txt</span>
              </Button>
            </label>
            <Button
              onClick={analyze}
              disabled={loading || !text.trim()}
              className="sm:flex-1 h-11 bg-gradient-mint text-primary-deep font-semibold hover:shadow-glow transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze resume
            </Button>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {!text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-muted-foreground py-6"
          >
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Your detailed report will appear here after analysis.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
