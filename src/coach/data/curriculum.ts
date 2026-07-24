// ─────────────────────────────────────────────────────────────────────────────
// Coach IA — Contenido pedagógico (Fase 2B)
//
// Currículo local del Nivel 1. Solo contenido VISUAL y ejercicios resueltos en
// el navegador (0 API): word-order, multiple-choice, fill-blank.
//
// Reglas vinculantes respetadas:
//  - La pronunciación aproximada viene DEFINIDA aquí dentro del contenido (no se
//    genera dinámicamente).
//  - IDs estables vía contentMeta (nunca reordenar/renombrar IDs ya emitidos).
//  - Sin voz, sin figuras, sin backend en esta fase.
//
// Estado actual: la Unidad 1 está disponible con la lección "I need the car
// keys."; las Unidades 2–5 se muestran como "Próximamente" (comingSoon).
// ─────────────────────────────────────────────────────────────────────────────

import type { Level, Lesson, Unit } from '../types';
import { levelKey, lessonKey, stepKey, unitKey } from './contentMeta';

// ── Nivel 1 ──────────────────────────────────────────────────────────────────
const LVL1 = levelKey(1);

// Unidades (IDs estables). Orden pedagógico del Nivel 1.
// IMPORTANTE: `u-essentials` ya existía y aloja la lección "car-keys"; su ID NO
// se cambia para no romper el progreso ya guardado.
const U_PRONOUNS = unitKey(1, 'pronouns');
const U_TO_BE = unitKey(1, 'to-be');
const U_ESSENTIALS = unitKey(1, 'essentials');   // disponible (car-keys)
const U_SENTENCE = unitKey(1, 'sentence');
const U_ARTICLES = unitKey(1, 'articles');

// Lecciones (IDs estables).
// L_PRON: primera lección real del nivel (Unidad 1 — Pronombres).
const L_PRON = lessonKey(U_PRONOUNS, 'pronouns-basics');
// L_TO_BE: Unidad 2 — Verbo to be (am / is / are).
const L_TO_BE = lessonKey(U_TO_BE, 'to-be-basics');
// L1: lección existente "I need the car keys." — ID y contenido INALTERADOS.
//     Se conserva dentro de la Unidad 3 (Verbos esenciales) para más adelante.
const L1 = lessonKey(U_ESSENTIALS, 'car-keys');
const L_SENTENCE = lessonKey(U_SENTENCE, 'sentence-building-basics');

export const LEVEL_1_UNITS: Unit[] = [
  {
    id: U_PRONOUNS,
    levelId: 1,
    title: 'Pronombres',
    description: 'Quién realiza la acción: I, you, he, she, we, they, it.',
    lessonIds: [L_PRON],
  },
  {
    id: U_TO_BE,
    levelId: 1,
    title: 'Verbo to be',
    description: 'Cómo usar am, is y are para describir y presentarte.',
    lessonIds: [L_TO_BE],
  },
  {
    id: U_ESSENTIALS,
    levelId: 1,
    title: 'Verbos esenciales',
    description: 'need, want, have, go… los verbos que más vas a usar.',
    lessonIds: [L1],          // conserva la lección car-keys con ID estable.
  },
  {
    id: U_SENTENCE,
    levelId: 1,
    title: 'Construcción de frases',
    description: 'Une las piezas: sujeto + verbo + complemento.',
    lessonIds: [L_SENTENCE],
  },
  {
    id: U_ARTICLES,
    levelId: 1,
    title: 'Artículos y palabras que conectan',
    description: 'a, an, the y las palabras pequeñas que arman la frase.',
    lessonIds: [],
    comingSoon: true,
  },
];

export const LEVEL_1: Level = {
  id: 1,
  title: 'Nivel Básico — Desde cero',
  description: 'Tus primeras frases reales en inglés, paso a paso.',
  unitIds: LEVEL_1_UNITS.map((u) => u.id),
};

