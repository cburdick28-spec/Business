// Ending conditions are checked once per tick, in priority order. The first
// match wins. `type` drives the color treatment and audio sting on the
// Game Over screen.

export const ENDING_DEFS = {
  IPO: {
    id: 'IPO',
    title: 'Legendary Founder',
    type: 'win',
    description:
      "You rang the bell. Your company is a public, billion-dollar juggernaut, and somehow you're still standing. Founders will study your story for decades.",
  },
  BURNOUT: {
    id: 'BURNOUT',
    title: 'Burned Out',
    type: 'loss',
    description:
      'The company kept climbing, but your body finally sent the invoice. You step away — for your own sake — and someone else takes the wheel.',
  },
  BANKRUPTCY: {
    id: 'BANKRUPTCY',
    title: 'Game Over',
    type: 'loss',
    description:
      "The runway ran out. Payroll bounced, the landlord called, and the bank account never recovered. It's over — for this company, at least.",
  },
  ACQUISITION: {
    id: 'ACQUISITION',
    title: 'Rich but Done',
    type: 'neutral',
    description:
      'You took the offer. The wire cleared, the papers are signed, and the company is no longer yours to worry about. A new chapter — with a very comfortable cushion — begins.',
  },
  RICH_ALONE: {
    id: 'RICH_ALONE',
    title: 'Rich but Alone',
    type: 'bittersweet',
    description:
      'The valuation is extraordinary. The Slack notifications, the term sheets, the board seats — all of it real. But the people who used to call you back stopped a while ago.',
  },
  BALANCED: {
    id: 'BALANCED',
    title: 'Balanced Founder',
    type: 'win',
    description:
      'A real company, a real life. You built something that matters without hollowing yourself out to do it — proof that the two timelines never had to be at war.',
  },
};

// Returns an ending id (or null) given the current game state. Called every
// tick from useGameLoop.
export function checkEndingConditions(state) {
  const { company, personal, negativeCashSeconds, pendingBuyoutAccepted } = state;

  if (personal.health <= 0) {
    return 'BURNOUT';
  }

  if (negativeCashSeconds >= 60) {
    return 'BANKRUPTCY';
  }

  if (pendingBuyoutAccepted) {
    return 'ACQUISITION';
  }

  if (company.valuation >= 1_000_000_000 && personal.health > 30) {
    return 'IPO';
  }

  if (company.valuation >= 100_000_000 && personal.relationships < 20) {
    return 'RICH_ALONE';
  }

  if (
    company.valuation >= 10_000_000 &&
    personal.health > 60 &&
    personal.happiness > 60 &&
    personal.relationships > 60
  ) {
    return 'BALANCED';
  }

  return null;
}

export function getEnding(id) {
  return ENDING_DEFS[id] || null;
}
