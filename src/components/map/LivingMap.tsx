import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation } from '../../context/SimulationContext';
import { 
  terrainRiskZones, 
  waterFlowPaths, 
  weatherLocationPoints, 
  historicalFloodHotspots, 
  TerrainZoneFeature 
} from '../../data/terrainGeoJSON';
import { PolygonDetailsModal } from '../prediction/PolygonDetailsModal';
import { WaterFlowArrows } from './WaterFlowArrows';
import { 
  Activity, 
  ShieldAlert, 
  MapPin, 
  Layers, 
  Navigation as NavIcon, 
  Home, 
  AlertTriangle,
  CloudRain,
  Droplets,
  Mountain,
  Waves,
  History,
  Info,
  Thermometer,
  Wind
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

const createWeatherSymbolIcon = (symbol: string, color: string) => {
  return L.divIcon({
    className: 'weather-symbol-leaflet-marker',
    html: `
      <div style="
        padding: 3px 7px;
        background: rgba(5, 11, 20, 0.92);
        border: 2px solid ${color};
        box-shadow: 0 0 12px ${color}80;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 3px;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
        color: #FFFFFF;
        white-space: nowrap;
      ">
        <span style="font-size: 15px;">${symbol}</span>
      </div>
    `,
    iconSize: [42, 26],
    iconAnchor: [21, 13],
  });
};

const historicalHotspotIcon = L.divIcon({
  className: 'historical-hotspot-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: rgba(185, 28, 28, 0.9);
      border: 2px solid #EF4444;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
    ">🔴</div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map Recenter Controller & Leaflet API Access Provider
const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    (window as any).leafletMap = map;
    const scaleControl = L.control.scale({ imperial: false, position: 'bottomleft' });
    scaleControl.addTo(map);
    return () => {
      scaleControl.remove();
    };
  }, [center, map]);
  return null;
};