// ── Unidad 1 · Lección 1 · "Pronombres" ──────────────────────────────────────
// Presenta I, you, he, she, we, they, it. Cada pronombre: explicación breve,
// traducción, pronunciación aproximada, icono simple y ejercicio de reconocimiento.
const LESSON_PRONOUNS: Lesson = {
  id: L_PRON,
  unitId: U_PRONOUNS,
  title: 'Pronombres: quién hace la acción',
  goalPhrase: 'I, you, he, she, we, they, it',
  goalSpanish: 'yo, tú/usted, él, ella, nosotros, ellos/ellas, eso/ello',
  steps: [
    // Bienvenida del Coach IA (saludo personalizado; el texto lo arma la pantalla)
    {
      id: stepKey(L_PRON, 'intro'),
      type: 'teach',
      coachIntro: true,
    },

    // I
    {
      id: stepKey(L_PRON, 'teach-i'),
      type: 'teach',
      title: 'El primero: tú mismo',
      icon: '🙋',
      english: 'I',
      spanish: 'Yo',
      pronunciation: 'ai',
      note: 'Se usa para hablar de ti. En inglés, "I" SIEMPRE se escribe con mayúscula.',
    },
    {
      id: stepKey(L_PRON, 'ex-i'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-i',
        type: 'multiple-choice',
        prompt: '¿Qué significa "I"?',
        options: ['Yo', 'Tú', 'Él', 'Ella'],
        answer: 'Yo',
        hint: 'Es el pronombre con el que hablas de ti mismo.',
      },
    },

    // you
    {
      id: stepKey(L_PRON, 'teach-you'),
      type: 'teach',
      title: 'La otra persona',
      icon: '👉',
      english: 'you',
      spanish: 'Tú / usted (también: ustedes)',
      pronunciation: 'iu',
      note: 'Sirve para una persona o varias. El inglés no separa "tú" de "usted".',
    },
    {
      id: stepKey(L_PRON, 'ex-you'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-you',
        type: 'multiple-choice',
        prompt: '¿Qué significa "you"?',
        options: ['Nosotros', 'Tú / usted', 'Ellos', 'Eso'],
        answer: 'Tú / usted',
        hint: 'Apunta a la persona o personas con las que hablas.',
      },
    },

    // he
    {
      id: stepKey(L_PRON, 'teach-he'),
      type: 'teach',
      title: 'Un hombre',
      icon: '👨',
      english: 'he',
      spanish: 'Él',
      pronunciation: 'ji',
      note: 'Se usa para un hombre o un niño (una sola persona).',
    },
    {
      id: stepKey(L_PRON, 'ex-he'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-he',
        type: 'multiple-choice',
        prompt: '¿Cuál pronombre usas para un hombre (él)?',
        options: ['she', 'he', 'it', 'we'],
        answer: 'he',
        hint: 'Suena parecido a "ji".',
      },
    },

    // she
    {
      id: stepKey(L_PRON, 'teach-she'),
      type: 'teach',
      title: 'Una mujer',
      icon: '👩',
      english: 'she',
      spanish: 'Ella',
      pronunciation: 'shi',
      note: 'Se usa para una mujer o una niña (una sola persona).',
    },
    {
      id: stepKey(L_PRON, 'ex-she'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-she',
        type: 'multiple-choice',
        prompt: '¿Qué significa "she"?',
        options: ['Él', 'Ella', 'Eso', 'Nosotros'],
        answer: 'Ella',
        hint: 'Suena parecido a "shi".',
      },
    },

    // we
    {
      id: stepKey(L_PRON, 'teach-we'),
      type: 'teach',
      title: 'Tú y más personas',
      icon: '👥',
      english: 'we',
      spanish: 'Nosotros / nosotras',
      pronunciation: 'wi',
      note: 'Te incluye a ti y a otras personas: tú + alguien más.',
    },
    {
      id: stepKey(L_PRON, 'ex-we'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-we',
        type: 'multiple-choice',
        prompt: '¿Qué significa "we"?',
        options: ['Yo', 'Tú', 'Nosotros', 'Ellos'],
        answer: 'Nosotros',
        hint: 'Te incluye a ti dentro del grupo.',
      },
    },

    // they
    {
      id: stepKey(L_PRON, 'teach-they'),
      type: 'teach',
      title: 'Otras personas',
      icon: '🧑‍🤝‍🧑',
      english: 'they',
      spanish: 'Ellos / ellas',
      pronunciation: 'dei',
      note: 'Un grupo de personas (o cosas), sin incluirte a ti.',
    },
    {
      id: stepKey(L_PRON, 'ex-they'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-they',
        type: 'multiple-choice',
        prompt: '¿Qué significa "they"?',
        options: ['Ellos / ellas', 'Nosotros', 'Tú', 'Él'],
        answer: 'Ellos / ellas',
        hint: 'Un grupo que no te incluye.',
      },
    },

    // it
    {
      id: stepKey(L_PRON, 'teach-it'),
      type: 'teach',
      title: 'Una cosa o animal',
      icon: '📦',
      english: 'it',
      spanish: 'Eso / ello',
      pronunciation: 'it',
      note: 'Se usa para una cosa, un objeto o un animal. No para personas.',
    },
    {
      id: stepKey(L_PRON, 'ex-it'),
      type: 'exercise',
      exercise: {
        id: 'pron-ex-it',
        type: 'multiple-choice',
        // Pregunta por el SIGNIFICADO (no por el uso), igual que los demás.
        prompt: '¿Qué significa "it"?',
        options: ['eso / ello', 'él', 'nosotros / nosotras', 'tú / usted / ustedes'],
        answer: 'eso / ello',
        // Explicación separada del Coach: el USO de "it" va aparte del significado.
        hint: 'Usamos it para hablar de una cosa, un objeto o un animal.',
      },
    },

    // Práctica final de la unidad: cuadro resumen + ejercicios mezclados +
    // práctica de oído + "practicar otra vez". La pantalla la maneja el
    // componente PronounsPractice (estado interno y lógica de error avanzada).
    {
      id: stepKey(L_PRON, 'practice'),
      type: 'exercise',
      practice: true,
    },
  ],
};

