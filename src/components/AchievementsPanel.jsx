'use client';

import { ACHIEVEMENTS } from '../data/achievements';

export default function AchievementsPanel({ unlocked, onClose }) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-modalIn card glow-lime w-full max-w-lg border-2 border-lime-glow/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-lime-glow">
              Achievements
            </span>
            <h2 className="mt-1 text-lg font-bold text-slate-50">
              {unlockedCount} / {ACHIEVEMENTS.length} unlocked
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-panelborder bg-base px-3 py-1 text-xs text-slate-300 hover:border-cyan-glow hover:text-cyan-300"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {ACHIEVEMENTS.map((achievement) => {
            const done = Boolean(unlocked[achievement.id]);
            return (
              <div
                key={achievement.id}
                className={`rounded-lg border px-3 py-2 transition-colors ${
                  done
                    ? 'border-lime-glow/40 bg-lime-glow/5'
                    : 'border-panelborder/60 bg-base/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-medium ${done ? 'text-lime-glow' : 'text-slate-400'}`}>
                    {done ? '\u{1F3C6}' : '\u{1F512}'} {achievement.title}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
