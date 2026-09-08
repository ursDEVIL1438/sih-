import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const ExplainableAI: React.FC = () => {
  const { intel } = useSimulation();
  const { shapContributions, naturalLanguageExplanation, confidenceBreakdown } = intel;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            WHY THIS PREDICTION? (EXPLAINABLE DATA-FUSION AI)
          </h3>
        </div>
        <StatusBadge status="API" label="FEATURE WEIGHTS" />
      </div>

      {/* Feature Contribution Bars with Live Measured Values */}
      <div className="space-y-2.5 pt-1">
        {shapContributions.map((item) => (
          <div key={item.feature} className="text-xs font-mono space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-200 font-bold">{item.feature}</span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold text-[10.5px] bg-dark-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {item.currentValue}
                </span>
                <span className="text-cyan-400 font-bold">+{item.weight}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, item.weight * 3.5)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Confidence Score Breakdown */}
      <div className="bg-dark-900/90 border border-slate-800 p-2.5 rounded-lg space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <span className="text-slate-300 font-bold">CONFIDENCE METRIC REASONING:</span>
          <span className="text-cyan-400 font-bold">{confidenceBreakdown.scorePct}% CONFIDENCE</span>
        </div>
        <div className="space-y-1 text-[10px]">
          {confidenceBreakdown.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Natural Language Explanation Box */}
      <div className="bg-dark-900/90 border border-cyan-500/30 p-3 rounded-lg text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>DATA-FUSION SYNTHESIS</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          "{naturalLanguageExplanation}"
        </p>
      </div>
    </div>
  );
};
