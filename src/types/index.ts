export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL';

export type OperationalMode = 'BEFORE' | 'DURING' | 'AFTER';

export type SystemDataStatus = 'LIVE' | 'OFFICIAL' | 'API' | 'HISTORICAL' | 'SIMULATED' | 'MODEL OUTPUT' | 'DEMO';

export interface StormSimulationState {
  rainfall: number; // mm/hr (10 - 150)
  durationHours: number; // 1 - 24
  riverLevel: number; // meters (0.5 - 6.5)
  soilSaturation: number; // % (10 - 100)
  drainageCapacity: number; // % (10 - 90)
  slopeDegrees: number; // degrees (5 - 45)
  timelineMinute: number; // -120 to +120
  futureOffsetHours: number; // 0, 1, 3, 6, 12, 24
  preset: 'NORMAL' | 'HEAVY' | 'EXTREME' | 'CUSTOM';
  selectedRegion: string;
}

export interface CalculatedIntelligence {
  floodProbability: number; // 0 - 100
  riskLevel: RiskLevel;
  timeToImpactMinutes: number;
  confidenceScore: number; // %
  uncertaintyMargin: number; // ±%
  estimatedDepthMeters: number;
  floodExtentRadiusKm?: number;
  historicalSimilarityPct?: number;
  pressureScore?: number;
  modelAgreements?: { name: string; type: string; score: number }[];
  naturalLanguageExplanation: string;
  shapContributions: { feature: string; weight: number; description: string }[];
  affectedPopulation: {
    total: number;
    highRisk: number;
    critical: number;
  };
  infrastructureAtRisk: {
    roads: number;
    bridges: number;
    hospitals: number;
    shelters: number;
  };
}

export interface NextAreaPrediction {
  targetZoneId: string;
  targetZoneName: string;
  dangerScore: number;
  riskLevel: RiskLevel;
  expectedImpactMinutes: number;
  confidenceScore: number;
  statusLabel: string;
  primaryCauses: string[];
}

export interface RankedThreatArea {
  rank: number;
  zoneId: string;
  name: string;
  dangerScore: number;
  riskLevel: RiskLevel;
  etaMinutes: number;
  lat: number;
  lng: number;
}

export interface SaferAreaOption {
  zoneId: string;
  name: string;
  currentRiskPct: number;
  projectedRiskPct: number;
  distanceKm: number;
  etaMinutes: number;
  elevationMeters: number;
  roadStatus: 'OPEN' | 'WARNING' | 'CLOSED';
  shelterAvailable: boolean;
  shelterName: string;
  recommendationLabel: 'RELATIVELY SAFER' | 'LOWER PROJECTED RISK';
  lat: number;
  lng: number;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  originZone: string;
  waypoints: [number, number][];
  distanceKm: number;
  etaMinutes: number;
  routeRisk: 'LOW' | 'MODERATE' | 'HIGH';
  roadStatus: 'OPEN' | 'WARNING' | 'CLOSED';
  destinationShelter: {
    name: string;
    distanceKm: number;
    etaMinutes: number;
    capacity: number;
    available: number;
    riskLevel: RiskLevel;
  };
}

export interface WarningAlert {
  id: string;
  timestamp: string;
  level: 'WATCH' | 'WARNING' | 'EVACUATE NOW' | 'CRITICAL';
  targetZone: string;
  currentRiskPct: number;
  projectedRiskPct: number;
  escalationMinutes: number;
  recommendedAction: string;
}

export type WeatherSymbolIcon = '🌧️' | '⛈️' | '☁️' | '🌤️' | '☀️' | '🌨️' | '💨' | '🌊' | '⚠️';

export interface WeatherLocationPoint {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  weatherSymbol: WeatherSymbolIcon;
  weatherCondition: string;
  rainfall: number; // mm/hr
  tempC: number;
  humidityPct: number;
  windKmH: number;
  riverLevelM: number;
  soilSaturationPct: number;
  currentRiskPct: number;
  predictedRiskPct: number;
  predictionTimeLabel: string;
}

export interface HistoricalFloodHotspot {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  eventsCount: number;
  frequencyLabel: string;
  mostAffectedMonths: string;
  severityLabel: string;
  majorEvents: string[];
}

export interface ForecastTimelineStep {
  offsetLabel: 'NOW' | '+6H' | '+12H' | '+24H' | '+48H';
  offsetHours: number;
  expectedRainfall: number;
  expectedRiskPct: number;
  weatherSymbol: WeatherSymbolIcon;
  riskLevel: RiskLevel;
  affectedAreasCount: number;
  recommendedWarning: string;
}

export interface NepalDistrictRisk {
  districtId: string;
  name: string;
  currentConditionSymbol: WeatherSymbolIcon;
  currentConditionLabel: string;
  predictedRiskPct: number;
  expectedImpact: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'EXTREME';
  primaryCause: string;
}
