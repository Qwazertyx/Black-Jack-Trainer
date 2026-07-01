"use client";

import { useGame } from "@/lib/store/useGame";
import { StrategyChart } from "./StrategyChart";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3 text-left transition-colors hover:bg-black/30"
    >
      <span>
        <span className="block text-sm font-semibold text-cream">{label}</span>
        {hint && <span className="block text-xs text-cream/50">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-cream/50">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              value === o.value
                ? "bg-gold text-ink"
                : "bg-felt-700 text-cream gold-ring hover:bg-felt-600"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const settings = useGame((s) => s.settings);
  const setRules = useGame((s) => s.setRules);
  const toggleSetting = useGame((s) => s.toggleSetting);
  const { rules } = settings;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <div className="glass flex flex-col gap-4 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-gold-soft">Table rules</h3>
          <p className="-mt-2 text-xs text-cream/50">
            The strategy chart and dealer behaviour update instantly.
          </p>

          <Segmented
            label="Number of decks"
            value={rules.decks}
            options={[1, 2, 4, 6, 8].map((d) => ({ value: d, label: String(d) }))}
            onChange={(decks) => setRules({ decks })}
          />

          <Segmented
            label="Dealer on soft 17"
            value={rules.dealerHitsSoft17 ? "h17" : "s17"}
            options={[
              { value: "s17", label: "Stands (S17)" },
              { value: "h17", label: "Hits (H17)" },
            ]}
            onChange={(v) => setRules({ dealerHitsSoft17: v === "h17" })}
          />

          <Segmented
            label="Blackjack pays"
            value={rules.blackjackPayout === 1.2 ? "65" : "32"}
            options={[
              { value: "32", label: "3 : 2" },
              { value: "65", label: "6 : 5" },
            ]}
            onChange={(v) => setRules({ blackjackPayout: v === "65" ? 1.2 : 1.5 })}
          />

          <Toggle
            label="Double after split (DAS)"
            hint="Allowed to double once you've split a pair."
            checked={rules.doubleAfterSplit}
            onChange={() => setRules({ doubleAfterSplit: !rules.doubleAfterSplit })}
          />
          <Toggle
            label="Late surrender"
            hint="Forfeit half your bet against a strong dealer card."
            checked={rules.surrenderAllowed}
            onChange={() => setRules({ surrenderAllowed: !rules.surrenderAllowed })}
          />
        </div>

        <div className="glass flex flex-col gap-3 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-gold-soft">Training options</h3>
          <Toggle
            label="Coach mode"
            hint="Instant feedback after every decision."
            checked={settings.coachMode}
            onChange={() => toggleSetting("coachMode")}
          />
          <Toggle
            label="Show hints"
            hint="Highlight the book play before you act (practice mode)."
            checked={settings.showHints}
            onChange={() => toggleSetting("showHints")}
          />
          <Toggle
            label="Show card count"
            hint="Overlay the Hi-Lo running & true count on the table."
            checked={settings.showCount}
            onChange={() => toggleSetting("showCount")}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 text-lg font-bold text-gold-soft">Your strategy chart</h3>
        <p className="mb-3 text-xs text-cream/50">
          This is the optimal chart for your current rules — the exact plays the trainer
          grades you against.
        </p>
        <StrategyChart rules={rules} />
      </div>
    </div>
  );
}
