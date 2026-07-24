export type EssentialVerbId = 'need' | 'have' | 'want' | 'go-to';
export type ConnectorId = 'and' | 'but' | 'because' | 'also';

export interface Unit3VocabularyItem {
  id: string;
  english: string;
  spanish: string;
  pronunciation: string;
  previouslyLearned?: boolean;
}

export interface Unit3Example {
  english: string;
  spanish: string;
  pronunciation: string;
}

export interface Unit3RepetitionPhrase extends Unit3Example {
  id: string;
  motivation: string;
}

export const UNIT_3_PRONOUN_REVIEW = [
  { english: 'I', spanish: 'yo', pronunciation: 'ai' },
  { english: 'You', spanish: 'tú / usted', pronunciation: 'iu' },
  { english: 'He', spanish: 'él', pronunciation: 'ji' },
  { english: 'She', spanish: 'ella', pronunciation: 'shi' },
  { english: 'We', spanish: 'nosotros', pronunciation: 'wi' },
  { english: 'They', spanish: 'ellos / ellas', pronunciation: 'dei' },
  { english: 'It', spanish: 'eso / ello', pronunciation: 'it' },
] as const;

export interface EssentialVerbCard {
  id: EssentialVerbId;
  label: string;
  spanish: string;
  pronunciation: string;
  miniRule: string;
  realUse: {
    situation: string;
    english: string;
    spanish: string;
    pronunciation: string;
  };
  importantNote?: {
    title: string;
    text: string;
    examples: string[];
    focus: string;
  };
  examples: Unit3Example[];
  exercise: {
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
  };
}

export interface ConnectorCard {
  id: ConnectorId;
  label: string;
  spanish: string;
  pronunciation: string;
  function: string;
  miniRule: string;
  before: string[];
  combined: string;
  combinedSpanish: string;
  exercise: {
    prompt: string;
    options: string[];
    answer: string;
    explanation: string;
  };
}

export const UNIT_3_ACTIVATION: Unit3Example[] = [
  { english: 'I am ready.', spanish: 'Estoy listo / lista.', pronunciation: 'ai am re-di' },
  { english: 'She is here.', spanish: 'Ella esta aqui.', pronunciation: 'shi is jir' },
  { english: 'We are tired.', spanish: 'Estamos cansados.', pronunciation: 'wi ar tai-erd' },
];

export const UNIT_3_VOCABULARY: Unit3VocabularyItem[] = [
  { id: 'water', english: 'water', spanish: 'agua', pronunciation: 'uo-ter' },
  { id: 'food', english: 'food', spanish: 'comida', pronunciation: 'fud' },
  { id: 'help', english: 'help', spanish: 'ayuda', pronunciation: 'jelp' },
  { id: 'keys', english: 'keys', spanish: 'llaves', pronunciation: 'kis' },
  { id: 'phone', english: 'phone', spanish: 'telefono', pronunciation: 'foun' },
  { id: 'car', english: 'car', spanish: 'carro', pronunciation: 'kar' },
  { id: 'home', english: 'home', spanish: 'casa', pronunciation: 'joum', previouslyLearned: true },
  { id: 'work', english: 'work', spanish: 'trabajo', pronunciation: 'uerk', previouslyLearned: true },
  { id: 'school', english: 'school', spanish: 'escuela', pronunciation: 'skul', previouslyLearned: true },
  { id: 'ready', english: 'ready', spanish: 'listo / lista', pronunciation: 're-di', previouslyLearned: true },
  { id: 'tired', english: 'tired', spanish: 'cansado / cansada', pronunciation: 'tai-erd', previouslyLearned: true },
  { id: 'here', english: 'here', spanish: 'aqui', pronunciation: 'jir', previouslyLearned: true },
];

