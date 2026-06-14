// ─────────────────────────────────────────────────────────────────────────────
// Coach IA — Metadatos de contenido e IDs estables (Fase 2A)
//
// Fuente única de la versión de contenido y de las convenciones de IDs estables
// para niveles, unidades, lecciones y frases. Mantener estables estos IDs es
// clave para que el progreso siga siendo válido aunque el contenido evolucione.
// ─────────────────────────────────────────────────────────────────────────────

import type { LevelId } from '../types';

/**
 * Versión del contenido pedagógico (content_version).
 * Súbela cuando cambie el contenido de forma que afecte el progreso.
 */
export const CONTENT_VERSION = '2026.06-1';

// ── Convenciones de IDs estables ─────────────────────────────────────────────
// Formato legible y determinista; nunca reordenar ni renombrar IDs ya emitidos.

/** ID estable de un nivel. p.ej. levelKey(1) → "lvl-1" */
export const levelKey = (level: LevelId): string => `lvl-${level}`;

/** ID estable de una unidad. p.ej. unitKey(1, "pronouns") → "lvl-1.u-pronouns" */
export const unitKey = (level: LevelId, slug: string): string => `lvl-${level}.u-${slug}`;

/** ID estable de una lección. p.ej. lessonKey("lvl-1.u-pronouns", "car-keys") */
export const lessonKey = (unitId: string, slug: string): string => `${unitId}.l-${slug}`;

/** ID estable de un paso. p.ej. stepKey("…l-car-keys", "teach-1") */
export const stepKey = (lessonId: string, slug: string): string => `${lessonId}.s-${slug}`;

/** ID estable de una frase. p.ej. phraseKey("…l-car-keys", "i-need") */
export const phraseKey = (lessonId: string, slug: string): string => `${lessonId}.p-${slug}`;
