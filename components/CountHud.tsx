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
  const tone =
    tc >= 2 ? "text-emerald-400" : tc <= -2 ? "text-rose-400" : "text-cream/80";
  return (
    <div className="glass flex items-center gap-3 rounded-xl px-3 py-1.5 text-xs">
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-wide text-cream/50">Running</span>
        <span className="font-mono text-sm font-bold text-cream">{sign(running)}</span>
      </div>
      <div className="h-6 w-px bg-gold/20" />
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-wide text-cream/50">True</span>
        <span className={`font-mono text-sm font-bold ${tone}`}>{sign(tc)}</span>
      </div>
    </div>
  );
}