export const ESSENTIAL_VERBS: EssentialVerbCard[] = [
  {
    id: 'need',
    label: 'need',
    spanish: 'necesitar',
    pronunciation: 'nid',
    miniRule: 'Usa pronombre + need + cosa para decir lo que necesitas.',
    realUse: {
      situation: 'Estás en el trabajo y necesitas ayuda.',
      english: 'I am at work. I need help.',
      spanish: 'Estoy en el trabajo. Necesito ayuda.',
      pronunciation: 'ai am at uerk. ai nid jelp',
    },
    examples: [
      { english: 'I need water.', spanish: 'Necesito agua.', pronunciation: 'ai nid uo-ter' },
      { english: 'We need help.', spanish: 'Necesitamos ayuda.', pronunciation: 'wi nid jelp' },
    ],
    exercise: {
      prompt: 'Completa: I ___ water.',
      options: ['need', 'have', 'want'],
      answer: 'need',
      explanation: 'Need expresa una necesidad.',
    },
  },
  {
    id: 'have',
    label: 'have',
    spanish: 'tener',
    pronunciation: 'jav',
    miniRule: 'Usa I, you, we o they + have + cosa para decir lo que tienes.',
    realUse: {
      situation: 'Estás listo para salir. Tienes agua y comida.',
      english: 'I am ready. I have water and food.',
      spanish: 'Estoy listo. Tengo agua y comida.',
      pronunciation: 'ai am re-di. ai jav uo-ter and fud',
    },
    importantNote: {
      title: 'Cambio importante',
      text: 'Con he, she e it usamos has en lugar de have.',
      examples: ['I have = yo tengo', 'He has = él tiene'],
      focus: 'Por ahora practicaremos have con I, you, we y they. Más adelante aprenderemos has.',
    },
    examples: [
      { english: 'I have the keys.', spanish: 'Tengo las llaves.', pronunciation: 'ai jav de kis' },
      { english: 'They have food.', spanish: 'Ellos tienen comida.', pronunciation: 'dei jav fud' },
    ],
    exercise: {
      prompt: 'Completa: We ___ the keys.',
      options: ['want', 'have', 'go to'],
      answer: 'have',
      explanation: 'Have expresa posesion. Todavia no usamos he/she has.',
    },
  },
  {
    id: 'want',
    label: 'want',
    spanish: 'querer',
    pronunciation: 'uant',
    miniRule: 'Usa pronombre + want + cosa para decir lo que deseas.',
    realUse: {
      situation: 'Estás en el trabajo y quieres agua.',
      english: 'I am at work. I want water.',
      spanish: 'Estoy en el trabajo. Quiero agua.',
      pronunciation: 'ai am at uerk. ai uant uo-ter',
    },
    examples: [
      { english: 'I want water.', spanish: 'Quiero agua.', pronunciation: 'ai uant uo-ter' },
      { english: 'They want help.', spanish: 'Ellos quieren ayuda.', pronunciation: 'dei uant jelp' },
    ],
    exercise: {
      prompt: 'Completa: I ___ food.',
      options: ['want', 'am', 'have'],
      answer: 'want',
      explanation: 'Want expresa un deseo. Por ahora no usamos want to.',
    },
  },
  {
    id: 'go-to',
    label: 'go to',
    spanish: 'ir a',
    pronunciation: 'gou ru',
    miniRule: 'Aprende go to como un bloque para hablar de un destino.',
    realUse: {
      situation: 'Estás listo y vas al trabajo.',
      english: 'I am ready. I go to work.',
      spanish: 'Estoy listo. Voy al trabajo.',
      pronunciation: 'ai am re-di. ai gou ru uerk',
    },
    examples: [
      { english: 'I go to work.', spanish: 'Voy al trabajo.', pronunciation: 'ai gou ru uerk' },
      { english: 'We go to school.', spanish: 'Vamos a la escuela.', pronunciation: 'wi gou ru skul' },
    ],
    exercise: {
      prompt: 'Completa: We ___ school.',
      options: ['go to', 'are', 'need'],
      answer: 'go to',
      explanation: 'Go to conecta la accion de ir con un destino.',
    },
  },
];

export const UNIT_3_CONNECTORS: ConnectorCard[] = [
  {
    id: 'and',
    label: 'AND',
    spanish: 'y',
    pronunciation: 'and',
    function: 'Une palabras o ideas.',
    miniRule: 'AND significa "y". Sirve para agregar informacion.',
    before: ['I need water.', 'I need food.'],
    combined: 'I need water and food.',
    combinedSpanish: 'Necesito agua y comida.',
    exercise: {
      prompt: 'I need water ___ food.',
      options: ['and', 'but', 'because'],
      answer: 'and',
      explanation: 'And agrega otra cosa a la misma idea.',
    },
  },
  {
    id: 'but',
    label: 'BUT',
    spanish: 'pero',
    pronunciation: 'bat',
    function: 'Muestra contraste.',
    miniRule: 'BUT significa "pero". La segunda idea contrasta con la primera.',
    before: ['I want water.', 'I have food.'],
    combined: 'I want water, but I have food.',
    combinedSpanish: 'Quiero agua, pero tengo comida.',
    exercise: {
      prompt: 'I am tired, ___ I am ready.',
      options: ['also', 'but', 'and'],
      answer: 'but',
      explanation: 'But conecta dos ideas que contrastan.',
    },
  },
  {
    id: 'because',
    label: 'BECAUSE',
    spanish: 'porque',
    pronunciation: 'bi-kos',
    function: 'Explica una razon.',
    miniRule: 'BECAUSE significa "porque". Sirve para explicar el motivo.',
    before: ['I need help.', 'I am tired.'],
    combined: 'I need help because I am tired.',
    combinedSpanish: 'Necesito ayuda porque estoy cansado.',
    exercise: {
      prompt: 'I need help ___ I am tired.',
      options: ['because', 'also', 'but'],
      answer: 'because',
      explanation: 'Because presenta la razon.',
    },
  },
  {
    id: 'also',
    label: 'ALSO',
    spanish: 'tambien',
    pronunciation: 'ol-sou',
    function: 'Agrega otra informacion.',
    miniRule: 'ALSO significa "tambien". Va antes de have, need o want.',
    before: ['I have water.', 'I have food.'],
    combined: 'I also have food.',
    combinedSpanish: 'Tambien tengo comida.',
    exercise: {
      prompt: 'I have water. I ___ have food.',
      options: ['but', 'also', 'because'],
      answer: 'also',
      explanation: 'Also agrega informacion nueva.',
    },
  },
];

