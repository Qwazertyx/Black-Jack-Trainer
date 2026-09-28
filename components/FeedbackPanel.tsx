"use client";

import type { DecisionFeedback } from "@/lib/store/useGame";

const ACTION_LABEL: Record<string, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

export function FeedbackPanel({ feedback }: { feedback: DecisionFeedback | null }) {
  if (!feedback) return null;

  const ok = feedback.correct;

  return (
    // Verdict rail on the left, reasoning on the right. Colour states the result;
    // nothing else on the panel is coloured.
    <div
      className={`grid grid-cols-1 border-2 sm:grid-cols-[auto_1fr] ${
        ok ? "border-verdigris" : "border-carmine"
      }`}
    >
      <div
        className={`font-bitmap flex items-center px-2 py-2 text-[10px] uppercase tracking-[0.1em] ${
          ok ? "bg-verdigris text-ink" : "bg-carmine text-ink"
        }`}
      >
        {ok ? "Correct" : "Not optimal"}
      </div>

      <div className="bg-felt-800 px-3 py-2">
        <p className="text-xs text-cream">
          You chose <b className="text-gold-soft">{ACTION_LABEL[feedback.chosen]}</b>
          {!ok && (
            <>
              {" · "}Book play:{" "}
              <b className="text-gold-soft">{ACTION_LABEL[feedback.optimal]}</b>
            </>
          )}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-cream">
          {feedback.advice.reason}
        </p>
        <p className="mt-1.5 border-t-2 border-felt-600 pt-1.5 text-xs leading-relaxed text-gold-dim">
          {feedback.advice.tip}
        </p>
      </div>
    </div>
  );
}
