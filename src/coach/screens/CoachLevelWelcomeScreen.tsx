import React from 'react';
import type { Unit } from '../types';

interface CoachLevelWelcomeScreenProps {
  /** Apodo del usuario (si lo dio) para el saludo. */
  name?: string;
  /** Las 5 unidades del nivel, para mostrar el mapa. */
  units: Unit[];
  onBack: () => void;
  /** Empezar la Unidad 1 (abre la primera lección de Pronombres). */
  onStart: () => void;
}

/**
 * Bienvenida al Nivel 1. Saluda con el nombre, explica qué se aprende y muestra
 * el mapa de las 5 unidades antes de empezar. Sin voz ni figuras en esta fase.
 */
export const CoachLevelWelcomeScreen: React.FC<CoachLevelWelcomeScreenProps> = ({
  name,
  units,
  onBack,
  onStart,
}) => {
  const greeting = name ? `Hola, ${name}. Empecemos desde la base.` : 'Empecemos desde la base.';

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
        <span className="text-gray-400 text-sm font-medium">Nivel Básico</span>
      </div>

      {/* Hero */}
      <div className="px-6 pt-6 pb-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">🎓</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
          {greeting}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          En este nivel aprenderás <span className="font-semibold text-gray-800">quién realiza la acción</span>,
          cómo usar <span className="font-semibold text-gray-800">am, is y are</span>, y cómo
          construir <span className="font-semibold text-gray-800">tus primeras frases</span>.
        </p>
      </div>

      {/* Mapa de las 5 unidades */}
      <div className="px-5 flex-1">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3 px-1">
          Tu mapa del Nivel Básico
        </p>
        <div className="flex flex-col gap-3">
          {units.map((unit, index) => {
            const demo = !unit.comingSoon && unit.lessonIds.length > 0;
            return (
              <div
                key={unit.id}
                className={
                  demo
                    ? 'bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex items-center gap-3'
                    : 'bg-white/60 rounded-2xl p-4 border border-gray-100 flex items-center gap-3'
                }
              >
                <div
                  className={
                    demo
                      ? 'w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0'
                      : 'w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0'
                  }
                >
                  <span className={demo ? 'text-emerald-700 font-extrabold' : 'text-gray-400 font-extrabold'}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={demo ? 'text-gray-900 font-bold leading-snug' : 'text-gray-400 font-bold leading-snug'}>
                    {unit.title}
                  </p>
                </div>
                {demo ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                    Disponible
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full shrink-0">
                    Próximamente
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Aviso: empezamos por la Unidad 1 */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-4">
          <p className="text-emerald-800 text-sm leading-relaxed">
            Empieza por la Unidad 1 — Pronombres. Las demás unidades se irán abriendo poco a poco.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-8">
        <button
          onClick={onStart}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
        >
          Empezar Unidad 1
        </button>
      </div>
    </div>
  );
};
