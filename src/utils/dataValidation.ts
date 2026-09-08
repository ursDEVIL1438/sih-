export function sanitizeNumber(value: any, fallback: number = 0, min: number = -Infinity, max: number = Infinity): number {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

export function validateCoordinates(lat: number, lng: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 &&
         typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
