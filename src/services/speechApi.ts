import { API_BASE } from '../config/api';

// ── Audio singleton — one playback at a time ───────────────────────────────
// A module-level Audio instance is reused so that calling generateSpeech()
// again automatically cancels any in-progress fetch/playback first.

let _audio: HTMLAudioElement | null = null;
let _blobUrl: string | null = null;
let _abortCtrl: AbortController | null = null;

function cleanup() {
  // Stop in-flight fetch
  _abortCtrl?.abort();
  _abortCtrl = null;

  // Stop playback and release the object URL
  if (_audio) {
    _audio.pause();
    _audio.src = '';
    _audio = null;
  }
  if (_blobUrl) {
    URL.revokeObjectURL(_blobUrl);
    _blobUrl = null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export type SpeechSpeed = 'normal' | 'slow';

/**
 * Fetches TTS audio from the server and plays it.
 * Any previous playback (including its fetch) is stopped before starting.
 * Resolves when playback ends; rejects on network / server errors.
 */
export async function generateSpeech(text: string, speed: SpeechSpeed = 'normal'): Promise<void> {
  // Cancel whatever was playing / loading
  cleanup();

  _abortCtrl = new AbortController();
  const { signal } = _abortCtrl;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed }),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return; // cancelled — not an error
    throw new Error('No se pudo conectar con el servidor de voz.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Error del servidor: ${response.status}`);
  }

  const audioBlob = await response.blob();
  const url = URL.createObjectURL(audioBlob);
  _blobUrl = url;

  const audio = new Audio(url);
  _audio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('Error al reproducir el audio.'));
    };
    audio.play().catch((err: unknown) => {
      cleanup();
      // Autoplay blocked — treat as non-fatal abort
      if (err instanceof Error && err.name === 'NotAllowedError') {
        resolve();
      } else {
        reject(new Error('No se pudo reproducir el audio.'));
      }
    });
  });
}

/**
 * Immediately stops any in-progress speech fetch or playback.
 * Safe to call even when nothing is playing.
 */
export function stopSpeech(): void {
  cleanup();
}
