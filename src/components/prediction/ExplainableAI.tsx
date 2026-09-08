import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Sparkles, Brain, Info, HelpCircle } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const ExplainableAI: React.FC = () => {
  const { intel } = useSimulation();
  const { shapContributions, naturalLanguageExplanation } = intel;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            WHY THIS PREDICTION? (EXPLAINABLE AI)
          </h3>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="SHAP WEIGHTS" />
      </div>

      {/* Feature Contribution Bars */}
      <div className="space-y-2 pt-1">
        {shapContributions.map((item) => (
          <div key={item.feature} className="text-xs font-mono">
            <div className="flex justify-between text-slate-300 text-[11px] mb-1">
              <span>{item.feature}</span>
              <span className="text-cyan-400 font-bold">+{item.weight}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, item.weight * 2.5)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Natural Language Explanation Box */}
      <div className="bg-dark-900/90 border border-cyan-500/30 p-3 rounded-lg text-xs font-mono space-y-1.5">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>AI-GENERATED SYNTHESIS</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          "{naturalLanguageExplanation}"
        </p>
      </div>
    </div>
  );
};
