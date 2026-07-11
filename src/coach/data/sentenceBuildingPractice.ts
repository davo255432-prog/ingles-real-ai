// Unidad 4 - Construye frases completas.
// Fuente unica, cerrada y controlada de contenido. No desbloquea la unidad.
// Solo usa contenido aprendido en Unidades 1, 2 y 3.

export type SentencePatternId =
  | 'person-verb-complement'
  | 'person-to-be-state'
  | 'person-to-be-place'
  | 'person-go-to-destination'
  | 'idea-connector-idea';

export type SentenceExerciseKind =
  | 'order-blocks'
  | 'order-words'
  | 'choose-correct'
  | 'match-halves'
  | 'fill-missing'
  | 'choose-connector'
  | 'correct-error'
  | 'build-from-pieces'
  | 'rebuild-connected';

export interface SentenceVocabularyItem {
  id: string;
  english: string;
  spanish: string;
  pronunciation: string;
}

export interface SentencePattern {
  id: SentencePatternId;
  title: string;
  miniRule: string;
  visualPieces: string[];
  example: string;
  spanish: string;
  pronunciation: string;
  audioText: string;
}

export interface GrowingSentence {
  id: string;
  steps: Array<{
    text: string;
    spanish: string;
    pronunciation: string;
    audioText: string;
  }>;
}

export interface CommonSentenceError {
  id: string;
  wrong: string;
  hintQuestion: string;
  correct: string;
  explanation: string;
  pronunciation: string;
  audioText: string;
}

export interface SentenceExercise {
  id: string;
  kind: SentenceExerciseKind;
  prompt: string;
  pieces?: string[];
  options?: string[];
  answer: string | string[];
  spanish?: string;
  hint: string;
  explanation: string;
  pronunciation?: string;
  audioText?: string;
  difficulty: 1 | 2 | 3;
}

export interface GuidedConstruction {
  id: string;
  situationEs: string;
  expected: string;
  pieces: string[];
  spanish: string;
  pronunciation: string;
  audioText: string;
  blocks: string[];
}

export interface ControlledDialogueLine {
  speaker: string;
  english: string;
  spanish: string;
  pronunciation: string;
}

export interface ControlledDialogue {
  id: string;
  setting: 'work' | 'store' | 'restaurant';
  title: string;
  lines: ControlledDialogueLine[];
  slowAudioText: string;
  normalAudioText: string;
}

export interface PreChallengeItem {
  id: string;
  english: string;
  spanish: string;
  pronunciation: string;
  audioText: string;
}

export interface SpeakingPracticeSituation {
  id: string;
  level: 1 | 2 | 3;
  instructionEs: string;
  expected: string;
  alternatives?: string[];
  pronunciation: string;
  audioText: string;
  expectedBlocks: string[];
}

export interface MissionStory {
  id: string;
  situationEs: string;
  expected: string;
  pronunciation: string;
  slowAudioText: string;
  normalAudioText: string;
  keywords: string[];
  fragments?: string[];
}

export const SENTENCE_BUILDING_UNIT_INTRO = {
  title: 'Construye frases completas',
  centralMessage: 'Ya conoces las piezas. Ahora aprenderas a construir frases completas.',
  visibleGoals: [
    'Ordenar correctamente una frase.',
    'Decir donde estas.',
    'Decir adonde vas.',
    'Expresar una necesidad o deseo.',
    'Unir dos ideas.',
    'Detectar errores basicos.',
  ],
};

export const SENTENCE_BUILDING_PRONOUNS: SentenceVocabularyItem[] = [
  { id: 'i', english: 'I', spanish: 'yo', pronunciation: 'ai' },
  { id: 'you', english: 'You', spanish: 'tu / usted', pronunciation: 'iu' },
  { id: 'he', english: 'He', spanish: 'el', pronunciation: 'ji' },
  { id: 'she', english: 'She', spanish: 'ella', pronunciation: 'shi' },
  { id: 'we', english: 'We', spanish: 'nosotros / nosotras', pronunciation: 'wi' },
  { id: 'they', english: 'They', spanish: 'ellos / ellas', pronunciation: 'dei' },
  { id: 'it', english: 'It', spanish: 'eso / ello', pronunciation: 'it' },
];

