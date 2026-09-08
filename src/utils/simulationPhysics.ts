import { 
  StormSimulationState, 
  CalculatedIntelligence, 
  RiskLevel, 
  NextAreaPrediction, 
  RankedThreatArea, 
  SaferAreaOption, 
  EvacuationRoute, 
  WarningAlert 
} from '../types';

export function calculateDangerScore(state: StormSimulationState): number {
  const { rainfall, riverLevel, soilSaturation, slopeDegrees, drainageCapacity } = state;

  // Normalized 0 - 1 factors
  const normRain = Math.min(1.0, rainfall / 120);
  const normForecast = Math.min(1.0, (rainfall * 1.2) / 130);
  const normSoil = Math.min(1.0, soilSaturation / 100);
  const normRiver = Math.min(1.0, riverLevel / 5.5);
  const normSlope = Math.min(1.0, slopeDegrees / 45);
  const normDrainageDeficit = Math.min(1.0, (100 - drainageCapacity) / 100);
  const normProximity = Math.min(1.0, (rainfall + soilSaturation) / 200);

  // 100% Normalized Weights
  const score = (
    normRain * 25 +
    normForecast * 20 +
    normSoil * 15 +
    normRiver * 15 +
    normSlope * 10 +
    normDrainageDeficit * 10 +
    normProximity * 5
  );

  return Math.min(99, Math.max(8, Math.round(score)));
}

export function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 90) return 'CRITICAL';
  if (score >= 75) return 'VERY HIGH';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function calculateIntelligence(state: StormSimulationState): CalculatedIntelligence {
  const floodProbability = calculateDangerScore(state);
  const riskLevel = classifyRiskLevel(floodProbability);

  const baseMinutes = Math.max(8, Math.round(105 - floodProbability * 0.9));
  const timeToImpactMinutes = state.timelineMinute > 0 ? Math.max(0, baseMinutes - state.timelineMinute) : baseMinutes;
  const estimatedDepthMeters = parseFloat((0.3 + (floodProbability / 100) * 3.2).toFixed(1));

  let explanation = '';
  if (floodProbability >= 75) {
    explanation = `Heavy forecast rainfall (${state.rainfall} mm/hr) combined with high soil saturation (${state.soilSaturation}%), steep terrain (${state.slopeDegrees}°), and rising upstream water levels (${state.riverLevel}m) is increasing surface runoff and downstream flood risk.`;
  } else if (floodProbability >= 60) {
    explanation = `Accelerated rainfall (${state.rainfall} mm/hr) and high soil saturation (${state.soilSaturation}%) are directing rapid runoff downhill into low-lying stream corridors.`;
  } else {
    explanation = `Valley hydrological absorption remains stable. Precipitation (${state.rainfall} mm/hr) is currently within safe natural drainage capacity.`;
  }

  const totalPop = 12480;
  const criticalPop = Math.round(totalPop * (floodProbability / 100) * 0.175);
  const highRiskPop = Math.round(totalPop * (floodProbability / 100) * 0.394);

  return {
    floodProbability,
    riskLevel,
    timeToImpactMinutes,
    confidenceScore: 76,
    uncertaintyMargin: 8,
    estimatedDepthMeters,
    floodExtentRadiusKm: parseFloat((1.2 + (floodProbability / 100) * 4.5).toFixed(1)),
    historicalSimilarityPct: Math.min(94, Math.round(65 + (floodProbability / 100) * 25)),
    pressureScore: Math.round(110 + floodProbability * 1.8),
    modelAgreements: [
      { name: 'Hydrological Hydro-CASCADE', type: 'Physics Engine', score: 92 },
      { name: 'XGBoost Watershed Net', type: 'Gradient Boosting', score: 89 },
      { name: 'CNN Elevation Flow Model', type: 'Deep Learning', score: 91 },
      { name: 'LSTM Hydro Graph Net', type: 'Temporal Graph ML', score: 93 }
    ],
    naturalLanguageExplanation: explanation,
    shapContributions: [
      { feature: 'Rainfall Intensity', weight: 25, description: `${state.rainfall} mm/hr current precipitation` },
      { feature: 'Forecast Rainfall', weight: 20, description: `${Math.round(state.rainfall * 1.2)} mm/hr 3-hour projection` },
      { feature: 'Soil Saturation', weight: 15, description: `${state.soilSaturation}% ground moisture level` },
      { feature: 'River Level', weight: 15, description: `${state.riverLevel}m crest height` },
      { feature: 'Terrain Slope', weight: 10, description: `${state.slopeDegrees}° steep runoff slope` },
      { feature: 'Drainage Deficit', weight: 10, description: `${state.drainageCapacity}% absorption capacity` },
    ],
    affectedPopulation: {
      total: totalPop,
      critical: criticalPop,
      highRisk: highRiskPop,
    },
    infrastructureAtRisk: {
      roads: floodProbability > 70 ? 7 : 3,
      bridges: floodProbability > 70 ? 2 : 1,
      hospitals: floodProbability > 85 ? 1 : 0,
      shelters: 3,
    }
  };
}

