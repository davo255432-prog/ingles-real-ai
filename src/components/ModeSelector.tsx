import React from 'react';
import type { InputMode } from '../types';

interface ModeSelectorProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex gap-2 mb-5">
      <button
        onClick={() => onModeChange('voice')}
        className={[
          'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200',
          mode === 'voice'
            ? 'border-orange-500 bg-orange-50 text-orange-600'
            : 'border-gray-200 bg-white text-gray-400',
        ].join(' ')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        Decirlo con voz
        {mode === 'voice' && (
          <span className="ml-1 text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5">
            activo
          </span>
        )}
      </button>

      <button
        onClick={() => onModeChange('write')}
        className={[
          'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200',
          mode === 'write'
            ? 'border-orange-500 bg-orange-50 text-orange-600'
            : 'border-gray-200 bg-white text-gray-400',
        ].join(' ')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Escribir
        {mode === 'write' && (
          <span className="ml-1 text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5">
            activo
          </span>
        )}
      </button>
    </div>
  );
};
