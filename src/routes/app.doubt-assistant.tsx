import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search, Sparkles, Send, BookOpen, Code, Terminal, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/app/doubt-assistant")({ component: DoubtAssistant });

type DoubtResponse = {
  tamil: string;
  easyEng: string;
  techDef: string;
  interviewAns: string;
  codeEx: string;
};

const POPULAR_QUESTIONS = [
  { q: "Encapsulation na enna?", query: "encapsulation" },
  { q: "Inheritance explanation?", query: "inheritance" },
  { q: "Array vs Linked List difference enna?", query: "array_vs_linkedlist" },
  { q: "Introduce yourself in placement?", query: "intro" },
  { q: "Tell me about project structure?", query: "project" }
];

const DOUBTS_MOCK: Record<string, DoubtResponse> = {
  encapsulation: {
    tamil: "Encapsulation na data variables and details ah oru class kulla protect panni hidden ah vechirukurathu. Oru cell phone structure maari - network, camera code ellam kulla hidden ah irukum, namaku phone call trigger interface mattum theriya mudiyum.",
    easyEng: "Encapsulation is like putting your items in a closed capsule. It groups your variables (data) and functions (behavior) together into a single box (a class) and blocks direct outside access.",
    techDef: "Encapsulation is one of the four fundamental OOP concepts. It refers to the bundling of data with the methods that operate on that data, restricting direct access to some of the object's components (data hiding) using access modifiers like private.",
    interviewAns: "In interviews, you can say: 'Encapsulation is the practice of wrapping data and methods into a single unit called a class, and restricting direct external modification. It helps enforce security and data integrity by making variables private and providing public getter and setter methods to access them safely.'",
    codeEx: `class Employee {
  // Private variables - cannot be accessed directly from outside
  private double salary;

  // Public getter method
  public double getSalary() {
    return salary;
  }

  // Public setter method with validation
  public void setSalary(double newSalary) {
    if (newSalary > 0) {
      this.salary = newSalary;
    }
  }
}`
  },
  inheritance: {
    tamil: "Oru parent class kitta irukura property and codes ah child class reuse panrathu thaan Inheritance. Car design build pannum podu general Vehicle design variables (wheels, engine, doors) inheritance pannikira maari.",
    easyEng: "Inheritance is like inheriting properties from your parents. If your parent class has some methods, the child class automatically gets those methods without writing them again.",
    techDef: "Inheritance is a mechanism in Object-Oriented Programming where a new class (derived or subclass) inherits the fields and methods of an existing class (base or superclass), establishing an 'IS-A' relationship.",
    interviewAns: "In interviews, explain: 'Inheritance allows a new class to acquire properties and behaviors of an existing parent class. It promotes code reusability and builds hierarchical relationships between classes. We implement it using the extends keyword in languages like Java or C++.'",
    codeEx: `// Parent Class
class Vehicle {
  protected int speed = 60;
  public void honk() {
    System.out.println("Beep Beep!");
  }
}

// Child Class inherits Vehicle
class Car extends Vehicle {
  private String model = "Tesla";
  
  public static void main(String[] args) {
    Car myCar = new Car();
    myCar.honk(); // Accessible due to inheritance
    System.out.println("Speed: " + myCar.speed);
  }
}`
  },
  array_vs_linkedlist: {
    tamil: "Array na train compartment maari, continuous spaces memory la alloc aagum. Search panna easy. Linked List na treasure hunt game maari, memory parts spread aagi irukum but ovvona child item location address pointers vachu connect panni follow aagum.",
    easyEng: "Arrays store elements close together in one continuous block of memory. Linked lists store elements scattered anywhere in memory, with each element pointing to the address of the next element like a chain link.",
    techDef: "An Array is a static data structure of fixed size stored in contiguous memory locations. A Linked List is a dynamic data structure composed of nodes, where each node contains a data field and a reference/pointer to the next node in the sequence.",
    interviewAns: "In interviews: 'The main difference is memory allocation and access time. Arrays have contiguous allocation and support O(1) random access, but insertion/deletion is O(N). Linked Lists have dynamic memory allocation with O(N) sequential access, but insertions/deletions at known positions are O(1).'",
    codeEx: `// Array declaration (Fixed size)
int[] arr = new int[5];
arr[0] = 10; // direct index lookup - O(1)

// Linked List Node structure
class Node {
  int data;
  Node next;
  
  Node(int d) {
    this.data = d;
    this.next = null;
  }
}`
  },
  intro: {
    tamil: "Introduce yourself na unga name, college, skills, internship details, and placements focus details short ah, positive confidence la outline panrathu thaan. Tamil medium background pathi positive ah convey pannanum.",
    easyEng: "Start with your name, where you are from, your educational qualification, project details, and the core coding languages you are good at.",
    techDef: "A structured elevator pitch framing your professional background, technical competencies, projects, and career alignment for the specific role.",
    interviewAns: "A sample professional answer: 'Hello, my name is Karthik. I am completing my engineering in ECE. During my college days, I worked on web applications using React and Supabase. Coming from a Tamil-medium background, I initially faced communication challenges, but I actively worked on it, collaborated in teams, and built professional project workflows. I am eager to start as an engineer to contribute effectively to your team.'",
    codeEx: `// Structure of a Self-Introduction:
1. Greet the panel (Good morning/afternoon)
2. State your name and background
3. Highlight your key technical skills (e.g., Python, SQL)
4. Discuss your major project or internship
5. Express enthusiasm for this company's hiring round`
  },
  project: {
    tamil: "Interview la project pathi pesum podu: 1. Ethana per team, 2. Enna problem address panninga, 3. Technologies selection reason, 4. Ungaloda contributions, and final placement values pathi sollanum.",
    easyEng: "Explain your project step-by-step: What is the main idea, what coding languages you used, what was your role, and how it helps the final users.",
    techDef: "System Architecture explanation covering backend modules, databases, API endpoints, and system constraints evaluated during the design phase.",
    interviewAns: "In interviews: 'My project is an AI-powered portal. I developed this using React for the frontend and Node.js for backend services. I was responsible for database design using MongoDB and API routing. The major challenge was optimization, which I solved by indexing data fields, improving loading speeds by thirty percent.'",
    codeEx: `// Typical Project Architecture explanation flow:
Client (React.js)
  │ (HTTP REST Requests)
  ▼
API Gateway (Express Router)
  │ (Controllers & Validations)
  ▼
Service Layer (LLM API integrations)
  │ (Data fetching / parsing)
  ▼
Database (MongoDB Atlas / Supabase PostgreSQL)`
  }
};

