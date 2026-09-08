import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldAlert, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export const RiskGauge: React.FC = () => {
  const { intel } = useSimulation();
  const { floodProbability, riskLevel, confidenceScore, uncertaintyMargin } = intel;

  const strokeDashoffset = 440 - (440 * floodProbability) / 100;

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'CRITICAL': return '#EF4444';
      case 'VERY HIGH': return '#F97316';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 tracking-wider uppercase flex items-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
        <span>FLOOD PROBABILITY INDEX</span>
      </div>

      <div className="relative w-44 h-44 mt-4 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="rgba(30, 41, 59, 0.8)"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Dynamic progress circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getRiskColor()}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="440"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${getRiskColor()})` }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            key={floodProbability}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-4xl font-extrabold font-mono tracking-tight text-white"
          >
            {floodProbability}%
          </motion.span>
          <span 
            className="text-xs font-mono font-bold px-2 py-0.5 rounded mt-1 uppercase tracking-widest"
            style={{ 
              backgroundColor: `${getRiskColor()}20`, 
              color: getRiskColor(),
              border: `1px solid ${getRiskColor()}40` 
            }}
          >
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Confidence & Uncertainty */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
        <div className="bg-dark-900/60 p-2 rounded border border-slate-800">
          <span className="text-slate-400 block text-[10px]">CONFIDENCE</span>
          <span className="text-cyan-300 font-bold">{confidenceScore}%</span>
        </div>
        <div className="bg-dark-900/60 p-2 rounded border border-slate-800">
          <span className="text-slate-400 block text-[10px]">UNCERTAINTY</span>
          <span className="text-amber-400 font-bold">±{uncertaintyMargin}%</span>
        </div>
      </div>
    </div>
  );
};
