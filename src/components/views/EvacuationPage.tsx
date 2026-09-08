import React from 'react';
import { SaferAreas } from '../response/SaferAreas';
import { SafeRoutePanel } from '../response/SafeRoutePanel';
import { LivingMap } from '../map/LivingMap';
import { StatusBadge } from '../layout/StatusBadge';
import { Navigation, ShieldCheck } from 'lucide-react';

export const EvacuationPage: React.FC = () => {
  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-extrabold text-base text-white uppercase tracking-wider">
              DYNAMIC EVACUATION ROUTE & SAFER AREA SOLVER
            </h2>
            <p className="text-[10px] text-slate-400">OPTIMIZED EVACUATION CORRIDOR DISPATCH</p>
          </div>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="EVACUATION OPTIMIZER" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* EVACUATION MAP & ROUTE PANEL */}
        <div className="xl:col-span-7 space-y-4">
          <div className="h-[420px] rounded-xl overflow-hidden border border-slate-800">
            <LivingMap />
          </div>
          <SafeRoutePanel />
        </div>

        {/* SAFER AREAS PANEL */}
        <div className="xl:col-span-5 space-y-4">
          <SaferAreas />
          
          <div className="glass-panel p-4 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SAFETY ASSURANCE DISCLOSURE</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Recommended locations are designated as <strong className="text-emerald-400">RELATIVELY SAFER</strong> or <strong className="text-emerald-400">LOWER PROJECTED RISK</strong> based on 100-year peak flow modeling, high elevation contours, and open access roads. Always follow local disaster response instructions during live operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
