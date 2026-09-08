import React, { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { formatAlertMessage, VOICE_TEST_SENTENCES } from '../../i18n/alerts';
import LanguageSelector from '../alerts/LanguageSelector';
import VoiceAlertControls from '../alerts/VoiceAlertControls';
import { AlertLanguage } from '../../i18n/alerts';

const levelToPriority = (l: string) => {
  switch (l) {
    case 'CRITICAL': return 'CRITICAL';
    case 'EVACUATE NOW': return 'CRITICAL';
    case 'VERY HIGH': return 'HIGH';
    case 'HIGH': return 'HIGH';
    case 'MODERATE': return 'MODERATE';
    default: return 'LOW';
  }
};

const AlertPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { intel, earlyWarning, state, weatherPoints, activeRiverStation } = useSimulation();
  const [lang, setLang] = useState<AlertLanguage>(() => {
    try { return (localStorage.getItem('alert:voiceLang') as AlertLanguage) || 'en'; } catch (e) { return 'en'; }
  });
  useEffect(() => { try { localStorage.setItem('alert:voiceLang', lang); } catch (e) {} }, [lang]);
  const [autoVoice, setAutoVoice] = useState<boolean>(false);
  const [lastAutoSpokenId, setLastAutoSpokenId] = useState<string | null>(null);

  const active = earlyWarning || null;

  const templateVars = useMemo(() => ({
    area: active?.targetZone || state.selectedRegion || 'the area',
    risk: active?.currentRiskPct ?? Math.round(intel.floodProbability ?? 0),
  }), [active, state, intel]);

  const message = formatAlertMessage('flash_flood_warning', lang, templateVars);

  // Auto voice for critical only
  useEffect(() => {
    if (!active) return;
    const level = active.level || intel.riskLevel;
    const priority = levelToPriority(level);
    if (autoVoice && (priority === 'CRITICAL')) {
      const id = active.id || `${level}_${templateVars.area}_${templateVars.risk}`;
      if (id !== lastAutoSpokenId) {
        // lazy import voice control to avoid SSR issues
        import('../alerts/VoiceAlertControls').then(mod => {
          const vc = mod.default;
        }).catch(() => {});
        // set last id to avoid repeats
        setLastAutoSpokenId(id);
        // Trigger play via DOM event: rely on user to click 'Play' first in some browsers
        const evt = new CustomEvent('jaldrishti:autoPlayVoice', { detail: { message, lang } });
        window.dispatchEvent(evt as any);
      }
    }
  }, [active, autoVoice, intel, lang, lastAutoSpokenId, templateVars, message]);

  const riskLevelLabel = active?.level || intel.riskLevel;

  return (
    <div role="dialog" aria-modal="true" className="fixed right-4 top-16 z-50 w-96 max-w-full bg-[#071018] border border-amber-400/20 rounded shadow-xl p-4 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${riskLevelLabel === 'CRITICAL' ? 'bg-amber-500 text-black' : 'bg-red-700 text-white'}`}>🚨 {riskLevelLabel}</span>
            <h3 className="text-white font-bold">Emergency Alert</h3>
          </div>
          <div className="text-slate-400 text-xs mt-1">{active?.timestamp || intel.dataTimestamp}</div>
        </div>
        <button aria-label="Close alert" onClick={onClose} className="text-slate-400">✕</button>
      </div>

      <div className="mt-3 text-white">
        <div className="text-sm font-semibold">Area:</div>
        <div className="mb-2">{active?.targetZone || state.selectedRegion}</div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div><div className="text-slate-400">Current Risk</div><div className="text-white font-bold">{active?.currentRiskPct ?? Math.round(intel.floodProbability)}%</div></div>
          <div><div className="text-slate-400">Projected Risk</div><div className="text-white font-bold">{active?.projectedRiskPct ?? Math.round(intel.floodProbability + 5)}%</div></div>
          <div><div className="text-slate-400">Escalation</div><div className="text-white">~{active?.escalationMinutes ?? intel.timeToImpactMinutes} minutes</div></div>
          <div><div className="text-slate-400">Rainfall</div><div className="text-white">{state.rainfall ?? 'N/A'} mm/hr</div></div>
        </div>

        <div className="mb-3 text-slate-300">Recommended Action: <span className="text-white font-bold">{active?.recommendedAction || 'Move to higher ground and follow evacuation routes.'}</span></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
          <div className="w-full">
            <div className="text-xs text-slate-400 mb-1">VOICE LANGUAGE</div>
            <div className="flex items-center gap-2">
              <LanguageSelector value={lang} onChange={(v) => setLang(v as AlertLanguage)} />
              <button
                onClick={() => {
                  const test = VOICE_TEST_SENTENCES[lang] || VOICE_TEST_SENTENCES['en'];
                  const evt = new CustomEvent('jaldrishti:testVoice', { detail: { message: test, lang } });
                  window.dispatchEvent(evt as any);
                }}
                className="px-2 py-1 bg-slate-800 text-white rounded text-sm"
              >
                🔊 TEST VOICE
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={autoVoice} onChange={(e) => setAutoVoice(e.target.checked)} />
              <span>Auto Voice Alert</span>
            </label>
          </div>
        </div>

        <div className="mb-2 text-slate-200">{message}</div>

        <div className="flex items-center justify-between">
          <VoiceAlertControls lang={lang} message={message} onStarted={() => {}} />
          <div className="text-xs text-slate-400">Source: {active?.officialSource || intel.dataStatus}</div>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
