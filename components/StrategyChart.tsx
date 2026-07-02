"use client";

import { Fragment } from "react";
import { hardCode, pairCode, softCode, type Code } from "@/lib/blackjack/strategy";
import { situationKey, type Section } from "@/lib/blackjack/situationKey";
import type { CellMastery } from "@/lib/blackjack/quiz";
import type { Rules } from "@/lib/blackjack/types";

const DEALERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const dealerLabel = (n: number) => (n === 11 ? "A" : String(n));

const CODE_STYLE: Record<Code, { bg: string; label: string }> = {
  H: { bg: "#b23a48", label: "H" },
  S: { bg: "#2e8b57", label: "S" },
  D: { bg: "#3b82f6", label: "D" },
  Ds: { bg: "#60a5fa", label: "Ds" },
  P: { bg: "#c99a2e", label: "P" },
  R: { bg: "#6b7280", label: "R" },
  Rs: { bg: "#9ca3af", label: "Rs" },
};

/** Background for a cell in mastery mode, based on accuracy over enough plays. */
function masteryBg(m: CellMastery | undefined): { bg: string; faint: boolean } {
  if (!m || m.seen === 0) return { bg: "#334155", faint: true }; // unseen
  const acc = m.correct / m.seen;
  if (m.seen < 3) return { bg: "#475569", faint: false }; // too few to judge
  if (acc >= 0.8) return { bg: "#2e8b57", faint: false };
  if (acc >= 0.5) return { bg: "#c99a2e", faint: false };
  return { bg: "#b23a48", faint: false };
}

function Cell({
  bg,
  label,
  faint,
  highlight,
  title,
}: {
  bg: string;
  label: string;
  faint?: boolean;
  highlight?: boolean;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={`h-7 w-8 text-center text-[11px] font-bold text-ink ${
        faint ? "opacity-40" : ""
      } ${highlight ? "ring-2 ring-gold ring-inset" : ""}`}
      style={{ background: bg }}
    >
      {label}
    </td>
  );
}

function RowHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="sticky left-0 z-10 bg-felt-900 px-2 text-right text-xs font-semibold text-cream/80">
      {children}
    </th>
  );
}

interface Props {
  rules: Rules;
  /** Optional situation to highlight: { section, key, dealerUp }. */
  highlight?: { section: Section; key: number; up: number } | null;
  /**
   * When "mastery", cells are tinted by the player's accuracy on each hand
   * (from `mastery`) instead of the strategy colour.
   */
  mode?: "strategy" | "mastery";
  mastery?: Record<string, CellMastery>;
}

export function StrategyChart({ rules, highlight, mode = "strategy", mastery = {} }: Props) {
  const hardRows = [];
  for (let t = 17; t >= 8; t--) hardRows.push(t);
  const softRows = [20, 19, 18, 17, 16, 15, 14, 13]; // A,9 .. A,2
  const pairRows = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

  const softLabel = (t: number) => `A,${t - 11}`;
  const pairLabel = (p: number) =>
    p === 11 ? "A,A" : p === 10 ? "10,10" : `${p},${p}`;

  const codeFor = (section: Section, key: number, up: number): Code =>
    section === "hard"
      ? hardCode(key, up, rules)
      : section === "soft"
        ? softCode(key, up, rules)
        : pairCode(key, up, rules);

  // Build the props for a single cell in either display mode.
  const cellProps = (section: Section, key: number, up: number) => {
    const code = codeFor(section, key, up);
    const highlighted =
      highlight?.section === section && highlight.key === key && highlight.up === up;
    if (mode === "mastery") {
      const m = mastery[situationKey(section, key, up)];
      const { bg, faint } = masteryBg(m);
      const title = m
        ? `${situationKey(section, key, up)} — ${m.correct}/${m.seen} correct`
        : `${situationKey(section, key, up)} — not practised`;
      return { bg, label: CODE_STYLE[code].label, faint, highlight: highlighted, title };
    }
    const st = CODE_STYLE[code];
    return { bg: st.bg, label: st.label, highlight: highlighted };
  };

  const sections: { title: string; rows: number[]; section: Section; label: (n: number) => string }[] = [
    { title: "Hard totals", rows: hardRows, section: "hard", label: String },
    { title: "Soft totals", rows: softRows, section: "soft", label: softLabel },
    { title: "Pairs", rows: pairRows, section: "pair", label: pairLabel },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-[2px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-felt-900 px-2 text-xs text-cream/50">
                vs →
              </th>
              {DEALERS.map((d) => (
                <th key={d} className="w-8 text-center text-xs font-bold text-gold-soft">
                  {dealerLabel(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((sec) => (
              <Fragment key={sec.section}>
                <tr>
                  <td
                    colSpan={DEALERS.length + 1}
                    className="pt-2 text-xs font-bold text-gold/70"
                  >
                    {sec.title}
                  </td>
                </tr>
                {sec.rows.map((key) => (
                  <tr key={`${sec.section}${key}`}>
                    <RowHeader>{sec.label(key)}</RowHeader>
                    {DEALERS.map((d) => (
                      <Cell key={d} {...cellProps(sec.section, key, d)} />
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {mode === "mastery" ? (
        <div className="flex flex-wrap gap-3 text-xs">
          {(
            [
              ["#2e8b57", "Mastered (≥80%)"],
              ["#c99a2e", "Shaky (50-80%)"],
              ["#b23a48", "Weak (<50%)"],
              ["#475569", "Seen once or twice"],
              ["#334155", "Not practised"],
            ] as const
          ).map(([bg, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-4 w-6 rounded"
                style={{ background: bg }}
              />
              <span className="text-cream/70">{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 text-xs">
          {(
            [
              ["H", "Hit"],
              ["S", "Stand"],
              ["D", "Double / else hit"],
              ["Ds", "Double / else stand"],
              ["P", "Split"],
              ["R", "Surrender"],
            ] as const
          ).map(([code, label]) => (
            <div key={code} className="flex items-center gap-1.5">
              <span
                className="inline-block h-4 w-6 rounded text-center text-[10px] font-bold text-ink"
                style={{ background: CODE_STYLE[code as Code].bg }}
              >
                {code}
              </span>
              <span className="text-cream/70">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
