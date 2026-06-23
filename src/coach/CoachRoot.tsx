import React, { useState } from 'react';
import type { CoachScreen, LessonStatus, LevelId, TestResult } from './types';
import { useCoachProgress } from './hooks/useCoachProgress';
import { CoachLevelSelectScreen } from './screens/CoachLevelSelectScreen';
import { PlacementTestScreen } from './screens/PlacementTestScreen';
import { CoachNameScreen } from './screens/CoachNameScreen';
import { ContextCaptureScreen } from './screens/ContextCaptureScreen';
import { CoachProgressScreen } from './screens/CoachProgressScreen';
import { CoachLevelWelcomeScreen } from './screens/CoachLevelWelcomeScreen';
import { CoachUnitsScreen } from './screens/CoachUnitsScreen';
import { CoachLessonScreen } from './screens/CoachLessonScreen';
import {
  FIRST_LEVEL_ID,
  FIRST_LESSON_ID,
  FIRST_UNIT_ID,
  getLesson,
  getUnitsForLevel,
} from './data/curriculum';

interface CoachRootProps {
  /** Salir del módulo Coach IA y volver a la pantalla principal de la app. */
  onExit: () => void;
}

/**
 * Punto de entrada del módulo Coach IA. Mantiene su PROPIA navegación interna
 * (CoachScreen) para quedar totalmente aislado del enrutado de la app.
 *
 * Flujo de onboarding (nuevo orden):
 *   Sin perfil → nombre/apodo → ¿Cuál es tu nivel?
 *     · Elige nivel        → guarda perfil → (Nivel 1) bienvenida → mapa de unidades
 *     · "No estoy seguro"  → prueba rápida → guarda perfil → (Nivel 1) bienvenida → mapa
 *   La captura de objetivo/profesión YA NO va en el onboarding: queda como
 *   personalización OPCIONAL accesible desde el panel ("Personalizar mi aprendizaje").
 *   Con perfil PERO sin nombre y nunca preguntado (migrado de v1)
 *     → pantalla de apodo UNA sola vez → progreso.
 *   Con perfil y nombre (o ya preguntado) → Panel de progreso.
 */
