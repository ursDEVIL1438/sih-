import { RiskLevel, WeatherLocationPoint, HistoricalFloodHotspot, NepalDistrictRisk } from '../types';

export interface TerrainZoneFeature {
  id: string;
  name: string;
  locationCode: string;
  region: 'Tirupati' | 'Nepal' | 'Himalayan';
  riskLevel: RiskLevel;
  dangerScore: number;
  expectedImpactMinutes: number;
  elevationMeters: number;
  primaryDrivers: string[];
  coordinates: [number, number][]; // Polygon ring lat/lng
  affectedPopulation: { total: number; critical: number; high: number; moderate: number };
  infrastructureAtRisk: { bridges: number; roads: number; hospitals: number };
}

// Organic terrain-derived watershed risk polygons (NO CIRCLES)
export const terrainRiskZones: TerrainZoneFeature[] = [
  // TIRUPATI HILLS WATERSHED POLYGONS
  {
    id: 'ZONE-TIRUMALA',
    name: 'Tirumala Foothills Stream Corridor',
    locationCode: 'TIRUMALA FOOTHILLS',
    region: 'Tirupati',
    riskLevel: 'CRITICAL',
    dangerScore: 92,
    expectedImpactMinutes: 45,
    elevationMeters: 850,
    primaryDrivers: [
      'Cloudburst precipitation (165 mm/hr)',
      'Steep mountain slope runoff (38°)',
      'Upper ridge soil saturation (95%)'
    ],
    coordinates: [
      [13.670, 79.390],
      [13.682, 79.405],
      [13.675, 79.420],
      [13.662, 79.432],
      [13.655, 79.418],
      [13.648, 79.402],
      [13.658, 79.388],
    ],
    affectedPopulation: { total: 4200, critical: 1850, high: 1450, moderate: 900 },
    infrastructureAtRisk: { bridges: 2, roads: 5, hospitals: 1 }
  },
  {
    id: 'ZONE-KARAKAMBADI',
    name: 'Karakambadi Lowland Valley Basin',
    locationCode: 'KARAKAMBADI',
    region: 'Tirupati',
    riskLevel: 'CRITICAL',
    dangerScore: 78,
    expectedImpactMinutes: 80,
    elevationMeters: 340,
    primaryDrivers: [
      'Streams convergence from Tirumala ridge',
      'Flat valley floor drainage congestion',
      'Main river cresting at 4.2m'
    ],
    coordinates: [
      [13.652, 79.438],
      [13.660, 79.460],
      [13.645, 79.475],
      [13.632, 79.462],
      [13.638, 79.442],
    ],
    affectedPopulation: { total: 6800, critical: 2180, high: 2620, moderate: 2000 },
    infrastructureAtRisk: { bridges: 3, roads: 8, hospitals: 0 }
  },
  {
    id: 'ZONE-RENIGUNTA',
    name: 'Renigunta Downstream Channel',
    locationCode: 'RENIGUNTA',
    region: 'Tirupati',
    riskLevel: 'HIGH',
    dangerScore: 64,
    expectedImpactMinutes: 130,
    elevationMeters: 180,
    primaryDrivers: [
      'Downstream surge from Karakambadi basin',
      'Lowland river channel spillover',
      'High ground water table saturation'
    ],
    coordinates: [
      [13.635, 79.480],
      [13.642, 79.510],
      [13.628, 79.525],
      [13.615, 79.495],
      [13.622, 79.475],
    ],
    affectedPopulation: { total: 12480, critical: 1200, high: 4920, moderate: 6360 },
    infrastructureAtRisk: { bridges: 2, roads: 6, hospitals: 1 }
  },

  // NEPAL WATERSHED ORGANIC POLYGONS
  {
    id: 'ZONE-KATHMANDU',
    name: 'Kathmandu Bagmati River Basin',
    locationCode: 'KATHMANDU VALLEY',
    region: 'Nepal',
    riskLevel: 'CRITICAL',
    dangerScore: 78,
    expectedImpactMinutes: 60,
    elevationMeters: 1400,
    primaryDrivers: [
      'Heavy monsoon precipitation (88 mm/hr)',
      'Bagmati & Bishnumati river overtopping',
      'Urban runoff & steep valley drainage'
    ],
    coordinates: [
      [27.735, 85.280],
      [27.748, 85.340],
      [27.710, 85.370],
      [27.665, 85.350],
      [27.672, 85.295],
    ],
    affectedPopulation: { total: 45000, critical: 12500, high: 18000, moderate: 14500 },
    infrastructureAtRisk: { bridges: 6, roads: 18, hospitals: 4 }
  },
  {
    id: 'ZONE-TERAI',
    name: 'Terai Southern Floodplain Corridor',
    locationCode: 'TERAI REGION',
    region: 'Nepal',
    riskLevel: 'CRITICAL',
    dangerScore: 84,
    expectedImpactMinutes: 90,
    elevationMeters: 120,
    primaryDrivers: [
      'Torrential river overflow from Chure Hills',
      'Flat agricultural land inundation',
      'Cross-border river backflow'
    ],
    coordinates: [
      [27.560, 84.220],
      [27.580, 84.480],
      [27.480, 84.520],
      [27.440, 84.280],
    ],
    affectedPopulation: { total: 62000, critical: 24000, high: 28000, moderate: 10000 },
    infrastructureAtRisk: { bridges: 8, roads: 24, hospitals: 3 }
  },
  {
    id: 'ZONE-POKHARA',
    name: 'Pokhara Seti River Gorge Basin',
    locationCode: 'POKHARA GANDAKI',
    region: 'Nepal',
    riskLevel: 'HIGH',
    dangerScore: 68,
    expectedImpactMinutes: 120,
    elevationMeters: 820,
    primaryDrivers: [
      'High rainfall intensity (94 mm/hr)',
      'Seti gorge rapid water elevation surge',
      'Glacial stream melt contribution'
    ],
    coordinates: [
      [28.235, 83.940],
      [28.250, 84.020],
      [28.180, 84.040],
      [28.165, 83.960],
    ],
    affectedPopulation: { total: 28000, critical: 6400, high: 11200, moderate: 10400 },
    infrastructureAtRisk: { bridges: 4, roads: 12, hospitals: 2 }
  },
  {
    id: 'ZONE-KOSHI',
    name: 'Koshi River East Basin',
    locationCode: 'KOSHI REGION',
    region: 'Nepal',
    riskLevel: 'CRITICAL',
    dangerScore: 81,
    expectedImpactMinutes: 40,
    elevationMeters: 95,
    primaryDrivers: [
      'Saptakoshi river discharge (280,000 cusec)',
      'Siltation & riverbed elevation',
      'Embankment vulnerability'
    ],
    coordinates: [
      [26.880, 87.050],
      [26.910, 87.250],
      [26.790, 87.310],
      [26.750, 87.120],
    ],
    affectedPopulation: { total: 78000, critical: 31000, high: 32000, moderate: 15000 },
    infrastructureAtRisk: { bridges: 5, roads: 16, hospitals: 2 }
  },
  {
    id: 'ZONE-KARNALI',
    name: 'Karnali West Basin Corridor',
    locationCode: 'KARNALI REGION',
    region: 'Nepal',
    riskLevel: 'HIGH',
    dangerScore: 61,
    expectedImpactMinutes: 180,
    elevationMeters: 650,
    primaryDrivers: [
      'Continuous mountain rainfall',
      'Karnali river level rise (7.4m)',
      'Landslide river damming risk'
    ],
    coordinates: [
      [28.640, 81.480],
      [28.670, 81.680],
      [28.560, 81.720],
      [28.520, 81.520],
    ],
    affectedPopulation: { total: 19500, critical: 3800, high: 8700, moderate: 7000 },
    infrastructureAtRisk: { bridges: 3, roads: 9, hospitals: 1 }
  }
];

