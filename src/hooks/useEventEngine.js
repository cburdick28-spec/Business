'use client';

import { useEffect, useRef } from 'react';
import { EVENTS } from '../data/events';
import { clamp, pickWeighted, randomInt } from '../utils/math';

const EVENT_MIN_DELAY_MS = 8000;
const EVENT_MAX_DELAY_MS = 15000;
const RECENT_HISTORY_SIZE = 6;

// A requirement object may specify any of these thresholds; every present
// key must pass for the event to be eligible.
function meetsRequirements(state, requirements) {
  if (!requirements) return true;
  const { company, personal } = state;

  const checks = [
    requirements.minHealth === undefined || personal.health >= requirements.minHealth,
    requirements.maxHealth === undefined || personal.health <= requirements.maxHealth,
    requirements.minHappiness === undefined || personal.happiness >= requirements.minHappiness,
    requirements.maxHappiness === undefined || personal.happiness <= requirements.maxHappiness,
    requirements.minRelationships === undefined || personal.relationships >= requirements.minRelationships,
    requirements.maxRelationships === undefined || personal.relationships <= requirements.maxRelationships,
    requirements.minAge === undefined || personal.age >= requirements.minAge,
    requirements.maxAge === undefined || personal.age <= requirements.maxAge,
    requirements.minCash === undefined || company.cash >= requirements.minCash,
    requirements.minValuation === undefined || company.valuation >= requirements.minValuation,
    requirements.minUsers === undefined || company.users >= requirements.minUsers,
    requirements.minMorale === undefined || company.morale >= requirements.minMorale,
    requirements.maxMorale === undefined || company.morale <= requirements.maxMorale,
    requirements.minQuality === undefined || company.quality >= requirements.minQuality,
  ];

  return checks.every(Boolean);
}

export function getEligibleEvents(state) {
  return EVENTS.filter((event) => {
    if (!event.stages.includes(state.company.stage)) return false;
    if (state.recentEventIds.includes(event.id)) return false;
    return meetsRequirements(state, event.requirements);
  });
}

export function pickNextEvent(state) {
  const eligible = getEligibleEvents(state);
  if (eligible.length === 0) {
    // Fall back to ignoring recent-history exclusion rather than showing
    // nothing — better a repeat than a silent, event-less run.
    const anyEligible = EVENTS.filter(
      (event) => event.stages.includes(state.company.stage) && meetsRequirements(state, event.requirements)
    );
    if (anyEligible.length === 0) return null;
    return pickWeighted(anyEligible);
  }
  return pickWeighted(eligible);
}

// Applies a choice's effects object to state, clamping every stat into its
// valid range and handling the special `buyoutOffer` flag.
export function applyChoiceEffects(state, effects) {
  if (!effects) return state;

  if (effects.buyoutOffer) {
    return { ...state, pendingBuyoutAccepted: true };
  }

  const company = { ...state.company };
  const personal = { ...state.personal };

  if (effects.cash) company.cash += effects.cash;
  if (effects.mrr) company.mrr = Math.max(0, company.mrr + effects.mrr);
  if (effects.users) company.users = Math.max(0, company.users + effects.users);
  if (effects.quality) company.quality = clamp(company.quality + effects.quality, 0, 100);
  if (effects.morale) company.morale = clamp(company.morale + effects.morale, 0, 100);

  if (effects.health) personal.health = clamp(personal.health + effects.health, 0, 100);
  if (effects.happiness) personal.happiness = clamp(personal.happiness + effects.happiness, 0, 100);
  if (effects.relationships) personal.relationships = clamp(personal.relationships + effects.relationships, 0, 100);
  if (effects.reputation) personal.reputation = clamp(personal.reputation + effects.reputation, 0, 100);
  if (effects.age) personal.age += effects.age;

  return { ...state, company, personal };
}

// Schedules randomized event spawns (every 8-15s) as long as the game is
// running and no modal is currently open. Uses refs so the recursive
// setTimeout chain always sees the freshest state without re-subscribing.
export function useEventEngine(state, dispatch) {
  const stateRef = useRef(state);
  const timeoutRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    function scheduleNext() {
      const delay = randomInt(EVENT_MIN_DELAY_MS, EVENT_MAX_DELAY_MS);
      timeoutRef.current = setTimeout(() => {
        const current = stateRef.current;
        if (current.hasStarted && !current.isGameOver && !current.isPaused && !current.currentEvent) {
          const event = pickNextEvent(current);
          if (event) {
            dispatch({ type: 'SPAWN_EVENT', payload: { event } });
          }
        }
        scheduleNext();
      }, delay);
    }

    scheduleNext();
    return () => clearTimeout(timeoutRef.current);
  }, [dispatch]);
}

export const RECENT_EVENT_HISTORY_SIZE = RECENT_HISTORY_SIZE;
