import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Sliders, CloudRain, Waves, Droplets, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import { LivingMap } from '../map/LivingMap';
import { NextAreaAtRisk } from '../prediction/NextAreaAtRisk';
import { SaferAreas } from '../response/SaferAreas';
import { StatusBadge } from '../layout/StatusBadge';

export const SimulationPage: React.FC = () => {
  const { state, updateState, applyPreset, intel } = useSimulation();

  const presets = [
    { name: 'NORMAL' as const, label: 'NORMAL RAIN', desc: '20 mm/hr shower' },
    { name: 'HEAVY' as const, label: 'HEAVY RAIN', desc: '65 mm/hr monsoon' },
    { name: 'EXTREME' as const, label: 'EXTREME CLOUDBURST', desc: '100 mm/hr torrential burst' },
  ];

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-extrabold text-base text-white uppercase tracking-wider">
              WEATHER → FLOOD CASCADING SIMULATION LAB
            </h2>
            <p className="text-[10px] text-slate-400">REAL-TIME HYDRODYNAMICS FEEDBACK LOOP</p>
          </div>
        </div>
        <StatusBadge status="MODEL OUTPUT" label="DYNAMIC SIMULATION" />
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p.name)}
            className={`p-3 rounded-xl border text-left transition-all ${
              state.preset === p.name
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-glow'
                : 'bg-dark-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-extrabold text-xs">{p.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Sliders Grid */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-extrabold text-white uppercase border-b border-slate-800 pb-2">
          HYDROLOGICAL CONTROLS (CHANGING RAINFALL AUTOMATICALLY UPDATES THE RISK CASCADES)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Rainfall */}
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <CloudRain className="w-4 h-4 text-cyan-400" /> Rainfall Intensity
              </span>
              <span className="text-cyan-400 font-extrabold">{state.rainfall} mm/hr</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={state.rainfall}
              onChange={(e) => updateState({ rainfall: Number(e.target.value), preset: 'CUSTOM' })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* River Level */}
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <Waves className="w-4 h-4 text-blue-400" /> River Water Height
              </span>
              <span className="text-blue-400 font-extrabold">{state.riverLevel} meters</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.5"
              step="0.1"
              value={state.riverLevel}
              onChange={(e) => updateState({ riverLevel: Number(e.target.value), preset: 'CUSTOM' })}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          {/* Soil Saturation */}
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <Droplets className="w-4 h-4 text-emerald-400" /> Soil Saturation Level
              </span>
              <span className="text-emerald-400 font-extrabold">{state.soilSaturation}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={state.soilSaturation}
              onChange={(e) => updateState({ soilSaturation: Number(e.target.value), preset: 'CUSTOM' })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Drainage Capacity */}
          <div className="p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <Zap className="w-4 h-4 text-amber-400" /> Ground Drainage Capacity
              </span>
              <span className="text-amber-400 font-extrabold">{state.drainageCapacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={state.drainageCapacity}
              onChange={(e) => updateState({ drainageCapacity: Number(e.target.value), preset: 'CUSTOM' })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Cascade Visualization */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 h-[460px] rounded-xl overflow-hidden">
          <LivingMap />
        </div>
        <div className="xl:col-span-5 space-y-3">
          <NextAreaAtRisk />
          <SaferAreas />
        </div>
      </div>
    </div>
  );
};
