import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { RotateCcw, TrendingUp, TrendingDown, ShieldCheck, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const CounterfactualPage: React.FC = () => {
  const comparisons = [
    {
      metric: 'Exposed Population at Risk',
      currentResponse: '2,180 Residents',
      earlyResponse: '1,438 Residents',
      improvementPct: 34,
      isReduction: true,
      desc: '34% reduction in direct high-risk zone exposure.'
    },
    {
      metric: 'Evacuation Route Completion Rate',
      currentResponse: '68% Completed',
      earlyResponse: '95% Completed',
      improvementPct: 27,
      isReduction: false,
      desc: '+27% higher population safely evacuated before road closure.'
    },
    {
      metric: 'Road Isolation & Cut-off Events',
      currentResponse: '3 Isolated Villages',
      earlyResponse: '1 Isolated Village',
      improvementPct: 18,
      isReduction: true,
      desc: '18% fewer road corridors rendered inaccessible.'
    },
    {
      metric: 'Rescue Dispatch Efficiency',
      currentResponse: '28 min Average ETA',
      earlyResponse: '16 min Average ETA',
      improvementPct: 42,
      isReduction: false,
      desc: '+42% faster response vehicle deployment.'
    }
  ];

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-bold text-base text-white uppercase tracking-wider">
              COUNTERFACTUAL ANALYSIS — "WHAT IF WE ACTED 30 MINUTES EARLIER?"
            </h2>
            <p className="text-[10px] text-slate-400">DISASTER INTELLIGENCE COMPARISON ENGINE</p>
          </div>
        </div>
        <StatusBadge status="SIMULATED" label="SIMULATION ESTIMATE" />
      </div>

      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>NOTICE: Counterfactual values are simulated model estimates generated for strategic decision support.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparisons.map((c) => (
          <div key={c.metric} className="glass-panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs">{c.metric}</span>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                {c.isReduction ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {c.isReduction ? `-${c.improvementPct}%` : `+${c.improvementPct}%`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 bg-dark-900 rounded border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">STANDARD DISPATCH</span>
                <span className="text-slate-300 font-bold">{c.currentResponse}</span>
              </div>
              <div className="p-2.5 bg-dark-950 rounded border border-cyan-500/40 space-y-1">
                <span className="text-cyan-400 text-[10px] font-bold block">EARLY ACTION (-30 MIN)</span>
                <span className="text-emerald-400 font-bold">{c.earlyResponse}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
