// Achievements are permanent, account-level unlocks that persist across
// resets, new runs, and prestige — unlike milestones (which are per-run
// idle-game pings), these track your history as a player across every
// attempt at building this company.
//
// `check(state)` is a pure predicate run every tick against the live
// state; once true, the achievement is unlocked forever (state.stats and
// state.prestige both survive resets, see createInitialState in page.js).

import { MANAGERS } from './managers';

export const ACHIEVEMENTS = [
  {
    id: 'first-blip',
    title: 'First Contact',
    description: 'Resolve your very first event.',
    check: (s) => s.stats.totalEventsResolved >= 1,
  },
  {
    id: 'event-veteran',
    title: 'Seen It All (Almost)',
    description: 'Resolve 50 events across your runs.',
    check: (s) => s.stats.totalEventsResolved >= 50,
  },
  {
    id: 'event-master',
    title: 'Founder Lore',
    description: 'Resolve 200 events across your runs.',
    check: (s) => s.stats.totalEventsResolved >= 200,
  },
  {
    id: 'first-upgrade',
    title: 'Bootstrapped',
    description: 'Buy your first upgrade.',
    check: (s) => s.stats.totalUpgradesBought >= 1,
  },
  {
    id: 'upgrade-collector',
    title: 'Never Enough',
    description: 'Buy 50 upgrades across your runs.',
    check: (s) => s.stats.totalUpgradesBought >= 50,
  },
  {
    id: 'upgrade-hoarder',
    title: 'Infrastructure Addict',
    description: 'Buy 200 upgrades across your runs.',
    check: (s) => s.stats.totalUpgradesBought >= 200,
  },
  {
    id: 'first-hire',
    title: 'Not a One-Person Show Anymore',
    description: 'Hire your first manager.',
    check: (s) => s.stats.totalManagersHired >= 1,
  },
  {
    id: 'full-bench',
    title: 'Full Leadership Team',
    description: 'Hire every available manager in a single run.',
    check: (s) => Object.keys(s.managers).filter((id) => s.managers[id]).length >= MANAGERS.length,
  },
  {
    id: 'unicorn-status',
    title: 'Unicorn',
    description: 'Reach a $50M valuation in a single run.',
    check: (s) => s.company.valuation >= 50000000,
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Reach a $100M valuation, ever.',
    check: (s) => s.stats.bestValuationEver >= 100000000,
  },
  {
    id: 'legendary-founder',
    title: 'Legendary Founder',
    description: 'Reach the IPO ending.',
    check: (s) => s.stats.endingsReached.includes('IPO'),
  },
  {
    id: 'burned-out-badge',
    title: 'Learned It the Hard Way',
    description: 'Reach the Burned Out ending.',
    check: (s) => s.stats.endingsReached.includes('BURNOUT'),
  },
  {
    id: 'bankrupt-badge',
    title: 'Character Building',
    description: 'Reach the Bankruptcy ending.',
    check: (s) => s.stats.endingsReached.includes('BANKRUPTCY'),
  },
  {
    id: 'dealmaker',
    title: 'Dealmaker',
    description: 'Accept a buyout and reach the Acquisition ending.',
    check: (s) => s.stats.endingsReached.includes('ACQUISITION'),
  },
  {
    id: 'lonely-at-top',
    title: 'Lonely at the Top',
    description: 'Reach the Rich but Alone ending.',
    check: (s) => s.stats.endingsReached.includes('RICH_ALONE'),
  },
  {
    id: 'work-life-balance',
    title: 'Actually Balanced',
    description: 'Reach the Balanced Founder ending.',
    check: (s) => s.stats.endingsReached.includes('BALANCED'),
  },
  {
    id: 'completionist',
    title: 'Every Ending',
    description: 'See all six endings across your runs.',
    check: (s) => s.stats.endingsReached.length >= 6,
  },
  {
    id: 'serial-founder',
    title: 'Serial Founder',
    description: 'Complete 3 runs (prestige or ending).',
    check: (s) => s.prestige.runs >= 3,
  },
  {
    id: 'thriving',
    title: 'Actually Thriving',
    description: 'Keep Health above 90 while running a company worth $1M+.',
    check: (s) => s.personal.health >= 90 && s.company.valuation >= 1000000,
  },
];

export function checkAchievements(state) {
  const unlocked = { ...state.achievementsUnlocked };
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked[achievement.id] && achievement.check(state)) {
      unlocked[achievement.id] = true;
      newlyUnlocked.push(achievement);
    }
  }

  return { unlocked, newlyUnlocked };
}
