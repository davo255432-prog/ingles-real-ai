// Unidad 2 - Practica final oral con vocabulario cerrado.
// No usa IA generativa: solo plantillas locales con pronombres + verbo to be.

export interface ToBeFinalPracticeItem {
  id: string;
  situationEs: string;
  suggestedEn: string;
  suggestedPronunciation: string;
}

export interface ToBeFinalMissionStory {
  id: string;
  title: string;
  situationEs: string;
  expectedEn: string;
  pronunciation: string;
  listenPrompt: string;
  listenExpectedEn: string;
  listenPronunciation: string;
  listenKeywords: string[];
}

export interface ToBeFinalVocabularyItem {
  id: string;
  en: string;
  es: string;
  pronunciation: string;
}

export interface ToBeConnectorChunk {
  id: string;
  en: string;
  es: string;
  pronunciation: string;
  note: string;
}

export const TO_BE_FINAL_VOCAB_STEP_SLUG = 'final-vocab';
export const TO_BE_FINAL_PRACTICE_STEP_SLUG = 'final-practice';
export const TO_BE_FINAL_MISSION_STEP_SLUG = 'final-mission';

export function toBeStepId(lessonId: string, slug: string): string {
  return `${lessonId}.s-${slug}`;
}

const VOCAB = {
  hello: { id: 'hello', en: 'Hello', es: 'Hola', pronunciation: 'je-lou' },
  myNameIs: { id: 'my-name-is', en: 'My name is', es: 'Mi nombre es', pronunciation: 'mai neim is' },
  david: { id: 'david', en: 'David', es: 'David', pronunciation: 'dei-vid' },
  maria: { id: 'maria', en: 'Maria', es: 'Maria', pronunciation: 'ma-ri-a' },
  carlos: { id: 'carlos', en: 'Carlos', es: 'Carlos', pronunciation: 'car-los' },
  ana: { id: 'ana', en: 'Ana', es: 'Ana', pronunciation: 'a-na' },
  driver: { id: 'driver', en: 'driver', es: 'conductor / conductora', pronunciation: 'drai-ver' },
  restaurant: { id: 'restaurant', en: 'restaurant', es: 'restaurante', pronunciation: 'res-to-rant' },
  job: { id: 'job', en: 'job', es: 'trabajo / empleo', pronunciation: 'yob' },
  busy: { id: 'busy', en: 'busy', es: 'ocupado / ocupada', pronunciation: 'bi-zi' },
  good: { id: 'good', en: 'good', es: 'bueno / buena', pronunciation: 'gud' },
  friends: { id: 'friends', en: 'friends', es: 'amigos', pronunciation: 'frends' },
  happy: { id: 'happy', en: 'happy', es: 'feliz / felices', pronunciation: 'ja-pi' },
  tired: { id: 'tired', en: 'tired', es: 'cansado / cansados', pronunciation: 'tai-erd' },
  ready: { id: 'ready', en: 'ready', es: 'listo / lista / listos', pronunciation: 're-di' },
  here: { id: 'here', en: 'here', es: 'aqui', pronunciation: 'jir' },
  home: { id: 'home', en: 'home', es: 'casa', pronunciation: 'joum' },
  work: { id: 'work', en: 'work', es: 'trabajo', pronunciation: 'werk' },
  school: { id: 'school', en: 'school', es: 'escuela', pronunciation: 'skul' },
  california: { id: 'california', en: 'California', es: 'California', pronunciation: 'ca-li-for-nia' },
} satisfies Record<string, ToBeFinalVocabularyItem>;

export const TO_BE_FINAL_VOCABULARY: ToBeFinalVocabularyItem[] = [
  VOCAB.hello,
  VOCAB.myNameIs,
  VOCAB.driver,
  VOCAB.restaurant,
  VOCAB.job,
  VOCAB.busy,
  VOCAB.good,
  VOCAB.friends,
  VOCAB.happy,
  VOCAB.tired,
  VOCAB.ready,
  VOCAB.here,
  VOCAB.home,
  VOCAB.work,
  VOCAB.school,
  VOCAB.california,
];

