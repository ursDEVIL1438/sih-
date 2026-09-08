import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Columns, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const ZoneComparisonPage: React.FC = () => {
  const { state } = useSimulation();

  const zones = [
    {
      id: 'ZONE-A',
      name: 'Zone A (Hill Slope)',
      rainfall: `${state.rainfall} mm/hr`,
      soil: `${state.soilSaturation}%`,
      river: `${state.riverLevel} m`,
      elevation: '580 m',
      slope: `${state.slopeDegrees}°`,
      currentRisk: '30%',
      future6hRisk: '41%',
      population: '1,420',
      shelter: 'Shelter S1',
      road: 'OPEN',
      travelTime: '8 min'
    },
    {
      id: 'ZONE-B',
      name: 'Zone B (River Settlement)',
      rainfall: `${Math.round(state.rainfall * 1.1)} mm/hr`,
      soil: `${Math.min(99, state.soilSaturation + 10)}%`,
      river: `${state.riverLevel} m`,
      elevation: '450 m',
      slope: '18°',
      currentRisk: '68%',
      future6hRisk: '84%',
      population: '2,850',
      shelter: 'Shelter S2',
      road: 'WARNING',
      travelTime: '14 min'
    },
    {
      id: 'ZONE-C',
      name: 'Zone C (Eastern Valley)',
      rainfall: `${Math.round(state.rainfall * 1.25)} mm/hr`,
      soil: '95%',
      river: `${(state.riverLevel * 1.2).toFixed(1)} m`,
      elevation: '410 m',
      slope: '32°',
      currentRisk: '82%',
      future6hRisk: '94%',
      population: '3,840',
      shelter: 'Shelter S4',
      road: 'CLOSED',
      travelTime: '24 min'
    }
  ];

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Columns className="w-5 h-5 text-cyan-400" />
          <h2 className="font-extrabold text-base text-white uppercase tracking-wider">
            MULTI-ZONE COMPARATIVE RISK & TELEMETRY MATRIX
          </h2>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="SIDE-BY-SIDE MATRIX" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono glass-panel rounded-xl">
          <thead>
            <tr className="border-b border-slate-800 text-cyan-400 text-xs bg-dark-950">
              <th className="py-3 px-4">METRIC / ATTRIBUTE</th>
              {zones.map((z) => (
                <th key={z.id} className="py-3 px-4 font-bold text-white text-sm">{z.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Current Danger Score</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 font-extrabold text-amber-400 text-sm">{z.currentRisk}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Projected 6H Risk</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 font-extrabold text-red-400 text-sm">{z.future6hRisk}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Rainfall Intensity</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 text-cyan-300 font-bold">{z.rainfall}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Soil Saturation</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 text-emerald-400 font-bold">{z.soil}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Elevation Height</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 text-white font-bold">{z.elevation}</td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Road Corridor Status</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 font-bold" style={{ color: z.road === 'CLOSED' ? '#EF4444' : z.road === 'WARNING' ? '#F59E0B' : '#22C55E' }}>
                  {z.road}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-400 font-bold">Assigned Shelter</td>
              {zones.map((z) => (
                <td key={z.id} className="py-3 px-4 text-slate-200">{z.shelter}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
