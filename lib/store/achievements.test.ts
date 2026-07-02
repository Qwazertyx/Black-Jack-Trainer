import { describe, expect, it } from "vitest";
import { computeAchievements, masteredCells } from "./achievements";
import { emptyStats } from "./stats";

describe("computeAchievements", () => {
  it("locks everything for a fresh player", () => {
    const items = computeAchievements(emptyStats());
    expect(items.every((a) => !a.unlocked)).toBe(true);
    expect(items.find((a) => a.id === "first-hand")!.progress).toBe(0);
  });

  it("unlocks the first-deal and streak achievements", () => {
    const stats = { ...emptyStats(), rounds: 1, bestStreak: 25 };
    const items = computeAchievements(stats);
    expect(items.find((a) => a.id === "first-hand")!.unlocked).toBe(true);
    expect(items.find((a) => a.id === "sharp")!.unlocked).toBe(true);
  });

  it("caps progress at the goal", () => {
    const stats = { ...emptyStats(), rounds: 500 };
    const century = computeAchievements(stats).find((a) => a.id === "century")!;
    expect(century.progress).toBe(century.goal);
  });

  it("only requires high accuracy above the decision threshold", () => {
    const low = { ...emptyStats(), decisions: 50, correct: 50 };
    expect(computeAchievements(low).find((a) => a.id === "accurate")!.unlocked).toBe(false);
    const high = { ...emptyStats(), decisions: 120, correct: 118 };
    expect(computeAchievements(high).find((a) => a.id === "accurate")!.unlocked).toBe(true);
  });
});

describe("masteredCells", () => {
  it("counts cells with >=80% accuracy over at least 3 plays", () => {
    const stats = {
      ...emptyStats(),
      mastery: {
        "hard 16 vs 10": { seen: 5, correct: 5 }, // mastered
        "soft 18 vs 9": { seen: 4, correct: 2 }, // too low
        "8,8 vs 9": { seen: 2, correct: 2 }, // too few plays
      },
    };
    expect(masteredCells(stats)).toBe(1);
  });
});
