import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Card } from "../blackjack/types";

// The store uses zustand's persist middleware, which needs localStorage at
// import time. Polyfill an in-memory version, then import the store lazily.
function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}

let useGame: typeof import("./useGame").useGame;

const card = (rank: Card["rank"], id: string): Card => ({ rank, suit: "S", id });
const EIGHTS: Card[] = [card("8", "a"), card("8", "b")];
const NINE = card("9", "up");

beforeAll(async () => {
  (globalThis as unknown as { localStorage: Storage }).localStorage =
    memoryStorage() as unknown as Storage;
  ({ useGame } = await import("./useGame"));
});

beforeEach(() => {
  useGame.getState().resetStats();
});

describe("grade() mastery tracking", () => {
  it("records a correct decision as seen + correct for that cell", () => {
    const fb = useGame.getState().grade(EIGHTS, NINE, "split"); // book play: split
    expect(fb.correct).toBe(true);
    expect(useGame.getState().stats.mastery["8,8 vs 9"]).toEqual({ seen: 1, correct: 1 });
  });

  it("records a wrong decision as seen but not correct, and as missed", () => {
    useGame.getState().grade(EIGHTS, NINE, "stand");
    expect(useGame.getState().stats.mastery["8,8 vs 9"]).toEqual({ seen: 1, correct: 0 });
    expect(useGame.getState().stats.missed["8,8 vs 9"]).toBe(1);
  });
});

describe("export / import", () => {
  it("round-trips stats through export then import", () => {
    useGame.getState().grade(EIGHTS, NINE, "split");
    const backup = useGame.getState().exportData();

    useGame.getState().resetStats();
    expect(useGame.getState().stats.mastery["8,8 vs 9"]).toBeUndefined();

    const ok = useGame.getState().importData(backup);
    expect(ok).toBe(true);
    expect(useGame.getState().stats.mastery["8,8 vs 9"]).toEqual({ seen: 1, correct: 1 });
  });

  it("rejects invalid payloads", () => {
    expect(useGame.getState().importData(null)).toBe(false);
    expect(useGame.getState().importData(42)).toBe(false);
    expect(useGame.getState().importData({})).toBe(false);
  });

  it("backfills missing fields when importing a partial backup", () => {
    const ok = useGame.getState().importData({ bankroll: 500, stats: { decisions: 3 } });
    expect(ok).toBe(true);
    expect(useGame.getState().bankroll).toBe(500);
    // Missing mastery/byCategory are filled from empty stats.
    expect(useGame.getState().stats.mastery).toEqual({});
    expect(useGame.getState().stats.decisions).toBe(3);
  });
});
