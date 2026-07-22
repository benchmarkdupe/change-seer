import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — OpportunityOS" },
      {
        name: "description",
        content:
          "Sign in to save opportunities, track what you build, and earn founding-tester status.",
      },
      { property: "og:title", content: "Sign in to OpportunityOS" },
      {
        property: "og:description",
        content: "Save opportunities, track projects, earn founding-tester status.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErr(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (!result.redirected) navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background px-5 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="mx-auto mt-8 max-w-sm">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 font-display text-lg font-bold text-primary">
          O
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back." : "Join OpportunityOS."}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {mode === "signin"
            ? "Sign in to save signals, track projects, and see what's changing for you."
            : "First 100 users are minted as Founding Testers with a permanent issue number on their profile."}
        </p>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-[14px] font-medium text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.5 1.2 8.9 3.5l6.6-6.6C35.5 2.5 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.7 6c1.9-5.5 7-9.8 13.8-9.8z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.4 5.7c4.3-4 6.8-9.8 6.8-17.4z"
            />
            <path
              fill="#FBBC05"
              d="M10.2 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.7-6C1 16.6 0 20.2 0 24s1 7.4 2.5 10.7l7.7-6z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.1 0 11.3-2 15.1-5.5l-7.4-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.8 0-12.5-4.5-14.5-10.6l-7.7 6C6.4 42.6 14.6 48 24 48z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[14px] focus:border-primary focus:outline-none"
            />
          )}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[14px] focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[14px] focus:border-primary focus:outline-none"
          />
          {err && <p className="text-[12px] text-tier-low">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErr(null);
          }}
          className="mt-4 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "No account? Create one." : "Already have an account? Sign in."}
        </button>
      </div>
    </div>
  );
}
