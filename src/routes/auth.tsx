import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";

function parseAuthErrorFromUrl() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const errorDescription = params.get("error_description");
  if (!error) return null;
  return errorDescription ? `${error}: ${errorDescription}` : error;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — OpportunityOS" },
      { name: "description", content: "Sign in to save opportunities, track what you build, and earn founding-tester status." },
      { property: "og:title", content: "Sign in to OpportunityOS" },
      { property: "og:description", content: "Save opportunities, track projects, earn founding-tester status." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const authError = parseAuthErrorFromUrl();
    if (authError) {
      setErr(authError);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const handleSession = async () => {
      const { error: urlError } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (!active) return;
      if (urlError) {
        console.warn("auth redirect handling failed", urlError);
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        navigate({ to: "/" });
      }
    };

    void handleSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate({ to: "/" });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: mode === "signup",
          data: mode === "signup"
            ? { display_name: displayName || email.split("@")[0] }
            : undefined,
        },
      });

      if (error) throw error;

      setInfo(
        mode === "signup"
          ? "We sent you a magic link to create your account. Open it to finish signing in."
          : "We sent you a magic link. Open it from your inbox to continue."
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
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
            ? "Use your email and we'll send you a sign-in link instantly."
            : "Create an account with your email in one step — no password or Google required."}
        </p>

        <div className="mt-5 rounded-xl border border-border bg-surface/70 px-3.5 py-3 text-[12px] text-muted-foreground">
          A magic link will be emailed to you. Open it and you’ll be signed in automatically.
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
            type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-[14px] focus:border-primary focus:outline-none"
          />
          {err && <p className="text-[12px] text-tier-low">{err}</p>}
          {info && <p className="text-[12px] text-muted-foreground">{info}</p>}
          <button
            type="submit" disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Send sign-in link" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(null); }}
          className="mt-4 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "No account? Create one." : "Already have an account? Sign in."}
        </button>
      </div>
    </div>
  );
}
