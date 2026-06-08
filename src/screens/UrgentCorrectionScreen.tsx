import React from 'react';
import type { UrgentCorrectionData } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface UrgentCorrectionScreenProps {
  data: UrgentCorrectionData;
  onPracticeAgain: () => void;
  onBackToPhrase: () => void;
}

export const UrgentCorrectionScreen: React.FC<UrgentCorrectionScreenProps> = ({
  data,
  onPracticeAgain,
  onBackToPhrase,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-teal-400 to-emerald-500 px-5 pt-14 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            🙌
          </div>
          <div>
            <h1 className="text-white text-2xl font-extrabold">¡Bien!</h1>
            <p className="text-white/80 text-sm mt-0.5">Vamos a mejorar la frase.</p>
          </div>
        </div>

        {/* Score */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-xs font-semibold">Tu pronunciación</span>
            <span className="text-white font-bold text-sm">68%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2.5">
            <div className="bg-white rounded-full h-2.5 transition-all duration-700" style={{ width: '68%' }} />
          </div>
        </div>
      </div>

      {/* Correction cards */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <Card accent="orange" className="mb-4">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Lo que dijiste</p>
          <p className="text-gray-700 text-lg">"{data.whatYouSaid}"</p>
        </Card>

        <Card accent="green" className="bg-green-50 mb-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Forma correcta</p>
          <p className="text-gray-800 font-bold text-xl leading-snug">"{data.correctForm}"</p>
        </Card>

        <Card accent="blue" className="mb-4">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Corrección</p>
          <p className="text-gray-700 leading-relaxed">{data.correction}</p>
        </Card>

        <Card accent="purple" className="bg-purple-50 mb-4">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Pronunciación aproximada</p>
          <p className="text-purple-700 font-medium italic leading-relaxed">"{data.pronunciation}"</p>
        </Card>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex gap-3 mb-4">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-1">Nota del coach</p>
            <p className="text-gray-700 text-sm leading-relaxed">{data.coachNote}</p>
          </div>
        </div>

        <Button
          onClick={onPracticeAgain}
          color="green"
          variant="primary"
          size="lg"
          fullWidth
          className="mb-3"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          }
        >
          Practicar de nuevo
        </Button>

        <Button
          onClick={onBackToPhrase}
          color="gray"
          variant="secondary"
          size="lg"
          fullWidth
        >
          Volver a la frase
        </Button>
      </div>
    </div>
  );
};
