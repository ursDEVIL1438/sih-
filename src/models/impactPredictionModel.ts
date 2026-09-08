import { 
  NextAreaPrediction, 
  RankedThreatArea, 
  SaferAreaOption, 
  EvacuationRoute,
  RiskLevel,
  RiverGaugeStation
} from '../types';
import { LiveWeatherData } from '../services/weatherService';
import { classifyRiskLevel } from './floodRiskModel';

export function predictNextAreaAtRisk(
  locationName: string,
  calculatedRiskScore: number,
  weather: LiveWeatherData | null,
  riverStation: RiverGaugeStation | null
): NextAreaPrediction {
  const currentRain = weather ? weather.precipitationMmHr : 0;
  const isRising = riverStation ? riverStation.trend === 'RISING' : false;

  let targetZoneId = 'ZONE-DOWNSTREAM';
  let targetZoneName = 'EASTERN FLOODPLAIN CORRIDOR';
  
  if (locationName.toLowerCase().includes('kathmandu')) {
    targetZoneId = 'ZONE-BGM-LOW';
    targetZoneName = 'BALKHU & CHOBHAR BAGMATI GORGE';
  } else if (locationName.toLowerCase().includes('pokhara')) {
    targetZoneId = 'ZONE-SET-LOW';
    targetZoneName = 'RAMGHAT & SETI RIVER CAVERN';
  } else if (locationName.toLowerCase().includes('biratnagar') || locationName.toLowerCase().includes('koshi')) {
    targetZoneId = 'ZONE-KOS-EMB';
    targetZoneName = 'SAPTAKOSHI EMBANKMENT SECTOR 4';
  } else if (locationName.toLowerCase().includes('tirupati')) {
    targetZoneId = 'ZONE-KARAKAMBADI';
    targetZoneName = 'KARAKAMBADI CAUSEWAY LOWLANDS';
  }

  const dangerScore = Math.min(99, Math.round(calculatedRiskScore * (isRising ? 1.08 : 1.0)));
  const riskLevel = classifyRiskLevel(dangerScore);
  const eta = Math.max(10, Math.round(70 - (currentRain / 100) * 35));

  const primaryCauses: string[] = [
    `Current rainfall intensity (${currentRain} mm/hr)`,
    weather?.hourlyForecast?.[0] ? `Surface runoff (${weather.hourlyForecast[0].surfaceRunoffMm} mm)` : 'Heavy surface runoff accumulation',
    riverStation ? `Upstream ${riverStation.riverName} crest height (${riverStation.waterLevelMeters}m)` : 'Downstream drainage bottleneck',
    riverStation ? `Hydrological surge rate (${riverStation.rateOfChangeMetersPerHr > 0 ? '+' : ''}${riverStation.rateOfChangeMetersPerHr} m/hr)` : 'Steep elevation slope gradient'
  ];

  return {
    targetZoneId,
    targetZoneName,
    dangerScore,
    riskLevel,
    expectedImpactMinutes: eta,
    confidenceScore: weather?.isLive ? 84 : 62,
    statusLabel: riskLevel === 'CRITICAL' ? 'CRITICAL SURGE' : 'HIGH RISK ADVISORY',
    primaryCauses
  };
}

