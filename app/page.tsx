"use client";

import { useEffect, useState } from "react";
import { PlayTable } from "@/components/PlayTable";
import { QuizMode } from "@/components/QuizMode";
import { CountingMode } from "@/components/CountingMode";
import { StatsDashboard } from "@/components/StatsDashboard";
import { SettingsPanel } from "@/components/SettingsPanel";

type Mode = "play" | "quiz" | "count" | "stats" | "settings";

const TABS: { id: Mode; label: string; icon: string }[] = [
  { id: "play", label: "Play", icon: "🃏" },
  { id: "quiz", label: "Quiz", icon: "⚡" },
  { id: "count", label: "Counting", icon: "🧮" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("play");
  const [mounted, setMounted] = useState(false);

  // Gate on mount so the persisted (localStorage) store hydrates on the client
  // before we render store-dependent UI, avoiding hydration mismatches.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-felt-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-soft to-gold-dim text-lg font-black text-ink shadow">
              ♠
            </span>
            <div>
              <h1 className="text-lg font-black leading-none tracking-tight text-cream">
                Vico <span className="text-gold-soft">Blackjack</span>
              </h1>
              <p className="text-[11px] text-cream/50">
                Learn perfect basic strategy, by the book.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === t.id
                    ? "bg-gold text-ink"
                    : "text-cream/70 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {!mounted ? (
          <div className="flex h-64 items-center justify-center text-cream/40">
            Shuffling the shoe…
          </div>
        ) : (
          <>
            {mode === "play" && <PlayTable />}
            {mode === "quiz" && <QuizMode />}
            {mode === "count" && <CountingMode />}
            {mode === "stats" && <StatsDashboard />}
            {mode === "settings" && <SettingsPanel />}
          </>
        )}
      </main>

      <footer className="border-t border-gold/10 py-4 text-center text-xs text-cream/40">
        Vico Blackjack · A training tool for perfect play. No real money.
      </footer>
    </div>
  );
}
