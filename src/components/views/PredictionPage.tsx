import React from 'react';
import { NextAreaAtRisk } from '../prediction/NextAreaAtRisk';
import { NextAffectedAreas } from '../prediction/NextAffectedAreas';
import { RiskGauge } from '../prediction/RiskGauge';
import { ExplainableAI } from '../prediction/ExplainableAI';
import { ModelAgreement } from '../prediction/ModelAgreement';
import { StatusBadge } from '../layout/StatusBadge';
import { BrainCircuit } from 'lucide-react';

export const PredictionPage: React.FC = () => {
  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-extrabold text-base text-white uppercase tracking-wider">
              HYDROLOGICAL AI PREDICTION & SHAP EXPLAINABILITY
            </h2>
            <p className="text-[10px] text-slate-400">WATERSHED RISK INTELLIGENCE ENGINE</p>
          </div>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="PREDICTION ENGINE ACTIVE" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* HERO PREDICTION & RANKED THREAT AREAS */}
        <div className="xl:col-span-8 space-y-4">
          <NextAreaAtRisk />
          <NextAffectedAreas />
        </div>

        {/* RISK GAUGE, EXPLAINABLE AI, ENSEMBLE */}
        <div className="xl:col-span-4 space-y-4">
          <RiskGauge />
          <ExplainableAI />
          <ModelAgreement />
        </div>
      </div>
    </div>
  );
};
