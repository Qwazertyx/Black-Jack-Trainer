"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vico_disclaimer_accepted";

export function DisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
      <div className="glass gold-ring w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-gold-soft to-gold-dim text-lg font-black text-ink">
            ♠
          </span>
          <h2 className="text-lg font-black text-cream">
            Welcome to Vico <span className="text-gold-soft">Blackjack</span>
          </h2>
        </div>

        <div className="space-y-3 text-sm text-cream/80">
          <p>
            <strong className="text-cream">This is an educational tool, not a gambling site.</strong>{" "}
            Vico Blackjack exists solely to help you understand and practice
            perfect basic strategy and card counting — no real money is ever
            involved.
          </p>

          <p>
            <strong className="text-gold-soft">18+ only.</strong> This app
            simulates casino blackjack. It is intended for adults (18 years of
            age or older, or the legal gambling age in your jurisdiction).
          </p>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="font-semibold text-amber-300">
              Responsible Gambling Notice
            </p>
            <p className="mt-1 text-cream/70">
              Gambling can be addictive and cause serious financial and personal
              harm. Skill learned here does not guarantee winnings in real
              casinos. If you or someone you know has a gambling problem, please
              seek help:
            </p>
            <ul className="mt-2 space-y-1 text-cream/70">
              <li>
                <strong>US:</strong>{" "}
                <a
                  href="https://www.ncpgambling.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-soft underline"
                >
                  ncpgambling.org
                </a>{" "}
                · 1-800-522-4700
              </li>
              <li>
                <strong>EU/Int&apos;l:</strong>{" "}
                <a
                  href="https://www.gamblingtherapy.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-soft underline"
                >
                  gamblingtherapy.org
                </a>
              </li>
            </ul>
          </div>

          <p className="text-cream/50">
            All progress data is stored locally in your browser. Nothing is
            sent to any server.
          </p>
        </div>

        <button
          onClick={accept}
          className="mt-5 w-full rounded-lg bg-gold py-2.5 text-sm font-bold text-ink transition-opacity hover:opacity-90"
        >
          I understand — let me learn
        </button>
      </div>
    </div>
  );
}
