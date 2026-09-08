import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Settings, Key, Database, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const AdminPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('AUTHORITY');
  const [threshold, setThreshold] = useState(80);

  const roles = ['ADMIN', 'AUTHORITY', 'OPERATOR', 'ANALYST', 'CITIZEN'];

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <h2 className="font-bold text-base text-white uppercase tracking-wider">
            ADMIN CONTROL PANEL & ROLE MANAGMENT
          </h2>
        </div>
        <StatusBadge status="OFFICIAL" label="ROLE CONTROL" />
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4 text-xs">
        <h3 className="font-bold text-cyan-300 uppercase">ACTIVE ROLE AUTHORIZATION</h3>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                selectedRole === r ? 'bg-purple-600 text-white shadow-lg' : 'bg-dark-900 border border-slate-800 text-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="font-bold text-cyan-300 uppercase">AUTOMATED CRITICAL ALERT THRESHOLD</h3>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Trigger Alert When Flood Risk Exceeds:</span>
            <span className="text-red-400 font-bold text-sm">{threshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