export const SENTENCE_BUILDING_TO_BE: SentenceVocabularyItem[] = [
  { id: 'am', english: 'am', spanish: 'soy / estoy', pronunciation: 'am' },
  { id: 'is', english: 'is', spanish: 'es / esta', pronunciation: 'is' },
  { id: 'are', english: 'are', spanish: 'eres / estas / son / estan', pronunciation: 'ar' },
];

export const SENTENCE_BUILDING_VERBS: SentenceVocabularyItem[] = [
  { id: 'need', english: 'need', spanish: 'necesitar', pronunciation: 'nid' },
  { id: 'have', english: 'have', spanish: 'tener', pronunciation: 'jav' },
  { id: 'want', english: 'want', spanish: 'querer', pronunciation: 'uant' },
  { id: 'go-to', english: 'go to', spanish: 'ir a', pronunciation: 'gou tu' },
];

export const SENTENCE_BUILDING_CONNECTORS: SentenceVocabularyItem[] = [
  { id: 'and', english: 'and', spanish: 'y', pronunciation: 'and' },
  { id: 'but', english: 'but', spanish: 'pero', pronunciation: 'bat' },
  { id: 'because', english: 'because', spanish: 'porque', pronunciation: 'bi-kos' },
  { id: 'also', english: 'also', spanish: 'tambien', pronunciation: 'ol-sou' },
];

export const SENTENCE_BUILDING_PREPOSITIONS: SentenceVocabularyItem[] = [
  { id: 'in', english: 'in', spanish: 'en / dentro de', pronunciation: 'in' },
  { id: 'at', english: 'at', spanish: 'en', pronunciation: 'at' },
];

export const SENTENCE_BUILDING_VOCABULARY: SentenceVocabularyItem[] = [
  { id: 'water', english: 'water', spanish: 'agua', pronunciation: 'uo-ter' },
  { id: 'food', english: 'food', spanish: 'comida', pronunciation: 'fud' },
  { id: 'help', english: 'help', spanish: 'ayuda', pronunciation: 'jelp' },
  { id: 'keys', english: 'keys', spanish: 'llaves', pronunciation: 'kis' },
  { id: 'phone', english: 'phone', spanish: 'telefono', pronunciation: 'foun' },
  { id: 'car', english: 'car', spanish: 'carro', pronunciation: 'kar' },
  { id: 'home', english: 'home', spanish: 'casa', pronunciation: 'joum' },
  { id: 'work', english: 'work', spanish: 'trabajo', pronunciation: 'uerk' },
  { id: 'school', english: 'school', spanish: 'escuela', pronunciation: 'skul' },
  { id: 'ready', english: 'ready', spanish: 'listo / lista', pronunciation: 're-di' },
  { id: 'tired', english: 'tired', spanish: 'cansado / cansada', pronunciation: 'tai-erd' },
  { id: 'here', english: 'here', spanish: 'aqui', pronunciation: 'jir' },
  { id: 'coffee', english: 'coffee', spanish: 'cafe', pronunciation: 'ko-fi' },
];

