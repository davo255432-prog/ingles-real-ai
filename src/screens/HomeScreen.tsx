import React from 'react';

interface HomeScreenProps {
  onStartFlow: () => void;
  onSituationsFlow: () => void;
  onUrgentFlow: () => void;
  onSpeakTranslate: () => void;
  onCoach: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartFlow, onSituationsFlow, onUrgentFlow, onSpeakTranslate, onCoach }) => {
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
        {/* Button 1 — active */}
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
          <h2 className="text-white text-xl font-bold mb-1">¿Cómo digo esto?</h2>
          <p className="text-white/75 text-sm leading-snug">
            Escribe o di en español lo que necesitas comunicar. Yo te enseño cómo decirlo.
          </p>
        </button>

        {/* Button 2 — active */}
        <button
          onClick={onSituationsFlow}
          className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white rounded-3xl p-6 text-left shadow-lg shadow-blue-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Practicar situaciones</h2>
          <p className="text-white/75 text-sm leading-snug">
            Aprende frases reales paso a paso con el método S·E·P·R·A.
          </p>
        </button>

        {/* Button 3 — active */}
        <button
          onClick={onUrgentFlow}
          className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white rounded-3xl p-6 text-left shadow-lg shadow-teal-200 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Necesito decir esto ahora</h2>
          <p className="text-white/75 text-sm leading-snug">
            Traduce rápido lo que necesitas decir. Frase clara en inglés, lista para usar.
          </p>
        </button>

        {/* Button 4 — Speak and translate */}
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
          <h2 className="text-white text-xl font-bold mb-1">Habla en español</h2>
          <p className="text-white/75 text-sm leading-snug">
            Di en español lo que necesitas. Yo lo traduzco al inglés y te lo leo en voz alta.
          </p>
        </button>

        {/* Button 5 — Coach IA */}
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

      </div>

      {/* Footer */}
      <div className="px-5 py-8 text-center">
        <p className="text-gray-400 text-xs">Tu coach de inglés práctico • siempre disponible</p>
      </div>
    </div>
  );
};
