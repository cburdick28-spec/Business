'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'founder-startup-life-save-v1';
const AUTOSAVE_INTERVAL_MS = 10000;

// Fields that should never survive a reload — anything transient/UI-only.
function stripEphemeral(state) {
  const { currentEvent, toasts, pendingSounds, ...rest } = state;
  return rest;
}

export function loadSavedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      currentEvent: null,
      toasts: [],
      pendingSounds: [],
    };
  } catch (err) {
    console.warn('Failed to load saved game:', err);
    return null;
  }
}

export function saveStateToStorage(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripEphemeral(state)));
  } catch (err) {
    console.warn('Failed to save game:', err);
  }
}

export function clearSavedState() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear saved game:', err);
  }
}

export function hasSavedState() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

// Autosaves the running game state to LocalStorage every 10 seconds. Load
// is handled explicitly by the caller (StartScreen decides whether to
// resume or start fresh), not automatically on mount.
export function usePersistence(state, enabled) {
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!enabled) return undefined;

    const interval = setInterval(() => {
      saveStateToStorage(stateRef.current);
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled]);

  // Also save on tab close / navigation so the last few seconds are not lost.
  useEffect(() => {
    if (!enabled) return undefined;

    function handleUnload() {
      saveStateToStorage(stateRef.current);
    }

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [enabled]);
}