// ── Datos de pronombres (cuadro resumen y generador de práctica) ──────────────
// pron: pronunciación aproximada del cuadro resumen (ai, iu, ji, shi, wi, dei, it).
// tip/example: se usan en la lógica de error (explicación + ejemplo distinto).
export interface PronounInfo {
  id: string;        // clave estable interna: 'i','you','he','she','we','they','it'
  en: string;        // forma en inglés ("I", "you"…)
  meaning: string;   // texto del cuadro resumen (puede mezclar uso, p.ej. "it")
  translation?: string; // traducción pura para ejercicios (si difiere del resumen)
  pron: string;      // pronunciación aproximada
  icon: string;      // figura/emoji
  tip: string;       // explicación breve del Coach (primer error)
  example: string;   // ejemplo distinto (primer error)
}

export const PRONOUNS_INFO: PronounInfo[] = [
  {
    id: 'i', en: 'I', meaning: 'yo', pron: 'ai', icon: '🙋',
    tip: '"I" se usa para hablar de ti mismo. Siempre va en mayúscula.',
    example: 'I → yo.',
  },
  {
    id: 'you', en: 'you', meaning: 'tú / usted / ustedes', pron: 'iu', icon: '👉',
    tip: '"you" sirve para una o varias personas con las que hablas.',
    example: 'you → tú / usted / ustedes.',
  },
  {
    id: 'he', en: 'he', meaning: 'él', pron: 'ji', icon: '👨',
    tip: '"he" es para un hombre o un niño (una sola persona).',
    example: 'he → él.',
  },
  {
    id: 'she', en: 'she', meaning: 'ella', pron: 'shi', icon: '👩',
    tip: '"she" es para una mujer o una niña (una sola persona).',
    example: 'she → ella.',
  },
  {
    id: 'we', en: 'we', meaning: 'nosotros / nosotras', pron: 'wi', icon: '👥',
    tip: '"we" te incluye a ti dentro del grupo (tú + otros).',
    example: 'we → nosotros / nosotras.',
  },
  {
    id: 'they', en: 'they', meaning: 'ellos / ellas', pron: 'dei', icon: '🧑‍🤝‍🧑',
    tip: '"they" es un grupo de personas que no te incluye a ti.',
    example: 'they → ellos / ellas.',
  },
  {
    id: 'it', en: 'it', meaning: 'cosa, objeto o animal', translation: 'eso / ello', pron: 'it', icon: '📦',
    tip: '"it" se usa para una cosa, un objeto o un animal, no para personas.',
    example: 'it → eso / ello.',
  },
];