export const SENTENCE_BUILDING_PATTERNS: SentencePattern[] = [
  {
    id: 'person-verb-complement',
    title: 'Persona + verbo + complemento',
    miniRule: 'En ingles normalmente va primero quien habla, despues la accion y luego la cosa.',
    visualPieces: ['I', 'need', 'water'],
    example: 'I need water.',
    spanish: 'Necesito agua.',
    pronunciation: 'ai nid uo-ter',
    audioText: 'I need water.',
  },
  {
    id: 'person-to-be-state',
    title: 'Persona + To Be + estado',
    miniRule: 'Usa am, is o are para decir como esta una persona.',
    visualPieces: ['She', 'is', 'tired'],
    example: 'She is tired.',
    spanish: 'Ella esta cansada.',
    pronunciation: 'shi is tai-erd',
    audioText: 'She is tired.',
  },
  {
    id: 'person-to-be-place',
    title: 'Persona + To Be + lugar',
    miniRule: 'Usa To Be con at, in o here para decir donde esta alguien.',
    visualPieces: ['I', 'am', 'at', 'work'],
    example: 'I am at work.',
    spanish: 'Estoy en el trabajo.',
    pronunciation: 'ai am at uerk',
    audioText: 'I am at work.',
  },
  {
    id: 'person-go-to-destination',
    title: 'Persona + go to + destino',
    miniRule: 'Aprende go to como un bloque unido para hablar de un destino.',
    visualPieces: ['We', 'go to', 'school'],
    example: 'We go to school.',
    spanish: 'Vamos a la escuela.',
    pronunciation: 'wi gou tu skul',
    audioText: 'We go to school.',
  },
  {
    id: 'idea-connector-idea',
    title: 'Idea + conector + idea',
    miniRule: 'Usa conectores para unir dos ideas que ya puedes decir.',
    visualPieces: ['I need help', 'because', 'I am tired'],
    example: 'I need help because I am tired.',
    spanish: 'Necesito ayuda porque estoy cansado.',
    pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
    audioText: 'I need help because I am tired.',
  },
];

export const GROWING_SENTENCES: GrowingSentence[] = [
  {
    id: 'at-work-ready',
    steps: [
      { text: 'I', spanish: 'Yo', pronunciation: 'ai', audioText: 'I' },
      { text: 'I am', spanish: 'Yo estoy', pronunciation: 'ai am', audioText: 'I am' },
      { text: 'I am at work.', spanish: 'Estoy en el trabajo.', pronunciation: 'ai am at uerk', audioText: 'I am at work.' },
      {
        text: 'I am at work and I am ready.',
        spanish: 'Estoy en el trabajo y estoy listo.',
        pronunciation: 'ai am at uerk and ai am re-di',
        audioText: 'I am at work and I am ready.',
      },
    ],
  },
  {
    id: 'need-help-because-tired',
    steps: [
      { text: 'I need help', spanish: 'Necesito ayuda', pronunciation: 'ai nid jelp', audioText: 'I need help' },
      {
        text: 'I need help because',
        spanish: 'Necesito ayuda porque',
        pronunciation: 'ai nid jelp bi-kos',
        audioText: 'I need help because',
      },
      {
        text: 'I need help because I am tired.',
        spanish: 'Necesito ayuda porque estoy cansado.',
        pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
        audioText: 'I need help because I am tired.',
      },
    ],
  },
  {
    id: 'have-water-also-food',
    steps: [
      { text: 'I have water.', spanish: 'Tengo agua.', pronunciation: 'ai jav uo-ter', audioText: 'I have water.' },
      {
        text: 'I also have food.',
        spanish: 'Tambien tengo comida.',
        pronunciation: 'ai ol-sou jav fud',
        audioText: 'I also have food.',
      },
    ],
  },
  {
    id: 'want-water-but-coffee',
    steps: [
      { text: 'I want water.', spanish: 'Quiero agua.', pronunciation: 'ai uant uo-ter', audioText: 'I want water.' },
      {
        text: 'I want water, but I have coffee.',
        spanish: 'Quiero agua, pero tengo cafe.',
        pronunciation: 'ai uant uo-ter bat ai jav ko-fi',
        audioText: 'I want water, but I have coffee.',
      },
    ],
  },
];

