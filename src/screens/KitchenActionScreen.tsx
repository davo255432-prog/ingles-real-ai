import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/Button';

type VoiceState = 'idle' | 'listening';

interface KitchenActionScreenProps {
  onBack: () => void;
  onFinish: () => void;
}

export const KitchenActionScreen: React.FC<KitchenActionScreenProps> = ({ onBack, onFinish }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    };
  }, []);

  const handleVoice = () => {
    setVoiceState('listening');
    voiceTimerRef.current = setTimeout(() => {
      onFinish();
    }, 2000);
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
            <h1 className="text-xl font-bold text-blue-600">Úsala en una situación real</h1>
          </div>
        </div>

        {/* Situation */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">La situación</p>
          <p className="text-gray-800 text-base font-semibold leading-snug">
            "El chef te pregunta por qué no salen más órdenes con cebolla. ¿Qué dices?"
          </p>
        </div>

        {/* Answer hint */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Puedes responder</p>
          <p className="text-blue-600 text-2xl font-extrabold">"We're out of onions."</p>
        </div>

        {/* Voice button */}
        <button
          onClick={handleVoice}
          disabled={voiceState === 'listening'}
          className={[
            'w-full flex items-center justify-center gap-3 py-6 rounded-2xl font-semibold text-xl transition-all duration-200 active:scale-95 mb-4',
            voiceState === 'listening'
              ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200',
          ].join(' ')}
        >
          <div className={[
            'w-7 h-7 rounded-full border-2 border-current flex items-center justify-center',
            voiceState === 'listening' ? 'bg-white' : '',
          ].join(' ')}>
            {voiceState === 'listening' ? (
              <span className="w-3.5 h-3.5 bg-red-500 rounded-full" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              </svg>
            )}
          </div>
          {voiceState === 'listening' ? 'Grabando...' : 'Responder con voz'}
        </button>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button
          onClick={onFinish}
          color="gray"
          variant="secondary"
          size="lg"
          fullWidth
        >
          Terminar práctica →
        </Button>
      </div>
    </div>
  );
};
