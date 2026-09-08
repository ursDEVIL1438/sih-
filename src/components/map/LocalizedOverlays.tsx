import React, { useEffect, useState } from 'react';

type WeatherPoint = any;
type RiskZone = any;

const CLOUD_THRESHOLD = 25; // minimum risk pct to show cloud
const WAVE_RISK_LEVELS = new Set(['HIGH', 'VERY HIGH', 'CRITICAL']);

function polygonCentroid(coords: [number, number][]) {
  // coords: array of [lat, lng] or array of rings [[lat,lng], ...]
  if (!coords || coords.length === 0) return null;
  // unwrap if coordinates is an array of rings (common in GeoJSON polygons)
  let ring: any = coords;
  if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
    ring = coords[0];
  }
  if (!ring || ring.length === 0) return null;
  let area = 0;
  let cx = 0;
  let cy = 0;
  const pts = ring.map((c: any) => ({ x: Number(c[1]), y: Number(c[0]) })); // x=lng, y=lat
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    const a = p0.x * p1.y - p1.x * p0.y;
    area += a;
    cx += (p0.x + p1.x) * a;
    cy += (p0.y + p1.y) * a;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-9) {
    // fallback to simple average on ring
    const avgLat = ring.reduce((s: number, c: any) => s + Number(c[0] || 0), 0) / ring.length;
    const avgLng = ring.reduce((s: number, c: any) => s + Number(c[1] || 0), 0) / ring.length;
    if (!isFinite(avgLat) || !isFinite(avgLng)) return null;
    return { lat: avgLat, lng: avgLng };
  }
  cx = cx / (6 * area);
  cy = cy / (6 * area);
  if (!isFinite(cy) || !isFinite(cx)) return null;
  return { lat: cy, lng: cx };
}

export const LocalizedOverlays: React.FC<{ activeWeatherPoints: WeatherPoint[]; activeRiskZones: RiskZone[]; layers: any }> = ({ activeWeatherPoints, activeRiskZones, layers }) => {
  const [waves, setWaves] = useState<any[]>([]);

  // compute positions using global leaflet map instance set by ChangeView
  const compute = () => {
    const map = (window as any).leafletMap;
    // ensure Leaflet map container is ready
    if (!map || typeof map.latLngToContainerPoint !== 'function' || !map.getContainer) return;
    const container = map.getContainer && map.getContainer();
    if (!container) return;
    const newWaves: any[] = [];

    // clouds are rendered by the WebGL layer (ModernTerrainMap) — we only render flood waves here

    if (layers.riskPolygons) {
      activeRiskZones.forEach((z) => {
        try {
          if (!WAVE_RISK_LEVELS.has(z.riskLevel)) return;
          const centroid = polygonCentroid(z.coordinates || []);
          if (!centroid) return;
          const lat = Number(centroid.lat);
          const lng = Number(centroid.lng);
          if (!isFinite(lat) || !isFinite(lng)) return;
          // use Leaflet's latLng conversion defensively
          let p: any = null;
          try {
            p = map.latLngToContainerPoint([lat, lng]);
          } catch (e) {
            // skip invalid conversions
            return;
          }
        // multiple waves proportional to dangerScore
        const count = Math.min(4, Math.max(1, Math.ceil((z.dangerScore || 40) / 30)));
        for (let i = 0; i < count; i++) {
          const offsetX = (i - (count - 1) / 2) * 18;
            const width = 120 + (z.dangerScore || 30) * 1.2 + i * 22;
            const delay = i * 1.2 + Math.random() * 1.2;
            newWaves.push({ id: `${z.id}_${i}`, x: p.x + offsetX, y: p.y + 8 + i * 6, width, delay });
        }
        } catch (err) {
          // protect against any unexpected overlay data issues
          console.warn('LocalizedOverlays compute skipped a zone due to error', err);
          return;
        }
      });
    }

    setWaves(newWaves);
  };

  useEffect(() => {
    compute();
    const map = (window as any).leafletMap;
    if (!map) return;
    map.on('move', compute);
    map.on('zoom', compute);
    window.addEventListener('resize', compute);
    return () => {
      try { map.off('move', compute); map.off('zoom', compute); } catch (e) {}
      window.removeEventListener('resize', compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWeatherPoints, activeRiskZones, layers]);

  return (
    <>
      {waves.map((w) => (
        <div
          key={w.id}
          className={`flood-wave`}
          style={{ position: 'absolute', left: w.x - w.width / 2, top: w.y, width: w.width, height: 80, opacity: 0.28, animationDelay: `${w.delay}s` }}
        />
      ))}
    </>
  );
};

export default LocalizedOverlays;
