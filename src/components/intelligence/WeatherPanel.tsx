import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CloudRain, Thermometer, Wind, Eye, Gauge, Compass } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatusBadge } from '../layout/StatusBadge';

export const WeatherPanel: React.FC = () => {
  const { state } = useSimulation();

  const chartData = [
    { time: '08:00', rain: 12 },
    { time: '10:00', rain: 24 },
    { time: '12:00', rain: 45 },
    { time: '14:00', rain: state.rainfall },
    { time: '16:00 (FC)', rain: Math.round(state.rainfall * 1.1) },
    { time: '18:00 (FC)', rain: Math.round(state.rainfall * 0.8) },
  ];

  return (
    <div className="glass-panel p-4 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            WEATHER INTELLIGENCE ENGINE
          </h3>
        </div>
        <StatusBadge status="API" label="IMD / GPM ADAPTER" />
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="bg-dark-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px] block">PRECIPITATION</span>
          <span className="text-cyan-400 font-bold text-base">{state.rainfall} mm/hr</span>
        </div>
        <div className="bg-dark-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px] block">TEMPERATURE</span>
          <span className="text-amber-400 font-bold text-base">24.2 °C</span>
        </div>
        <div className="bg-dark-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px] block">WIND SPEED</span>
          <span className="text-blue-400 font-bold text-base">38 km/h NW</span>
        </div>
        <div className="bg-dark-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px] block">HUMIDITY</span>
          <span className="text-emerald-400 font-bold text-base">92% RH</span>
        </div>
      </div>

      {/* Rainfall Chart */}
      <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-slate-300 font-bold">HISTORICAL & FORECAST PRECIPITATION TRAJECTORY</span>
          <span className="text-cyan-400 text-[10px]">6H HISTORICAL / 4H FORECAST</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: '#07111F', border: '1px solid #22D3EE', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="rain" stroke="#22D3EE" fillOpacity={1} fill="url(#rainGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
