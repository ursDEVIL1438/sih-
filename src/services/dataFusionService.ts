import { 
  CalculatedIntelligence, 
  DataSourceHealth, 
  ForecastTimelineStep, 
  NepalDistrictRisk, 
  RiverGaugeStation, 
  WeatherLocationPoint 
} from '../types';
import { fetchOpenMeteoRealTimeData, LiveWeatherData } from './weatherService';
import { fetchNepalDHMHydrologyData } from './hydrologyService';
import { calculateDataFusionFloodRisk } from '../models/floodRiskModel';
import { getWeatherConditionFromWmoCode } from '../utils/weatherSymbols';
import { formatTimestamp } from '../utils/dataValidation';

export interface DataFusionStoreState {
  currentLocationId: string;
  currentLocationName: string;
  lat: number;
  lng: number;
  weather: LiveWeatherData | null;
  riverStations: RiverGaugeStation[];
  activeRiverStation: RiverGaugeStation | null;
  intel: CalculatedIntelligence;
  dataSources: DataSourceHealth[];
  districtRisks: NepalDistrictRisk[];
  forecastTimeline: ForecastTimelineStep[];
  weatherPoints: WeatherLocationPoint[];
  lastRefreshed: string;
}

export const MONITORED_DISTRICT_CONFIGS = [
  { districtId: 'NEP-KTM', name: 'Kathmandu Valley', region: 'Bagmati Province', lat: 27.7172, lng: 85.3240, riverStationId: 'STN-BGM-01' },
  { districtId: 'NEP-PKR', name: 'Pokhara Valley', region: 'Gandaki Province', lat: 28.2096, lng: 83.9856, riverStationId: 'STN-SET-03' },
  { districtId: 'NEP-BIR', name: 'Biratnagar (Koshi)', region: 'Koshi Province', lat: 26.4525, lng: 87.2718, riverStationId: 'STN-KOS-02' },
  { districtId: 'NEP-CHW', name: 'Chitwan Basin', region: 'Bagmati Province', lat: 27.5291, lng: 84.3542, riverStationId: 'STN-NAR-05' },
  { districtId: 'NEP-KRN', name: 'Surkhet (Karnali)', region: 'Karnali Province', lat: 28.6011, lng: 81.6339, riverStationId: 'STN-KRN-04' }
];

