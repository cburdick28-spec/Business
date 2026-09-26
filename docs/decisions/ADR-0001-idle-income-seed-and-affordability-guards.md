# ADR-0001: Seed starting income and enforce affordability on event choices

## Context

Users reported: "you are guaranteed to go into debt in every run i always
get it." Investigation (see commit `fc445cc`) found two compounding
structural defects, not a rare bad-luck edge case:

1. `createInitialState()` set `company.mrr: 0` and `company.users: 0`.
   Both passive-income formulas in `advanceGameState`
   (`src/hooks/useGameLoop.js`) — `mrrGrowth` and `organicUserGrowth` — are
   strict multiples of `state.company.users`. Starting at exactly zero
   users is a true mathematical trap state: passive cashflow is frozen at
   zero until the player manually buys an upgrade, with no in-game signal
   telling them this is required before the clock (and events) start.
2. `company.cash` is never floored — a single event choice
   (`effects.cash`) can drive it arbitrarily negative. The `pet-emergency`
   event (spawns from the `garage` stage onward, weight 7 — fairly
   common) had only two choices, both cash-cost, with no free
   alternative and no relationship to what the player actually had on
   hand. Combined with the zero-income start, and further compounded by
   Hard difficulty + low-cash business types (Biotech/Fintech) shrinking
   starting cash to as little as $1,500, this made early bankruptcy
   close to inevitable rather than an occasional risk.

## Decision

- Seed a small non-zero `mrr`/`users` at run start (scaled by the same
  difficulty/business-type multipliers as starting cash), so passive
  income accrues from tick one instead of depending on the player already
  knowing to buy an upgrade in the first few seconds.
- Introduce a `requirements.minCash` field at the **choice** level (not
  just the existing event-level `requirements`), enforced in two places:
  `EventModal` disables the button and shows "Can't afford it" when the
  player's cash is below the threshold, and the `RESOLVE_EVENT` reducer
  independently rejects the dispatch if the player can't afford it (so
  the affordability rule can't be bypassed by racing the UI).
- Added a genuine free (no-cash) third choice to `pet-emergency` so it
  never has to be the sole cause of going negative.

## Consequences

- Every run now has a real, always-growing income floor from the start,
  even with zero player input — verified with a standalone numeric
  replay of the tick formulas (idle 300s, no purchases: normal/SaaS cash
  $5,000 → $6,254; Hard/Biotech $1,500 → $1,910) and a live Playwright
  smoke test (idle 20s in-browser: $5.00K → $5.05K, no console errors).
- Any other event/choice that should be gated by affordability can reuse
  `requirements.minCash` at the choice level going forward — this is now
  a supported pattern, not just an event-level one.
- Games can still end in `BANKRUPTCY` (the 60-second negative-cash timer
  in `src/utils/endings.js` is unchanged) — but only from choices the
  player could actually afford at the time, or from sustained poor play,
  not from a structural trap present in every single run.

## Lesson for future debugging in this codebase

When a player reports something as "guaranteed" or "always happens,"
don't reach for probabilistic/RNG explanations first — check whether a
core formula has a zero/degenerate starting value that makes an entire
subsystem produce a constant (usually zero) output until the player
takes an unprompted, non-obvious action. In this codebase specifically,
`advanceGameState` in `src/hooks/useGameLoop.js` is the single source of
truth for passive-income math — always check what value each formula's
input variables (`company.users`, `company.mrr`, etc.) hold in
`createInitialState()` (`src/app/page.js`) before assuming the bug is in
the RNG-driven event system. A cheap way to confirm/rule this out fast:
replay the tick formulas standalone in Node with the real starting
constants (no browser needed) before reaching for Playwright.
