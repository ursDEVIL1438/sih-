import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldAlert, Play, Box, ArrowRight, Zap, CloudRain, Waves, Droplets } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

interface LandingPageProps {
  onEnter: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const { intel, state } = useSimulation();

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      {/* Background Grid & Atmospheric Lighting */}
      <div className="absolute inset-0 radar-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Top Header Logo */}
      <div className="z-10 flex items-center gap-2 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 shadow-cyan-glow">
          <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
        </div>
        <span className="font-mono font-extrabold text-sm tracking-widest text-cyan-400 uppercase">
          JALDRISHTI X DISASTER PLATFORM
        </span>
      </div>

      {/* Hero Headings */}
      <div className="z-10 max-w-4xl space-y-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-mono leading-tight">
          SEE THE RISK. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
            PREDICT THE IMPACT.
          </span> <br />
          ACT BEFORE DISASTER.
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 font-mono max-w-2xl mx-auto leading-relaxed">
          AI-Powered Flash Flood Intelligence, Digital Twin & Autonomous Disaster Response Platform for Vulnerable Hilly Regions.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-4 mt-8">
        <button
          onClick={() => onEnter('command-center')}
          className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-mono font-extrabold text-sm shadow-cyan-glow flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <span>ENTER COMMAND CENTER</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEnter('simulation')}
          className="px-6 py-3.5 rounded-xl bg-dark-900 hover:bg-dark-800 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm flex items-center gap-2 transition-all"
        >
          <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
          <span>RUN LIVE SIMULATION</span>
        </button>

        <button
          onClick={() => onEnter('digital-twin')}
          className="px-6 py-3.5 rounded-xl bg-dark-900 hover:bg-dark-800 border border-purple-500/40 text-purple-300 font-mono font-bold text-sm flex items-center gap-2 transition-all"
        >
          <Box className="w-4 h-4 text-purple-400" />
          <span>EXPLORE DIGITAL TWIN</span>
        </button>
      </div>

      {/* Telemetry Bar Box */}
      <div className="z-10 w-full max-w-5xl mt-12 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        <div className="glass-panel p-3.5 rounded-xl text-left border-cyan-500/30">
          <span className="text-slate-400 text-[10px] block">RAINFALL</span>
          <span className="text-cyan-400 font-extrabold text-lg">{state.rainfall} mm/hr</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl text-left border-cyan-500/30">
          <span className="text-slate-400 text-[10px] block">SOIL SATURATION</span>
          <span className="text-emerald-400 font-extrabold text-lg">{state.soilSaturation}%</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl text-left border-cyan-500/30">
          <span className="text-slate-400 text-[10px] block">RIVER LEVEL</span>
          <span className="text-blue-400 font-extrabold text-lg">{state.riverLevel} m</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl text-left border-red-500/40">
          <span className="text-slate-400 text-[10px] block">FLOOD PROBABILITY</span>
          <span className="text-red-400 font-extrabold text-lg">{intel.floodProbability}%</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl text-left border-amber-500/40">
          <span className="text-slate-400 text-[10px] block">TIME TO IMPACT</span>
          <span className="text-amber-400 font-extrabold text-lg">{intel.timeToImpactMinutes} MIN</span>
        </div>
      </div>
    </div>
  );
};
