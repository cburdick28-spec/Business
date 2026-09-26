// Buyable, repeatable upgrades that drive the idle-income layer. Cost grows
// exponentially with each purchase via `scaledCost` in utils/math.js.
//
// Fields:
//   id            unique string
//   category      'servers' | 'marketing' | 'product' | 'office'
//   name          display name
//   description   short blurb shown in the panel
//   baseCost      cost of the first purchase
//   growthRate    cost multiplier per purchase (e.g. 1.15 = +15% each time)
//   stages        stages in which this upgrade is available to buy
//   effects       per-purchase stat deltas/bonuses. `mrrFlat` is added to
//                 MRR immediately per unit owned. `mrrPerUser` scales with
//                 current user count (applied by the game loop). `quality`
//                 and `morale` are one-time bumps applied per purchase.

export const UPGRADES = [
  {
    id: 'server-rack',
    category: 'servers',
    name: 'Server Rack',
    description: 'More headroom for traffic spikes. Reduces churn from downtime.',
    baseCost: 300,
    growthRate: 1.15,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { mrrFlat: 8, quality: 0.3 },
  },
  {
    id: 'cdn-upgrade',
    category: 'servers',
    name: 'Global CDN',
    description: 'Faster load times worldwide. Users notice, and they stay.',
    baseCost: 1200,
    growthRate: 1.17,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { mrrFlat: 20, quality: 0.5 },
  },
  {
    id: 'auto-scaling',
    category: 'servers',
    name: 'Auto-Scaling Infrastructure',
    description: 'Cloud infrastructure that scales itself under load.',
    baseCost: 8000,
    growthRate: 1.2,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { mrrFlat: 60, quality: 1 },
  },
  {
    id: 'private-datacenter',
    category: 'servers',
    name: 'Private Datacenter',
    description: 'Full control over your infrastructure stack at massive scale.',
    baseCost: 500000,
    growthRate: 1.25,
    stages: ['unicorn', 'ipo'],
    effects: { mrrFlat: 400, quality: 2 },
  },

  {
    id: 'social-ads',
    category: 'marketing',
    name: 'Social Media Ads',
    description: 'Basic paid acquisition. Cheap, if a little noisy.',
    baseCost: 250,
    growthRate: 1.14,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { usersFlat: 5, mrrFlat: 3 },
  },
  {
    id: 'seo-content',
    category: 'marketing',
    name: 'SEO Content Team',
    description: 'Long-term, compounding organic traffic.',
    baseCost: 1500,
    growthRate: 1.16,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { usersFlat: 15, reputation: 0.2 },
  },
  {
    id: 'influencer-partnerships',
    category: 'marketing',
    name: 'Influencer Partnerships',
    description: 'Borrowed trust from creators your audience already follows.',
    baseCost: 6000,
    growthRate: 1.18,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { usersFlat: 40, mrrFlat: 30 },
  },
  {
    id: 'brand-campaign',
    category: 'marketing',
    name: 'National Brand Campaign',
    description: 'TV, billboards, the works. Brand awareness at scale.',
    baseCost: 300000,
    growthRate: 1.22,
    stages: ['unicorn', 'ipo'],
    effects: { usersFlat: 250, reputation: 1 },
  },

  {
    id: 'bug-bounty',
    category: 'product',
    name: 'Bug Bounty Program',
    description: 'Crowdsourced QA that keeps quality issues from piling up.',
    baseCost: 400,
    growthRate: 1.15,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { quality: 0.6, mrrFlat: 4 },
  },
  {
    id: 'design-refresh',
    category: 'product',
    name: 'Design Refresh',
    description: 'A cleaner, more delightful interface.',
    baseCost: 2000,
    growthRate: 1.17,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { quality: 1, mrrFlat: 15 },
  },
  {
    id: 'ai-features',
    category: 'product',
    name: 'AI-Powered Features',
    description: 'Smart automation that customers are happy to pay more for.',
    baseCost: 10000,
    growthRate: 1.19,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { quality: 1.5, mrrFlat: 80 },
  },
  {
    id: 'enterprise-tier',
    category: 'product',
    name: 'Enterprise Tier',
    description: 'A premium plan built for large customers with deep pockets.',
    baseCost: 200000,
    growthRate: 1.23,
    stages: ['unicorn', 'ipo'],
    effects: { quality: 1, mrrFlat: 500 },
  },

  {
    id: 'standing-desks',
    category: 'office',
    name: 'Standing Desks',
    description: 'Small quality-of-life upgrade. The team notices.',
    baseCost: 350,
    growthRate: 1.13,
    stages: ['garage', 'startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { morale: 0.8 },
  },
  {
    id: 'free-lunches',
    category: 'office',
    name: 'Catered Lunches',
    description: 'Free food is a surprisingly powerful morale lever.',
    baseCost: 1800,
    growthRate: 1.16,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { morale: 1.2 },
  },
  {
    id: 'wellness-program',
    category: 'office',
    name: 'Wellness Program',
    description: 'Gym stipends, mental health days, and real work-life boundaries.',
    baseCost: 15000,
    growthRate: 1.18,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { morale: 2, quality: 0.4 },
  },
  {
    id: 'campus-hq',
    category: 'office',
    name: 'Campus HQ',
    description: 'A sprawling headquarters that becomes a landmark of its own.',
    baseCost: 800000,
    growthRate: 1.25,
    stages: ['unicorn', 'ipo'],
    effects: { morale: 3, reputation: 1 },
  },

  // --- Expansion pack ---
  {
    id: 'edge-caching',
    category: 'servers',
    name: 'Edge Caching Layer',
    description: 'Requests served from the nearest node instead of a single origin.',
    baseCost: 45000,
    growthRate: 1.21,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { mrrFlat: 180, quality: 1.2 },
  },
  {
    id: 'referral-program',
    category: 'marketing',
    name: 'Referral Program',
    description: 'Existing users bring in the next wave for a modest reward.',
    baseCost: 3500,
    growthRate: 1.16,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { usersFlat: 25, mrrFlat: 10 },
  },
  {
    id: 'affiliate-network',
    category: 'marketing',
    name: 'Affiliate Network',
    description: 'A performance-based sales channel that scales with the market.',
    baseCost: 45000,
    growthRate: 1.2,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { usersFlat: 90, mrrFlat: 60 },
  },
  {
    id: 'mobile-app',
    category: 'product',
    name: 'Native Mobile App',
    description: 'Meet users where they already spend their time.',
    baseCost: 25000,
    growthRate: 1.19,
    stages: ['startup', 'scaleup', 'unicorn', 'ipo'],
    effects: { quality: 1.2, mrrFlat: 100 },
  },
  {
    id: 'api-platform',
    category: 'product',
    name: 'Public API Platform',
    description: 'Developers build on top of you, deepening lock-in and reach.',
    baseCost: 350000,
    growthRate: 1.22,
    stages: ['unicorn', 'ipo'],
    effects: { quality: 1.5, mrrFlat: 350 },
  },
  {
    id: 'onsite-gym',
    category: 'office',
    name: 'On-Site Gym',
    description: 'No excuse not to move between meetings.',
    baseCost: 40000,
    growthRate: 1.18,
    stages: ['scaleup', 'unicorn', 'ipo'],
    effects: { morale: 1.8 },
  },
];

export function getAvailableUpgrades(stageId) {
  return UPGRADES.filter((u) => u.stages.includes(stageId));
}
