import React from 'react';
import { terrainRiskZones } from '../../data/terrainGeoJSON';
import { ShieldAlert, ShieldCheck, MapPin, Clock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

interface NextAffectedAreasPanelProps {
  onSelectZone: (zoneId: string, lat: number, lng: number) => void;
}

export const NextAffectedAreasPanel: React.FC<NextAffectedAreasPanelProps> = ({ onSelectZone }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'ELEVATED': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  const safeAreas = [
    { name: 'VADAMALAIPETA RIDGE', riskPct: 18, etaMin: 20, distKm: 5.2, label: 'RELATIVELY SAFER', elevation: '+52 m' },
    { name: 'CHANDRAGIRI HIGH PLATEAU', riskPct: 24, etaMin: 28, distKm: 7.4, label: 'RELATIVELY SAFER', elevation: '+68 m' },
    { name: 'RAMACHANDRAPURAM SAFE CREST', riskPct: 27, etaMin: 32, distKm: 9.1, label: 'RELATIVELY SAFER', elevation: '+45 m' },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* NEXT AFFECTED AREAS PANEL */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
              NEXT AFFECTED AREAS (TERRAIN PROPAGATION RANK)
            </h3>
          </div>
          <StatusBadge status="MODEL OUTPUT" label="CHRONOLOGICAL IMPACT" />
        </div>

        <div className="space-y-2">
          {terrainRiskZones.map((z, idx) => {
            const lat = z.coordinates[0][0];
            const lng = z.coordinates[0][1];
            const color = getRiskColor(z.riskLevel);

            return (
              <div
                key={z.id}
                onClick={() => onSelectZone(z.id, lat, lng)}
                className="p-3 rounded-lg bg-dark-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-dark-950 border border-slate-700 flex items-center justify-center font-extrabold text-slate-400 text-xs group-hover:border-cyan-400 group-hover:text-cyan-300">
                    0{idx + 1}
                  </span>
                  <div>
                    <span className="font-extrabold text-white text-xs block group-hover:text-cyan-300 transition-colors">
                      {z.locationCode}
                    </span>
                    <span className="text-[10px] text-slate-400">{z.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span 
                    className="font-extrabold text-xs px-2 py-0.5 rounded uppercase font-mono block"
                    style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
                  >
                    {z.dangerScore}% {z.riskLevel}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold block mt-1">
                    ~{z.expectedImpactMinutes} MIN ETA
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDED SAFER AREAS PANEL */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
              RECOMMENDED SAFER NEARBY AREAS
            </h3>
          </div>
          <StatusBadge status="MODEL OUTPUT" label="RELATIVELY SAFER" />
        </div>

        <div className="space-y-2">
          {safeAreas.map((sa) => (
            <div key={sa.name} className="p-3 rounded-lg bg-dark-900/90 border border-emerald-500/30 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sa.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {sa.label} ({sa.riskPct}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Distance: <strong className="text-white">{sa.distKm} KM</strong></span>
                <span>Travel Time: <strong className="text-amber-400">~{sa.etaMin} MIN</strong></span>
                <span>Elevation: <strong className="text-cyan-400">{sa.elevation}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
