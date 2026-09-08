import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Database, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const DataFusionEngine: React.FC = () => {
  const { dataSources, lastRefreshedTime, refreshLiveData, isFetchingData } = useSimulation();

  return (
    <div className="glass-panel p-4 rounded-xl space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
            CENTRALIZED DATA FUSION PIPELINE
          </h3>
        </div>
        <StatusBadge status="LIVE" label="INDEPENDENT SOURCES" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {dataSources.map((ds) => (
          <div key={ds.id} className="p-3 bg-dark-900 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-[11px]">{ds.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                ds.status === 'CONNECTED' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : ds.status === 'DELAYED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}>
                {ds.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Provider: <strong className="text-slate-300">{ds.providerName}</strong></span>
              <span>Updated: <strong className="text-cyan-300">{ds.lastUpdated}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px]">
        <span className="text-slate-400">Auto-refresh active every 3 minutes.</span>
        <button
          onClick={() => refreshLiveData()}
          disabled={isFetchingData}
          className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isFetchingData ? 'animate-spin' : ''}`} />
          <span>FORCE DATA REFRESH</span>
        </button>
      </div>
    </div>
  );
};
