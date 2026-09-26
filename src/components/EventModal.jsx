'use client';

const TYPE_STYLES = {
  crisis: { label: 'Crisis', color: 'text-rose-300', border: 'border-rose-500/40', glow: 'glow-magenta' },
  investor: { label: 'Investor', color: 'text-lime-glow', border: 'border-lime-glow/40', glow: 'glow-lime' },
  employee: { label: 'Employee', color: 'text-cyan-300', border: 'border-cyan-glow/40', glow: 'glow-cyan' },
  personal: { label: 'Personal Life', color: 'text-fuchsia-300', border: 'border-fuchsia-400/40', glow: 'glow-magenta' },
  health: { label: 'Health Scare', color: 'text-rose-300', border: 'border-rose-500/40', glow: 'glow-magenta' },
  viral: { label: 'Viral Moment', color: 'text-cyan-300', border: 'border-cyan-glow/40', glow: 'glow-cyan' },
  legal: { label: 'Legal Trouble', color: 'text-amber-300', border: 'border-amber-400/40', glow: '' },
  competitor: { label: 'Competitor Move', color: 'text-orange-300', border: 'border-orange-400/40', glow: '' },
  relationship: { label: 'Relationship', color: 'text-fuchsia-300', border: 'border-fuchsia-400/40', glow: 'glow-magenta' },
  opportunity: { label: 'Opportunity', color: 'text-lime-glow', border: 'border-lime-glow/40', glow: 'glow-lime' },
};

function EffectPreview({ effects }) {
  if (!effects || Object.keys(effects).length === 0) return null;
  if (effects.buyoutOffer) {
    return <span className="text-[11px] font-medium text-lime-glow">Ends the run — Acquisition</span>;
  }

  const labels = {
    cash: 'Cash',
    mrr: 'MRR',
    users: 'Users',
    quality: 'Quality',
    morale: 'Morale',
    health: 'Health',
    happiness: 'Happiness',
    relationships: 'Relationships',
    reputation: 'Reputation',
  };

  const entries = Object.entries(effects).filter(([key]) => labels[key]);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            value > 0 ? 'bg-lime-glow/10 text-lime-glow' : 'bg-rose-500/10 text-rose-300'
          }`}
        >
          {labels[key]} {value > 0 ? '+' : ''}
          {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
        </span>
      ))}
    </div>
  );
}

export default function EventModal({ event, cash = 0, onChoose }) {
  if (!event) return null;

  const style = TYPE_STYLES[event.type] || TYPE_STYLES.opportunity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`animate-modalIn card ${style.glow} w-full max-w-lg border-2 ${style.border} p-5 sm:p-6`}
      >
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${style.color}`}>
          {style.label}
        </span>
        <h2 className="mt-1 text-lg font-bold text-slate-50 sm:text-xl">{event.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{event.description}</p>

        <div className="mt-5 space-y-2">
          {event.choices.map((choice, index) => {
            // A choice can declare requirements.minCash so the player can't
            // pick an option they can't actually afford — without this,
            // flat cash-cost choices had no relationship to what the
            // player actually had on hand and could drive cash arbitrarily
            // negative with no way out.
            const minCash = choice.requirements?.minCash;
            const affordable = minCash === undefined || cash >= minCash;

            return (
              <button
                key={index}
                type="button"
                disabled={!affordable}
                onClick={() => affordable && onChoose(index)}
                title={affordable ? undefined : "You can't afford this option right now"}
                className={`w-full rounded-lg border px-4 py-2.5 text-left transition-colors ${
                  affordable
                    ? 'border-panelborder bg-base hover:border-cyan-glow hover:bg-slate-800/70'
                    : 'cursor-not-allowed border-panelborder/50 bg-base/50 opacity-50'
                }`}
              >
                <span className="text-sm font-medium text-slate-100">{choice.text}</span>
                {!affordable && (
                  <span className="ml-2 text-[10px] font-medium text-rose-300">Can&apos;t afford it</span>
                )}
                <EffectPreview effects={choice.effects} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
