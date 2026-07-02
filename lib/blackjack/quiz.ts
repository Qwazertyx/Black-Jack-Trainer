import { handValue, RANKS, SUITS } from "./cards";
import type { Section } from "./situationKey";
import { situationKey } from "./situationKey";
import type { Card, Rank } from "./types";

let seq = 0;
function makeCard(rank: Rank): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank, suit, id: `q-${rank}-${suit}-${seq++}` };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface Situation {
  cards: [Card, Card];
  dealerUp: Card;
}

/** Random two-card player hand + dealer up-card, weighted for variety. */
export function randomSituation(): Situation {
  const roll = Math.random();
  let cards: [Card, Card];

  if (roll < 0.28) {
    // Pair
    const r = pick(RANKS);
    cards = [makeCard(r), makeCard(r)];
  } else if (roll < 0.58) {
    // Soft hand: ace + 2..9
    const other = pick(["2", "3", "4", "5", "6", "7", "8", "9"] as Rank[]);
    cards = Math.random() < 0.5 ? [makeCard("A"), makeCard(other)] : [makeCard(other), makeCard("A")];
  } else {
    // Hard hand: two non-ace cards of different value, total 5-20
    const nonAce: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let a = pick(nonAce);
    let b = pick(nonAce);
    let guard = 0;
    const val = (r: Rank) => handValue([makeCard(r)]).total;
    while ((val(a) === val(b) || val(a) + val(b) < 5) && guard++ < 20) {
      a = pick(nonAce);
      b = pick(nonAce);
    }
    cards = [makeCard(a), makeCard(b)];
  }

  const dealerUp = makeCard(pick(RANKS));
  return { cards, dealerUp };
}

// --- Targeted ("weak spot") drilling ------------------------------------

/** Rank string for a card whose blackjack value is `v` (11 = Ace, 10 = ten). */
function rankForValue(v: number): Rank {
  if (v === 11) return "A";
  if (v === 10) return "10";
  return String(v) as Rank;
}

/**
 * Build a concrete two-card situation for a specific chart cell. Used to turn a
 * weak-spot key back into a playable hand for targeted practice.
 */
export function situationFromCell(section: Section, key: number, up: number): Situation {
  const dealerUp = makeCard(rankForValue(up));
  if (section === "pair") {
    const r = rankForValue(key);
    return { cards: [makeCard(r), makeCard(r)], dealerUp };
  }
  if (section === "soft") {
    // Soft total = Ace + (key - 11).
    const other = rankForValue(key - 11);
    return { cards: [makeCard("A"), makeCard(other)], dealerUp };
  }
  // Hard total: two distinct non-ace cards summing to `key`, never a pair.
  for (let a = 2; a <= 10; a++) {
    const b = key - a;
    if (b >= 2 && b <= 10 && b !== a) {
      return { cards: [makeCard(rankForValue(a)), makeCard(rankForValue(b))], dealerUp };
    }
  }
  // Fallback (e.g. hard totals with no distinct pair): use the closest split.
  const half = Math.floor(key / 2);
  return {
    cards: [makeCard(rankForValue(half)), makeCard(rankForValue(key - half))],
    dealerUp,
  };
}

export interface CellMastery {
  seen: number;
  correct: number;
}

/** Every chart cell the trainer grades, as (section, key, up) triples. */
export function allCells(): { section: Section; key: number; up: number }[] {
  const cells: { section: Section; key: number; up: number }[] = [];
  const push = (section: Section, keys: number[]) => {
    for (const key of keys) for (let up = 2; up <= 11; up++) cells.push({ section, key, up });
  };
  push("hard", [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  push("soft", [13, 14, 15, 16, 17, 18, 19, 20]);
  push("pair", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  return cells;
}

/**
 * Pick a situation biased toward the player's weak spots. Cells never seen or
 * often missed get more weight; well-practised cells get less. Falls back to a
 * fully random situation when there is no history yet.
 */
export function weakSituation(
  mastery: Record<string, CellMastery>,
  rng: () => number = Math.random,
): Situation {
  const cells = allCells();
  const weighted = cells.map((c) => {
    const m = mastery[situationKey(c.section, c.key, c.up)];
    if (!m || m.seen === 0) return { c, w: 5 }; // never practised — prioritise
    const acc = m.correct / m.seen;
    return { c, w: 0.5 + 4 * (1 - acc) }; // low accuracy -> more weight
  });
  const total = weighted.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const x of weighted) {
    r -= x.w;
    if (r <= 0) return situationFromCell(x.c.section, x.c.key, x.c.up);
  }
  return randomSituation();
}
