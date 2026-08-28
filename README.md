# Hacker Monitor

A daily snapshot dashboard for [Hacker News](https://news.ycombinator.com/) — top stories in a card grid, clickable hot tags, AI-generated article summaries, and top comments, refreshed once a day.

Styled after [worldmonitor](https://github.com/koala73/worldmonitor)'s dark "intel dashboard" look, but a much smaller stack: Vite + React + TypeScript, no backend.

## How it works

1. A GitHub Actions workflow (`.github/workflows/scrape.yml`) runs daily at **12:00 UTC**, calling the [HN Algolia API](https://hn.algolia.com/api) to pull the current front page (top 30 stories) plus each story's top comments.
2. For each story it asks Claude (Haiku 4.5) for a 2-3 sentence summary — from the linked article when there's an external URL, or from the post's own body for text-only Ask/Launch/Show HN posts. Stories with no real content to summarize (paywalled, blocked, or JavaScript-rendered pages with nothing in the static HTML — e.g. some job board links) simply have no summary.
3. The scraper writes the result to `src/data/latest.json` and the workflow commits it straight to the repo.
4. That push triggers Vercel to rebuild and redeploy — the JSON is bundled at build time, so the site is a fully static snapshot. No database, no API routes.

Click any story card to open its detail modal — full title, AI summary, and top comments.

Run the scraper manually any time:

```bash
npm run scrape
```

Trigger it on demand from GitHub via the "Run workflow" button on the Scrape Hacker News action (or `gh workflow run scrape.yml`).

## Local development

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # optional — omit to skip AI summaries locally
npm run scrape   # populate src/data/latest.json with real data
npm run dev
```

## Deployment

Import this repo into Vercel (framework preset: Vite, no environment variables required — the summaries are baked into the committed JSON, not fetched at request time).

For the daily scrape to generate summaries, add an `ANTHROPIC_API_KEY` repo secret: **Settings → Secrets and variables → Actions → New repository secret**. Without it, the scraper still runs and just skips summaries.

Every push to `main` — including the daily automated data-refresh commit — triggers a new Vercel deployment.

## Stack

- **Vite + React + TypeScript** — static SPA, data baked in at build time
- **Plain CSS** design tokens matching worldmonitor's dark theme (`src/styles/tokens.css`)
- **Claude Haiku 4.5** (via `@anthropic-ai/sdk`) — generates article summaries during the scrape
- **GitHub Actions** — daily cron scrape + commit
- **Vercel** — static hosting, auto-deploy on push
