import { API_BASE } from '../config/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SpeakingEvaluation {
  transcript: string;
  expectedPhrase: string;
  score: number;
  missingWords: string[];
  extraWords: string[];
  incorrectWords: string[];
  correction: string;
  coachNote: string;
  pronunciationFocus: { word: string; tip: string }[];
}

interface EvaluateParams {
  transcript: string;
  expectedPhrase: string;
  situation: string;
  pronunciationGuide: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Sends an audio Blob to the server for transcription via OpenAI Whisper.
 * Throws on network errors or non-200 responses so the caller can handle them.
 */
export async function transcribeAudio(blob: Blob): Promise<string> {
  const form = new FormData();
  // Use a filename with the correct extension so the server can identify the format.
  const ext = blob.type.split(';')[0].split('/')[1] || 'webm';
  form.append('audio', blob, `recording.${ext}`);

  const response = await fetch(`${API_BASE}/api/transcribe`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${response.status}`);
  }

  const data = await response.json() as { transcript: string };
  console.log('[voiceApi] Transcripción recibida:', data.transcript.slice(0, 80));
  return data.transcript;
}

/**
 * Sends transcript + expected phrase to the server for AI evaluation.
 * Returns null (graceful fallback) on any error instead of throwing.
 */
export async function evaluateSpeaking(params: EvaluateParams): Promise<SpeakingEvaluation | null> {
  try {
    const response = await fetch(`${API_BASE}/api/evaluate-speaking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as SpeakingEvaluation;
    console.log('[voiceApi] Evaluación recibida — score:', data.score);
    return data;
  } catch (err) {
    console.warn('[voiceApi] evaluateSpeaking FALLÓ — se usa fallback. Error:', String(err));
    return null;
  }
}