export const COMMON_SENTENCE_ERRORS: CommonSentenceError[] = [
  {
    id: 'water-need-order',
    wrong: 'I water need.',
    hintQuestion: 'Quien va primero y donde va la accion?',
    correct: 'I need water.',
    explanation: 'Primero va la persona, despues el verbo y luego la cosa.',
    pronunciation: 'ai nid uo-ter',
    audioText: 'I need water.',
  },
  {
    id: 'missing-at-work',
    wrong: 'I am work.',
    hintQuestion: 'Que palabra falta antes del lugar?',
    correct: 'I am at work.',
    explanation: 'Para decir que estas en el trabajo usamos at work.',
    pronunciation: 'ai am at uerk',
    audioText: 'I am at work.',
  },
  {
    id: 'missing-to-work',
    wrong: 'I go work.',
    hintQuestion: 'Que bloque usamos para decir ir a un lugar?',
    correct: 'I go to work.',
    explanation: 'Go to funciona como bloque para hablar de destino.',
    pronunciation: 'ai gou tu uerk',
    audioText: 'I go to work.',
  },
  {
    id: 'tired-am-order',
    wrong: 'I tired am.',
    hintQuestion: 'Donde debe ir am?',
    correct: 'I am tired.',
    explanation: 'Con I usamos am antes del estado.',
    pronunciation: 'ai am tai-erd',
    audioText: 'I am tired.',
  },
  {
    id: 'because-order',
    wrong: 'I need because help I am tired.',
    hintQuestion: 'Cual es la idea principal y cual explica la razon?',
    correct: 'I need help because I am tired.',
    explanation: 'Primero di la idea principal. Despues usa because para explicar la razon.',
    pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
    audioText: 'I need help because I am tired.',
  },
];

export const SENTENCE_BUILDING_EXERCISES: SentenceExercise[] = [
  {
    id: 'order-need-water',
    kind: 'order-blocks',
    prompt: 'Ordena los bloques para decir: Necesito agua.',
    pieces: ['water', 'I', 'need'],
    answer: ['I', 'need', 'water'],
    spanish: 'Necesito agua.',
    hint: 'Empieza con quien habla.',
    explanation: 'Persona + verbo + cosa.',
    pronunciation: 'ai nid uo-ter',
    audioText: 'I need water.',
    difficulty: 1,
  },
  {
    id: 'fill-am-ready',
    kind: 'fill-missing',
    prompt: 'Completa: I ___ ready.',
    options: ['am', 'is', 'are'],
    answer: 'am',
    spanish: 'Estoy listo.',
    hint: 'Con I usamos am.',
    explanation: 'I + am + estado.',
    pronunciation: 'ai am re-di',
    audioText: 'I am ready.',
    difficulty: 1,
  },
  {
    id: 'choose-correct-at-work',
    kind: 'choose-correct',
    prompt: 'Elige la frase correcta.',
    options: ['I am work.', 'I am at work.', 'I at work am.'],
    answer: 'I am at work.',
    spanish: 'Estoy en el trabajo.',
    hint: 'Antes de work necesitas at.',
    explanation: 'Lugar puntual: at work.',
    pronunciation: 'ai am at uerk',
    audioText: 'I am at work.',
    difficulty: 1,
  },
  {
    id: 'order-go-to-school',
    kind: 'order-words',
    prompt: 'Ordena la frase: Vamos a la escuela.',
    pieces: ['school', 'go to', 'We'],
    answer: ['We', 'go to', 'school'],
    spanish: 'Vamos a la escuela.',
    hint: 'Go to va junto.',
    explanation: 'We + go to + school.',
    pronunciation: 'wi gou tu skul',
    audioText: 'We go to school.',
    difficulty: 1,
  },
  {
    id: 'match-need-because',
    kind: 'match-halves',
    prompt: 'Une las dos partes de la frase.',
    pieces: ['I need help', 'because I am tired'],
    answer: ['I need help', 'because I am tired'],
    spanish: 'Necesito ayuda porque estoy cansado.',
    hint: 'Because introduce la razon.',
    explanation: 'Primero la necesidad, despues la razon.',
    pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
    audioText: 'I need help because I am tired.',
    difficulty: 2,
  },
  {
    id: 'choose-connector-but',
    kind: 'choose-connector',
    prompt: 'Completa: I want water, ___ I have coffee.',
    options: ['and', 'but', 'because'],
    answer: 'but',
    spanish: 'Quiero agua, pero tengo cafe.',
    hint: 'La segunda idea contrasta con la primera.',
    explanation: 'But sirve para contrastar.',
    pronunciation: 'ai uant uo-ter bat ai jav ko-fi',
    audioText: 'I want water, but I have coffee.',
    difficulty: 2,
  },
  {
    id: 'correct-i-tired-am',
    kind: 'correct-error',
    prompt: 'Corrige la frase: I tired am.',
    answer: 'I am tired.',
    spanish: 'Estoy cansado.',
    hint: 'Con I, am va antes del estado.',
    explanation: 'I + am + tired.',
    pronunciation: 'ai am tai-erd',
    audioText: 'I am tired.',
    difficulty: 2,
  },
  {
    id: 'build-at-work-need-help',
    kind: 'build-from-pieces',
    prompt: 'Construye: Estoy en el trabajo. Necesito ayuda.',
    pieces: ['I', 'am', 'at', 'work', 'I', 'need', 'help'],
    answer: ['I', 'am', 'at', 'work', 'I', 'need', 'help'],
    spanish: 'Estoy en el trabajo. Necesito ayuda.',
    hint: 'Construye dos frases cortas.',
    explanation: 'Primero ubicacion, despues necesidad.',
    pronunciation: 'ai am at uerk. ai nid jelp',
    audioText: 'I am at work. I need help.',
    difficulty: 2,
  },
  {
    id: 'rebuild-two-connected',
    kind: 'rebuild-connected',
    prompt: 'Reconstruye dos ideas conectadas.',
    pieces: ['I', 'am', 'at', 'work', 'and', 'I', 'am', 'ready'],
    answer: ['I', 'am', 'at', 'work', 'and', 'I', 'am', 'ready'],
    spanish: 'Estoy en el trabajo y estoy listo.',
    hint: 'And une dos ideas completas.',
    explanation: 'I am at work + and + I am ready.',
    pronunciation: 'ai am at uerk and ai am re-di',
    audioText: 'I am at work and I am ready.',
    difficulty: 3,
  },
  {
    id: 'choose-also-have-food',
    kind: 'choose-connector',
    prompt: 'Completa: I have water. I ___ have food.',
    options: ['also', 'but', 'because'],
    answer: 'also',
    spanish: 'Tengo agua. Tambien tengo comida.',
    hint: 'Also agrega otra informacion.',
    explanation: 'Also va antes de have en esta frase.',
    pronunciation: 'ai jav uo-ter. ai ol-sou jav fud',
    audioText: 'I have water. I also have food.',
    difficulty: 3,
  },
];

