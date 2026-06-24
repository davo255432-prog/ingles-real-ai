import React, { useEffect, useRef, useState } from 'react';
import type { PronounInfo } from '../data/curriculum';
import { generateSpeech, stopSpeech } from '../../services/speechApi';
import { transcribeAudio } from '../../services/voiceApi';

interface SpeakPracticeProps {
  /** Pronombres a practicar con la voz, en orden. */
  pronouns: PronounInfo[];
  /** Título corto del paso (etiqueta superior). */
  title?: string;
  /** Texto introductorio breve del Coach. */
  intro?: string;
  /** Salir de la lección (botón atrás). */
  onExit: () => void;
  /** Terminó la práctica oral con normalidad → avanzar. */
  onComplete: () => void;
  /**
   * El usuario eligió modo silencioso (o no pudo usar el micrófono).
   * Marca "práctica oral pendiente" y avanza igualmente.
   */
  onSilent: () => void;
}

// Estados del micrófono (reutiliza el patrón de VoicePracticeScreen).
type MicState = 'idle' | 'requesting' | 'recording' | 'transcribing';
// Resultado de la comparación simple (sin puntuación ni porcentajes).
type Verdict = 'none' | 'got-it' | 'almost' | 'not-heard';

// Variantes aceptadas por pronombre (homófonos frecuentes de Whisper).
// No es puntuación fonética: solo evita falsos negativos en la comparación.
const ACCEPTED: Record<string, string[]> = {
  i: ['i', 'eye', 'ay', 'aye', 'hi'],
  you: ['you', 'u', 'yu', 'ya'],
  he: ['he', 'hee', 'hey'],
  she: ['she', 'shi', 'shee'],
  we: ['we', 'wee', 'oui'],
  they: ['they', 'thay', 'dey', 'day'],
  it: ['it', 'eat', 'id'],
};

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function matches(transcript: string, target: PronounInfo): boolean {
  const tokens = normalize(transcript);
  if (tokens.length === 0) return false;
  const accepted = new Set([target.en.toLowerCase(), ...(ACCEPTED[target.id] ?? [])]);
  return tokens.some((t) => accepted.has(t));
}

