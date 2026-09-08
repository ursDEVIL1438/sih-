import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export const TimelineScrubber: React.FC = () => {
  const { state, setTimelineMinute } = useSimulation();
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineSteps = [-120, -90, -60, -30, 0, 30, 60, 90, 120];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineMinute(state.timelineMinute >= 120 ? -120 : state.timelineMinute + 10);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, state.timelineMinute, setTimelineMinute]);

  const formatTimelineLabel = (min: number) => {
    if (min === 0) return 'NOW';
    if (min < 0) return `T${min} MIN`;
    return `T+${min} MIN`;
  };

  return (
    <div className="glass-panel p-3 rounded-xl space-y-2 select-none">
      <div className="flex items-center justify-between font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            STORM TIMELINE SCRUBBER — {formatTimelineLabel(state.timelineMinute)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-[11px] flex items-center gap-1 shadow-cyan-glow"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY STORM'}</span>
          </button>
          <button
            onClick={() => { setIsPlaying(false); setTimelineMinute(0); }}
            className="p-1 rounded bg-dark-800 border border-slate-700 text-slate-400 hover:text-white"
            title="Reset to NOW"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrubber track */}
      <div className="relative w-full pt-2">
        <input
          type="range"
          min="-120"
          max="120"
          step="10"
          value={state.timelineMinute}
          onChange={(e) => setTimelineMinute(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />

        {/* Step Ticks */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
          {timelineSteps.map((step) => (
            <span
              key={step}
              onClick={() => setTimelineMinute(step)}
              className={`cursor-pointer transition-colors ${
                state.timelineMinute === step ? 'text-cyan-400 font-bold underline' : 'hover:text-slate-200'
              }`}
            >
              {formatTimelineLabel(step)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