export function getNextAreaPrediction(state: StormSimulationState): NextAreaPrediction {
  const score = calculateDangerScore(state);
  const riskLevel = classifyRiskLevel(score);
  const eta = Math.max(12, Math.round(68 - (state.rainfall / 150) * 35));

  return {
    targetZoneId: 'ZONE-C',
    targetZoneName: 'ZONE C — EASTERN VALLEY BASIN',
    dangerScore: score,
    riskLevel,
    expectedImpactMinutes: eta,
    confidenceScore: 76,
    statusLabel: riskLevel === 'CRITICAL' ? 'CRITICAL' : 'VERY HIGH',
    primaryCauses: [
      `Heavy rainfall intensity (${state.rainfall} mm/hr)`,
      `High soil saturation (${state.soilSaturation}%)`,
      `Steep mountain slope (${state.slopeDegrees}°)`,
      `Rising river level (${state.riverLevel}m)`,
      `Low drainage capacity (${state.drainageCapacity}%)`
    ]
  };
}

export function getRankedThreatAreas(state: StormSimulationState): RankedThreatArea[] {
  const baseScore = calculateDangerScore(state);
  const eta = Math.max(12, Math.round(65 - (state.rainfall / 150) * 30));

  return [
    {
      rank: 1,
      zoneId: 'ZONE-TIRUMALA',
      name: 'Tirumala Foothills',
      dangerScore: Math.min(99, Math.round(baseScore * 1.12)),
      riskLevel: classifyRiskLevel(Math.min(99, Math.round(baseScore * 1.12))),
      etaMinutes: 45,
      lat: 13.670,
      lng: 79.400
    },
    {
      rank: 2,
      zoneId: 'ZONE-KARAKAMBADI',
      name: 'Karakambadi',
      dangerScore: baseScore,
      riskLevel: classifyRiskLevel(baseScore),
      etaMinutes: 80,
      lat: 13.652,
      lng: 79.438
    },
    {
      rank: 3,
      zoneId: 'ZONE-RENIGUNTA',
      name: 'Renigunta',
      dangerScore: Math.round(baseScore * 0.78),
      riskLevel: classifyRiskLevel(Math.round(baseScore * 0.78)),
      etaMinutes: 130,
      lat: 13.635,
      lng: 79.480
    },
    {
      rank: 4,
      zoneId: 'ZONE-RAMIREDDYPALLI',
      name: 'Ramireddypalli',
      dangerScore: Math.round(baseScore * 0.56),
      riskLevel: classifyRiskLevel(Math.round(baseScore * 0.56)),
      etaMinutes: 180,
      lat: 13.618,
      lng: 79.440
    },
    {
      rank: 5,
      zoneId: 'ZONE-CHANDRAGIRI',
      name: 'Chandragiri',
      dangerScore: Math.round(baseScore * 0.38),
      riskLevel: classifyRiskLevel(Math.round(baseScore * 0.38)),
      etaMinutes: 255,
      lat: 13.595,
      lng: 79.310
    }
  ];
}

