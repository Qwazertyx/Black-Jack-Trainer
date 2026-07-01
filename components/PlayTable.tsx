"use client";

import { useGame } from "@/lib/store/useGame";
import {
  availableActions,
  currentAdvice,
  trueCountValue,
} from "@/lib/store/selectors";
import { accuracy } from "@/lib/store/stats";
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="glass rounded-xl px-3 py-1.5 text-sm">
          <span className="text-cream/50">Bankroll</span>{" "}
          <span className="font-bold text-gold-soft">{s.bankroll}u</span>
        </div>
        {s.settings.showCount && (
          <CountHud running={s.runningCount} trueCount={trueCountValue(s)} />
        )}
        <div className="glass rounded-xl px-3 py-1.5 text-sm">
          <span className="text-cream/50">Accuracy</span>{" "}
          <span className="font-bold text-emerald-400">
            {s.stats.decisions ? `${Math.round(acc * 100)}%` : "—"}
          </span>
        </div>
      </div>

      {/* Felt table */}
      <div className="felt-inset relative flex min-h-[380px] flex-col items-center justify-between gap-4 rounded-[2rem] px-4 py-6">
        {/* Dealer */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-[0.2em] text-gold/70">Dealer</span>
          {s.dealer.length > 0 ? (
            <DealerHand cards={s.dealer} holeHidden={s.holeHidden} />
          ) : (
            <div className="h-24" />
          )}
        </div>

        {/* Message */}
        <div className="text-center text-sm font-medium text-cream/80 text-shadow-soft">
          {s.message}
        </div>

        {/* Player hands */}
        <div className="flex flex-wrap items-start justify-center gap-3">
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
            <div className="text-cream/40">Ready when you are.</div>
          )}
        </div>
      </div>

      {/* Controls / betting */}
      <div className="flex flex-col items-center gap-3">
        {s.phase === "player" ? (
          <Controls available={avail} onAct={s.act} hint={hint} />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-cream/60">Bet</span>
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => s.setBet(chip)}
                  className={`h-11 w-11 rounded-full text-xs font-bold transition-transform hover:scale-105 ${
                    s.bet === chip
                      ? "bg-gold text-ink ring-2 ring-gold-soft"
                      : "bg-felt-700 text-cream gold-ring"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              onClick={s.phase === "over" ? s.nextRound : s.deal}
              disabled={!canDeal}
              className={`rounded-xl px-8 py-3 text-base font-extrabold uppercase tracking-wide transition-all ${
                canDeal
                  ? "cursor-pointer bg-gradient-to-b from-gold-soft to-gold text-ink hover:-translate-y-0.5 shadow-[0_6px_20px_rgba(212,175,55,0.35)]"
                  : "cursor-not-allowed bg-black/20 text-cream/30"
              }`}
            >
              {s.phase === "over" ? "Next Hand" : "Deal"}
            </button>
            {!canDeal && s.bankroll <= 0 && (
              <button
                onClick={s.resetBankroll}
                className="text-xs text-gold-soft underline"
              >
                Reset bankroll
              </button>
            )}
          </div>
        )}
      </div>

      {/* Coach feedback */}
      {s.settings.coachMode && <FeedbackPanel feedback={s.feedback} />}

      {/* Live hint text when hints are on */}
      {s.settings.showHints && advice && s.phase === "player" && (
        <div className="glass rounded-xl p-3 text-sm text-cream/85">
          <span className="font-bold text-gold-soft">Book play: </span>
          {advice.reason}
        </div>
      )}
    </div>
  );
}
