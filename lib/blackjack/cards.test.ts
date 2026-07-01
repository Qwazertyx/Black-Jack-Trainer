import { describe, expect, it } from "vitest";
import { buildShoe, handValue, isBlackjack, pairValue, shuffle } from "./cards";
import type { Card, Rank } from "./types";

function c(rank: Rank): Card {
  return { rank, suit: "S", id: `${rank}-${Math.random()}` };
}

describe("handValue", () => {
  it("counts a hard hand", () => {
    expect(handValue([c("10"), c("7")])).toEqual({ total: 17, soft: false });
  });

  it("treats a lone ace as 11 (soft)", () => {
    expect(handValue([c("A"), c("6")])).toEqual({ total: 17, soft: true });
  });

  it("reduces an ace to avoid busting", () => {
    expect(handValue([c("A"), c("6"), c("10")])).toEqual({ total: 17, soft: false });
  });

  it("handles multiple aces", () => {
    expect(handValue([c("A"), c("A")])).toEqual({ total: 12, soft: true });
    expect(handValue([c("A"), c("A"), c("9")])).toEqual({ total: 21, soft: true });
  });

  it("counts face cards as 10", () => {
    expect(handValue([c("K"), c("Q")]).total).toBe(20);
  });
});

describe("isBlackjack", () => {
  it("detects a two-card 21", () => {
    expect(isBlackjack([c("A"), c("K")])).toBe(true);
  });
  it("rejects a three-card 21", () => {
    expect(isBlackjack([c("7"), c("7"), c("7")])).toBe(false);
  });
});

describe("pairValue", () => {
  it("recognises rank pairs", () => {
    expect(pairValue([c("8"), c("8")])).toBe(8);
  });
  it("recognises ten-value pairs across ranks", () => {
    expect(pairValue([c("10"), c("K")])).toBe(10);
  });
  it("returns null for non-pairs", () => {
    expect(pairValue([c("8"), c("9")])).toBeNull();
  });
});

describe("shoe", () => {
  it("builds 52 cards per deck", () => {
    expect(buildShoe(6)).toHaveLength(312);
  });
  it("shuffle preserves the multiset", () => {
    const shoe = buildShoe(1);
    const shuffled = shuffle(shoe);
    expect(shuffled).toHaveLength(52);
    const count = (arr: Card[]) => arr.filter((x) => x.rank === "A").length;
    expect(count(shuffled)).toBe(4);
  });
});