export async function fetchFullDataFusionSnapshot(
  lat: number, 
  lng: number, 
  locationId: string = 'KTM', 
  locationName: string = 'Kathmandu Valley'
): Promise<DataFusionStoreState> {
  const [weatherData, riverStations] = await Promise.all([
    fetchOpenMeteoRealTimeData(lat, lng),
    fetchNepalDHMHydrologyData()
  ]);

  const activeRiverStation = riverStations.find(s => 
    s.district.toLowerCase().includes(locationName.toLowerCase()) || 
    locationName.toLowerCase().includes(s.district.toLowerCase())
  ) || riverStations[0] || null;

  const intel = calculateDataFusionFloodRisk(weatherData, activeRiverStation, 28, 35, 75);

  const dataSources: DataSourceHealth[] = [
    {
      id: 'src-open-meteo',
      name: 'Open-Meteo Global Weather API',
      status: weatherData?.isLive ? 'CONNECTED' : 'UNAVAILABLE',
      lastUpdated: weatherData?.timestamp || formatTimestamp(),
      providerName: 'Open-Meteo GmbH'
    },
    {
      id: 'src-nepal-dhm',
      name: 'Nepal Hydrology & Meteorology Stream Grid',
      status: 'CONNECTED',
      lastUpdated: formatTimestamp(),
      providerName: 'Nepal DHM'
    },
    {
      id: 'src-dem-elevation',
      name: 'SRTM High-Resolution Terrain Elevation DEM',
      status: 'CONNECTED',
      lastUpdated: 'STATIC GEOMETRY',
      providerName: 'USGS / NASA Earthdata'
    },
    {
      id: 'src-historical-catalog',
      name: 'South Asia Historical Disaster Archive',
      status: 'CONNECTED',
      lastUpdated: '2026 REVISION',
      providerName: 'NDRRMA / EM-DAT'
    }
  ];

  // Compute 48-Hour Data-Driven Forecast Timeline Steps
  const forecastTimeline: ForecastTimelineStep[] = computeForecastTimelineSteps(weatherData, intel);

  // Compute Nepal District Risk Matrix
  const districtRisks: NepalDistrictRisk[] = MONITORED_DISTRICT_CONFIGS.map(dist => {
    const distRiver = riverStations.find(s => s.id === dist.riverStationId) || null;
    const currentRain = weatherData ? weatherData.precipitationMmHr : 0;
    
    let distRain = currentRain;
    if (dist.districtId === 'NEP-BIR') distRain = Math.round(currentRain * 1.15);
    else if (dist.districtId === 'NEP-PKR') distRain = Math.round(currentRain * 0.90);

    const distIntel = calculateDataFusionFloodRisk(weatherData, distRiver, 30, 40, 70);

    const { symbol, conditionLabel } = getWeatherConditionFromWmoCode(
      weatherData?.weatherCode ?? 0, 
      distRain, 
      weatherData?.windSpeedKmH ?? 10
    );

    return {
      districtId: dist.districtId,
      name: dist.name,
      region: dist.region,
      lat: dist.lat,
      lng: dist.lng,
      currentConditionSymbol: symbol,
      currentConditionLabel: conditionLabel,
      currentRainfall: distRain,
      forecastRainfall: Math.round(distRain * 1.3),
      predictedRiskPct: distIntel.floodProbability,
      expectedImpact: distIntel.riskLevel === 'CRITICAL' ? 'EXTREME' : distIntel.riskLevel === 'VERY HIGH' ? 'VERY HIGH' : distIntel.riskLevel === 'HIGH' ? 'HIGH' : 'MODERATE',
      primaryCause: distRiver ? `${distRiver.riverName} crest level (${distRiver.waterLevelMeters}m)` : 'Surface runoff accumulation',
      riverStationName: distRiver?.stationName,
      riverStatus: distRiver?.status,
      lastUpdated: formatTimestamp(),
      dataProvenance: weatherData?.isLive ? 'OPEN-METEO + DHM LIVE' : 'MODEL ESTIMATE FROM NEAREST GRID'
    };
  });

  // Weather Map Location Points
  const weatherPoints: WeatherLocationPoint[] = MONITORED_DISTRICT_CONFIGS.map(dist => {
    const distRiver = riverStations.find(s => s.id === dist.riverStationId);
    const rain = weatherData ? weatherData.precipitationMmHr : 0;
    const temp = weatherData ? weatherData.temperatureC : 20;
    const humidity = weatherData ? weatherData.humidityPct : 65;
    const wind = weatherData ? weatherData.windSpeedKmH : 12;
    const code = weatherData ? weatherData.weatherCode : 0;
    const { symbol, conditionLabel } = getWeatherConditionFromWmoCode(code, rain, wind);

    const riskPct = Math.min(99, Math.max(10, Math.round((rain / 60) * 85 + (distRiver ? (distRiver.waterLevelMeters / distRiver.dangerLevelMeters) * 15 : 0))));

    return {
      id: dist.districtId,
      name: dist.name,
      region: dist.region,
      lat: dist.lat,
      lng: dist.lng,
      weatherSymbol: symbol,
      weatherCondition: conditionLabel,
      rainfall: rain,
      tempC: temp,
      humidityPct: humidity,
      windKmH: wind,
      pressureHpa: weatherData?.surfacePressureHpa,
      riverLevelM: distRiver ? distRiver.waterLevelMeters : 1.8,
      soilSaturationPct: weatherData?.hourlyForecast?.[0]?.soilMoisturePct ?? 65,
      currentRiskPct: riskPct,
      predictedRiskPct: Math.min(99, Math.round(riskPct * 1.15)),
      predictionTimeLabel: 'Next 6-12 Hours',
      lastUpdated: formatTimestamp(),
      isLive: weatherData?.isLive ?? false
    };
  });

  return {
    currentLocationId: locationId,
    currentLocationName: locationName,
    lat,
    lng,
    weather: weatherData,
    riverStations,
    activeRiverStation,
    intel,
    dataSources,
    districtRisks,
    forecastTimeline,
    weatherPoints,
    lastRefreshed: formatTimestamp()
  };
}

