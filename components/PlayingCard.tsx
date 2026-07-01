"use client";

import { motion } from "framer-motion";
import type { Card, Suit } from "@/lib/blackjack/types";

const SUIT_SYMBOL: Record<Suit, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

const RED_SUITS: Suit[] = ["H", "D"];

interface Props {
  card?: Card;
  faceDown?: boolean;
  /** Index used to stagger the deal animation. */
  index?: number;
  size?: "sm" | "md";
}

export function PlayingCard({ card, faceDown, index = 0, size = "md" }: Props) {
  const dims =
    size === "sm"
      ? "w-11 h-16 text-sm rounded-md"
      : "w-16 h-24 sm:w-[4.5rem] sm:h-[6.5rem] text-lg rounded-lg";

  const isRed = card ? RED_SUITS.includes(card.suit) : false;
  const symbol = card ? SUIT_SYMBOL[card.suit] : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, rotateZ: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotateZ: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 320, damping: 26 }}
      className={`relative ${dims} shrink-0 playing-card-shadow select-none`}
    >
      {faceDown || !card ? (
        <div
          className={`h-full w-full ${dims} overflow-hidden`}
          style={{
            background:
              "repeating-linear-gradient(45deg, #7a1420 0 8px, #5c0f18 8px 16px)",
            boxShadow: "inset 0 0 0 2px rgba(212,175,55,0.55), inset 0 0 0 6px #7a1420",
          }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-gold/70 text-2xl">♣</span>
          </div>
        </div>
      ) : (
        <div
          className={`h-full w-full ${dims} bg-cream flex flex-col justify-between p-1.5`}
          style={{ color: isRed ? "#c02434" : "#141414" }}
        >
          <div className="flex flex-col items-start leading-none font-semibold">
            <span>{card.rank}</span>
            <span className="text-xs">{symbol}</span>
          </div>
          <div className="self-center text-2xl sm:text-3xl leading-none">{symbol}</div>
          <div className="flex flex-col items-end leading-none font-semibold rotate-180">
            <span>{card.rank}</span>
            <span className="text-xs">{symbol}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
