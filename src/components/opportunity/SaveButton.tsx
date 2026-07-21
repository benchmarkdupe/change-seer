import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toggleSaved } from "@/lib/saved.functions";
import { useAuth } from "@/hooks/useAuth";

export function SaveButton({
  opportunityId,
  initiallySaved = false,
  size = "sm",
}: {
  opportunityId: string;
  initiallySaved?: boolean;
  size?: "sm" | "md";
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const toggle = useServerFn(toggleSaved);

  const click = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const res = await toggle({ data: { opportunityId } });
      setSaved(res.saved);
    } finally {
      setBusy(false);
    }
  };

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-4.5 w-4.5";

  return (
    <button
      type="button"
      onClick={click}
      disabled={busy}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      className={`grid ${dim} shrink-0 place-items-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50`}
    >
      {busy ? <Loader2 className={`${icon} animate-spin`} /> : saved ? <BookmarkCheck className={`${icon} text-primary`} /> : <Bookmark className={icon} />}
    </button>
  );
}
