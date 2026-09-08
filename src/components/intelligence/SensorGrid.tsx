import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Waves, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const SensorGrid: React.FC = () => {
  const { riverStations } = useSimulation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RAPIDLY_RISING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">🟣 RAPIDLY RISING</span>;
      case 'ABOVE_DANGER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">🔴 ABOVE DANGER</span>;
      case 'ABOVE_WARNING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🟠 ABOVE WARNING</span>;
      case 'WARNING_RISING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">🟡 RISING STEADILY</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">🟢 BELOW WARNING / STEADY</span>;
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            RIVER MONITORING STATIONS (NEPAL DHM)
          </h3>
        </div>
        <StatusBadge status="OFFICIAL" label="NEPAL DHM STATIONS" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {riverStations.map((stn) => (
          <div key={stn.id} className="p-3 bg-dark-900 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div>
                <strong className="text-cyan-300 font-bold block text-[11px]">{stn.stationName}</strong>
                <span className="text-[10px] text-slate-400">{stn.riverName} ({stn.district})</span>
              </div>
              {getStatusBadge(stn.status)}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] bg-dark-950 p-2 rounded border border-slate-800/80">
              <div>
                <span className="text-slate-400 block text-[9.5px]">WATER LEVEL</span>
                <strong className="text-white text-xs">{stn.waterLevelMeters} m</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9.5px]">DANGER LEVEL</span>
                <strong className="text-red-400 text-xs">{stn.dangerLevelMeters} m</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9.5px]">WARNING THRESHOLD</span>
                <strong className="text-amber-300 text-xs">{stn.warningLevelMeters} m</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9.5px]">RATE OF RISE</span>
                <strong className={`text-xs flex items-center gap-0.5 ${stn.rateOfChangeMetersPerHr > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {stn.rateOfChangeMetersPerHr > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {stn.rateOfChangeMetersPerHr > 0 ? '+' : ''}{stn.rateOfChangeMetersPerHr} m/hr
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-0.5">
              <span>Source: <strong className="text-slate-300">{stn.source}</strong></span>
              <span>Updated: {stn.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
