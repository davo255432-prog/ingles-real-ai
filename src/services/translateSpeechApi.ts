import { API_BASE } from '../config/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TranslateResult {
  spanish: string;
  english: string;
  unclear: boolean;
}

// ── API call ───────────────────────────────────────────────────────────────

/**
 * Sends an audio Blob (recorded in Spanish) to the server.
 * Returns { spanish, english, unclear } on success.
 * Throws on network / server errors.
 */
export async function translateSpeech(blob: Blob): Promise<TranslateResult> {
  const form = new FormData();
  const ext = blob.type.split(';')[0].split('/')[1] || 'webm';
  form.append('audio', blob, `recording.${ext}`);

  const response = await fetch(`${API_BASE}/api/translate-speech`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Error del servidor: ${response.status}`);
  }

  return response.json() as Promise<TranslateResult>;
}
