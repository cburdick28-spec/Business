'use client';

import { useEffect, useRef } from 'react';
import { MANAGERS } from '../data/managers';
import { checkEndingConditions } from '../utils/endings';
import { clamp, computeValuation, getStageForValuation } from '../utils/math';

// Tuning constants for the idle-income and decay layers. These are
// deliberately game-y rather than economically realistic — the goal is a
// satisfying feel, not a spreadsheet model.
const TICK_MS = 250;
const CASH_PER_MRR_PER_SEC = 0.15;
const MRR_GROWTH_PER_USER_PER_SEC = 0.0035;
const ORGANIC_USER_GROWTH_RATE = 0.0009;
const QUALITY_DECAY_PER_SEC = 0.03;
const MORALE_DRIFT_PER_SEC = 0.015;
const MORALE_EQUILIBRIUM = 50;
const HEALTH_DECAY_PER_SEC = 0.03;
const HAPPINESS_DECAY_PER_SEC = 0.022;
const AGE_SECONDS_PER_YEAR = 45;
const LOW_STAT_THRESHOLD = 30;
const LOW_STAT_PENALTY = 0.5;

const MILESTONES = [
  { id: 'users-100', check: (s) => s.company.users >= 100, message: 'Milestone: your first 100 users!' },
  { id: 'users-1000', check: (s) => s.company.users >= 1000, message: 'Milestone: 1,000 users strong!' },
  { id: 'users-100000', check: (s) => s.company.users >= 100000, message: 'Milestone: 100,000 users!' },
  { id: 'mrr-1000', check: (s) => s.company.mrr >= 1000, message: 'Milestone: your first $1K MRR!' },
  { id: 'mrr-100000', check: (s) => s.company.mrr >= 100000, message: 'Milestone: $100K MRR!' },
  { id: 'valuation-1m', check: (s) => s.company.valuation >= 1000000, message: 'Milestone: $1M valuation!' },
  { id: 'valuation-100m', check: (s) => s.company.valuation >= 100000000, message: 'Milestone: $100M valuation!' },
  { id: 'valuation-1b', check: (s) => s.company.valuation >= 1000000000, message: 'Milestone: unicorn status — $1B valuation!' },
];

function sumManagerEffect(managerIds, key) {
  return managerIds.reduce((total, id) => {
    const manager = MANAGERS.find((m) => m.id === id);
    return total + (manager?.effects?.[key] || 0);
  }, 0);
}