export function getSaferAreas(state: StormSimulationState): SaferAreaOption[] {
  return [
    {
      zoneId: 'ZONE-F',
      name: 'ZONE F (North High Ridge)',
      currentRiskPct: 18,
      projectedRiskPct: 23,
      distanceKm: 2.8,
      etaMinutes: 9,
      elevationMeters: 580,
      roadStatus: 'OPEN',
      shelterAvailable: true,
      shelterName: 'Shelter S4 (Community Center)',
      recommendationLabel: 'RELATIVELY SAFER',
      lat: 13.655,
      lng: 79.445
    },
    {
      zoneId: 'ZONE-G',
      name: 'ZONE G (East Ridge Plateau)',
      currentRiskPct: 24,
      projectedRiskPct: 31,
      distanceKm: 3.5,
      etaMinutes: 12,
      elevationMeters: 620,
      roadStatus: 'OPEN',
      shelterAvailable: true,
      shelterName: 'East Ridge Hall',
      recommendationLabel: 'RELATIVELY SAFER',
      lat: 13.662,
      lng: 79.458
    },
    {
      zoneId: 'ZONE-H',
      name: 'ZONE H (West High Ground)',
      currentRiskPct: 29,
      projectedRiskPct: 44,
      distanceKm: 4.1,
      etaMinutes: 16,
      elevationMeters: 540,
      roadStatus: 'WARNING',
      shelterAvailable: true,
      shelterName: 'West Valley Assembly Center',
      recommendationLabel: 'LOWER PROJECTED RISK',
      lat: 13.630,
      lng: 79.385
    }
  ];
}

export function getEvacuationRoute(state: StormSimulationState): EvacuationRoute {
  const danger = calculateDangerScore(state);
  const isClosed = danger > 80;

  return {
    id: 'ROUTE-R12',
    name: 'Evacuation Corridor R12 -> Junction J4 -> Shelter S4',
    originZone: 'ZONE C (Valley Floor)',
    waypoints: [
      [13.638, 79.425],
      [13.645, 79.435],
      [13.655, 79.445]
    ],
    distanceKm: 5.2,
    etaMinutes: 18,
    routeRisk: 'LOW',
    roadStatus: isClosed ? 'WARNING' : 'OPEN',
    destinationShelter: {
      name: 'SHELTER S4 (Community Center)',
      distanceKm: 2.8,
      etaMinutes: 11,
      capacity: 500,
      available: 340,
      riskLevel: 'LOW'
    }
  };
}

