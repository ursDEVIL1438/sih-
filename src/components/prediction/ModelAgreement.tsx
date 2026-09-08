import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Layers, CheckCircle2, Cpu } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const ModelAgreement: React.FC = () => {
  const { intel } = useSimulation();

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            MULTI-MODEL AI ENSEMBLE
          </h3>
        </div>
        <StatusBadge status="SIMULATED" label="ENSEMBLE v1.0" />
      </div>

      <div className="space-y-2">
        {(intel.modelAgreements || []).map((model) => (
          <div key={model.name} className="flex items-center justify-between p-2 rounded bg-dark-900/60 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-200 font-semibold block text-[11px]">{model.name}</span>
              <span className="text-slate-500 text-[10px]">{model.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-300 font-bold">{model.score}%</span>
              <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-400 h-full"
                  style={{ width: `${model.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
        <span className="text-slate-400">MODEL CONSENSUS AGREEMENT:</span>
        <span className="text-emerald-400 font-bold">91% (HIGH STABILITY)</span>
      </div>
    </div>
  );
};
