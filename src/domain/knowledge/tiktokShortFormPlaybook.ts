/**
 * Short-form content playbook, derived from an internal analysis of 10,114
 * TikTok videos (consumer niches: beauty, wellness, home, creators/AI/tools,
 * fashion — mix of UGC, brand, and creator content). Transcripts, visual
 * beats, on-screen text, and structural cues (first-cut timing, CTA
 * presence, etc.) were extracted and compared against engagement proxies
 * (saves, comments, shares, completion signals).
 *
 * Directional, not gospel — this is pattern-matching across a real dataset,
 * not a guarantee any single video repeats it. Kept as structured data
 * (rather than only prose) so it's something other code can actually read
 * and use — e.g. domain/buildPrompt.ts folds the condensed version into the
 * AI build prompt for content-business opportunities. The obvious next
 * consumer is ai-ecosystem's own script generation (opportunity-engine's
 * /ideas/:id/script), once that's wired to accept external context — not
 * done here since this repo only has read access to that one.
 */

export interface HookStyle {
  name: string;
  description: string;
  example: string;
}

export interface BeatMapStep {
  step: string;
  timing: string;
  description: string;
}

export interface FormatGuidance {
  format: string;
  bestFor: string;
}

export interface NicheGuidance {
  niche: string;
  patterns: string[];
}

export interface TikTokShortFormPlaybook {
  source: string;
  datasetSize: number;
  datasetDescription: string;
  methodology: string[];
  keyPrinciples: string[];
  hookStyles: HookStyle[];
  structureAndPacing: {
    patterns: string[];
    beatMap: BeatMapStep[];
  };
  formatChoices: FormatGuidance[];
  voiceTextAudio: {
    principles: string[];
    checklist: string[];
  };
  ctaGuidance: string[];
  nicheNuances: NicheGuidance[];
  testPlan: string[];
  closingInsight: string;
}

