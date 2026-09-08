import { WeatherSymbolIcon } from '../types';
import { getWeatherConditionFromWmoCode } from '../utils/weatherSymbols';
import { sanitizeNumber, formatTimestamp } from '../utils/dataValidation';

export interface HourlyForecastPoint {
  timeISO: string;
  hourOffset: number;
  precipitationMmHr: number;
  precipitationProbPct: number;
  temperatureC: number;
  humidityPct: number;
  windSpeedKmH: number;
  soilMoisturePct: number;
  surfaceRunoffMm: number;
  weatherCode: number;
  symbol: WeatherSymbolIcon;
  condition: string;
}

export interface LiveWeatherData {
  temperatureC: number;
  humidityPct: number;
  precipitationMmHr: number;
  rainMmHr: number;
  showersMmHr: number;
  windSpeedKmH: number;
  windGustsKmH: number;
  windDirectionDeg: number;
  surfacePressureHpa: number;
  weatherCode: number;
  weatherSymbol: WeatherSymbolIcon;
  weatherCondition: string;
  sourceAttribution: string;
  timestamp: string;
  isLive: boolean;
  hourlyForecast: HourlyForecastPoint[];
}

export async function fetchOpenMeteoRealTimeData(lat: number, lng: number): Promise<LiveWeatherData | null> {
  try {
    const currentParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'showers',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
      'wind_direction_10m',
      'surface_pressure'
    ].join(',');

    const hourlyParams = [
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'precipitation_probability',
      'weather_code',
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_gusts_10m',
      'soil_moisture_0_to_7cm'
    ].join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=${currentParams}&hourly=${hourlyParams}&forecast_days=3`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP Error ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    const temp = sanitizeNumber(current.temperature_2m, 20);
    const humidity = sanitizeNumber(current.relative_humidity_2m, 60);
    const precip = sanitizeNumber(current.precipitation, 0);
    const rain = sanitizeNumber(current.rain, 0);
    const showers = sanitizeNumber(current.showers, 0);
    const wind = sanitizeNumber(current.wind_speed_10m, 10);
    const gusts = sanitizeNumber(current.wind_gusts_10m, wind);
    const windDir = sanitizeNumber(current.wind_direction_10m, 0);
    const pressure = sanitizeNumber(current.surface_pressure, 1013);
    const code = sanitizeNumber(current.weather_code, 0);

    const { symbol, conditionLabel } = getWeatherConditionFromWmoCode(code, precip, wind);

    // Parse Hourly Forecast Array
    const times: string[] = hourly.time || [];
    const hourlyPoints: HourlyForecastPoint[] = [];

    const nowISO = new Date().toISOString().substring(0, 13);
    let startIndex = times.findIndex(t => t.startsWith(nowISO));
    if (startIndex < 0) startIndex = 0;

    for (let i = startIndex; i < Math.min(times.length, startIndex + 49); i += 1) {
      const hTime = times[i];
      const hourOffset = i - startIndex;
      const hPrecip = sanitizeNumber(hourly.precipitation?.[i], 0);
      const hProb = sanitizeNumber(hourly.precipitation_probability?.[i], 0);
      const hTemp = sanitizeNumber(hourly.temperature_2m?.[i], temp);
      const hHum = sanitizeNumber(hourly.relative_humidity_2m?.[i], humidity);
      const hWind = sanitizeNumber(hourly.wind_speed_10m?.[i], wind);
      const hSoilRaw = hourly.soil_moisture_0_to_7cm?.[i];
      const hSoilPct = hSoilRaw !== undefined ? Math.round(sanitizeNumber(hSoilRaw, 0.4, 0, 1) * 100) : 55;
      const hRunoff = sanitizeNumber(hourly.surface_runoff?.[i], 0);
      const hCode = sanitizeNumber(hourly.weather_code?.[i], 0);

      const hCondition = getWeatherConditionFromWmoCode(hCode, hPrecip, hWind);

      hourlyPoints.push({
        timeISO: hTime,
        hourOffset,
        precipitationMmHr: parseFloat(hPrecip.toFixed(1)),
        precipitationProbPct: Math.round(hProb),
        temperatureC: Math.round(hTemp),
        humidityPct: Math.round(hHum),
        windSpeedKmH: Math.round(hWind),
        soilMoisturePct: hSoilPct,
        surfaceRunoffMm: parseFloat(hRunoff.toFixed(2)),
        weatherCode: hCode,
        symbol: hCondition.symbol,
        condition: hCondition.conditionLabel
      });
    }

    return {
      temperatureC: Math.round(temp),
      humidityPct: Math.round(humidity),
      precipitationMmHr: parseFloat(precip.toFixed(1)),
      rainMmHr: parseFloat(rain.toFixed(1)),
      showersMmHr: parseFloat(showers.toFixed(1)),
      windSpeedKmH: Math.round(wind),
      windGustsKmH: Math.round(gusts),
      windDirectionDeg: Math.round(windDir),
      surfacePressureHpa: Math.round(pressure),
      weatherCode: code,
      weatherSymbol: symbol,
      weatherCondition: conditionLabel,
      sourceAttribution: 'Open-Meteo Global Meteorological API',
      timestamp: formatTimestamp(),
      isLive: true,
      hourlyForecast: hourlyPoints
    };
  } catch (err) {
    console.warn('Weather API connection failure:', err);
    // Explicitly return null when offline - ZERO FAKE DATA
    return null;
  }
}