export const GUIDED_CONSTRUCTIONS: GuidedConstruction[] = [
  {
    id: 'work-help-tired',
    situationEs: 'Estoy en el trabajo. Necesito ayuda porque estoy cansado.',
    expected: 'I am at work. I need help because I am tired.',
    pieces: ['I', 'am', 'at', 'work', 'I', 'need', 'help', 'because', 'I', 'am', 'tired'],
    spanish: 'Estoy en el trabajo. Necesito ayuda porque estoy cansado.',
    pronunciation: 'ai am at uerk. ai nid jelp bi-kos ai am tai-erd',
    audioText: 'I am at work. I need help because I am tired.',
    blocks: ['I am at work.', 'I need help', 'because', 'I am tired.'],
  },
  {
    id: 'home-ready-school',
    situationEs: 'Estoy en casa. Estoy listo. Voy a la escuela.',
    expected: 'I am at home. I am ready. I go to school.',
    pieces: ['I', 'am', 'at', 'home', 'I', 'am', 'ready', 'I', 'go to', 'school'],
    spanish: 'Estoy en casa. Estoy listo. Voy a la escuela.',
    pronunciation: 'ai am at joum. ai am re-di. ai gou tu skul',
    audioText: 'I am at home. I am ready. I go to school.',
    blocks: ['I am at home.', 'I am ready.', 'I go to school.'],
  },
  {
    id: 'want-water-have-coffee',
    situationEs: 'Quiero agua, pero tengo cafe.',
    expected: 'I want water, but I have coffee.',
    pieces: ['I', 'want', 'water', 'but', 'I', 'have', 'coffee'],
    spanish: 'Quiero agua, pero tengo cafe.',
    pronunciation: 'ai uant uo-ter bat ai jav ko-fi',
    audioText: 'I want water, but I have coffee.',
    blocks: ['I want water', 'but', 'I have coffee.'],
  },
  {
    id: 'we-have-food-ready',
    situationEs: 'Tenemos comida y estamos listos.',
    expected: 'We have food and we are ready.',
    pieces: ['We', 'have', 'food', 'and', 'we', 'are', 'ready'],
    spanish: 'Tenemos comida y estamos listos.',
    pronunciation: 'wi jav fud and wi ar re-di',
    audioText: 'We have food and we are ready.',
    blocks: ['We have food', 'and', 'we are ready.'],
  },
];

