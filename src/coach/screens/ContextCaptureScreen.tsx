import React, { useState } from 'react';

interface ContextCaptureScreenProps {
  onBack: () => void;
  /** Guarda objetivo y profesión (ambos opcionales) y continúa. */
  onSave: (goal: string, profession: string) => void;
  /** Omitir este paso (sin objetivo ni profesión). */
  onSkip: () => void;
}

const GOAL_SUGGESTIONS = [
  'Hablar con clientes',
  'Conseguir un mejor trabajo',
  'Entender a mi jefe',
  'Viajar',
  'Ayudar a mis hijos',
];

/**
 * Captura OPCIONAL de objetivo y profesión, para personalizar el contenido
 * más adelante. El usuario puede omitir este paso.
 */
export const ContextCaptureScreen: React.FC<ContextCaptureScreenProps> = ({ onBack, onSave, onSkip }) => {
  const [goal, setGoal] = useState('');
  const [profession, setProfession] = useState('');

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
        <span className="text-gray-400 text-sm font-medium">Personaliza tu Coach</span>
      </div>

      {/* Hero */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
          ¿Qué quieres lograr?
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Es opcional, pero nos ayuda a darte ejemplos más útiles para ti.
        </p>
      </div>

      {/* Form */}
      <div className="px-6 flex flex-col gap-6 flex-1">
        {/* Goal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tu objetivo
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ej.: Hablar con clientes"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {GOAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setGoal(s)}
                className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-all ${
                  goal === s
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Profession */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tu profesión u oficio
          </label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Ej.: Cocinero, niñera, conductor…"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        <button
          onClick={() => onSave(goal, profession)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
        >
          Continuar
        </button>
        <button
          onClick={onSkip}
          className="w-full text-gray-500 hover:text-gray-700 text-sm font-semibold py-2 transition-all"
        >
          Omitir por ahora
        </button>
      </div>
    </div>
  );
};
