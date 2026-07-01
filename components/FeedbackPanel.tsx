"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DecisionFeedback } from "@/lib/store/useGame";

const ACTION_LABEL: Record<string, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

export function FeedbackPanel({ feedback }: { feedback: DecisionFeedback | null }) {
  return (
    <AnimatePresence mode="wait">
      {feedback && (
        <motion.div
          key={`${feedback.chosen}-${feedback.optimal}-${feedback.advice.reason.slice(0, 12)}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`glass rounded-2xl p-4 ${
            feedback.correct ? "border-emerald-400/40" : "border-rose-400/50"
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase ${
                feedback.correct ? "bg-emerald-500 text-ink" : "bg-rose-600 text-white"
              }`}
            >
              {feedback.correct ? "Correct" : "Not optimal"}
            </span>
            <span className="text-sm text-cream/80">
              You chose <b className="text-cream">{ACTION_LABEL[feedback.chosen]}</b>
              {!feedback.correct && (
                <>
                  {" · "}Book play:{" "}
                  <b className="text-gold-soft">{ACTION_LABEL[feedback.optimal]}</b>
                </>
              )}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-cream/90">{feedback.advice.reason}</p>

          <div className="mt-2 flex items-start gap-2 rounded-lg bg-black/25 p-2">
            <span className="text-gold">💡</span>
            <p className="text-xs leading-relaxed text-gold-soft">{feedback.advice.tip}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
