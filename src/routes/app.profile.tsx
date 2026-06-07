import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { User, Save, Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  const save = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name, bio: profile.bio, target_role: profile.target_role
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  if (!profile) return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading…</div>;
  const initials = (profile.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-8 bg-gradient-mint border-0 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-float-soft" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-white/60 animate-float-soft">
              <AvatarFallback className="text-3xl bg-white text-primary-deep font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h1 className="text-3xl font-bold text-primary-deep">{profile.display_name || "Anonymous"}</h1>
              <p className="text-sm text-primary-deep/70">{user?.email}</p>
              {profile.target_role && (
                <p className="text-sm text-primary-deep/80 italic">🎯 {profile.target_role}</p>
              )}
              <div className="flex gap-2 justify-center sm:justify-start pt-2">
                <span className="bg-white/60 px-3 py-1 rounded-full text-xs text-primary-deep flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {profile.total_points} pts
                </span>
                <span className="bg-white/60 px-3 py-1 rounded-full text-xs text-primary-deep flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {profile.streak_days} day streak
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="p-8 space-y-6">
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <User className="w-4 h-4" /> Edit profile
          </h3>
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input
              value={profile.display_name || ""}
              onChange={e => setProfile({ ...profile, display_name: e.target.value })}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Target role</Label>
            <Input
              value={profile.target_role || ""}
              onChange={e => setProfile({ ...profile, target_role: e.target.value })}
              placeholder="e.g. Frontend Engineer at Google"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={profile.bio || ""}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              placeholder="A short bio about yourself…"
              className="min-h-[120px] leading-relaxed"
            />
          </div>
          <Button
            onClick={save}
            disabled={saving}
            className="w-full sm:w-auto h-11 bg-gradient-mint text-primary-deep font-semibold hover:shadow-glow transition-all"
          >
            <Save className="w-4 h-4 mr-2" /> Save profile
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
