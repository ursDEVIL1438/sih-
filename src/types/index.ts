export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'CRITICAL';

export type OperationalMode = 'BEFORE' | 'DURING' | 'AFTER';

export type SystemDataStatus = 'LIVE' | 'OFFICIAL' | 'API' | 'HISTORICAL' | 'DEGRADED' | 'MODEL ESTIMATE' | 'SIMULATED' | 'MODEL OUTPUT' | 'DEMO' | 'UNAVAILABLE';

export interface StormSimulationState {
  rainfall: number; // mm/hr
  durationHours: number; // 1 - 24
  riverLevel: number; // meters
  soilSaturation: number; // %
  drainageCapacity: number; // %
  slopeDegrees: number; // degrees
  timelineMinute: number; // -120 to +120
  futureOffsetHours: number; // 0, 6, 12, 24, 48
  preset: 'NORMAL' | 'HEAVY' | 'EXTREME' | 'CUSTOM';
  selectedRegion: string;
  activeLocationId?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
}

export interface DataSourceHealth {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DELAYED' | 'UNAVAILABLE';
  lastUpdated: string;
  providerName: string;
}

export interface ConfidenceBreakdown {
  scorePct: number; // 0 - 100
  freshWeatherAvailable: boolean;
  riverStationAvailable: boolean;
  terrainDataAvailable: boolean;
  forecastAvailable: boolean;
  soilSensorAvailable: boolean;
  reasons: string[];
}

export interface CalculatedIntelligence {
  floodProbability: number; // 0 - 100
  riskLevel: RiskLevel;
  timeToImpactMinutes: number;
  confidenceScore: number; // %
  confidenceBreakdown: ConfidenceBreakdown;
  uncertaintyMargin: number; // ±%
  estimatedDepthMeters: number;
  floodExtentRadiusKm: number;
  historicalSimilarityPct: number;
  pressureScore?: number;
  modelAgreements?: { name: string; type: string; score: number }[];
  naturalLanguageExplanation: string;
  shapContributions: { feature: string; weight: number; description: string; currentValue: string }[];
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
  dataTimestamp: string;
  dataStatus: SystemDataStatus;
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
  recommendationLabel: 'COMPARATIVELY LOWER RISK' | 'MODERATE ELEVATION SAFEGUARD';
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
  isOfficialDHM: boolean;
  officialSource?: string;
  dispatchStatus: 'READY' | 'NOT SENT' | 'SIMULATION / PREVIEW' | 'SENT';
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
  pressureHpa?: number;
  riverLevelM: number;
  soilSaturationPct: number;
  currentRiskPct: number;
  predictedRiskPct: number;
  predictionTimeLabel: string;
  lastUpdated?: string;
  isLive?: boolean;
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
  historicalSusceptibilityScore?: number;
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
  sourceLabel: string;
}

export interface NepalDistrictRisk {
  districtId: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  currentConditionSymbol: WeatherSymbolIcon;
  currentConditionLabel: string;
  currentRainfall: number;
  forecastRainfall: number;
  predictedRiskPct: number;
  expectedImpact: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'EXTREME';
  primaryCause: string;
  riverStationName?: string;
  riverStatus?: string;
  lastUpdated: string;
  dataProvenance: 'OPEN-METEO + DHM LIVE' | 'MODEL ESTIMATE FROM NEAREST GRID';
}

export interface RiverGaugeStation {
  id: string;
  stationName: string;
  riverName: string;
  district: string;
  region: string;
  lat: number;
  lng: number;
  waterLevelMeters: number;
  warningLevelMeters: number;
  dangerLevelMeters: number;
  status: 'SAFE' | 'WARNING_RISING' | 'ABOVE_WARNING' | 'ABOVE_DANGER' | 'RAPIDLY_RISING';
  trend: 'RISING' | 'FALLING' | 'STEADY';
  rateOfChangeMetersPerHr: number;
  lastUpdated: string;
  source: 'Nepal DHM';
}

export interface LocationSearchResult {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  elevation: number;
}
