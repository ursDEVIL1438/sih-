import React from 'react';
import { Satellite, Radio, Layers, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const SatelliteRadar: React.FC = () => {
  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-purple-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            SATELLITE INTELLIGENCE & WEATHER RADAR SWEEP
          </h3>
        </div>
        <StatusBadge status="API" label="SENTINEL / GPM" />
      </div>

      <div className="relative w-full h-56 bg-dark-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden radar-grid">
        {/* Radar Concentric Rings */}
        <div className="w-48 h-48 rounded-full border border-cyan-500/30 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-cyan-500/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-cyan-500/10" />
          </div>
        </div>

        {/* Radar Rotating Sweep Line */}
        <div className="absolute w-48 h-48 rounded-full animate-radar-sweep pointer-events-none">
          <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-cyan-400 origin-right shadow-cyan-glow" />
        </div>

        {/* Storm Cells Simulated */}
        <div className="absolute top-12 right-20 w-8 h-8 rounded-full bg-red-500/40 blur-sm animate-pulse" />
        <div className="absolute bottom-16 left-24 w-12 h-12 rounded-full bg-orange-500/30 blur-md" />

        <div className="absolute bottom-2 left-3 font-mono text-[10px] text-cyan-300">
          RADAR RANGE: 120 KM | DOPPLER SWEEP ACTIVE
        </div>
      </div>
    </div>
  );
};
