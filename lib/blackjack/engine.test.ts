import { describe, expect, it } from "vitest";
import {
  canSplit,
  dealerShouldHit,
  makeHand,
  resolveHand,
} from "./engine";
import { DEFAULT_RULES } from "./types";
import type { Card, Rank, Rules } from "./types";

function c(rank: Rank): Card {
  return { rank, suit: "S", id: `${rank}-${Math.random()}` };
}

const S17: Rules = { ...DEFAULT_RULES, dealerHitsSoft17: false };
const H17: Rules = { ...DEFAULT_RULES, dealerHitsSoft17: true };

describe("dealerShouldHit", () => {
  it("hits below 17", () => {
    expect(dealerShouldHit([c("10"), c("6")], S17)).toBe(true);
  });
  it("stands on hard 17", () => {
    expect(dealerShouldHit([c("10"), c("7")], S17)).toBe(false);
  });
  it("stands on soft 17 under S17 but hits under H17", () => {
    expect(dealerShouldHit([c("A"), c("6")], S17)).toBe(false);
    expect(dealerShouldHit([c("A"), c("6")], H17)).toBe(true);
  });
});

describe("resolveHand", () => {
  it("pays blackjack 3:2", () => {
    const hand = makeHand([c("A"), c("K")], 10);
    const { outcome, net } = resolveHand(hand, [c("10"), c("7")], S17);
    expect(outcome).toBe("blackjack");
    expect(net).toBe(15);
  });
  it("player bust loses even if dealer would bust", () => {
    const hand = makeHand([c("10"), c("10"), c("5")], 10);
    const { outcome, net } = resolveHand(hand, [c("10"), c("6")], S17);
    expect(outcome).toBe("lose");
    expect(net).toBe(-10);
  });
  it("higher total wins", () => {
    const hand = makeHand([c("10"), c("9")], 10);
    const { net } = resolveHand(hand, [c("10"), c("8")], S17);
    expect(net).toBe(10);
  });
  it("equal totals push", () => {
    const hand = makeHand([c("10"), c("8")], 10);
    const { outcome } = resolveHand(hand, [c("10"), c("8")], S17);
    expect(outcome).toBe("push");
  });
  it("surrender loses half", () => {
    const hand = makeHand([c("10"), c("6")], 10);
    hand.outcome = "surrender";
    const { net } = resolveHand(hand, [c("10"), c("7")], S17);
    expect(net).toBe(-5);
  });
  it("split blackjack is only a regular 21", () => {
    const hand = makeHand([c("A"), c("K")], 10, true);
    const { outcome } = resolveHand(hand, [c("10"), c("9")], S17);
    expect(outcome).toBe("win"); // not "blackjack"
  });
});

describe("canSplit", () => {
  it("allows up to 4 hands", () => {
    expect(canSplit(makeHand([c("8"), c("8")], 10), 3)).toBe(true);
    expect(canSplit(makeHand([c("8"), c("8")], 10), 4)).toBe(false);
  });
});
