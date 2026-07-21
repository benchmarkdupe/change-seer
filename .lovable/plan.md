
## What I found

You uploaded a solid architecture package (`opportunity-os-architecture.zip`) with:
- Typed contracts: `types/signal.ts`, `types/opportunity.ts`
- Pure scoring: `scoring/ScoringEngine.ts` + versioned `weightProfiles.ts`
- Isolated scouts: `scouts/*` (BaseScout, Business, Reddit, Marketplace, Job, GoogleTrend, planned)
- Mock assembly: `mock/buildOpportunities.ts`
- Presentational components: Dashboard, OpportunityCard, ScoreExplainability, OpportunityDetailPage

The React prototype pasted in chat is a single-file re-implementation of that same architecture (weights, contributions, tiers, seeds).

The current app is a bare TanStack Start template — the placeholder `/` index is still shipping.

## What to preserve vs. refactor

**Preserve**
- Type contracts (`Signal`, `Opportunity`, `ScoreBreakdown`, `ScoreContribution`)
- Pure `ScoringEngine` + versioned `weightProfiles` (`SCORING_VERSION`)
- Scout isolation model (`BaseScout`, `Promise.allSettled` registry)
- Layered evidence → contribution → reason chain (never author reasons independently)

**Refactor / adapt for this repo**
- Port into `src/` with proper TanStack routing, not a single-file component
- Rebuild UI mobile-first with progressive disclosure (the prototype is desktop-first, dense)
- Replace inline hex/COLORS object with real design tokens in `src/styles.css` (oklch)
- Mark all seed data explicitly as SAMPLE — never rendered as "live"
- Keep architecture ready for real providers (scout → normalizer → signal → score) without pretending we have live data

## Phase 1 scope (this pass)

Only Phase 1 from your list. Later phases (backend/auth, real integrations, community) stay stubbed.

### Architecture ported into repo
```
src/
  domain/
    types/         signal.ts, opportunity.ts        (from zip, unchanged)
    scoring/       ScoringEngine.ts, weightProfiles.ts
    scouts/        BaseScout + 5 scouts + registry   (marked as sample sources)
    reasons/       signal→reason templates (single source of truth)
  data/
    sample/        buildSampleOpportunities.ts       (clearly labeled SAMPLE)
    dataState.ts   DataState enum: sample|live|stale|pending|verified
  components/
    opportunity/   OpportunityCard, ScoreTrace, VerificationBadge, DataStateBadge,
                   MetricWithExplainer (tap-to-explain any metric in plain language)
    layout/        MobileTabBar, TopBar, Section, ExpandableEvidence
  routes/
    index.tsx              → Discover (mobile-first list)
    opportunity.$id.tsx    → Opportunity detail (layered 1→4)
    build.tsx              → Phase 2 stub ("Coming — track what you build")
    cashflow.tsx           → Phase 2 stub
    community.tsx          → Phase 3 stub
    profile.tsx            → Phase 2 stub
    about.tsx              → What is OpportunityOS (60-sec explainer)
```

### Design system
- Distinct identity — not another Bloomberg/Notion/Claude clone. Calm, premium, warm-neutral dark surface with a single restrained accent (not purple, not blue-tech). Type: one confident display face + a neutral text face + mono for numeric scores.
- Every color/gradient/shadow becomes an oklch token in `src/styles.css` — no hex in components.
- Score tiers, verification, data-state, and momentum become semantic tokens (`--tier-high`, `--tier-mod`, `--tier-low`, `--state-sample`, `--state-verified`, etc.).

### Layered information model (built into components, not just docs)
Every metric shown to a user renders through one component:
- **L1 Simple** — the number + a one-line plain-English answer
- **L2 Explain** — tap opens a sheet with "what this means" in plain language
- **L3 Evidence** — expandable list of the underlying signals + scout that observed each
- **L4 Deep** — full `ScoreContribution` trace with weight × value × confidence math and `scoringVersion`

### Mobile-first Discover
- Sticky top bar: product mark, search, filter sheet trigger
- Horizontal category chips (scroll)
- Vertical opportunity feed, one card per row, thumb-friendly targets
- Card shows: title, category+region, signal score, tier, momentum arrow, data-state badge (SAMPLE for now), 2 top reasons, tap → detail
- Bottom tab bar: Discover · Build · Cash Flow · Community · Profile

### Opportunity detail (mobile-first, layered)
- Hero: title, category, verification, data-state, signal score with tier
- L1 answers: "What is it?", "Why now?", "Who might this suit?"
- Expandable: Evidence (per-signal, per-scout), Risks, First steps, Capital, Time-to-profit
- "How was this calculated?" opens the full score trace (contribution list, weights, `scoringVersion`)
- Explicit "This is sample data — real scouts not yet connected" banner while data is seeded

### Honesty rails
- `DataStateBadge` on every opportunity — currently `SAMPLE`
- Nothing labeled "live" or "real-time"
- No fake AI chat, no invented facts beyond what the seed signals support
- Reasons/explanations are derived from the `ScoreContribution` array — the UI cannot say something the math doesn't support

### SEO & metadata
- Real title/description on `__root.tsx` and per-route `head()` (Discover, About, each stub)
- `sitemap.xml` route + `robots.txt`

## Explicitly out of scope for this pass
- Lovable Cloud / auth / accounts / saved opportunities
- Real API integrations (Google Trends, Reddit, marketplaces)
- Build/Cash Flow/Community/Profile beyond honest "coming next" stubs
- Onboarding flow beyond the About page (can add in a follow-up)

## Technical notes
- TanStack Start file-based routing, `createFileRoute` strings match filenames
- Sample data loaded synchronously from `src/data/sample/` — no loaders needed yet
- `ScoringEngine` runs once at module load to attach `ScoreBreakdown` to each seed
- All tokens in `src/styles.css` via `@theme inline` + `:root` oklch values
- Preview auto-switched to mobile viewport since the product is mobile-first

Confirm and I'll build it.
