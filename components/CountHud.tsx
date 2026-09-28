"use client";

interface Props {
  running: number;
  trueCount: number;
}

function sign(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export function CountHud({ running, trueCount }: Props) {
  const tc = Math.round(trueCount);
  // The true count is the one number that changes how you should bet, so it is
  // the one number allowed to change colour.
  const tone =
    tc >= 2 ? "text-verdigris" : tc <= -2 ? "text-carmine" : "text-cream";

  return (
    <div className="glass flex items-center gap-2 px-2 py-1">
      <div className="flex items-center gap-1">
        <span className="label text-gold-dim">RC</span>
        <span className="font-bitmap text-xs text-cream tabular-nums">
          {sign(running)}
        </span>
      </div>
      <div className="h-4 w-0.5 bg-felt-600" />
      <div className="flex items-center gap-1">
        <span className="label text-gold-dim">TC</span>
        <span className={`font-bitmap text-xs tabular-nums ${tone}`}>{sign(tc)}</span>
      </div>
    </div>
  );
}
