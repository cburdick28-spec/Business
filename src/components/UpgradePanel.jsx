'use client';

import { getAvailableUpgrades } from '../data/upgrades';
import { formatCurrency, scaledCost } from '../utils/math';

const CATEGORY_LABELS = {
  servers: 'Servers',
  marketing: 'Marketing',
  product: 'Product',
  office: 'Office',
};

const CATEGORY_ICONS = {
  servers: '\u{1F5A5}️',
  marketing: '\u{1F4E3}',
  product: '\u{1F9E9}',
  office: '\u{1F3E2}',
};

export default function UpgradePanel({ stageId, cash, ownedUpgrades, onBuy }) {
  const upgrades = getAvailableUpgrades(stageId);
  const grouped = upgrades.reduce((acc, upgrade) => {
    acc[upgrade.category] = acc[upgrade.category] || [];
    acc[upgrade.category].push(upgrade);
    return acc;
  }, {});

  return (
    <div className="card flex h-full flex-col p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Upgrades
      </h3>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span>{CATEGORY_ICONS[category]}</span>
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="space-y-2">
              {items.map((upgrade) => {
                const owned = ownedUpgrades[upgrade.id] || 0;
                const cost = scaledCost(upgrade.baseCost, upgrade.growthRate, owned);
                const affordable = cash >= cost;

                return (
                  <button
                    key={upgrade.id}
                    type="button"
                    disabled={!affordable}
                    onClick={() => onBuy(upgrade.id, cost)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      affordable
                        ? 'border-panelborder bg-base hover:border-cyan-glow hover:bg-slate-800/60'
                        : 'cursor-not-allowed border-panelborder/50 bg-base/50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-100">{upgrade.name}</span>
                      {owned > 0 && (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300">
                          x{owned}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                      {upgrade.description}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        affordable ? 'text-lime-glow' : 'text-slate-500'
                      }`}
                    >
                      {formatCurrency(cost)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
