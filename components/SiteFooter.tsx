"use client";

import { useState } from "react";

type Section = "gambling" | "privacy" | null;

/**
 * Always rendered. On the play screen `compact` shrinks the bar to a single
 * line so the legal notice stays present without costing the table any height.
 */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<Section>(null);

  function toggle(s: Section) {
    setOpen((prev) => (prev === s ? null : s));
  }

  return (
    <footer className="shrink-0 border-t-2 border-felt-600 bg-felt-900 text-xs text-gold-dim">
      {/* Expandable sections */}
      {open === "gambling" && (
        <div className="mx-auto max-w-5xl border-b border-gold/10 px-4 py-5 text-cream/70">
          <h3 className="mb-2 font-bold text-cream">
            Responsible Gambling
          </h3>
          <p className="mb-2">
            <strong className="text-amber-300">
              This app is for educational purposes only.
            </strong>{" "}
            No real money, no wagers, no casino affiliation. Practicing
            strategy here does not guarantee winnings in real gambling settings.
          </p>
          <p className="mb-2">
            Gambling can be addictive and cause serious financial, emotional,
            and social harm. If you choose to gamble in real life, always set
            strict limits and never bet money you cannot afford to lose.
          </p>
          <p className="mb-3 font-semibold text-cream">
            If you or someone you know needs help:
          </p>
          <ul className="space-y-1">
            <li>
              <strong>USA —</strong> National Council on Problem Gambling:{" "}
              <a
                href="https://www.ncpgambling.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-soft underline"
              >
                ncpgambling.org
              </a>{" "}
              · Helpline: <strong>1-800-522-4700</strong>
            </li>
            <li>
              <strong>Canada —</strong>{" "}
              <a
                href="https://www.connexontario.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-soft underline"
              >
                ConnexOntario
              </a>{" "}
              · 1-866-531-2600
            </li>
            <li>
              <strong>UK —</strong>{" "}
              <a
                href="https://www.gamcare.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-soft underline"
              >
                GamCare
              </a>{" "}
              · 0808 8020 133
            </li>
            <li>
              <strong>EU / International —</strong>{" "}
              <a
                href="https://www.gamblingtherapy.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-soft underline"
              >
                Gambling Therapy
              </a>{" "}
              (free online support)
            </li>
          </ul>
          <p className="mt-3">
            This app is intended for users aged <strong>18 or older</strong>{" "}
            (or the legal age of majority / gambling age in your jurisdiction).
          </p>
        </div>
      )}

      {open === "privacy" && (
        <div className="mx-auto max-w-5xl border-b border-gold/10 px-4 py-5 text-cream/70">
          <h3 className="mb-2 font-bold text-cream">Privacy & Data Policy</h3>
          <p className="mb-2">
            <strong className="text-cream">
              Vico Blackjack collects zero personal data.
            </strong>{" "}
            There is no backend, no server, and no account system. The app runs
            entirely in your browser.
          </p>
          <ul className="mb-3 list-disc space-y-1 pl-4">
            <li>
              Your game settings, statistics, bankroll, and training progress
              are stored only in your browser&apos;s{" "}
              <code className="rounded bg-white/10 px-1">localStorage</code>.
            </li>
            <li>
              No data is transmitted to any external server, analytics service,
              or third party.
            </li>
            <li>
              No cookies are set by this application.
            </li>
            <li>
              You can clear all stored data at any time by clearing your
              browser&apos;s local storage, or by using the reset option in
              Settings.
            </li>
          </ul>
          <p className="mb-2">
            <strong className="text-cream">Third-party fonts:</strong> This
            site loads the Jacquard 12, Silkscreen and IBM Plex Sans typefaces
            from Google Fonts. Google&apos;s
            servers may log your IP address as part of that request. If you
            prefer, you can block external fonts via your browser or network
            settings.
          </p>
          <p>
            <strong className="text-cream">GDPR / CCPA:</strong> Because no
            personal data is collected or processed by this application, no
            consent or data-deletion request is required. If this ever changes,
            this policy will be updated and users will be notified.
          </p>
        </div>
      )}

      {/* Footer bar */}
      <div
        className={`mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 ${
          compact ? "py-1.5 text-[10px]" : "py-4"
        }`}
      >
        <span>
          {compact ? (
            "Educational use only. No real money."
          ) : (
            <>
              &copy; {new Date().getFullYear()}{" "}Vico Blackjack &mdash; Educational
              use only. No real money. Not affiliated with any casino.
            </>
          )}
        </span>
        <div className="flex gap-4">
          <button
            onClick={() => toggle("gambling")}
            className={`transition-colors hover:text-cream ${open === "gambling" ? "text-gold-soft" : ""}`}
          >
            Responsible Gambling
          </button>
          <button
            onClick={() => toggle("privacy")}
            className={`transition-colors hover:text-cream ${open === "privacy" ? "text-gold-soft" : ""}`}
          >
            Privacy & Data
          </button>
        </div>
      </div>
    </footer>
  );
}
