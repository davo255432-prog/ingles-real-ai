import { useCallback, useState } from 'react';
import type { CoachPosition, CoachProgress, LessonStatus, LevelId, TestResult } from '../types';
import {
  createProfile,
  loadProgress,
  resetProgress,
  setLessonStatus,
  updateName,
  updatePosition,
} from '../services/progressService';

interface SaveProfileInput {
  level: LevelId | null;
  unsureOfLevel: boolean;
  goal?: string;
  profession?: string;
  name?: string;
  namePrompted?: boolean;
  placementResult?: TestResult;
}

/**
 * Hook de estado del Coach IA. Mantiene el progreso completo (v2) en memoria y
 * lo sincroniza con el progressService. Aislado del resto de la app.
 */
export function useCoachProgress() {
  const [progress, setProgress] = useState<CoachProgress>(() => loadProgress());

  const saveProfile = useCallback((input: SaveProfileInput) => {
    const savedProfile = createProfile(input);
    setProgress(loadProgress());
    return savedProfile;
  }, []);

  const saveName = useCallback((name: string) => {
    updateName(name);
    setProgress(loadProgress());
  }, []);

  const reset = useCallback(() => {
    resetProgress();
    setProgress(loadProgress());
  }, []);

  // Guarda la posición exacta (capa de avance). Lo usa el motor de lección.
  const savePosition = useCallback((position: Partial<CoachPosition>) => {
    setProgress(updatePosition(position));
  }, []);

  // Marca el estado de una lección (capa de aprendizaje).
  const markLessonStatus = useCallback(
    (
      lessonId: string,
      status: LessonStatus,
      extra?: { lastStepId?: string; lastScore?: number; oralPending?: boolean },
    ) => {
      setProgress(setLessonStatus(lessonId, status, extra));
    },
    [],
  );

  return {
    progress,
    profile: progress.profile,
    saveProfile,
    saveName,
    reset,
    savePosition,
    markLessonStatus,
  };
}
