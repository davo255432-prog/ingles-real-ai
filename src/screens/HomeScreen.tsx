import React from 'react';

interface HomeScreenProps {
  onStartFlow: () => void;
  onSpeakTranslate: () => void;
  onCoach: () => void;
  onBiblioteca: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartFlow, onSpeakTranslate, onCoach, onBiblioteca }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-base font-bold">I</span>
          </div>
          <span className="text-gray-400 text-sm font-medium">Inglés Real AI</span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 pt-10 pb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          Inglés Real <span className="text-orange-500">AI</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Practica inglés en situaciones reales de trabajo y vida diaria.
        </p>
      </div>

      {/* Main buttons */}
      <div className="px-5 flex flex-col gap-4 flex-1">
        {/* Aprende a decirlo */}
        <button
          onClick={onStartFlow}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-3xl p-6 text-left shadow-lg shadow-orange-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Aprende a decirlo</h2>
          <p className="text-white/75 text-sm leading-snug">
            Escribe o di una frase en español. Te explico cómo decirla en inglés y practicas tu pronunciación.
          </p>
        </button>

        {/* Traduce con voz */}
        <button
          onClick={onSpeakTranslate}
          className="w-full bg-purple-500 hover:bg-purple-600 active:scale-[0.98] text-white rounded-3xl p-6 text-left shadow-lg shadow-purple-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎙️</span>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Traduce con voz</h2>
          <p className="text-white/75 text-sm leading-snug">
            Habla en español o escucha inglés. Traduce, entiende y practica con tu voz.
          </p>
        </button>

        {/* Coach IA */}
        <button
          onClick={onCoach}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-3xl p-6 text-left shadow-lg shadow-emerald-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Coach IA</h2>
          <p className="text-white/75 text-sm leading-snug">
            Aprende inglés paso a paso según tu nivel, con práctica, voz y situaciones reales.
          </p>
        </button>

        {/* Biblioteca */}
        <button
          onClick={onBiblioteca}
          className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white rounded-3xl p-6 text-left shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Biblioteca</h2>
          <p className="text-white/75 text-sm leading-snug">
            Frases, pronunciaciones y situaciones reales para practicar cuando quieras.
          </p>
        </button>

      </div>

      {/* Footer */}
      <div className="px-5 py-8 text-center">
        <p className="text-gray-400 text-xs">Tu coach de inglés práctico • siempre disponible</p>
      </div>
    </div>
  );
};
