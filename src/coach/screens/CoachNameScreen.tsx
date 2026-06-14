import React, { useState } from 'react';

interface CoachNameScreenProps {
  onBack: () => void;
  /** Guarda el apodo (puede ir vacío) y continúa. */
  onSave: (name: string) => void;
  /** Omite el paso (sin apodo). */
  onSkip: () => void;
  /** Valor inicial (para editar un nombre existente). */
  initialName?: string;
  /** Texto del botón principal (p.ej. "Guardar" al editar). */
  saveLabel?: string;
}

/**
 * Captura OPCIONAL del apodo: "¿Cómo quieres que te llame el Coach?".
 * El usuario puede omitirlo. También sirve para editar el nombre más adelante.
 */
export const CoachNameScreen: React.FC<CoachNameScreenProps> = ({ onBack, onSave, onSkip, initialName = '', saveLabel = 'Continuar' }) => {
  const [name, setName] = useState(initialName);

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
        <span className="text-gray-400 text-sm font-medium">Tu Coach</span>
      </div>

      {/* Hero */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
          ¿Cómo quieres que te llame el Coach?
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Es opcional. Puedes usar tu nombre o un apodo.
        </p>
      </div>

      {/* Form */}
      <div className="px-6 flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej.: María, Profe, Capitán…"
          maxLength={30}
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="px-5 pb-8 flex flex-col gap-3">
        <button
          onClick={() => onSave(name)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
        >
          {saveLabel}
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
