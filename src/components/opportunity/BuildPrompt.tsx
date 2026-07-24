import { useState } from "react";
import { Check, Copy, Wand2 } from "lucide-react";
import { generateBuildPrompt } from "@/domain/buildPrompt";
import type { Opportunity } from "@/domain/types/opportunity";
import { Disclosure } from "./Disclosure";

export function BuildPrompt({ opp, isSample }: { opp: Opportunity; isSample: boolean }) {
  const [copied, setCopied] = useState(false);
  const prompt = generateBuildPrompt(opp, isSample);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be denied/unavailable — the text is still selectable below.
    }
  };

  return (
    <Disclosure title="Build this with AI" subtitle="A ready-to-paste brief for an AI coding agent">
      <p className="text-[13px] leading-relaxed text-foreground/85">
        Paste this into Claude Code, Cursor, ChatGPT, or any AI agent to start building and
        automating this business from the same evidence shown above.
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy prompt"}
      </button>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-border-soft bg-surface-sunken/60 p-3 font-mono text-[11px] leading-relaxed text-foreground/85">
        {prompt}
      </pre>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Wand2 className="h-3 w-3" />
        Generated from this opportunity's evidence and scoring — a starting brief, not a guarantee.
      </p>
    </Disclosure>
  );
}
