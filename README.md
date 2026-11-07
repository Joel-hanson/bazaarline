# Bazaarline

India equity crash-perspective insights, in the spirit of data-journalism drawdown briefs. The homepage compares the open **2026 Nifty 50 correction** with earlier Indian market slides (2008, Covid, 2011, 2015–16, and more) using **live Yahoo Finance daily closes**.

## What you get

- Live headline stats for Nifty 50 vs its record close
- Overlay chart of major Nifty drawdowns from each peak
- Depth scatter of every ≥6% fall since 2007
- Cross-index comparison: Nifty 50, Sensex, Bank Nifty, Nifty IT
- Recovery-time table across those indices
- JSON feed at `/api/insights`
- Offline fallback snapshot if Yahoo is unreachable

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3847](http://localhost:3847).

Production (Node server):

```bash
npm run build
npm start
```

### GitHub Pages

Live site: [https://joelhanson.com/bazaarline/](https://joelhanson.com/bazaarline/)

Static export (same path as the repo name):

```bash
npm run build:pages
```

`.github/workflows/deploy-github-pages.yml` builds and deploys on every push to `main`. Insights are baked at build time (Yahoo when reachable, otherwise the committed fallback snapshots). The JSON feed is available at `/bazaarline/api/insights` on Pages.

## Market data refresh

Snapshots under `src/lib/market/data/` back the offline fallback. Refresh them anytime:

```bash
npm run update-data
```

### GitHub Actions (weekly)

`.github/workflows/update-market-data.yml` runs every Monday at 02:30 UTC (`workflow_dispatch` also works). It fetches Yahoo closes, commits any changes to the snapshot JSON, and pushes to `main` — which also retriggers the Pages deploy.

## Data notes

- Sources: Yahoo Finance chart API for `^NSEI`, `^BSESN`, `^NSEBANK`, `^CNXIT`
- Price indices only (no dividends)
- A “fall” is measured from a record close to the next record; depth is the lowest close in between
- Live pages revalidate about every hour; weekly Actions keep the committed fallback current

Not investment advice.