export const CONTROLLED_DIALOGUES: ControlledDialogue[] = [
  {
    id: 'work-help',
    setting: 'work',
    title: 'En el trabajo',
    lines: [
      {
        speaker: 'A',
        english: 'I am at work. I need help.',
        spanish: 'Estoy en el trabajo. Necesito ayuda.',
        pronunciation: 'ai am at uerk. ai nid jelp',
      },
      {
        speaker: 'B',
        english: 'We are here and we are ready.',
        spanish: 'Estamos aqui y estamos listos.',
        pronunciation: 'wi ar jir and wi ar re-di',
      },
    ],
    slowAudioText: 'I am at work. I need help. We are here and we are ready.',
    normalAudioText: 'I am at work. I need help. We are here and we are ready.',
  },
  {
    id: 'store-phone-keys',
    setting: 'store',
    title: 'En la tienda',
    lines: [
      {
        speaker: 'A',
        english: 'I have keys and I have phone.',
        spanish: 'Tengo las llaves y tengo el telefono.',
        pronunciation: 'ai jav kis and ai jav foun',
      },
      {
        speaker: 'B',
        english: 'I want water, but I have coffee.',
        spanish: 'Quiero agua, pero tengo cafe.',
        pronunciation: 'ai uant uo-ter bat ai jav ko-fi',
      },
    ],
    slowAudioText: 'I have keys and I have phone. I want water, but I have coffee.',
    normalAudioText: 'I have keys and I have phone. I want water, but I have coffee.',
  },
  {
    id: 'restaurant-food-ready',
    setting: 'restaurant',
    title: 'En el restaurante',
    lines: [
      {
        speaker: 'A',
        english: 'We are at work. We have food.',
        spanish: 'Estamos en el trabajo. Tenemos comida.',
        pronunciation: 'wi ar at uerk. wi jav fud',
      },
      {
        speaker: 'B',
        english: 'They want water because they are tired.',
        spanish: 'Ellos quieren agua porque estan cansados.',
        pronunciation: 'dei uant uo-ter bi-kos dei ar tai-erd',
      },
    ],
    slowAudioText: 'We are at work. We have food. They want water because they are tired.',
    normalAudioText: 'We are at work. We have food. They want water because they are tired.',
  },
];

export const PRE_CHALLENGE = {
  message: 'Revisa estas piezas antes de comenzar. Nada nuevo aparecera en el reto.',
  words: SENTENCE_BUILDING_VOCABULARY,
  structures: SENTENCE_BUILDING_PATTERNS.map((pattern) => ({
    id: pattern.id,
    title: pattern.title,
    example: pattern.example,
    pronunciation: pattern.pronunciation,
    audioText: pattern.audioText,
  })),
  connectors: SENTENCE_BUILDING_CONNECTORS,
  examples: [
    {
      id: 'pre-help-tired',
      english: 'I need help because I am tired.',
      spanish: 'Necesito ayuda porque estoy cansado.',
      pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
      audioText: 'I need help because I am tired.',
    },
    {
      id: 'pre-work-ready',
      english: 'I am at work and I am ready.',
      spanish: 'Estoy en el trabajo y estoy listo.',
      pronunciation: 'ai am at uerk and ai am re-di',
      audioText: 'I am at work and I am ready.',
    },
  ] satisfies PreChallengeItem[],
};