export const CoachRoot: React.FC<CoachRootProps> = ({ onExit }) => {
  const { progress, profile, saveProfile, saveName, reset, savePosition, markLessonStatus } =
    useCoachProgress();

  // Lección actualmente abierta en el motor (y el paso por el que reanudar).
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [resumeStepId, setResumeStepId] = useState<string | undefined>(undefined);
  const [reviewMode, setReviewMode] = useState(false);

  // ¿Falta capturar el apodo? (perfil existente, sin nombre y nunca preguntado)
  const needsName = !!profile && !profile.name && !profile.namePrompted;

  // Pantalla inicial: usuario nuevo o migrado-sin-nombre empieza por el apodo.
  const [coachScreen, setCoachScreen] = useState<CoachScreen>(
    !profile || needsName ? 'coach-name' : 'coach-progress',
  );

  // Nombre pendiente durante el onboarding nuevo (se captura antes del nivel).
  const [pendingName, setPendingName] = useState('');

  // ── Guardado del nombre (primer paso del onboarding) ──
  // Si ya hay perfil (migrado o edición): persistir nombre y volver al panel.
  // Si es onboarding nuevo: guardar pendiente y seguir a selección de nivel.
  const handleNameSaved = (name: string) => {
    if (profile) {
      saveName(name);
      setCoachScreen('coach-progress');
    } else {
      setPendingName(name);
      setCoachScreen('coach-level-select');
    }
  };

  // ── Persistir perfil nuevo (tras elegir nivel) ──
  // El nombre ya se capturó antes. Objetivo/profesión se piden después, opcional.
  const finishOnboarding = (level: LevelId | null, unsure: boolean, result?: TestResult) => {
    saveProfile({
      level,
      unsureOfLevel: unsure,
      name: pendingName,
      namePrompted: true, // ya se mostró la pantalla de apodo en el flujo
      placementResult: result,
    });
    // Nivel 1 → pantalla de bienvenida antes del mapa; otros niveles → panel.
    setCoachScreen(level === 1 ? 'coach-level-welcome' : 'coach-progress');
  };

  // ── Selección de nivel (usuario nuevo) ──
  const handleSelectLevel = (level: LevelId) => {
    finishOnboarding(level, false, undefined);
  };

  const handleUnsure = () => {
    setCoachScreen('coach-placement-test');
  };

  const handlePlacementComplete = (suggestedLevel: LevelId, correct: number, total: number) => {
    finishOnboarding(suggestedLevel, true, { correct, total, suggestedLevel });
  };

  // ── Personalización opcional (objetivo/profesión) desde el panel ──
  const handleSaveContext = (goal: string, profession: string) => {
    if (!profile) return;
    saveProfile({
      level: profile.level,
      unsureOfLevel: profile.unsureOfLevel,
      goal,
      profession,
      name: profile.name,
    });
    setCoachScreen('coach-progress');
  };

  const handleReset = () => {
    reset();
    setPendingName('');
    setActiveLessonId(null);
    setResumeStepId(undefined);
    setReviewMode(false);
    setCoachScreen('coach-name');
  };

  // Abre una lección concreta en el motor, reanudando en el paso indicado.
  const openLesson = (unitId: string, lessonId: string, stepId?: string, asReview = false) => {
    setActiveLessonId(lessonId);
    setResumeStepId(stepId);
    setReviewMode(asReview);
    savePosition({
      currentLevelId: FIRST_LEVEL_ID,
      currentUnitId: unitId,
      currentLessonId: lessonId,
      currentStepId: stepId ?? null,
    });
    setCoachScreen('coach-lesson');
  };

  const openLessonFromMap = (unitId: string, lessonId: string) => {
    const lessonProgress = progress.lessons[lessonId];
    if (lessonProgress?.status === 'in-progress') {
      openLesson(unitId, lessonId, lessonProgress.lastStepId);
      return;
    }
    openLesson(unitId, lessonId, undefined, lessonProgress?.status === 'completed');
  };

  // Botón "Comenzar" / "Continuar" del panel.
  //  · Sin lección en curso → muestra la estructura de unidades.
  //  · Con lección guardada → reanuda en el paso exacto.
  const handleContinue = () => {
    const { currentUnitId, currentLessonId, currentStepId } = progress.position;
    const currentLesson = currentLessonId ? getLesson(currentLessonId) : undefined;
    const currentLessonProgress = currentLessonId ? progress.lessons[currentLessonId] : undefined;

    if (currentLessonId && currentLesson && currentLessonProgress?.status !== 'completed') {
      openLesson(currentUnitId ?? currentLesson.unitId ?? FIRST_UNIT_ID, currentLessonId, currentStepId ?? undefined);
      return;
    }

    const inProgress = Object.values(progress.lessons).find(
      (lessonProgress) => lessonProgress.status === 'in-progress' && getLesson(lessonProgress.lessonId),
    );
    if (inProgress) {
      const lesson = getLesson(inProgress.lessonId);
      openLesson(lesson?.unitId ?? FIRST_UNIT_ID, inProgress.lessonId, inProgress.lastStepId);
    } else {
      setCoachScreen('coach-units');
    }
  };

  // Guarda el paso exacto donde queda el usuario (capa de avance).
  const handleStepChange = (stepId: string) => {
    savePosition({ currentStepId: stepId });
  };

  // Marca el estado de la lección activa (in-progress / completed).
  const handleLessonStatus = (
    status: LessonStatus,
    extra?: { lastStepId?: string; lastScore?: number; oralPending?: boolean },
  ) => {
    if (activeLessonId) markLessonStatus(activeLessonId, status, extra);
  };

  const levelSelect = (
    <CoachLevelSelectScreen
      onBack={() => setCoachScreen('coach-name')}
      onSelectLevel={handleSelectLevel}
      onUnsure={handleUnsure}
    />
  );

  // ── Render ──
  switch (coachScreen) {
    case 'coach-level-select':
      return levelSelect;

    case 'coach-placement-test':
      return (
        <PlacementTestScreen
          onBack={() => setCoachScreen('coach-level-select')}
          onComplete={handlePlacementComplete}
        />
      );

    case 'coach-name':
      return (
        <CoachNameScreen
          // Nombre es el PRIMER paso: nuevo usuario sale del módulo al volver;
          // edición/migrado vuelve al panel.
          onBack={profile ? () => setCoachScreen('coach-progress') : onExit}
          onSave={handleNameSaved}
          onSkip={() => handleNameSaved('')}
          initialName={profile?.name ?? ''}
          saveLabel={profile ? 'Guardar' : 'Continuar'}
        />
      );

    case 'coach-context':
      // Personalización OPCIONAL (objetivo/profesión), accesible desde el panel.
      return (
        <ContextCaptureScreen
          onBack={() => setCoachScreen('coach-progress')}
          onSave={handleSaveContext}
          onSkip={() => setCoachScreen('coach-progress')}
        />
      );

    case 'coach-level-welcome':
      return (
        <CoachLevelWelcomeScreen
          name={profile?.name ?? pendingName}
          units={getUnitsForLevel(1)}
          progress={progress}
          onBack={() => setCoachScreen('coach-progress')}
          onOpenLesson={openLessonFromMap}
        />
      );

    case 'coach-progress':
      return profile ? (
        <CoachProgressScreen
          profile={profile}
          progress={progress}
          onBack={onExit}
          onContinue={handleContinue}
          onEditName={() => setCoachScreen('coach-name')}
          onPersonalize={() => setCoachScreen('coach-context')}
          onReset={handleReset}
        />
      ) : (
        levelSelect
      );

    case 'coach-units':
      return (
        <CoachUnitsScreen
          units={getUnitsForLevel(1)}
          progress={progress}
          onBack={() => setCoachScreen('coach-progress')}
          onOpenLesson={openLessonFromMap}
        />
      );

    case 'coach-lesson': {
      const lesson = activeLessonId ? getLesson(activeLessonId) : getLesson(FIRST_LESSON_ID);
      if (!lesson) return levelSelect;
      return (
        <CoachLessonScreen
          lesson={lesson}
          userName={profile?.name ?? pendingName}
          initialStepId={resumeStepId}
          onBack={() => setCoachScreen('coach-units')}
          onStepChange={handleStepChange}
          onStatus={handleLessonStatus}
          onFinish={() => setCoachScreen('coach-units')}
          isReview={reviewMode}
        />
      );
    }

    default:
      return levelSelect;
  }
};
