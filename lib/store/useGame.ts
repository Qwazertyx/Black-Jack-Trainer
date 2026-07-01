import { create } from "zustand";
import { persist } from "zustand/middleware";
import { handValue, hiLoValue, isBlackjack, pairValue } from "../blackjack/cards";
import {
  canDouble,
  canSplit,
  canSurrender,
  createShoe,
  draw,
  makeHand,
  needsReshuffle,
  playDealer,
  resolveHand,
  type Shoe,
} from "../blackjack/engine";
import {
  getAdvice,
  upcardValue,
  type StrategyAdvice,
} from "../blackjack/strategy";
import { DEFAULT_RULES, type Action, type Card, type Hand, type Rules } from "../blackjack/types";
import { emptyStats, recordDecision, recordOutcome, type Stats } from "./stats";

export type Phase = "idle" | "player" | "dealer" | "over";

export interface Settings {
  rules: Rules;
  /** Show the optimal move as a hint before the player acts. */
  showHints: boolean;
  /** Give immediate correct/incorrect feedback after each action. */
  coachMode: boolean;
  /** Overlay the running/true count on the table. */
  showCount: boolean;
}

export interface DecisionFeedback {
  chosen: Action;
  optimal: Action;
  correct: boolean;
  advice: StrategyAdvice;
}

interface GameState {
  settings: Settings;
  stats: Stats;

  // Transient round state (not persisted).
  phase: Phase;
  shoe: Shoe;
  dealer: Card[];
  holeHidden: boolean;
  hands: Hand[];
  activeHand: number;
  bankroll: number;
  bet: number;
  feedback: DecisionFeedback | null;
  message: string;
  runningCount: number;

  // Actions.
  setRules: (partial: Partial<Rules>) => void;
  toggleSetting: (key: "showHints" | "coachMode" | "showCount") => void;
  setBet: (bet: number) => void;
  deal: () => void;
  act: (action: Action) => void;
  nextRound: () => void;
  resetStats: () => void;
  resetBankroll: () => void;
  /** Grade a standalone decision (used by quiz mode) and record it in stats. */
  grade: (cards: Card[], dealerUp: Card, action: Action) => DecisionFeedback;

  // Internal orchestration (not called directly by the UI).
  _advance: () => void;
  _finishRound: (dealer: Card[], hands: Hand[]) => void;
}

const START_BANKROLL = 1000;
const DEFAULT_BET = 25;

const defaultSettings: Settings = {
  rules: { ...DEFAULT_RULES },
  showHints: false,
  coachMode: true,
  showCount: false,
};

function freshShoe(rules: Rules) {
  return createShoe(rules);
}

