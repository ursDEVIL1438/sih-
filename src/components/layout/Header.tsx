import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import { fetchLiveWeatherOpenMeteo, OpenMeteoWeatherData } from '../../utils/openMeteoApi';
import { Zap, MapPin, CloudRain, Thermometer, Wind, Radio, Activity, Cpu, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { state, updateState } = useSimulation();
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [liveWeather, setLiveWeather] = useState<OpenMeteoWeatherData | null>(null);

  const regionCoords: Record<string, { lat: number; lng: number }> = {
    'Nepal Watershed': { lat: 27.7172, lng: 85.3240 },
    'Tirupati Hills': { lat: 13.645, lng: 79.425 },
    'Himalayan Basins': { lat: 30.375, lng: 79.525 },
  };

  useEffect(() => {
    const coords = regionCoords[state.selectedRegion] || regionCoords['Nepal Watershed'];
    fetchLiveWeatherOpenMeteo(coords.lat, coords.lng).then((res) => {
      setLiveWeather(res);
    });
  }, [state.selectedRegion]);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLastUpdated(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, []);

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
              SEE THE RISK. PREDICT THE IMPACT. ACT BEFORE DISASTER.
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden lg:block" />

        {/* Region Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-dark-900 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-xs text-cyan-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select 
            value={state.selectedRegion} 
            onChange={(e) => updateState({ selectedRegion: e.target.value })}
            className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer"
          >
            <option value="Nepal Watershed" className="bg-dark-950 text-slate-200">🇳🇵 Nepal Watersheds</option>
            <option value="Tirupati Hills" className="bg-dark-950 text-slate-200">🇮🇳 Tirupati Swarnamukhi</option>
            <option value="Himalayan Basins" className="bg-dark-950 text-slate-200">⛰️ Himalayan Ridge</option>
          </select>
        </div>
      </div>

      {/* Center Live Weather Telemetry (Open-Meteo Live API) */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <span className="text-base">{liveWeather?.weatherSymbol || '🌧️'}</span>
          <span>RAIN: <strong className="text-white">{liveWeather?.precipitationMmHr || state.rainfall} mm/hr</strong></span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Thermometer className="w-3.5 h-3.5" />
          <span>TEMP: <strong className="text-white">{liveWeather?.temperatureC || 24} °C</strong></span>
        </div>
        <div className="flex items-center gap-1 text-blue-400">
          <Wind className="w-3.5 h-3.5" />
          <span>WIND: <strong className="text-white">{liveWeather?.windSpeedKmH || 28} km/h</strong></span>
        </div>
      </div>

      {/* Right Telemetry & Production Status Indicator */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <div className="hidden xl:flex items-center gap-2 bg-dark-900 px-2.5 py-1 rounded border border-slate-800 text-[10.5px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            SYSTEM: ONLINE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">DATA: OPEN-METEO API</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-300 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            AI MODEL: ACTIVE
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-300">MAP: ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">UPDATED: {lastUpdated}</span>
        </div>

        <StatusBadge status="API" label="OPEN-METEO LIVE" />
      </div>
    </header>
  );
};
