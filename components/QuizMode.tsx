"use client";

import { useState } from "react";
import { canDouble, canSplit, canSurrender, makeHand } from "@/lib/blackjack/engine";
import { randomSituation, type Situation } from "@/lib/blackjack/quiz";
import type { Action } from "@/lib/blackjack/types";
import { useGame, type DecisionFeedback } from "@/lib/store/useGame";
import { Controls } from "./Controls";
import { FeedbackPanel } from "./FeedbackPanel";
import { DealerHand, HandView } from "./HandView";
import { StrategyChart } from "./StrategyChart";

export function QuizMode() {
  const rules = useGame((s) => s.settings.rules);
  const grade = useGame((s) => s.grade);

  const [situation, setSituation] = useState<Situation>(() => randomSituation());
  const [feedback, setFeedback] = useState<DecisionFeedback | null>(null);
  const [session, setSession] = useState({ correct: 0, total: 0, streak: 0 });
  const [showChart, setShowChart] = useState(false);

  const hand = makeHand([...situation.cards], 1);
  const avail: Record<Action, boolean> = {
    hit: true,
    stand: true,
    double: canDouble(hand, rules),
    split: canSplit(hand, 1),
    surrender: canSurrender(hand, rules),
  };

  const onAnswer = (action: Action) => {
    if (feedback) return; // already answered
    const fb = grade(situation.cards, situation.dealerUp, action);
    setFeedback(fb);
    setSession((s) => ({
      correct: s.correct + (fb.correct ? 1 : 0),
      total: s.total + 1,
      streak: fb.correct ? s.streak + 1 : 0,
    }));
  };

  const next = () => {
    setFeedback(null);
    setSituation(randomSituation());
  };

  const pct = session.total ? Math.round((session.correct / session.total) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <div className="glass rounded-xl px-3 py-1.5">
          <span className="text-cream/50">Session</span>{" "}
          <span className="font-bold text-emerald-400">
            {session.correct}/{session.total}
          </span>{" "}
          <span className="text-cream/50">({pct}%)</span>
        </div>
        <div className="glass rounded-xl px-3 py-1.5">
          <span className="text-cream/50">Streak</span>{" "}
          <span className="font-bold text-gold-soft">{session.streak}🔥</span>
        </div>
        <button
          onClick={() => setShowChart((v) => !v)}
          className="glass rounded-xl px-3 py-1.5 text-cream/80 hover:text-gold-soft"
        >
          {showChart ? "Hide chart" : "Show chart"}
        </button>
      </div>

      <div className="felt-inset flex flex-col items-center gap-5 rounded-[2rem] px-4 py-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-[0.2em] text-gold/70">Dealer shows</span>
          <DealerHand cards={[situation.dealerUp]} holeHidden={false} />
        </div>
        <div className="text-sm font-medium text-cream/70">
          {feedback ? "Here's the book play:" : "What's the correct play?"}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs uppercase tracking-[0.2em] text-gold/70">Your hand</span>
          <HandView hand={hand} />
        </div>
      </div>

      {feedback ? (
        <div className="flex flex-col gap-3">
          <FeedbackPanel feedback={feedback} />
          <button
            onClick={next}
            className="mx-auto rounded-xl bg-gradient-to-b from-gold-soft to-gold px-8 py-3 font-extrabold uppercase tracking-wide text-ink shadow-[0_6px_20px_rgba(212,175,55,0.35)] transition-transform hover:-translate-y-0.5"
          >
            Next
          </button>
        </div>
      ) : (
        <Controls available={avail} onAct={onAnswer} />
      )}

      {showChart && (
        <div className="glass rounded-2xl p-4">
          <StrategyChart rules={rules} />
        </div>
      )}
    </div>
  );
}
