import { useEffect, useRef, useState } from 'react';
import { AlertLanguage } from '../i18n/alerts';

export interface UseVoiceAlertOptions {
  lang: AlertLanguage;
}

export function useVoiceAlert({ lang }: UseVoiceAlertOptions) {
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [supported, setSupported] = useState<boolean>(!!synthRef.current);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(!!synthRef.current);
    return () => {
      try { synthRef.current && synthRef.current.cancel(); } catch (e) {}
    };
  }, []);

  function _selectVoiceForLang(code: string) {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    // prefer exact locale match, then prefix match
    let v = voices.find(v => v.lang.toLowerCase() === code.toLowerCase());
    if (!v) v = voices.find(v => v.lang.toLowerCase().startsWith(code.split('-')[0]));
    return v || null;
  }

  function getBestVoice(code: string) {
    try {
      return _selectVoiceForLang(code);
    } catch (e) {
      return null;
    }
  }

  function speak(text: string, voiceCode: string) {
    if (!synthRef.current) return Promise.reject(new Error('Speech not supported'));
    // cancel any previous
    try { synthRef.current.cancel(); } catch (e) {}
    utterRef.current = new SpeechSynthesisUtterance(text);
    const v = _selectVoiceForLang(voiceCode);
    if (v) utterRef.current.voice = v;
    utterRef.current.lang = voiceCode;
    return new Promise<void>((resolve) => {
      if (!utterRef.current) return resolve();
      utterRef.current.onend = () => { setSpeaking(false); resolve(); };
      utterRef.current.onerror = () => { setSpeaking(false); resolve(); };
      setSpeaking(true);
      synthRef.current!.speak(utterRef.current);
    });
  }

  function stop() {
    try { synthRef.current && synthRef.current.cancel(); } catch (e) {}
    setSpeaking(false);
  }

  return { supported, speak, stop, speaking, getBestVoice };
}

export default useVoiceAlert;
