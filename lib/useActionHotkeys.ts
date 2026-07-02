"use client";

import { useEffect } from "react";
import type { Action } from "./blackjack/types";

/** Keyboard shortcut for each action, shown in the UI and bound globally. */
export const ACTION_KEYS: Record<Action, string> = {
  hit: "H",
  stand: "S",
  double: "D",
  split: "P",
  surrender: "R",
};

const KEY_TO_ACTION: Record<string, Action> = {
  h: "hit",
  s: "stand",
  d: "double",
  p: "split",
  r: "surrender",
};

interface Options {
  /** Fired on Enter / Space (deal, next hand, next question). */
  onConfirm?: () => void;
  /** When false, no shortcuts are bound. */
  enabled?: boolean;
}

/**
 * Bind H/S/D/P/R to blackjack actions and Enter/Space to a confirm handler.
 * Handlers are only invoked when provided, so callers pass just the moves that
 * are currently legal. Ignores keystrokes while a form field is focused.
 */
export function useActionHotkeys(
  handlers: Partial<Record<Action, (() => void) | undefined>>,
  { onConfirm, enabled = true }: Options = {},
) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      if (e.key === "Enter" || e.key === " ") {
        if (onConfirm) {
          e.preventDefault();
          onConfirm();
        }
        return;
      }
      const action = KEY_TO_ACTION[e.key.toLowerCase()];
      if (!action) return;
      const handler = handlers[action];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers, onConfirm, enabled]);
}
