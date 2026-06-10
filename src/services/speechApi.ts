import { API_BASE } from '../config/api';

// ── Audio singleton — one playback at a time ───────────────────────────────

let _audio: HTMLAudioElement | null = null;
let _blobUrl: string | null = null;
let _abortCtrl: AbortController | null = null;

// ── Pre-warm cache — stores pre-fetched blob URLs keyed by "speed:text" ────
const _cache = new Map<string, string>();

function cleanup() {
  _abortCtrl?.abort();
  _abortCtrl = null;

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
 * Pre-fetches TTS audio in the background and stores it in a cache.
 * Call this as soon as you know which phrase will be played so that
 * generateSpeech() can skip the network round-trip and play instantly.
 * Safe to call multiple times — ignores phrases that are already cached.
 */
export async function prefetchSpeech(text: string, speed: SpeechSpeed = 'normal'): Promise<void> {
  const key = `${speed}:${text}`;
  if (_cache.has(key)) return;

  try {
    const response = await fetch(`${API_BASE}/api/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed }),
    });
    if (!response.ok) return; // silently fail — prefetch is best-effort
    const blob = await response.blob();
    _cache.set(key, URL.createObjectURL(blob));
    console.log('[speech] Pre-warmed:', text.slice(0, 40));
  } catch {
    // Network error during prefetch — ignore, generateSpeech will retry
  }
}

/**
 * Fetches TTS audio from the server (or uses the pre-warm cache) and plays it.
 * Any previous playback is stopped before starting.
 * Resolves when playback ends; rejects on network / server errors.
 */
export async function generateSpeech(text: string, speed: SpeechSpeed = 'normal'): Promise<void> {
  cleanup();

  const key = `${speed}:${text}`;
  const cachedUrl = _cache.get(key);

  let url: string;

  if (cachedUrl) {
    // Cache hit — play immediately without a network round-trip
    _cache.delete(key);
    url = cachedUrl;
    console.log('[speech] Cache hit — playing instantly');
  } else {
    // Cache miss — fetch normally
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
      if (err instanceof Error && err.name === 'AbortError') return;
      throw new Error('No se pudo conectar con el servidor de voz.');
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Error del servidor: ${response.status}`);
    }

    const audioBlob = await response.blob();
    url = URL.createObjectURL(audioBlob);
  }

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
      if (err instanceof Error && err.name === 'NotAllowedError') {
        resolve(); // Autoplay blocked — non-fatal
      } else {
        reject(new Error('No se pudo reproducir el audio.'));
      }
    });
  });
}

/**
 * Immediately stops any in-progress speech fetch or playback.
 */
export function stopSpeech(): void {
  cleanup();
}