export const SpeakPractice: React.FC<SpeakPracticeProps> = ({
  pronouns,
  title,
  intro,
  onExit,
  onComplete,
  onSilent,
}) => {
  const [index, setIndex] = useState(0);
  const [micState, setMicState] = useState<MicState>('idle');
  const [verdict, setVerdict] = useState<Verdict>('none');
  const [micBlocked, setMicBlocked] = useState(false);

  const current = pronouns[index];
  const total = pronouns.length;

  // Refs del grabador (sobreviven re-renders, se limpian al desmontar).
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const dataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Reproduce el pronombre al entrar en cada tarjeta.
  useEffect(() => {
    setVerdict('none');
    setMicState('idle');
    void playPronoun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (dataIntervalRef.current) {
        clearInterval(dataIntervalRef.current);
        dataIntervalRef.current = null;
      }
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      streamRef.current = null;
    };
  }, []);

  const playPronoun = async () => {
    if (!current) return;
    try {
      await generateSpeech(current.en);
    } catch {
      // El audio no es crítico para la práctica.
    }
  };

  // ── Grabar → transcribir → comparar (reutiliza transcribeAudio/Whisper) ──
  const startRecording = async () => {
    stopSpeech();
    setVerdict('none');
    audioChunksRef.current = [];
    if (dataIntervalRef.current) {
      clearInterval(dataIntervalRef.current);
      dataIntervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicBlocked(true);
      return;
    }

    setMicState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ].find((t) => MediaRecorder.isTypeSupported(t)) ?? '';

      const mr = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64000,
      });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start();
      dataIntervalRef.current = setInterval(() => {
        if (mr.state === 'recording') mr.requestData();
      }, 500);
      setMicState('recording');
    } catch {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setMicBlocked(true);
      setMicState('idle');
    }
  };

  const stopRecording = async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;

    if (dataIntervalRef.current) {
      clearInterval(dataIntervalRef.current);
      dataIntervalRef.current = null;
    }
    setMicState('transcribing');

    await new Promise<void>((resolve) => {
      mr.addEventListener('stop', () => resolve(), { once: true });
      mr.stop();
    });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;

    const chunks = audioChunksRef.current;
    if (chunks.length === 0) {
      if (mountedRef.current) {
        setVerdict('not-heard');
        setMicState('idle');
      }
      return;
    }

    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
    try {
      const transcript = await transcribeAudio(blob);
      if (!mountedRef.current) return;
      if (!transcript.trim()) {
        setVerdict('not-heard');
      } else {
        setVerdict(matches(transcript, current) ? 'got-it' : 'almost');
      }
    } catch {
      if (mountedRef.current) setVerdict('not-heard');
    } finally {
      if (mountedRef.current) setMicState('idle');
    }
  };

  const handleMicClick = () => {
    if (micState === 'recording') void stopRecording();
    else if (micState === 'idle') void startRecording();
  };

  const goNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      stopSpeech();
      onComplete();
    }
  };

  if (!current) {
    // Sin pronombres (no debería ocurrir): avanza sin bloquear.
    onComplete();
    return null;
  }

  const isLastPronoun = index === total - 1;
  const recording = micState === 'recording';
  const processing = micState === 'requesting' || micState === 'transcribing';

  const micLabel = recording
    ? 'Detener'
    : processing
      ? 'Escuchando…'
      : 'Repite con tu voz';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* Top bar */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Salir de la lección"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-gray-400 text-xs font-semibold tabular-nums">
            Práctica oral · {index + 1}/{total}
          </span>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col pb-8">
        {title && (
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">{title}</p>
        )}
        {intro && index === 0 && (
          <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-emerald-100 mb-4 flex items-start gap-2">
            <span className="text-base">🎓</span>
            <p className="text-gray-700 text-sm leading-relaxed">{intro}</p>
          </div>
        )}

        {/* Tarjeta del pronombre */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-5 text-center">
          <div className="text-5xl mb-3">{current.icon}</div>
          <p className="text-3xl font-extrabold text-gray-900 mb-1">{current.en}</p>
          <p className="text-gray-500 text-lg mb-3">{current.meaning}</p>
          <button
            onClick={() => void playPronoun()}
            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            🔊 Escuchar otra vez
          </button>
        </div>

        {/* Feedback simple (sin porcentajes) */}
        {verdict === 'got-it' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
            <p className="text-emerald-700 font-bold">Te entendí. ✅</p>
          </div>
        )}
        {verdict === 'almost' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 font-bold">Casi. Escucha otra vez y repite.</p>
          </div>
        )}
        {verdict === 'not-heard' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-red-600 font-bold">No pude escucharte. Inténtalo de nuevo.</p>
          </div>
        )}

        {/* Aviso si el micrófono no está disponible / bloqueado */}
        {micBlocked && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
            <p className="text-gray-600 text-sm leading-snug">
              No pudimos usar el micrófono. Puedes continuar en modo silencioso; la
              práctica oral quedará pendiente para más tarde.
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Botón de micrófono */}
          <button
            onClick={handleMicClick}
            disabled={processing}
            className={
              recording
                ? 'w-full bg-red-500 text-white text-base font-bold rounded-2xl py-4 animate-pulse'
                : processing
                  ? 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
                  : 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
            }
          >
            🎤 {micLabel}
          </button>

          {/* Continuar: disponible tras un "Te entendí" */}
          {verdict === 'got-it' && (
            <button
              onClick={goNext}
              className="w-full bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
            >
              {isLastPronoun ? 'Terminar' : 'Siguiente'}
            </button>
          )}

          {/* Modo silencioso: completar sin micrófono (deja pendiente) */}
          <button
            onClick={onSilent}
            className="w-full bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-2xl py-3 hover:bg-gray-50 transition-all"
          >
            Usar modo silencioso (practicar después)
          </button>
        </div>
      </div>
    </div>
  );
};
