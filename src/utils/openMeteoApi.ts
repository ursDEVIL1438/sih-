import { fetchOpenMeteoRealTimeData, LiveWeatherData } from '../services/weatherService';

export type { LiveWeatherData as OpenMeteoWeatherData };

export async function fetchLiveWeatherOpenMeteo(lat: number, lng: number): Promise<LiveWeatherData | null> {
  return await fetchOpenMeteoRealTimeData(lat, lng);
}