export const TO_BE_CONNECTOR_CHUNKS: ToBeConnectorChunk[] = [
  {
    id: 'a-driver',
    en: `a ${VOCAB.driver.en}`,
    es: 'un conductor / una conductora',
    pronunciation: `a ${VOCAB.driver.pronunciation}`,
    note: 'Usa a para decir un / una antes de una profesion.',
  },
  {
    id: 'at-home',
    en: `at ${VOCAB.home.en}`,
    es: 'en casa',
    pronunciation: `at ${VOCAB.home.pronunciation}`,
    note: 'Usa at con lugares puntuales.',
  },
  {
    id: 'at-work',
    en: `at ${VOCAB.work.en}`,
    es: 'en el trabajo',
    pronunciation: `at ${VOCAB.work.pronunciation}`,
    note: 'Usa at con lugares puntuales.',
  },
  {
    id: 'in-a-restaurant',
    en: `in a ${VOCAB.restaurant.en}`,
    es: 'en un restaurante',
    pronunciation: `in a ${VOCAB.restaurant.pronunciation}`,
    note: 'Usa in para decir dentro de un lugar.',
  },
  {
    id: 'my-job-is',
    en: `My ${VOCAB.job.en} is`,
    es: 'Mi trabajo es',
    pronunciation: `mai ${VOCAB.job.pronunciation} is`,
    note: 'Sirve para hablar de tu trabajo con is.',
  },
  {
    id: 'at-school',
    en: `at ${VOCAB.school.en}`,
    es: 'en la escuela',
    pronunciation: `at ${VOCAB.school.pronunciation}`,
    note: 'Usa at con lugares puntuales.',
  },
  {
    id: 'in-california',
    en: `in ${VOCAB.california.en}`,
    es: 'en California',
    pronunciation: `in ${VOCAB.california.pronunciation}`,
    note: 'Usa in con lugares grandes.',
  },
];

export const TO_BE_USEFUL_CHUNKS: ToBeConnectorChunk[] = [
  {
    id: 'i-am-a-driver',
    en: `I am a ${VOCAB.driver.en}.`,
    es: 'Soy conductor / conductora.',
    pronunciation: `ai am a ${VOCAB.driver.pronunciation}`,
    note: 'I + am + a driver.',
  },
  {
    id: 'i-at-work',
    en: `I am at ${VOCAB.work.en}.`,
    es: 'Estoy en el trabajo.',
    pronunciation: `ai am at ${VOCAB.work.pronunciation}`,
    note: 'I + am + at work.',
  },
  {
    id: 'i-in-a-restaurant',
    en: `I am in a ${VOCAB.restaurant.en}.`,
    es: 'Estoy en un restaurante.',
    pronunciation: `ai am in a ${VOCAB.restaurant.pronunciation}`,
    note: 'I + am + in a restaurant.',
  },
  {
    id: 'my-job-is-good',
    en: `My ${VOCAB.job.en} is ${VOCAB.good.en}.`,
    es: 'Mi trabajo es bueno.',
    pronunciation: `mai ${VOCAB.job.pronunciation} is ${VOCAB.good.pronunciation}`,
    note: 'My job + is + good.',
  },
  {
    id: 'i-am-busy',
    en: `I am ${VOCAB.busy.en}.`,
    es: 'Estoy ocupado / ocupada.',
    pronunciation: `ai am ${VOCAB.busy.pronunciation}`,
    note: 'I + am + busy.',
  },
  {
    id: 'she-at-home',
    en: `She is at ${VOCAB.home.en}.`,
    es: 'Ella esta en casa.',
    pronunciation: `shi is at ${VOCAB.home.pronunciation}`,
    note: 'She + is + at home.',
  },
  {
    id: 'he-at-school',
    en: `He is at ${VOCAB.school.en}.`,
    es: 'El esta en la escuela.',
    pronunciation: `ji is at ${VOCAB.school.pronunciation}`,
    note: 'He + is + at school.',
  },
  {
    id: 'i-in-california',
    en: `I am in ${VOCAB.california.en}.`,
    es: 'Estoy en California.',
    pronunciation: `ai am in ${VOCAB.california.pronunciation}`,
    note: 'I + am + in California.',
  },
];

