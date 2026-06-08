import React from 'react';
import { Button } from '../components/Button';

interface SepraProgressScreenProps {
  onPracticeAnother: () => void;
  onHome: () => void;
}

const STATS = [
  { icon: '📝', value: '1', label: 'frase practicada' },
  { icon: '🎯', value: '85%', label: 'precisión' },
  { icon: '🔥', value: 'Día 1', label: 'racha' },
];

const VOCAB = ['understand', 'know', 'English'];

export const SepraProgressScreen: React.FC<SepraProgressScreenProps> = ({
  onPracticeAnother,
  onHome,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-5 pt-14 pb-8 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-white text-2xl font-extrabold mb-2">¡Excelente trabajo!</h1>
        <p className="text-blue-200 text-sm leading-relaxed">
          Completaste tu primera práctica desde cero.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-blue-600 text-xl font-extrabold leading-none">{stat.value}</p>
              <p className="text-gray-400 text-[10px] mt-1 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-4">Resumen</p>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Frase aprendida</p>
            <p className="text-blue-600 text-lg font-bold">"I don't understand."</p>
          </div>

          <div className="h-px bg-gray-100 mb-4" />

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Mini regla</p>
            <p className="text-gray-700 text-sm leading-relaxed">"I don't..." sirve para decir "yo no..."</p>
          </div>

          <div className="h-px bg-gray-100 mb-4" />

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Vocabulario</p>
            <div className="flex gap-2 flex-wrap">
              {VOCAB.map((word) => (
                <span key={word} className="bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full border border-blue-100">
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-4" />

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pronunciación</p>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 text-sm font-medium">understand</span>
              <span className="text-gray-300">→</span>
              <span className="bg-indigo-50 text-indigo-600 font-mono text-sm font-semibold px-3 py-1 rounded-lg">
                an-der-STAND
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={onPracticeAnother}
          color="blue"
          variant="primary"
          size="lg"
          fullWidth
          className="mb-3"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.92" />
            </svg>
          }
        >
          Practicar otra frase
        </Button>

        <Button
          onClick={onHome}
          color="gray"
          variant="secondary"
          size="lg"
          fullWidth
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};
