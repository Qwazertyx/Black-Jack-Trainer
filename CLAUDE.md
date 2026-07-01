# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build (also runs full TypeScript checking)
- `npm test` — run the Vitest engine unit tests
- `npx vitest run lib/blackjack/strategy.test.ts` — run a single test file
- `npm run lint` — ESLint

There is an optional Playwright smoke test at `scripts/verify.mjs`; it is not wired into
`npm test` and requires Playwright to be installed on demand (see the file header).

## Architecture

This is a Next.js (App Router) blackjack **trainer**: the point is not just to play, but to
learn perfect basic strategy. The codebase is deliberately split into a framework-agnostic,
unit-tested domain layer and a thin React/UI layer on top.

### Domain layer (`lib/blackjack/`) — pure TypeScript, no React

- `cards.ts` — card model, shoe building/shuffling, `handValue` (soft/hard totals), Hi-Lo values.
- `engine.ts` — dealer play rules (S17/H17), outcome resolution & payouts, and the
  `canDouble` / `canSplit` / `canSurrender` availability helpers.
- `strategy.ts` — **the heart of the app.** `getAdvice()` returns the optimal action plus a
  human explanation. Internally, `hardCode` / `softCode` / `pairCode` encode the standard
  4–8 deck basic-strategy chart with S17/H17, DAS and surrender variations (and documented
  single/double-deck deltas). Strategy codes (`H`, `S`, `D`, `Ds`, `P`, `R`, `Rs`) are then
  resolved into a concrete action based on what's currently legal.
- `counting.ts` — Hi-Lo running/true count and the "index play" deviation table.
- `quiz.ts` — random situation generator for quiz mode.

When changing strategy, update `strategy.test.ts` in lockstep — it verifies the chart
cell-by-cell against published charts and is the safety net for the "by the book" promise.

### State layer (`lib/store/`) — Zustand

- `useGame.ts` — the single store. It owns the whole round flow (`deal` → `act` → internal
  `_advance` → `_finishRound`), settings (rules + coach/hint/count toggles), bankroll, and the
  live Hi-Lo running count. `act()` grades each decision against `getAdvice()` **before**
  applying it, which is what drives coach feedback and stats. Persisted to `localStorage`
  (settings, stats, bankroll only) via the `persist` middleware.
- `stats.ts` — pure stat-accumulation helpers (`recordDecision`, `recordOutcome`).
- `selectors.ts` — derived values (current advice/hint, legal actions, true count).

### UI layer (`app/`, `components/`)

`app/page.tsx` is a client component with tab navigation across five modes: Play, Quiz,
Counting, Stats, Settings. It gates rendering on a `mounted` flag so the persisted store
hydrates before store-dependent UI renders (avoids hydration mismatch — keep this pattern).

Components mostly read the store directly via `useGame`. `StrategyChart` renders the live
chart for the current rules and is reused in Quiz and Settings.

### Conventions

- Deploy target is Vercel; there is no backend. Do not introduce server state or env vars
  without reason — all persistence is `localStorage`.
- Keep game logic in `lib/` (testable) rather than in components.
- Tailwind v4 (CSS-first config in `app/globals.css`, no `tailwind.config`). The dark casino
  theme colors (`felt-*`, `gold*`, `cream`, `ink`) and helper classes (`.glass`,
  `.felt-inset`) are defined there.
