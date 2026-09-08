import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AlertTriangle, ShieldAlert, Award } from 'lucide-react';

export const EarlyWarningCard: React.FC = () => {
  const { earlyWarning } = useSimulation();

  const getWarningStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-950/80 border-red-500 text-red-100 shadow-red-glow';
      case 'EVACUATE NOW': return 'bg-orange-950/80 border-orange-500 text-orange-100 shadow-lg';
      case 'WARNING': return 'bg-amber-950/80 border-amber-500 text-amber-100';
      default: return 'bg-dark-900 border-cyan-500/30 text-slate-200';
    }
  };

  return (
    <div className={`p-4 rounded-xl space-y-3 font-mono transition-all border ${getWarningStyle(earlyWarning.level)}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          {earlyWarning.isOfficialDHM ? (
            <Award className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
          )}
          <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>{earlyWarning.isOfficialDHM ? 'OFFICIAL DHM WARNING BROADCAST' : 'EARLY WARNING ADVISORY'}</span>
            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-dark-950 border border-slate-700 text-white">
              {earlyWarning.level}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded font-extrabold bg-dark-950 border border-slate-700 text-cyan-300">
            {earlyWarning.targetZone}
          </span>
          <span className="text-[9.5px] px-2 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-slate-400">
            STATUS: {earlyWarning.dispatchStatus}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span>Current Risk: <strong className="text-amber-400">{earlyWarning.currentRiskPct}%</strong></span>
          <span>Projected Risk: <strong className="text-red-400">{earlyWarning.projectedRiskPct}%</strong></span>
          <span>Escalation Window: <strong className="text-cyan-400">~{earlyWarning.escalationMinutes} MIN</strong></span>
        </div>

        <div className="p-2.5 bg-dark-950/90 rounded-lg border border-slate-800 text-[11px] text-slate-200">
          <strong className="text-amber-300">
            {earlyWarning.isOfficialDHM ? `[OFFICIAL ${earlyWarning.officialSource}]:` : 'ACTIONABLE ADVISORY:'}
          </strong>{' '}
          {earlyWarning.recommendedAction}
        </div>
      </div>
    </div>
  );
};