export function generateRankedThreatAreas(
  baseLocationName: string,
  baseScore: number,
  baseLat: number,
  baseLng: number
): RankedThreatArea[] {
  return [
    {
      rank: 1,
      zoneId: 'ZONE-PRIMARY',
      name: `${baseLocationName} Low-Lying Basin`,
      dangerScore: Math.min(99, Math.round(baseScore * 1.10)),
      riskLevel: classifyRiskLevel(Math.min(99, Math.round(baseScore * 1.10))),
      etaMinutes: 35,
      lat: baseLat + 0.012,
      lng: baseLng + 0.015
    },
    {
      rank: 2,
      zoneId: 'ZONE-RIVER-CORRIDOR',
      name: `${baseLocationName} Main River Corridor`,
      dangerScore: baseScore,
      riskLevel: classifyRiskLevel(baseScore),
      etaMinutes: 65,
      lat: baseLat - 0.010,
      lng: baseLng + 0.020
    },
    {
      rank: 3,
      zoneId: 'ZONE-JUNCTION',
      name: 'Downstream Bridge Junction',
      dangerScore: Math.round(baseScore * 0.82),
      riskLevel: classifyRiskLevel(Math.round(baseScore * 0.82)),
      etaMinutes: 110,
      lat: baseLat - 0.025,
      lng: baseLng - 0.018
    },
    {
      rank: 4,
      zoneId: 'ZONE-AGRICULTURAL',
      name: 'Outer Agricultural Floodplain',
      dangerScore: Math.round(baseScore * 0.58),
      riskLevel: classifyRiskLevel(Math.round(baseScore * 0.58)),
      etaMinutes: 160,
      lat: baseLat + 0.035,
      lng: baseLng - 0.022
    }
  ];
}

export function calculateSaferAreas(
  baseLat: number, 
  baseLng: number, 
  baseScore: number
): SaferAreaOption[] {
  return [
    {
      zoneId: 'SAFE-RIDGE-NORTH',
      name: 'North High Ridge Plateau',
      currentRiskPct: Math.round(baseScore * 0.22),
      projectedRiskPct: Math.round(baseScore * 0.28),
      distanceKm: 2.8,
      etaMinutes: 10,
      elevationMeters: 620,
      roadStatus: 'OPEN',
      shelterAvailable: true,
      shelterName: 'North Ridge Emergency Assembly Center',
      recommendationLabel: 'COMPARATIVELY LOWER RISK',
      lat: baseLat + 0.025,
      lng: baseLng + 0.018
    },
    {
      zoneId: 'SAFE-EAST-HILL',
      name: 'Eastern Hilltop Sanctuary',
      currentRiskPct: Math.round(baseScore * 0.31),
      projectedRiskPct: Math.round(baseScore * 0.36),
      distanceKm: 4.2,
      etaMinutes: 15,
      elevationMeters: 580,
      roadStatus: 'OPEN',
      shelterAvailable: true,
      shelterName: 'Eastern Community Multi-Purpose Shelter',
      recommendationLabel: 'COMPARATIVELY LOWER RISK',
      lat: baseLat - 0.018,
      lng: baseLng + 0.032
    },
    {
      zoneId: 'SAFE-WEST-GROUND',
      name: 'West Elevated District Park',
      currentRiskPct: Math.round(baseScore * 0.42),
      projectedRiskPct: Math.round(baseScore * 0.50),
      distanceKm: 5.6,
      etaMinutes: 22,
      elevationMeters: 510,
      roadStatus: baseScore > 75 ? 'WARNING' : 'OPEN',
      shelterAvailable: true,
      shelterName: 'West Elevated High School Shelter',
      recommendationLabel: 'MODERATE ELEVATION SAFEGUARD',
      lat: baseLat + 0.038,
      lng: baseLng - 0.025
    }
  ];
}

export function calculateEvacuationRoute(
  originLat: number, 
  originLng: number, 
  baseScore: number
): EvacuationRoute {
  const isHighDanger = baseScore > 75;

  return {
    id: 'ROUTE-SAFE-EVAC',
    name: 'North Ridge Evacuation Corridor -> High Assembly Center',
    originZone: 'Low-Lying Valley Corridor',
    waypoints: [
      [originLat, originLng],
      [originLat + 0.012, originLng + 0.008],
      [originLat + 0.025, originLng + 0.018]
    ],
    distanceKm: 4.8,
    etaMinutes: 16,
    routeRisk: isHighDanger ? 'MODERATE' : 'LOW',
    roadStatus: isHighDanger ? 'WARNING' : 'OPEN',
    destinationShelter: {
      name: 'North Ridge Emergency Assembly Center',
      distanceKm: 2.8,
      etaMinutes: 10,
      capacity: 650,
      available: 420,
      riskLevel: 'LOW'
    }
  };
}
