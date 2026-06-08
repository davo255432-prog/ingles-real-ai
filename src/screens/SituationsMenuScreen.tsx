import React from 'react';

interface SituationsMenuScreenProps {
  onBack: () => void;
  onFromScratch: () => void;
  onWorkClients: () => void;
}

export const SituationsMenuScreen: React.FC<SituationsMenuScreenProps> = ({
  onBack,
  onFromScratch,
  onWorkClients,
}) => {
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
            <h1 className="text-2xl font-bold text-blue-600 leading-tight">Practicar situaciones</h1>
          </div>
        </div>

        {/* Coach message */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
            🎓
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Profesor IA</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              Vamos a practicar inglés paso a paso con situaciones reales. Primero entiendes cuándo usar la frase, luego escuchas, repites, aprendes una regla corta y la usas en una situación real.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4">
          {/* Option 1 — active */}
          <button
            onClick={onFromScratch}
            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white rounded-3xl p-5 text-left shadow-lg shadow-blue-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-xl">🌱</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold mb-1">Empezar desde cero</h2>
            <p className="text-white/75 text-sm leading-snug">
              Para aprender una primera frase útil paso a paso.
            </p>
          </button>

          {/* Option 2 — active */}
          <button
            onClick={onWorkClients}
            className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white rounded-3xl p-5 text-left shadow-lg shadow-teal-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-xl">💼</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold mb-1">Trabajo y clientes</h2>
            <p className="text-white/75 text-sm leading-snug">
              Cocina, dealer, ventas, llamadas o atención al cliente.
            </p>
          </button>

          {/* Option 3 — coming soon */}
          <div className="w-full bg-white border border-gray-200 rounded-3xl p-5 text-left opacity-55">
            <div className="flex items-center justify-between mb-2">
              <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2.5 py-1 rounded-full">
                Próximamente
              </span>
            </div>
            <h2 className="text-gray-700 text-lg font-bold mb-1">Mejorar pronunciación</h2>
            <p className="text-gray-400 text-sm leading-snug">
              Practica frases que ya conoces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
