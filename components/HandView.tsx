"use client";

import { handValue } from "@/lib/blackjack/cards";
import type { Hand, Outcome } from "@/lib/blackjack/types";
import { PlayingCard } from "./PlayingCard";

/** Outcomes are the one place colour is allowed to speak. */
const OUTCOME_STYLE: Record<Outcome, { label: string; cls: string }> = {
  blackjack: { label: "Blackjack", cls: "bg-gold text-ink" },
  win: { label: "Win", cls: "bg-verdigris text-ink" },
  push: { label: "Push", cls: "bg-felt-600 text-cream" },
  lose: { label: "Lose", cls: "bg-carmine text-ink" },
  surrender: { label: "Surrendered", cls: "bg-amber-700 text-gold" },
};

function totalLabel(cards: Hand["cards"]): string {
  const { total, soft } = handValue(cards);
  if (soft && total <= 21) return `${total - 10}/${total}`;
  return String(total);
}

/** Shared chip for a hand total: bitmap face, square, tabular. */
function Total({ children, tone }: { children: React.ReactNode; tone?: "bust" }) {
  return (
    <span
      className={`font-bitmap border-2 px-1.5 py-px text-[11px] tabular-nums ${
        tone === "bust"
          ? "border-carmine bg-carmine text-ink"
          : "border-felt-600 bg-felt-950 text-cream"
      }`}
    >
      {children}
    </span>
  );
}

interface Props {
  hand: Hand;
  active?: boolean;
  showBet?: boolean;
}

export function HandView({ hand, active, showBet }: Props) {
  const busted = handValue(hand.cards).total > 21;

  return (
    <div
      // The active hand blinks its rule like a text cursor. No glow, no pulse.
      className={`flex flex-col items-center gap-1.5 border-2 px-2 py-1.5 ${
        active ? "pulse-gold bg-felt-950/40" : "border-transparent"
      }`}
    >
      <div className="flex" style={{ gap: "var(--card-overlap)" }}>
        {hand.cards.map((c, i) => (
          <PlayingCard key={c.id} card={c} index={i} />
        ))}
      </div>

      <div className="flex items-center gap-1">
        <Total tone={busted ? "bust" : undefined}>{totalLabel(hand.cards)}</Total>
        {hand.doubled && (
          <span className="font-bitmap border-2 border-felt-600 px-1 py-px text-[10px] text-gold-soft">
            2x
          </span>
        )}
        {showBet && (
          <span className="font-bitmap border-2 border-felt-600 px-1 py-px text-[10px] text-cream tabular-nums">
            {hand.bet}u
          </span>
        )}
      </div>

      {hand.outcome && (
        <span
          className={`font-bitmap px-2 py-px text-[10px] uppercase tracking-[0.08em] ${
            OUTCOME_STYLE[hand.outcome].cls
          }`}
        >
          {OUTCOME_STYLE[hand.outcome].label}
        </span>
      )}
    </div>
  );
}

/** Dealer hand with an optional face-down hole card. */
export function DealerHand({
  cards,
  holeHidden,
}: {
  cards: Hand["cards"];
  holeHidden: boolean;
}) {
  const visibleTotal = holeHidden
    ? handValue(cards.slice(0, 1)).total
    : handValue(cards).total;
  const soft = !holeHidden && handValue(cards).soft;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex" style={{ gap: "var(--card-overlap)" }}>
        {cards.map((c, i) => (
          <PlayingCard
            key={c.id}
            card={c}
            faceDown={holeHidden && i === 1}
            index={i}
          />
        ))}
      </div>
      <Total>
        {holeHidden
          ? `${visibleTotal}+?`
          : soft && visibleTotal <= 21
            ? `${visibleTotal - 10}/${visibleTotal}`
            : visibleTotal}
      </Total>
    </div>
  );
}
