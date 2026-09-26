'use client';

import { useEffect, useRef, useState } from 'react';
import { STAGES, animateCountUp, formatCurrency, formatCompactNumber } from '../utils/math';

function AnimatedStat({ value, format }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (Math.abs(to - from) < 0.01) {
      setDisplay(to);
      return;
    }
    prevRef.current = to;
    animateCountUp(from, to, 500, (v) => setDisplay(v));
  }, [value]);

  return <span className="count-up">{format(display)}</span>;
}

function StatChip({ label, value, format, accent }) {
  const accentClasses = {
    cyan: 'text-cyan-300',
    magenta: 'text-fuchsia-300',
    lime: 'text-lime-300',
    white: 'text-slate-100',
  };

  return (
    <div className="flex flex-col px-3 py-1.5 sm:px-4 sm:py-2">
      <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm sm:text-lg font-semibold ${accentClasses[accent] || accentClasses.white}`}>
        <AnimatedStat value={value} format={format} />
      </span>
    </div>
  );
}

export default function TopBar({ company, personal, muted, onToggleMute }) {
  const stageIndex = STAGES.findIndex((s) => s.id === company.stage);
  const stage = STAGES[stageIndex] || STAGES[0];

  return (
    <header className="sticky top-0 z-30 border-b border-panelborder bg-panel/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-y-1 px-2 sm:px-4">
        <div className="flex flex-wrap items-center divide-x divide-panelborder">
          <StatChip label="Cash" value={company.cash} format={formatCurrency} accent="lime" />
          <StatChip label="MRR" value={company.mrr} format={(v) => `${formatCurrency(v)}/mo`} accent="cyan" />
          <StatChip label="Users" value={company.users} format={formatCompactNumber} accent="cyan" />
          <StatChip
            label="Valuation"
            value={company.valuation}
            format={formatCurrency}
            accent="magenta"
          />
          <StatChip label="Age" value={personal.age} format={(v) => `${Math.floor(v)}`} accent="white" />
        </div>

        <div className="flex items-center gap-2 py-1.5 pr-1 sm:pr-2">
          <div className="rounded-full border border-panelborder bg-base px-3 py-1 text-xs font-medium text-slate-300">
            Stage {stageIndex + 1}/5 &middot; <span className="text-fuchsia-300">{stage.label}</span>
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className="rounded-full border border-panelborder bg-base px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-glow hover:text-cyan-300 transition-colors"
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title={muted ? 'Unmute sound' : 'Mute sound'}
          >
            {muted ? '\u{1F507}' : '\u{1F50A}'}
          </button>
        </div>
      </div>
    </header>
  );
}
