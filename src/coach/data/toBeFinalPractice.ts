// Unidad 2 - Practica final oral con vocabulario cerrado.
// No usa IA generativa: solo plantillas locales con pronombres + verbo to be.

export interface ToBeFinalPracticeItem {
  id: string;
  situationEs: string;
  suggestedEn: string;
}

export const TO_BE_FINAL_PRACTICES: ToBeFinalPracticeItem[] = [
  {
    id: 'intro-david-california',
    situationEs: 'Hola. Mi nombre es David. Soy conductor. Estoy en California.',
    suggestedEn: 'Hello. My name is David. I am a driver. I am in California.',
  },
  {
    id: 'she-maria-home-happy',
    situationEs: 'Ella es Maria. Ella esta en casa. Ella esta feliz.',
    suggestedEn: 'She is Maria. She is at home. She is happy.',
  },
  {
    id: 'we-friends-work',
    situationEs: 'Nosotros somos amigos. Estamos en el trabajo.',
    suggestedEn: 'We are friends. We are at work.',
  },
  {
    id: 'they-tired-home',
    situationEs: 'Ellos estan cansados. Ellos estan en casa.',
    suggestedEn: 'They are tired. They are at home.',
  },
  {
    id: 'he-carlos-school-ready',
    situationEs: 'El es Carlos. El esta en la escuela. El esta listo.',
    suggestedEn: 'He is Carlos. He is at school. He is ready.',
  },
  {
    id: 'i-ana-work-ready',
    situationEs: 'Hola. Mi nombre es Ana. Estoy en el trabajo. Estoy lista.',
    suggestedEn: 'Hello. My name is Ana. I am at work. I am ready.',
  },
  {
    id: 'you-here-ready',
    situationEs: 'Tu estas aqui. Tu estas listo.',
    suggestedEn: 'You are here. You are ready.',
  },
  {
    id: 'we-school-happy',
    situationEs: 'Nosotros estamos en la escuela. Nosotros estamos felices.',
    suggestedEn: 'We are at school. We are happy.',
  },
];

export function getNextToBeFinalPractice(previousId?: string): ToBeFinalPracticeItem {
  const pool = previousId
    ? TO_BE_FINAL_PRACTICES.filter((item) => item.id !== previousId)
    : TO_BE_FINAL_PRACTICES;
  const options = pool.length > 0 ? pool : TO_BE_FINAL_PRACTICES;
  return options[Math.floor(Math.random() * options.length)];
}
