import type { Card, Rank, Suit } from "./types";

export const SUITS: Suit[] = ["S", "H", "D", "C"];
export const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

/** Baseline point value of a rank (ace counts as 11 before soft reduction). */
export function rankValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return parseInt(rank, 10);
}

/** Hi-Lo running-count contribution of a card. */
export function hiLoValue(rank: Rank): number {
  const v = rankValue(rank);
  if (rank === "A" || v === 10) return -1; // 10, J, Q, K, A
  if (v >= 2 && v <= 6) return 1; // 2-6
  return 0; // 7-9
}

/** Build an unshuffled shoe of `decks` decks. */
export function buildShoe(decks: number): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ rank, suit, id: `${d}-${suit}-${rank}-${shoe.length}` });
      }
    }
  }
  return shoe;
}

/** Fisher-Yates shuffle returning a new array. */
export function shuffle<T>(input: T[], rng: () => number = Math.random): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface HandValue {
  /** Best total <= 21 when possible. */
  total: number;
  /** True when an ace is still counted as 11 (a "soft" hand). */
  soft: boolean;
}

/** Compute the best total for a set of cards, tracking softness. */
export function handValue(cards: Card[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += rankValue(c.rank);
    if (c.rank === "A") aces++;
  }
  // Reduce aces from 11 to 1 while busting.
  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces--;
  }
  return { total, soft: softAces > 0 };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards).total > 21;
}

/** Returns the shared rank value when the two cards form a splittable pair. */
export function pairValue(cards: Card[]): number | null {
  if (cards.length !== 2) return null;
  const a = rankValue(cards[0].rank);
  const b = rankValue(cards[1].rank);
  return a === b ? a : null;
}