// ── Unidad 2 · Datos del verbo "to be" (am / is / are) ───────────────────────
// Contenido visual de la Unidad 2. Cada frase trae inglés, traducción,
// pronunciación aproximada (DEFINIDA aquí), una figura/escena y una explicación
// breve del Coach. La pantalla autónoma ToBePractice consume estos datos.
export type BeForm = 'am' | 'is' | 'are';

export interface BePhrase {
  id: string;     // clave estable interna de la frase
  en: string;     // frase en inglés ("I am ready.")
  es: string;     // traducción al español
  pron: string;   // pronunciación aproximada ("ai am rédi")
  form: BeForm;   // am / is / are
  icon: string;   // figura o escena (emoji estático)
  coach: string;  // explicación breve del Coach
}

export interface BeBlock {
  id: BeForm;            // 'am' | 'is' | 'are'
  pronouns: string;      // "I" | "he / she / it" | "you / we / they"
  verb: BeForm;          // verbo del grupo
  title: string;         // "I + am"
  intro: string;         // explicación breve del Coach al abrir el bloque
  phrases: BePhrase[];   // frases que se enseñan
  speakPhraseIds: string[]; // frases a repetir con la voz tras el bloque
}

export interface BeDialogue {
  id: string;
  aEn: string; aEs: string; aPron: string;
  bEn: string; bEs: string; bPron: string;
}

// Mapa pronombre → verbo (para el cuadro visual y ejercicios de relación).
export const TO_BE_GROUPS: { verb: BeForm; pronouns: string; example: string }[] = [
  { verb: 'am', pronouns: 'I', example: 'I am' },
  { verb: 'is', pronouns: 'he / she / it', example: 'he is' },
  { verb: 'are', pronouns: 'you / we / they', example: 'you are' },
];

export const TO_BE_BLOCKS: BeBlock[] = [
  {
    id: 'am',
    verb: 'am',
    pronouns: 'I',
    title: 'I + am',
    intro: 'Con "I" (yo) siempre usamos am. Sirve para decir quién eres o cómo estás.',
    phrases: [
      {
        id: 'am-david', en: 'I am David.', es: 'Yo soy David.', pron: 'ai am dei-vid',
        form: 'am', icon: '🙋‍♂️', coach: 'Para presentarte: "I am" + tu nombre.',
      },
      {
        id: 'am-ready', en: 'I am ready.', es: 'Estoy listo.', pron: 'ai am re-di',
        form: 'am', icon: '✅', coach: '"I am" también dice cómo estás en este momento.',
      },
    ],
    speakPhraseIds: ['am-ready'],
  },
  {
    id: 'is',
    verb: 'is',
    pronouns: 'he / she / it',
    title: 'he / she / it + is',
    intro: 'Con he (él), she (ella) e it (una cosa) usamos is.',
    phrases: [
      {
        id: 'is-tired', en: 'He is tired.', es: 'Él está cansado.', pron: 'ji is tai-erd',
        form: 'is', icon: '😴', coach: 'he (un hombre) → is.',
      },
      {
        id: 'is-happy', en: 'She is happy.', es: 'Ella está feliz.', pron: 'shi is ja-pi',
        form: 'is', icon: '😊', coach: 'she (una mujer) → is.',
      },
      {
        id: 'is-open', en: 'It is open.', es: 'Está abierto.', pron: 'it is ou-pen',
        form: 'is', icon: '🚪', coach: 'it (una cosa) → is.',
      },
    ],
    speakPhraseIds: ['is-tired', 'is-happy'],
  },
  {
    id: 'are',
    verb: 'are',
    pronouns: 'you / we / they',
    title: 'you / we / they + are',
    intro: 'Con you (tú/ustedes), we (nosotros) y they (ellos) usamos are.',
    phrases: [
      {
        id: 'are-here', en: 'You are here.', es: 'Tú estás aquí.', pron: 'iu ar jir',
        form: 'are', icon: '📍', coach: 'you → are.',
      },
      {
        id: 'are-ready', en: 'We are ready.', es: 'Estamos listos.', pron: 'wi ar re-di',
        form: 'are', icon: '👥', coach: 'we (nosotros) → are.',
      },
      {
        id: 'are-outside', en: 'They are outside.', es: 'Ellos están afuera.', pron: 'dei ar aut-said',
        form: 'are', icon: '🌳', coach: 'they (ellos) → are.',
      },
    ],
    speakPhraseIds: ['are-ready', 'are-outside'],
  },
];

