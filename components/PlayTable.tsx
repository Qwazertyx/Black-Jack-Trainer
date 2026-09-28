"use client";

import { useMemo } from "react";
import { useGame } from "@/lib/store/useGame";
import {
  availableActions,
  currentAdvice,
  trueCountValue,
} from "@/lib/store/selectors";
import { accuracy } from "@/lib/store/stats";
import type { Action } from "@/lib/blackjack/types";
import { useActionHotkeys } from "@/lib/useActionHotkeys";
import { Controls } from "./Controls";
import { CountHud } from "./CountHud";
import { DealerHand, HandView } from "./HandView";
import { FeedbackPanel } from "./FeedbackPanel";

const CHIPS = [5, 25, 100, 500];

export function PlayTable() {
  const s = useGame();
  const advice = currentAdvice(s);
  const avail = availableActions(s);
  const hint = s.settings.showHints ? advice?.action ?? null : null;
  const acc = accuracy(s.stats);

  const canDeal = s.bet > 0 && s.bet <= s.bankroll;

  // Keyboard shortcuts: H/S/D/P/R to act, Enter/Space to deal or advance.
  const { phase, act, deal, nextRound } = s;
  const hotkeyHandlers = useMemo(() => {
    if (phase !== "player") return {};
    const h: Partial<Record<Action, () => void>> = {};
    (Object.keys(avail) as Action[]).forEach((a) => {
      if (avail[a]) h[a] = () => act(a);
    });
    return h;
  }, [phase, avail, act]);

  const onConfirm = useMemo(() => {
    if (phase === "over") return nextRound;
    if (phase === "idle") return canDeal ? deal : undefined;
    return undefined;
  }, [phase, canDeal, deal, nextRound]);

  useActionHotkeys(hotkeyHandlers, { onConfirm });

  /*
    A column sized to the space the shell gives it. Priority under pressure runs
    top-down: the table keeps its automatic minimum (it can grow on a tall
    screen but never shrink below the cards it holds), the buttons never move,
    and the coach note is the one row that yields, shrinking and scrolling
    inside itself. That is what keeps the table and the actions on the first
    screen of a 360x640 phone.
  */
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col justify-center gap-2">
      {/* Status */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="glass px-2 py-1">
          <span className="label text-gold-dim">Bank</span>{" "}
          <span className="font-bitmap text-xs text-gold-soft tabular-nums">
            {s.bankroll}u
          </span>
        </div>
        {s.settings.showCount && (
          <CountHud running={s.runningCount} trueCount={trueCountValue(s)} />
        )}
        <div className="glass px-2 py-1">
          <span className="label text-gold-dim">Acc</span>{" "}
          <span className="font-bitmap text-xs text-verdigris tabular-nums">
            {s.stats.decisions ? `${Math.round(acc * 100)}%` : "—"}
          </span>
        </div>
      </div>

      {/* The table */}
      <div
        // No `overflow` here on purpose: an overflow container's automatic
        // minimum size is 0, which is exactly what let the hand get clipped.
        className={`felt-inset flex max-h-[440px] flex-1 flex-col items-center gap-2 px-3 py-2 sm:py-3 ${
          s.hands.length > 0 ? "justify-between" : "justify-center"
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="label text-gold-dim">Dealer</span>
          {s.dealer.length > 0 ? (
            <DealerHand cards={s.dealer} holeHidden={s.holeHidden} />
          ) : (
            <div style={{ height: "var(--card-h)" }} />
          )}
        </div>

        <div className="text-shadow-soft px-2 text-center text-xs text-cream sm:text-sm">
          {s.message}
        </div>

        <div className="flex flex-wrap items-start justify-center gap-2">
          {s.hands.length > 0 ? (
            s.hands.map((hand, i) => (
              <HandView
                key={i}
                hand={hand}
                active={s.phase === "player" && i === s.activeHand}
                showBet={s.hands.length > 1 || hand.doubled}
              />
            ))
          ) : (
            <div
              className="label flex items-center text-gold-dim"
              style={{ height: "var(--card-h)" }}
            >
              Ready when you are
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        {s.phase === "player" ? (
          <Controls available={avail} onAct={s.act} hint={hint} />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="label text-gold-dim">Bet</span>
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => s.setBet(chip)}
                  aria-pressed={s.bet === chip}
                  className={`font-bitmap h-11 w-11 border-2 text-[11px] tabular-nums ${
                    s.bet === chip
                      ? "border-gold bg-gold text-ink"
                      : "border-felt-600 bg-felt-800 text-cream hover:bg-felt-700"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              onClick={s.phase === "over" ? s.nextRound : s.deal}
              disabled={!canDeal}
              className={`font-bitmap min-h-11 border-2 px-8 py-3 text-xs uppercase tracking-[0.08em] ${
                canDeal
                  ? "cursor-pointer border-gold bg-gold text-ink shadow-[4px_4px_0_var(--color-felt-950)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  : "cursor-not-allowed border-felt-700 bg-felt-900 text-gold-dim"
              }`}
            >
              {s.phase === "over" ? "Next Hand" : "Deal"}
            </button>
            {!canDeal && s.bankroll <= 0 && (
              <button
                onClick={s.resetBankroll}
                className="label text-cream underline underline-offset-2"
              >
                Reset bankroll
              </button>
            )}
          </div>
        )}
      </div>

      {/*
        The coach. Capped so a long explanation can never push the buttons off a
        phone screen: it scrolls inside its own box instead.
      */}
      {(s.settings.coachMode || (s.settings.showHints && advice && s.phase === "player")) && (
        <div className="max-h-[18vh] min-h-0 flex-1 overflow-y-auto">
          {s.settings.coachMode && <FeedbackPanel feedback={s.feedback} />}
          {s.settings.showHints && advice && s.phase === "player" && (
            <div className="glass mt-2 p-2 text-xs leading-relaxed text-cream">
              <span className="label text-gold-soft">Book play </span>
              {advice.reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
