"use client";

import { computeAchievements } from "@/lib/store/achievements";
import type { Stats } from "@/lib/store/stats";

export function Achievements({ stats }: { stats: Stats }) {
  const items = computeAchievements(stats);
  const unlocked = items.filter((a) => a.unlocked).length;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gold-soft">Achievements</h3>
        <span className="text-xs text-cream/50">
          {unlocked}/{items.length} unlocked
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((a) => {
          const pct = Math.round((a.progress / a.goal) * 100);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                a.unlocked ? "bg-gold/15 gold-ring" : "bg-black/20"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg ${
                  a.unlocked ? "bg-gold/25" : "bg-black/30 grayscale"
                }`}
              >
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm font-bold ${
                      a.unlocked ? "text-cream" : "text-cream/70"
                    }`}
                  >
                    {a.title}
                  </span>
                  {a.unlocked && <span className="text-xs text-gold-soft">✓</span>}
                </div>
                <p className="truncate text-xs text-cream/50">{a.desc}</p>
                {!a.unlocked && (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full bg-gold/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
