import { WeatherSymbolIcon } from '../types';

export interface WeatherConditionResult {
  symbol: WeatherSymbolIcon;
  conditionLabel: string;
}

export function getWeatherConditionFromWmoCode(
  wmoCode: number, 
  precipitationMmHr: number = 0, 
  windSpeedKmH: number = 0
): WeatherConditionResult {
  if (wmoCode >= 95) {
    return { symbol: '⛈️', conditionLabel: 'Thunderstorm Heavy Surge' };
  }
  if (wmoCode >= 80 || precipitationMmHr > 20) {
    return { symbol: '🌧️', conditionLabel: 'Torrential Rain Showers' };
  }
  if (wmoCode >= 61 || precipitationMmHr > 8) {
    return { symbol: '🌧️', conditionLabel: 'Heavy Rain' };
  }
  if (wmoCode >= 51 || precipitationMmHr > 1) {
    return { symbol: '🌧️', conditionLabel: 'Moderate Rain' };
  }
  if (wmoCode >= 71) {
    return { symbol: '🌨️', conditionLabel: 'Snowfall / Glacier Runoff' };
  }
  if (windSpeedKmH > 35) {
    return { symbol: '💨', conditionLabel: 'High Wind Gales' };
  }
  if (wmoCode <= 1) {
    return { symbol: '☀️', conditionLabel: 'Clear Sky' };
  }
  if (wmoCode <= 3) {
    return { symbol: '🌤️', conditionLabel: 'Partly Cloudy' };
  }
  return { symbol: '☁️', conditionLabel: 'Overcast Sky' };
}
