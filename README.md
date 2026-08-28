# Hacker Monitor

A daily snapshot dashboard for [Hacker News](https://news.ycombinator.com/) — top stories, hot topics, and top comments, refreshed once a day.

Styled after [worldmonitor](https://github.com/koala73/worldmonitor)'s dark "intel dashboard" look, but a much smaller stack: Vite + React + TypeScript, no backend.

## How it works

1. A GitHub Actions workflow (`.github/workflows/scrape.yml`) runs daily at **12:00 UTC**, calling the [HN Algolia API](https://hn.algolia.com/api) to pull the current front page (top 30 stories) plus each story's top comments.
2. The scraper writes the result to `src/data/latest.json` and the workflow commits it straight to the repo.
3. That push triggers Vercel to rebuild and redeploy — the JSON is bundled at build time, so the site is a fully static snapshot. No database, no API routes.

Run the scraper manually any time:

```bash
npm run scrape
```

Trigger it on demand from GitHub via the "Run workflow" button on the Scrape Hacker News action (or `gh workflow run scrape.yml`).

## Local development

```bash
npm install
npm run scrape   # populate src/data/latest.json with real data
npm run dev
```

## Deployment

Import this repo into Vercel (framework preset: Vite, no environment variables required). Every push to `main` — including the daily automated data-refresh commit — triggers a new deployment.

## Stack

- **Vite + React + TypeScript** — static SPA, data baked in at build time
- **Plain CSS** design tokens matching worldmonitor's dark theme (`src/styles/tokens.css`)
- **GitHub Actions** — daily cron scrape + commit
- **Vercel** — static hosting, auto-deploy on push
