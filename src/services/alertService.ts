import { WarningAlert, RiverGaugeStation } from '../types';
import { formatTimestamp } from '../utils/dataValidation';

export function evaluateOfficialWarnings(
  riverStations: RiverGaugeStation[], 
  locationName: string, 
  calculatedRiskScore: number
): WarningAlert {
  // Check if any DHM river station in target district is above warning or danger
  const criticalStation = riverStations.find(s => 
    s.district.toLowerCase().includes(locationName.toLowerCase()) || 
    locationName.toLowerCase().includes(s.district.toLowerCase())
  ) || riverStations.find(s => s.status === 'ABOVE_DANGER' || s.status === 'RAPIDLY_RISING');

  if (criticalStation && (criticalStation.status === 'ABOVE_DANGER' || criticalStation.status === 'RAPIDLY_RISING' || criticalStation.status === 'ABOVE_WARNING')) {
    const isCritical = criticalStation.status === 'ABOVE_DANGER' || criticalStation.status === 'RAPIDLY_RISING';

    return {
      id: `DHM-OFFICIAL-${Date.now()}`,
      timestamp: formatTimestamp(),
      level: isCritical ? 'CRITICAL' : 'WARNING',
      targetZone: `${criticalStation.district} (${criticalStation.riverName})`,
      currentRiskPct: Math.round((criticalStation.waterLevelMeters / criticalStation.dangerLevelMeters) * 100),
      projectedRiskPct: Math.min(99, Math.round((criticalStation.waterLevelMeters / criticalStation.dangerLevelMeters) * 110)),
      escalationMinutes: Math.max(15, Math.round(45 - criticalStation.rateOfChangeMetersPerHr * 100)),
      recommendedAction: `OFFICIAL DHM NOTICE: Water level at ${criticalStation.stationName} is ${criticalStation.waterLevelMeters}m (${criticalStation.status.replace('_', ' ')}). Move to high ground immediately.`,
      isOfficialDHM: true,
      officialSource: 'Nepal Department of Hydrology and Meteorology (DHM)',
      dispatchStatus: 'READY'
    };
  }

  // Model-based alert if no active official DHM emergency notice
  let level: WarningAlert['level'] = 'WATCH';
  if (calculatedRiskScore >= 90) level = 'CRITICAL';
  else if (calculatedRiskScore >= 75) level = 'EVACUATE NOW';
  else if (calculatedRiskScore >= 60) level = 'WARNING';

  return {
    id: `MODEL-ALERT-${Date.now()}`,
    timestamp: formatTimestamp(),
    level,
    targetZone: locationName,
    currentRiskPct: Math.round(calculatedRiskScore * 0.7),
    projectedRiskPct: calculatedRiskScore,
    escalationMinutes: Math.max(15, Math.round(75 - calculatedRiskScore * 0.5)),
    recommendedAction: calculatedRiskScore >= 75 
      ? 'High flood probability detected by Data-Fusion Risk Engine. Pre-position response units and prepare low-lying zone evacuation.'
      : 'Maintain active monitoring of river stream levels and drainage channels.',
    isOfficialDHM: false,
    dispatchStatus: 'SIMULATION / PREVIEW'
  };
}
