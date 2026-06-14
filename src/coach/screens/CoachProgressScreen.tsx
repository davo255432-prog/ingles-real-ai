import React, { useState } from 'react';
import type { CoachProgress, LearnerProfile, LevelId } from '../types';

interface CoachProgressScreenProps {
  profile: LearnerProfile;
  progress: CoachProgress;
  onBack: () => void;
  /** Abrir el paso exacto donde quedó el usuario (motor de lección — fase futura). */
  onContinue: () => void;
  /** Editar el apodo más adelante. */
  onEditName: () => void;
  /** Abrir la personalización opcional (objetivo / profesión). */
  onPersonalize: () => void;
  /** Reiniciar el Coach (borra el perfil). Pide confirmación antes. */
  onReset: () => void;
}

const LEVEL_LABEL: Record<LevelId, string> = {
  1: 'Nivel Básico — Desde cero',
  2: 'Nivel Intermedio',
  3: 'Nivel Avanzado',
  4: 'Nivel 4',
  5: 'Nivel 5',
};

/**
 * Panel de progreso para usuarios con perfil.
 * Saluda con el nombre (sin repetirlo demasiado), muestra el avance y ofrece el
 * botón Continuar (preparado para abrir el paso exacto guardado).
 */
export const CoachProgressScreen: React.FC<CoachProgressScreenProps> = ({
  profile,
  progress,
  onBack,
  onContinue,
  onEditName,
  onPersonalize,
  onReset,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const levelLabel = profile.level ? LEVEL_LABEL[profile.level] : 'Sin definir';
  const hasStarted = progress.position.currentLessonId !== null;
  const greeting = profile.name ? `¡Hola, ${profile.name}!` : '¡Hola de nuevo!';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <div className="flex items-center gap-3">
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
      </div>

      {/* Hero — el nombre aparece solo aquí */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            {greeting}
          </h1>
          <button
            onClick={onEditName}
            className="text-emerald-600 hover:text-emerald-700 p-1 -m-1 transition-all"
            aria-label="Editar nombre"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-500 leading-relaxed">
          Aquí está tu camino de aprendizaje.
        </p>
      </div>

      {/* Contenido */}
      <div className="px-5 flex flex-col gap-4 flex-1">
        {/* Tarjeta de nivel */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
            Tu nivel
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <p className="text-gray-900 text-lg font-bold leading-snug">{levelLabel}</p>
              {profile.unsureOfLevel && (
                <p className="text-gray-400 text-xs">Sugerido por la prueba rápida</p>
              )}
            </div>
          </div>
        </div>

        {/* Objetivo / profesión */}
        {(profile.goal || profile.profession) && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col gap-4">
            {profile.goal && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                  Tu objetivo
                </p>
                <p className="text-gray-800 font-medium">{profile.goal}</p>
              </div>
            )}
            {profile.goal && profile.profession && <div className="border-t border-gray-100" />}
            {profile.profession && (
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                  Profesión u oficio
                </p>
                <p className="text-gray-800 font-medium">{profile.profession}</p>
              </div>
            )}
            <button
              onClick={onPersonalize}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold text-left"
            >
              Editar mi objetivo o profesión
            </button>
          </div>
        )}

        {/* Invitación a personalizar (si aún no hay objetivo ni profesión) */}
        {!profile.goal && !profile.profession && (
          <button
            onClick={onPersonalize}
            className="bg-white rounded-3xl p-5 shadow-sm border border-dashed border-emerald-200 text-left hover:border-emerald-300 transition-all"
          >
            <p className="text-gray-800 font-bold mb-0.5">Personaliza tu aprendizaje</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Cuéntame tu objetivo o profesión (opcional) para enfocar los ejemplos.
            </p>
          </button>
        )}

        {/* Continuar / Comenzar — lee la posición guardada */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            {hasStarted ? 'Continúa donde quedaste' : 'Empieza tu aprendizaje'}
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {hasStarted
              ? 'Retomarás justo en el paso donde lo dejaste.'
              : 'Tu primera unidad te espera, paso a paso.'}
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-3.5 transition-all duration-200"
          >
            {hasStarted ? 'Continuar' : 'Comenzar'}
          </button>
        </div>
      </div>

      {/* Reiniciar — con confirmación */}
      <div className="px-5 py-8 text-center">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-gray-400 hover:text-gray-600 text-xs font-medium underline transition-all"
          >
            Reiniciar mi Coach
          </button>
        ) : (
          <div className="bg-white border border-red-100 rounded-2xl p-4 text-left">
            <p className="text-gray-800 text-sm font-semibold mb-1">¿Reiniciar tu Coach?</p>
            <p className="text-gray-500 text-xs mb-4">
              Se borrará tu perfil y tu progreso. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl py-2.5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={onReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl py-2.5 transition-all"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
