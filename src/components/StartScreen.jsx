'use client';

import { useState } from 'react';
import { DIFFICULTY_SETTINGS } from '../hooks/useGameLoop';

const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'];
const DIFFICULTY_BLURBS = {
  easy: 'Slower decay, a bigger cash cushion. Good for exploring the story.',
  normal: 'The intended experience. Balanced growth and grind.',
  hard: 'Faster decay, thinner runway. For founders who want it to hurt.',
};

export default function StartScreen({ hasSave, prestigeMultiplier, onStartNew, onContinue }) {
  const [difficulty, setDifficulty] = useState('normal');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base p-4">
      <div className="card glow-cyan w-full max-w-lg border-2 border-cyan-glow/30 p-6 sm:p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          A Startup Life Sim
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50 sm:text-4xl">
          Founder
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
          Build a company from a garage to a global empire. Two timelines run at once — Company
          and Personal — and neglecting either one will cost you.
        </p>

        {prestigeMultiplier > 0 && (
          <p className="mt-4 text-xs font-medium text-fuchsia-300">
            Prestige bonus active: +{Math.round(prestigeMultiplier * 100)}% growth from past runs.
          </p>
        )}

        <div className="mt-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Difficulty
          </p>
          <div className="flex justify-center gap-2">
            {DIFFICULTY_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setDifficulty(id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  difficulty === id
                    ? 'border-cyan-glow bg-cyan-glow/10 text-cyan-300'
                    : 'border-panelborder bg-base text-slate-400 hover:border-slate-600'
                }`}
              >
                {DIFFICULTY_SETTINGS[id].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{DIFFICULTY_BLURBS[difficulty]}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {hasSave && (
            <button
              type="button"
              onClick={onContinue}
              className="rounded-lg bg-cyan-glow/90 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Continue Run
            </button>
          )}
          <button
            type="button"
            onClick={() => onStartNew(difficulty)}
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
              hasSave
                ? 'border border-panelborder bg-base text-slate-200 hover:border-fuchsia-400 hover:text-fuchsia-300'
                : 'bg-cyan-glow/90 text-slate-950 hover:bg-cyan-300'
            }`}
          >
            {hasSave ? 'Start New Run' : 'Start Your Company'}
          </button>
        </div>

        <p className="mt-6 text-[11px] text-slate-500">
          Your progress auto-saves to this browser every 10 seconds.
        </p>
      </div>
    </div>
  );
}
