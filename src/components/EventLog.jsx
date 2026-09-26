'use client';

const TYPE_DOTS = {
  crisis: 'bg-rose-400',
  investor: 'bg-lime-glow',
  employee: 'bg-cyan-glow',
  personal: 'bg-fuchsia-400',
  health: 'bg-rose-400',
  viral: 'bg-cyan-glow',
  legal: 'bg-amber-400',
  competitor: 'bg-orange-400',
  relationship: 'bg-fuchsia-400',
  opportunity: 'bg-lime-glow',
};

export default function EventLog({ entries }) {
  return (
    <div className="card flex h-full flex-col p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Event Log
      </h3>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {entries.length === 0 && (
          <p className="text-xs text-slate-500">Nothing has happened yet. It will.</p>
        )}
        {entries
          .slice()
          .reverse()
          .map((entry) => (
            <div key={entry.id} className="rounded-lg border border-panelborder bg-base px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_DOTS[entry.type] || 'bg-slate-500'}`} />
                <span className="text-xs font-medium text-slate-200">{entry.title}</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{entry.outcome}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
