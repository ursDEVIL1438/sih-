import { RiverGaugeStation } from '../types';
import { formatTimestamp } from '../utils/dataValidation';

export const INITIAL_RIVER_STATIONS: RiverGaugeStation[] = [
  {
    id: 'STN-BGM-01',
    stationName: 'Khokana River Station',
    riverName: 'Bagmati River',
    district: 'Kathmandu Valley',
    region: 'Nepal',
    lat: 27.6320,
    lng: 85.2950,
    waterLevelMeters: 3.42,
    warningLevelMeters: 4.00,
    dangerLevelMeters: 4.80,
    status: 'WARNING_RISING',
    trend: 'RISING',
    rateOfChangeMetersPerHr: 0.18,
    lastUpdated: formatTimestamp(),
    source: 'Nepal DHM'
  },
  {
    id: 'STN-KOS-02',
    stationName: 'Chatara Hydrological Station',
    riverName: 'Saptakoshi River',
    district: 'Sunsari / Koshi',
    region: 'Nepal',
    lat: 26.8710,
    lng: 87.1550,
    waterLevelMeters: 6.85,
    warningLevelMeters: 6.00,
    dangerLevelMeters: 7.20,
    status: 'ABOVE_WARNING',
    trend: 'RISING',
    rateOfChangeMetersPerHr: 0.24,
    lastUpdated: formatTimestamp(),
    source: 'Nepal DHM'
  },
  {
    id: 'STN-SET-03',
    stationName: 'Phulbari Gorge Station',
    riverName: 'Seti River',
    district: 'Pokhara / Gandaki',
    region: 'Nepal',
    lat: 28.2310,
    lng: 83.9920,
    waterLevelMeters: 2.95,
    warningLevelMeters: 3.50,
    dangerLevelMeters: 4.20,
    status: 'SAFE',
    trend: 'STEADY',
    rateOfChangeMetersPerHr: 0.02,
    lastUpdated: formatTimestamp(),
    source: 'Nepal DHM'
  },
  {
    id: 'STN-KRN-04',
    stationName: 'Asaraghat Station',
    riverName: 'Karnali River',
    district: 'Surkhet / Karnali',
    region: 'Nepal',
    lat: 28.7520,
    lng: 81.4280,
    waterLevelMeters: 8.10,
    warningLevelMeters: 9.00,
    dangerLevelMeters: 10.00,
    status: 'SAFE',
    trend: 'FALLING',
    rateOfChangeMetersPerHr: -0.05,
    lastUpdated: formatTimestamp(),
    source: 'Nepal DHM'
  },
  {
    id: 'STN-NAR-05',
    stationName: 'Devghat Hydro Station',
    riverName: 'Narayani River',
    district: 'Chitwan',
    region: 'Nepal',
    lat: 27.7120,
    lng: 84.4250,
    waterLevelMeters: 7.45,
    warningLevelMeters: 7.30,
    dangerLevelMeters: 8.40,
    status: 'ABOVE_WARNING',
    trend: 'RISING',
    rateOfChangeMetersPerHr: 0.15,
    lastUpdated: formatTimestamp(),
    source: 'Nepal DHM'
  },
  {
    id: 'STN-SWR-06',
    stationName: 'Karakambadi Causeway Station',
    riverName: 'Swarnamukhi River',
    district: 'Tirupati',
    region: 'Tirupati',
    lat: 13.6510,
    lng: 79.4420,
    waterLevelMeters: 2.10,
    warningLevelMeters: 2.50,
    dangerLevelMeters: 3.20,
    status: 'SAFE',
    trend: 'STEADY',
    rateOfChangeMetersPerHr: 0.01,
    lastUpdated: formatTimestamp(),
    source: 'Nepal DHM'
  }
];

export async function fetchNepalDHMHydrologyData(): Promise<RiverGaugeStation[]> {
  try {
    // In live system, fetch official machine-readable endpoint from DHM if available.
    // Clean adapter layer normalizing river gauge station measurements.
    const stations = INITIAL_RIVER_STATIONS.map((stn) => {
      const isAboveDanger = stn.waterLevelMeters >= stn.dangerLevelMeters;
      const isAboveWarning = stn.waterLevelMeters >= stn.warningLevelMeters;
      const isRising = stn.rateOfChangeMetersPerHr > 0.05;
      const isRapid = stn.rateOfChangeMetersPerHr > 0.20;

      let status: RiverGaugeStation['status'] = 'SAFE';
      if (isAboveDanger && isRapid) status = 'RAPIDLY_RISING';
      else if (isAboveDanger) status = 'ABOVE_DANGER';
      else if (isAboveWarning) status = 'ABOVE_WARNING';
      else if (isRising) status = 'WARNING_RISING';

      return {
        ...stn,
        status,
        lastUpdated: formatTimestamp()
      };
    });

    return stations;
  } catch (err) {
    console.warn('Nepal DHM Hydrology Adapter connection error:', err);
    return INITIAL_RIVER_STATIONS;
  }
}
