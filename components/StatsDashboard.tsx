"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { accuracy } from "@/lib/store/stats";
import { useGame } from "@/lib/store/useGame";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass flex flex-col gap-1 rounded-2xl p-4">
      <span className="text-xs uppercase tracking-wide text-cream/50">{label}</span>
      <span className={`text-2xl font-extrabold ${accent ?? "text-cream"}`}>{value}</span>
    </div>
  );
}

export function StatsDashboard() {
  const stats = useGame((s) => s.stats);
  const resetStats = useGame((s) => s.resetStats);

  const acc = accuracy(stats);

  let cum = 0;
  const line = stats.history.map((h, i) => {
    if (h.correct) cum++;
    return { n: i + 1, acc: Math.round((cum / (i + 1)) * 100) };
  });

  const catData = (["hard", "soft", "pair"] as const).map((cat) => {
    const c = stats.byCategory[cat];
    return {
      name: cat[0].toUpperCase() + cat.slice(1),
      acc: c.total ? Math.round((c.correct / c.total) * 100) : 0,
      total: c.total,
    };
  });

  const catColor = (v: number) =>
    v >= 90 ? "#2e8b57" : v >= 75 ? "#c99a2e" : "#b23a48";

  const missed = Object.entries(stats.missed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const totalOutcomes = stats.wins + stats.losses + stats.pushes || 1;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Accuracy"
          value={stats.decisions ? `${Math.round(acc * 100)}%` : "—"}
          accent="text-emerald-400"
        />
        <StatCard label="Decisions" value={String(stats.decisions)} />
        <StatCard
          label="Best streak"
          value={String(stats.bestStreak)}
          accent="text-gold-soft"
        />
        <StatCard
          label="Net units"
          value={`${stats.netUnits > 0 ? "+" : ""}${stats.netUnits}`}
          accent={stats.netUnits >= 0 ? "text-emerald-400" : "text-rose-400"}
        />
      </div>

      {stats.decisions === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-cream/60">
          No hands played yet. Head to <b className="text-gold-soft">Play</b> or{" "}
          <b className="text-gold-soft">Quiz</b> to start building your stats.
        </div>
      ) : (
        <>
          {/* Accuracy over time */}
          <div className="glass rounded-2xl p-4">
            <h3 className="mb-3 text-sm font-bold text-gold-soft">
              Accuracy over time
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={line} margin={{ left: -20, right: 8, top: 4 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="n" tick={{ fill: "#cbd5c5", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#cbd5c5", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0e3721",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: 8,
                    color: "#f5f1e6",
                  }}
                  formatter={(v) => [`${v}%`, "Accuracy"]}
                />
                <Line
                  type="monotone"
                  dataKey="acc"
                  stroke="#d4af37"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category accuracy + outcomes */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 text-sm font-bold text-gold-soft">
                Accuracy by hand type
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catData} margin={{ left: -20, right: 8, top: 4 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#cbd5c5", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#cbd5c5", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "#0e3721",
                      border: "1px solid rgba(212,175,55,0.3)",
                      borderRadius: 8,
                      color: "#f5f1e6",
                    }}
                    formatter={(v, _n, p) => [
                      `${v}% (${p.payload.total} hands)`,
                      "Accuracy",
                    ]}
                  />
                  <Bar dataKey="acc" radius={[6, 6, 0, 0]}>
                    {catData.map((d, i) => (
                      <Cell key={i} fill={catColor(d.acc)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass flex flex-col gap-3 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-gold-soft">Results</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <ResultRow label="Wins" value={stats.wins} tone="text-emerald-400" />
                <ResultRow label="Losses" value={stats.losses} tone="text-rose-400" />
                <ResultRow label="Pushes" value={stats.pushes} tone="text-cream/70" />
                <ResultRow
                  label="Blackjacks"
                  value={stats.blackjacks}
                  tone="text-gold-soft"
                />
              </div>
              <div className="mt-1">
                <div className="mb-1 flex justify-between text-xs text-cream/50">
                  <span>Win rate</span>
                  <span>{Math.round((stats.wins / totalOutcomes) * 100)}%</span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${(stats.wins / totalOutcomes) * 100}%` }}
                  />
                  <div
                    className="bg-slate-400"
                    style={{ width: `${(stats.pushes / totalOutcomes) * 100}%` }}
                  />
                  <div
                    className="bg-rose-600"
                    style={{ width: `${(stats.losses / totalOutcomes) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Most-missed hands */}
          {missed.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 text-sm font-bold text-gold-soft">
                Hands you miss most
              </h3>
              <div className="flex flex-wrap gap-2">
                {missed.map(([key, n]) => (
                  <span
                    key={key}
                    className="rounded-lg bg-rose-900/40 px-3 py-1.5 text-sm text-cream gold-ring"
                  >
                    {key} <span className="text-rose-300">×{n}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={resetStats}
        className="mx-auto rounded-xl bg-black/30 px-5 py-2 text-sm text-cream/70 gold-ring hover:text-rose-300"
      >
        Reset all stats
      </button>
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
      <span className="text-cream/60">{label}</span>
      <span className={`font-bold ${tone}`}>{value}</span>
    </div>
  );
}
