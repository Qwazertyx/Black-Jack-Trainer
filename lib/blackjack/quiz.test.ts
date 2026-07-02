import { describe, expect, it } from "vitest";
import { handValue } from "./cards";
import { classify } from "./situationKey";
import { allCells, situationFromCell, weakSituation } from "./quiz";

describe("situationFromCell", () => {
  it("never builds a hard total as a pair or with an ace", () => {
    for (const cell of allCells().filter((c) => c.section === "hard")) {
      const { cards } = situationFromCell(cell.section, cell.key, cell.up);
      expect(cards[0].rank).not.toBe("A");
      expect(cards[1].rank).not.toBe("A");
      expect(handValue(cards).total).toBe(cell.key);
      expect(handValue(cards).soft).toBe(false);
    }
  });

  it("builds soft hands with an ace", () => {
    const { cards } = situationFromCell("soft", 17, 6); // A,6
    expect(cards.some((c) => c.rank === "A")).toBe(true);
    expect(handValue(cards)).toEqual({ total: 17, soft: true });
  });
});

describe("weakSituation", () => {
  it("returns the first cell when the RNG picks the lowest weight bucket", () => {
    // Empty mastery -> every cell weight 5; rng 0 selects the first cell.
    const { cards, dealerUp } = weakSituation({}, () => 0);
    const c = classify(cards, dealerUp);
    expect(c).toEqual({ section: "hard", key: 8, up: 2 });
  });

  it("always yields a valid two-card situation", () => {
    for (let i = 0; i < 50; i++) {
      const s = weakSituation({ "hard 16 vs 10": { seen: 4, correct: 0 } });
      expect(s.cards).toHaveLength(2);
      expect(s.dealerUp).toBeDefined();
    }
  });
});
