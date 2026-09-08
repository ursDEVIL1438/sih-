import React from 'react';
import { SUPPORTED_LANGUAGES } from '../../i18n/alerts';

export const LanguageSelector: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <select
        aria-label="Alert language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-dark-900 border border-slate-800 text-white px-2 py-1 rounded"
      >
        {SUPPORTED_LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.emoji ? `${l.emoji} ${l.label}` : l.label}</option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSelector;
