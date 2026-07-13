import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PROBLEM_DETAILS } from "@/lib/intervu-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Play, Send, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/coding/solve")({
  validateSearch: (s) => z.object({ problem: z.string() }).parse(s),
  component: Solve
});

const DEFAULT_CODE: Record<string, string> = {
  javascript: "// Write your solution here\nfunction solve(input) {\n  // your code\n  return null;\n}\n",
  python: "# Write your solution here\ndef solve(input):\n    # your code\n    return None\n",
  java: "class Solution {\n    public Object solve(Object input) {\n        // your code\n        return null;\n    }\n}\n",
  cpp: "// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}\n"
};

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Terminal, Code, Info, HelpCircle } from "lucide-react";

const CODING_HELPERS: Record<string, { tamil: string; complexity: string; dryRun: string; solution: string }> = {
  "Two Sum": {
    tamil: "Two Sum problem la namaku oru array (integers) and oru target sum value tharuvanga. Array la irukura yethavathu rendu compartments numbers ah add panna, intha target matching sum match aaguma nu kandupidikanum. Dual loop O(N^2) brute force solution patha time delay aagum. Athuku bathila HashMap registry lookup scan use panna linear time sequential run simple process aagidum.",
    complexity: "⏰ Time Complexity: O(N) linear time - single scan array traversal.\n💾 Space Complexity: O(N) linear space - storing items inside the HashMap lookup registry.",
    dryRun: "Input: nums = [2, 7, 11, 15], Target = 9\n\n1. Target 9 - Current 2 = 7. HashMap is empty {}. Store 2 at index 0.\n2. Target 9 - Current 7 = 2. HashMap has 2 at index 0! Match found! Indices: [0, 1].",
    solution: "JavaScript:\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}"
  },
  "Maximum Subarray": {
    tamil: "Contiguous elements chain sum details la maximum subarray problem solve pannanum. Continuous index blocks ah calculate panni big sum values compare pannanum. Kadane's algorithms simple logic register current vs global state dynamic comparisons verify aagum.",
    complexity: "⏰ Time Complexity: O(N) linear time - single traverse loop checking sum values.\n💾 Space Complexity: O(1) constant space - only tracker values stored.",
    dryRun: "Input: nums = [-2, 1, -3, 4]\n\n- Start: current_max = -2, global_max = -2\n- Index 1 (val 1): start fresh current_max = 1 (since 1 > -2 + 1), global_max = 1\n- Index 2 (val -3): current_max = -2, global_max = 1\n- Index 3 (val 4): current_max = 4, global_max = 4",
    solution: "Python:\ndef maxSubArray(nums):\n    curr_max = global_max = nums[0]\n    for x in nums[1:]:\n        curr_max = max(x, curr_max + x)\n        global_max = max(global_max, curr_max)\n    return global_max"
  }
};

