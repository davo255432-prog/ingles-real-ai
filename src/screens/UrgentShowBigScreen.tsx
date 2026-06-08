import React from 'react';
import type { UrgentPhraseData } from '../types';

interface UrgentShowBigScreenProps {
  data: UrgentPhraseData;
  onBack: () => void;
}

export const UrgentShowBigScreen: React.FC<UrgentShowBigScreenProps> = ({
  data,
  onBack,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Back button — minimal */}
      <div className="px-5 pt-10 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </button>
      </div>

      {/* Big phrase — center of screen */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-6">
          En inglés
        </p>

        <p className="text-4xl font-extrabold text-gray-900 leading-tight mb-6">
          "{data.phraseInEnglish}"
        </p>

        <div className="w-16 h-0.5 bg-teal-400 rounded-full mb-6" />

        <p className="text-gray-500 text-xl leading-relaxed">
          "{data.situation}"
        </p>

        <p className="text-teal-400 text-sm italic mt-8">
          🔊 {data.pronunciation}
        </p>
      </div>

      {/* Bottom hint */}
      <div className="px-6 pb-10 text-center">
        <p className="text-gray-300 text-xs">Muestra esta pantalla a la otra persona</p>
      </div>
    </div>
  );
};
