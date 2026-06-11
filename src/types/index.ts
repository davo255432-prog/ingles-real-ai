export type Screen =
  | 'home'
  // Flow 1: ¿Cómo digo esto?
  | 'how-do-i-say'
  | 'practice'
  | 'voice-practice'
  | 'correction'
  // Flow 4: Habla en español, yo traduzco
  | 'speak-translate'
  // Flow 2: Necesito decir esto ahora
  | 'urgent-say'
  | 'urgent-phrase-ready'
  | 'urgent-show-big'
  | 'urgent-practice'
  | 'urgent-correction'
  // Flow 3: Practicar situaciones
  | 'situations'
  | 'situations-from-scratch'
  | 'sepra-situation'
  | 'sepra-listen'
  | 'sepra-voice'
  | 'sepra-correction'
  | 'sepra-rule'
  | 'sepra-action'
  | 'sepra-progress'
  // Flow 3b: Trabajo y clientes → Cocina / restaurante
  | 'work-clients'
  | 'kitchen-intro'
  | 'kitchen-listen'
  | 'kitchen-practice'
  | 'kitchen-correction'
  | 'kitchen-rule'
  | 'kitchen-action'
  | 'kitchen-progress';

export type InputMode = 'write' | 'voice';

export interface KeywordEntry {
  word: string;
  meaning: string;
  pronunciation: string;
  usage: string;
  exampleEnglish: string;
  exampleSpanish: string;
}

export interface PracticeData {
  situation: string;
  basicForm: string;
  basicPronunciation?: string;
  naturalForm: string;
  pronunciation: string;
  grammarRule: string;
  grammarExamples: string[];
  // Pedagogical enrichment — optional for backward compatibility with mock data
  basicPhraseBreakdown?: { part: string; meaning: string }[];
  phraseBreakdown?: { part: string; meaning: string }[];
  whyThisPhrase?: string;
  whenToUse?: string;
  basicVsNatural?: string;
  basicKeywords?: KeywordEntry[];
  keywords?: KeywordEntry[];
}

export interface CorrectionData {
  whatYouSaid: string;
  correctForm: string;
  correction: string;
  pronunciation: string;
  coachNote: string;
  // Real voice evaluation — optional (absent when using mock fallback)
  score?: number;
  missingWords?: string[];
  extraWords?: string[];
  incorrectWords?: string[];
  pronunciationFocus?: { word: string; tip: string }[];
  usedFallback?: boolean;
}

export interface UrgentPhraseData {
  situation: string;
  phraseInEnglish: string;
  pronunciation: string;
  miniHelp: string;
}

export interface UrgentCorrectionData {
  whatYouSaid: string;
  correctForm: string;
  correction: string;
  pronunciation: string;
  coachNote: string;
}
