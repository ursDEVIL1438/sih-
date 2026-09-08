import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Activity, Dna, Waves } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const FloodDNA: React.FC = () => {
  const { intel } = useSimulation();

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            FLOOD DNA WAVEFORM SIGNATURE
          </h3>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="PATTERN MATCH" />
      </div>

      {/* Animated Waveform SVG */}
      <div className="w-full h-24 bg-dark-950 p-2 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
          <path
            d="M 0 30 Q 30 10, 60 40 T 120 20 T 180 50 T 240 15 T 300 30"
            fill="none"
            stroke="rgba(34, 211, 238, 0.4)"
            strokeWidth="2"
          />
          <path
            d="M 0 30 Q 35 5, 70 45 T 140 10 T 210 55 T 280 20 T 300 30"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2.5"
            className="animate-pulse"
          />
        </svg>

        {/* Scanning Line */}
        <div className="absolute inset-y-0 w-0.5 bg-cyan-400 shadow-cyan-glow animate-radar-sweep opacity-75" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-dark-900/60 p-2 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px] block">HISTORICAL MATCH</span>
          <span className="text-cyan-300 font-bold">{intel.historicalSimilarityPct}% (2021 CHAMOLI EVENT)</span>
        </div>
        <div className="bg-dark-900/60 p-2 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px] block">HYDRAULIC PRESSURE</span>
          <span className="text-amber-400 font-bold">{intel.pressureScore} kPa</span>
        </div>
      </div>
    </div>
  );
};
