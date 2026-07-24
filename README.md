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