export const SPEAKING_PRACTICE_SITUATIONS: SpeakingPracticeSituation[] = [
  {
    id: 'speak-work-help',
    level: 1,
    instructionEs: 'Estoy en el trabajo. Necesito ayuda.',
    expected: 'I am at work. I need help.',
    pronunciation: 'ai am at uerk. ai nid jelp',
    audioText: 'I am at work. I need help.',
    expectedBlocks: ['I am at work.', 'I need help.'],
  },
  {
    id: 'speak-home-ready-school',
    level: 1,
    instructionEs: 'Estoy en casa. Estoy listo. Voy a la escuela.',
    expected: 'I am at home. I am ready. I go to school.',
    pronunciation: 'ai am at joum. ai am re-di. ai gou tu skul',
    audioText: 'I am at home. I am ready. I go to school.',
    expectedBlocks: ['I am at home.', 'I am ready.', 'I go to school.'],
  },
  {
    id: 'speak-water-coffee',
    level: 2,
    instructionEs: 'Quiero agua, pero tengo cafe.',
    expected: 'I want water, but I have coffee.',
    pronunciation: 'ai uant uo-ter bat ai jav ko-fi',
    audioText: 'I want water, but I have coffee.',
    expectedBlocks: ['I want water', 'but', 'I have coffee.'],
  },
  {
    id: 'speak-help-tired',
    level: 2,
    instructionEs: 'Necesito ayuda porque estoy cansado.',
    expected: 'I need help because I am tired.',
    pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
    audioText: 'I need help because I am tired.',
    expectedBlocks: ['I need help', 'because', 'I am tired.'],
  },
  {
    id: 'speak-we-food-ready',
    level: 3,
    instructionEs: 'Tenemos comida y estamos listos.',
    expected: 'We have food and we are ready.',
    alternatives: ['We are ready and we have food.'],
    pronunciation: 'wi jav fud and wi ar re-di',
    audioText: 'We have food and we are ready.',
    expectedBlocks: ['We have food', 'and', 'we are ready.'],
  },
  {
    id: 'speak-they-work-tired',
    level: 3,
    instructionEs: 'Ellos estan en el trabajo. Ellos quieren agua porque estan cansados.',
    expected: 'They are at work. They want water because they are tired.',
    pronunciation: 'dei ar at uerk. dei uant uo-ter bi-kos dei ar tai-erd',
    audioText: 'They are at work. They want water because they are tired.',
    expectedBlocks: ['They are at work.', 'They want water', 'because', 'they are tired.'],
  },
];

export const MISSION_SPEAKING_STORIES: MissionStory[] = [
  {
    id: 'mission-speak-work-help',
    situationEs: 'Estoy en el trabajo. Estoy cansado. Necesito ayuda porque estoy cansado, pero estoy listo.',
    expected: 'I am at work. I am tired. I need help because I am tired, but I am ready.',
    pronunciation: 'ai am at uerk. ai am tai-erd. ai nid jelp bi-kos ai am tai-erd bat ai am re-di',
    slowAudioText: 'I am at work. I am tired. I need help because I am tired, but I am ready.',
    normalAudioText: 'I am at work. I am tired. I need help because I am tired, but I am ready.',
    keywords: ['i', 'am', 'at', 'work', 'tired', 'need', 'help', 'because', 'but', 'ready'],
  },
  {
    id: 'mission-speak-home-school',
    situationEs: 'Estoy en casa. Estoy listo. Voy a la escuela y tengo las llaves.',
    expected: 'I am at home. I am ready. I go to school and I have keys.',
    pronunciation: 'ai am at joum. ai am re-di. ai gou tu skul and ai jav kis',
    slowAudioText: 'I am at home. I am ready. I go to school and I have keys.',
    normalAudioText: 'I am at home. I am ready. I go to school and I have keys.',
    keywords: ['i', 'am', 'at', 'home', 'ready', 'go', 'to', 'school', 'and', 'have', 'keys'],
  },
  {
    id: 'mission-speak-water-coffee',
    situationEs: 'Quiero agua, pero tengo cafe. Tambien tengo comida.',
    expected: 'I want water, but I have coffee. I also have food.',
    pronunciation: 'ai uant uo-ter bat ai jav ko-fi. ai ol-sou jav fud',
    slowAudioText: 'I want water, but I have coffee. I also have food.',
    normalAudioText: 'I want water, but I have coffee. I also have food.',
    keywords: ['i', 'want', 'water', 'but', 'have', 'coffee', 'also', 'food'],
  },
];

