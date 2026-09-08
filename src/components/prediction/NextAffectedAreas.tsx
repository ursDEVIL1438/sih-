import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldAlert, MapPin, Clock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

interface NextAffectedAreasProps {
  onSelectArea?: (lat: number, lng: number) => void;
}

export const NextAffectedAreas: React.FC<NextAffectedAreasProps> = ({ onSelectArea }) => {
  const { rankedThreatAreas } = useSimulation();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'VERY HIGH': return '#F97316';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            NEXT AFFECTED AREAS (RANKED IMPACT)
          </h3>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="CHRONOLOGICAL" />
      </div>

      <div className="space-y-2">
        {rankedThreatAreas.map((area) => {
          const color = getRiskColor(area.riskLevel);
          return (
            <div
              key={area.zoneId}
              onClick={() => onSelectArea && onSelectArea(area.lat, area.lng)}
              className="p-3 rounded-lg bg-dark-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-dark-950 border border-slate-700 flex items-center justify-center font-extrabold text-slate-400 text-xs group-hover:border-cyan-400 group-hover:text-cyan-300">
                  0{area.rank}
                </span>
                <div>
                  <span className="font-extrabold text-white text-xs block group-hover:text-cyan-300 transition-colors">
                    {area.name}
                  </span>
                  <span className="text-[10px] text-slate-400">Target Zone: {area.zoneId}</span>
                </div>
              </div>

              <div className="text-right">
                <span 
                  className="font-extrabold text-xs px-2 py-0.5 rounded uppercase font-mono block"
                  style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
                >
                  {area.dangerScore}% {area.riskLevel}
                </span>
                <span className="text-[10px] text-amber-400 font-bold block mt-1">
                  ~{area.etaMinutes} MIN ETA
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
