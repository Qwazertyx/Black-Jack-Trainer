// Core domain types for the blackjack trainer.

export type Suit = "S" | "H" | "D" | "C";

export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
  /** Unique id used for React keys / animations. */
  id: string;
}

/** The moves a player can make on their turn. */
export type Action = "hit" | "stand" | "double" | "split" | "surrender";

/** Result of a single hand from the player's perspective. */
export type Outcome = "blackjack" | "win" | "push" | "lose" | "surrender";

/** Configurable table rules. These drive both the dealer and the strategy engine. */
export interface Rules {
  /** Number of 52-card decks in the shoe (1-8). */
  decks: number;
  /** Dealer hits on soft 17 when true (H17), stands when false (S17). */
  dealerHitsSoft17: boolean;
  /** Double allowed after a split. */
  doubleAfterSplit: boolean;
  /** Late surrender allowed. */
  surrenderAllowed: boolean;
  /** Blackjack payout ratio (1.5 = 3:2, 1.2 = 6:5). */
  blackjackPayout: number;
  /** Fraction of the shoe dealt before reshuffle (penetration). */
  penetration: number;
}

export const DEFAULT_RULES: Rules = {
  decks: 6,
  dealerHitsSoft17: false,
  doubleAfterSplit: true,
  surrenderAllowed: false,
  blackjackPayout: 1.5,
  penetration: 0.75,
};

/** A hand of cards plus its play state. */
export interface Hand {
  cards: Card[];
  /** Amount wagered on this hand. */
  bet: number;
  /** Whether the player has finished acting on this hand. */
  done: boolean;
  /** True once this hand was doubled. */
  doubled: boolean;
  /** True if this hand resulted from a split. */
  fromSplit: boolean;
  /** Resolved outcome, if any. */
  outcome?: Outcome;
}
