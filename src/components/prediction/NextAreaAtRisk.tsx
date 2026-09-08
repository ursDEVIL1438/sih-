import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { motion } from 'framer-motion';

export const NextAreaAtRisk: React.FC = () => {
  const { nextAreaPrediction, intel } = useSimulation();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'VERY HIGH': return '#F97316';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  const color = getRiskColor(nextAreaPrediction.riskLevel);
  const strokeDashoffset = 360 - (360 * nextAreaPrediction.dangerScore) / 100;

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            NEXT AREA AT RISK
          </h3>
        </div>
        <StatusBadge status="MODEL ESTIMATE" label="SPATIAL PROPAGATION" />
      </div>

      {/* Hero Card Layout */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/80 to-dark-900 border border-red-500/50 shadow-red-glow flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-red-500/20 border border-red-400 text-red-400 uppercase">
              STATUS: {nextAreaPrediction.statusLabel}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white">{nextAreaPrediction.targetZoneName}</h2>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 bg-dark-950 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">EXPECTED IMPACT</span>
              <span className="text-amber-400 font-extrabold text-sm">~{nextAreaPrediction.expectedImpactMinutes} MIN</span>
            </div>
            <div className="p-2 bg-dark-950 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block uppercase">CONFIDENCE</span>
              <span className="text-cyan-400 font-extrabold text-sm">{nextAreaPrediction.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Right Animated Circular Gauge FOR DANGER PERCENTAGE ONLY */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r="58"
              stroke="rgba(30, 41, 59, 0.8)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r="58"
              stroke={color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray="360"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <motion.span 
              key={nextAreaPrediction.dangerScore}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-extrabold text-white"
            >
              {nextAreaPrediction.dangerScore}%
            </motion.span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
              DANGER SCORE
            </span>
          </div>
        </div>
      </div>

      {/* WHY IS IT DANGEROUS? */}
      <div className="p-3 bg-dark-950 rounded-lg border border-slate-800 space-y-1.5 text-xs">
        <span className="text-cyan-400 font-bold uppercase text-[10.5px] block">PRIMARY RISK DRIVERS:</span>
        <div className="space-y-1 text-slate-300">
          {nextAreaPrediction.primaryCauses.map((cause) => (
            <div key={cause} className="flex items-center gap-1.5 text-[11px]">
              <span className="text-red-400 font-bold">•</span>
              <span>{cause}</span>
            </div>
          ))}
        </div>
        <p className="text-[10.5px] text-slate-400 pt-1 border-t border-slate-800/80 italic">
          "{intel.naturalLanguageExplanation}"
        </p>
      </div>
    </div>
  );
};
