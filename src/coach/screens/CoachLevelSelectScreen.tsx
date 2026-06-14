import React from 'react';
import type { LevelId } from '../types';

interface CoachLevelSelectScreenProps {
  onBack: () => void;
  /** Usuario eligió un nivel concreto. */
  onSelectLevel?: (level: LevelId) => void;
  /** Usuario marcó "No estoy seguro de mi nivel". */
  onUnsure?: () => void;
}

interface LevelOption {
  id: LevelId;
  label: string;
  sub: string;
  emoji: string;
  iconBg: string;      // clase Tailwind completa (no dinámica, para no purgarse)
}

const LEVEL_OPTIONS: LevelOption[] = [
  { id: 1, label: 'Nivel Básico — Desde cero', sub: 'Empieza por lo más básico, palabra por palabra.', emoji: '🌱', iconBg: 'bg-emerald-100' },
  { id: 2, label: 'Nivel Intermedio', sub: 'Ya conoces algunas palabras y frases sencillas.', emoji: '🔤', iconBg: 'bg-blue-100' },
  { id: 3, label: 'Nivel Avanzado', sub: 'Puedes formar oraciones y entender conversaciones.', emoji: '💬', iconBg: 'bg-violet-100' },
];

/**
 * Pantalla de entrada del Coach IA: "¿Cuál es tu nivel?".
 * Muestra las opciones de nivel y la opción de test de ubicación.
 * No avanza a lecciones todavía (Fase 1 posterior).
 */
export const CoachLevelSelectScreen: React.FC<CoachLevelSelectScreenProps> = ({ onBack, onSelectLevel, onUnsure }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
          aria-label="Volver"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-gray-400 text-sm font-medium">Coach IA</span>
      </div>

      {/* Hero */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
          ¿Cuál es tu nivel?
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Elige el punto de partida. Podrás cambiarlo cuando quieras.
        </p>
      </div>

      {/* Level options */}
      <div className="px-5 flex flex-col gap-3 flex-1">
        {LEVEL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelectLevel?.(opt.id)}
            className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] rounded-3xl p-5 text-left shadow-md border border-gray-100 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${opt.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                <span className="text-2xl">{opt.emoji}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 text-lg font-bold leading-snug">{opt.label}</h2>
                <p className="text-gray-500 text-sm leading-snug mt-0.5">{opt.sub}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}

        {/* No estoy seguro */}
        <button
          onClick={() => onUnsure?.()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-3xl p-5 text-left shadow-lg shadow-emerald-200 transition-all duration-200 mt-1"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-2xl">🧭</span>
            </div>
            <div className="flex-1">
              <h2 className="text-white text-lg font-bold leading-snug">No estoy seguro de mi nivel</h2>
              <p className="text-white/75 text-sm leading-snug mt-0.5">Haz una prueba rápida y te ubicamos.</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-8 text-center">
        <p className="text-gray-400 text-xs">Tu coach de inglés práctico • paso a paso</p>
      </div>
    </div>
  );
};
