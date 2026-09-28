"use client";

import type { Card, Suit } from "@/lib/blackjack/types";

/**
 * Suit pips drawn on a 7x7 grid, the way a low-res tileset would. Rendered as
 * SVG with `shape-rendering: crispEdges` so every pixel stays square at any size.
 */
const PIP_BITMAP: Record<Suit, string[]> = {
  S: ["...#...", "..###..", ".#####.", "#######", "#######", "...#...", "..###.."],
  H: [".##.##.", "#######", "#######", "#######", ".#####.", "..###..", "...#..."],
  D: ["...#...", "..###..", ".#####.", "#######", ".#####.", "..###..", "...#..."],
  C: ["..###..", ".#####.", "##.#.##", "#######", ".#####.", "...#...", "..###.."],
};

const RED_SUITS: Suit[] = ["H", "D"];

/** Ink on paper, and the darker carmine that reads at 4.5:1 on cream. */
const PIP_INK = "#14101c";
const PIP_CARMINE = "#9e2437";

/** Collapse each bitmap row into horizontal runs so we emit a handful of rects, not 49. */
function pipRects(suit: Suit) {
  const rects: { x: number; y: number; w: number }[] = [];
  PIP_BITMAP[suit].forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === "#") {
        let w = 1;
        while (row[x + w] === "#") w++;
        rects.push({ x, y, w });
        x += w;
      } else {
        x++;
      }
    }
  });
  return rects;
}

function Pip({ suit, size, color }: { suit: Suit; size: string; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      shapeRendering="crispEdges"
      fill={color}
      aria-hidden="true"
      className="pixelated block shrink-0"
    >
      {pipRects(suit).map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} />
      ))}
    </svg>
  );
}

interface Props {
  card?: Card;
  faceDown?: boolean;
  /** Index used to stagger the deal animation. */
  index?: number;
  size?: "sm" | "md";
}

export function PlayingCard({ card, faceDown, index = 0, size = "md" }: Props) {
  const isRed = card ? RED_SUITS.includes(card.suit) : false;
  const color = isRed ? PIP_CARMINE : PIP_INK;

  // `sm` is a fixed two-thirds card, used in the counting drill and quiz strips.
  const scale = size === "sm" ? 0.68 : 1;
  const geometry = {
    width: `calc(var(--card-w) * ${scale})`,
    height: `calc(var(--card-h) * ${scale})`,
    padding: `calc(var(--card-w) * ${0.07 * scale})`,
    animationDelay: `${index * 70}ms`,
  } as const;

  const rankStyle = {
    fontSize: `max(9px, calc(var(--card-w) * ${0.23 * scale}))`,
    lineHeight: 1,
  } as const;

  const cornerPip = `calc(var(--card-w) * ${0.15 * scale})`;
  const centerPip = `calc(var(--card-w) * ${0.38 * scale})`;

  if (faceDown || !card) {
    return (
      <div
        style={geometry}
        className="deal-step playing-card-shadow flex shrink-0 select-none items-center justify-center border-2 border-felt-950 bg-felt-700 shadow-[inset_0_0_0_3px_var(--color-felt-900),inset_0_0_0_5px_var(--color-felt-600),3px_3px_0_rgba(15,12,22,0.55)]"
        aria-label="Face-down card"
      >
        <Pip suit="S" size={centerPip} color="#443a5e" />
      </div>
    );
  }

  return (
    <div
      style={geometry}
      className="deal-step playing-card-shadow flex shrink-0 select-none flex-col justify-between border-2 border-felt-950 bg-gold"
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <div className="flex items-center gap-[2px]">
        <span className="font-bitmap" style={{ ...rankStyle, color }}>
          {card.rank}
        </span>
        <Pip suit={card.suit} size={cornerPip} color={color} />
      </div>

      <div className="self-center">
        <Pip suit={card.suit} size={centerPip} color={color} />
      </div>

      <div className="flex rotate-180 items-center gap-[2px]">
        <span className="font-bitmap" style={{ ...rankStyle, color }}>
          {card.rank}
        </span>
        <Pip suit={card.suit} size={cornerPip} color={color} />
      </div>
    </div>
  );
}
