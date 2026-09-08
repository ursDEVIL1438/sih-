import React from 'react';
import { TerrainZoneFeature } from '../../data/terrainGeoJSON';
import { X, ShieldAlert, Clock, MapPin, Users, Building, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

interface PolygonDetailsModalProps {
  zone: TerrainZoneFeature | null;
  onClose: () => void;
}

export const PolygonDetailsModal: React.FC<PolygonDetailsModalProps> = ({ zone, onClose }) => {
  if (!zone) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'ELEVATED': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  const color = getRiskColor(zone.riskLevel);

  return (
    <div className="absolute top-16 right-4 z-[1001] w-full max-w-md bg-dark-900/95 backdrop-blur-xl border border-cyan-400/40 rounded-xl p-4 shadow-cyan-glow font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="font-extrabold text-cyan-300 uppercase tracking-wider">{zone.locationCode}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h3 className="text-sm font-extrabold text-white">{zone.name}</h3>
        <p className="text-[11px] text-slate-400">Terrain Elevation: {zone.elevationMeters} meters</p>
      </div>

      {/* Danger Score Box */}
      <div className="p-3 rounded-lg bg-dark-950 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">FLOOD RISK SCORE</span>
          <span className="text-2xl font-extrabold" style={{ color }}>
            {zone.dangerScore}%
          </span>
          <span className="text-xs font-bold uppercase ml-2" style={{ color }}>
            {zone.riskLevel}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase">EXPECTED IMPACT</span>
          <span className="text-base font-extrabold text-amber-400">~{zone.expectedImpactMinutes} MIN</span>
        </div>
      </div>

      {/* Primary Drivers */}
      <div className="space-y-1 bg-dark-950 p-2.5 rounded-lg border border-slate-800">
        <span className="text-[10px] text-cyan-400 font-bold uppercase block">MAIN HYDROLOGICAL DRIVERS:</span>
        {zone.primaryDrivers.map((driver) => (
          <div key={driver} className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="text-red-400">•</span>
            <span>{driver}</span>
          </div>
        ))}
      </div>

      {/* Affected Population & Infra */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-dark-950 rounded-lg border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Users className="w-3 h-3 text-purple-400" /> POPULATION AT RISK
          </span>
          <div className="text-sm font-extrabold text-white">{zone.affectedPopulation.total}</div>
          <div className="text-[9.5px] text-red-400 font-bold">Critical: {zone.affectedPopulation.critical}</div>
        </div>

        <div className="p-2.5 bg-dark-950 rounded-lg border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <Building className="w-3 h-3 text-amber-400" /> INFRASTRUCTURE AT RISK
          </span>
          <div className="text-xs text-slate-300">
            <div>Bridges: <strong className="text-red-400">{zone.infrastructureAtRisk.bridges}</strong></div>
            <div>Roads: <strong className="text-amber-400">{zone.infrastructureAtRisk.roads}</strong></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px]">
        <StatusBadge status="MODEL OUTPUT" label="DEMO TERRAIN SIMULATION" />
        <button onClick={onClose} className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold rounded">
          CLOSE DETAILS
        </button>
      </div>
    </div>
  );
};
