import { describe, expect, it } from "vitest";
import { classify, describeSituation, situationKey } from "./situationKey";
import { allCells, situationFromCell } from "./quiz";

describe("situationKey", () => {
  it("formats hard, soft and pair keys with dealer labels", () => {
    expect(situationKey("hard", 16, 10)).toBe("hard 16 vs 10");
    expect(situationKey("soft", 18, 11)).toBe("soft 18 vs A");
    expect(situationKey("pair", 8, 9)).toBe("8,8 vs 9");
    expect(situationKey("pair", 11, 6)).toBe("A,A vs 6");
    expect(situationKey("pair", 10, 5)).toBe("10,10 vs 5");
  });
});

describe("situationFromCell round-trips through classify", () => {
  it("rebuilds a hand whose key matches the originating cell", () => {
    for (const cell of allCells()) {
      const { cards, dealerUp } = situationFromCell(cell.section, cell.key, cell.up);
      const back = classify(cards, dealerUp);
      expect(situationKey(back.section, back.key, back.up)).toBe(
        situationKey(cell.section, cell.key, cell.up),
      );
    }
  });

  it("describeSituation agrees with situationKey for a built hand", () => {
    const { cards, dealerUp } = situationFromCell("pair", 8, 9);
    expect(describeSituation(cards, dealerUp)).toBe("8,8 vs 9");
  });
});
