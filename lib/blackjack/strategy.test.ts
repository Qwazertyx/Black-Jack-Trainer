import { describe, expect, it } from "vitest";
import { getAdvice, lookupCode, upcardValue } from "./strategy";
import { DEFAULT_RULES } from "./types";
import type { Card, Rank, Rules } from "./types";

function c(rank: Rank): Card {
  return { rank, suit: "S", id: `${rank}-${Math.random()}` };
}

const S17: Rules = { ...DEFAULT_RULES, decks: 6, dealerHitsSoft17: false };
const H17: Rules = { ...DEFAULT_RULES, decks: 6, dealerHitsSoft17: true };
const SURR: Rules = { ...S17, surrenderAllowed: true };
const NO_DAS: Rules = { ...S17, doubleAfterSplit: false };

const fullCtx = { canDouble: true, canSplit: true, canSurrender: true };

/** Convenience: ideal chart code for player ranks vs a dealer rank. */
function code(player: Rank[], dealer: Rank, rules: Rules = S17) {
  return lookupCode(player.map(c), upcardValue(c(dealer)), rules).code;
}

describe("hard totals (6-deck S17)", () => {
  it("hits low totals", () => {
    expect(code(["10", "6"], "7")).toBe("H"); // 16 vs 7
    expect(code(["10", "2"], "3")).toBe("H"); // 12 vs 3
  });
  it("stands stiff hands vs weak dealer", () => {
    expect(code(["10", "3"], "4")).toBe("S"); // 13 vs 4
    expect(code(["10", "6"], "6")).toBe("S"); // 16 vs 6
    expect(code(["10", "2"], "6")).toBe("S"); // 12 vs 6
  });
  it("hits 12 vs 2 and 3", () => {
    expect(code(["10", "2"], "2")).toBe("H");
    expect(code(["10", "2"], "3")).toBe("H");
  });
  it("doubles 9 vs 3-6 only", () => {
    expect(code(["5", "4"], "2")).toBe("H");
    expect(code(["5", "4"], "3")).toBe("D");
    expect(code(["5", "4"], "6")).toBe("D");
    expect(code(["5", "4"], "7")).toBe("H");
  });
  it("doubles 10 vs 2-9, hits vs 10/A", () => {
    expect(code(["6", "4"], "9")).toBe("D");
    expect(code(["6", "4"], "10")).toBe("H");
    expect(code(["6", "4"], "A")).toBe("H");
  });
  it("doubles 11 vs 2-10 but hits vs A under S17", () => {
    expect(code(["6", "5"], "10")).toBe("D");
    expect(code(["6", "5"], "A")).toBe("H");
  });
  it("stands on 17+", () => {
    expect(code(["10", "7"], "A")).toBe("S");
  });
});

describe("hard totals (H17 differences)", () => {
  it("doubles 11 vs A under H17", () => {
    expect(code(["6", "5"], "A", H17)).toBe("D");
  });
});

describe("soft totals (6-deck S17)", () => {
  it("A,2 and A,3 double only vs 5-6", () => {
    expect(code(["A", "2"], "4")).toBe("H");
    expect(code(["A", "2"], "5")).toBe("D");
    expect(code(["A", "3"], "6")).toBe("D");
  });
  it("A,6 doubles vs 3-6", () => {
    expect(code(["A", "6"], "2")).toBe("H");
    expect(code(["A", "6"], "3")).toBe("D");
  });
  it("A,7 is Ds vs 2-6, stand vs 7-8, hit vs 9-A", () => {
    expect(code(["A", "7"], "2")).toBe("Ds");
    expect(code(["A", "7"], "6")).toBe("Ds");
    expect(code(["A", "7"], "7")).toBe("S");
    expect(code(["A", "7"], "8")).toBe("S");
    expect(code(["A", "7"], "9")).toBe("H");
    expect(code(["A", "7"], "A")).toBe("H");
  });
  it("A,8 stands under S17 but doubles vs 6 under H17", () => {
    expect(code(["A", "8"], "6")).toBe("S");
    expect(code(["A", "8"], "6", H17)).toBe("Ds");
  });
});

describe("pairs (6-deck, DAS)", () => {
  it("always splits aces and eights", () => {
    expect(code(["A", "A"], "A")).toBe("P");
    expect(code(["8", "8"], "10")).toBe("P");
  });
  it("never splits tens or fives", () => {
    expect(code(["10", "K"], "6")).toBe("S");
    expect(code(["5", "5"], "6")).toBe("D");
  });
  it("splits 9s except vs 7,10,A", () => {
    expect(code(["9", "9"], "6")).toBe("P");
    expect(code(["9", "9"], "7")).toBe("S");
    expect(code(["9", "9"], "9")).toBe("P");
    expect(code(["9", "9"], "10")).toBe("S");
  });
  it("splits 2s/3s vs 2-7 with DAS, vs 4-7 without", () => {
    expect(code(["2", "2"], "2")).toBe("P");
    expect(code(["2", "2"], "2", NO_DAS)).toBe("H");
    expect(code(["3", "3"], "4", NO_DAS)).toBe("P");
  });
  it("splits 4s only vs 5-6 with DAS", () => {
    expect(code(["4", "4"], "5")).toBe("P");
    expect(code(["4", "4"], "5", NO_DAS)).toBe("H");
  });
});

describe("surrender", () => {
  it("surrenders 16 vs 9,10,A and 15 vs 10", () => {
    expect(code(["10", "6"], "9", SURR)).toBe("R");
    expect(code(["10", "6"], "10", SURR)).toBe("R");
    expect(code(["10", "5"], "10", SURR)).toBe("R");
    expect(code(["10", "5"], "9", SURR)).toBe("H"); // 15 vs 9 is a hit, not surrender
  });
  it("does not surrender when disallowed", () => {
    expect(code(["10", "6"], "10", S17)).toBe("H");
  });
});

describe("getAdvice resolution", () => {
  it("falls back to hit when doubling is not allowed", () => {
    const a = getAdvice([c("6"), c("5")], c("6"), S17, {
      ...fullCtx,
      canDouble: false,
    });
    expect(a.action).toBe("hit");
    expect(a.code).toBe("D");
  });
  it("falls back to the total when splitting is not allowed", () => {
    // 8,8 vs 10 with no split -> hard 16 vs 10 -> hit
    const a = getAdvice([c("8"), c("8")], c("10"), S17, {
      ...fullCtx,
      canSplit: false,
    });
    expect(a.action).toBe("hit");
  });
  it("produces a non-empty reason and tip", () => {
    const a = getAdvice([c("10"), c("6")], c("10"), S17, fullCtx);
    expect(a.action).toBe("hit");
    expect(a.reason.length).toBeGreaterThan(10);
    expect(a.tip.length).toBeGreaterThan(5);
  });
});
