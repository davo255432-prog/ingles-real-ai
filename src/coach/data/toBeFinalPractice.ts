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
  listenKeywords: string[];
}

export interface ToBeFinalVocabularyItem {
  id: string;
  en: string;
  es: string;
  pronunciation: string;
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
  driver: { id: 'driver', en: 'driver', es: 'conductor', pronunciation: 'drai-ver' },
  friends: { id: 'friends', en: 'friends', es: 'amigos', pronunciation: 'frends' },
  happy: { id: 'happy', en: 'happy', es: 'feliz / felices', pronunciation: 'ja-pi' },
  tired: { id: 'tired', en: 'tired', es: 'cansado / cansados', pronunciation: 'tai-erd' },
  ready: { id: 'ready', en: 'ready', es: 'listo / lista', pronunciation: 're-di' },
  here: { id: 'here', en: 'here', es: 'aqui', pronunciation: 'jir' },
  home: { id: 'home', en: 'home', es: 'casa', pronunciation: 'joum' },
  work: { id: 'work', en: 'work', es: 'trabajo', pronunciation: 'werk' },
  school: { id: 'school', en: 'school', es: 'escuela', pronunciation: 'skul' },
  california: { id: 'california', en: 'California', es: 'California', pronunciation: 'ca-li-for-nia' },
} satisfies Record<string, ToBeFinalVocabularyItem>;

export const TO_BE_FINAL_VOCABULARY: ToBeFinalVocabularyItem[] = [
  VOCAB.hello,
  VOCAB.myNameIs,
  VOCAB.david,
  VOCAB.maria,
  VOCAB.carlos,
  VOCAB.ana,
  VOCAB.driver,
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

export const TO_BE_FINAL_PRACTICES: ToBeFinalPracticeItem[] = [
  {
    id: 'intro-david-california',
    situationEs: `Hola. Mi nombre es ${VOCAB.david.es}. Soy ${VOCAB.driver.es}. Estoy en ${VOCAB.california.es}.`,
    suggestedEn: `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.david.en}. I am a ${VOCAB.driver.en}. I am in ${VOCAB.california.en}.`,
    suggestedPronunciation: `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.david.pronunciation}. ai am a ${VOCAB.driver.pronunciation}. ai am in ${VOCAB.california.pronunciation}.`,
  },
  {
    id: 'she-maria-home-happy',
    situationEs: `Ella es ${VOCAB.maria.es}. Ella esta en ${VOCAB.home.es}. Ella esta feliz.`,
    suggestedEn: `She is ${VOCAB.maria.en}. She is at ${VOCAB.home.en}. She is ${VOCAB.happy.en}.`,
    suggestedPronunciation: `shi is ${VOCAB.maria.pronunciation}. shi is at ${VOCAB.home.pronunciation}. shi is ${VOCAB.happy.pronunciation}.`,
  },
  {
    id: 'we-friends-work',
    situationEs: `Nosotros somos ${VOCAB.friends.es}. Estamos en el ${VOCAB.work.es}.`,
    suggestedEn: `We are ${VOCAB.friends.en}. We are at ${VOCAB.work.en}.`,
    suggestedPronunciation: `wi ar ${VOCAB.friends.pronunciation}. wi ar at ${VOCAB.work.pronunciation}.`,
  },
  {
    id: 'they-tired-home',
    situationEs: `Ellos estan cansados. Ellos estan en ${VOCAB.home.es}.`,
    suggestedEn: `They are ${VOCAB.tired.en}. They are at ${VOCAB.home.en}.`,
    suggestedPronunciation: `dei ar ${VOCAB.tired.pronunciation}. dei ar at ${VOCAB.home.pronunciation}.`,
  },
  {
    id: 'he-carlos-school-ready',
    situationEs: `El es ${VOCAB.carlos.es}. El esta en la ${VOCAB.school.es}. El esta listo.`,
    suggestedEn: `He is ${VOCAB.carlos.en}. He is at ${VOCAB.school.en}. He is ${VOCAB.ready.en}.`,
    suggestedPronunciation: `ji is ${VOCAB.carlos.pronunciation}. ji is at ${VOCAB.school.pronunciation}. ji is ${VOCAB.ready.pronunciation}.`,
  },
  {
    id: 'i-ana-work-ready',
    situationEs: `Hola. Mi nombre es ${VOCAB.ana.es}. Estoy en el ${VOCAB.work.es}. Estoy lista.`,
    suggestedEn: `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.ana.en}. I am at ${VOCAB.work.en}. I am ${VOCAB.ready.en}.`,
    suggestedPronunciation: `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.ana.pronunciation}. ai am at ${VOCAB.work.pronunciation}. ai am ${VOCAB.ready.pronunciation}.`,
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
  id: 'mission-friends-ready',
  title: 'Mision Final',
  situationEs: [
    `Hola. Mi nombre es ${VOCAB.david.es}.`,
    `Estoy en ${VOCAB.california.es}.`,
    `${VOCAB.ana.es} esta en ${VOCAB.home.es}.`,
    `${VOCAB.carlos.es} esta en la ${VOCAB.school.es}.`,
    `Nosotros somos ${VOCAB.friends.es}.`,
    `Ellos estan ${VOCAB.ready.es}.`,
  ].join(' '),
  expectedEn: [
    `${VOCAB.hello.en}. ${VOCAB.myNameIs.en} ${VOCAB.david.en}.`,
    `I am in ${VOCAB.california.en}.`,
    `${VOCAB.ana.en} is at ${VOCAB.home.en}.`,
    `${VOCAB.carlos.en} is at ${VOCAB.school.en}.`,
    `We are ${VOCAB.friends.en}.`,
    `They are ${VOCAB.ready.en}.`,
  ].join(' '),
  pronunciation: [
    `${VOCAB.hello.pronunciation}. ${VOCAB.myNameIs.pronunciation} ${VOCAB.david.pronunciation}.`,
    `ai am in ${VOCAB.california.pronunciation}.`,
    `${VOCAB.ana.pronunciation} is at ${VOCAB.home.pronunciation}.`,
    `${VOCAB.carlos.pronunciation} is at ${VOCAB.school.pronunciation}.`,
    `wi ar ${VOCAB.friends.pronunciation}.`,
    `dei ar ${VOCAB.ready.pronunciation}.`,
  ].join(' '),
  listenPrompt: 'Escucha la historia y escribe en ingles lo que entendiste.',
  listenKeywords: [
    'hello',
    'my',
    'name',
    'is',
    'david',
    'i',
    'am',
    'in',
    'california',
    'ana',
    'at',
    'home',
    'carlos',
    'school',
    'we',
    'are',
    'friends',
    'they',
    'ready',
  ],
};

export function getNextToBeFinalPractice(previousId?: string): ToBeFinalPracticeItem {
  const pool = previousId
    ? TO_BE_FINAL_PRACTICES.filter((item) => item.id !== previousId)
    : TO_BE_FINAL_PRACTICES;
  const options = pool.length > 0 ? pool : TO_BE_FINAL_PRACTICES;
  return options[Math.floor(Math.random() * options.length)];
}