export const TO_BE_DIALOGUES: BeDialogue[] = [
  {
    id: 'dlg-ready',
    aEn: 'Are you ready?', aEs: '¿Estás listo?', aPron: 'ar iu re-di',
    bEn: 'Yes, I am.', bEs: 'Sí, lo estoy.', bPron: 'ies, ai am',
  },
  {
    id: 'dlg-here',
    aEn: 'Is she here?', aEs: '¿Ella está aquí?', aPron: 'is shi jir',
    bEn: 'Yes, she is.', bEs: 'Sí, lo está.', bPron: 'ies, shi is',
  },
  {
    id: 'dlg-outside',
    aEn: 'Are they outside?', aEs: '¿Ellos están afuera?', aPron: 'ar dei aut-said',
    bEn: 'Yes, they are.', bEs: 'Sí, lo están.', bPron: 'ies, dei ar',
  },
];

// Todas las frases en un índice plano (para oído, voz y ejercicios mezclados).
export const TO_BE_PHRASES: BePhrase[] = TO_BE_BLOCKS.flatMap((b) => b.phrases);

/** Busca una frase del to-be por su id. */
export function getBePhrase(id: string): BePhrase | undefined {
  return TO_BE_PHRASES.find((p) => p.id === id);
}

/** ID estable de la lección de la Unidad 2 (lo usa ToBePractice para los pasos). */
export const TO_BE_LESSON_ID = L_TO_BE;
export const ESSENTIAL_VERBS_LESSON_ID = L1;
export const SENTENCE_BUILDING_LESSON_ID = L_SENTENCE;

// ── Unidad 2 · Lección "Verbo to be" ─────────────────────────────────────────
// Toda la unidad (bienvenida, cuadro visual, bloques, oído, voz, diálogos,
// ejercicios, resumen y cierre) la maneja la pantalla autónoma ToBePractice.
const LESSON_TO_BE: Lesson = {
  id: L_TO_BE,
  unitId: U_TO_BE,
  title: 'Verbo to be: am, is, are',
  goalPhrase: 'I am · he is · you are',
  goalSpanish: 'soy/estoy · es/está · eres/estás',
  steps: [
    {
      id: stepKey(L_TO_BE, 'unit'),
      type: 'exercise',
      toBe: true,
    },
  ],
};

const LESSON_SENTENCE_BUILDING: Lesson = {
  id: L_SENTENCE,
  unitId: U_SENTENCE,
  title: 'Construcción de frases',
  goalPhrase: 'I need water.',
  goalSpanish: 'Necesito agua.',
  steps: [
    {
      id: stepKey(L_SENTENCE, 'unit'),
      type: 'exercise',
      sentenceBuilding: true,
    },
  ],
};

