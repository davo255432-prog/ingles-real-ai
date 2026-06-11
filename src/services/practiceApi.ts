import type { PracticeData } from '../types';
import { mockPracticeData } from '../data/mockData';
import { API_BASE } from '../config/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface ApiPracticeResponse {
  situation: string;
  basicForm: string;
  basicPronunciation?: string;
  naturalForm: string;
  pronunciation: string;
  grammarRule: string;
  vocabulary: string[];
  examples: { english: string; spanish: string }[];
  // Pedagogical enrichment (optional)
  phraseBreakdown?: { part: string; meaning: string }[];
  whyThisPhrase?: string;
  whenToUse?: string;
  basicVsNatural?: string;
  keywords?: {
    word: string;
    meaning: string;
    pronunciation: string;
    usage: string;
    exampleEnglish: string;
    exampleSpanish: string;
  }[];
}

export interface RequiredDetail {
  original: string;
  requiredEnglish: string;
}

export type CommunicativeIntent =
  | 'pedir'
  | 'informar'
  | 'preguntar'
  | 'confirmar'
  | 'advertir'
  | 'dar instrucción'
  | 'otro';

export interface AnalyzeContextResult {
  needsClarification: boolean;
  clarifyingQuestion: string | null;
  intent: string | null;
  communicativeIntent: CommunicativeIntent | null;
  intentExplanation: string | null;
  requiredDetails: RequiredDetail[];
}

export interface GeneratePracticeResult {
  data: PracticeData;
  usedFallback: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapToPracticeData(api: ApiPracticeResponse): PracticeData {
  return {
    situation: api.situation,
    basicForm: api.basicForm,
    basicPronunciation: api.basicPronunciation,
    naturalForm: api.naturalForm,
    pronunciation: api.pronunciation,
    grammarRule: api.grammarRule,
    grammarExamples: api.examples.map((e) => e.english),
    phraseBreakdown: api.phraseBreakdown,
    whyThisPhrase: api.whyThisPhrase,
    whenToUse: api.whenToUse,
    basicVsNatural: api.basicVsNatural,
    keywords: api.keywords,
  };
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Step 1 — Ask the server to analyze the input:
 *   • needsClarification: whether to ask the user for more context
 *   • clarifyingQuestion: the question to show (if needed)
 *   • intent: brief description of what the user wants to say
 *   • requiredDetails: concrete details that must appear in the English output
 *
 * Returns null if the server is unreachable (caller skips to generate).
 */
export async function analyzeContext(userInput: string): Promise<AnalyzeContextResult | null> {
  try {
    const response = await fetch(`${API_BASE}/api/analyze-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json() as AnalyzeContextResult;
    console.log('[analyzeContext] needsClarification:', result.needsClarification);
    console.log('[analyzeContext] intent:', result.intent);
    console.log('[analyzeContext] requiredDetails:', result.requiredDetails);
    console.log('[analyzeContext] clarifyingQuestion:', result.clarifyingQuestion);
    return result;
  } catch (err) {
    console.warn('[analyzeContext] FALLÓ — se omite análisis y se genera directamente. Error:', String(err));
    return null;
  }
}

/**
 * Step 2 — Generate a full practice session using OpenAI.
 *   • clarificationContext: extra context the user provided (kept separate from situation)
 *   • intent: what the user wants to communicate (from analyze step)
 *   • requiredDetails: terms that MUST appear in the English phrases (validated server-side)
 *
 * Falls back to mockPracticeData if the server is unreachable or returns an error.
 */
export async function generatePractice(
  userInput: string,
  clarificationContext?: string,
  intent?: string | null,
  requiredDetails?: RequiredDetail[],
  communicativeIntent?: CommunicativeIntent | null,
  intentExplanation?: string | null,
): Promise<GeneratePracticeResult> {
  try {
    const response = await fetch(`${API_BASE}/api/generate-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput,
        mode: 'how-do-i-say-this',
        ...(clarificationContext ? { clarificationContext } : {}),
        ...(intent ? { intent } : {}),
        ...(requiredDetails?.length ? { requiredDetails } : {}),
        ...(communicativeIntent ? { communicativeIntent } : {}),
        ...(intentExplanation ? { intentExplanation } : {}),
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json() as ApiPracticeResponse;
    return { data: mapToPracticeData(json), usedFallback: false };
  } catch {
    return { data: mockPracticeData, usedFallback: true };
  }
}