/** Snapshot of remaining cards for the true-count HUD. */
export function cardsRemaining(shoe: Shoe): number {
  return shoe.cards.length - shoe.pos;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      stats: emptyStats(),

      phase: "idle",
      shoe: freshShoe(defaultSettings.rules),
      dealer: [],
      holeHidden: true,
      hands: [],
      activeHand: 0,
      bankroll: START_BANKROLL,
      bet: DEFAULT_BET,
      feedback: null,
      message: "Place your bet and deal.",
      runningCount: 0,

      setRules: (partial) => {
        const rules = { ...get().settings.rules, ...partial };
        set({
          settings: { ...get().settings, rules },
          // Rebuild the shoe when structural rules change.
          shoe: freshShoe(rules),
          runningCount: 0,
          phase: "idle",
          hands: [],
          dealer: [],
          message: "Rules updated. Deal a new hand.",
          feedback: null,
        });
      },

      toggleSetting: (key) =>
        set({ settings: { ...get().settings, [key]: !get().settings[key] } }),

      setBet: (bet) => set({ bet: Math.max(1, Math.round(bet)) }),

      deal: () => {
        const state = get();
        if (state.phase === "player" || state.phase === "dealer") return;

        let shoe = state.shoe;
        let runningCount = state.runningCount;
        if (needsReshuffle(shoe)) {
          shoe = freshShoe(state.settings.rules);
          runningCount = 0;
        }

        const count = (c: Card) => (runningCount += hiLoValue(c.rank));

        const p1 = draw(shoe);
        count(p1);
        const up = draw(shoe);
        count(up);
        const p2 = draw(shoe);
        count(p2);
        const hole = draw(shoe); // not counted until revealed

        const hand = makeHand([p1, p2], state.bet);
        const dealer = [up, hole];

        const playerBJ = isBlackjack(hand.cards);
        const dealerBJ = isBlackjack(dealer);

        if (playerBJ || dealerBJ) {
          // Natural(s): reveal, resolve immediately, no decisions recorded.
          runningCount += hiLoValue(hole.rank);
          set({
            shoe,
            dealer,
            holeHidden: false,
            hands: [hand],
            activeHand: 0,
            phase: "over",
            feedback: null,
            runningCount,
          });
          get()._finishRound(dealer, [hand]);
          return;
        }

        set({
          shoe,
          dealer,
          holeHidden: true,
          hands: [hand],
          activeHand: 0,
          phase: "player",
          feedback: null,
          message: "Your move.",
          runningCount,
        });
      },

      act: (action: Action) => {
        const state = get();
        if (state.phase !== "player") return;

        const shoe = state.shoe;
        const hands = state.hands.map((h) => ({ ...h, cards: [...h.cards] }));
        const idx = state.activeHand;
        const hand = hands[idx];
        const dealerUp = state.dealer[0];

        // Evaluate the decision against basic strategy before applying it.
        const ctx = {
          canDouble: canDouble(hand, state.settings.rules),
          canSplit: canSplit(hand, hands.length),
          canSurrender: canSurrender(hand, state.settings.rules),
        };
        const advice = getAdvice(hand.cards, dealerUp, state.settings.rules, ctx);
        const correct = action === advice.action;

        const missKey = describeSituation(hand.cards, dealerUp);
        const stats = recordDecision(state.stats, advice.category, correct, missKey);
        const feedback: DecisionFeedback = {
          chosen: action,
          optimal: advice.action,
          correct,
          advice,
        };

        let runningCount = state.runningCount;
        const drawCounted = () => {
          const card = draw(shoe);
          runningCount += hiLoValue(card.rank);
          return card;
        };

        // Apply the action.
        switch (action) {
          case "stand":
            hand.done = true;
            break;
          case "hit": {
            hand.cards.push(drawCounted());
            if (handValue(hand.cards).total >= 21) hand.done = true;
            break;
          }
          case "double": {
            if (ctx.canDouble) {
              hand.bet *= 2;
              hand.doubled = true;
              hand.cards.push(drawCounted());
            } else {
              hand.cards.push(drawCounted());
            }
            hand.done = true;
            break;
          }
          case "surrender": {
            if (ctx.canSurrender) {
              hand.outcome = "surrender";
              hand.done = true;
            } else {
              hand.done = true;
            }
            break;
          }
          case "split": {
            if (ctx.canSplit) {
              const [cardA, cardB] = hand.cards;
              const isAces = pairValue(hand.cards) === 11;
              const handA = makeHand([cardA, drawCounted()], state.bet, true);
              const handB = makeHand([cardB, drawCounted()], state.bet, true);
              if (isAces) {
                // Split aces receive a single card each, then stand.
                handA.done = true;
                handB.done = true;
              }
              hands.splice(idx, 1, handA, handB);
            } else {
              hand.done = true;
            }
            break;
          }
        }

        set({
          hands,
          shoe,
          stats,
          runningCount,
          feedback: state.settings.coachMode ? feedback : null,
        });

        get()._advance();
      },

      // Internal: move to the next actionable hand or the dealer.
      _advance: () => {
        const state = get();
        const hands = state.hands;
        let next = state.activeHand;
        while (next < hands.length && hands[next].done) next++;

        if (next < hands.length) {
          set({ activeHand: next, phase: "player" });
          return;
        }

        // All player hands finished -> dealer's turn.
        const shoe = state.shoe;
        let runningCount = state.runningCount;
        const hole = state.dealer[1];
        runningCount += hiLoValue(hole.rank);

        const anyLive = hands.some(
          (h) => h.outcome !== "surrender" && handValue(h.cards).total <= 21,
        );

        let finalDealer = state.dealer;
        if (anyLive) {
          const before = shoe.pos;
          finalDealer = playDealer(state.dealer, shoe, state.settings.rules);
          // Count the cards the dealer drew.
          for (let i = before; i < shoe.pos; i++) {
            runningCount += hiLoValue(shoe.cards[i].rank);
          }
        }

        set({
          dealer: finalDealer,
          holeHidden: false,
          phase: "dealer",
          shoe,
          runningCount,
        });
        get()._finishRound(finalDealer, hands);
      },

      // Internal: resolve every hand, update bankroll and stats.
      _finishRound: (dealer: Card[], hands: Hand[]) => {
        const state = get();
        let stats = state.stats;
        let net = 0;
        const resolved = hands.map((h) => {
          const r = resolveHand(h, dealer, state.settings.rules);
          net += r.net;
          stats = recordOutcome(stats, r.outcome, r.net);
          return { ...h, outcome: r.outcome };
        });
        stats = { ...stats, rounds: stats.rounds + 1 };

        set({
          hands: resolved,
          bankroll: +(state.bankroll + net).toFixed(2),
          stats,
          phase: "over",
          message: summarise(net),
        });
      },

      nextRound: () => {
        set({
          phase: "idle",
          hands: [],
          dealer: [],
          holeHidden: true,
          activeHand: 0,
          feedback: null,
          message: "Deal the next hand.",
        });
        get().deal();
      },

      resetStats: () => set({ stats: emptyStats() }),
      resetBankroll: () => set({ bankroll: START_BANKROLL }),

      grade: (cards, dealerUp, action) => {
        const rules = get().settings.rules;
        const hand = makeHand(cards, get().bet);
        const ctx = {
          canDouble: canDouble(hand, rules),
          canSplit: canSplit(hand, 1),
          canSurrender: canSurrender(hand, rules),
        };
        const advice = getAdvice(cards, dealerUp, rules, ctx);
        const correct = action === advice.action;
        const missKey = describeSituation(cards, dealerUp);
        set({
          stats: recordDecision(get().stats, advice.category, correct, missKey),
        });
        return { chosen: action, optimal: advice.action, correct, advice };
      },
    }),
    {
      name: "vico-blackjack",
      partialize: (s) => ({ settings: s.settings, stats: s.stats, bankroll: s.bankroll }),
    },
  ),
);

/** Full store state shape, for selector helpers. */
export type GameStateForSelectors = ReturnType<typeof useGame.getState>;

function summarise(net: number): string {
  if (net > 0) return `You won ${net} units this round. Nicely played.`;
  if (net < 0) return `You lost ${Math.abs(net)} units this round.`;
  return "Push — your bet is returned.";
}

/** Human-readable key for a situation, used to track most-missed hands. */
export function describeSituation(cards: Card[], dealerUp: Card): string {
  const up = upcardValue(dealerUp);
  const upLabel = up === 11 ? "A" : String(up);
  const pair = pairValue(cards);
  if (pair !== null && cards.length === 2) {
    const label = pair === 11 ? "A,A" : pair === 10 ? "10,10" : `${pair},${pair}`;
    return `${label} vs ${upLabel}`;
  }
  const { total, soft } = handValue(cards);
  if (soft && total <= 20) return `soft ${total} vs ${upLabel}`;
  return `hard ${total} vs ${upLabel}`;
}
