'use client';

import { getAvailableManagers } from '../data/managers';
import { formatCurrency } from '../utils/math';

export default function ManagerPanel({ stageId, cash, hiredManagers, onHire }) {
  const managers = getAvailableManagers(stageId);

  return (
    <div className="card flex h-full flex-col p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Managers
      </h3>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {managers.map((manager) => {
          const hired = Boolean(hiredManagers[manager.id]);
          const affordable = cash >= manager.cost;

          return (
            <button
              key={manager.id}
              type="button"
              disabled={hired || !affordable}
              onClick={() => onHire(manager.id, manager.cost)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                hired
                  ? 'cursor-default border-lime-glow/40 bg-lime-glow/10'
                  : affordable
                  ? 'border-panelborder bg-base hover:border-fuchsia-400 hover:bg-slate-800/60'
                  : 'cursor-not-allowed border-panelborder/50 bg-base/50 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-100">{manager.name}</p>
                  <p className="text-[11px] text-fuchsia-300">{manager.title}</p>
                </div>
                {hired && (
                  <span className="rounded-full bg-lime-glow/20 px-2 py-0.5 text-[10px] text-lime-glow">
                    Hired
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{manager.description}</p>
              {!hired && (
                <p className={`mt-1 text-xs font-semibold ${affordable ? 'text-lime-glow' : 'text-slate-500'}`}>
                  {formatCurrency(manager.cost)}
                </p>
              )}
            </button>
          );
        })}
        {managers.length === 0 && (
          <p className="text-xs text-slate-500">No managers available to hire at this stage yet.</p>
        )}
      </div>
    </div>
  );
}
