import React from 'react';
import type { CoachProgress, Unit } from '../types';
import { getLesson } from '../data/curriculum';

interface CoachUnitsScreenProps {
  units: Unit[];
  progress: CoachProgress;
  onBack: () => void;
  /** Abrir la primera lección disponible de una unidad. */
  onOpenLesson: (unitId: string, lessonId: string) => void;
}

/**
 * Estructura de unidades del nivel. La Unidad 1 está disponible; el resto se
 * muestra como "Próximamente". Sin voz ni figuras en esta fase.
 */
export const CoachUnitsScreen: React.FC<CoachUnitsScreenProps> = ({
  units,
  progress,
  onBack,
  onOpenLesson,
}) => {
  // Primera unidad bloqueada: se marca como "Siguiente" en el mapa.
  const firstLockedIndex = units.findIndex((u) => {
    const fl = u.lessonIds[0];
    return u.comingSoon || !fl || !getLesson(fl);
  });

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
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
          Nivel Básico — Desde cero
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Cinco unidades para empezar. Avanza a tu ritmo, paso a paso.
        </p>
      </div>

      {/* Lista de unidades */}
      <div className="px-5 flex flex-col gap-4 flex-1 pb-8">
        {units.map((unit, index) => {
          const firstLessonId = unit.lessonIds[0];
          const lesson = firstLessonId ? getLesson(firstLessonId) : undefined;
          const locked = unit.comingSoon || !lesson;

          // Estado de avance de la lección de la unidad (si la hay)
          const lessonProgress = firstLessonId ? progress.lessons[firstLessonId] : undefined;
          const completed = lessonProgress?.status === 'completed';
          const inProgress = lessonProgress?.status === 'in-progress';
          const oralPending = !!lessonProgress?.oralPending;

          return (
            <button
              key={unit.id}
              disabled={locked}
              onClick={() => firstLessonId && onOpenLesson(unit.id, firstLessonId)}
              className={
                locked
                  ? 'text-left bg-white/60 border border-gray-100 rounded-3xl p-5 cursor-not-allowed'
                  : 'text-left bg-white border border-gray-100 rounded-3xl p-5 shadow-md hover:shadow-lg active:scale-[0.99] transition-all'
              }
            >
              <div className="flex items-center gap-4">
                {/* Número / candado */}
                <div
                  className={
                    locked
                      ? 'w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0'
                      : 'w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0'
                  }
                >
                  {locked ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : completed ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="text-emerald-700 font-extrabold text-lg">{index + 1}</span>
                  )}
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={locked ? 'text-gray-400 font-bold' : 'text-gray-900 font-bold'}>
                      {unit.title}
                    </p>
                    {locked && index === firstLockedIndex && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                        Siguiente
                      </span>
                    )}
                    {locked && index !== firstLockedIndex && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                        Próximamente
                      </span>
                    )}
                    {!locked && completed && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Completada ✓
                      </span>
                    )}
                    {!locked && !completed && inProgress && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                        En progreso
                      </span>
                    )}
                  </div>
                  <p className={locked ? 'text-gray-300 text-sm leading-snug mt-0.5' : 'text-gray-500 text-sm leading-snug mt-0.5'}>
                    {unit.description}
                  </p>
                  {!locked && oralPending && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-amber-600">
                      🎤 Práctica oral pendiente
                    </span>
                  )}
                </div>

                {/* Chevron solo si está disponible */}
                {!locked && (
                  <svg className="shrink-0 text-emerald-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
