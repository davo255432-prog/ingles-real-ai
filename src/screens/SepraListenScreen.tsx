import React, { useState } from 'react';
import { SepraStepIndicator } from '../components/SepraStepIndicator';
import { Button } from '../components/Button';

interface SepraListenScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const SepraListenScreen: React.FC<SepraListenScreenProps> = ({
  onBack,
  onNext,
}) => {
  const [playing, setPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const handleListen = () => {
    setPlaying(true);
    setTimeout(() => {
      setPlaying(false);
      setHasListened(true);
    }, 2500);
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
          <h1 className="text-xl font-bold text-blue-600">Escucha</h1>
        </div>

        <SepraStepIndicator currentStep={1} />

        {/* Instruction */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
          <span className="text-xl flex-shrink-0">👂</span>
          <p className="text-gray-700 text-sm leading-relaxed font-medium">
            Primero escucha la frase completa. Presta atención a cómo suena.
          </p>
        </div>

        {/* Phrase card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-5 text-center">
          <p className="text-gray-800 text-3xl font-extrabold mb-4">"I don't understand."</p>
          <div className="bg-indigo-50 rounded-xl px-4 py-3 inline-block">
            <p className="text-indigo-600 font-mono font-semibold text-lg tracking-wide">
              ai dont an-der-STAND
            </p>
          </div>
        </div>

        {/* Listen button */}
        <button
          onClick={handleListen}
          disabled={playing}
          className={[
            'w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-semibold text-lg transition-all duration-200 active:scale-95 mb-3',
            playing
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200',
          ].join(' ')}
        >
          {playing ? (
            <>
              <span className="flex gap-1 items-center">
                <span className="w-1 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '120ms' }} />
                <span className="w-1 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '240ms' }} />
                <span className="w-1 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '360ms' }} />
              </span>
              Escuchando...
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              Escuchar frase
            </>
          )}
        </button>

        {hasListened && (
          <p className="text-center text-xs text-green-500 font-semibold mt-1">
            ✓ Escuchada — escúchala de nuevo si quieres
          </p>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button
          onClick={onNext}
          color="blue"
          variant="primary"
          size="lg"
          fullWidth
        >
          Entendí, seguir →
        </Button>
      </div>
    </div>
  );
};
