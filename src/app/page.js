'use client';

import { useCallback, useEffect, useReducer, useState } from 'react';

import TopBar from '../components/TopBar';
import UpgradePanel from '../components/UpgradePanel';
import ManagerPanel from '../components/ManagerPanel';
import StatsPanel from '../components/StatsPanel';
import EventLog from '../components/EventLog';
import EventModal from '../components/EventModal';
import Toast from '../components/Toast';
import GameOverScreen from '../components/GameOverScreen';
import StartScreen from '../components/StartScreen';
import AchievementsPanel from '../components/AchievementsPanel';
import SettingsModal from '../components/SettingsModal';

import { UPGRADES } from '../data/upgrades';
import { MANAGERS } from '../data/managers';
import { useGameLoop, advanceGameState, DIFFICULTY_SETTINGS } from '../hooks/useGameLoop';
import { useEventEngine, applyChoiceEffects, RECENT_EVENT_HISTORY_SIZE } from '../hooks/useEventEngine';
import {
  usePersistence,
  loadSavedState,
  saveStateToStorage,
  clearSavedState,
  hasSavedState,
} from '../hooks/usePersistence';
import { sfx, setMuted, isMuted } from '../utils/audio';
import { formatCurrency } from '../utils/math';

function createInitialState(options = {}) {
  const {
    difficulty = 'normal',
    prestigeMultiplier = 0,
    prestigeMeta = {},
    stats = {},
    achievementsUnlocked = {},
  } = options;

  const difficultySettings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.normal;

  return {
    hasStarted: false,
    difficulty,
    company: {
      cash: Math.round(5000 * difficultySettings.startingCashMultiplier),
      mrr: 0,
      users: 0,
      valuation: 0,
      quality: 50,
      morale: 60,
      stage: 'garage',
    },
    personal: {
      health: 80,
      happiness: 70,
      relationships: 60,
      reputation: 10,
      age: 24,
    },
    upgrades: {},
    managers: {},
    prestige: {
      runs: prestigeMeta.runs || 0,
      multiplier: prestigeMultiplier,
      totalValuationEver: prestigeMeta.totalValuationEver || 0,
    },
    // Lifetime stats persist across resets/prestige — they drive achievements.
    stats: {
      totalEventsResolved: stats.totalEventsResolved || 0,
      totalUpgradesBought: stats.totalUpgradesBought || 0,
      totalManagersHired: stats.totalManagersHired || 0,
      endingsReached: stats.endingsReached || [],
      bestValuationEver: stats.bestValuationEver || 0,
    },
    achievementsUnlocked: { ...achievementsUnlocked },
    negativeCashSeconds: 0,
    eventLog: [],
    currentEvent: null,
    recentEventIds: [],
    toasts: [],
    pendingSounds: [],
    milestonesHit: {},
    isGameOver: false,
    isPaused: false,
    endingId: null,
    pendingBuyoutAccepted: false,
    playSeconds: 0,
  };
}

function soundForEventType(type) {
  if (type === 'crisis' || type === 'health' || type === 'legal') return 'crisisBuzzer';
  return 'eventSpawn';
}

