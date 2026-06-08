import React, { useState } from 'react';
import type { UrgentPhraseData } from '../types';
import { Button } from '../components/Button';
import { mockUrgentData } from '../data/mockData';

interface UrgentSayScreenProps {
  onBack: () => void;
  onTranslate: (data: UrgentPhraseData, input: string) => void;
  initialInput?: string;
}

export const UrgentSayScreen: React.FC<UrgentSayScreenProps> = ({
  onBack,
  onTranslate,
  initialInput = '',
}) => {
  const [input, setInput] = useState(initialInput);

  const handleTranslate = () => {
    if (!input.trim()) return;
    onTranslate(mockUrgentData, input.trim());
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <button
            onClick={onBack}
            className="mt-1 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-teal-600">
              Necesito decir esto ahora
            </h1>
          </div>
        </div>

        {/* Coach message */}
        <div className="flex gap-3 bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg">
            ⚡
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-1">Profesor IA</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Dime en español lo que necesitas comunicar ahora. Te daré una frase clara en inglés para usarla rápido.
            </p>
          </div>
        </div>

        {/* Input area */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-1">¿Qué necesitas decir?</h2>
          <p className="text-gray-400 text-sm mb-4">Escribe en español lo que necesitas comunicar.</p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ejemplo: Mi carro no prende."
            rows={4}
            className="w-full bg-white border-2 border-gray-200 focus:border-teal-400 rounded-2xl p-4 text-gray-800 placeholder-gray-300 text-base resize-none outline-none transition-colors leading-relaxed mb-1"
          />
          {input.length > 0 && (
            <p className="text-right text-xs text-gray-400">{input.length} caracteres</p>
          )}
        </div>

        {/* Mode button — visual only */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-400 font-semibold text-sm mb-5"
          disabled
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          Decir mi situación
          <span className="ml-1 text-[10px] bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">
            próximamente
          </span>
        </button>

        {/* CTA */}
        <Button
          onClick={handleTranslate}
          color="green"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!input.trim()}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
        >
          Traducir rápido
        </Button>
      </div>
    </div>
  );
};
