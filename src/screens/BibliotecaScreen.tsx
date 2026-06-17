import React from 'react';

interface BibliotecaScreenProps {
  onBack: () => void;
}

/**
 * Biblioteca — pantalla placeholder.
 * Aquí (próximamente) el usuario podrá guardar y practicar frases reales,
 * pronunciaciones y ejemplos. Por ahora solo muestra el aviso temporal.
 */
export const BibliotecaScreen: React.FC<BibliotecaScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-gray-50">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-5 pt-12 pb-2">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Volver"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-gray-400 text-sm font-medium">Inglés Real AI</span>
      </div>

      {/* Encabezado */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">Biblioteca</h1>
        <p className="text-gray-500 leading-relaxed">
          Guarda y practica frases reales, pronunciaciones y ejemplos de videos.
        </p>
      </div>

      {/* Aviso temporal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-100 flex items-center justify-center mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed max-w-xs">
          Muy pronto podrás organizar aquí tus frases, audios y situaciones reales de inglés.
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-8 text-center">
        <p className="text-gray-400 text-xs">Próximamente</p>
      </div>
    </div>
  );
};
