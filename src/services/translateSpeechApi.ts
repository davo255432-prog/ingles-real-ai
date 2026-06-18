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

// ── Entender inglés (modo "Quiero entender inglés") ──────────────────────────

export interface UnderstandResult {
  /** true = el audio no era inglés (no se traduce; mostrar aviso del modo). */
  isSpanishInput: boolean;
  /** Inglés transcrito (vacío si isSpanishInput). */
  english: string;
  /** Traducción al español del inglés (vacío si isSpanishInput). */
  spanish: string;
}

/**
 * Envía audio (en inglés) al servidor. Transcribe con detección de idioma:
 * si es inglés, devuelve { english, spanish }; si detecta español, devuelve
 * { isSpanishInput: true }. Lanza en errores de red / servidor.
 */
export async function understandEnglish(blob: Blob): Promise<UnderstandResult> {
  const form = new FormData();
  const ext = blob.type.split(';')[0].split('/')[1] || 'webm';
  form.append('audio', blob, `recording.${ext}`);

  const response = await fetch(`${API_BASE}/api/understand-english`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Error del servidor: ${response.status}`);
  }

  return response.json() as Promise<UnderstandResult>;
}

export interface UnderstandTextResult {
  /** Frase en inglés escrita por el usuario. */
  english: string;
  /** Traducción al español. */
  spanish: string;
}

/**
 * Traduce al español una frase en inglés ESCRITA por el usuario (modo entender).
 * Reutiliza la misma traducción inglés→español del servidor. Lanza en errores.
 */
export async function understandText(text: string): Promise<UnderstandTextResult> {
  const response = await fetch(`${API_BASE}/api/understand-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Error del servidor: ${response.status}`);
  }

  return response.json() as Promise<UnderstandTextResult>;
}
