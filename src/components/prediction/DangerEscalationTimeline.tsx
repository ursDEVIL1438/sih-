import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { TrendingUp, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const DangerEscalationTimeline: React.FC = () => {
  const { intel, state, setTimelineMinute } = useSimulation();

  const escalationSteps = [
    { label: 'NOW', min: 0, score: Math.round(intel.floodProbability * 0.6), risk: 'MODERATE', driver: 'Initial cloudburst rain' },
    { label: '+1 HOUR', min: 60, score: Math.round(intel.floodProbability * 0.75), risk: 'HIGH', driver: 'Soil saturation reaching 85%' },
    { label: '+3 HOURS', min: 180, score: Math.round(intel.floodProbability * 0.9), risk: 'VERY HIGH', driver: 'River swelling over banks' },
    { label: '+6 HOURS', min: 360, score: Math.min(99, Math.round(intel.floodProbability * 1.05)), risk: 'CRITICAL', driver: 'Peak valley floor inundation' },
  ];

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            NEXT 6 HOURS DANGER ESCALATION CURVE
          </h3>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="WHY IS RISK INCREASING?" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {escalationSteps.map((step) => (
          <div
            key={step.label}
            onClick={() => setTimelineMinute(step.min)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              step.risk === 'CRITICAL' 
                ? 'bg-red-950/70 border-red-500/50 text-red-300 shadow-red-glow' 
                : 'bg-dark-900 border-slate-800 text-slate-300 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span>{step.label}</span>
              <span className="text-cyan-400">{step.score}%</span>
            </div>
            <div className="text-xs font-extrabold text-white uppercase">{step.risk}</div>
            <p className="text-[10px] text-slate-400 mt-1">{step.driver}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
