// ─────────────────────────────────────────────────────────────────────────────
// Coach IA — Prueba rápida de ubicación (Fase 1)
//
// 6 preguntas con formatos mixtos. 100% local para la lógica; la pregunta de
// comprensión auditiva reutiliza la voz existente (OpenAI /api/speech).
//
// Dificultad: 1–2 → Nivel 1, 3–4 → Nivel 2, 5–6 → Nivel 3.
// Distractores basados en errores comunes de hispanohablantes (no opciones
// absurdas).
// ─────────────────────────────────────────────────────────────────────────────

import type { LevelId } from '../types';

export type PlacementFormat =
  | 'multiple-choice'
  | 'fill-blank'
  | 'word-order'
  | 'listening'
  | 'situation';

export interface PlacementQuestion {
  id: string;
  format: PlacementFormat;
  tier: LevelId;
  /** Instrucción en español para el usuario. */
  prompt: string;
  /** Frase con hueco (fill-blank). */
  sentence?: string;
  /** Escena/contexto (situation). */
  scene?: string;
  /** Texto que se reproduce en inglés (listening). */
  audioText?: string;
  /** Opciones para formatos tipo selección. */
  options?: string[];
  /** Índice de la opción correcta (formatos de selección). */
  answerIndex?: number;
  /** Secuencia correcta (word-order). */
  answerOrder?: string[];
  /** Piezas desordenadas que se muestran (word-order). */
  scrambled?: string[];
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // ── Nivel 1 ────────────────────────────────────────────────────────────────
  {
    id: 'q1',
    format: 'multiple-choice',
    tier: 1,
    prompt: 'Elige la forma correcta: "They ___ my friends."',
    options: ['are', 'is', 'be'],
    answerIndex: 0, // error común: "they is" / "they be"
  },
  {
    id: 'q2',
    format: 'multiple-choice',
    tier: 1,
    prompt: 'Elige el artículo correcto: "I want ___ apple."',
    options: ['an', 'a', 'the'],
    answerIndex: 0, // error común: "a apple"
  },

  // ── Nivel 2 ────────────────────────────────────────────────────────────────
  {
    id: 'q3',
    format: 'fill-blank',
    tier: 2,
    prompt: 'Completa la pregunta con la palabra correcta:',
    sentence: '___ you have a car?',
    options: ['Do', 'Are', 'Does'],
    answerIndex: 0, // error común: "Are you have a car?"
  },
  {
    id: 'q4',
    format: 'word-order',
    tier: 2,
    prompt: 'Ordena las palabras para decir: "Necesito las llaves del carro."',
    answerOrder: ['I', 'need', 'the', 'car', 'keys'],
    scrambled: ['keys', 'I', 'the', 'need', 'car'],
  },

  // ── Nivel 3 ────────────────────────────────────────────────────────────────
  {
    id: 'q5',
    format: 'listening',
    tier: 3,
    prompt: 'Escucha y elige la traducción correcta.',
    audioText: 'What are you going to eat today?',
    options: [
      '¿Qué vas a comer hoy?',
      '¿Qué comiste hoy?',
      '¿Qué quieres comer hoy?',
    ],
    answerIndex: 0, // distractores: confundir futuro (going to) con pasado / querer
  },
  {
    id: 'q6',
    format: 'situation',
    tier: 3,
    prompt: '¿Qué frase suena más natural?',
    scene: 'Tu jefe te dice que un cliente está esperando. Quieres responder que lo atenderás enseguida.',
    options: [
      "I'll take care of it right away.",
      'I go to do it now.',
      'I will to attend him now.',
    ],
    answerIndex: 0, // distractores: traducción literal / "will to" + "attend"
  },

  // ── Nivel 2 vs 3 (preguntas de mayor dificultad) ────────────────────────────
  {
    id: 'q7',
    format: 'multiple-choice',
    tier: 3,
    prompt: 'Elige la pregunta indirecta correcta:',
    options: [
      'Do you know where the keys are?',
      'Do you know where are the keys?',
      'Do you know where the keys is?',
    ],
    answerIndex: 0, // distractores: mantener la inversión / error de concordancia
  },
  {
    id: 'q8',
    format: 'multiple-choice',
    tier: 3,
    prompt: 'Lee la frase y elige su significado correcto:',
    sentence: 'I was waiting for the keys, but nobody brought them.',
    options: [
      'Yo estaba esperando las llaves, pero nadie las trajo.',
      'Yo espero las llaves, pero nadie las trae.',
      'Yo esperaré las llaves, pero nadie las traerá.',
    ],
    answerIndex: 0, // distractores: confundir el pasado con presente / futuro
  },
];

/**
 * Calcula el nivel sugerido a partir del número de aciertos (sobre 8).
 * 0–3 → Nivel 1, 4–6 → Nivel 2, 7–8 → Nivel 3.
 * Las preguntas 7 y 8 (más difíciles) ayudan a separar Nivel 2 de Nivel 3.
 */
export function suggestLevel(correct: number): LevelId {
  if (correct <= 3) return 1;
  if (correct <= 6) return 2;
  return 3;
}

/** Explicación breve y positiva del nivel sugerido. */
export const LEVEL_EXPLANATION: Record<LevelId, string> = {
  1: 'Reconoces algunas palabras. Empezaremos enseñándote cómo unirlas para formar frases.',
  2: 'Ya formas frases sencillas. Ahora vas a mejorar preguntas, negaciones y tiempos verbales.',
  3: 'Ya puedes comunicarte. Trabajaremos fluidez, comprensión y formas más naturales.',
  4: 'Tienes un nivel avanzado. Puliremos matices y naturalidad.',
  5: 'Tu inglés es muy sólido. Refinaremos los últimos detalles.',
};
