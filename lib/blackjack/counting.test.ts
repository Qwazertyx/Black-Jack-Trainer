import { describe, expect, it } from "vitest";
import {
  INDEX_PLAYS,
  deviationApplies,
  randomDeviationQuestion,
  roundedTrueCount,
  shouldTakeInsurance,
} from "./counting";

describe("deviationApplies", () => {
  const stand16 = INDEX_PLAYS.find((p) => p.hand === "16" && p.dealer === "10")!; // index 0
  const hit13 = INDEX_PLAYS.find((p) => p.hand === "13" && p.dealer === "2")!; // index -1

  it("deviates at or above a positive index", () => {
    expect(deviationApplies(stand16, -1)).toBe(false);
    expect(deviationApplies(stand16, 0)).toBe(true);
    expect(deviationApplies(stand16, 4)).toBe(true);
  });

  it("deviates at or below a negative index", () => {
    expect(deviationApplies(hit13, 0)).toBe(false);
    expect(deviationApplies(hit13, -1)).toBe(true);
    expect(deviationApplies(hit13, -3)).toBe(true);
  });
});

describe("randomDeviationQuestion", () => {
  it("answers with the deviation or basic play consistent with the true count", () => {
    for (let i = 0; i < 100; i++) {
      const q = randomDeviationQuestion();
      const expected = deviationApplies(q.play, q.trueCount)
        ? q.play.deviation
        : q.play.basic;
      expect(q.answer).toBe(expected);
    }
  });
});

describe("insurance index", () => {
  it("takes insurance only at true count >= 3", () => {
    expect(shouldTakeInsurance({ running: 6, cardsRemaining: 104 })).toBe(true); // TC 3
    expect(shouldTakeInsurance({ running: 3, cardsRemaining: 104 })).toBe(false); // TC ~1.5
    expect(roundedTrueCount(6, 104)).toBe(3);
  });
});
