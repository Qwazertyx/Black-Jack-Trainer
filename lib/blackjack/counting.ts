import { hiLoValue } from "./cards";
import type { Card } from "./types";

/** Running count contribution of a list of cards. */
export function runningCountOf(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + hiLoValue(c.rank), 0);
}

/**
 * True count = running count divided by the number of decks remaining.
 * We floor to the nearest whole deck the way most trainers teach it.
 */
export function trueCount(running: number, cardsRemaining: number): number {
  const decksRemaining = Math.max(cardsRemaining / 52, 0.25);
  return running / decksRemaining;
}

/** Rounded true count for display / decisions. */
export function roundedTrueCount(running: number, cardsRemaining: number): number {
  return Math.round(trueCount(running, cardsRemaining));
}

export interface CountState {
  running: number;
  cardsRemaining: number;
}

/** Whether taking insurance is +EV under Hi-Lo (true count >= +3). */
export function shouldTakeInsurance(state: CountState): boolean {
  return roundedTrueCount(state.running, state.cardsRemaining) >= 3;
}

/**
 * A compact set of the most valuable Hi-Lo "index plays" (from the
 * Illustrious 18) used to teach count-based deviations. Each entry says:
 * at or beyond `index` true count, deviate to `stand`/`take` instead of the
 * basic-strategy default.
 */
export interface IndexPlay {
  hand: string;
  dealer: string;
  index: number;
  deviation: string;
  basic: string;
}

export const INDEX_PLAYS: IndexPlay[] = [
  { hand: "16", dealer: "10", index: 0, deviation: "Stand", basic: "Hit" },
  { hand: "15", dealer: "10", index: 4, deviation: "Stand", basic: "Hit" },
  { hand: "12", dealer: "3", index: 2, deviation: "Stand", basic: "Hit" },
  { hand: "12", dealer: "2", index: 3, deviation: "Stand", basic: "Hit" },
  { hand: "12", dealer: "4", index: 0, deviation: "Stand", basic: "Hit" },
  { hand: "13", dealer: "2", index: -1, deviation: "Hit", basic: "Stand" },
  { hand: "10", dealer: "10", index: 4, deviation: "Double", basic: "Hit" },
  { hand: "10", dealer: "A", index: 4, deviation: "Double", basic: "Hit" },
  { hand: "11", dealer: "A", index: 1, deviation: "Double", basic: "Hit" },
  { hand: "9", dealer: "2", index: 1, deviation: "Double", basic: "Hit" },
  { hand: "9", dealer: "7", index: 3, deviation: "Double", basic: "Hit" },
  { hand: "16", dealer: "9", index: 5, deviation: "Stand", basic: "Hit" },
  { hand: "13", dealer: "3", index: -2, deviation: "Hit", basic: "Stand" },
  { hand: "Insurance", dealer: "A", index: 3, deviation: "Take", basic: "Decline" },
];

/** Whether, at `trueCount`, the correct move is the deviation (vs the basic play). */
export function deviationApplies(play: IndexPlay, trueCount: number): boolean {
  return play.index >= 0 ? trueCount >= play.index : trueCount <= play.index;
}

export interface DeviationQuestion {
  play: IndexPlay;
  trueCount: number;
  /** The correct label (the deviation text or the basic-play text). */
  answer: string;
}

/** Build a random deviation question: a play plus a true count near its index. */
export function randomDeviationQuestion(
  rng: () => number = Math.random,
): DeviationQuestion {
  const play = INDEX_PLAYS[Math.floor(rng() * INDEX_PLAYS.length)];
  // Sample a true count spread around the index so both answers come up.
  const tc = play.index + Math.floor(rng() * 7) - 3; // index-3 .. index+3
  const answer = deviationApplies(play, tc) ? play.deviation : play.basic;
  return { play, trueCount: tc, answer };
}
