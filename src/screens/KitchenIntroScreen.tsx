import React from 'react';
import { Button } from '../components/Button';

interface KitchenIntroScreenProps {
  onBack: () => void;
  onListen: () => void;
  onStart: () => void;
}

export const KitchenIntroScreen: React.FC<KitchenIntroScreenProps> = ({
  onBack,
  onListen,
  onStart,
}) => {
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
            <p className="text-xs text-gray-400 font-medium mb-0.5">Trabajo y clientes</p>
            <h1 className="text-xl font-bold text-blue-600 leading-tight">Cocina / restaurante</h1>
          </div>
        </div>

        {/* Intro message */}
        <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Profesor IA</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Vamos a practicar una situación común: se acabó un producto y necesitas avisar al chef o manager.
            </p>
          </div>
        </div>

        {/* Situation */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">La situación</p>
          <p className="text-gray-800 text-base font-semibold leading-snug">
            "Se acabaron las cebollas y necesitas avisar rápido."
          </p>
        </div>

        {/* Phrase card */}
        <div className="bg-blue-500 rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-2">Frase principal</p>
          <p className="text-white text-2xl font-extrabold mb-3">"We're out of onions."</p>
          <div className="bg-white/15 rounded-xl px-3 py-2">
            <p className="text-blue-100 text-xs font-medium">Significado</p>
            <p className="text-white text-sm font-semibold">"Se nos acabaron las cebollas."</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6 flex flex-col gap-3">
        <Button
          onClick={onListen}
          color="blue"
          variant="primary"
          size="lg"
          fullWidth
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          }
        >
          Escuchar primero
        </Button>
        <Button
          onClick={onStart}
          color="gray"
          variant="secondary"
          size="lg"
          fullWidth
        >
          Empezar práctica
        </Button>
      </div>
    </div>
  );
};
