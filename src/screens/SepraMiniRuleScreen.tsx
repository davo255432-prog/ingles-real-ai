import React from 'react';
import { SepraStepIndicator } from '../components/SepraStepIndicator';
import { Button } from '../components/Button';

interface SepraMiniRuleScreenProps {
  onBack: () => void;
  onNext: () => void;
}

const EXAMPLES = [
  { en: "I don't understand.", es: 'No entiendo.' },
  { en: "I don't know.", es: 'No sé.' },
  { en: "I don't speak much English.", es: 'No hablo mucho inglés.' },
];

export const SepraMiniRuleScreen: React.FC<SepraMiniRuleScreenProps> = ({ onBack, onNext }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-5 pt-12 pb-4">
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
          <h1 className="text-xl font-bold text-blue-600">Mini regla</h1>
        </div>

        <SepraStepIndicator currentStep={3} />

        {/* Rule card */}
        <div className="bg-blue-500 rounded-2xl p-6 mb-5">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-3">La regla</p>
          <p className="text-white text-xl font-bold leading-snug mb-2">
            "I don't..." sirve para decir "yo no..."
          </p>
          <p className="text-blue-200 text-sm">Úsalo para negar acciones en primera persona.</p>
        </div>

        {/* Examples */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-4">Ejemplos</p>
          <div className="flex flex-col gap-4">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="text-gray-800 font-bold text-base">"{ex.en}"</p>
                <p className="text-gray-400 text-sm">= "{ex.es}"</p>
                {i < EXAMPLES.length - 1 && <div className="h-px bg-gray-100 mt-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Pattern */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex gap-3">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Patrón</p>
            <p className="text-gray-700 text-sm leading-relaxed font-mono">
              I don't + <span className="text-indigo-600 font-bold">verbo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button
          onClick={onNext}
          color="blue"
          variant="primary"
          size="lg"
          fullWidth
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 8 16 12 12 16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          }
        >
          Usarla en una situación
        </Button>
      </div>
    </div>
  );
};
