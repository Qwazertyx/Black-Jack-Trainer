"use client";

import { useEffect, useState } from "react";
import { PlayTable } from "@/components/PlayTable";
import { QuizMode } from "@/components/QuizMode";
import { CountingMode } from "@/components/CountingMode";
import { StatsDashboard } from "@/components/StatsDashboard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { SiteFooter } from "@/components/SiteFooter";

type Mode = "play" | "quiz" | "count" | "stats" | "settings";

/** Bitmap text labels only. Emoji icons were the loudest AI tell in the old header. */
const TABS: { id: Mode; label: string }[] = [
  { id: "play", label: "Play" },
  { id: "quiz", label: "Quiz" },
  { id: "count", label: "Count" },
  { id: "stats", label: "Stats" },
  { id: "settings", label: "Config" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("play");
  const [mounted, setMounted] = useState(false);

  // Gate on mount so the persisted (localStorage) store hydrates on the client
  // before we render store-dependent UI, avoiding hydration mismatches.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  /*
    Play is sized to the viewport so the table and the action buttons are always
    on the first screen, with no scrolling. The other modes are documents: they
    scroll normally.
  */
  const isPlay = mode === "play";

  return (
    <div className="flex h-[100dvh] flex-col">
      <DisclaimerModal />

      <header className="shrink-0 border-b-2 border-felt-600 bg-felt-900">
        <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="font-display text-3xl leading-none sm:text-4xl">
              Vico <span className="text-carmine">Blackjack</span>
            </h1>
            {/* The tagline is the first thing to go when height is scarce. */}
            <p className="label hidden text-gold-dim sm:block">
              Basic strategy, by the book
            </p>
          </div>

          <nav className="-mx-1 mt-2 flex overflow-x-auto" aria-label="Modes">
            {TABS.map((t) => {
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  aria-current={active ? "page" : undefined}
                  // Emphasis is inversion: the active tab is paper on ink.
                  className={`font-bitmap relative top-[2px] whitespace-nowrap border-2 border-b-0 px-3 py-2 text-[11px] uppercase tracking-[0.06em] ${
                    active
                      ? "border-felt-600 bg-gold text-ink"
                      : "border-transparent text-gold-dim hover:text-cream"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-4xl flex-1 px-4 py-3 ${
          isPlay ? "flex min-h-0 flex-col" : "overflow-y-auto"
        }`}
      >
        {!mounted ? (
          <div className="label flex flex-1 items-center justify-center text-gold-dim">
            Shuffling the shoe
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

      {/* The responsible-gambling notice stays on every screen, one line on Play. */}
      <SiteFooter compact={isPlay} />
    </div>
  );
}
