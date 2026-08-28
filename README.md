# Hacker Monitor

A daily snapshot dashboard for the tech/geek community — five tabs, each a card grid you can click into for details, refreshed once a day:

- **Hacker News** — top stories, clickable hot tags, AI-generated summaries, top comments
- **GitHub Trending** — today's trending repos, with description/topics/homepage
- **Dev.to Gamedev** — this week's top `#gamedev` articles
- **Who is Hiring** — postings from HN's monthly "Ask HN: Who is hiring?" thread
- **Stack Overflow** — hot questions (SO's own decaying-activity ranking, not just top-scored)

Styled after [worldmonitor](https://github.com/koala73/worldmonitor)'s dark "intel dashboard" look, but a much smaller stack: Vite + React + TypeScript, no backend.

## How it works

1. A GitHub Actions workflow (`.github/workflows/scrape.yml`) runs daily at **12:00 UTC** and pulls from five sources: the [HN Algolia API](https://hn.algolia.com/api) (front page + comments + the current "Who is hiring?" thread), `github.com/trending` (HTML, no official API) enriched with the GitHub REST API for homepage/topics, the [Dev.to API](https://dev.to/api) filtered to `#gamedev`, and the [Stack Exchange API](https://api.stackexchange.com/) (`sort=hot`, unauthenticated, 300 req/day quota).
2. For each HN story it asks Claude (Haiku 4.5) for a 2-3 sentence summary — from the linked article when there's an external URL, or from the post's own body for text-only Ask/Launch/Show HN posts. Stories with no real content to summarize (paywalled, blocked, or JavaScript-rendered pages with nothing in the static HTML) simply have no summary.
3. The scraper writes the result to `src/data/latest.json` **and** archives a dated copy to `public/data/archive/YYYY-MM-DD.json` (plus an `index.json` of available dates), then the workflow commits both straight to the repo.
4. That push triggers Vercel to rebuild and redeploy — today's snapshot is bundled at build time for a fast first paint; the date pager fetches older archived days on demand as static JSON. No database, no API routes.

Click any card to open its detail modal, and use the date pager to browse previous days.

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

- **Vite + React + TypeScript** — static SPA, today's data baked in at build time, older days fetched on demand from `public/data/archive/`
- **Plain CSS** design tokens matching worldmonitor's dark theme (`src/styles/tokens.css`)
- **Claude Haiku 4.5** (via `@anthropic-ai/sdk`) — generates HN article summaries during the scrape
- **GitHub Actions** — daily cron scrape + commit
- **Vercel** — static hosting, auto-deploy on push
