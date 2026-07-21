import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2, LogOut, Save } from "lucide-react";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { BadgeChip } from "@/components/profile/BadgeChip";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["my-profile"],
      queryFn: () => getMyProfile(),
    }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const update = useServerFn(updateMyProfile);
  const { data } = useSuspenseQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [displayName, setDisplayName] = useState(data.profile?.display_name ?? "");
  const [username, setUsername] = useState(data.profile?.username ?? "");
  const [bio, setBio] = useState(data.profile?.bio ?? "");
  const [region, setRegion] = useState(data.profile?.region ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await update({
        data: {
          display_name: displayName,
          username: username || null,
          bio: bio || null,
          region: region || null,
        },
      });
      await qc.invalidateQueries({ queryKey: ["my-profile"] });
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="px-5 pt-6">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 font-display text-2xl font-bold text-primary">
          {(data.profile?.display_name ?? "?")[0]?.toUpperCase()}
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          {data.profile?.display_name ?? "Your profile"}
        </h1>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {data.roles.map((r) => (
            <span key={r} className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {r}
            </span>
          ))}
        </div>

        {data.badges.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Badges
            </h2>
            <div className="mt-3 grid gap-2">
              {data.badges.map((b) => (
                <BadgeChip
                  key={b.badge_id}
                  name={b.badges?.name ?? b.badge_id}
                  description={b.badges?.description}
                  icon={b.badges?.icon ?? "award"}
                  rarity={b.badges?.rarity ?? "common"}
                  issueNumber={b.issue_number}
                  maxSupply={b.badges?.max_supply}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h2>
          <Field label="Display name" value={displayName} onChange={setDisplayName} />
          <Field label="Username" value={username} onChange={setUsername} placeholder="lowercase, letters/numbers" />
          <Field label="Region" value={region} onChange={setRegion} placeholder="e.g. Berlin, DE" />
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-[13px] focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={save}
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save profile
          </button>
          {msg && <p className="text-center text-[12px] text-muted-foreground">{msg}</p>}
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-display text-sm font-semibold">Coming next</h2>
          <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
            <li>• Projects — link opportunities to what you're building</li>
            <li>• Verified outcomes — private by default, opt-in to share</li>
            <li>• Early-signal history — opportunities you saved before High Signal</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[13px] focus:border-primary focus:outline-none"
      />
    </div>
  );
}
