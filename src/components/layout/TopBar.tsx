import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { StatusBadge } from './StatusBadge';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  Play, 
  Mic, 
  Volume2, 
  MapPin, 
  Radio, 
  Clock, 
  Sparkles,
  Zap
} from 'lucide-react';
import { OperationalMode } from '../../types';

export const TopBar: React.FC = () => {
  const { 
    state, 
    intel, 
    updateState
  } = useSimulation();

  const setOperationalMode = (_mode: any) => {};
  const triggerAutopilot = () => {};
  const startShowcase = () => {};
  const toggleVoiceListening = () => {};
  const isVoiceListening = false;
  const lastVoiceQuery = '';

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const regions = [
    'Tirupati Hills',
    'Himalayan Region',
    'Western Ghats',
    'Eastern Ghats',
    'Northeast Hills'
  ];

  return (
    <header className="w-full bg-[#050B14]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm z-30 sticky top-0">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center shadow-cyan-glow">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 text-lg font-mono">
                JALDRISHTI X
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-mono tracking-widest uppercase">
                v3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              FLASH FLOOD INTELLIGENCE & DIGITAL TWIN
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden lg:block" />

        {/* Location Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 bg-dark-800/80 px-2.5 py-1 rounded border border-cyan-500/20 text-xs font-mono text-cyan-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <select 
            value={state.selectedRegion} 
            onChange={(e) => updateState({ selectedRegion: e.target.value })}
            className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r} value={r} className="bg-dark-900 text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Telemetry & Mode Selector */}
      <div className="hidden xl:flex items-center gap-5 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-semibold">● OPERATIONAL</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">SOURCES:</span>
          <span className="text-blue-400">12 ACTIVE</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">MODEL:</span>
          <span className="text-purple-400">ENSEMBLE v1.0</span>
        </div>

        <StatusBadge status="SIMULATED" label="DEMO INTELLIGENCE" />

        {/* Mode Toggle: BEFORE / DURING / AFTER */}
        <div className="flex items-center bg-dark-800 p-0.5 rounded border border-slate-700/60">
          {(['BEFORE', 'DURING', 'AFTER'] as OperationalMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setOperationalMode(mode)}
              className={`px-2.5 py-1 text-[11px] font-bold font-mono rounded transition-all ${
                mode === 'BEFORE'
                  ? 'bg-cyan-500 text-dark-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-dark-900 border border-slate-800 text-xs font-mono text-cyan-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime || '14:02:18'} UTC+5:30</span>
        </div>

        {/* Voice Trigger */}
        <button
          onClick={toggleVoiceListening}
          className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono ${
            isVoiceListening 
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
              : 'bg-dark-800 hover:bg-dark-700 border-slate-700 text-slate-300'
          }`}
          title="Voice Control"
        >
          <Mic className={`w-4 h-4 ${isVoiceListening ? 'text-red-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">{isVoiceListening ? 'Listening...' : 'Voice'}</span>
        </button>

        {/* Showcase Mode Button */}
        <button
          onClick={startShowcase}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-300 font-mono text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
          <span className="hidden sm:inline font-bold">SHOWCASE MODE</span>
        </button>

        {/* Emergency Autopilot Button */}
        <button
          onClick={triggerAutopilot}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-red-glow transition-all"
        >
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>ACTIVATE RESPONSE</span>
        </button>
      </div>

      {lastVoiceQuery && (
        <div className="w-full text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 border-t border-cyan-800/40 flex items-center justify-between">
          <span>Voice Command Recognized: "{lastVoiceQuery}"</span>
          <span className="text-slate-500">Executing...</span>
        </div>
      )}
    </header>
  );
};
