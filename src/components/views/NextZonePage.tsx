import React, { useState } from 'react';
import { NextZonePanel } from '../prediction/NextZonePanel';
import { NextAffectedAreasPanel } from '../prediction/NextAffectedAreasPanel';
import { FutureForecastPanel } from '../prediction/FutureForecastPanel';
import { DangerEscalationTimeline } from '../prediction/DangerEscalationTimeline';
import { DangerScoreWeights } from '../prediction/DangerScoreWeights';
import { LivingMap } from '../map/LivingMap';
import { ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const NextZonePage: React.FC = () => {
  const [selectedMapCenter, setSelectedMapCenter] = useState<[number, number]>([13.645, 79.425]);

  const handleSelectZone = (zoneId: string, lat: number, lng: number) => {
    setSelectedMapCenter([lat, lng]);
  };

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-400 animate-bounce" />
          <div>
            <h2 className="font-extrabold text-base text-white uppercase tracking-wider">
              TERRAIN-AWARE FLOOD RISK MAP — NEXT-ZONE INTELLIGENCE
            </h2>
            <p className="text-[10px] text-slate-400">ORGANIC GEOJSON WATERSHED RUNOFF & DOWNSTREAM PROPAGATION</p>
          </div>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="NO-CIRCLE ENFORCED" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left GIS Map (7 cols) */}
        <div className="xl:col-span-7 flex flex-col space-y-3 min-h-[540px]">
          <div className="flex-1 rounded-xl overflow-hidden min-h-[500px]">
            <LivingMap />
          </div>
        </div>

        {/* Right Next-Zone & Next Affected Area Panels (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <NextZonePanel />
          <NextAffectedAreasPanel onSelectZone={handleSelectZone} />
        </div>
      </div>

      {/* Future Forecast, Escalation Curve & Weights */}
      <FutureForecastPanel />
      <DangerEscalationTimeline />
      <DangerScoreWeights />
    </div>
  );
};
