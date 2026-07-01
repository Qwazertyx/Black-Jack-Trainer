"use client";

import { hardCode, pairCode, softCode, type Code } from "@/lib/blackjack/strategy";
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

function Cell({ code, highlight }: { code: Code; highlight?: boolean }) {
  const st = CODE_STYLE[code];
  return (
    <td
      className={`h-7 w-8 text-center text-[11px] font-bold text-ink ${
        highlight ? "ring-2 ring-gold ring-inset" : ""
      }`}
      style={{ background: st.bg }}
    >
      {st.label}
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
  highlight?: { section: "hard" | "soft" | "pair"; key: number; up: number } | null;
}

export function StrategyChart({ rules, highlight }: Props) {
  const hardRows = [];
  for (let t = 17; t >= 8; t--) hardRows.push(t);
  const softRows = [20, 19, 18, 17, 16, 15, 14, 13]; // A,9 .. A,2
  const pairRows = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

  const softLabel = (t: number) => `A,${t - 11}`;
  const pairLabel = (p: number) =>
    p === 11 ? "A,A" : p === 10 ? "10,10" : `${p},${p}`;

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
            <tr>
              <td colSpan={DEALERS.length + 1} className="pt-1 text-xs font-bold text-gold/70">
                Hard totals
              </td>
            </tr>
            {hardRows.map((t) => (
              <tr key={`h${t}`}>
                <RowHeader>{t}</RowHeader>
                {DEALERS.map((d) => (
                  <Cell
                    key={d}
                    code={hardCode(t, d, rules)}
                    highlight={
                      highlight?.section === "hard" &&
                      highlight.key === t &&
                      highlight.up === d
                    }
                  />
                ))}
              </tr>
            ))}

            <tr>
              <td colSpan={DEALERS.length + 1} className="pt-2 text-xs font-bold text-gold/70">
                Soft totals
              </td>
            </tr>
            {softRows.map((t) => (
              <tr key={`s${t}`}>
                <RowHeader>{softLabel(t)}</RowHeader>
                {DEALERS.map((d) => (
                  <Cell
                    key={d}
                    code={softCode(t, d, rules)}
                    highlight={
                      highlight?.section === "soft" &&
                      highlight.key === t &&
                      highlight.up === d
                    }
                  />
                ))}
              </tr>
            ))}

            <tr>
              <td colSpan={DEALERS.length + 1} className="pt-2 text-xs font-bold text-gold/70">
                Pairs
              </td>
            </tr>
            {pairRows.map((p) => (
              <tr key={`p${p}`}>
                <RowHeader>{pairLabel(p)}</RowHeader>
                {DEALERS.map((d) => (
                  <Cell
                    key={d}
                    code={pairCode(p, d, rules)}
                    highlight={
                      highlight?.section === "pair" &&
                      highlight.key === p &&
                      highlight.up === d
                    }
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