export const TO_BE_FINAL_PRACTICES: ToBeFinalPracticeItem[] = [
  {
    id: 'intro-david-california',
    situationEs: `Hola. Mi nombre es ${VOCAB.david.es}. Soy conductor. Estoy en el trabajo. Mi trabajo es bueno.`,
    suggestedEn: `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.david.en}. I am a ${VOCAB.driver.en}. I am at ${VOCAB.work.en}. My ${VOCAB.job.en} is ${VOCAB.good.en}.`,
    suggestedPronunciation: `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.david.pronunciation}. ai am a ${VOCAB.driver.pronunciation}. ai am at ${VOCAB.work.pronunciation}. mai ${VOCAB.job.pronunciation} is ${VOCAB.good.pronunciation}.`,
  },
  {
    id: 'maria-restaurant-busy',
    situationEs: `${VOCAB.maria.es} esta en un restaurante. Ella esta ocupada. Ella esta lista.`,
    suggestedEn: `${VOCAB.maria.en} is in a ${VOCAB.restaurant.en}. She is ${VOCAB.busy.en}. She is ${VOCAB.ready.en}.`,
    suggestedPronunciation: `${VOCAB.maria.pronunciation} is in a ${VOCAB.restaurant.pronunciation}. shi is ${VOCAB.busy.pronunciation}. shi is ${VOCAB.ready.pronunciation}.`,
  },
  {
    id: 'we-friends-work',
    situationEs: `Nosotros somos ${VOCAB.friends.es}. Estamos en el ${VOCAB.work.es}. Estamos ocupados.`,
    suggestedEn: `We are ${VOCAB.friends.en}. We are at ${VOCAB.work.en}. We are ${VOCAB.busy.en}.`,
    suggestedPronunciation: `wi ar ${VOCAB.friends.pronunciation}. wi ar at ${VOCAB.work.pronunciation}. wi ar ${VOCAB.busy.pronunciation}.`,
  },
  {
    id: 'they-restaurant-happy',
    situationEs: `Ellos estan en un restaurante. Ellos estan ocupados. Ellos estan felices.`,
    suggestedEn: `They are in a ${VOCAB.restaurant.en}. They are ${VOCAB.busy.en}. They are ${VOCAB.happy.en}.`,
    suggestedPronunciation: `dei ar in a ${VOCAB.restaurant.pronunciation}. dei ar ${VOCAB.busy.pronunciation}. dei ar ${VOCAB.happy.pronunciation}.`,
  },
  {
    id: 'he-carlos-school-ready',
    situationEs: `El es ${VOCAB.carlos.es}. El esta en la ${VOCAB.school.es}. El esta listo.`,
    suggestedEn: `He is ${VOCAB.carlos.en}. He is at ${VOCAB.school.en}. He is ${VOCAB.ready.en}.`,
    suggestedPronunciation: `ji is ${VOCAB.carlos.pronunciation}. ji is at ${VOCAB.school.pronunciation}. ji is ${VOCAB.ready.pronunciation}.`,
  },
  {
    id: 'i-ana-work-ready',
    situationEs: `Hola. Mi nombre es ${VOCAB.ana.es}. Estoy en el ${VOCAB.work.es}. Estoy ocupada. Estoy lista.`,
    suggestedEn: `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.ana.en}. I am at ${VOCAB.work.en}. I am ${VOCAB.busy.en}. I am ${VOCAB.ready.en}.`,
    suggestedPronunciation: `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.ana.pronunciation}. ai am at ${VOCAB.work.pronunciation}. ai am ${VOCAB.busy.pronunciation}. ai am ${VOCAB.ready.pronunciation}.`,
  },
  {
    id: 'you-here-ready',
    situationEs: `Tu estas ${VOCAB.here.es}. Tu estas listo.`,
    suggestedEn: `You are ${VOCAB.here.en}. You are ${VOCAB.ready.en}.`,
    suggestedPronunciation: `iu ar ${VOCAB.here.pronunciation}. iu ar ${VOCAB.ready.pronunciation}.`,
  },
  {
    id: 'we-school-happy',
    situationEs: `Nosotros estamos en la ${VOCAB.school.es}. Nosotros estamos felices.`,
    suggestedEn: `We are at ${VOCAB.school.en}. We are ${VOCAB.happy.en}.`,
    suggestedPronunciation: `wi ar at ${VOCAB.school.pronunciation}. wi ar ${VOCAB.happy.pronunciation}.`,
  },
];

