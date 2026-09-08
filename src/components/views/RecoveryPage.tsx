import React from 'react';
import { RotateCcw, Wrench, ShieldCheck, Heart, Droplet, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const RecoveryPage: React.FC = () => {
  const priorities = [
    { id: 'P1', title: 'Bridge B-17 Structural Reinforcement & Clearance', status: 'CRITICAL', estDays: '2 Days', team: 'PWD Engineering Corps' },
    { id: 'P2', title: 'Potable Water Decontamination & Testing (Zone C)', status: 'HIGH', estDays: '1 Day', team: 'Public Health Sanitation' },
    { id: 'P3', title: 'High Peak Power Substation Grid Restoration', status: 'HIGH', estDays: '3 Days', team: 'State Electricity Board' },
    { id: 'P4', title: 'Agricultural Silt Removal & Soil Testing', status: 'MODERATE', estDays: '7 Days', team: 'District Disaster Recovery' },
  ];

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-base text-white uppercase tracking-wider">
            POST-DISASTER RECOVERY & INFRASTRUCTURE RESTORATION
          </h2>
        </div>
        <StatusBadge status="SIMULATED" label="RECOVERY MODE" />
      </div>

      <div className="space-y-3">
        {priorities.map((p) => (
          <div key={p.id} className="glass-panel p-4 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {p.id}
                </span>
                <span className="font-bold text-white">{p.title}</span>
              </div>
              <span className="text-amber-400 font-bold">{p.status}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 text-[11px]">
              <span>Assigned Team: <span className="text-slate-200">{p.team}</span></span>
              <span>Estimated Completion: <span className="text-emerald-400">{p.estDays}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
