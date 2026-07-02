import { handValue, pairValue } from "./cards";
import { upcardValue } from "./strategy";
import type { Card } from "./types";

/** The three chart sections a hand can fall into. */
export type Section = "hard" | "soft" | "pair";

/** How a dealer up-card is written in a situation key ("A" or 2-10). */
export function dealerKeyLabel(up: number): string {
  return up === 11 ? "A" : String(up);
}

/**
 * Canonical, human-readable key for a strategy situation. This is the single
 * source of truth shared by decision tracking (`describeSituation`) and the
 * chart heat-map, so a cell in the chart maps to exactly the key stored when a
 * hand of that shape is played.
 */
export function situationKey(section: Section, key: number, up: number): string {
  const u = dealerKeyLabel(up);
  if (section === "pair") {
    const label = key === 11 ? "A,A" : key === 10 ? "10,10" : `${key},${key}`;
    return `${label} vs ${u}`;
  }
  return `${section} ${key} vs ${u}`;
}

/** Classify a two-card hand + dealer up-card into (section, key, up). */
export function classify(
  cards: Card[],
  dealerUp: Card,
): { section: Section; key: number; up: number } {
  const up = upcardValue(dealerUp);
  const pair = pairValue(cards);
  if (pair !== null && cards.length === 2) return { section: "pair", key: pair, up };
  const { total, soft } = handValue(cards);
  if (soft && total <= 20) return { section: "soft", key: total, up };
  return { section: "hard", key: total, up };
}

/** Human-readable key for a situation, used to track per-hand mastery. */
export function describeSituation(cards: Card[], dealerUp: Card): string {
  const { section, key, up } = classify(cards, dealerUp);
  return situationKey(section, key, up);
}
