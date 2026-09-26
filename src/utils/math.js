// Numeric helpers shared across the game engine.

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function pickWeighted(items, weightKey = 'weight') {
  const total = items.reduce((sum, item) => sum + (item[weightKey] || 1), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item[weightKey] || 1;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

// Formats large numbers the "idle game" way: 1.2K, 3.4M, 5.6B, 7.8T
export function formatCompactNumber(value) {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs < 1000) {
    return sign + Math.round(abs * 100) / 100;
  }

  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];

  for (const unit of units) {
    if (abs >= unit.value) {
      const num = abs / unit.value;
      const formatted = num >= 100 ? num.toFixed(0) : num.toFixed(2);
      return `${sign}${formatted}${unit.suffix}`;
    }
  }

  return sign + Math.round(abs);
}

export function formatCurrency(value) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${formatCompactNumber(Math.abs(value))}`;
}

export function formatCurrencyPrecise(value) {
  const rounded = Math.round(value * 100) / 100;
  return `$${rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Exponential cost scaling for repeatable upgrade purchases.
export function scaledCost(baseCost, growthRate, quantityOwned) {
  return Math.ceil(baseCost * Math.pow(growthRate, quantityOwned));
}

// Company stage thresholds, in valuation dollars.
export const STAGES = [
  { id: 'garage', label: 'Garage', min: 0, max: 10000 },
  { id: 'startup', label: 'Startup', min: 10000, max: 500000 },
  { id: 'scaleup', label: 'Scale-up', min: 500000, max: 50000000 },
  { id: 'unicorn', label: 'Unicorn', min: 50000000, max: 1000000000 },
  { id: 'ipo', label: 'IPO-ready', min: 1000000000, max: Infinity },
];

export function getStageForValuation(valuation) {
  return STAGES.find((s) => valuation >= s.min && valuation < s.max) || STAGES[0];
}

export function getStageIndex(stageId) {
  return STAGES.findIndex((s) => s.id === stageId);
}

// Valuation is a function of MRR, users, and product quality — a stylized
// SaaS-multiple heuristic used throughout the sim.
export function computeValuation({ mrr, users, quality, morale }) {
  const arr = mrr * 12;
  const multiple = 3 + (quality / 100) * 6 + (morale / 100) * 2;
  const userValue = users * 4;
  return Math.max(0, arr * multiple + userValue);
}

export function animateCountUp(from, to, durationMs, onUpdate, onDone) {
  const start = performance.now();
  const diff = to - from;

  function tick(now) {
    const elapsed = now - start;
    const t = clamp(elapsed / durationMs, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    onUpdate(from + diff * eased);
    if (t < 1) {
      requestAnimationFrame(tick);
    } else if (onDone) {
      onDone();
    }
  }

  requestAnimationFrame(tick);
}
