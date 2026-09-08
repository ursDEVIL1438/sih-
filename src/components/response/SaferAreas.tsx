import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldCheck, MapPin, Navigation, Radio } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export const SaferAreas: React.FC = () => {
  const { saferAreas, state } = useSimulation();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; isLiveGPS: boolean }>({
    lat: state.lat || 27.7172,
    lng: state.lng || 85.3240,
    isLiveGPS: false
  });

  useEffect(() => {
    if (state.lat && state.lng) {
      setUserLocation({ lat: state.lat, lng: state.lng, isLiveGPS: false });
    }
  }, [state.lat, state.lng]);

  const [selectedZoneId, setSelectedZoneId] = useState<string>(saferAreas[0]?.zoneId || 'SAFE-RIDGE-NORTH');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isLiveGPS: true
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const selectedArea = saferAreas.find((sa) => sa.zoneId === selectedZoneId) || saferAreas[0];
  const selectedLiveDist = selectedArea ? calculateDistanceKm(userLocation.lat, userLocation.lng, selectedArea.lat, selectedArea.lng) : 0;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            COMPARATIVELY LOWER-RISK NEARBY AREAS
          </h3>
        </div>
        <StatusBadge status="API" label="ELEVATION & DISTANCE" />
      </div>

      {/* Live User Telemetry Bar */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-dark-950 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-2 text-cyan-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold">LOCATION:</span>
          <span className="text-white font-mono">{userLocation.lat.toFixed(3)}° N, {userLocation.lng.toFixed(3)}° E</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          userLocation.isLiveGPS 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
        }`}>
          {userLocation.isLiveGPS ? 'GPS LOCKED' : 'MONITORED ZONE'}
        </span>
      </div>

      {/* Selected Area Highlight Box */}
      {selectedArea && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/60 to-dark-900 border border-emerald-500/50 shadow-emerald-glow space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-emerald-300 font-extrabold">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>SELECTED: {selectedArea.name}</span>
            </span>
            <span className="text-emerald-400 text-[10px] font-bold uppercase">{selectedArea.recommendationLabel}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/30">
            <div className="flex items-center gap-1 text-white">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Distance from Location:</span>
              <strong className="text-emerald-400 font-extrabold text-sm ml-1">{selectedLiveDist} km</strong>
            </div>
            <span className="text-amber-400 font-bold">ETA ~{selectedArea.etaMinutes} min</span>
          </div>
        </div>
      )}

      {/* List of Lower-Risk Area Options */}
      <div className="space-y-2">
        {saferAreas.map((sa) => {
          const liveDist = calculateDistanceKm(userLocation.lat, userLocation.lng, sa.lat, sa.lng);
          const isSelected = sa.zoneId === selectedZoneId;

          return (
            <div
              key={sa.zoneId}
              onClick={() => setSelectedZoneId(sa.zoneId)}
              className={`p-3 rounded-lg transition-all cursor-pointer space-y-1.5 text-xs ${
                isSelected
                  ? 'bg-dark-900 border-2 border-emerald-400 shadow-emerald-glow'
                  : 'bg-dark-900/90 border border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-white">
                  <ShieldCheck className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{sa.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {sa.recommendationLabel} ({sa.currentRiskPct}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  Distance: <strong className="text-emerald-400 font-extrabold">{liveDist} km</strong>
                </div>
                <div>ETA: <strong className="text-amber-400">~{sa.etaMinutes} min</strong></div>
                <div>Elevation: <strong className="text-cyan-400">{sa.elevationMeters} m</strong></div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Road Status: <strong className="text-emerald-400">{sa.roadStatus}</strong></span>
                <span>Shelter: <strong className="text-slate-200">{sa.shelterName}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
