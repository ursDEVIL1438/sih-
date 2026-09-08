import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { LivingMap } from '../map/LivingMap';
import { NextAreaAtRisk } from '../prediction/NextAreaAtRisk';
import { NextAffectedAreas } from '../prediction/NextAffectedAreas';
import { SaferAreas } from '../response/SaferAreas';
import { SafeRoutePanel } from '../response/SafeRoutePanel';
import { EarlyWarningCard } from '../response/EarlyWarningCard';
import { NepalDistrictRiskTable } from '../prediction/NepalDistrictRiskTable';
import { PredictionTimelinePanel } from '../prediction/PredictionTimelinePanel';
import { MONITORED_LOCATIONS } from '../../data/locations';
import { Activity, Search, ShieldCheck, Database, Radio } from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const { state, selectLocation, dataSources, isFetchingData, lastRefreshedTime } = useSimulation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredLocations = MONITORED_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSearchResult = (locId: string) => {
    selectLocation(locId);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <div className="w-full h-full p-3 space-y-3 overflow-y-auto font-mono select-none">
      {/* SEARCH BAR & DATA SOURCE STATUS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search Bar */}
        <div className="lg:col-span-4 relative">
          <div className="flex items-center gap-2 bg-dark-900/90 p-2 rounded-xl border border-cyan-500/30 text-xs text-slate-200">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search city, district, or river watershed..."
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
            />
            {isFetchingData && (
              <span className="text-[10px] text-cyan-400 font-bold animate-pulse shrink-0">FETCHING...</span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-[2000] bg-dark-900 border border-cyan-500/40 rounded-xl shadow-cyan-glow overflow-hidden max-h-56 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                filteredLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectSearchResult(loc.id)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-cyan-500/20 text-slate-200 border-b border-slate-800 flex items-center justify-between transition-all"
                  >
                    <div>
                      <strong className="text-cyan-300 font-bold block">{loc.name}</strong>
                      <span className="text-[10px] text-slate-400">{loc.region}, {loc.country}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-950 text-slate-400">
                      {loc.elevation}m ASL
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-400 text-center">
                  No exact match. Try Kathmandu, Pokhara, Biratnagar, Chitwan, or Tirupati.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Data Source Connectivity Bar */}
        <div className="lg:col-span-8 bg-dark-900/80 p-2 rounded-xl border border-cyan-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>DATA SOURCES:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10.5px]">
            {dataSources.map(ds => (
              <div key={ds.id} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  ds.status === 'CONNECTED' ? 'bg-emerald-400' : ds.status === 'DELAYED' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span className="text-slate-300 font-bold">{ds.name.split(' ')[0]}:</span>
                <span className={`font-bold ${
                  ds.status === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {ds.status}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400">
            REFRESH: <strong className="text-cyan-300">{lastRefreshedTime}</strong>
          </div>
        </div>
      </div>

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
              <span>SPATIAL WATERSHED & WEATHER SYMBOL CANVAS — {state.selectedRegion.toUpperCase()}</span>
            </div>

            <div className="text-[10px] text-slate-400 hidden sm:block">
              LIVE WEATHER SYMBOLS • NO CIRCLES • RIVER LINES
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
        <NextAffectedAreas />
        <SafeRoutePanel />
      </div>
    </div>
  );
};
