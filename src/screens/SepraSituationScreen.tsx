import React, { useState } from 'react';
import { SepraStepIndicator } from '../components/SepraStepIndicator';
import { Button } from '../components/Button';

interface SepraSituationScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const SepraSituationScreen: React.FC<SepraSituationScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [playing, setPlaying] = useState(false);

  const handleListen = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-4">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-blue-600">Situación</h1>
        </div>

        <SepraStepIndicator currentStep={0} />

        {/* Situation question */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">¿Cuándo usas esta frase?</p>
          <p className="text-gray-800 text-lg font-semibold leading-snug">
            "Alguien te habla rápido en inglés y no entiendes. ¿Qué dices?"
          </p>
        </div>

        {/* The phrase */}
        <div className="bg-blue-500 rounded-2xl p-6 mb-4 text-center">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-3">La frase</p>
          <p className="text-white text-3xl font-extrabold mb-2">"I don't understand."</p>
          <p className="text-blue-200 text-base font-medium">"No entiendo."</p>
        </div>

        {/* Listen button */}
        <Button
          onClick={handleListen}
          color="blue"
          variant={playing ? 'primary' : 'secondary'}
          size="md"
          fullWidth
          className="mb-6"
          icon={
            playing ? (
              <span className="flex gap-0.5 items-center">
                <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )
          }
        >
          {playing ? 'Reproduciendo...' : 'Escuchar'}
        </Button>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button onClick={onNext} color="blue" variant="primary" size="lg" fullWidth
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" transform="rotate(180 12 12)" />
            </svg>
          }
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
