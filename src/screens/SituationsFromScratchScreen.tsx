import React from 'react';
import { Button } from '../components/Button';

interface SituationsFromScratchScreenProps {
  onBack: () => void;
  onStart: () => void;
}

const SEPRA_STEPS = [
  { num: 1, letter: 'S', name: 'Situación', desc: 'Cuándo usar la frase', color: 'bg-blue-100 text-blue-600' },
  { num: 2, letter: 'E', name: 'Escucha', desc: 'Entrena tu oído', color: 'bg-indigo-100 text-indigo-600' },
  { num: 3, letter: 'P', name: 'Práctica', desc: 'Repite con tu voz', color: 'bg-violet-100 text-violet-600' },
  { num: 4, letter: 'R', name: 'Regla', desc: 'Aprende una mini gramática', color: 'bg-sky-100 text-sky-600' },
  { num: 5, letter: 'A', name: 'Acción', desc: 'Úsala en situación real', color: 'bg-teal-100 text-teal-600' },
];

export const SituationsFromScratchScreen: React.FC<SituationsFromScratchScreenProps> = ({
  onBack,
  onStart,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Blue hero */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-5 pt-14 pb-8">
        <div className="flex items-start gap-3 mb-5">
          <button
            onClick={onBack}
            className="mt-0.5 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Practicar situaciones</p>
            <h1 className="text-white text-2xl font-extrabold leading-tight">Ruta desde cero</h1>
          </div>
        </div>

        {/* Method name */}
        <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-3">
          <span className="text-white text-2xl font-extrabold tracking-widest">S·E·P·R·A</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        {/* Coach message */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Profesor IA</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Vamos a usar el método S.E.P.R.A.: Situación, Escucha, Práctica, Regla y Acción. Primero entiendes cuándo usar la frase, luego entrenas tu oído, después la repites con voz, aprendes una regla corta y finalmente la usas en una situación real.
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Tu método de práctica</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            "Este método es importante porque no solo memorizas frases. Entrenas tu oído, tu pronunciación y tu confianza para usar el inglés en momentos reales."
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 mb-6">
          {SEPRA_STEPS.map((step) => (
            <div key={step.letter} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0 ${step.color}`}>
                {step.letter}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{step.num}. {step.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onStart}
          color="blue"
          variant="primary"
          size="lg"
          fullWidth
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          }
        >
          Empezar primera frase
        </Button>
      </div>
    </div>
  );
};
