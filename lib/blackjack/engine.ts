import { buildShoe, handValue, isBlackjack, shuffle } from "./cards";
import type { Card, Hand, Outcome, Rules } from "./types";

/** A shoe with a draw pointer and reshuffle bookkeeping. */
export interface Shoe {
  cards: Card[];
  /** Index of the next card to draw. */
  pos: number;
  /** Cards drawn triggers a reshuffle once pos crosses this. */
  cut: number;
}

export function createShoe(rules: Rules): Shoe {
  const cards = shuffle(buildShoe(rules.decks));
  const cut = Math.floor(cards.length * rules.penetration);
  return { cards, pos: 0, cut };
}

/** True when the cut card has been reached and the shoe should be reshuffled. */
export function needsReshuffle(shoe: Shoe): boolean {
  return shoe.pos >= shoe.cut;
}

/** Draw a single card, mutating the shoe pointer. Reshuffles if exhausted. */
export function draw(shoe: Shoe): Card {
  if (shoe.pos >= shoe.cards.length) {
    // Safety: reshuffle a fresh permutation if somehow exhausted mid-hand.
    shoe.cards = shuffle(shoe.cards);
    shoe.pos = 0;
  }
  return shoe.cards[shoe.pos++];
}

export function makeHand(cards: Card[], bet: number, fromSplit = false): Hand {
  return { cards, bet, done: false, doubled: false, fromSplit };
}

/** Whether the dealer must draw another card given the current rules. */
export function dealerShouldHit(cards: Card[], rules: Rules): boolean {
  const { total, soft } = handValue(cards);
  if (total < 17) return true;
  if (total === 17 && soft && rules.dealerHitsSoft17) return true;
  return false;
}

/** Play out the dealer's hand to completion, mutating the shoe. */
export function playDealer(dealer: Card[], shoe: Shoe, rules: Rules): Card[] {
  const hand = dealer.slice();
  while (dealerShouldHit(hand, rules)) {
    hand.push(draw(shoe));
  }
  return hand;
}

/** Resolve a finished player hand against the dealer's final hand. */
export function resolveHand(
  player: Hand,
  dealer: Card[],
  rules: Rules,
): { outcome: Outcome; net: number } {
  if (player.outcome === "surrender") {
    return { outcome: "surrender", net: -player.bet / 2 };
  }

  const playerBJ = isBlackjack(player.cards) && !player.fromSplit;
  const dealerBJ = isBlackjack(dealer);
  const p = handValue(player.cards).total;
  const d = handValue(dealer).total;

  if (playerBJ && dealerBJ) return { outcome: "push", net: 0 };
  if (playerBJ) return { outcome: "blackjack", net: player.bet * rules.blackjackPayout };
  if (dealerBJ) return { outcome: "lose", net: -player.bet };

  if (p > 21) return { outcome: "lose", net: -player.bet };
  if (d > 21) return { outcome: "win", net: player.bet };
  if (p > d) return { outcome: "win", net: player.bet };
  if (p < d) return { outcome: "lose", net: -player.bet };
  return { outcome: "push", net: 0 };
}

// --- Action availability -------------------------------------------------

export function canDouble(hand: Hand, rules: Rules): boolean {
  if (hand.cards.length !== 2) return false;
  if (hand.fromSplit && !rules.doubleAfterSplit) return false;
  return true;
}

export function canSplit(hand: Hand, handCount: number): boolean {
  if (hand.cards.length !== 2) return false;
  // Compare rank *values* so 10-J etc. can split.
  const [a, b] = hand.cards;
  const val = (r: Card["rank"]) =>
    r === "A" ? 11 : r === "J" || r === "Q" || r === "K" ? 10 : parseInt(r, 10);
  if (val(a.rank) !== val(b.rank)) return false;
  // Cap total hands at 4 (3 splits).
  return handCount < 4;
}

export function canSurrender(hand: Hand, rules: Rules): boolean {
  return rules.surrenderAllowed && hand.cards.length === 2 && !hand.fromSplit;
}