export const UNIT_3_CONNECTOR_REVIEW = [
  {
    id: 'review-and',
    instruction: 'Elige el conector correcto.',
    prompt: 'I need water ___ food.',
    options: ['and', 'but', 'because', 'also'],
    answer: 'and',
    explanation: 'And une dos cosas: agua y comida.',
    resultAudio: 'I need water and food.',
  },
  {
    id: 'review-but',
    instruction: 'Une dos ideas que contrastan.',
    prompt: 'I am tired, ___ I am ready.',
    options: ['because', 'also', 'and', 'but'],
    answer: 'but',
    explanation: 'But muestra el contraste entre cansado y listo.',
    resultAudio: 'I am tired, but I am ready.',
  },
  {
    id: 'review-because',
    instruction: 'Elige la frase construida correctamente.',
    prompt: 'Necesito ayuda porque estoy cansado.',
    options: [
      'I because need help I am tired.',
      'I need help because I am tired.',
      'Because I need tired help.',
    ],
    answer: 'I need help because I am tired.',
    explanation: 'Primero va la idea y después because con la razón.',
    resultAudio: 'I need help because I am tired.',
  },
  {
    id: 'review-listen-also',
    instruction: 'Escucha y reconoce el conector.',
    prompt: '¿Qué conector escuchaste?',
    audioPhrase: 'I also have food.',
    options: ['but', 'because', 'also', 'and'],
    answer: 'also',
    explanation: 'Also agrega otra información.',
    resultAudio: 'I also have food.',
  },
] as const;

export interface Unit3MatchingItem {
  id: string;
  piece: string;
  destination: string;
  audioPhrase?: string;
}

export const UNIT_3_VERB_MATCHING: Unit3MatchingItem[] = [
  { id: 'need', piece: 'I need help.', destination: 'Necesitas ayuda.', audioPhrase: 'I need help.' },
  { id: 'have', piece: 'I have the keys.', destination: 'Tienes las llaves.', audioPhrase: 'I have the keys.' },
  { id: 'want', piece: 'I want water.', destination: 'Quieres agua.', audioPhrase: 'I want water.' },
  { id: 'go-to', piece: 'I go to work.', destination: 'Vas al trabajo.', audioPhrase: 'I go to work.' },
];

export const UNIT_3_CONNECTOR_MATCHING: Unit3MatchingItem[] = [
  { id: 'and', piece: 'AND', destination: 'Agregar información.' },
  { id: 'but', piece: 'BUT', destination: 'Mostrar contraste.' },
  { id: 'because', piece: 'BECAUSE', destination: 'Explicar una razón.' },
  { id: 'also', piece: 'ALSO', destination: 'Añadir otra idea.' },
];

export const UNIT_3_GUIDED_BUILD = {
  labels: ['Pronombre', 'Verbo', 'Complemento', 'Conector', 'Idea'],
  pieces: ['I', 'need', 'help', 'because', 'I am tired'],
  result: 'I need help because I am tired.',
  spanish: 'Necesito ayuda porque estoy cansado.',
  pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
};

export const UNIT_3_REPETITION_PHRASES: Unit3RepetitionPhrase[] = [
  {
    id: 'need-help',
    english: 'I need help.',
    spanish: 'Necesito ayuda.',
    pronunciation: 'ai nid jelp',
    motivation: 'Muy bien. Estás empezando a unir ideas.',
  },
  {
    id: 'water-and-food',
    english: 'I need water and food.',
    spanish: 'Necesito agua y comida.',
    pronunciation: 'ai nid uo-ter and fud',
    motivation: 'Buen trabajo. Tu inglés ya suena más completo.',
  },
  {
    id: 'help-because-tired',
    english: 'I need help because I am tired.',
    spanish: 'Necesito ayuda porque estoy cansado.',
    pronunciation: 'ai nid jelp bi-kos ai am tai-erd',
    motivation: 'Excelente. Ya no estás diciendo palabras sueltas.',
  },
];

