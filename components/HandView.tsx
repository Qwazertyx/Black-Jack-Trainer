"use client";

import { AnimatePresence, motion } from "framer-motion";
import { handValue } from "@/lib/blackjack/cards";
import type { Hand, Outcome } from "@/lib/blackjack/types";
import { PlayingCard } from "./PlayingCard";

const OUTCOME_STYLE: Record<Outcome, { label: string; cls: string }> = {
  blackjack: { label: "Blackjack!", cls: "bg-gold text-ink" },
  win: { label: "Win", cls: "bg-emerald-500 text-ink" },
  push: { label: "Push", cls: "bg-slate-400 text-ink" },
  lose: { label: "Lose", cls: "bg-rose-600 text-white" },
  surrender: { label: "Surrendered", cls: "bg-amber-700 text-white" },
};

function totalLabel(cards: Hand["cards"]): string {
  const { total, soft } = handValue(cards);
  if (soft && total <= 21) return `${total - 10}/${total}`;
  return String(total);
}

interface Props {
  hand: Hand;
  active?: boolean;
  showBet?: boolean;
}

export function HandView({ hand, active, showBet }: Props) {
  const busted = handValue(hand.cards).total > 21;

  return (
    <motion.div
      layout
      className={`flex flex-col items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
        active ? "gold-ring pulse-gold bg-black/20" : ""
      }`}
    >
      <div className="flex -space-x-6 sm:-space-x-5">
        {hand.cards.map((c, i) => (
          <PlayingCard key={c.id} card={c} index={i} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-sm font-bold text-shadow-soft ${
            busted ? "bg-rose-700 text-white" : "bg-black/40 text-cream gold-ring"
          }`}
        >
          {totalLabel(hand.cards)}
        </span>
        {hand.doubled && (
          <span className="rounded-md bg-gold/20 px-1.5 py-0.5 text-xs text-gold-soft gold-ring">
            2×
          </span>
        )}
        {showBet && (
          <span className="rounded-md bg-black/30 px-1.5 py-0.5 text-xs text-cream/80">
            {hand.bet}u
          </span>
        )}
      </div>

      <AnimatePresence>
        {hand.outcome && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-full px-3 py-0.5 text-xs font-bold ${OUTCOME_STYLE[hand.outcome].cls}`}
          >
            {OUTCOME_STYLE[hand.outcome].label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Dealer hand with an optional face-down hole card. */
export function DealerHand({ cards, holeHidden }: { cards: Hand["cards"]; holeHidden: boolean }) {
  const shownCards = cards;
  const visibleTotal = holeHidden
    ? handValue(cards.slice(0, 1)).total
    : handValue(cards).total;
  const soft = !holeHidden && handValue(cards).soft;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex -space-x-6 sm:-space-x-5">
        {shownCards.map((c, i) => (
          <PlayingCard
            key={c.id}
            card={c}
            faceDown={holeHidden && i === 1}
            index={i}
          />
        ))}
      </div>
      <span className="rounded-md bg-black/40 px-2 py-0.5 text-sm font-bold text-cream gold-ring">
        {holeHidden ? `${visibleTotal} + ?` : soft && visibleTotal <= 21 ? `${visibleTotal - 10}/${visibleTotal}` : visibleTotal}
      </span>
    </div>
  );
}
