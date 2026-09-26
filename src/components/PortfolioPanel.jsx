'use client';

import { getBusinessType } from '../data/businessTypes';
import { getEnding } from '../utils/endings';
import { formatCurrency } from '../utils/math';

export default function PortfolioPanel({ stats, prestige, portfolio, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-modalIn card glow-magenta w-full max-w-xl border-2 border-fuchsia-400/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
            Career &amp; Portfolio
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-panelborder bg-base px-3 py-1 text-xs text-slate-300 hover:border-cyan-glow hover:text-cyan-300"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat label="Ventures Completed" value={portfolio?.length || 0} />
          <MiniStat label="Prestige Bonus" value={`+${Math.round((prestige.multiplier || 0) * 100)}%`} />
          <MiniStat label="Events Resolved" value={stats.totalEventsResolved} />
          <MiniStat label="Best Valuation" value={formatCurrency(stats.bestValuationEver)} />
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Endings Reached ({stats.endingsReached.length}/6)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.endingsReached.length === 0 && (
              <span className="text-[11px] text-slate-500">None yet.</span>
            )}
            {stats.endingsReached.map((id) => {
              const ending = getEnding(id);
              return (
                <span
                  key={id}
                  className="rounded-full border border-panelborder bg-base px-2 py-0.5 text-[11px] text-slate-300"
                >
                  {ending?.title || id}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Venture History
          </h3>
          <div className="max-h-[35vh] space-y-2 overflow-y-auto pr-1">
            {(!portfolio || portfolio.length === 0) && (
              <p className="text-[11px] text-slate-500">
                No past ventures yet — your history builds up here after each run ends.
              </p>
            )}
            {portfolio &&
              [...portfolio]
                .reverse()
                .map((entry) => {
                  const businessTypeDef = getBusinessType(entry.businessType);
                  const ending = getEnding(entry.endingId);
                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-panelborder bg-base px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-200">
                          {businessTypeDef.icon} {businessTypeDef.name}
                        </span>
                        <span className="text-[11px] font-medium text-fuchsia-300">
                          {ending?.title || 'Unresolved'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Ended at {formatCurrency(entry.finalValuation)} valuation, age{' '}
                        {entry.ageReached}
                      </p>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-panelborder bg-base px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