export const UNIT_3_BASE_DIALOGUE = {
  title: 'Necesito ayuda en el trabajo',
  context: 'Dos compañeros hablan en el trabajo.',
  lines: [
    { speaker: 'A', english: 'I am at work. I need help.', spanish: 'Estoy en el trabajo. Necesito ayuda.', pronunciation: 'ai am at uerk. ai nid jelp' },
    { speaker: 'B', english: 'I am here, and I am ready.', spanish: 'Estoy aqui y estoy listo.', pronunciation: 'ai am jir, and ai am re-di' },
    { speaker: 'A', english: 'I am tired, but I am ready.', spanish: 'Estoy cansado, pero estoy listo.', pronunciation: 'ai am tai-erd, bat ai am re-di' },
  ],
};

export const UNIT_3_MISSION_PREPARATION = {
  verbs: ['need', 'have', 'want', 'go to'],
  connectors: ['and', 'but', 'because', 'also'],
  vocabularyIds: UNIT_3_VOCABULARY.map((item) => item.id),
  usefulBlocks: [
    'I need help.',
    'I have the keys.',
    'I want water.',
    'I go to work.',
    'I need water and food.',
    'I need help because I am tired.',
  ],
};

export interface Unit3SpeakingPractice {
  id: string;
  situation: string;
  expected: string;
  pronunciation: string;
}

export const UNIT_3_SPEAKING_PRACTICES: Unit3SpeakingPractice[] = [
  {
    id: 'work-help',
    situation: 'Estás en el trabajo. Necesitas ayuda porque estás cansado.',
    expected: 'I am at work. I need help because I am tired.',
    pronunciation: 'ai am at uerk. ai nid jelp bi-kos ai am tai-erd',
  },
  {
    id: 'ready-keys',
    situation: 'Estás listo. Tienes las llaves y el teléfono.',
    expected: 'I am ready. I have the keys and the phone.',
    pronunciation: 'ai am re-di. ai jav de kis and de foun',
  },
  {
    id: 'want-water',
    situation: 'Estás en el trabajo. Quieres agua y comida.',
    expected: 'I am at work. I want water and food.',
    pronunciation: 'ai am at uerk. ai uant uo-ter and fud',
  },
  {
    id: 'go-work',
    situation: 'Estás aquí, pero vas al trabajo.',
    expected: 'I am here, but I go to work.',
    pronunciation: 'ai am jir, bat ai gou ru uerk',
  },
];

export interface Unit3MissionStory {
  id: string;
  situation: string;
  expected: string;
  pronunciation: string;
}

export const UNIT_3_SPEAKING_STORIES: Unit3MissionStory[] = [
  {
    id: 'mission-work',
    situation: 'Estás en el trabajo. Necesitas ayuda porque estás cansado, pero estás listo.',
    expected: 'I am at work. I need help because I am tired, but I am ready.',
    pronunciation: 'ai am at uerk. ai nid jelp bi-kos ai am tai-erd, bat ai am re-di',
  },
  {
    id: 'mission-ready',
    situation: 'Estás aquí. Tienes las llaves y el teléfono. También tienes comida.',
    expected: 'I am here. I have the keys and the phone. I also have food.',
    pronunciation: 'ai am jir. ai jav de kis and de foun. ai ol-sou jav fud',
  },
  {
    id: 'mission-school',
    situation: 'Estás listo. Quieres agua y comida, pero vas a la escuela.',
    expected: 'I am ready. I want water and food, but I go to school.',
    pronunciation: 'ai am re-di. ai uant uo-ter and fud, bat ai gou ru skul',
  },
];

export const UNIT_3_LISTENING_STORIES: Unit3MissionStory[] = [
  {
    id: 'listen-home',
    situation: 'Escucha una historia sobre una persona en casa.',
    expected: 'I am at home. I have water and food. I am tired, but I am ready.',
    pronunciation: 'ai am at joum. ai jav uo-ter and fud. ai am tai-erd, bat ai am re-di',
  },
  {
    id: 'listen-work',
    situation: 'Escucha una historia sobre una persona en el trabajo.',
    expected: 'I am at work. I need help because I am tired. I also want water.',
    pronunciation: 'ai am at uerk. ai nid jelp bi-kos ai am tai-erd. ai ol-sou uant uo-ter',
  },
  {
    id: 'listen-school',
    situation: 'Escucha una historia sobre una persona que va a la escuela.',
    expected: 'I am here. I have the phone and the keys. I go to school.',
    pronunciation: 'ai am jir. ai jav de foun and de kis. ai gou ru skul',
  },
];

export function getDifferentItem<T extends { id: string }>(items: T[], previousId?: string): T {
  const available = previousId ? items.filter((item) => item.id !== previousId) : items;
  const pool = available.length > 0 ? available : items;
  return pool[Math.floor(Math.random() * pool.length)];
}
