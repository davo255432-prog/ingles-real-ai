// ─────────────────────────────────────────────────────────────────────────────
// Coach IA — Servicio de persistencia (Fase 2A)
//
// Persistencia local (localStorage) detrás de una interfaz limpia.
// Esquema v2 con tres capas (usuario / avance / aprendizaje) y migración
// SEGURA desde v1 (el registro v1 se conserva como respaldo).
// Aislado: solo lo usa el módulo Coach IA.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CoachPosition,
  CoachProgress,
  LearnerProfile,
  LessonStatus,
  LevelId,
  TestResult,
} from '../types';
import { CONTENT_VERSION } from '../data/contentMeta';

const KEY_V1 = 'coach_ia_progress_v1';
const KEY_V2 = 'coach_ia_progress_v2';

// ── Utilidades internas ──────────────────────────────────────────────────────

/** UUID estable. Usa crypto.randomUUID si existe; si no, un fallback. */
function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* ignora y usa el fallback */
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function emptyPosition(): CoachPosition {
  return { currentLevelId: null, currentUnitId: null, currentLessonId: null, currentStepId: null };
}

function emptyProgress(): CoachProgress {
  return {
    schemaVersion: 2,
    contentVersion: CONTENT_VERSION,
    profile: null,
    position: emptyPosition(),
    lessons: {},
    review: [],
  };
}

/** Rellena defaults sobre un objeto v2 parcial (tolerante a campos faltantes). */
function normalizeV2(parsed: Partial<CoachProgress>): CoachProgress {
  return {
    schemaVersion: 2,
    contentVersion: parsed.contentVersion ?? CONTENT_VERSION,
    profile: parsed.profile ?? null,
    position: { ...emptyPosition(), ...(parsed.position ?? {}) },
    lessons: parsed.lessons ?? {},
    review: parsed.review ?? [],
  };
}