function soundForChoice(effects) {
  if (!effects) return 'choicePositive';
  if (effects.buyoutOffer) return 'prestigeChime';
  const score =
    (effects.happiness || 0) +
    (effects.health || 0) +
    (effects.relationships || 0) +
    (effects.morale || 0) +
    (effects.quality || 0) +
    (effects.reputation || 0) +
    Math.sign(effects.cash || 0) * 3 +
    Math.sign(effects.mrr || 0) * 3 +
    Math.sign(effects.users || 0) * 2;
  return score >= 0 ? 'choicePositive' : 'choiceNegative';
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE': {
      return { ...createInitialState(), ...action.payload, hasStarted: true };
    }

    case 'BEGIN_NEW_RUN': {
      return createInitialState(action.payload || {});
    }

    case 'START': {
      return { ...state, hasStarted: true };
    }

    case 'TICK': {
      return advanceGameState(state, action.payload.deltaSeconds);
    }

    case 'BUY_UPGRADE': {
      const { upgradeId, cost } = action.payload;
      if (state.company.cash < cost) return state;

      const def = UPGRADES.find((u) => u.id === upgradeId);
      if (!def) return state;

      const company = { ...state.company, cash: state.company.cash - cost };
      if (def.effects.mrrFlat) company.mrr += def.effects.mrrFlat;
      if (def.effects.usersFlat) company.users += def.effects.usersFlat;
      if (def.effects.quality) company.quality = Math.min(100, company.quality + def.effects.quality);
      if (def.effects.morale) company.morale = Math.min(100, company.morale + def.effects.morale);

      const personal = { ...state.personal };
      if (def.effects.reputation) {
        personal.reputation = Math.min(100, personal.reputation + def.effects.reputation);
      }

      return {
        ...state,
        company,
        personal,
        upgrades: { ...state.upgrades, [upgradeId]: (state.upgrades[upgradeId] || 0) + 1 },
        stats: { ...state.stats, totalUpgradesBought: state.stats.totalUpgradesBought + 1 },
        pendingSounds: [...state.pendingSounds, 'cashRegister'],
      };
    }

    case 'HIRE_MANAGER': {
      const { managerId, cost } = action.payload;
      if (state.company.cash < cost || state.managers[managerId]) return state;

      const def = MANAGERS.find((m) => m.id === managerId);
      if (!def) return state;

      const company = { ...state.company, cash: state.company.cash - cost };
      if (def.effects.moraleFlat) {
        company.morale = Math.min(100, company.morale + def.effects.moraleFlat);
      }

      return {
        ...state,
        company,
        managers: { ...state.managers, [managerId]: true },
        stats: { ...state.stats, totalManagersHired: state.stats.totalManagersHired + 1 },
        pendingSounds: [...state.pendingSounds, 'hire'],
      };
    }

    case 'SPAWN_EVENT': {
      const { event } = action.payload;
      const recentEventIds = [event.id, ...state.recentEventIds].slice(0, RECENT_EVENT_HISTORY_SIZE);
      return {
        ...state,
        currentEvent: event,
        recentEventIds,
        pendingSounds: [...state.pendingSounds, soundForEventType(event.type)],
      };
    }

    case 'RESOLVE_EVENT': {
      const { choiceIndex } = action.payload;
      const event = state.currentEvent;
      if (!event) return state;
      const choice = event.choices[choiceIndex];
      if (!choice) return state;

      const withEffects = applyChoiceEffects(state, choice.effects);

      const logEntry = {
        id: `${event.id}-${Date.now()}`,
        title: event.title,
        outcome: choice.outcome,
        type: event.type,
      };

      return {
        ...withEffects,
        currentEvent: null,
        eventLog: [...state.eventLog, logEntry].slice(-40),
        stats: { ...withEffects.stats, totalEventsResolved: withEffects.stats.totalEventsResolved + 1 },
        pendingSounds: [...withEffects.pendingSounds, soundForChoice(choice.effects)],
      };
    }

    case 'DISMISS_TOAST': {
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload.toastId) };
    }

    case 'CLEAR_SOUNDS': {
      if (state.pendingSounds.length === 0) return state;
      return { ...state, pendingSounds: [] };
    }

    case 'PRESTIGE': {
      const gain = Math.max(0, Math.log10(Math.max(state.company.valuation, 1)) - 4) * 0.15;
      const nextMultiplier = state.prestige.multiplier + gain;
      return createInitialState({
        difficulty: state.difficulty,
        prestigeMultiplier: nextMultiplier,
        prestigeMeta: {
          runs: state.prestige.runs + 1,
          totalValuationEver: state.prestige.totalValuationEver + state.company.valuation,
        },
        stats: state.stats,
        achievementsUnlocked: state.achievementsUnlocked,
      });
    }

    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState());
  const [ready, setReady] = useState(false);
  const [savedAvailable, setSavedAvailable] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [homeScreenPrestige, setHomeScreenPrestige] = useState(0);
  const [homeScreenCarry, setHomeScreenCarry] = useState({ stats: {}, achievementsUnlocked: {} });
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // On mount, check for a saved run and surface the start screen.
  useEffect(() => {
    setSavedAvailable(hasSavedState());
    const saved = loadSavedState();
    if (saved?.prestige?.multiplier) {
      setHomeScreenPrestige(saved.prestige.multiplier);
    }
    if (saved) {
      setHomeScreenCarry({
        stats: saved.stats || {},
        achievementsUnlocked: saved.achievementsUnlocked || {},
      });
    }
    setMutedState(isMuted());
    setReady(true);
  }, []);

  useGameLoop(state, dispatch);
  useEventEngine(state, dispatch);
  usePersistence(state, state.hasStarted);

  // Flush any queued sound effects after each render.
  useEffect(() => {
    if (state.pendingSounds.length === 0) return;
    state.pendingSounds.forEach((name) => {
      if (typeof sfx[name] === 'function') sfx[name]();
    });
    dispatch({ type: 'CLEAR_SOUNDS' });
  }, [state.pendingSounds]);

  const handleToggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  const handleStartNew = useCallback(
    (difficulty) => {
      clearSavedState();
      dispatch({
        type: 'BEGIN_NEW_RUN',
        payload: {
          difficulty,
          prestigeMultiplier: homeScreenPrestige,
          stats: homeScreenCarry.stats,
          achievementsUnlocked: homeScreenCarry.achievementsUnlocked,
        },
      });
      dispatch({ type: 'START' });
    },
    [homeScreenPrestige, homeScreenCarry]
  );

  const handleContinue = useCallback(() => {
    const saved = loadSavedState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    } else {
      dispatch({ type: 'START' });
    }
  }, []);

  const handleBuyUpgrade = useCallback((upgradeId, cost) => {
    dispatch({ type: 'BUY_UPGRADE', payload: { upgradeId, cost } });
  }, []);

  const handleHireManager = useCallback((managerId, cost) => {
    dispatch({ type: 'HIRE_MANAGER', payload: { managerId, cost } });
  }, []);

  const handleChooseEvent = useCallback((choiceIndex) => {
    dispatch({ type: 'RESOLVE_EVENT', payload: { choiceIndex } });
  }, []);

  const handleDismissToast = useCallback((toastId) => {
    dispatch({ type: 'DISMISS_TOAST', payload: { toastId } });
  }, []);

  const handleNewRunAfterGameOver = useCallback(() => {
    clearSavedState();
    dispatch({
      type: 'BEGIN_NEW_RUN',
      payload: {
        difficulty: state.difficulty,
        prestigeMultiplier: state.prestige.multiplier,
        prestigeMeta: state.prestige,
        stats: state.stats,
        achievementsUnlocked: state.achievementsUnlocked,
      },
    });
    dispatch({ type: 'START' });
  }, [state]);

  const handlePrestige = useCallback(() => {
    saveStateToStorage(state);
    dispatch({ type: 'PRESTIGE' });
    dispatch({ type: 'START' });
  }, [state]);

  const handleOpenAchievements = useCallback(() => setShowAchievements(true), []);
  const handleCloseAchievements = useCallback(() => setShowAchievements(false), []);
  const handleOpenSettings = useCallback(() => setShowSettings(true), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);

  const handleResetSave = useCallback(() => {
    clearSavedState();
    setShowSettings(false);
    dispatch({ type: 'BEGIN_NEW_RUN', payload: {} });
    setHomeScreenPrestige(0);
    setHomeScreenCarry({ stats: {}, achievementsUnlocked: {} });
  }, []);

  if (!ready) {
    return <div className="flex h-screen items-center justify-center bg-base text-slate-500">Loading…</div>;
  }

  if (!state.hasStarted) {
    return (
      <StartScreen
        hasSave={savedAvailable}
        prestigeMultiplier={homeScreenPrestige}
        onStartNew={handleStartNew}
        onContinue={handleContinue}
      />
    );
  }

  const cashPerSecond =
    state.company.mrr * (1 + (state.prestige.multiplier || 0)) * 0.15 *
    (state.personal.health < 30 || state.personal.happiness < 30 ? 0.5 : 1);

  return (
    <div className="min-h-screen">
      <TopBar
        company={state.company}
        personal={state.personal}
        muted={muted}
        onToggleMute={handleToggleMute}
        onOpenAchievements={handleOpenAchievements}
        onOpenSettings={handleOpenSettings}
      />

      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <div className="grid grid-rows-2 gap-4 lg:h-[calc(100vh-90px)]">
          <UpgradePanel
            stageId={state.company.stage}
            cash={state.company.cash}
            ownedUpgrades={state.upgrades}
            onBuy={handleBuyUpgrade}
          />
          <ManagerPanel
            stageId={state.company.stage}
            cash={state.company.cash}
            hiredManagers={state.managers}
            onHire={handleHireManager}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="card flex min-h-[220px] flex-1 flex-col items-center justify-center p-6 text-center">
            {state.currentEvent ? (
              <p className="text-sm text-slate-500">An event is unfolding…</p>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Business as Usual
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  Quiet for now. Keep an eye out — the next twist in your founder story could hit any
                  moment.
                </p>
              </>
            )}
          </div>

          <div className="card flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Idle Income</p>
              <p className="text-lg font-semibold text-lime-glow">
                {formatCurrency(cashPerSecond)}
                <span className="text-xs text-slate-500"> / sec</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Prestige Bonus</p>
              <p className="text-lg font-semibold text-fuchsia-300">
                +{Math.round((state.prestige.multiplier || 0) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4 lg:h-[calc(100vh-90px)]">
          <EventLog entries={state.eventLog} />
          <StatsPanel personal={state.personal} company={state.company} />
        </div>
      </main>

      <EventModal event={state.currentEvent} onChoose={handleChooseEvent} />
      <Toast toasts={state.toasts} onDismiss={handleDismissToast} />

      {state.isGameOver && (
        <GameOverScreen
          endingId={state.endingId}
          company={state.company}
          personal={state.personal}
          prestige={state.prestige}
          onNewRun={handleNewRunAfterGameOver}
          onPrestige={handlePrestige}
        />
      )}

      {showAchievements && (
        <AchievementsPanel unlocked={state.achievementsUnlocked} onClose={handleCloseAchievements} />
      )}

      {showSettings && (
        <SettingsModal
          muted={muted}
          difficulty={state.difficulty}
          onToggleMute={handleToggleMute}
          onResetSave={handleResetSave}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
}
