import { canDouble, canSplit, canSurrender } from "../blackjack/engine";
import { getAdvice, type StrategyAdvice } from "../blackjack/strategy";
import { handValue } from "../blackjack/cards";
import type { Hand } from "../blackjack/types";
import { cardsRemaining } from "./useGame";
import type { GameStateForSelectors } from "./useGame";

/** Advice for the hand the player is currently acting on, or null. */
export function currentAdvice(state: GameStateForSelectors): StrategyAdvice | null {
  if (state.phase !== "player") return null;
  const hand = state.hands[state.activeHand];
  if (!hand || hand.done) return null;
  const dealerUp = state.dealer[0];
  if (!dealerUp) return null;
  const ctx = {
    canDouble: canDouble(hand, state.settings.rules),
    canSplit: canSplit(hand, state.hands.length),
    canSurrender: canSurrender(hand, state.settings.rules),
  };
  return getAdvice(hand.cards, dealerUp, state.settings.rules, ctx);
}

/** Which actions are legal for the active hand right now. */
export function availableActions(state: GameStateForSelectors) {
  const hand: Hand | undefined = state.hands[state.activeHand];
  if (state.phase !== "player" || !hand) {
    return { hit: false, stand: false, double: false, split: false, surrender: false };
  }
  return {
    hit: true,
    stand: true,
    double: canDouble(hand, state.settings.rules),
    split: canSplit(hand, state.hands.length),
    surrender: canSurrender(hand, state.settings.rules),
  };
}

export function trueCountValue(state: GameStateForSelectors): number {
  const remaining = cardsRemaining(state.shoe);
  const decks = Math.max(remaining / 52, 0.25);
  return state.runningCount / decks;
}

export function handTotalLabel(hand: Hand): string {
  const { total, soft } = handValue(hand.cards);
  if (soft && total <= 21) {
    const low = total - 10;
    return `${low}/${total}`;
  }
  return String(total);
}
