import express from 'express';

const router = express.Router();

// Mock telemetry generator
const getBaselineTelemetry = () => ({
  rainfall: 72,
  riverLevel: 3.8,
  soilSaturation: 81,
  floodProbability: 87,
  riskLevel: 'CRITICAL',
  timeToImpactMinutes: 28,
  region: 'Tirupati Hills',
  dataStatus: 'SIMULATED / DEMO',
  updatedAt: new Date().toISOString()
});

router.get('/weather', (req, res) => {
  res.json({
    source: 'India Meteorological Department (IMD) Adapter',
    status: 'API',
    temperatureC: 24.2,
    humidityPct: 92,
    rainfallMmHr: 72,
    windKmH: 38,
    pressureHpa: 1004,
    forecast: [
      { time: '15:00', rain: 78 },
      { time: '16:00', rain: 84 },
      { time: '17:00', rain: 60 }
    ]
  });
});

router.get('/prediction', (req, res) => {
  res.json({
    model: 'Ensemble Hydro v1.0',
    floodProbability: 87,
    riskLevel: 'CRITICAL',
    timeToImpactMinutes: 28,
    confidencePct: 89,
    uncertaintyPct: 8,
    shapWeights: [
      { feature: 'Rainfall Intensity', contributionPct: 31 },
      { feature: 'Soil Saturation', contributionPct: 22 },
      { feature: 'River Level', contributionPct: 18 }
    ]
  });
});

router.get('/sensors', (req, res) => {
  res.json([
    { id: 'RG-104', type: 'RAIN_GAUGE', value: 72, unit: 'mm/hr', status: 'HEALTHY' },
    { id: 'RV-22', type: 'RIVER_LEVEL', value: 3.8, unit: 'm', status: 'HEALTHY' },
    { id: 'SM-809', type: 'SOIL_MOISTURE', value: 81, unit: '%', status: 'HEALTHY' }
  ]);
});

router.get('/evacuation', (req, res) => {
  res.json({
    recommendedRoute: 'Route 1: Downstream Village -> High Shelter S4',
    distanceKm: 3.4,
    etaMinutes: 14,
    status: 'SAFE',
    recommendedShelter: 'High Ground Shelter S4',
    availableCapacityPct: 68
  });
});

router.get('/export', (req, res) => {
  const format = req.query.format || 'json';
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    return res.send('Metric,Value\nRainfall,72 mm/hr\nSoil Saturation,81%\nRiver Level,3.8m\nFlood Risk,87% (CRITICAL)\nTime To Impact,28 MIN');
  }
  res.json({
    report: 'JALDRISHTI X INCIDENT REPORT',
    generatedAt: new Date().toISOString(),
    telemetry: getBaselineTelemetry()
  });
});

export default router;
