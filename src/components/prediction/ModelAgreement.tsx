import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const ModelAgreement: React.FC = () => {
  const { intel } = useSimulation();
  const { confidenceBreakdown } = intel;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            DATA-FUSION MODEL CONFIDENCE
          </h3>
        </div>
        <StatusBadge status="API" label="TRANSPARENT METRICS" />
      </div>

      <div className="bg-dark-900 border border-slate-800 p-3 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-bold">OVERALL CONFIDENCE RATING:</span>
          <span className="text-cyan-400 font-extrabold text-sm">{confidenceBreakdown.scorePct}%</span>
        </div>

        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-cyan-400 h-full transition-all duration-500" 
            style={{ width: `${confidenceBreakdown.scorePct}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-1 text-xs">
        <span className="text-slate-400 text-[10.5px] uppercase font-bold block">CONFIDENCE REASONING:</span>
        {confidenceBreakdown.reasons.map((reason, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
