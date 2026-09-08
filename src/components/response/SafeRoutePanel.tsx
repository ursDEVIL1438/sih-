import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Navigation as NavIcon, Home, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const SafeRoutePanel: React.FC = () => {
  const { evacuationRoute } = useSimulation();

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <NavIcon className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            RECOMMENDED SAFER EVACUATION ROUTE
          </h3>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="DYNAMIC ROUTE SOLVER" />
      </div>

      {/* Evacuation Route Step Sequence */}
      <div className="p-3 bg-dark-950 rounded-lg border border-slate-800 space-y-2 text-xs">
        <span className="text-cyan-400 font-bold uppercase text-[10px] block">EVACUATION PATHWAY:</span>
        <div className="flex flex-wrap items-center gap-2 font-extrabold text-white text-xs">
          <span className="px-2 py-1 bg-dark-900 rounded border border-slate-700">{evacuationRoute.originZone}</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="px-2 py-1 bg-dark-900 rounded border border-slate-700">ROAD R12</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="px-2 py-1 bg-dark-900 rounded border border-slate-700">JUNCTION J4</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="px-2 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-500/40">SHELTER S4</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-800">
          <div>Distance: <strong className="text-white">{evacuationRoute.distanceKm} km</strong></div>
          <div>ETA: <strong className="text-amber-400">{evacuationRoute.etaMinutes} min</strong></div>
          <div>Route Risk: <strong className="text-emerald-400">{evacuationRoute.routeRisk}</strong></div>
          <div>Road: <strong className="text-emerald-400">{evacuationRoute.roadStatus}</strong></div>
        </div>
      </div>

      {/* Shelter Info Box */}
      <div className="p-3 bg-dark-900 rounded-lg border border-emerald-500/40 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <Home className="w-4 h-4 text-emerald-400" />
            <span>{evacuationRoute.destinationShelter.name}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            RISK: {evacuationRoute.destinationShelter.riskLevel}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-300">
          <div>Distance: <strong className="text-white">{evacuationRoute.destinationShelter.distanceKm} km</strong></div>
          <div>ETA: <strong className="text-amber-400">{evacuationRoute.destinationShelter.etaMinutes} min</strong></div>
          <div>Capacity: <strong className="text-white">{evacuationRoute.destinationShelter.capacity}</strong></div>
          <div>Available: <strong className="text-emerald-400">{evacuationRoute.destinationShelter.available}</strong></div>
        </div>
      </div>
    </div>
  );
};
