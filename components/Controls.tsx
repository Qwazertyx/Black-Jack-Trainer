"use client";

import type { Action } from "@/lib/blackjack/types";
import { ACTION_KEYS } from "@/lib/useActionHotkeys";

const ACTION_LABEL: Record<Action, string> = {
  hit: "Hit",
  stand: "Stand",
  double: "Double",
  split: "Split",
  surrender: "Surrender",
};

interface Props {
  available: Record<Action, boolean>;
  onAct: (a: Action) => void;
  /** When set, highlights the optimal action (hint / coach mode). */
  hint?: Action | null;
  disabled?: boolean;
  /** Show the keyboard shortcut hint on each button (default true). */
  showKeys?: boolean;
}

const ORDER: Action[] = ["hit", "stand", "double", "split", "surrender"];

export function Controls({ available, onAct, hint, disabled, showKeys = true }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {ORDER.map((action) => {
        const enabled = available[action] && !disabled;
        const isHint = hint === action;
        return (
          <button
            key={action}
            onClick={() => enabled && onAct(action)}
            disabled={!enabled}
            aria-label={`${ACTION_LABEL[action]} (shortcut ${ACTION_KEYS[action]})`}
            aria-keyshortcuts={ACTION_KEYS[action]}
            className={`relative min-w-[92px] rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all
              ${
                enabled
                  ? "cursor-pointer bg-gradient-to-b from-felt-600 to-felt-800 text-cream gold-ring hover:from-felt-700 hover:-translate-y-0.5 active:translate-y-0"
                  : "cursor-not-allowed bg-black/20 text-cream/25"
              }
              ${isHint && enabled ? "ring-2 ring-gold shadow-[0_0_18px_rgba(212,175,55,0.5)]" : ""}
            `}
          >
            {ACTION_LABEL[action]}
            {showKeys && (
              <span
                className={`ml-1.5 rounded px-1 py-0.5 text-[10px] font-bold ${
                  enabled ? "bg-black/25 text-cream/60" : "bg-black/20 text-cream/20"
                }`}
              >
                {ACTION_KEYS[action]}
              </span>
            )}
            {isHint && enabled && (
              <span className="absolute -top-2 -right-2 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-ink">
                BEST
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