function Solve() {
  const { problem } = Route.useSearch();
  const d = PROBLEM_DETAILS[problem] || { difficulty: "Medium", statement: "Identify target patterns in the collection.", example: "Input: [1,2,3] -> Output: 3" };
  const { user } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    setLoading(true); setFeedback(null);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-coding", {
        body: { problem: `${problem}\n${d.statement}\nExample: ${d.example}`, code, language }
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setFeedback(data);
      await supabase.from("coding_attempts").insert({
        user_id: user.id, problem_title: problem, problem_statement: d.statement,
        difficulty: d.difficulty, topic: "Coding", language, code,
        correctness_score: data.correctness_score, efficiency_score: data.efficiency_score,
        complexity: `${data.time_complexity} time, ${data.space_complexity} space`,
        ai_feedback: data, status: data.correctness_score >= 80 ? "solved" : "attempted"
      });
      toast.success("Evaluation complete");
    } catch (e: any) {
      toast.error(e.message || "Evaluation failed");
    } finally { setLoading(false); }
  };

  const helper = CODING_HELPERS[problem] || {
    tamil: `Topic "${problem}" logical step checking code flows. Array metadata verify logic and dynamic comparisons use panni solve pannalam.`,
    complexity: "⏰ Time Complexity: O(N) typical case.\n💾 Space Complexity: O(1) or O(N) dynamic storage.",
    dryRun: "Sample execution trace logs trace variable inputs loop cycles automatically.",
    solution: `// Default sample template structure for ${problem}\nfunction solution(inputs) {\n  return null;\n}`
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5 animate-float-up">
      {/* Left Column: Multi-tab workspace */}
      <Card className="p-6 bg-card/30 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
        <Tabs defaultValue="problem" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 bg-secondary/30 rounded-xl h-auto p-1 gap-1 mb-4 flex-wrap">
            <TabsTrigger value="problem" className="text-xs py-2 rounded-lg data-[state=active]:bg-card">Problem</TabsTrigger>
            <TabsTrigger value="solution" className="text-xs py-2 rounded-lg data-[state=active]:bg-card">Solution</TabsTrigger>
            <TabsTrigger value="tamil" className="text-xs py-2 rounded-lg data-[state=active]:bg-card font-medium text-primary-deep">தமிழ் ❤️</TabsTrigger>
            <TabsTrigger value="complexity" className="text-xs py-2 rounded-lg data-[state=active]:bg-card">Complexity</TabsTrigger>
            <TabsTrigger value="dryrun" className="text-xs py-2 rounded-lg data-[state=active]:bg-card font-mono">Dry Run</TabsTrigger>
            <TabsTrigger value="aiReview" className="text-xs py-2 rounded-lg data-[state=active]:bg-card font-semibold text-primary">AI Review</TabsTrigger>
          </TabsList>

          {/* Problem Statement tab */}
          <TabsContent value="problem" className="space-y-4 flex-1 outline-none">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{problem}</h1>
              <Badge className="bg-primary/20 text-primary-deep border-0">{d.difficulty}</Badge>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/30">
              {d.statement}
            </p>
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Example Case</div>
              <div className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono">{d.example}</div>
            </div>
          </TabsContent>

          {/* Solution template tab */}
          <TabsContent value="solution" className="space-y-4 flex-1 outline-none">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Code className="w-4 h-4 text-primary-deep" /> Reference Implementation
            </h3>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-[300px]">
              <code>{helper.solution}</code>
            </pre>
          </TabsContent>

          {/* Tamil translation tab */}
          <TabsContent value="tamil" className="space-y-4 flex-1 outline-none">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-deep text-white border-0 text-[10px]">USP gradual learning</Badge>
              <h3 className="font-semibold text-sm text-foreground">தமிழ் விளக்கவுரை (Bilingual explanation)</h3>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed bg-primary-soft/50 p-4 rounded-xl border border-primary/20 leading-relaxed font-sans">
              {helper.tamil}
            </p>
          </TabsContent>

          {/* Time Complexity tab */}
          <TabsContent value="complexity" className="space-y-4 flex-1 outline-none">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-deep" /> Big-O Notation Breakdown
            </h3>
            <pre className="p-4 rounded-xl bg-secondary/40 text-sm font-sans leading-relaxed border border-border/30">
              {helper.complexity}
            </pre>
          </TabsContent>

          {/* Dry Run tab */}
          <TabsContent value="dryrun" className="space-y-4 flex-1 outline-none">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-primary-deep" /> Dry Run Stack Trace
            </h3>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              {helper.dryRun}
            </pre>
          </TabsContent>

          {/* AI Review feedback tab */}
          <TabsContent value="aiReview" className="space-y-4 flex-1 outline-none">
            {feedback ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <ScoreBlock label="Correctness" value={feedback.correctness_score} />
                  <ScoreBlock label="Efficiency" value={feedback.efficiency_score} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Pill label="Time" value={feedback.time_complexity} />
                  <Pill label="Space" value={feedback.space_complexity} />
                  <Pill label="Cases Passed" value={`${feedback.passed_cases}/${feedback.total_cases}`} />
                  <Pill label="Status" value={feedback.correctness_score >= 80 ? "Solved" : "Needs work"} />
                </div>
                <div className="mt-4 space-y-3 text-xs leading-relaxed">
                  <div>
                    <div className="font-semibold text-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Summary</div>
                    <p className="text-muted-foreground">{feedback.summary}</p>
                  </div>
                  {feedback.bugs?.length > 0 && (
                    <div>
                      <div className="font-semibold text-destructive flex items-center gap-1">Alerts / Bugs</div>
                      <ul className="space-y-1 pl-2">{feedback.bugs.map((b: string, i: number) => <li key={i}>• {b}</li>)}</ul>
                    </div>
                  )}
                  {feedback.suggestions?.length > 0 && (
                    <div>
                      <div className="font-semibold text-foreground">Suggestions</div>
                      <ul className="space-y-1 pl-2">{feedback.suggestions.map((s: string, i: number) => <li key={i}>• {s}</li>)}</ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Submit your code using the editor panel to run AI Review evaluation.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Right Column: Code Editor */}
      <Card className="p-6 bg-card/30 backdrop-blur-md border border-border/40 rounded-3xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-foreground">Write Solution</h3>
          <Select value={language} onValueChange={(v) => { setLanguage(v); setCode(DEFAULT_CODE[v]); }}>
            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <textarea 
          value={code} 
          onChange={e => setCode(e.target.value)} 
          className="font-mono text-xs min-h-[350px] flex-1 bg-slate-950 text-slate-100 p-4 rounded-2xl border border-border/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none" 
          spellCheck={false} 
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" disabled className="flex-1 text-xs"><Play className="w-3.5 h-3.5 mr-1" /> Run Sandbox</Button>
          <Button onClick={submit} disabled={loading} className="flex-1 bg-gradient-mint text-primary-deep font-semibold text-xs">
            {loading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
            Submit for AI evaluation
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ScoreBlock({ label, value }: any) {
  return (
    <div className="p-3 rounded-xl bg-secondary/50 border border-border/30">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold text-primary-deep">{value}</div>
      <Progress value={value} className="h-1.5 mt-1" />
    </div>
  );
}
function Pill({ label, value }: any) {
  return <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-semibold">{value}</span></div>;
}