/** Migra un registro v1 al esquema v2 SIN perder datos. */
function migrateFromV1(rawV1: string): CoachProgress {
  const now = new Date().toISOString();
  // El v1 antiguo tenía forma { profile, lessons, review }
  const v1 = JSON.parse(rawV1) as {
    profile?: Partial<LearnerProfile> & { level?: LevelId | null };
    lessons?: Record<string, { lessonId?: string; completed?: boolean; lastScore?: number; completedAt?: string }>;
    review?: CoachProgress['review'];
  };

  let profile: LearnerProfile | null = null;
  if (v1.profile) {
    const p = v1.profile;
    profile = {
      id: p.id ?? makeId(),                 // genera UUID si faltaba
      name: p.name,                          // se conserva si existía
      namePrompted: p.namePrompted,          // sin marcar → se pedirá una vez
      level: p.level ?? null,
      unsureOfLevel: p.unsureOfLevel ?? false,
      goal: p.goal,
      profession: p.profession,
      placementResult: p.placementResult,
      createdAt: p.createdAt ?? now,
      updatedAt: p.updatedAt ?? now,
    };
  }

  // Lecciones antiguas: { completed: boolean } → { status }
  const lessons: CoachProgress['lessons'] = {};
  for (const [key, old] of Object.entries(v1.lessons ?? {})) {
    lessons[key] = {
      lessonId: old.lessonId ?? key,
      status: old.completed ? 'completed' : 'not-started',
      lastScore: old.lastScore,
      completedAt: old.completedAt,
    };
  }

  return {
    schemaVersion: 2,
    contentVersion: CONTENT_VERSION,
    profile,
    position: emptyPosition(),
    lessons,
    review: v1.review ?? [],
  };
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Lee el progreso (esquema v2). Si solo existe v1, lo migra a v2 y conserva v1
 * como respaldo. Tolerante a errores: ante cualquier fallo devuelve vacío.
 */
export function loadProgress(): CoachProgress {
  try {
    const rawV2 = localStorage.getItem(KEY_V2);
    if (rawV2) {
      return normalizeV2(JSON.parse(rawV2) as Partial<CoachProgress>);
    }

    const rawV1 = localStorage.getItem(KEY_V1);
    if (rawV1) {
      const migrated = migrateFromV1(rawV1);
      saveProgress(migrated);            // escribe v2 (v1 queda intacto)
      console.log('[coach] Migrado coach_ia_progress_v1 → v2 (v1 conservado como respaldo)');
      return migrated;
    }

    return emptyProgress();
  } catch (err) {
    console.warn('[coach] No se pudo leer el progreso, se usa vacío:', String(err));
    return emptyProgress();
  }
}

/** Guarda el progreso completo en v2. */
export function saveProgress(progress: CoachProgress): void {
  try {
    localStorage.setItem(KEY_V2, JSON.stringify(progress));
  } catch (err) {
    console.warn('[coach] No se pudo guardar el progreso:', String(err));
  }
}

/** ¿Existe ya un perfil? */
export function hasProfile(): boolean {
  return loadProgress().profile !== null;
}

/** Devuelve el perfil guardado o null. */
export function getProfile(): LearnerProfile | null {
  return loadProgress().profile;
}

interface CreateProfileInput {
  level: LevelId | null;
  unsureOfLevel: boolean;
  goal?: string;
  profession?: string;
  name?: string;
  namePrompted?: boolean;
  placementResult?: TestResult;
}

/**
 * Crea o actualiza el perfil preservando id, createdAt y campos previos que no
 * lleguen en la entrada. Devuelve el perfil resultante.
 */
export function createProfile(input: CreateProfileInput): LearnerProfile {
  const now = new Date().toISOString();
  const progress = loadProgress();
  const prev = progress.profile;

  const profile: LearnerProfile = {
    id: prev?.id ?? makeId(),
    name: input.name?.trim() || prev?.name,
    namePrompted: input.namePrompted ?? prev?.namePrompted,
    level: input.level,
    unsureOfLevel: input.unsureOfLevel,
    goal: input.goal?.trim() || prev?.goal,
    profession: input.profession?.trim() || prev?.profession,
    placementResult: input.placementResult ?? prev?.placementResult,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };

  saveProgress({ ...progress, profile });
  return profile;
}

/**
 * Actualiza el apodo del usuario y marca que ya se preguntó (namePrompted).
 * Un nombre vacío deja el apodo sin definir pero marca namePrompted=true, de
 * modo que la pantalla de captura no vuelva a aparecer sola.
 */
export function updateName(name: string): LearnerProfile | null {
  const progress = loadProgress();
  if (!progress.profile) return null;
  const profile: LearnerProfile = {
    ...progress.profile,
    name: name.trim() || undefined,
    namePrompted: true,
    updatedAt: new Date().toISOString(),
  };
  saveProgress({ ...progress, profile });
  return profile;
}

/** Actualiza la posición exacta (capa de avance). Preparado para el motor de lección. */
export function updatePosition(position: Partial<CoachPosition>): CoachProgress {
  const progress = loadProgress();
  const next: CoachProgress = { ...progress, position: { ...progress.position, ...position } };
  saveProgress(next);
  return next;
}

/** Marca el estado de una lección (capa de aprendizaje). Preparado para el motor. */
export function setLessonStatus(
  lessonId: string,
  status: LessonStatus,
  extra?: { lastStepId?: string; lastScore?: number; oralPending?: boolean },
): CoachProgress {
  const progress = loadProgress();
  const now = new Date().toISOString();
  const prev = progress.lessons[lessonId];
  progress.lessons[lessonId] = {
    lessonId,
    status,
    lastStepId: extra?.lastStepId ?? prev?.lastStepId,
    lastScore: extra?.lastScore ?? prev?.lastScore,
    oralPending: extra?.oralPending ?? prev?.oralPending,
    startedAt: prev?.startedAt ?? (status !== 'not-started' ? now : undefined),
    completedAt: status === 'completed' ? now : prev?.completedAt,
  };
  saveProgress(progress);
  return progress;
}

/**
 * Porcentaje de avance calculado DINÁMICAMENTE (no se almacena).
 * @param totalLessons total de lecciones del contenido actual.
 */
export function computePercent(progress: CoachProgress, totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  const completed = Object.values(progress.lessons).filter((l) => l.status === 'completed').length;
  return Math.round((completed / totalLessons) * 100);
}

/** Borra el progreso del Coach IA (v2 y respaldo v1). Reinicio total. */
export function resetProgress(): void {
  try {
    localStorage.removeItem(KEY_V2);
    localStorage.removeItem(KEY_V1);
  } catch (err) {
    console.warn('[coach] No se pudo borrar el progreso:', String(err));
  }
}