export const TIKTOK_SHORT_FORM_PLAYBOOK: TikTokShortFormPlaybook = {
  source: "Internal analysis, 10,114 TikTok videos",
  datasetSize: 10114,
  datasetDescription:
    "Consumer niches (beauty, wellness, home, creators/AI/tools, fashion); mix of UGC, brand, and creator content.",
  methodology: [
    "Extracted transcripts, visual beats, on-screen text, and structural cues (first-cut timing, CTA presence, etc.)",
    "Grouped into recurring patterns",
    "Compared patterns against engagement proxies: saves, comments, shares, completion signals where available",
    "Spot-checked individual high-performing videos against the stats to validate patterns",
  ],
  keyPrinciples: [
    "Hooks win or lose the video: open with problem-first, contrarian, or micro-proof to lift hold rates.",
    "Speed matters: a visible change in the first 0:02-0:03 correlates with stronger retention.",
    "On-screen text is underrated: captions + VO consistently outperform VO-only in info-heavy niches.",
    'Clarity beats clever: straightforward claims ("I spent $24 on this and...") outperform vague "you won\'t believe..." teases.',
    "Show the outcome early: an early glimpse of the payoff (before/after, result, end-state) outperforms delayed reveals.",
    'CTAs work best when native: "save this," "link in bio for the exact kit," or "comment \'recipe\' for details" beat hard sells.',
  ],
  hookStyles: [
    {
      name: "Problem-first",
      description: "Open by naming the viewer's problem directly.",
      example: "My skin hates winter. Here's what fixed it.",
    },
    {
      name: "Contrarian take",
      description: "Challenge received wisdom in the niche.",
      example: "Stop double-cleansing — do this instead.",
    },
    {
      name: "Micro-proof",
      description: "Lead with a small, concrete result rather than a promise.",
      example: "I used this for 7 days — look at day 7.",
    },
    {
      name: "Confession/relief",
      description: "Admit a past mistake, then reveal the fix.",
      example: "I wasted $300 on serums until...",
    },
    {
      name: "Price reveal early",
      description: "Lead with cost/value comparison.",
      example: "This is $14 and beats the $60 one.",
    },
  ],
  structureAndPacing: {
    patterns: [
      "Visual change by 0:02-0:03 (cut, zoom, or B-roll swap) correlates with better hold rates.",
      "On-screen text in frame 1 (keyword/benefit) correlates with better hold rates.",
      "Beat map: hook -> micro-proof -> how-to or steps -> soft CTA.",
    ],
    beatMap: [
      {
        step: "Hook (problem/contrarian)",
        timing: "0:00-0:02",
        description: "Grab attention with the problem or a contrarian claim.",
      },
      {
        step: "Micro-proof",
        timing: "0:02-0:04",
        description: "Show a result or clip that proves the hook.",
      },
      { step: 'Steps / "how"', timing: "0:04-0:15", description: "Walk through the how-to." },
      {
        step: "CTA (save/comment/learn more)",
        timing: "last 2s",
        description: "Native, low-friction ask.",
      },
    ],
  },
  formatChoices: [
    { format: "Testimonial + price reveal", bestFor: "Conversion clips" },
    { format: "Routine / step-by-step", bestFor: "Consideration (saves)" },
    { format: "Reaction / duet", bestFor: "Awareness (comments/shares)" },
    { format: "Before/after", bestFor: "Beauty, home DIY, fitness (broadly strong)" },
  ],
  voiceTextAudio: {
    principles: [
      "VO + on-screen captions beat VO-only in instructional niches.",
      'Keyword-first text ("Acne routine for dry skin") outperforms vague titles.',
      "Music is a supporting actor; clarity of message drives performance.",
    ],
    checklist: [
      "Add on-screen text in the first frame.",
      "If VO is dense, keep captions on.",
      "Prioritize clean audio over trendy tracks.",
    ],
  },
  ctaGuidance: [
    'Native actions win: "save this," "comment \'template\'", "DM me \'hook\'".',
    "For product clips, CTAs that point to exact items or recipes reduce friction.",
    'Early micro-CTA ("watch the end for the side-by-side") helps retention.',
  ],
  nicheNuances: [
    { niche: "Skincare/beauty", patterns: ["Proof visuals + captions", "Early result glimpse"] },
    { niche: "Home/DIY", patterns: ["Materials on-screen + step labels", "Fast cuts"] },
    { niche: "Fitness", patterns: ["Timer overlays + rep counts", "Avoid meandering VO"] },
    {
      niche: "SaaS/AI/tools",
      patterns: [
        "Screen recordings with large text and cursor highlights",
        "Promise -> demo -> recap structure",
      ],
    },
  ],
  testPlan: [
    "Pick 1 concept.",
    "Shoot 3 hook styles (problem, contrarian, proof).",
    "Make 2 structure variants (early result vs. delayed result).",
    "Add on-screen text to both; keep VO the same.",
    "Ship 4-6 total variants.",
    "Measure hold to 3s, saves, comments.",
    "Keep the winning hook + structure; rotate topics.",
  ],
  closingInsight:
    "The algorithm isn't random — it rewards clarity, speed, and proof, scoring forwards, saves, comments, and likes at varying weights.",
};

/** Condensed, prompt-ready summary — used by domain/buildPrompt.ts so the full structured
 * data above doesn't have to be manually kept in sync with what gets pasted into an AI prompt. */
export function summarizeTikTokPlaybookForPrompt(): string {
  const p = TIKTOK_SHORT_FORM_PLAYBOOK;
  const hooks = p.hookStyles.map((h) => `- ${h.name}: "${h.example}"`).join("\n");
  const beats = p.structureAndPacing.beatMap
    .map((b) => `${b.timing} — ${b.step}: ${b.description}`)
    .join("\n");
  const ctas = p.ctaGuidance.map((c) => `- ${c}`).join("\n");

  return `Short-form video playbook (from an internal analysis of ${p.datasetSize.toLocaleString()} TikTok videos across ${p.datasetDescription}):

Hook styles that lift hold rate:
${hooks}

Beat map to follow:
${beats}

CTA guidance:
${ctas}

Other principles: ${p.keyPrinciples.join(" ")}`;
}
