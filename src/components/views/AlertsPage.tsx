import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Bell, Smartphone, Radio, Volume2 } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const AlertsPage: React.FC = () => {
  const { earlyWarning, state } = useSimulation();

  const alerts = [
    {
      id: earlyWarning.id,
      timestamp: earlyWarning.timestamp,
      level: earlyWarning.level,
      targetZone: earlyWarning.targetZone,
      deliveryState: earlyWarning.dispatchStatus,
      messageEn: `EMERGENCY ALERT: ${earlyWarning.level} for ${earlyWarning.targetZone}. Projected risk ${earlyWarning.projectedRiskPct}% in ~${earlyWarning.escalationMinutes} mins due to ${state.rainfall} mm/hr rainfall. ${earlyWarning.recommendedAction}`,
      messageHi: `आपातकालीन चेतावनी: ${earlyWarning.targetZone} के लिए ${earlyWarning.level}। भारी वर्षा के कारण आगामी ${earlyWarning.escalationMinutes} मिनटों में ${earlyWarning.projectedRiskPct}% बाढ़ का जोखिम। सुरक्षित स्थान पर जाएं।`,
      messageNp: `आपतकालीन चेतावनी: ${earlyWarning.targetZone} को लागि ${earlyWarning.level}। अत्यधिक वर्षाको कारण आगामी ${earlyWarning.escalationMinutes} मिनेटमा ${earlyWarning.projectedRiskPct}% बाढीको जोखिम। सुरक्षित स्थानमा जानुहोस्।`,
      messageTe: `అత్యవసర హెచ్చరిక: ${earlyWarning.targetZone} లో ${earlyWarning.level}। రాబోయే ${earlyWarning.escalationMinutes} నిమిషాల్లో ${earlyWarning.projectedRiskPct}% వరద ముప్పు. సురక్షిత ప్రాంతాలకు వెళ్లండి.`,
    }
  ];

  return (
    <div className="w-full h-full p-4 space-y-4 overflow-y-auto font-mono select-none">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-400 animate-bounce" />
          <h2 className="font-bold text-base text-white uppercase tracking-wider">
            MULTILINGUAL EARLY WARNING BROADCAST HUB
          </h2>
        </div>
        <StatusBadge status="API" label="EARLY WARNING DISPATCH" />
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="glass-panel p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  alert.level === 'CRITICAL' || alert.level === 'EVACUATE NOW' 
                    ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                }`}>
                  {alert.level}
                </span>
                <span className="text-white font-bold text-xs">{alert.targetZone}</span>
              </div>
              <span className="text-slate-400 text-xs">{alert.timestamp}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-dark-900 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block text-[10px]">ENGLISH BROADCAST</span>
                <p className="text-slate-200">{alert.messageEn}</p>
              </div>
              <div className="p-3 bg-dark-900 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block text-[10px]">NEPALI (नेपाली) BROADCAST</span>
                <p className="text-slate-200">{alert.messageNp}</p>
              </div>
              <div className="p-3 bg-dark-900 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block text-[10px]">HINDI (हिंदी) BROADCAST</span>
                <p className="text-slate-200">{alert.messageHi}</p>
              </div>
              <div className="p-3 bg-dark-900 rounded border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block text-[10px]">TELUGU (తెలుగు) BROADCAST</span>
                <p className="text-slate-200">{alert.messageTe}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-cyan-400" /> SMS ADVISORY GATEWAY</span>
                <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-cyan-400" /> PUBLIC BROADCAST FEED</span>
              </div>
              <span className="text-cyan-400 font-bold">DISPATCH STATUS: {alert.deliveryState}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