export const TO_BE_FINAL_MISSION: ToBeFinalMissionStory = {
  id: 'mission-real-work',
  title: 'Mision Final',
  situationEs: [
    `Hola. Mi nombre es ${VOCAB.david.es}.`,
    `Soy conductor.`,
    `Estoy en el trabajo.`,
    `Mi trabajo es bueno.`,
    `${VOCAB.ana.es} esta en un restaurante.`,
    `Ella esta ocupada.`,
    `Nosotros somos ${VOCAB.friends.es}.`,
    `Estamos listos.`,
  ].join(' '),
  expectedEn: [
    `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.david.en}.`,
    `I am a ${VOCAB.driver.en}.`,
    `I am at ${VOCAB.work.en}.`,
    `My ${VOCAB.job.en} is ${VOCAB.good.en}.`,
    `${VOCAB.ana.en} is in a ${VOCAB.restaurant.en}.`,
    `She is ${VOCAB.busy.en}.`,
    `We are ${VOCAB.friends.en}.`,
    `We are ${VOCAB.ready.en}.`,
  ].join(' '),
  pronunciation: [
    `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.david.pronunciation}.`,
    `ai am a ${VOCAB.driver.pronunciation}.`,
    `ai am at ${VOCAB.work.pronunciation}.`,
    `mai ${VOCAB.job.pronunciation} is ${VOCAB.good.pronunciation}.`,
    `${VOCAB.ana.pronunciation} is in a ${VOCAB.restaurant.pronunciation}.`,
    `shi is ${VOCAB.busy.pronunciation}.`,
    `wi ar ${VOCAB.friends.pronunciation}.`,
    `wi ar ${VOCAB.ready.pronunciation}.`,
  ].join(' '),
  listenPrompt: 'Escucha una historia diferente y escribe en ingles lo que entendiste.',
  listenExpectedEn: [
    `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.maria.en}.`,
    `I am in a ${VOCAB.restaurant.en}.`,
    `My ${VOCAB.job.en} is ${VOCAB.good.en}.`,
    `${VOCAB.carlos.en} is at ${VOCAB.work.en}.`,
    `He is ${VOCAB.busy.en}.`,
    `We are ${VOCAB.friends.en}.`,
    `They are ${VOCAB.happy.en}.`,
  ].join(' '),
  listenPronunciation: [
    `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.maria.pronunciation}.`,
    `ai am in a ${VOCAB.restaurant.pronunciation}.`,
    `mai ${VOCAB.job.pronunciation} is ${VOCAB.good.pronunciation}.`,
    `${VOCAB.carlos.pronunciation} is at ${VOCAB.work.pronunciation}.`,
    `ji is ${VOCAB.busy.pronunciation}.`,
    `wi ar ${VOCAB.friends.pronunciation}.`,
    `dei ar ${VOCAB.happy.pronunciation}.`,
  ].join(' '),
  listenKeywords: [
    'hello',
    'my',
    'name',
    'is',
    'maria',
    'i',
    'am',
    'at',
    'in',
    'restaurant',
    'job',
    'good',
    'carlos',
    'work',
    'busy',
    'we',
    'are',
    'friends',
    'they',
    'happy',
  ],
};

export function getNextToBeFinalPractice(previousId?: string): ToBeFinalPracticeItem {
  const pool = previousId
    ? TO_BE_FINAL_PRACTICES.filter((item) => item.id !== previousId)
    : TO_BE_FINAL_PRACTICES;
  const options = pool.length > 0 ? pool : TO_BE_FINAL_PRACTICES;
  return options[Math.floor(Math.random() * options.length)];
}