// Weather Location Points with Icons & Live Metrics
export const weatherLocationPoints: WeatherLocationPoint[] = [
  // NEPAL LOCATIONS
  {
    id: 'W-KTM',
    name: 'Kathmandu Valley Basin',
    region: 'Nepal',
    lat: 27.7172,
    lng: 85.3240,
    weatherSymbol: '🌧️',
    weatherCondition: 'Heavy Monsoon Rain',
    rainfall: 68,
    tempC: 22,
    humidityPct: 88,
    windKmH: 24,
    riverLevelM: 4.6,
    soilSaturationPct: 86,
    currentRiskPct: 72,
    predictedRiskPct: 78,
    predictionTimeLabel: 'Next 6-24 Hours'
  },
  {
    id: 'W-TERAI',
    name: 'Terai Floodplain Basin',
    region: 'Nepal',
    lat: 27.5291,
    lng: 84.3542,
    weatherSymbol: '🌧️',
    weatherCondition: 'Torrential Precipitation',
    rainfall: 84,
    tempC: 27,
    humidityPct: 92,
    windKmH: 31,
    riverLevelM: 5.8,
    soilSaturationPct: 94,
    currentRiskPct: 81,
    predictedRiskPct: 88,
    predictionTimeLabel: 'Next 3-12 Hours'
  },
  {
    id: 'W-POKHARA',
    name: 'Pokhara Gandaki Gorge',
    region: 'Nepal',
    lat: 28.2096,
    lng: 83.9856,
    weatherSymbol: '⛈️',
    weatherCondition: 'Severe Thunderstorm',
    rainfall: 92,
    tempC: 20,
    humidityPct: 85,
    windKmH: 42,
    riverLevelM: 4.1,
    soilSaturationPct: 82,
    currentRiskPct: 65,
    predictedRiskPct: 72,
    predictionTimeLabel: 'Next 6-18 Hours'
  },
  {
    id: 'W-KOSHI',
    name: 'Koshi Saptakoshi Basin',
    region: 'Nepal',
    lat: 26.8378,
    lng: 87.1638,
    weatherSymbol: '🌊',
    weatherCondition: 'River Overtopping Alert',
    rainfall: 76,
    tempC: 26,
    humidityPct: 90,
    windKmH: 28,
    riverLevelM: 6.2,
    soilSaturationPct: 96,
    currentRiskPct: 83,
    predictedRiskPct: 91,
    predictionTimeLabel: 'Next 2-8 Hours'
  },
  {
    id: 'W-KARNALI',
    name: 'Karnali River Corridor',
    region: 'Nepal',
    lat: 28.6010,
    lng: 81.6094,
    weatherSymbol: '⚠️',
    weatherCondition: 'Landslide & River Swell',
    rainfall: 54,
    tempC: 19,
    humidityPct: 82,
    windKmH: 20,
    riverLevelM: 4.8,
    soilSaturationPct: 78,
    currentRiskPct: 58,
    predictedRiskPct: 65,
    predictionTimeLabel: 'Next 12-24 Hours'
  },

  // TIRUPATI HILLS LOCATIONS
  {
    id: 'W-TIRUMALA',
    name: 'Tirumala Ridge Station',
    region: 'Tirupati',
    lat: 13.670,
    lng: 79.400,
    weatherSymbol: '🌧️',
    weatherCondition: 'Monsoon Downpour',
    rainfall: 65,
    tempC: 24,
    humidityPct: 84,
    windKmH: 38,
    riverLevelM: 3.4,
    soilSaturationPct: 78,
    currentRiskPct: 74,
    predictedRiskPct: 82,
    predictionTimeLabel: 'Next 2-6 Hours'
  },
  {
    id: 'W-RENIGUNTA',
    name: 'Renigunta Basin Gauge',
    region: 'Tirupati',
    lat: 13.635,
    lng: 79.480,
    weatherSymbol: '🌊',
    weatherCondition: 'River Crest Elevation',
    rainfall: 48,
    tempC: 28,
    humidityPct: 78,
    windKmH: 22,
    riverLevelM: 3.2,
    soilSaturationPct: 72,
    currentRiskPct: 56,
    predictedRiskPct: 64,
    predictionTimeLabel: 'Next 4-12 Hours'
  }
];