export function getEarlyWarning(state: StormSimulationState): WarningAlert {
  const score = calculateDangerScore(state);
  let level: WarningAlert['level'] = 'WATCH';
  if (score >= 90) level = 'CRITICAL';
  else if (score >= 75) level = 'EVACUATE NOW';
  else if (score >= 60) level = 'WARNING';

  return {
    id: `WRN-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    level,
    targetZone: 'ZONE C (Eastern Valley / Nepal Corridor)',
    currentRiskPct: Math.round(score * 0.7),
    projectedRiskPct: score,
    escalationMinutes: Math.max(15, Math.round(60 - (state.rainfall / 150) * 30)),
    recommendedAction: 'Prepare evacuation for vulnerable residents and clear river bridge corridors.'
  };
}

export function getNepalDistrictRisks(state: StormSimulationState): import('../types').NepalDistrictRisk[] {
  const baseScore = calculateDangerScore(state);

  return [
    {
      districtId: 'NEP-KTM',
      name: 'Kathmandu Valley',
      currentConditionSymbol: '🌧️',
      currentConditionLabel: 'Heavy Rain',
      predictedRiskPct: Math.min(99, Math.round(baseScore * 1.05)),
      expectedImpact: classifyRiskLevel(Math.min(99, Math.round(baseScore * 1.05))) === 'CRITICAL' ? 'EXTREME' : 'HIGH',
      primaryCause: 'Bagmati river overtopping & urban drainage congestion'
    },
    {
      districtId: 'NEP-TERAI',
      name: 'Terai Region',
      currentConditionSymbol: '🌧️',
      currentConditionLabel: 'Torrential Rain',
      predictedRiskPct: Math.min(99, Math.round(baseScore * 1.18)),
      expectedImpact: 'VERY HIGH',
      primaryCause: 'Chure hill runoff surge & river spillover'
    },
    {
      districtId: 'NEP-POKHARA',
      name: 'Pokhara (Gandaki)',
      currentConditionSymbol: '⛈️',
      currentConditionLabel: 'Severe Thunderstorm',
      predictedRiskPct: Math.min(99, Math.round(baseScore * 0.96)),
      expectedImpact: 'HIGH',
      primaryCause: 'Seti river gorge rapid surge'
    },
    {
      districtId: 'NEP-KOSHI',
      name: 'Koshi Region',
      currentConditionSymbol: '🌊',
      currentConditionLabel: 'River Overtop Warning',
      predictedRiskPct: Math.min(99, Math.round(baseScore * 1.15)),
      expectedImpact: 'VERY HIGH',
      primaryCause: 'Saptakoshi embankment surge & siltation'
    },
    {
      districtId: 'NEP-KARNALI',
      name: 'Karnali Region',
      currentConditionSymbol: '⚠️',
      currentConditionLabel: 'River Rise & Landslide Risk',
      predictedRiskPct: Math.min(99, Math.round(baseScore * 0.85)),
      expectedImpact: 'MODERATE',
      primaryCause: 'Steep canyon runoff & debris blockage'
    }
  ];
}

export function getForecastTimeline(state: StormSimulationState): import('../types').ForecastTimelineStep[] {
  const baseScore = calculateDangerScore(state);
  const rain = state.rainfall;

  return [
    {
      offsetLabel: 'NOW',
      offsetHours: 0,
      expectedRainfall: rain,
      expectedRiskPct: baseScore,
      weatherSymbol: '🌧️',
      riskLevel: classifyRiskLevel(baseScore),
      affectedAreasCount: 2,
      recommendedWarning: 'Monitor stream levels & clear bridge channels.'
    },
    {
      offsetLabel: '+6H',
      offsetHours: 6,
      expectedRainfall: Math.round(rain * 1.18),
      expectedRiskPct: Math.min(99, Math.round(baseScore * 1.12)),
      weatherSymbol: '⛈️',
      riskLevel: classifyRiskLevel(Math.min(99, Math.round(baseScore * 1.12))),
      affectedAreasCount: 4,
      recommendedWarning: 'Issue Level 2 Watch for low-lying valley zones.'
    },
    {
      offsetLabel: '+12H',
      offsetHours: 12,
      expectedRainfall: Math.round(rain * 1.35),
      expectedRiskPct: Math.min(99, Math.round(baseScore * 1.25)),
      weatherSymbol: '🌊',
      riskLevel: classifyRiskLevel(Math.min(99, Math.round(baseScore * 1.25))),
      affectedAreasCount: 6,
      recommendedWarning: 'Activate Evacuation Warning for high-threat floodplains.'
    },
    {
      offsetLabel: '+24H',
      offsetHours: 24,
      expectedRainfall: Math.round(rain * 1.20),
      expectedRiskPct: Math.min(99, Math.round(baseScore * 1.18)),
      weatherSymbol: '⚠️',
      riskLevel: classifyRiskLevel(Math.min(99, Math.round(baseScore * 1.18))),
      affectedAreasCount: 5,
      recommendedWarning: 'Pre-position emergency response & NDRF units.'
    },
    {
      offsetLabel: '+48H',
      offsetHours: 48,
      expectedRainfall: Math.max(12, Math.round(rain * 0.40)),
      expectedRiskPct: Math.max(15, Math.round(baseScore * 0.38)),
      weatherSymbol: '🌤️',
      riskLevel: classifyRiskLevel(Math.max(15, Math.round(baseScore * 0.38))),
      affectedAreasCount: 1,
      recommendedWarning: 'Storm recedes; initiate drawdown & damage inspection.'
    }
  ];
}
