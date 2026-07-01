# Vico Blackjack — Basic Strategy Trainer

A blackjack trainer built to make you a better player. Play real hands, and after
every decision the app tells you the **optimal "by the book" play**, with a clear
explanation and a learning tip. It tracks your accuracy over time and includes a
strategy quiz and a Hi-Lo card-counting drill.

Built with Next.js + TypeScript + Tailwind. Deploys free on Vercel.

## Features

- **Play mode** — Deal hands against a dealer with animated cards. Coach mode grades
  every move (hit / stand / double / split / surrender) instantly and explains why the
  book play is correct.
- **Adaptive strategy engine** — The optimal chart adjusts to your table rules: number
  of decks (1–8), dealer stands/hits soft 17 (S17/H17), double-after-split, late
  surrender, and 3:2 vs 6:5 payouts.
- **Quiz mode** — Rapid-fire random situations to drill the whole strategy chart, with a
  built-in reference chart you can reveal.
- **Counting mode** — Hi-Lo speed-count drill (running/true count) plus a table of the
  most valuable count-based deviations.
- **Stats** — Accuracy over time, accuracy by hand type (hard/soft/pairs), win/loss
  breakdown, streaks, net units, and your most-missed hands. Persisted in the browser.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm test             # run the engine unit tests (Vitest)
npm run lint         # ESLint
```

## Deploying to Vercel (free)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **Add New → Project** and import the repo.
3. Framework preset is auto-detected as **Next.js** — no configuration needed.
4. Click **Deploy**. That's it.

No environment variables, database, or backend are required — all state lives in the
browser via `localStorage`.

## How it works

The domain logic is framework-agnostic and fully unit-tested:

| Area | Location |
| --- | --- |
| Cards, hand values, shoe | `lib/blackjack/cards.ts` |
| Game flow, dealer, payouts | `lib/blackjack/engine.ts` |
| Adaptive basic strategy + explanations | `lib/blackjack/strategy.ts` |
| Hi-Lo counting & index plays | `lib/blackjack/counting.ts` |
| Game state, stats, persistence | `lib/store/` |
| UI (table, quiz, counting, stats, settings) | `components/` |

The strategy charts are the standard 4–8 deck charts with S17/H17, DAS and surrender
variations, plus documented single/double-deck deltas. See `lib/blackjack/strategy.test.ts`
for the cell-by-cell verification.

> A training tool for perfect play. No real money.