export const LivingMap: React.FC = () => {
  const { state, intel, setFutureOffsetHours, evacuationRoute, showHistoricalHotspots, toggleHistoricalHotspots } = useSimulation();

  const isNepalRegion = state.selectedRegion.toLowerCase().includes('nepal');
  const center: [number, number] = isNepalRegion ? [27.7172, 85.3240] : [13.645, 79.425];

  const [baseMapStyle, setBaseMapStyle] = useState<'DARK_OSM' | 'SATELLITE' | 'TERRAIN'>('DARK_OSM');
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [selectedPolygonZone, setSelectedPolygonZone] = useState<TerrainZoneFeature | null>(null);

  // 15 Independent GIS Layers
  const [layers, setLayers] = useState({
    terrain: true,
    rainfall: true,
    river: true,
    soil: true,
    riskPolygons: true,
    weatherSymbols: true,
    historicalHotspots: true,
    waterFlow: true,
    population: true,
    roads: true,
    bridges: true,
    hospitals: true,
    shelters: true,
    evacuation: true,
    satellite: false,
  });

  const tileServers = {
    DARK_OSM: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors | JALDRISHTI GIS Engine',
      className: 'brightness-[0.6] contrast-[1.4] invert-[0.9] hue-rotate-[180deg]'
    },
    TERRAIN: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap | DEM Elevation Topography',
      className: 'brightness-[0.8] contrast-[1.2]'
    },
    SATELLITE: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri World Imagery Earth Observation',
      className: ''
    }
  };

  const tileConfig = tileServers[baseMapStyle];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'VERY HIGH': return '#F97316';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  const evacuationRoutes = [
    {
      id: evacuationRoute.id,
      name: evacuationRoute.name,
      waypoints: evacuationRoute.waypoints,
      status: evacuationRoute.roadStatus,
      etaMinutes: evacuationRoute.etaMinutes
    }
  ];

  // Filter risk zones based on active selected region
  const activeRiskZones = terrainRiskZones.filter(z => 
    isNepalRegion ? z.region === 'Nepal' : z.region === 'Tirupati'
  );

  const activeWeatherPoints = weatherLocationPoints.filter(w =>
    isNepalRegion ? w.region === 'Nepal' : w.region === 'Tirupati'
  );

  const activeHotspots = historicalFloodHotspots.filter(h =>
    isNepalRegion ? h.region === 'Nepal' : h.region === 'Tirupati'
  );

  return (
    <div className="relative w-full h-full min-h-[360px] bg-[#050B14] rounded-xl overflow-hidden border border-cyan-500/20 shadow-glass select-none font-mono">
      {/* Top-Right Forecast Scrubber Panel */}
      <div className="absolute top-3 right-3 z-[1000] bg-dark-900/95 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 font-mono text-xs shadow-cyan-glow flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase">FORECAST TIME:</span>
        <div className="flex items-center gap-1">
          {[
            { label: 'NOW', hours: 0 },
            { label: '+6H', hours: 6 },
            { label: '+12H', hours: 12 },
            { label: '+24H', hours: 24 },
            { label: '+48H', hours: 48 },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => setFutureOffsetHours(t.hours)}
              className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all ${
                state.futureOffsetHours === t.hours
                  ? 'bg-cyan-500 text-dark-950 shadow-cyan-glow'
                  : 'bg-dark-950 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top-Left Layer Control Panel Toggle */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-dark-900/95 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 shadow-glass flex items-center gap-2">
          <button
            onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>GIS LAYERS ({Object.values(layers).filter(Boolean).length})</span>
          </button>

          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
            {(['DARK_OSM', 'TERRAIN', 'SATELLITE'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setBaseMapStyle(style)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  baseMapStyle === style
                    ? 'bg-cyan-500 text-dark-950 shadow-cyan-glow'
                    : 'bg-dark-950 text-slate-400 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* 15 Layer Controls Modal Dropdown */}
        {isLayerPanelOpen && (
          <div className="bg-dark-900/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/30 shadow-cyan-glow space-y-2 text-xs w-64 max-h-[350px] overflow-y-auto">
            <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1.5 flex items-center justify-between text-[11px]">
              <span>ACTIVE SPATIAL OVERLAYS</span>
              <span className="text-[9px] text-slate-400">NO CIRCLES ENFORCED</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px]">
              {Object.entries({
                weatherSymbols: '🌧️ Weather Condition Symbols',
                riskPolygons: '📐 Terrain Flood Risk Polygons',
                historicalHotspots: '🔴 Historical Flood Hotspots Layer',
                river: '🌊 Main River Stream Hydro Channel',
                waterFlow: '➔ Water Flow Velocity Vectors',
                rainfall: '🌧️ Precipitation Accumulation Radar',
                soil: '💧 Soil Saturation Grid',
                evacuation: '🏃 Evacuation Routes & Shelters',
                bridges: '🌉 Infrastructure & Bridges',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between p-1.5 rounded hover:bg-dark-800 cursor-pointer">
                  <span className="text-slate-200 text-[11px]">{label}</span>
                  <input
                    type="checkbox"
                    checked={layers[key as keyof typeof layers]}
                    onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Animated Weather & Flood Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[400] overflow-hidden">
        <div className="cloud-cloud cloud-1">☁️</div>
        <div className="cloud-cloud cloud-2">☁️</div>
        <div className="cloud-cloud cloud-3">☁️</div>
        <div className="flood-wave flood-wave-1" />
        <div className="flood-wave flood-wave-2" />
        <div className="flood-wave flood-wave-3" />
      </div>

      {/* Bottom Disclaimer Banner */}
      <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-dark-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/30 text-[10px] text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>DISCLAIMER:</strong> Flood predictions are probabilistic estimates based on available weather, terrain, hydrological and historical data. They should not replace official emergency warnings.
          </span>
        </div>
        <span className="text-slate-400 font-bold shrink-0 hidden sm:inline">PROBABILISTIC MODEL ESTIMATE</span>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={center}
        zoom={isNepalRegion ? 9 : 13}
        className={`w-full h-full ${tileConfig.className}`}
        zoomControl={false}
      >
        <ChangeView center={center} />
        
        {/* Base Tile Layer (Keyless OpenStreetMap / ESRI / OpenTopoMap) */}
        <TileLayer
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={19}
        />

        {/* ORGANIC TERRAIN-AWARE GEOJSON RISK POLYGONS (NO CIRCLES!) */}
        {layers.riskPolygons && activeRiskZones.map((zone) => {
          const color = getRiskColor(zone.riskLevel);
          const isSelected = selectedPolygonZone?.id === zone.id;

          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: isSelected ? '#00F0FF' : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.65 : 0.35 + (zone.dangerScore / 100) * 0.25,
                weight: isSelected ? 3.5 : 2,
                dashArray: zone.riskLevel === 'CRITICAL' ? '6, 6' : undefined,
              }}
              eventHandlers={{
                click: () => setSelectedPolygonZone(zone)
              }}
            />
          );
        })}

        {/* LIVE WEATHER SYMBOL MARKERS (Directly on affected locations) */}
        {layers.weatherSymbols && activeWeatherPoints.map((w) => {
          const liveRain = Math.round(state.rainfall * (w.currentRiskPct / 75));
          const liveRisk = Math.min(99, Math.round((state.rainfall / 65) * w.predictedRiskPct));
          const color = getRiskColor(w.currentRiskPct >= 75 ? 'CRITICAL' : w.currentRiskPct >= 60 ? 'HIGH' : 'MODERATE');

          return (
            <Marker 
              key={w.id} 
              position={[w.lat, w.lng]} 
              icon={createWeatherSymbolIcon(w.weatherSymbol, color)}
            >
              <Popup>
                <div className="p-1 font-mono text-xs space-y-1.5 w-60">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                      <span className="text-base">{w.weatherSymbol}</span>
                      <span>{w.name}</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {w.region}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-200">
                    Condition: <strong className="text-cyan-300">{w.weatherCondition}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10.5px] bg-dark-900 p-2 rounded border border-slate-800">
                    <div>Rainfall: <strong className="text-white">{liveRain} mm/hr</strong></div>
                    <div>Temp: <strong className="text-amber-400">{w.tempC} °C</strong></div>
                    <div>Humidity: <strong className="text-emerald-400">{w.humidityPct}%</strong></div>
                    <div>Wind: <strong className="text-blue-400">{w.windKmH} km/h</strong></div>
                    <div>River Level: <strong className="text-cyan-400">{w.riverLevelM} m</strong></div>
                    <div>Soil Moist: <strong className="text-emerald-300">{w.soilSaturationPct}%</strong></div>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-slate-800">
                    <span>Current Risk: <strong style={{ color }}>{w.currentRiskPct}%</strong></span>
                    <span>Predicted Risk: <strong className="text-red-400">{liveRisk}%</strong></span>
                  </div>

                  <div className="text-[9.5px] text-slate-400 text-right">
                    Time Horizon: {w.predictionTimeLabel}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* HISTORICAL FLOOD HOTSPOTS LAYER (🔴 Markers) */}
        {layers.historicalHotspots && activeHotspots.map((hot) => (
          <Marker 
            key={hot.id} 
            position={[hot.lat, hot.lng]} 
            icon={historicalHotspotIcon}
          >
            <Popup>
              <div className="p-1.5 font-mono text-xs space-y-1.5 w-64">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                  <span className="font-bold text-red-400 flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    <span>{hot.name}</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                    HOTSPOT
                  </span>
                </div>

                <div className="text-[11px] space-y-1">
                  <div>Recorded Events: <strong className="text-white">{hot.eventsCount} Major Floods</strong></div>
                  <div>Frequency: <strong className="text-amber-300">{hot.frequencyLabel}</strong></div>
                  <div>Peak Months: <strong className="text-cyan-300">{hot.mostAffectedMonths}</strong></div>
                  <div>Severity: <strong className="text-red-300">{hot.severityLabel}</strong></div>
                </div>

                <div className="bg-dark-900 p-2 rounded border border-slate-800 text-[10px] space-y-1">
                  <span className="text-cyan-400 font-bold block">PAST MAJOR FLOOD EVENTS:</span>
                  {hot.majorEvents.map((ev, i) => (
                    <div key={i} className="text-slate-300 text-[9.5px] flex items-center gap-1">
                      <span className="text-red-400">▪</span> {ev}
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-slate-400 italic">
                  Note: Combined with live precipitation forecast to compute active flood risk score.
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Water Flow Velocity Vectors */}
        {layers.waterFlow && <WaterFlowArrows />}

        {/* Evacuation Routes */}
        {layers.evacuation && evacuationRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.waypoints}
            pathOptions={{
              color: route.status === 'CLOSED' ? '#EF4444' : route.status === 'WARNING' ? '#F59E0B' : '#22C55E',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.9
            }}
          />
        ))}
      </MapContainer>

      {/* Polygon Inspector Modal */}
      {selectedPolygonZone && (
        <PolygonDetailsModal
          zone={selectedPolygonZone}
          onClose={() => setSelectedPolygonZone(null)}
        />
      )}
    </div>
  );
};
