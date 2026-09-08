import React, { useState } from 'react';
import { LivingMap } from '../map/LivingMap';
import { NextAreaAtRisk } from '../prediction/NextAreaAtRisk';
import { NextAffectedAreas } from '../prediction/NextAffectedAreas';
import { SaferAreas } from '../response/SaferAreas';
import { SafeRoutePanel } from '../response/SafeRoutePanel';
import { EarlyWarningCard } from '../response/EarlyWarningCard';
import { NepalDistrictRiskTable } from '../prediction/NepalDistrictRiskTable';
import { PredictionTimelinePanel } from '../prediction/PredictionTimelinePanel';
import { Activity, ShieldAlert } from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const [selectedCenter, setSelectedCenter] = useState<[number, number]>([13.645, 79.425]);

  const handleSelectArea = (lat: number, lng: number) => {
    setSelectedCenter([lat, lng]);
  };

  return (
    <div className="w-full h-full p-3 space-y-3 overflow-y-auto font-mono select-none">
      {/* EARLY WARNING ALERT BANNER */}
      <EarlyWarningCard />

      {/* 3-COLUMN PROFESSIONAL DISASTER COMMAND CENTER LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* LEFT COLUMN: HERO RISK PREDICTION & NEPAL DISTRICT RISKS (3 cols) */}
        <div className="xl:col-span-3 space-y-3 order-2 xl:order-1">
          <NextAreaAtRisk />
          <NepalDistrictRiskTable />
        </div>

        {/* CENTER COLUMN: INTERACTIVE WEATHER & FLOOD RISK MAP CANVAS (6 cols) */}
        <div className="xl:col-span-6 flex flex-col space-y-2 order-1 xl:order-2">
          <div className="flex items-center justify-between bg-dark-900/80 p-2 rounded-xl border border-cyan-500/20 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>SPATIAL WATERSHED & WEATHER SYMBOL CANVAS</span>
            </div>

            <div className="text-[10px] text-slate-400">
              WEATHER SYMBOLS • NO CIRCLES • HISTORICAL HOTSPOTS
            </div>
          </div>

          <div className="h-[460px] sm:h-[500px] rounded-xl overflow-hidden">
            <LivingMap />
          </div>
        </div>

        {/* RIGHT COLUMN: PREDICTION TIMELINE & SAFER AREAS (3 cols) */}
        <div className="xl:col-span-3 space-y-3 order-3">
          <PredictionTimelinePanel />
          <SaferAreas />
        </div>
      </div>

      {/* BOTTOM SECTION: NEXT AFFECTED AREAS & SAFE ROUTE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <NextAffectedAreas onSelectArea={handleSelectArea} />
        <SafeRoutePanel />
      </div>
    </div>
  );
};
