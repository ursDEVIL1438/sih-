import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Mountain, Info } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const NepalDistrictRiskTable: React.FC = () => {
  const { nepalDistrictRisks, selectLocation } = useSimulation();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'EXTREME': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'VERY HIGH': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH': return 'bg-orange-500/20 text-amber-300 border-orange-500/40';
      case 'MODERATE': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-cyan-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            NEPAL DISTRICT RISK MATRIX
          </h3>
        </div>
        <StatusBadge status="API" label="OPEN-METEO + DHM" />
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        Live district-level risk estimates for primary monitored regions in Nepal. Select any district to center map and fetch live telemetry.
      </p>

      {/* District Risk Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-dark-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-dark-900 text-slate-400 text-[10.5px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-2.5">Location / District</th>
              <th className="p-2.5">Weather</th>
              <th className="p-2.5 text-right">Risk %</th>
              <th className="p-2.5 text-center">Impact Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {nepalDistrictRisks.map((d) => (
              <tr 
                key={d.districtId} 
                onClick={() => {
                  const locIdMap: Record<string, string> = {
                    'NEP-KTM': 'KTM',
                    'NEP-PKR': 'PKR',
                    'NEP-BIR': 'BIR',
                    'NEP-CHW': 'CHW',
                    'NEP-KRN': 'KRN'
                  };
                  if (locIdMap[d.districtId]) {
                    selectLocation(locIdMap[d.districtId]);
                  }
                }}
                className="hover:bg-cyan-500/10 transition-colors cursor-pointer"
                title="Click to monitor this district"
              >
                <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                  <span className="text-base">{d.currentConditionSymbol}</span>
                  <div>
                    <span className="block text-cyan-300">{d.name}</span>
                    <span className="text-[9.5px] text-slate-400">{d.dataProvenance}</span>
                  </div>
                </td>
                <td className="p-2.5 text-slate-300 text-[11px]">
                  {d.currentConditionLabel}
                  <span className="block text-[10px] text-slate-400">{d.currentRainfall} mm/hr</span>
                </td>
                <td className="p-2.5 text-right">
                  <span className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                    d.predictedRiskPct >= 80 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                      : d.predictedRiskPct >= 65
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {d.predictedRiskPct}%
                  </span>
                </td>
                <td className="p-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getImpactColor(d.expectedImpact)}`}>
                    {d.expectedImpact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Source: Nepal DHM Stream Gauges & Open-Meteo High-Resolution Grid API.</span>
      </div>
    </div>
  );
};
