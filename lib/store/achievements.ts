import { accuracy, type Stats } from "./stats";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  /** Current progress toward the goal. */
  progress: number;
  /** Value of progress that unlocks the achievement. */
  goal: number;
  unlocked: boolean;
}

/** Count of chart cells the player has reached >=80% accuracy on (min 3 plays). */
export function masteredCells(stats: Stats): number {
  return Object.values(stats.mastery).filter(
    (m) => m.seen >= 3 && m.correct / m.seen >= 0.8,
  ).length;
}

/**
 * Derive the achievement list from the current stats. Pure — no persistence of
 * its own, so the display always reflects live stats and survives resets.
 */
export function computeAchievements(stats: Stats): Achievement[] {
  const acc = accuracy(stats);
  const mk = (
    id: string,
    icon: string,
    title: string,
    desc: string,
    progress: number,
    goal: number,
  ): Achievement => ({
    id,
    icon,
    title,
    desc,
    progress: Math.min(progress, goal),
    goal,
    unlocked: progress >= goal,
  });

  return [
    mk("first-hand", "🃏", "First Deal", "Play your first hand", stats.rounds, 1),
    mk("fifty", "🎯", "Getting Warm", "Make 50 strategy decisions", stats.decisions, 50),
    mk(
      "sharp",
      "⚡",
      "Sharp Shooter",
      "Hit a 20-decision streak",
      stats.bestStreak,
      20,
    ),
    mk(
      "accurate",
      "📈",
      "By The Book",
      "Reach 90% accuracy over 100+ decisions",
      stats.decisions >= 100 ? Math.round(acc * 100) : 0,
      90,
    ),
    mk(
      "flawless",
      "💎",
      "Flawless",
      "Reach 98% accuracy over 200+ decisions",
      stats.decisions >= 200 ? Math.round(acc * 100) : 0,
      98,
    ),
    mk(
      "master",
      "🧠",
      "Chart Master",
      "Master 40 different situations",
      masteredCells(stats),
      40,
    ),
    mk(
      "profitable",
      "💰",
      "In The Black",
      "Finish up +100 units",
      Math.max(0, Math.floor(stats.netUnits)),
      100,
    ),
    mk("century", "💯", "Centurion", "Play 100 rounds", stats.rounds, 100),
  ];
}
