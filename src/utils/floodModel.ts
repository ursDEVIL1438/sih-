export interface FloodInputs {
  rainfallPct: number; // 0-100
  forecastRainPct: number; // 0-100
  soilSaturationPct: number; // 0-100
  riverLevelPct: number; // 0-100
  terrainSlopePct: number; // 0-100
  drainageCapacityPct: number; // 0-100
  riverProximityPct: number; // 0-100
}

export function computeFloodRisk(inputs: FloodInputs) {
  // weights per user spec
  const weights = {
    rainfall: 0.25,
    forecast: 0.20,
    soil: 0.15,
    river: 0.15,
    slope: 0.10,
    drainage: 0.10,
    proximity: 0.05
  };

  // Normalize inputs to 0..1
  const r = clamp01(inputs.rainfallPct / 100);
  const fr = clamp01(inputs.forecastRainPct / 100);
  const s = clamp01(inputs.soilSaturationPct / 100);
  const rv = clamp01(inputs.riverLevelPct / 100);
  const sl = clamp01(inputs.terrainSlopePct / 100);
  const d = clamp01(1 - inputs.drainageCapacityPct / 100); // low drainage => higher risk
  const p = clamp01(inputs.riverProximityPct / 100);

  const score = (
    r * weights.rainfall +
    fr * weights.forecast +
    s * weights.soil +
    rv * weights.river +
    sl * weights.slope +
    d * weights.drainage +
    p * weights.proximity
  );

  const pct = Math.round(clamp01(score) * 100);

  let level = 'LOW';
  if (pct >= 90) level = 'CRITICAL';
  else if (pct >= 75) level = 'VERY HIGH';
  else if (pct >= 60) level = 'HIGH';
  else if (pct >= 40) level = 'MODERATE';
  else level = 'LOW';

  return { score: pct, level };
}

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
