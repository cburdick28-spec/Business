// Business types let a run be "about" something other than generic SaaS.
// Each one tunes the underlying economics — how fast MRR grows from users,
// how valuation is derived from that MRR, how much starting capital you get,
// and how quickly personal/company stats decay under the strain of running
// that kind of company. `difficultyRating` is purely descriptive (shown on
// the Start Screen); the multipliers are what actually make it easier or
// harder to reach a strong ending.
//
// Fields:
//   id, name, icon, tagline, difficultyRating ('Easy' | 'Medium' | 'Hard')
//   description               a sentence of flavor shown on selection
//   startingCashMultiplier    applied on top of the difficulty mode's own
//   mrrGrowthMultiplier       scales how fast MRR grows from your user base
//   valuationMultiplier       scales the final valuation formula
//   decayMultiplier           scales personal + company stat decay speed

export const BUSINESS_TYPES = [
  {
    id: 'saas',
    name: 'SaaS Startup',
    icon: '\u{1F4BB}',
    tagline: 'Software subscriptions. The classic path.',
    difficultyRating: 'Medium',
    description:
      'Recurring revenue, predictable growth, a crowded market. The default founder journey — balanced in every direction.',
    startingCashMultiplier: 1,
    mrrGrowthMultiplier: 1,
    valuationMultiplier: 1,
    decayMultiplier: 1,
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Studio',
    icon: '\u{1F4F1}',
    tagline: 'Fast to build, fast to churn.',
    difficultyRating: 'Easy',
    description:
      'Cheap to start and quick to find an audience, but the ceiling is lower — app store economics only stretch so far.',
    startingCashMultiplier: 1.2,
    mrrGrowthMultiplier: 1.3,
    valuationMultiplier: 0.7,
    decayMultiplier: 1.05,
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Brand',
    icon: '\u{1F6CD}️',
    tagline: 'Physical goods, real margins, real headaches.',
    difficultyRating: 'Easy',
    description:
      'Inventory and shipping keep things grounded and cash-flow-friendly, though the multiples investors pay never get as generous as software.',
    startingCashMultiplier: 0.9,
    mrrGrowthMultiplier: 1.15,
    valuationMultiplier: 0.75,
    decayMultiplier: 0.9,
  },
  {
    id: 'creator-platform',
    name: 'Creator Platform',
    icon: '\u{1F3A5}',
    tagline: 'Build the tools creators use to reach their audience.',
    difficultyRating: 'Medium',
    description:
      "Growth can be explosive when a creator blows up on your platform — and just as painful when the algorithm turns against you.",
    startingCashMultiplier: 1,
    mrrGrowthMultiplier: 1.1,
    valuationMultiplier: 1.05,
    decayMultiplier: 1.1,
  },
  {
    id: 'fintech',
    name: 'Fintech',
    icon: '\u{1F3E6}',
    tagline: 'Huge upside, heavy regulation.',
    difficultyRating: 'Hard',
    description:
      'Move real money and the rewards scale accordingly — so does the legal and compliance weight bearing down on you.',
    startingCashMultiplier: 0.7,
    mrrGrowthMultiplier: 0.85,
    valuationMultiplier: 1.4,
    decayMultiplier: 1.2,
  },
  {
    id: 'biotech',
    name: 'Biotech',
    icon: '\u{1F9EC}',
    tagline: 'Slow, expensive, world-changing if it works.',
    difficultyRating: 'Hard',
    description:
      'Longer roads to revenue and brutal burn rates, but a breakthrough here is worth more than almost anything else on the table.',
    startingCashMultiplier: 0.5,
    mrrGrowthMultiplier: 0.6,
    valuationMultiplier: 1.8,
    decayMultiplier: 1.3,
  },
];

export function getBusinessType(id) {
  return BUSINESS_TYPES.find((b) => b.id === id) || BUSINESS_TYPES[0];
}
