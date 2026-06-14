// ─────────────────────────────────────────────────────────────────────────────
// Coach IA — Modelo de datos base (Fase 0)
//
// Módulo de aprendizaje guiado, AISLADO del resto de la app.
// En Fase 0 solo se define el esqueleto de tipos. No hay lógica todavía.
//
// Reglas vinculantes que estos tipos respetan:
//  - La pronunciación aproximada viene DEFINIDA dentro del contenido JSON de
//    cada lección (campo `pronunciation` en piezas/pasos). No se genera
//    dinámicamente en cada sesión.
//  - Persistencia local (localStorage) en v1, detrás de una interfaz limpia.
//  - Voz e IA reutilizan los endpoints OpenAI existentes / nuevos (no Claude,
//    no voz nativa del navegador).
// ─────────────────────────────────────────────────────────────────────────────

// ── Navegación interna del módulo (sub-pantallas del Coach) ──────────────────
export type CoachScreen =
  | 'coach-level-select'   // elegir nivel / "no estoy seguro"
  | 'coach-placement-test' // test rápido de ubicación
  | 'coach-name'           // captura opcional de apodo
  | 'coach-context'        // captura opcional de meta / profesión
  | 'coach-progress'       // panel de progreso (hub del módulo)
  | 'coach-level-welcome'  // bienvenida al nivel (antes del mapa de unidades)
  | 'coach-units'          // estructura de unidades del nivel
  | 'coach-lesson'         // lección guiada
  | 'coach-unit-test'      // examen de unidad
  | 'coach-test-result'    // resultado de examen
  | 'coach-review';        // repaso (SRS)

// ── Niveles y unidades ───────────────────────────────────────────────────────
export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface Level {
  id: LevelId;
  title: string;        // p.ej. "Nivel 1 — Fundamentos"
  description: string;
  unitIds: string[];    // orden de unidades dentro del nivel
}

export interface Unit {
  id: string;           // p.ej. "u1-pronouns"
  levelId: LevelId;
  title: string;        // p.ej. "Pronombres y cortesía"
  description: string;
  lessonIds: string[];  // orden de lecciones dentro de la unidad
  comingSoon?: boolean; // true = visible pero aún bloqueada ("Próximamente")
}

// ── Pieza de una frase (para construir oraciones) ────────────────────────────
export interface Piece {
  id: string;
  text: string;          // p.ej. "I need"
  meaning: string;       // p.ej. "Yo necesito"
  pronunciation: string; // pronunciación aproximada, REVISADA en el JSON
}

// ── Ejercicios (todos resueltos localmente, 0 API) ───────────────────────────
export type ExerciseType =
  | 'word-order'      // ordenar piezas para formar la frase
  | 'multiple-choice' // elegir la opción correcta
  | 'fill-blank'      // completar el hueco
  | 'phrase-builder'  // construir frase con piezas
  | 'open-speak';     // hablar libremente (evaluación vía IA)

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;            // instrucción mostrada al usuario
  pieces?: Piece[];          // para word-order / phrase-builder
  options?: string[];        // para multiple-choice
  answer?: string;           // respuesta correcta (texto canónico)
  blankSentence?: string;    // para fill-blank, con marcador del hueco
  hint?: string;
}

// ── Paso de una lección ──────────────────────────────────────────────────────
export type StepType = 'teach' | 'listen' | 'exercise' | 'speak';

export interface Step {
  id: string;
  type: StepType;
  title?: string;
  // Contenido de enseñanza (teach / listen)
  english?: string;
  spanish?: string;
  pronunciation?: string;     // aproximada, REVISADA en el JSON
  note?: string;
  icon?: string;              // figura/icono simple (emoji) para el paso "teach"
  coachIntro?: boolean;       // bienvenida del Coach IA (saludo personalizado)
  practice?: boolean;         // práctica final de unidad (la maneja PronounsPractice)
  // Práctica oral (paso "speak"): pronombres a repetir con la voz.
  speakPronounIds?: string[]; // ids de pronombres a practicar en orden
  speakRandomCount?: number;  // si se define, elige N pronombres al azar
  pieces?: Piece[];           // desglose de la frase (paso "teach")
  // Para pasos de ejercicio
  exercise?: Exercise;
}

// ── Lección ──────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;            // p.ej. "u4-l1-car-keys"
  unitId: string;
  title: string;         // p.ej. "I need the car keys."
  goalPhrase: string;    // frase objetivo en inglés
  goalSpanish: string;   // significado en español
  steps: Step[];
}

// ── CAPA 1 · Usuario — Perfil del estudiante (persistido localmente) ─────────
export interface LearnerProfile {
  id: string;                  // UUID local estable (no cambia entre sesiones)
  name?: string;               // apodo opcional ("¿Cómo quieres que te llame…")
  namePrompted?: boolean;      // true si ya se mostró la pantalla de apodo (1 sola vez)
  level: LevelId | null;       // null = aún sin definir
  unsureOfLevel: boolean;      // marcó "no estoy seguro"
  goal?: string;               // meta de aprendizaje (opcional)
  profession?: string;         // profesión (opcional)
  placementResult?: TestResult;// resultado de la prueba de ubicación (si la hizo)
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
}

// ── CAPA 2 · Avance — Posición exacta del usuario ────────────────────────────
export interface CoachPosition {
  currentLevelId: string | null;   // ID estable de nivel
  currentUnitId: string | null;    // ID estable de unidad
  currentLessonId: string | null;  // ID estable de lección
  currentStepId: string | null;    // ID estable de paso
}

// ── CAPA 3 · Aprendizaje — Estado por lección ────────────────────────────────
export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LessonProgress {
  lessonId: string;            // ID estable de lección
  status: LessonStatus;
  lastStepId?: string;         // último paso visto (para reanudar)
  lastScore?: number;
  oralPending?: boolean;       // true = se completó sin práctica oral (modo silencioso)
  startedAt?: string;
  completedAt?: string;
}

// ── Raíz del progreso persistido (esquema v2) ────────────────────────────────
export interface CoachProgress {
  schemaVersion: 2;            // versión del esquema de almacenamiento
  contentVersion: string;      // content_version del contenido pedagógico
  profile: LearnerProfile | null;   // capa 1
  position: CoachPosition;          // capa 2
  lessons: Record<string, LessonProgress>; // capa 3
  review: ReviewItem[];             // (SRS — vacío hasta fase posterior)
}

// ── Repaso espaciado (SRS) ───────────────────────────────────────────────────
export interface ReviewItem {
  id: string;          // referencia a lección/frase
  phrase: string;
  dueAt: string;       // ISO timestamp del próximo repaso
  interval: number;    // días hasta el próximo repaso
  ease: number;        // factor de facilidad
}

// ── Resultado de test (ubicación / unidad) ───────────────────────────────────
export interface TestResult {
  total: number;
  correct: number;
  suggestedLevel?: LevelId;   // para el test de ubicación
  passed?: boolean;           // para examen de unidad
}
