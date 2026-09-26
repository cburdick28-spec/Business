'use client';

function barColor(value) {
  if (value < 30) return 'bg-rose-500';
  if (value < 60) return 'bg-amber-400';
  return 'bg-lime-glow';
}

function StatBar({ label, value, icon }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-300">
          <span className="mr-1">{icon}</span>
          {label}
        </span>
        <span className="font-medium text-slate-400">{Math.round(pct)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`stat-bar-fill h-full rounded-full ${barColor(pct)} ${
            pct < 30 ? 'animate-pulseGlow' : ''
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function StatsPanel({ personal, company }) {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Personal
        </h3>
        <StatBar label="Health" value={personal.health} icon="❤️" />
        <StatBar label="Happiness" value={personal.happiness} icon="\u{1F60A}" />
        <StatBar label="Relationships" value={personal.relationships} icon="\u{1F465}" />
        <StatBar label="Reputation" value={personal.reputation} icon="⭐" />
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Company
        </h3>
        <StatBar label="Product Quality" value={company.quality} icon="\u{1F6E0}️" />
        <StatBar label="Employee Morale" value={company.morale} icon="\u{1F91D}" />
      </div>

      {(personal.health < 30 || personal.happiness < 30) && (
        <div className="card border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
          Health or happiness is critically low — company growth is cut in half until you recover.
        </div>
      )}
    </div>
  );
}
