// Unidad 2 - Practica final oral con vocabulario cerrado.
// No usa IA generativa: solo plantillas locales con pronombres + verbo to be.

export interface ToBeFinalPracticeItem {
  id: string;
  situationEs: string;
  suggestedEn: string;
}

export interface ToBeFinalVocabularyItem {
  id: string;
  en: string;
  es: string;
}

export const TO_BE_FINAL_VOCAB_STEP_SLUG = 'final-vocab';
export const TO_BE_FINAL_PRACTICE_STEP_SLUG = 'final-practice';

export function toBeStepId(lessonId: string, slug: string): string {
  return `${lessonId}.s-${slug}`;
}

const VOCAB = {
  david: { id: 'david', en: 'David', es: 'David' },
  maria: { id: 'maria', en: 'Maria', es: 'Maria' },
  carlos: { id: 'carlos', en: 'Carlos', es: 'Carlos' },
  ana: { id: 'ana', en: 'Ana', es: 'Ana' },
  driver: { id: 'driver', en: 'driver', es: 'conductor' },
  friends: { id: 'friends', en: 'friends', es: 'amigos' },
  happy: { id: 'happy', en: 'happy', es: 'feliz / felices' },
  tired: { id: 'tired', en: 'tired', es: 'cansado / cansados' },
  ready: { id: 'ready', en: 'ready', es: 'listo / lista' },
  here: { id: 'here', en: 'here', es: 'aqui' },
  home: { id: 'home', en: 'home', es: 'casa' },
  work: { id: 'work', en: 'work', es: 'trabajo' },
  school: { id: 'school', en: 'school', es: 'escuela' },
  california: { id: 'california', en: 'California', es: 'California' },
} satisfies Record<string, ToBeFinalVocabularyItem>;

export const TO_BE_FINAL_VOCABULARY: ToBeFinalVocabularyItem[] = [
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
    suggestedEn: `Hello. My name is ${VOCAB.david.en}. I am a ${VOCAB.driver.en}. I am in ${VOCAB.california.en}.`,
  },
  {
    id: 'she-maria-home-happy',
    situationEs: `Ella es ${VOCAB.maria.es}. Ella esta en ${VOCAB.home.es}. Ella esta feliz.`,
    suggestedEn: `She is ${VOCAB.maria.en}. She is at ${VOCAB.home.en}. She is ${VOCAB.happy.en}.`,
  },
  {
    id: 'we-friends-work',
    situationEs: `Nosotros somos ${VOCAB.friends.es}. Estamos en el ${VOCAB.work.es}.`,
    suggestedEn: `We are ${VOCAB.friends.en}. We are at ${VOCAB.work.en}.`,
  },
  {
    id: 'they-tired-home',
    situationEs: `Ellos estan cansados. Ellos estan en ${VOCAB.home.es}.`,
    suggestedEn: `They are ${VOCAB.tired.en}. They are at ${VOCAB.home.en}.`,
  },
  {
    id: 'he-carlos-school-ready',
    situationEs: `El es ${VOCAB.carlos.es}. El esta en la ${VOCAB.school.es}. El esta listo.`,
    suggestedEn: `He is ${VOCAB.carlos.en}. He is at ${VOCAB.school.en}. He is ${VOCAB.ready.en}.`,
  },
  {
    id: 'i-ana-work-ready',
    situationEs: `Hola. Mi nombre es ${VOCAB.ana.es}. Estoy en el ${VOCAB.work.es}. Estoy lista.`,
    suggestedEn: `Hello. My name is ${VOCAB.ana.en}. I am at ${VOCAB.work.en}. I am ${VOCAB.ready.en}.`,
  },
  {
    id: 'you-here-ready',
    situationEs: `Tu estas ${VOCAB.here.es}. Tu estas listo.`,
    suggestedEn: `You are ${VOCAB.here.en}. You are ${VOCAB.ready.en}.`,
  },
  {
    id: 'we-school-happy',
    situationEs: `Nosotros estamos en la ${VOCAB.school.es}. Nosotros estamos felices.`,
    suggestedEn: `We are at ${VOCAB.school.en}. We are ${VOCAB.happy.en}.`,
  },
];

export function getNextToBeFinalPractice(previousId?: string): ToBeFinalPracticeItem {
  const pool = previousId
    ? TO_BE_FINAL_PRACTICES.filter((item) => item.id !== previousId)
    : TO_BE_FINAL_PRACTICES;
  const options = pool.length > 0 ? pool : TO_BE_FINAL_PRACTICES;
  return options[Math.floor(Math.random() * options.length)];
}
