import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/Button';

interface KitchenListenScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const KitchenListenScreen: React.FC<KitchenListenScreenProps> = ({ onBack, onNext }) => {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleListen = () => {
    setPlaying(true);
    timerRef.current = setTimeout(() => setPlaying(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-4">
        {/* Header */}
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
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Cocina / restaurante</p>
            <h1 className="text-xl font-bold text-blue-600">Escucha</h1>
          </div>
        </div>

        {/* Instruction */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
          <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-lg">
            👂
          </div>
          <p className="text-gray-700 text-sm leading-relaxed self-center">
            Primero escucha cómo suena la frase.
          </p>
        </div>

        {/* Phrase card */}
        <div className="bg-blue-500 rounded-2xl p-5 mb-5 text-center">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-3">Frase</p>
          <p className="text-white text-2xl font-extrabold mb-4">"We're out of onions."</p>
          <div className="bg-white/15 rounded-xl px-4 py-3">
            <p className="text-blue-200 text-xs font-medium mb-1">Pronunciación aproximada</p>
            <p className="text-white text-lg font-bold tracking-wide">wir aut ov Ó-ni-ons</p>
          </div>
        </div>

        {/* Listen button */}
        <button
          onClick={handleListen}
          disabled={playing}
          className={[
            'w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-semibold text-lg transition-all duration-200 active:scale-95 mb-2',
            playing
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200',
            playing ? 'cursor-default' : '',
          ].join(' ')}
        >
          {playing ? (
            <>
              <span className="flex gap-1 items-center">
                <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              Reproduciendo...
            </>
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              Escuchar frase
            </>
          )}
        </button>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button onClick={onNext} color="blue" variant="primary" size="lg" fullWidth>
          Entendí, seguir →
        </Button>
      </div>
    </div>
  );
};