export const MISSION_LISTENING_STORIES: MissionStory[] = [
  {
    id: 'mission-listen-work-food',
    situationEs: 'Escucha una historia sobre trabajo y comida.',
    expected: 'We are at work. We have food and water. We are ready.',
    pronunciation: 'wi ar at uerk. wi jav fud and uo-ter. wi ar re-di',
    slowAudioText: 'We are at work. We have food and water. We are ready.',
    normalAudioText: 'We are at work. We have food and water. We are ready.',
    keywords: ['we', 'are', 'at', 'work', 'have', 'food', 'water', 'ready'],
    fragments: ['We are at work.', 'We have food and water.', 'We are ready.'],
  },
  {
    id: 'mission-listen-school-help',
    situationEs: 'Escucha una historia sobre escuela y ayuda.',
    expected: 'They go to school. They need help because they are tired.',
    pronunciation: 'dei gou tu skul. dei nid jelp bi-kos dei ar tai-erd',
    slowAudioText: 'They go to school. They need help because they are tired.',
    normalAudioText: 'They go to school. They need help because they are tired.',
    keywords: ['they', 'go', 'to', 'school', 'need', 'help', 'because', 'are', 'tired'],
    fragments: ['They go to school.', 'They need help because they are tired.'],
  },
  {
    id: 'mission-listen-phone-keys',
    situationEs: 'Escucha una historia sobre telefono y llaves.',
    expected: 'I am here. I have phone and keys. I go to work.',
    pronunciation: 'ai am jir. ai jav foun and kis. ai gou tu uerk',
    slowAudioText: 'I am here. I have phone and keys. I go to work.',
    normalAudioText: 'I am here. I have phone and keys. I go to work.',
    keywords: ['i', 'am', 'here', 'have', 'phone', 'and', 'keys', 'go', 'to', 'work'],
    fragments: ['I am here.', 'I have phone and keys.', 'I go to work.'],
  },
];

export const SENTENCE_BUILDING_CLOSING = {
  title: 'Lo que ya puedes hacer',
  achievements: [
    'Construir frases completas.',
    'Decir lo que necesitas o quieres.',
    'Hablar de lo que tienes.',
    'Decir donde estas o adonde vas.',
    'Unir ideas correctamente.',
    'Detectar errores basicos.',
  ],
  scoreCategories: ['Habla', 'Construccion de frases', 'Comprension', 'Resultado general'],
};

export function getNextSentenceSpeakingPractice(previousId?: string): SpeakingPracticeSituation {
  return getDifferentSentenceItem(SPEAKING_PRACTICE_SITUATIONS, previousId);
}

export function getNextMissionSpeakingStory(previousId?: string): MissionStory {
  return getDifferentSentenceItem(MISSION_SPEAKING_STORIES, previousId);
}

export function getNextMissionListeningStory(previousId?: string): MissionStory {
  return getDifferentSentenceItem(MISSION_LISTENING_STORIES, previousId);
}

function getDifferentSentenceItem<T extends { id: string }>(items: T[], previousId?: string): T {
  const pool = previousId ? items.filter((item) => item.id !== previousId) : items;
  const options = pool.length > 0 ? pool : items;
  return options[Math.floor(Math.random() * options.length)];
}
