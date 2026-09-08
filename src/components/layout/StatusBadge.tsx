import React from 'react';
import { SystemDataStatus } from '../../types';

interface StatusBadgeProps {
  status?: SystemDataStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'SIMULATED', label, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'LIVE':
      case 'OFFICIAL':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'API':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'SIMULATED':
      case 'DEMO':
      case 'MODEL OUTPUT':
      default:
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    }
  };

  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border ${getBadgeStyle()} ${px}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label || status}
    </span>
  );
};
