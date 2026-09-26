'use client';

import { getEnding } from '../utils/endings';
import { formatCurrency, formatCompactNumber } from '../utils/math';

const TYPE_STYLES = {
  win: { border: 'border-lime-glow/50', glow: 'glow-lime', text: 'text-lime-glow' },
  loss: { border: 'border-rose-500/50', glow: 'glow-magenta', text: 'text-rose-300' },
  neutral: { border: 'border-cyan-glow/50', glow: 'glow-cyan', text: 'text-cyan-300' },
  bittersweet: { border: 'border-fuchsia-400/50', glow: 'glow-magenta', text: 'text-fuchsia-300' },
};

export default function GameOverScreen({ endingId, company, personal, prestige, onNewRun, onPrestige }) {
  const ending = getEnding(endingId);
  if (!ending) return null;

  const style = TYPE_STYLES[ending.type] || TYPE_STYLES.neutral;
  const canPrestige = ending.type === 'win' || endingId === 'ACQUISITION';
  const prestigeGain = Math.max(0, Math.log10(Math.max(company.valuation, 1)) - 4) * 0.15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className={`animate-modalIn card ${style.glow} w-full max-w-xl border-2 ${style.border} p-6 sm:p-8`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
          Run Complete
        </span>
        <h1 className={`mt-2 text-3xl font-bold sm:text-4xl ${style.text}`}>{ending.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{ending.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Final Valuation" value={formatCurrency(company.valuation)} />
          <Stat label="Final Cash" value={formatCurrency(company.cash)} />
          <Stat label="Users" value={formatCompactNumber(company.users)} />
          <Stat label="Age Reached" value={Math.floor(personal.age)} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Health" value={Math.round(personal.health)} />
          <Stat label="Happiness" value={Math.round(personal.happiness)} />
          <Stat label="Relationships" value={Math.round(personal.relationships)} />
          <Stat label="Reputation" value={Math.round(personal.reputation)} />
        </div>

        {canPrestige && (
          <div className="mt-6 rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/5 p-4">
            <p className="text-sm font-semibold text-fuchsia-300">Prestige Available</p>
            <p className="mt-1 text-xs text-slate-400">
              Selling the company grants a permanent{' '}
              <span className="font-semibold text-fuchsia-300">
                +{Math.round(prestigeGain * 100)}%
              </span>{' '}
              growth multiplier on every future run (current bonus:{' '}
              {Math.round((prestige?.multiplier || 0) * 100)}%).
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {canPrestige && (
            <button
              type="button"
              onClick={onPrestige}
              className="flex-1 rounded-lg bg-fuchsia-500/90 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-400"
            >
              Sell the Company &amp; Prestige
            </button>
          )}
          <button
            type="button"
            onClick={onNewRun}
            className="flex-1 rounded-lg border border-panelborder bg-base px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-glow hover:text-cyan-300"
          >
            Start New Run
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-panelborder bg-base px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