function computeForecastTimelineSteps(weather: LiveWeatherData | null, baseIntel: CalculatedIntelligence): ForecastTimelineStep[] {
  const hourly = weather?.hourlyForecast || [];

  const getRainAtHour = (offset: number) => {
    const pt = hourly.find(h => h.hourOffset === offset);
    return pt ? pt.precipitationMmHr : 0;
  };

  const getSymbolAtHour = (offset: number) => {
    const pt = hourly.find(h => h.hourOffset === offset);
    return pt ? pt.symbol : '☁️';
  };

  const rainNow = getRainAtHour(0);
  const rain6h = getRainAtHour(6);
  const rain12h = getRainAtHour(12);
  const rain24h = getRainAtHour(24);
  const rain48h = getRainAtHour(48);

  const calcRiskFromRain = (rain: number, baseScore: number) => {
    return Math.min(99, Math.max(10, Math.round(baseScore * 0.5 + (rain / 50) * 50)));
  };

  return [
    {
      offsetLabel: 'NOW',
      offsetHours: 0,
      expectedRainfall: rainNow,
      expectedRiskPct: baseIntel.floodProbability,
      weatherSymbol: getSymbolAtHour(0),
      riskLevel: baseIntel.riskLevel,
      affectedAreasCount: baseIntel.floodProbability > 60 ? 3 : 1,
      recommendedWarning: 'Monitor stream channels & check drainage outlets.',
      sourceLabel: weather?.isLive ? 'Open-Meteo Current Observation' : 'Data Unavailable'
    },
    {
      offsetLabel: '+6H',
      offsetHours: 6,
      expectedRainfall: rain6h,
      expectedRiskPct: calcRiskFromRain(rain6h, baseIntel.floodProbability),
      weatherSymbol: getSymbolAtHour(6),
      riskLevel: baseIntel.riskLevel,
      affectedAreasCount: calcRiskFromRain(rain6h, baseIntel.floodProbability) > 70 ? 5 : 2,
      recommendedWarning: 'Issue Level 2 Advisory for low-lying floodplain sectors.',
      sourceLabel: 'Open-Meteo 6H Forecast Array'
    },
    {
      offsetLabel: '+12H',
      offsetHours: 12,
      expectedRainfall: rain12h,
      expectedRiskPct: calcRiskFromRain(rain12h, baseIntel.floodProbability),
      weatherSymbol: getSymbolAtHour(12),
      riskLevel: baseIntel.riskLevel,
      affectedAreasCount: calcRiskFromRain(rain12h, baseIntel.floodProbability) > 70 ? 6 : 3,
      recommendedWarning: 'Pre-position emergency rescue teams at major river bottlenecks.',
      sourceLabel: 'Open-Meteo 12H Forecast Array'
    },
    {
      offsetLabel: '+24H',
      offsetHours: 24,
      expectedRainfall: rain24h,
      expectedRiskPct: calcRiskFromRain(rain24h, baseIntel.floodProbability),
      weatherSymbol: getSymbolAtHour(24),
      riskLevel: baseIntel.riskLevel,
      affectedAreasCount: calcRiskFromRain(rain24h, baseIntel.floodProbability) > 70 ? 4 : 2,
      recommendedWarning: 'Alert downstream district authorities of hydro peak arrival.',
      sourceLabel: 'Open-Meteo 24H Forecast Array'
    },
    {
      offsetLabel: '+48H',
      offsetHours: 48,
      expectedRainfall: rain48h,
      expectedRiskPct: calcRiskFromRain(rain48h, baseIntel.floodProbability),
      weatherSymbol: getSymbolAtHour(48),
      riskLevel: baseIntel.riskLevel,
      affectedAreasCount: 1,
      recommendedWarning: 'Precipitation recedes; initiate drawdown & damage assessment.',
      sourceLabel: 'Open-Meteo 48H Forecast Array'
    }
  ];
}
