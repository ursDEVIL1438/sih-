import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldAlert, Mountain, Compass, Info } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const NepalDistrictRiskTable: React.FC = () => {
  const { nepalDistrictRisks, state, updateState } = useSimulation();

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
            NEPAL REGIONAL FLOOD RISK PREDICTION
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="MODEL OUTPUT" label="LIVE HYDRODYNAMICS" />
        </div>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        High-altitude river basin and district risk assessment for Nepal. Flood risk percentages are dynamically computed from precipitation, river elevation, terrain slope, and soil saturation.
      </p>

      {/* District Risk Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-dark-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-dark-900 text-slate-400 text-[10.5px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-2.5">Location / District</th>
              <th className="p-2.5">Current Condition</th>
              <th className="p-2.5 text-right">Predicted Risk</th>
              <th className="p-2.5 text-center">Expected Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {nepalDistrictRisks.map((d) => (
              <tr 
                key={d.districtId} 
                onClick={() => updateState({ selectedRegion: 'Nepal Watershed' })}
                className="hover:bg-dark-900/80 transition-colors cursor-pointer"
              >
                <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                  <span className="text-base">{d.currentConditionSymbol}</span>
                  <span>{d.name}</span>
                </td>
                <td className="p-2.5 text-slate-300 text-[11px]">
                  {d.currentConditionLabel}
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
        <span>Calculated from live precipitation telemetry & mountain slope absorption models.</span>
      </div>
    </div>
  );
};
