import type { Category } from "../blackjack/strategy";
import type { Outcome } from "../blackjack/types";

export interface CategoryStat {
  correct: number;
  total: number;
}

export interface Stats {
  /** Rounds completed. */
  rounds: number;
  /** Individual hands resolved (splits count separately). */
  handsResolved: number;
  /** Strategy decisions evaluated. */
  decisions: number;
  correct: number;
  byCategory: Record<Category, CategoryStat>;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  surrenders: number;
  /** Net result in betting units. */
  netUnits: number;
  currentStreak: number;
  bestStreak: number;
  /** Rolling log of recent decisions for the accuracy chart. */
  history: { correct: boolean }[];
  /** Count of how often each situation was played wrong. */
  missed: Record<string, number>;
  /** Per-situation mastery: how often each cell was seen and played correctly. */
  mastery: Record<string, { seen: number; correct: number }>;
}

export function emptyStats(): Stats {
  return {
    rounds: 0,
    handsResolved: 0,
    decisions: 0,
    correct: 0,
    byCategory: {
      hard: { correct: 0, total: 0 },
      soft: { correct: 0, total: 0 },
      pair: { correct: 0, total: 0 },
    },
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    surrenders: 0,
    netUnits: 0,
    currentStreak: 0,
    bestStreak: 0,
    history: [],
    missed: {},
    mastery: {},
  };
}

const HISTORY_CAP = 200;

/** Record a single strategy decision into the stats object (mutates a copy). */
export function recordDecision(
  stats: Stats,
  category: Category,
  correct: boolean,
  missKey?: string,
): Stats {
  const next: Stats = {
    ...stats,
    byCategory: { ...stats.byCategory, [category]: { ...stats.byCategory[category] } },
    history: [...stats.history, { correct }].slice(-HISTORY_CAP),
    missed: { ...stats.missed },
    mastery: { ...stats.mastery },
  };
  next.decisions += 1;
  next.byCategory[category].total += 1;
  if (missKey) {
    const m = next.mastery[missKey] ?? { seen: 0, correct: 0 };
    next.mastery[missKey] = { seen: m.seen + 1, correct: m.correct + (correct ? 1 : 0) };
  }
  if (correct) {
    next.correct += 1;
    next.byCategory[category].correct += 1;
    next.currentStreak += 1;
    next.bestStreak = Math.max(next.bestStreak, next.currentStreak);
  } else {
    next.currentStreak = 0;
    if (missKey) next.missed[missKey] = (next.missed[missKey] ?? 0) + 1;
  }
  return next;
}

/** Record the outcome of a resolved hand. */
export function recordOutcome(stats: Stats, outcome: Outcome, net: number): Stats {
  const next: Stats = { ...stats };
  next.handsResolved += 1;
  next.netUnits = +(next.netUnits + net).toFixed(2);
  switch (outcome) {
    case "blackjack":
      next.blackjacks += 1;
      next.wins += 1;
      break;
    case "win":
      next.wins += 1;
      break;
    case "lose":
      next.losses += 1;
      break;
    case "push":
      next.pushes += 1;
      break;
    case "surrender":
      next.surrenders += 1;
      next.losses += 1;
      break;
  }
  return next;
}

export function accuracy(stats: Stats): number {
  return stats.decisions === 0 ? 0 : stats.correct / stats.decisions;
}
