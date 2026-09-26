// Managers are one-time hires that automate a part of the business,
// granting a passive, permanent bonus once hired. Unlike upgrades they are
// not repeatable — each manager can only be hired once per run.
//
// Fields:
//   id, name, title, description
//   cost           one-time cash cost
//   stages         stages in which this manager becomes available to hire
//   effects        passive bonuses applied every tick while hired:
//                  mrrMultiplier (e.g. 0.05 = +5% MRR), userGrowthPerSec,
//                  qualityDecayReduction, moraleFlat (one-time on hire),
//                  autoHealthRegen (personal health per second)

export const MANAGERS = [
  {
    id: 'ops-manager',
    name: 'Jordan Lee',
    title: 'Operations Manager',
    description:
      'Keeps the day-to-day running so small fires stop landing on your desk.',
    cost: 5000,
    stages: ['garage', 'startup'],
    effects: { mrrMultiplier: 0.04, moraleFlat: 5 },
  },
  {
    id: 'sales-manager',
    name: 'Priya Nair',
    title: 'Head of Sales',
    description: 'Builds a real pipeline instead of relying on inbound luck.',
    cost: 15000,
    stages: ['startup', 'scaleup'],
    effects: { mrrMultiplier: 0.08, userGrowthPerSec: 0.2 },
  },
  {
    id: 'marketing-manager',
    name: 'Marcus Chen',
    title: 'VP of Marketing',
    description: 'Turns your ad spend into a repeatable acquisition engine.',
    cost: 25000,
    stages: ['startup', 'scaleup'],
    effects: { userGrowthPerSec: 0.6, mrrMultiplier: 0.03 },
  },
  {
    id: 'engineering-manager',
    name: 'Sofia Reyes',
    title: 'VP of Engineering',
    description: 'Ships faster with fewer fires. Quality stops decaying so quickly.',
    cost: 40000,
    stages: ['startup', 'scaleup'],
    effects: { qualityDecayReduction: 0.5, moraleFlat: 8 },
  },
  {
    id: 'hr-manager',
    name: 'David Okafor',
    title: 'Head of People',
    description: 'Culture, hiring, and retention finally have a real owner.',
    cost: 60000,
    stages: ['scaleup'],
    effects: { moraleFlat: 15, mrrMultiplier: 0.02 },
  },
  {
    id: 'cfo',
    name: 'Elena Vasquez',
    title: 'Chief Financial Officer',
    description:
      'Tightens the books and finds efficiency you did not know was there.',
    cost: 120000,
    stages: ['scaleup', 'unicorn'],
    effects: { mrrMultiplier: 0.1 },
  },
  {
    id: 'coo',
    name: 'Tariq Hassan',
    title: 'Chief Operating Officer',
    description: 'Runs the machine well enough that you can finally step back.',
    cost: 400000,
    stages: ['unicorn'],
    effects: { mrrMultiplier: 0.12, autoHealthRegen: 0.05, moraleFlat: 10 },
  },
  {
    id: 'general-counsel',
    name: 'Naomi Fischer',
    title: 'General Counsel',
    description: 'Legal risk stops being a surprise and starts being managed.',
    cost: 350000,
    stages: ['unicorn', 'ipo'],
    effects: { mrrMultiplier: 0.03, moraleFlat: 5 },
  },
  {
    id: 'chief-of-staff',
    name: 'Alex Kim',
    title: 'Chief of Staff',
    description:
      'Filters the noise, protects your calendar, and quietly keeps you sane.',
    cost: 250000,
    stages: ['unicorn', 'ipo'],
    effects: { autoHealthRegen: 0.15, moraleFlat: 6 },
  },
  {
    id: 'international-gm',
    name: 'Yuki Tanaka',
    title: 'GM, International',
    description: 'Opens new markets without you having to be on every call.',
    cost: 900000,
    stages: ['ipo'],
    effects: { userGrowthPerSec: 3, mrrMultiplier: 0.15 },
  },

  // --- Expansion pack ---
  {
    id: 'customer-success-lead',
    name: 'Amara Osei',
    title: 'Head of Customer Success',
    description: 'Keeps churn down by catching unhappy customers before they leave.',
    cost: 30000,
    stages: ['startup', 'scaleup'],
    effects: { mrrMultiplier: 0.05, userGrowthPerSec: 0.3 },
  },
  {
    id: 'data-science-lead',
    name: 'Ravi Malhotra',
    title: 'Head of Data Science',
    description: 'Turns raw usage data into product decisions that actually land.',
    cost: 90000,
    stages: ['scaleup', 'unicorn'],
    effects: { qualityDecayReduction: 0.3, mrrMultiplier: 0.04 },
  },
  {
    id: 'executive-assistant',
    name: 'Lena Brandt',
    title: 'Executive Assistant',
    description: 'Keeps your calendar sane and your inbox from swallowing you whole.',
    cost: 45000,
    stages: ['startup', 'scaleup', 'unicorn'],
    effects: { autoHealthRegen: 0.08, moraleFlat: 3 },
  },
  {
    id: 'communications-director',
    name: 'Isabelle Moreau',
    title: 'Director of Communications',
    description: 'Manages the narrative so a bad news day stays a bad news day, not a crisis.',
    cost: 500000,
    stages: ['unicorn', 'ipo'],
    effects: { mrrMultiplier: 0.05, moraleFlat: 4 },
  },
];

export function getAvailableManagers(stageId) {
  return MANAGERS.filter((m) => m.stages.includes(stageId));
}
