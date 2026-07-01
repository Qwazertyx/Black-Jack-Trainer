"use client";

import { useEffect, useState } from "react";
import { buildShoe, shuffle } from "@/lib/blackjack/cards";
import { INDEX_PLAYS, runningCountOf } from "@/lib/blackjack/counting";
import type { Card } from "@/lib/blackjack/types";
import { PlayingCard } from "./PlayingCard";

type Phase = "idle" | "flashing" | "answer" | "result";

const COUNTS = [13, 26, 52];
const SPEEDS: { label: string; ms: number }[] = [
  { label: "Slow", ms: 1200 },
  { label: "Medium", ms: 800 },
  { label: "Fast", ms: 450 },
];

export function CountingMode() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [idx, setIdx] = useState(-1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [guess, setGuess] = useState("");
  const [count, setCount] = useState(26);
  const [speedMs, setSpeedMs] = useState(800);

  const shown = idx + 1;
  const actual = runningCountOf(deck.slice(0, Math.max(shown, 0)));

  useEffect(() => {
    if (phase !== "flashing") return;
    if (idx >= deck.length - 1) {
      const t = setTimeout(() => setPhase("answer"), speedMs);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => i + 1), speedMs);
    return () => clearTimeout(t);
  }, [phase, idx, deck.length, speedMs]);

  const start = () => {
    setDeck(shuffle(buildShoe(1)).slice(0, count));
    setIdx(0);
    setGuess("");
    setPhase("flashing");
  };

  const check = () => setPhase("result");

  const correct = parseInt(guess, 10) === actual;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-1 text-lg font-bold text-gold-soft">Hi-Lo Speed Count</h3>
        <p className="text-sm text-cream/70">
          Cards 2–6 are <b className="text-emerald-400">+1</b>, 7–9 are{" "}
          <b className="text-cream">0</b>, 10s and Aces are{" "}
          <b className="text-rose-400">−1</b>. Keep a running total as the cards flash,
          then enter your count.
        </p>

        {phase === "idle" || phase === "result" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-cream/60">Cards:</span>
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`rounded-lg px-3 py-1 ${
                    count === c ? "bg-gold text-ink" : "bg-felt-700 text-cream gold-ring"
                  }`}
                >
                  {c}
                </button>
              ))}
              <span className="ml-3 text-cream/60">Speed:</span>
              {SPEEDS.map((sp) => (
                <button
                  key={sp.ms}
                  onClick={() => setSpeedMs(sp.ms)}
                  className={`rounded-lg px-3 py-1 ${
                    speedMs === sp.ms
                      ? "bg-gold text-ink"
                      : "bg-felt-700 text-cream gold-ring"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
            <button
              onClick={start}
              className="self-start rounded-xl bg-gradient-to-b from-gold-soft to-gold px-6 py-2.5 font-extrabold uppercase tracking-wide text-ink shadow-[0_6px_20px_rgba(212,175,55,0.35)] transition-transform hover:-translate-y-0.5"
            >
              {phase === "result" ? "Again" : "Start drill"}
            </button>
          </div>
        ) : null}
      </div>

      {(phase === "flashing" || phase === "answer") && (
        <div className="felt-inset flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[2rem] p-6">
          {phase === "flashing" && idx >= 0 && deck[idx] && (
            <PlayingCard key={deck[idx].id} card={deck[idx]} index={0} />
          )}
          <div className="text-xs text-cream/50">
            {shown} / {deck.length} cards
          </div>
          {phase === "answer" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-cream/80">
                All cards shown. What&apos;s the running count?
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  className="w-24 rounded-lg bg-black/40 px-3 py-2 text-center text-lg font-bold text-cream gold-ring outline-none"
                  autoFocus
                />
                <button
                  onClick={check}
                  disabled={guess === ""}
                  className="rounded-xl bg-gold px-5 py-2 font-bold text-ink disabled:opacity-40"
                >
                  Check
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "result" && (
        <div
          className={`glass rounded-2xl p-5 text-center ${
            correct ? "border-emerald-400/40" : "border-rose-400/50"
          }`}
        >
          <div className="text-2xl font-extrabold">
            {correct ? "✅ Spot on!" : "❌ Not quite"}
          </div>
          <p className="mt-1 text-cream/80">
            Your count: <b>{guess}</b> · Actual running count:{" "}
            <b className="text-gold-soft">{actual}</b>
          </p>
        </div>
      )}

      {/* Index plays reference */}
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-2 text-lg font-bold text-gold-soft">Key count deviations</h3>
        <p className="mb-3 text-xs text-cream/60">
          Once you can count, these are the most valuable spots to stray from basic
          strategy. Deviate at or beyond the listed true count.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-cream/50">
                <th className="py-1 pr-3">Hand</th>
                <th className="py-1 pr-3">Dealer</th>
                <th className="py-1 pr-3">True count</th>
                <th className="py-1 pr-3">Do</th>
                <th className="py-1">Basic</th>
              </tr>
            </thead>
            <tbody>
              {INDEX_PLAYS.map((p, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-1 pr-3 font-semibold text-cream">{p.hand}</td>
                  <td className="py-1 pr-3 text-cream/80">{p.dealer}</td>
                  <td className="py-1 pr-3 font-mono text-gold-soft">
                    {p.index >= 0 ? `≥ +${p.index}` : `≤ ${p.index}`}
                  </td>
                  <td className="py-1 pr-3 font-semibold text-emerald-400">{p.deviation}</td>
                  <td className="py-1 text-cream/50">{p.basic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
