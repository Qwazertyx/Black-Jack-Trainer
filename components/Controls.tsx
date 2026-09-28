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
    <div className="flex flex-wrap items-center justify-center gap-2">
      {ORDER.map((action) => {
        const enabled = available[action] && !disabled;
        const isHint = hint === action;

        // Emphasis is inversion: the book play is paper on ink, not a glow.
        const skin = !enabled
          ? "cursor-not-allowed border-felt-700 bg-felt-900 text-gold-dim"
          : isHint
            ? "cursor-pointer border-gold bg-gold text-ink shadow-[4px_4px_0_var(--color-felt-950)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            : "cursor-pointer border-felt-600 bg-felt-800 text-cream shadow-[4px_4px_0_var(--color-felt-950)] hover:bg-felt-700 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

        return (
          <button
            key={action}
            onClick={() => enabled && onAct(action)}
            disabled={!enabled}
            aria-label={`${ACTION_LABEL[action]} (shortcut ${ACTION_KEYS[action]})`}
            aria-keyshortcuts={ACTION_KEYS[action]}
            // No transition. The press is a one-frame snap, like a mechanical key.
            className={`font-bitmap flex min-h-11 min-w-[88px] items-center justify-center gap-2 border-2 px-3 py-3 text-[11px] uppercase tracking-[0.06em] ${skin}`}
          >
            {ACTION_LABEL[action]}
            {showKeys && (
              <span
                className={`px-1 py-px text-[9px] leading-none ${
                  !enabled
                    ? "bg-felt-700 text-gold-dim"
                    : isHint
                      ? "bg-ink text-gold"
                      : "bg-gold-dim text-ink"
                }`}
              >
                {ACTION_KEYS[action]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