// Historical Flood Hotspots Dataset Layer
export const historicalFloodHotspots: HistoricalFloodHotspot[] = [
  {
    id: 'HOT-NEPAL-KOSHI',
    name: 'Koshi Saptakoshi Breach Zone',
    region: 'Nepal',
    lat: 26.845,
    lng: 87.140,
    eventsCount: 28,
    frequencyLabel: 'High Frequency (Every 1-2 years)',
    mostAffectedMonths: 'July – August (Monsoon Peak)',
    severityLabel: 'Severe Inundation & Embankment Breach',
    majorEvents: [
      '2024 Nepal Monsoon Outburst (180+ casualties)',
      '2008 Saptakoshi Embankment Breach (50,000+ displaced)',
      '2017 Eastern Terai Mega Flood'
    ]
  },
  {
    id: 'HOT-NEPAL-KTM',
    name: 'Bagmati Basin (Kathmandu Urban)',
    region: 'Nepal',
    lat: 27.695,
    lng: 85.335,
    eventsCount: 19,
    frequencyLabel: 'Moderate-High Frequency (Every 2-3 years)',
    mostAffectedMonths: 'August – September',
    severityLabel: 'Urban Flash Flood & River Overtopping',
    majorEvents: [
      'September 2024 Record Kathmandu Rainfall (240mm/24h)',
      '2021 Kathmandu Valley Inundation',
      '2002 Matatirtha Landslide & Hydro Outburst'
    ]
  },
  {
    id: 'HOT-NEPAL-POKHARA',
    name: 'Seti River Gorge Outburst Zone',
    region: 'Nepal',
    lat: 28.240,
    lng: 83.975,
    eventsCount: 14,
    frequencyLabel: 'Periodic Glacial & Debris Surge',
    mostAffectedMonths: 'May & July',
    severityLabel: 'Debris Flow & Rapid Flash Surge',
    majorEvents: [
      '2012 Seti River Flash Flood Surge (70+ casualties)',
      '2019 Annapurna Debris Outburst'
    ]
  },
  {
    id: 'HOT-NEPAL-TERAI',
    name: 'Rapti River Chitwan Floodplain',
    region: 'Nepal',
    lat: 27.510,
    lng: 84.380,
    eventsCount: 22,
    frequencyLabel: 'High Frequency (Annual Monsoon)',
    mostAffectedMonths: 'July – August',
    severityLabel: 'Lowland Agricultural Inundation',
    majorEvents: [
      '2017 Terai Basin Flood (1.7M people affected)',
      '2021 Rapti Overflow Event'
    ]
  },
  {
    id: 'HOT-TIRUPATI-SWARNA',
    name: 'Swarnamukhi River Tirupati Channel',
    region: 'Tirupati',
    lat: 13.642,
    lng: 79.445,
    eventsCount: 16,
    frequencyLabel: 'Cyclonic Monsoon Surge (Every 3-4 years)',
    mostAffectedMonths: 'November – December (Northeast Monsoon)',
    severityLabel: 'Valley Channel Overflow & Highway Inundation',
    majorEvents: [
      'November 2021 Tirupati Flash Flood Crisis',
      '2015 Swarnamukhi River Overtopping'
    ]
  }
];

export const waterFlowPaths: { id: string; name: string; waypoints: [number, number][] }[] = [
  {
    id: 'FLOW-NEPAL-1',
    name: 'Bagmati River Drainage Flow (Kathmandu Valley)',
    waypoints: [
      [27.745, 85.350],
      [27.715, 85.325],
      [27.670, 85.300]
    ]
  },
  {
    id: 'FLOW-NEPAL-2',
    name: 'Saptakoshi River Discharge Channel',
    waypoints: [
      [26.920, 87.180],
      [26.840, 87.150],
      [26.760, 87.120]
    ]
  },
  {
    id: 'FLOW-1',
    name: 'Tirumala Ridge -> Foothills Torrent',
    waypoints: [
      [13.678, 79.400],
      [13.665, 79.412],
      [13.655, 79.422]
    ]
  }
];
