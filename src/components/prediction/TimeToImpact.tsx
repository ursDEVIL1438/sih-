import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export const TimeToImpact: React.FC = () => {
  const { intel } = useSimulation();
  const { timeToImpactMinutes, riskLevel } = intel;

  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedMins = String(timeToImpactMinutes).padStart(2, '0');
  const formattedSecs = String(seconds).padStart(2, '0');

  const isCritical = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return (
    <div className={`p-4 rounded-xl text-center relative overflow-hidden transition-all ${
      isCritical ? 'glass-panel-danger border-red-500/50 shadow-red-glow' : 'glass-panel'
    }`}>
      <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
        <Clock className={`w-4 h-4 ${isCritical ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />
        <span>TIME TO POTENTIAL IMPACT</span>
      </div>

      <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-white my-1 flex items-center justify-center gap-1">
        <span>{formattedMins}</span>
        <span className="animate-pulse text-cyan-400">:</span>
        <span>{formattedSecs}</span>
      </div>

      <p className="text-[11px] font-mono text-slate-300 mt-1 uppercase">
        {isCritical ? '🚨 CRITICAL WARNING: PREPARE IMMINENT EVACUATION' : 'ESTIMATED INUNDATION WINDOW'}
      </p>
    </div>
  );
};