// ── Lección 1 · "I need the car keys." ───────────────────────────────────────
const LESSON_1: Lesson = {
  id: L1,
  unitId: U_ESSENTIALS,
  title: 'I need the car keys.',
  goalPhrase: 'I need the car keys.',
  goalSpanish: 'Necesito las llaves del carro.',
  steps: [
    // 1) Presentación de la frase objetivo
    {
      id: stepKey(L1, 'teach-goal'),
      type: 'teach',
      title: 'Tu frase de hoy',
      english: 'I need the car keys.',
      spanish: 'Necesito las llaves del carro.',
      pronunciation: 'ái niid de car kíis',
      note: 'Una frase corta y muy útil cuando vas a salir y buscas las llaves.',
    },
    // 2) Desglose pieza por pieza
    {
      id: stepKey(L1, 'teach-pieces'),
      type: 'teach',
      title: 'Pieza por pieza',
      note: 'Cada palabra tiene su lugar. Así se arma la frase:',
      pieces: [
        { id: 'p-i', text: 'I', meaning: 'Yo', pronunciation: 'ái' },
        { id: 'p-need', text: 'need', meaning: 'necesito', pronunciation: 'niid' },
        { id: 'p-the', text: 'the', meaning: 'las / el / la', pronunciation: 'de' },
        { id: 'p-car', text: 'car', meaning: 'carro', pronunciation: 'car' },
        { id: 'p-keys', text: 'keys', meaning: 'llaves', pronunciation: 'kíis' },
      ],
    },
    // 3) Ejercicio: significado (multiple-choice)
    {
      id: stepKey(L1, 'ex-meaning'),
      type: 'exercise',
      exercise: {
        id: 'ex1',
        type: 'multiple-choice',
        prompt: '¿Qué significa "I need"?',
        options: ['Yo tengo', 'Yo necesito', 'Yo quiero', 'Yo busco'],
        answer: 'Yo necesito',
        hint: '"need" se parece a "necesitar".',
      },
    },
    // 4) Ejercicio: completar el hueco (fill-blank)
    {
      id: stepKey(L1, 'ex-blank'),
      type: 'exercise',
      exercise: {
        id: 'ex2',
        type: 'fill-blank',
        prompt: 'Completa la frase con la palabra correcta.',
        blankSentence: 'I need the ___ keys.',
        options: ['car', 'dog', 'house', 'water'],
        answer: 'car',
        hint: 'Las llaves son del… carro.',
      },
    },
    // 5) Ejercicio: ordenar palabras (word-order)
    {
      id: stepKey(L1, 'ex-order'),
      type: 'exercise',
      exercise: {
        id: 'ex3',
        type: 'word-order',
        prompt: 'Ordena las piezas para formar la frase.',
        pieces: [
          { id: 'w-i', text: 'I', meaning: 'Yo', pronunciation: 'ái' },
          { id: 'w-need', text: 'need', meaning: 'necesito', pronunciation: 'niid' },
          { id: 'w-the', text: 'the', meaning: 'las', pronunciation: 'de' },
          { id: 'w-car', text: 'car', meaning: 'carro', pronunciation: 'car' },
          { id: 'w-keys', text: 'keys', meaning: 'llaves', pronunciation: 'kíis' },
        ],
        answer: 'I need the car keys',
        hint: 'Empieza por quién: "I".',
      },
    },
  ],
};

// ── Índices y helpers ────────────────────────────────────────────────────────

/** Todas las unidades del contenido (por ahora solo Nivel 1). */
export const ALL_UNITS: Unit[] = [...LEVEL_1_UNITS];

/** Todas las lecciones del contenido, indexadas por ID estable. */
export const LESSONS: Record<string, Lesson> = {
  [LESSON_PRONOUNS.id]: LESSON_PRONOUNS,
  [LESSON_TO_BE.id]: LESSON_TO_BE, // Unidad 2 — Verbo to be
  [LESSON_1.id]: LESSON_1, // car-keys: conservada (ID/contenido/progreso intactos)
  [LESSON_SENTENCE_BUILDING.id]: LESSON_SENTENCE_BUILDING, // Unidad 4 — Construcción de frases
};

/** Total de lecciones disponibles (para porcentajes dinámicos). */
export const TOTAL_LESSONS = Object.keys(LESSONS).length;

/** Devuelve las unidades de un nivel. */
export function getUnitsForLevel(levelId: number): Unit[] {
  return ALL_UNITS.filter((u) => u.levelId === levelId);
}

/** Devuelve una lección por su ID estable. */
export function getLesson(lessonId: string): Lesson | undefined {
  return LESSONS[lessonId];
}

/** Primera lección del nivel (Unidad 1 — Pronombres) y la unidad que la aloja. */
export const FIRST_LESSON_ID = LESSON_PRONOUNS.id;
export const FIRST_UNIT_ID = U_PRONOUNS;
export const FIRST_LEVEL_ID = LVL1;
