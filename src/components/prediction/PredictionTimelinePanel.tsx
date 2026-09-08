import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Clock } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const PredictionTimelinePanel: React.FC = () => {
  const { forecastTimeline, updateState } = useSimulation();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeStep = forecastTimeline[activeStepIndex] || forecastTimeline[0];

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'VERY HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'HIGH': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MODERATE': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            PREDICTION TIMELINE (NOW → 48 HOURS)
          </h3>
        </div>
        <StatusBadge status="API" label="OPEN-METEO HOURLY" />
      </div>

      {/* Timeline Selector Buttons */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-dark-950 rounded-lg border border-slate-800">
        {forecastTimeline.map((step, idx) => {
          const isSelected = idx === activeStepIndex;
          return (
            <button
              key={step.offsetLabel}
              onClick={() => {
                setActiveStepIndex(idx);
                updateState({ futureOffsetHours: step.offsetHours });
              }}
              className={`py-2 px-1 rounded text-center transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'bg-cyan-500 text-dark-950 font-extrabold shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white hover:bg-dark-900'
              }`}
            >
              <span className="text-[12px]">{step.weatherSymbol}</span>
              <span className="text-[11px] font-bold tracking-tight">{step.offsetLabel}</span>
              <span className={`text-[9.5px] font-bold ${isSelected ? 'text-dark-950' : 'text-slate-500'}`}>
                {step.expectedRiskPct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Timeline Detail Card */}
      <div className="p-3.5 rounded-lg bg-dark-900 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="text-xl">{activeStep.weatherSymbol}</span>
            <div>
              <span className="text-cyan-300 font-extrabold block text-xs">
                TIMELINE OFFSET: {activeStep.offsetLabel} ({activeStep.offsetHours} HOURS)
              </span>
              <span className="text-[10px] text-slate-400">
                Forecast Rainfall: <strong className="text-white">{activeStep.expectedRainfall} mm/hr</strong>
              </span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-extrabold border ${getRiskBadgeColor(activeStep.riskLevel)}`}>
            {activeStep.expectedRiskPct}% {activeStep.riskLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="bg-dark-950 p-2 rounded border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">DATA PROVENANCE</span>
            <span className="text-cyan-400 font-bold text-[10px]">{activeStep.sourceLabel}</span>
          </div>
          <div className="bg-dark-950 p-2 rounded border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">RECOMMENDED ACTION</span>
            <span className="text-amber-400 font-bold text-[10px]">{activeStep.recommendedWarning}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