function DoubtAssistant() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [response, setResponse] = useState<DoubtResponse | null>(null);

  const handleSearch = (customQuery?: string) => {
    const qStr = (customQuery || query).trim().toLowerCase();
    if (!qStr) {
      toast.warning("Please type a question or select a topic.");
      return;
    }

    setSearching(true);
    setTimeout(() => {
      // Find matches in mock
      let foundKey = "";
      if (qStr.includes("encap") || qStr.includes("capsule")) foundKey = "encapsulation";
      else if (qStr.includes("inherit") || qStr.includes("extend")) foundKey = "inheritance";
      else if (qStr.includes("array") || qStr.includes("linked")) foundKey = "array_vs_linkedlist";
      else if (qStr.includes("introduce") || qStr.includes("myself") || qStr.includes("intro")) foundKey = "intro";
      else if (qStr.includes("project") || qStr.includes("architec")) foundKey = "project";

      if (foundKey && DOUBTS_MOCK[foundKey]) {
        setResponse(DOUBTS_MOCK[foundKey]);
        toast.success("AI found standard concept explanation!");
      } else {
        // Mock a general AI generated concept output
        setResponse({
          tamil: `Neenga ketta topic: "${qStr}". Ithuvum technical flow thaan. Ithoda basic concept na, standard code logic code variables and data models ah safe ah control panrathu thaan.`,
          easyEng: `Regarding your query "${qStr}": It is a general technical concept. Think of it as a set of rules that help keep your programs organized and easy to extend.`,
          techDef: `For the query: "${qStr}". Standard definition refers to design patterns and algorithms structured to ensure performance, code clarity, and system scalability.`,
          interviewAns: `If asked in interview about "${qStr}", you should say: 'It is a crucial standard in software development that helps developers minimize dependency issues and write clean, modular, and high-performance components.'`,
          codeEx: `// Simple layout demo for ${qStr}
public class Demo {
  public static void main(String[] args) {
    System.out.println("Demonstrating concept: ${qStr}");
  }
}`
        });
        toast.success("AI generated general concept response!");
      }
      setSearching(false);
    }, 850);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-float-up">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center shadow-soft">
            <HelpCircle className="w-6 h-6 text-primary-deep" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Doubt Assistant</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ask programming or placement doubts in Tamil/English. Learn concepts gradually using our 5-step flow.
            </p>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-card border border-border/50 rounded-2xl shadow-soft p-1">
          <Search className="w-5 h-5 ml-3 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ask anything, e.g., Encapsulation na enna?"
            className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground/60"
          />
          <Button
            onClick={() => handleSearch()}
            disabled={searching}
            className="bg-primary-deep text-white hover:opacity-90 font-semibold rounded-xl px-5 py-2.5 h-auto text-xs"
          >
            {searching ? "Thinking..." : "Ask AI 🤖"}
          </Button>
        </div>

        {/* Popular queries */}
        <div className="flex flex-wrap items-center gap-2 mt-4 justify-center">
          <span className="text-xs text-muted-foreground">Try asking:</span>
          {POPULAR_QUESTIONS.map((pq, idx) => (
            <Badge
              key={idx}
              onClick={() => { setQuery(pq.q); handleSearch(pq.query); }}
              className="bg-secondary/60 hover:bg-primary/20 text-foreground text-[10px] cursor-pointer border border-border/40 hover:border-primary/40 font-normal px-2.5 py-1"
            >
              {pq.q}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results output */}
      <AnimatePresence mode="wait">
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <div className="bg-card/40 border border-border/40 rounded-3xl overflow-hidden shadow-soft">
              {/* Header label */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-deep" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-deep">
                    5-Step Gradual Learning Output
                  </span>
                </div>
                <Badge className="bg-primary-deep text-white border-0 text-[10px]">Tamil ➔ Easy English ➔ Placement Ready</Badge>
              </div>

              {/* Tab layout */}
              <Tabs defaultValue="tamil" className="w-full">
                <TabsList className="grid grid-cols-5 w-full bg-secondary/30 rounded-none border-b border-border/30 h-12 p-0">
                  <TabsTrigger value="tamil" className="text-xs data-[state=active]:bg-card rounded-none h-full border-r border-border/20">
                    🗣️ தமிழ்
                  </TabsTrigger>
                  <TabsTrigger value="easyEng" className="text-xs data-[state=active]:bg-card rounded-none h-full border-r border-border/20">
                    📖 Easy English
                  </TabsTrigger>
                  <TabsTrigger value="techDef" className="text-xs data-[state=active]:bg-card rounded-none h-full border-r border-border/20">
                    🧠 Tech Def
                  </TabsTrigger>
                  <TabsTrigger value="interviewAns" className="text-xs data-[state=active]:bg-card rounded-none h-full border-r border-border/20">
                    👔 Interview Ans
                  </TabsTrigger>
                  <TabsTrigger value="codeEx" className="text-xs data-[state=active]:bg-card rounded-none h-full">
                    💻 Code / Flow
                  </TabsTrigger>
                </TabsList>

                {/* Tab content boxes */}
                <div className="p-6">
                  {/* Step 1: Tamil */}
                  <TabsContent value="tamil" className="space-y-4 outline-none">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/25 text-primary-deep border-0 font-semibold font-mono text-[10px]">Step 1 of 5</Badge>
                      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Tamil Explanation</h3>
                    </div>
                    <p className="text-base text-foreground leading-relaxed font-sans bg-secondary/20 p-5 rounded-2xl border-l-4 border-primary border-t border-r border-b border-border/30">
                      {response.tamil}
                    </p>
                    <div className="flex justify-end pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Read this first to grasp the logic in Tamil, then move to <strong>Easy English</strong> <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </TabsContent>

                  {/* Step 2: Easy English */}
                  <TabsContent value="easyEng" className="space-y-4 outline-none">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/25 text-primary-deep border-0 font-semibold font-mono text-[10px]">Step 2 of 5</Badge>
                      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Easy English</h3>
                    </div>
                    <p className="text-base text-foreground leading-relaxed font-sans bg-secondary/20 p-5 rounded-2xl border-l-4 border-blue-400 border-t border-r border-b border-border/30">
                      {response.easyEng}
                    </p>
                    <div className="flex justify-end pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Got the general workflow? Move to <strong>Tech Def</strong> <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </TabsContent>

                  {/* Step 3: Tech Def */}
                  <TabsContent value="techDef" className="space-y-4 outline-none">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/25 text-primary-deep border-0 font-semibold font-mono text-[10px]">Step 3 of 5</Badge>
                      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Technical Definition</h3>
                    </div>
                    <p className="text-base text-foreground leading-relaxed font-sans bg-secondary/20 p-5 rounded-2xl border-l-4 border-purple-400 border-t border-r border-b border-border/30">
                      {response.techDef}
                    </p>
                    <div className="flex justify-end pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Now, study how to speak in <strong>Interview Ans</strong> <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </TabsContent>

                  {/* Step 4: Interview Ans */}
                  <TabsContent value="interviewAns" className="space-y-4 outline-none">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/25 text-primary-deep border-0 font-semibold font-mono text-[10px]">Step 4 of 5</Badge>
                      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Interview Answer Pitch</h3>
                    </div>
                    <div className="bg-primary-soft/50 p-5 rounded-2xl border-l-4 border-primary-deep border-t border-r border-b border-border/30">
                      <div className="text-[10px] text-primary-deep font-bold uppercase mb-2">Speak this to the interviewer:</div>
                      <p className="text-base text-foreground font-semibold leading-relaxed">
                        {response.interviewAns}
                      </p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Finally, look at the <strong>Code / Flow</strong> demonstration <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </TabsContent>

                  {/* Step 5: Code Example */}
                  <TabsContent value="codeEx" className="space-y-4 outline-none">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/25 text-primary-deep border-0 font-semibold font-mono text-[10px]">Step 5 of 5</Badge>
                      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Code / Flow</h3>
                    </div>
                    <div className="relative">
                      <div className="absolute top-2 right-2 bg-secondary/80 text-muted-foreground font-mono text-[9px] px-1.5 py-0.5 rounded border border-border/40">
                        syntax active
                      </div>
                      <pre className="p-5 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-[300px]">
                        <code>{response.codeEx}</code>
                      </pre>
                    </div>
                    <div className="p-3 bg-secondary/40 rounded-xl text-[11px] text-muted-foreground leading-relaxed mt-2 border border-border/30">
                      💡 Tip: Notice how modifiers or structure patterns follow the theoretical rules explained in prior steps.
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
