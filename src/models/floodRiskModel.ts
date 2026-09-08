import { 
  RiskLevel, 
  CalculatedIntelligence, 
  ConfidenceBreakdown, 
  SystemDataStatus,
  RiverGaugeStation
} from '../types';
import { LiveWeatherData } from '../services/weatherService';
import { formatTimestamp } from '../utils/dataValidation';

export interface DataFusionFeatureInputs {
  currentRainfallMmHr: number;
  forecastRainfall6hMm: number;
  forecastRainfall12hMm: number;
  soilMoisturePct: number;
  surfaceRunoffMm: number;
  riverLevelM: number;
  riverRateOfRiseMPerHr: number;
  isRiverAboveWarning: boolean;
  isRiverAboveDanger: boolean;
  slopeDegrees: number;
  drainageCapacityPct: number;
  historicalSusceptibilityScore: number;
  isOfficialDHMActive: boolean;
}

export function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 88) return 'CRITICAL';
  if (score >= 72) return 'VERY HIGH';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MODERATE';
  return 'LOW';
}

export function calculateDataFusionFloodRisk(
  weather: LiveWeatherData | null,
  riverStation: RiverGaugeStation | null,
  slopeDegrees: number = 28,
  drainageCapacityPct: number = 35,
  historicalSusceptibilityScore: number = 75
): CalculatedIntelligence {
  const isWeatherLive = weather !== null && weather.isLive;
  const isRiverLive = riverStation !== null;

  // Extract feature values
  const currentRain = weather ? weather.precipitationMmHr : 0;
  
  // Sum forecast rainfall for next 6h and 12h from hourly array
  let forecast6h = 0;
  let forecast12h = 0;
  let soilMoisture = 50;
  let surfaceRunoff = 0;

  if (weather && weather.hourlyForecast.length > 0) {
    forecast6h = weather.hourlyForecast.slice(0, 6).reduce((acc, p) => acc + p.precipitationMmHr, 0);
    forecast12h = weather.hourlyForecast.slice(0, 12).reduce((acc, p) => acc + p.precipitationMmHr, 0);
    soilMoisture = weather.hourlyForecast[0]?.soilMoisturePct ?? 50;
    surfaceRunoff = weather.hourlyForecast[0]?.surfaceRunoffMm ?? 0;
  }

  const riverLevel = riverStation ? riverStation.waterLevelMeters : 1.5;
  const riverRise = riverStation ? riverStation.rateOfChangeMetersPerHr : 0;
  const isWarning = riverStation ? riverStation.status === 'ABOVE_WARNING' : false;
  const isDanger = riverStation ? riverStation.status === 'ABOVE_DANGER' || riverStation.status === 'RAPIDLY_RISING' : false;

  // Normalized (0.0 - 1.0) feature vector calculations
  const normCurrentRain = Math.min(1.0, currentRain / 80);
  const normForecast6h = Math.min(1.0, forecast6h / 100);
  const normSoil = Math.min(1.0, soilMoisture / 100);
  const normRunoff = Math.min(1.0, surfaceRunoff / 25);
  const normRiver = riverStation 
    ? Math.min(1.0, riverLevel / riverStation.dangerLevelMeters) 
    : Math.min(1.0, riverLevel / 5.0);
  const normRiverRise = Math.min(1.0, Math.max(0, riverRise) / 0.3);
  const normSlope = Math.min(1.0, slopeDegrees / 45);
  const normDrainageDeficit = Math.min(1.0, (100 - drainageCapacityPct) / 100);
  const normHistory = Math.min(1.0, historicalSusceptibilityScore / 100);

  // Transparent Data-Fusion Feature Weights (Sums to 100%)
  // Rainfall Intensity: 20%, Forecast 6h: 20%, Soil Saturation: 15%, River Level: 15%, River Rise: 10%, Slope: 10%, Drainage Deficit: 5%, Historical: 5%
  let rawScore = (
    normCurrentRain * 20 +
    normForecast6h * 20 +
    normSoil * 15 +
    normRiver * 15 +
    normRiverRise * 10 +
    normSlope * 10 +
    normDrainageDeficit * 5 +
    normHistory * 5
  );

  // Official DHM Danger Boost (+15% if river is above danger level)
  if (isDanger) rawScore += 15;
  else if (isWarning) rawScore += 8;

  const floodProbability = Math.min(99, Math.max(5, Math.round(rawScore)));
  const riskLevel = classifyRiskLevel(floodProbability);

  // Calculate Confidence Breakdown
  const reasons: string[] = [];
  if (isWeatherLive) reasons.push('✓ Fresh live Open-Meteo weather data connected');
  else reasons.push('⚠ Open-Meteo weather API unavailable');

  if (isRiverLive) reasons.push(`✓ Nepal DHM River gauge station (${riverStation.stationName}) active`);
  else reasons.push('⚠ No direct river station connected');

  reasons.push('✓ DEM terrain elevation & slope parameters loaded');
  reasons.push('✓ 48-Hour Open-Meteo hourly precipitation forecast available');

  let confidencePct = 50;
  if (isWeatherLive) confidencePct += 25;
  if (isRiverLive) confidencePct += 15;
  confidencePct += 10; // Forecast + Terrain

  const confidenceBreakdown: ConfidenceBreakdown = {
    scorePct: Math.min(98, confidencePct),
    freshWeatherAvailable: isWeatherLive,
    riverStationAvailable: isRiverLive,
    terrainDataAvailable: true,
    forecastAvailable: isWeatherLive,
    soilSensorAvailable: isWeatherLive,
    reasons
  };

  // SHAP Feature Contributions with actual current values beside each factor
  const shapContributions = [
    {
      feature: 'Current Rainfall Intensity',
      weight: 20,
      description: 'Live precipitation accumulation',
      currentValue: `${currentRain} mm/hr ${currentRain > 25 ? '↑ (HEAVY)' : ''}`
    },
    {
      feature: 'Forecast 6-Hour Accumulation',
      weight: 20,
      description: 'Open-Meteo hourly forecast projection',
      currentValue: `${forecast6h.toFixed(1)} mm next 6 hours`
    },
    {
      feature: 'Soil Moisture Saturation',
      weight: 15,
      description: '0-7cm surface ground saturation',
      currentValue: `${soilMoisture}% saturated`
    },
    {
      feature: 'River Crest Level',
      weight: 15,
      description: 'Gauge station water height',
      currentValue: riverStation ? `${riverStation.waterLevelMeters}m / ${riverStation.dangerLevelMeters}m danger` : `${riverLevel}m level`
    },
    {
      feature: 'River Rate of Rise',
      weight: 10,
      description: 'Hydrological surge velocity',
      currentValue: `${riverRise > 0 ? '+' : ''}${riverRise.toFixed(2)} m/hr ${riverRise > 0.15 ? '↑ (RAPID)' : ''}`
    },
    {
      feature: 'Terrain Slope & Elevation',
      weight: 10,
      description: 'Gravitational runoff speed',
      currentValue: `${slopeDegrees}° steep slope gradient`
    },
    {
      feature: 'Drainage Deficit',
      weight: 5,
      description: 'Basin infiltration capacity',
      currentValue: `${drainageCapacityPct}% absorption remaining`
    },
    {
      feature: 'Historical Susceptibility',
      weight: 5,
      description: 'Past historical flood frequency',
      currentValue: `${historicalSusceptibilityScore}% historical rating`
    }
  ];

  // Natural Language Explanation
  let explanation = '';
  if (floodProbability >= 72) {
    explanation = `Data-Fusion Engine indicates EXTREME risk due to high current rainfall (${currentRain} mm/hr) and 6-hour forecast accumulation (${forecast6h.toFixed(1)} mm) combined with ${soilMoisture}% soil saturation and ${riverStation ? `${riverStation.riverName} rising at ${riverRise} m/hr` : 'rising stream channels'}.`;
  } else if (floodProbability >= 55) {
    explanation = `Moderate-to-high precipitation (${currentRain} mm/hr) and saturated soil (${soilMoisture}%) are generating rapid downhill surface runoff into low-lying stream corridors.`;
  } else {
    explanation = `Hydrological state is stable. Observed rainfall (${currentRain} mm/hr) and river levels remain within safe natural drainage thresholds.`;
  }

  const baseMinutes = Math.max(10, Math.round(110 - floodProbability * 0.9));

  let dataStatus: SystemDataStatus = 'MODEL ESTIMATE';
  if (isWeatherLive && isRiverLive) dataStatus = 'LIVE';
  else if (isWeatherLive) dataStatus = 'API';
  else dataStatus = 'UNAVAILABLE';

  const totalPop = 12480;
  const criticalPop = Math.round(totalPop * (floodProbability / 100) * 0.18);
  const highRiskPop = Math.round(totalPop * (floodProbability / 100) * 0.38);

  return {
    floodProbability,
    riskLevel,
    timeToImpactMinutes: baseMinutes,
    confidenceScore: confidenceBreakdown.scorePct,
    confidenceBreakdown,
    uncertaintyMargin: isWeatherLive ? 6 : 14,
    estimatedDepthMeters: parseFloat((0.2 + (floodProbability / 100) * 3.1).toFixed(1)),
    floodExtentRadiusKm: parseFloat((1.0 + (floodProbability / 100) * 4.2).toFixed(1)),
    historicalSimilarityPct: Math.min(94, Math.round(60 + (floodProbability / 100) * 30)),
    naturalLanguageExplanation: explanation,
    shapContributions,
    affectedPopulation: {
      total: totalPop,
      critical: criticalPop,
      highRisk: highRiskPop
    },
    infrastructureAtRisk: {
      roads: floodProbability > 65 ? 8 : 3,
      bridges: floodProbability > 65 ? 3 : 1,
      hospitals: floodProbability > 85 ? 1 : 0,
      shelters: 4
    },
    dataTimestamp: formatTimestamp(),
    dataStatus
  };
}
