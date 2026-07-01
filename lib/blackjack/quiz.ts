import { handValue, RANKS, SUITS } from "./cards";
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