// Advances all continuous, time-based systems: idle income, organic
// growth, stat decay, aging, stage transitions, milestones, and ending
// checks. Returns a brand-new state object (pure function of state + dt).
export function advanceGameState(state, deltaSeconds) {
  if (!state.hasStarted || state.isGameOver || state.isPaused) return state;

  const prestigeBonus = state.prestige?.multiplier || 0;
  const hiredManagerIds = Object.keys(state.managers).filter((id) => state.managers[id]);
  const mrrMultiplier = sumManagerEffect(hiredManagerIds, 'mrrMultiplier');
  const userGrowthPerSec = sumManagerEffect(hiredManagerIds, 'userGrowthPerSec');
  const qualityDecayReduction = clamp(sumManagerEffect(hiredManagerIds, 'qualityDecayReduction'), 0, 1);
  const autoHealthRegen = sumManagerEffect(hiredManagerIds, 'autoHealthRegen');

  const isStruggling = state.personal.health < LOW_STAT_THRESHOLD || state.personal.happiness < LOW_STAT_THRESHOLD;
  const growthPenalty = isStruggling ? LOW_STAT_PENALTY : 1;

  // --- Company economics ---
  const qualityFactor = 0.4 + state.company.quality / 100;
  const mrrGrowth =
    state.company.users *
    MRR_GROWTH_PER_USER_PER_SEC *
    qualityFactor *
    deltaSeconds *
    growthPenalty *
    (1 + prestigeBonus);
  const nextMrrBase = Math.max(0, state.company.mrr + mrrGrowth);
  const effectiveMrr = nextMrrBase * (1 + mrrMultiplier);

  const cashGain = effectiveMrr * CASH_PER_MRR_PER_SEC * deltaSeconds * (1 + prestigeBonus);
  const nextCash = state.company.cash + cashGain;

  const organicUserGrowth =
    state.company.users *
    ORGANIC_USER_GROWTH_RATE *
    qualityFactor *
    deltaSeconds *
    growthPenalty *
    (1 + prestigeBonus);
  const managerUserGrowth = userGrowthPerSec * deltaSeconds;
  const nextUsers = Math.max(0, state.company.users + organicUserGrowth + managerUserGrowth);

  const qualityDecay = QUALITY_DECAY_PER_SEC * (1 - qualityDecayReduction) * deltaSeconds;
  const nextQuality = clamp(state.company.quality - qualityDecay, 0, 100);

  const moraleDrift =
    (MORALE_EQUILIBRIUM - state.company.morale) * MORALE_DRIFT_PER_SEC * deltaSeconds * 0.01;
  const nextMorale = clamp(state.company.morale + moraleDrift, 0, 100);

  const nextValuation = computeValuation({
    mrr: effectiveMrr,
    users: nextUsers,
    quality: nextQuality,
    morale: nextMorale,
  });

  const nextStage = getStageForValuation(nextValuation);

  // --- Personal stats ---
  const nextHealth = clamp(
    state.personal.health - HEALTH_DECAY_PER_SEC * deltaSeconds + autoHealthRegen * deltaSeconds,
    0,
    100
  );
  const nextHappiness = clamp(state.personal.happiness - HAPPINESS_DECAY_PER_SEC * deltaSeconds, 0, 100);
  const nextAge = state.personal.age + deltaSeconds / AGE_SECONDS_PER_YEAR;

  // --- Negative cash tracking (bankruptcy timer) ---
  const nextNegativeCashSeconds = nextCash < 0 ? state.negativeCashSeconds + deltaSeconds : 0;

  let nextState = {
    ...state,
    company: {
      ...state.company,
      cash: nextCash,
      mrr: nextMrrBase,
      users: nextUsers,
      quality: nextQuality,
      morale: nextMorale,
      valuation: nextValuation,
      stage: nextStage.id,
    },
    personal: {
      ...state.personal,
      health: nextHealth,
      happiness: nextHappiness,
      age: nextAge,
    },
    negativeCashSeconds: nextNegativeCashSeconds,
    playSeconds: state.playSeconds + deltaSeconds,
  };

  // --- Milestones ---
  const newToasts = [];
  const newSounds = [];
  const hitMilestones = { ...nextState.milestonesHit };
  for (const milestone of MILESTONES) {
    if (!hitMilestones[milestone.id] && milestone.check(nextState)) {
      hitMilestones[milestone.id] = true;
      newToasts.push({
        id: `${milestone.id}-${Date.now()}`,
        message: milestone.message,
        tone: 'milestone',
      });
      newSounds.push('milestoneChime');
    }
  }
  if (newToasts.length > 0) {
    nextState = {
      ...nextState,
      milestonesHit: hitMilestones,
      toasts: [...nextState.toasts, ...newToasts],
      pendingSounds: [...nextState.pendingSounds, ...newSounds],
    };
  }

  // --- Endings ---
  const endingId = checkEndingConditions(nextState);
  if (endingId) {
    nextState = {
      ...nextState,
      isGameOver: true,
      endingId,
      pendingSounds: [
        ...nextState.pendingSounds,
        endingId === 'IPO' || endingId === 'BALANCED' ? 'victoryFanfare' : 'gameOverTone',
      ],
    };
  }

  return nextState;
}

// Drives the continuous simulation on a fixed-ish interval, using real
// elapsed time so the game feels the same regardless of tab throttling.
export function useGameLoop(state, dispatch) {
  const lastTickRef = useRef(performance.now());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    lastTickRef.current = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      if (deltaSeconds <= 0) return;
      dispatch({ type: 'TICK', payload: { deltaSeconds: Math.min(deltaSeconds, 2) } });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [dispatch]);
}
