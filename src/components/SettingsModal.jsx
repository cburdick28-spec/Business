'use client';

import { DIFFICULTY_SETTINGS } from '../hooks/useGameLoop';

export default function SettingsModal({ muted, difficulty, onToggleMute, onResetSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-modalIn card glow-cyan w-full max-w-sm border-2 border-cyan-glow/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Settings
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-panelborder bg-base px-3 py-1 text-xs text-slate-300 hover:border-cyan-glow hover:text-cyan-300"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-panelborder bg-base px-3 py-2.5">
            <span className="text-sm text-slate-200">Sound</span>
            <button
              type="button"
              onClick={onToggleMute}
              className="rounded-full border border-panelborder bg-panel px-3 py-1 text-xs font-medium text-slate-200 hover:border-cyan-glow"
            >
              {muted ? 'Unmute \u{1F507}' : 'Mute \u{1F50A}'}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-panelborder bg-base px-3 py-2.5">
            <span className="text-sm text-slate-200">Difficulty</span>
            <span className="text-xs font-medium text-fuchsia-300">
              {DIFFICULTY_SETTINGS[difficulty]?.label || 'Normal'}
            </span>
          </div>
          <p className="px-1 text-[11px] text-slate-500">
            Difficulty is locked for the current run — start a new run to change it.
          </p>

          <button
            type="button"
            onClick={onResetSave}
            className="w-full rounded-lg border border-rose-500/40 bg-rose-950/20 px-3 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-950/40"
          >
            Reset Save &amp; Return to Start Screen
          </button>
        </div>
      </div>
    </div>
  );
}
