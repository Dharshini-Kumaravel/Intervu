import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Code2, MessageSquare, Building2, FileText, TrendingUp, Target, Zap, Settings, LogOut, Menu, Home, Languages, HelpCircle, Mic2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const mainNav = [
  { to: "/app", label: "Dashboard", icon: Home },
  { to: "/app/aptitude", label: "Aptitude Prep", icon: Brain },
  { to: "/app/coding", label: "Coding Prep", icon: Code2 },
  { to: "/app/hr", label: "HR Mock Round", icon: MessageSquare },
];

const bilingualNav = [
  { to: "/app/english-coach", label: "AI English Coach", icon: Languages, badge: "Coach" },
  { to: "/app/doubt-assistant", label: "AI Doubt Assistant", icon: HelpCircle, badge: "5-Step" },
  { to: "/app/conversation-practice", label: "Speech Practice", icon: Mic2, badge: "AI Talk" },
];

const secondaryNav = [
  { to: "/app/intervu", label: "InterVU AI", icon: Building2 },
  { to: "/app/daily", label: "Daily Tasks", icon: Zap },
  { to: "/app/weekly", label: "Weekly OA", icon: Target },
];

const supportNav = [
  { to: "/app/resume", label: "Resume ATS", icon: FileText },
  { to: "/app/analytics", label: "Analytics Reports", icon: TrendingUp },
  { to: "/app/achievements", label: "Achievements", icon: Target },
  { to: "/app/profile", label: "Profile Settings", icon: Settings },
];

function NavMenu({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const isActive = (path: string) => router.state.location.pathname === path;

  return (
    <nav className="space-y-8">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Prepare</p>
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-primary-soft text-primary-deep font-semibold border-l-2 border-primary-deep shadow-sm pl-2"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:translate-x-0.5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">English Confidence 🌱</p>
        </div>
        <div className="space-y-1">
          {bilingualNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-primary-soft text-primary-deep font-semibold border-l-2 border-primary-deep shadow-sm pl-2"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:translate-x-0.5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] bg-secondary-foreground/10 text-muted-foreground font-semibold px-1.5 py-0.5 rounded font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Practice</p>
        <div className="space-y-1">
          {secondaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-primary-soft text-primary-deep font-semibold border-l-2 border-primary-deep shadow-sm pl-2"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:translate-x-0.5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Track</p>
        <div className="space-y-1">
          {supportNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-primary-soft text-primary-deep font-semibold border-l-2 border-primary-deep shadow-sm pl-2"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:translate-x-0.5"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out");
      router.navigate({ to: "/auth" });
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b p-4 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-mint flex items-center justify-center shadow-soft">
              <Sparkles className="w-4 h-4 text-primary-deep" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-primary-deep">
              InterVU
            </span>
          </div>
          <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[280px] p-0">
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <h2 className="text-lg font-bold mb-6">Menu</h2>
                <NavMenu onClose={() => setMobileMenuOpen(false)} />
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start mt-8"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r border-border/40 bg-sidebar p-5 flex flex-col sticky left-0 top-0 h-screen overflow-y-auto no-scrollbar shadow-soft">
        <div className="mb-6 flex items-center gap-2 bg-gradient-to-br from-primary/10 to-transparent p-3 rounded-2xl border border-primary/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-mint flex items-center justify-center shadow-soft animate-float-soft">
            <Sparkles className="w-4.5 h-4.5 text-primary-deep" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-primary-deep to-foreground bg-clip-text text-transparent">
                InterVU
              </span>
              <Badge className="bg-primary-deep text-white border-0 text-[8px] py-0 px-1 font-mono">Bilingual</Badge>
            </div>
            <p className="text-[9px] text-muted-foreground font-medium">Practice. Improve. Get Placed.</p>
          </div>
        </div>
        <div className="flex-1 pr-1">
          <NavMenu />
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-xl mt-6 transition-all"
          size="sm"
        >
          <LogOut className="w-4 h-4 mr-2 text-destructive" />
          Logout
        </Button>
      </aside>
      <main className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background/50">
        <div className="p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
