import type { PracticeData, CorrectionData, UrgentPhraseData, UrgentCorrectionData } from '../types';

export const mockPracticeData: PracticeData = {
  situation: 'Se acabaron las cebollas y hay que pedirlas urgente al manager.',
  basicForm: 'Chef, we\'re out of onions. We need more onions.',
  naturalForm: 'Chef, we\'re out of onions. Can you ask the manager to order more ASAP?',
  pronunciation: 'chef, wir aut ov Ó-ni-ons. can yu ask de MÁ-ne-yer tu ÓR-der mor ei-es-ei-pí.',
  grammarRule: 'Para decir que algo se acabó usamos: "We\'re out of + producto"',
  grammarExamples: [
    'We\'re out of rice.',
    'We\'re out of chicken.',
    'We\'re out of sauce.',
  ],
};

export const mockCorrectionData: CorrectionData = {
  whatYouSaid: 'Chef we out of onions',
  correctForm: 'Chef, we\'re out of onions. Can you ask the manager to order more ASAP?',
  correction: 'Te faltó "we\'re" (we are). Para decir que algo se acabó, usa "we\'re out of + producto".',
  pronunciation: 'chef, wir aut ov Ó-ni-ons. can yu ask de MÁ-ne-yer tu ÓR-der mor ei-es-ei-pí.',
  coachNote: 'Practica más "we\'re out of". Así dices que algo se acabó.',
};

export const mockUrgentData: UrgentPhraseData = {
  situation: 'Mi carro no prende.',
  phraseInEnglish: "My car won't start.",
  pronunciation: 'mai car wont start',
  miniHelp: 'Úsala cuando necesitas explicar rápido que tu carro no arranca.',
};

export const mockUrgentCorrectionData: UrgentCorrectionData = {
  whatYouSaid: 'My car no start',
  correctForm: "My car won't start.",
  correction: 'Para decir "no prende" en este contexto, usamos "won\'t start".',
  pronunciation: 'mai car wont start',
  coachNote: 'Practica "won\'t start". Es una frase muy útil para carro, máquina o equipo que no enciende.',
};
