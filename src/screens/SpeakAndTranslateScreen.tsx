import React, { useState, useRef, useEffect } from 'react';
import { translateSpeech } from '../services/translateSpeechApi';
import type { TranslateResult } from '../services/translateSpeechApi';
import { generateSpeech, stopSpeech } from '../services/speechApi';

// ── Types ──────────────────────────────────────────────────────────────────

type RecordState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'processing'
  | 'done'
  | 'error';

type TtsState = 'idle' | 'loading' | 'playing' | 'error';

type RecordError =
  | 'mic-not-supported'
  | 'mic-denied'
  | 'mic-not-found'
  | 'recording-empty'
  | 'no-speech'
  | 'server-error';

const ERROR_MESSAGES: Record<RecordError, string> = {
  'mic-not-supported': 'Tu navegador no soporta grabación. Prueba con Chrome o Edge.',
  'mic-denied': 'El micrófono está bloqueado. Permite el acceso en la barra del navegador.',
  'mic-not-found': 'No se encontró micrófono. Verifica que esté conectado.',
  'recording-empty': 'No se grabó audio. Habla más fuerte y cerca del micrófono.',
  'no-speech': 'No entendí lo que dijiste. Intenta de nuevo hablando más claro.',
  'server-error': 'No se pudo procesar el audio. Verifica tu conexión.',
};

// ── Component ──────────────────────────────────────────────────────────────

interface SpeakAndTranslateScreenProps {
  onBack: () => void;
}

