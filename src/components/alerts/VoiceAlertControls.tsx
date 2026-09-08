import React, { useEffect, useRef } from 'react';
import useVoiceAlert from '../../hooks/useVoiceAlert';
import { AlertLanguage } from '../../i18n/alerts';

export const VoiceAlertControls: React.FC<{
  lang: AlertLanguage;
  message: string;
  onStarted?: () => void;
}> = ({ lang, message, onStarted }) => {
  const { supported, speak, stop, speaking, getBestVoice } = useVoiceAlert({ lang });
  const lastMsgRef = useRef('');

  useEffect(() => {
    // update last message reference
    lastMsgRef.current = message;
  }, [message]);

  useEffect(() => {
    function handler(e: any) {
      try {
        const detail = e?.detail || {};
        const msg = detail.message || message;
        const l = detail.lang || lang;
        speak(msg, mapLangToCode(l));
      } catch (err) { console.warn('autoPlayVoice failed', err); }
    }
    window.addEventListener('jaldrishti:autoPlayVoice', handler as EventListener);
    // listen for test voice events
    function testHandler(e: any) {
      try {
        const detail = e?.detail || {};
        const msg = detail.message || message;
        const l = detail.lang || lang;
        speak(msg, mapLangToCode(l));
      } catch (err) { console.warn('testVoice failed', err); }
    }
    window.addEventListener('jaldrishti:testVoice', testHandler as EventListener);
    return () => {
      window.removeEventListener('jaldrishti:autoPlayVoice', handler as EventListener);
      window.removeEventListener('jaldrishti:testVoice', testHandler as EventListener);
    };
  }, [message, lang, speak]);

  useEffect(() => {
    // cleanup: stop previous speech when language changes
    stop();
    // also remove test listener on unmount handled above
  }, [lang]);

  return (
    <div className="flex items-center gap-2">
      {!supported && <div className="text-xs text-slate-400">Voice alerts are not supported on this browser</div>}
      {supported && (
        <>
          <button
            aria-label="Play voice alert"
            onClick={async () => { try { await speak(message, mapLangToCode(lang)); if (onStarted) onStarted(); } catch (e) { console.warn(e); } }}
            className="px-3 py-1.5 bg-emerald-500 text-black rounded font-bold text-sm"
          >
            🔊 PLAY VOICE ALERT
          </button>
          <button
            aria-label="Stop voice alert"
            onClick={() => stop()}
            className="px-2 py-1.5 bg-slate-800 text-white rounded text-sm"
          >
            STOP
          </button>
        </>
      )}
      {supported && !getBestVoice(mapLangToCode(lang)) && (
        <div className="text-xs text-amber-300">Voice for this language is unavailable on this device/browser.</div>
      )}
    </div>
  );
};

function mapLangToCode(l: AlertLanguage) {
  switch (l) {
    case 'en': return 'en-IN';
    case 'hi': return 'hi-IN';
    case 'ne': return 'ne-NP';
    case 'te': return 'te-IN';
    case 'kn': return 'kn-IN';
    case 'ta': return 'ta-IN';
    case 'ml': return 'ml-IN';
    case 'mr': return 'mr-IN';
    case 'bn': return 'bn-IN';
    default: return 'en-IN';
  }
}

export default VoiceAlertControls;
