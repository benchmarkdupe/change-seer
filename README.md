# OpportunityOS

This project is built with TanStack Start, React, Tailwind CSS, and Supabase.

## Development

Run the app locally with Node.js and npm.

- **Iterate quickly**: build, run, and refine the app from your local environment.
- **Stay in sync**: connect the project to GitHub and keep your changes versioned in your repository.
- **Own your stack**: this code is yours to run, extend, and deploy as needed.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deployment (Docker / self-hosted, e.g. Hetzner)

Assuming `ai-ecosystem` is already running on the VPS via its own `docker compose` (in a
directory called `ai-ecosystem`, the default project name Compose derives from it):

```sh
# on the VPS, next to (not inside) the ai-ecosystem checkout
git clone <this-repository-url> change-seer
cd change-seer

# .env already has the public Supabase URL/key committed. Add the two secrets
# it doesn't (never commit these):
echo 'SUPABASE_SERVICE_ROLE_KEY=...' >> .env        # from Supabase dashboard > Settings > API
echo 'AI_ECOSYSTEM_API_KEY=...' >> .env              # only if ai-ecosystem's .env sets API_KEY

docker compose up -d --build
```

That's it — `docker-compose.yml` already points `AI_ECOSYSTEM_OPPORTUNITY_ENGINE_URL` and
`AI_ECOSYSTEM_YOUTUBE_WORKER_URL` at ai-ecosystem's internal service hostnames and joins its
Docker network, so no public URL or extra exposed ports are needed for that traffic. Verify
with `docker compose logs -f change-seer` and `curl http://localhost:3000`.

- Serves on port 3000 by default (`PORT` env var to change it, or put a reverse proxy /
  domain in front of it — nothing in this repo assumes one).
- If ai-ecosystem's compose project isn't named `ai-ecosystem` (check with
  `docker network ls`), set `AI_ECOSYSTEM_NETWORK=<that>_default` in `.env` first.
- Running standalone, without ai-ecosystem on the same host? Delete the `networks:` block
  and the two `AI_ECOSYSTEM_*` lines in `docker-compose.yml`, and set
  `AI_ECOSYSTEM_OPPORTUNITY_ENGINE_URL`/`AI_ECOSYSTEM_YOUTUBE_WORKER_URL` to its public
  URL(s) instead.
- `Dockerfile` is a two-stage build: `npm run build` (TanStack Start/Nitro →
  `dist/client` + `dist/server`), then a slim runtime image running
  `npm run start`, which is `srvx serve` pointed at the built server entry
  with the client build served as static assets.
- To pull in future changes: `git pull && docker compose up -d --build`.

## AI Ecosystem integration

OpportunityOS consumes [`ai-ecosystem`](https://github.com/benchmarkdupe/ai-ecosystem) — our
self-hosted backend that researches ideas for autonomous content businesses via a 2-step
analyst→critic AI chain — as a real live data source, the same way it consumes Hacker News.
`src/lib/ai-ecosystem.server.ts` calls its `opportunity-engine` service's `GET /ideas` over
HTTP (auth'd with `x-api-key` if `API_KEY` is set on that deployment), normalizes each
researched idea's 5-dimension analysis into Signals, and feeds them through the same
`ScoringEngine`/Supabase pipeline as every other scout — see
`src/lib/opportunities.functions.ts`'s `getLiveAiEcosystemOpportunities` and the shared
orchestration in `src/lib/live-signal-source.server.ts`.

Both projects stay independent repos and independent deployments — this is an HTTP client
relationship, not a merged codebase. To enable it:

1. Deploy/run `ai-ecosystem` (see its own README — `docker compose up -d --build`).
2. Set `AI_ECOSYSTEM_OPPORTUNITY_ENGINE_URL` (e.g. `http://<your-server>:3001`) here.
3. If that deployment sets `API_KEY`, set the matching `AI_ECOSYSTEM_API_KEY` here as a
   secret via your hosting provider (not in `.env` — same handling as
   `SUPABASE_SERVICE_ROLE_KEY`).

If unset, this source degrades to an empty list rather than breaking the Discover feed.

**Auto-seeding**: rather than waiting for someone to manually create ideas in ai-ecosystem's
own dashboard, `getLiveAiEcosystemOpportunities` feeds a few of our own real trending signals
(currently top Hacker News titles) in as candidate idea titles on every refresh, so this feed
has fresh AI-researched "upcoming side business" analysis to show. Controlled by
`AI_ECOSYSTEM_SEED_PER_REFRESH` (default 1) — see the comment in `.env` and
`src/lib/ai-ecosystem.server.ts`'s `seedIdeasFromCandidates` for the free-tier OpenRouter
rate-limit math before raising it.

**YouTube performance as verification** (`AI_ECOSYSTEM_YOUTUBE_WORKER_URL`, optional): once
an idea has been scripted, produced, and published by ai-ecosystem's `youtube-worker`
service, `fetchPublishedProductionsByIdeaId` in `ai-ecosystem.server.ts` pulls that
production's real view/like/comment counts and folds them in as a high-confidence
`verification_confidence` signal — the opportunity flips from `pending` to `verified` and its
summary/evidence cite the actual numbers instead of only the pre-launch AI estimate. This is
the strongest evidence tier the app has anywhere: measured audience outcome, not a guess.
Reads youtube-worker's already-cached analytics rather than forcing a fresh YouTube Data API
call every refresh, to stay well inside its quota.

## AI build prompt

Every opportunity's detail page has a "Build this with AI" section
(`src/components/opportunity/BuildPrompt.tsx`) that generates a ready-to-copy brief — the
opportunity's evidence, scoring, risks, and a starting sequence — for pasting into an AI
coding agent (Claude Code, Cursor, ChatGPT, etc.) to actually build and automate the
business. Pure function of the already-loaded `Opportunity`
(`src/domain/buildPrompt.ts`), so it works for sample and live opportunities alike with no
extra fetch.
