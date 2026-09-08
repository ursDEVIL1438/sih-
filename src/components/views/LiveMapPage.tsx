import React from 'react';
import { ModernTerrainMap } from '../map/ModernTerrainMap';
import { StatusBadge } from '../layout/StatusBadge';
import { Map, Layers, ShieldCheck } from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  return (
    <div className="w-full h-full p-3 flex flex-col space-y-3 font-mono select-none overflow-hidden">
      <div className="flex items-center justify-between bg-dark-900/90 p-2.5 rounded-xl border border-cyan-500/20 text-xs shrink-0">
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <Map className="w-4 h-4 text-cyan-400" />
          <span>GIS TERRAIN-AWARE LIVING FLOOD MAP</span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            TERRAIN-AWARE POLYGONS ENFORCED (NO CIRCLES)
          </span>
          <StatusBadge status="MODEL OUTPUT" label="KEYLESS OSM / TERRAIN BASEMAP" />
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden min-h-0 border border-slate-800">
        <ModernTerrainMap />
      </div>
    </div>
  );
};
