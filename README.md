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

Production:

```bash
npm run build
npm start
```

## Data notes

- Sources: Yahoo Finance chart API for `^NSEI`, `^BSESN`, `^NSEBANK`, `^CNXIT`
- Price indices only (no dividends)
- A “fall” is measured from a record close to the next record; depth is the lowest close in between
- Pages and the API revalidate about every hour

Not investment advice.
