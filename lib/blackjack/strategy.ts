import { handValue, pairValue, rankValue } from "./cards";
import type { Action, Card, Rules } from "./types";

/**
 * Strategy codes used inside the basic-strategy charts.
 *  H  = hit
 *  S  = stand
 *  D  = double if allowed, otherwise hit
 *  Ds = double if allowed, otherwise stand
 *  P  = split
 *  R  = surrender if allowed, otherwise hit
 *  Rs = surrender if allowed, otherwise stand
 */
export type Code = "H" | "S" | "D" | "Ds" | "P" | "R" | "Rs";

export type Category = "hard" | "soft" | "pair";

export interface DecisionContext {
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

export interface StrategyAdvice {
  /** The concrete action the player should take given what's allowed. */
  action: Action;
  /** The ideal chart code (before availability resolution). */
  code: Code;
  category: Category;
  /** Plain-English explanation of the recommendation. */
  reason: string;
  /** A short, reusable learning tip. */
  tip: string;
}

/** Numeric value of a dealer up-card (2-11, ace = 11). */
export function upcardValue(card: Card): number {
  return rankValue(card.rank);
}

// --- Charts ---------------------------------------------------------------

export function hardCode(total: number, up: number, rules: Rules): Code {
  if (total <= 8) return "H";
  if (total === 9) {
    // Multi-deck: D vs 3-6. Single/double deck also vs 2.
    if (rules.decks <= 2) return up >= 2 && up <= 6 ? "D" : "H";
    return up >= 3 && up <= 6 ? "D" : "H";
  }
  if (total === 10) return up >= 2 && up <= 9 ? "D" : "H";
  if (total === 11) {
    // H17 and single/double deck double against everything.
    if (rules.dealerHitsSoft17 || rules.decks <= 2) return "D";
    return up <= 10 ? "D" : "H";
  }
  if (total === 12) return up >= 4 && up <= 6 ? "S" : "H";
  if (total === 13 || total === 14) return up >= 2 && up <= 6 ? "S" : "H";
  if (total === 15) {
    if (rules.surrenderAllowed) {
      if (up === 10) return "R";
      if (up === 11 && rules.dealerHitsSoft17) return "R";
    }
    return up >= 2 && up <= 6 ? "S" : "H";
  }
  if (total === 16) {
    if (rules.surrenderAllowed && (up === 9 || up === 10 || up === 11)) return "R";
    return up >= 2 && up <= 6 ? "S" : "H";
  }
  if (total === 17) {
    if (rules.surrenderAllowed && rules.dealerHitsSoft17 && up === 11) return "Rs";
    return "S";
  }
  return "S"; // 18-21
}

export function softCode(total: number, up: number, rules: Rules): Code {
  switch (total) {
    case 13: // A,2
    case 14: // A,3
      if (rules.decks === 1) return up >= 4 && up <= 6 ? "D" : "H";
      return up === 5 || up === 6 ? "D" : "H";
    case 15: // A,4
    case 16: // A,5
      return up >= 4 && up <= 6 ? "D" : "H";
    case 17: // A,6
      if (rules.decks <= 2) return up >= 2 && up <= 6 ? "D" : "H";
      return up >= 3 && up <= 6 ? "D" : "H";
    case 18: // A,7
      if (up >= 2 && up <= 6) return "Ds";
      if (up === 7 || up === 8) return "S";
      return "H";
    case 19: // A,8
      if ((rules.dealerHitsSoft17 || rules.decks === 1) && up === 6) return "Ds";
      return "S";
    default: // A,9 (20) and up
      return "S";
  }
}

export function pairCode(pair: number, up: number, rules: Rules): Code {
  const das = rules.doubleAfterSplit;
  switch (pair) {
    case 11: // A,A
      return "P";
    case 10:
      return "S";
    case 9:
      return up === 7 || up === 10 || up === 11 ? "S" : "P";
    case 8:
      if (rules.surrenderAllowed && rules.dealerHitsSoft17 && up === 11) return "R";
      return "P";
    case 7:
      return up >= 2 && up <= 7 ? "P" : "H";
    case 6:
      return das ? up >= 2 && up <= 6 ? "P" : "H" : up >= 3 && up <= 6 ? "P" : "H";
    case 5:
      return up >= 2 && up <= 9 ? "D" : "H"; // play as hard 10
    case 4:
      return das && (up === 5 || up === 6) ? "P" : "H";
    case 3:
    case 2:
      return das ? up >= 2 && up <= 7 ? "P" : "H" : up >= 4 && up <= 7 ? "P" : "H";
    default:
      return "H";
  }
}

// --- Public API -----------------------------------------------------------

/** Look up the ideal chart code for a hand (ignoring availability). */
export function lookupCode(
  cards: Card[],
  up: number,
  rules: Rules,
): { code: Code; category: Category } {
  const pair = pairValue(cards);
  if (pair !== null && cards.length === 2) {
    return { code: pairCode(pair, up, rules), category: "pair" };
  }
  const { total, soft } = handValue(cards);
  if (soft && total <= 20) {
    return { code: softCode(total, up, rules), category: "soft" };
  }
  return { code: hardCode(total, up, rules), category: "hard" };
}

function resolveCode(code: Code, ctx: DecisionContext): Action {
  switch (code) {
    case "H":
      return "hit";
    case "S":
      return "stand";
    case "D":
      return ctx.canDouble ? "double" : "hit";
    case "Ds":
      return ctx.canDouble ? "double" : "stand";
    case "P":
      return "split";
    case "R":
      return ctx.canSurrender ? "surrender" : "hit";
    case "Rs":
      return ctx.canSurrender ? "surrender" : "stand";
  }
}

/**
 * Full recommendation for a player hand versus a dealer up-card.
 * Handles pair fall-through (when splitting isn't possible, plays the total).
 */
export function getAdvice(
  cards: Card[],
  dealerUp: Card,
  rules: Rules,
  ctx: DecisionContext,
): StrategyAdvice {
  const up = upcardValue(dealerUp);
  let { code, category } = lookupCode(cards, up, rules);

  // If the chart says split but we can't, re-evaluate as a normal total.
  if (code === "P" && !ctx.canSplit) {
    const { total, soft } = handValue(cards);
    if (soft && total <= 20) {
      code = softCode(total, up, rules);
      category = "soft";
    } else {
      code = hardCode(total, up, rules);
      category = "hard";
    }
  }

  const action = resolveCode(code, ctx);
  const { reason, tip } = explain(cards, up, action, category);
  return { action, code, category, reason, tip };
}

// --- Explanations ---------------------------------------------------------

function dealerStrength(up: number): "weak" | "medium" | "strong" {
  if (up >= 2 && up <= 6) return "weak";
  if (up === 7 || up === 8) return "medium";
  return "strong"; // 9, 10, A
}

function upLabel(up: number): string {
  return up === 11 ? "Ace" : String(up);
}

function explain(
  cards: Card[],
  up: number,
  action: Action,
  category: Category,
): { reason: string; tip: string } {
  const { total, soft } = handValue(cards);
  const strength = dealerStrength(up);
  const dl = upLabel(up);

  // Surrender.
  if (action === "surrender") {
    return {
      reason: `Hard ${total} against the dealer's ${dl} loses far more often than it wins. Surrendering forfeits half your bet instead of risking the whole thing.`,
      tip: "Surrender is a defensive tool: it saves money on hopeless hands, not a way to win them.",
    };
  }

  // Pairs.
  if (category === "pair") {
    const pv = pairValue(cards)!;
    if (action === "split") {
      if (pv === 11)
        return {
          reason: "Always split Aces. Each ace starts a fresh hand with a strong chance at 21, turning one weak soft hand into two powerful ones.",
          tip: "Aces and 8s always split — memorise that first.",
        };
      if (pv === 8)
        return {
          reason: `Always split 8s. A hard 16 is the worst hand in blackjack; two hands each starting with 8 give you a real chance versus the dealer's ${dl}.`,
          tip: "Aces and 8s always split — memorise that first.",
        };
      return {
        reason: `Split this pair against the dealer's ${dl}. The up-card is ${strength}, so playing two separate hands puts more money on the table when you have the edge.`,
        tip: "Split pairs mostly against weak dealer cards (2-6) to press your advantage.",
      };
    }
    if (pv === 10)
      return {
        reason: "Never split 10s. A pair of tens is 20 — one of the best hands there is. Breaking it up trades a near-certain winner for two riskier hands.",
        tip: "Standing on 20 wins the vast majority of the time; don't get greedy.",
      };
    if (pv === 5)
      return {
        reason: `Never split 5s. Treat them as a hard 10 — here that means ${action === "double" ? "doubling" : "hitting"} against the ${dl}.`,
        tip: "A pair of 5s is a 10, a great doubling total — don't waste it by splitting.",
      };
    // Pair that shouldn't be split: fall through to total logic below.
  }

  // Doubling.
  if (action === "double") {
    if (soft)
      return {
        reason: `Doubling a soft ${total} can't bust you, and the dealer's ${dl} is weak enough to punish. The ace acts as a safety net if you draw a low card.`,
        tip: "Soft doubles are about pressing an edge, not fear of busting — you literally can't bust.",
      };
    return {
      reason: `${total} is a prime doubling total against the dealer's ${dl}. You'll often draw a 10-value card for a very strong hand, so put out more money while you're ahead.`,
      tip: "Double on 10 and 11 versus weaker dealer cards — one of the biggest edges in the game.",
    };
  }

  // Soft stands / hits.
  if (soft) {
    if (action === "stand")
      return {
        reason: `Soft ${total} is already strong enough to beat the dealer's ${dl} often enough. Standing locks in a good hand.`,
        tip: "Soft 19 and 20 almost always stand; soft 18 is the tricky one.",
      };
    return {
      reason: `Soft ${total} isn't enough against the dealer's ${dl}, and you can't bust by taking one card thanks to the ace. Hit to improve.`,
      tip: "Soft 17 or lower should never just stand — always improve it.",
    };
  }

  // Hard stands / hits.
  if (action === "stand") {
    return {
      reason: `Stand on ${total}. The dealer's ${dl} is a bust card — the odds favour making them draw and go over, so don't risk busting yourself.`,
      tip: "Against a dealer 2-6, let them take the risk: stand on stiff totals (12-16).",
    };
  }

  // Hard hit.
  if (total <= 11) {
    return {
      reason: `You can't bust a ${total}, so always take a card to build toward a strong total.`,
      tip: "Never stand on 11 or less — there's no downside to hitting.",
    };
  }
  return {
    reason: `Hit ${total}. The dealer's ${dl} is ${strength} and will likely finish on 17-21, so a stiff ${total} loses if you stand — you have to try to improve.`,
    tip: "Against a dealer 7-Ace, your stiff hands (12-16) must hit; standing just hands them the win.",
  };
}

/** Whether the player's chosen action matches the optimal one. */
export function isOptimal(chosen: Action, advice: StrategyAdvice): boolean {
  return chosen === advice.action;
}
