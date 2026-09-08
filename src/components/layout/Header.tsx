import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import { MONITORED_LOCATIONS } from '../../data/locations';
import { Zap, Thermometer, Wind, Globe, RefreshCw, Cpu } from 'lucide-react';
import AlertButton from './AlertButton';

export const Header: React.FC = () => {
  const { 
    state, 
    selectLocation, 
    intel, 
    lastRefreshedTime, 
    refreshLiveData, 
    isFetchingData 
  } = useSimulation();

  return (
    <header className="w-full bg-[#050B14]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm z-30 sticky top-0 select-none font-mono">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center shadow-cyan-glow">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 text-base font-mono">
              JALDRISHTI X
            </h1>
            <p className="text-[9.5px] text-slate-400 font-mono tracking-tight hidden sm:block">
              REAL-TIME DATA-DRIVEN FLASH FLOOD PREDICTION & EARLY WARNING SYSTEM
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden lg:block" />

        {/* Location Selector */}
        <div className="flex items-center gap-1.5 bg-dark-900 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-xs text-cyan-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select 
            value={state.activeLocationId || 'KTM'} 
            onChange={(e) => selectLocation(e.target.value)}
            className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
          >
            {MONITORED_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id} className="bg-dark-950 text-slate-200">
                {loc.name} ({loc.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Live Weather Telemetry */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <span className="text-base">🌧️</span>
          <span>RAIN: <strong className="text-white">{state.rainfall} mm/hr</strong></span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <Thermometer className="w-3.5 h-3.5" />
          <span>SOIL: <strong className="text-white">{state.soilSaturation}%</strong></span>
        </div>
        <div className="flex items-center gap-1 text-blue-400">
          <Wind className="w-3.5 h-3.5" />
          <span>RIVER: <strong className="text-white">{state.riverLevel} m</strong></span>
        </div>
      </div>

      {/* Right Truthful System Status & Refresh */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <div className="hidden xl:flex items-center gap-2 bg-dark-900 px-2.5 py-1 rounded border border-slate-800 text-[10.5px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            SYSTEM: ONLINE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">WEATHER: LIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300">HYDROLOGY: LIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            RISK ENGINE: ONLINE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">UPDATED: {lastRefreshedTime}</span>
        </div>

        <button
          onClick={() => refreshLiveData()}
          disabled={isFetchingData}
          className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 transition-all flex items-center gap-1 text-xs"
          title="Refresh Live Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingData ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">REFRESH</span>
        </button>

        <StatusBadge 
          status={intel.dataStatus === 'LIVE' ? 'LIVE' : intel.dataStatus === 'API' ? 'API' : 'HISTORICAL'} 
          label={intel.dataStatus === 'LIVE' ? 'LIVE DATA FUSION' : intel.dataStatus} 
        />
        <div className="ml-2">
          <AlertButton />
        </div>
      </div>
    </header>
  );
};