export const SpeakAndTranslateScreen: React.FC<SpeakAndTranslateScreenProps> = ({ onBack }) => {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [recordError, setRecordError]  = useState<RecordError | null>(null);
  const [result, setResult]            = useState<TranslateResult | null>(null);
  const [ttsState, setTtsState]        = useState<TtsState>('idle');
  const [ttsError, setTtsError]        = useState<string | null>(null);

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const streamRef         = useRef<MediaStream | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const dataIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef        = useRef(true);
  const ttsCallIdRef      = useRef(0);

  // ── Cleanup ──────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Recording ────────────────────────────────────────────────────────────

  const handleStartRecording = async () => {
    stopSpeech();
    setTtsState('idle');
    setTtsError(null);
    setRecordError(null);
    setResult(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError('mic-not-supported');
      setRecordState('error');
      return;
    }

    setRecordState('requesting');

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

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // iOS Safari ignores the timeslice in mr.start(N) and never fires
      // ondataavailable during recording. Fix: start without timeslice and
      // poll requestData() every 500 ms so chunks accumulate on all platforms.
      mr.start();
      dataIntervalRef.current = setInterval(() => {
        if (mr.state === 'recording') mr.requestData();
      }, 500);

      setRecordState('recording');
    } catch (err) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') setRecordError('mic-denied');
      else if (name === 'NotFoundError') setRecordError('mic-not-found');
      else setRecordError('server-error');
      setRecordState('error');
    }
  };

  const handleStopRecording = async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;

    // Stop the polling interval before stopping the recorder
    if (dataIntervalRef.current) {
      clearInterval(dataIntervalRef.current);
      dataIntervalRef.current = null;
    }

    setRecordState('processing');

    await new Promise<void>((resolve) => {
      mr.addEventListener('stop', () => resolve(), { once: true });
      mr.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());

    const chunks = audioChunksRef.current;
    if (chunks.length === 0) {
      setRecordError('recording-empty');
      setRecordState('error');
      return;
    }

    const mimeType = mr.mimeType || 'audio/webm';
    const blob = new Blob(chunks, { type: mimeType });

    try {
      const data = await translateSpeech(blob);
      if (!mountedRef.current) return;

      if (data.unclear || !data.english.trim()) {
        setRecordError('no-speech');
        setRecordState('error');
        return;
      }

      setResult(data);
      setRecordState('done');
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('voz') || msg.includes('detectó')) {
        setRecordError('no-speech');
      } else {
        setRecordError('server-error');
      }
      setRecordState('error');
    }
  };

  const handleRecordClick = () => {
    if (recordState === 'recording') void handleStopRecording();
    else if (recordState === 'idle' || recordState === 'error' || recordState === 'done') void handleStartRecording();
  };

  // ── TTS ──────────────────────────────────────────────────────────────────

  const handleListen = async (speed: 'normal' | 'slow') => {
    if (!result) return;
    if (ttsState === 'loading' || ttsState === 'playing') {
      stopSpeech();
      setTtsState('idle');
      return;
    }

    const callId = ++ttsCallIdRef.current;
    setTtsError(null);
    setTtsState('loading');

    try {
      const playPromise = generateSpeech(result.english, speed);
      if (mountedRef.current && ttsCallIdRef.current === callId) setTtsState('playing');
      await playPromise;
      if (mountedRef.current && ttsCallIdRef.current === callId) setTtsState('idle');
    } catch (err) {
      if (mountedRef.current && ttsCallIdRef.current === callId) {
        setTtsError(err instanceof Error ? err.message : 'Error al reproducir.');
        setTtsState('error');
      }
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const isProcessing = recordState === 'requesting' || recordState === 'processing';
  const isTtsActive  = ttsState === 'loading' || ttsState === 'playing';

  // ── Record button ─────────────────────────────────────────────────────────

  const recordBtnClass = [
    'w-full flex flex-col items-center justify-center gap-2 py-8 rounded-3xl font-semibold text-lg transition-all duration-200',
    isProcessing
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : recordState === 'recording'
        ? 'bg-red-500 text-white shadow-xl shadow-red-200 animate-pulse'
        : 'bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-200 active:scale-95',
  ].join(' ');

  const recordLabel =
    recordState === 'requesting'  ? 'Solicitando permiso...' :
    recordState === 'recording'   ? 'Escuchando... toca para terminar' :
    recordState === 'processing'  ? 'Procesando...' :
    'Toca y habla en español';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-8">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Habla en español</h1>
            <p className="text-xs text-gray-400">Yo lo traduzco al inglés</p>
          </div>
        </div>

        {/* Instruction */}
        {recordState !== 'done' && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎙️</span>
              <div>
                <p className="text-purple-800 font-semibold text-sm mb-1">¿Cómo funciona?</p>
                <p className="text-purple-700 text-sm leading-relaxed">
                  Presiona el botón, habla en español lo que necesitas decir, y yo te doy la traducción en inglés lista para usar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Record button */}
        <button
          type="button"
          onClick={handleRecordClick}
          disabled={isProcessing}
          className={recordBtnClass}
          aria-label={recordState === 'recording' ? 'Detener grabación' : 'Iniciar grabación en español'}
        >
          {/* Mic icon / stop icon / spinner */}
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            {isProcessing ? (
              <span className="flex gap-1 items-end">
                <span className="w-1.5 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-6 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : recordState === 'recording' ? (
              <span className="w-6 h-6 bg-white rounded-sm" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span>{recordLabel}</span>
        </button>

        {/* Error */}
        {recordState === 'error' && recordError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-red-700 text-sm leading-snug">{ERROR_MESSAGES[recordError]}</p>
              <button
                onClick={handleRecordClick}
                className="mt-2 text-red-600 text-sm font-semibold underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {recordState === 'done' && result && (
          <div className="mt-6 flex flex-col gap-4">

            {/* What you said */}
            <div className="bg-gray-100 rounded-2xl px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lo que dijiste</p>
              <p className="text-gray-700 text-base leading-relaxed italic">"{result.spanish}"</p>
            </div>

            {/* English translation */}
            <div className="bg-purple-500 rounded-t-2xl px-5 pt-5 pb-4">
              <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-2">En inglés</p>
              <p className="text-white font-bold text-2xl leading-snug">"{result.english}"</p>
            </div>

            {/* Listen buttons */}
            <div className="bg-purple-50 border border-purple-100 rounded-b-2xl px-5 py-4 flex flex-col gap-3">

              {ttsError && (
                <p className="text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{ttsError}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => void handleListen('normal')}
                  aria-label={isTtsActive ? 'Detener audio' : 'Escuchar traducción en velocidad normal'}
                  className={[
                    'flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
                    isTtsActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 active:scale-95',
                  ].join(' ')}
                >
                  {isTtsActive ? (
                    <span className="flex gap-0.5 items-center">
                      <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                  {ttsState === 'loading' ? 'Cargando...' : ttsState === 'playing' ? 'Reproduciendo...' : 'Escuchar'}
                </button>

                <button
                  onClick={() => void handleListen('slow')}
                  disabled={isTtsActive}
                  aria-label="Escuchar traducción en velocidad lenta"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Escuchar lento
                </button>
              </div>
            </div>

            {/* Record again */}
            <button
              onClick={handleRecordClick}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-purple-200 text-purple-600 font-semibold text-sm hover:bg-purple-50 active:scale-95 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.92" />
              </svg>
              Decir otra cosa
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
