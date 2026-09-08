import React from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Map, 
  Sliders, 
  Navigation as NavIcon, 
  Bell 
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const navItems: NavItem[] = [
  { id: 'command-center', label: 'COMMAND CENTER', icon: LayoutDashboard },
  { id: 'prediction', label: 'PREDICTION', icon: BrainCircuit },
  { id: 'flood-map', label: 'FLOOD MAP', icon: Map },
  { id: 'simulation', label: 'SIMULATION', icon: Sliders },
  { id: 'evacuation', label: 'EVACUATION', icon: NavIcon },
  { id: 'alerts', label: 'ALERTS', icon: Bell }
];

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useSimulation();

  return (
    <aside className="w-56 bg-[#050B14]/95 border-r border-cyan-500/20 flex flex-col h-[calc(100vh-53px)] select-none shrink-0 z-20 overflow-y-auto">
      <div className="p-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase border-b border-slate-800/80 flex items-center justify-between">
        <span>CORE MODULES</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-xs font-mono transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border border-cyan-500/40 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'
                }`} />
                <span className="font-bold tracking-tight">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 bg-dark-950 text-xs font-mono text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span>SYSTEM DISPATCH</span>
          <span className="text-emerald-400 font-bold">READY</span>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div className="bg-cyan-400 h-full w-4/5 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
