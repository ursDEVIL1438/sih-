import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import AlertPanel from './AlertPanel';
import { useSimulation } from '../../context/SimulationContext';

export const AlertButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { intel, earlyWarning } = useSimulation();

  const isCritical = (earlyWarning && (earlyWarning.level === 'CRITICAL' || earlyWarning.level === 'EVACUATE NOW')) || intel.riskLevel === 'CRITICAL';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex items-center gap-2 px-3 py-1.5 rounded ml-2 border font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${isCritical ? 'bg-amber-500 text-black border-amber-400' : 'bg-red-600/80 text-white border-red-500/50'}`}
        title="ALERT"
      >
        <Bell className="w-4 h-4" />
        <span className="text-sm">ALERT</span>
      </button>
      {open && <AlertPanel onClose={() => setOpen(false)} />}
    </div>
  );
};

export default AlertButton;
