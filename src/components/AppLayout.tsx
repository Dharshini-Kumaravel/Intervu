import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useIsMobile } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Code2, MessageSquare, Building2, FileText, TrendingUp, Target, Zap, Settings, LogOut, Menu, Home } from "lucide-react";
import { toast } from "sonner";

const mainNav = [
  { to: "/app", label: "Dashboard", icon: Home },
  { to: "/app/aptitude", label: "Aptitude", icon: Brain },
  { to: "/app/coding", label: "Coding", icon: Code2 },
  { to: "/app/hr", label: "HR Interview", icon: MessageSquare },
];

const secondaryNav = [
  { to: "/app/intervu", label: "InterVU", icon: Building2 },
  { to: "/app/daily", label: "Daily", icon: Zap },
  { to: "/app/weekly", label: "Weekly", icon: Target },
];

const supportNav = [
  { to: "/app/resume", label: "Resume", icon: FileText },
  { to: "/app/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/app/achievements", label: "Achievements", icon: Target },
  { to: "/app/profile", label: "Profile", icon: Settings },
];

function NavMenu({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const isActive = (path: string) => router.state.location.pathname === path;

  return (
    <nav className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Prepare</p>
        <div className="space-y-1">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.to)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-secondary text-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Practice</p>
        <div className="space-y-1">
          {secondaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.to)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Track</p>
        <div className="space-y-1">
          {supportNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.to)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-secondary text-foreground"
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
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-deep bg-clip-text text-transparent">
            InterVU
          </h1>
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
      <aside className="w-56 border-r bg-background/50 p-6 flex flex-col sticky left-0 top-0 h-screen overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-deep bg-clip-text text-transparent">
            InterVU
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Prepare Smart</p>
        </div>
        <div className="flex-1">
          <NavMenu />
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          size="sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </aside>
      <main className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background/50">
        <div className="p-12 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
