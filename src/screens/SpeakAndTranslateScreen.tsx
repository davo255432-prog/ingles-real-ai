import React, { useState, useRef, useEffect, useMemo } from 'react';
import { translateSpeech, understandEnglish, understandText } from '../services/translateSpeechApi';
import type { TranslateResult } from '../services/translateSpeechApi';
import { generateSpeech, stopSpeech, prefetchSpeech } from '../services/speechApi';
import { toSpanishPronunciation } from '../utils/spanishPronunciation';

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
  | 'understand-needs-english'
  | 'server-error';

const ERROR_MESSAGES: Record<RecordError, string> = {
  'mic-not-supported': 'Tu navegador no soporta grabación. Prueba con Chrome o Edge.',
  'mic-denied': 'El micrófono está bloqueado. Permite el acceso en la barra del navegador.',
  'mic-not-found': 'No se encontró micrófono. Verifica que esté conectado.',
  'recording-empty': 'No se grabó audio. Habla más fuerte y cerca del micrófono.',
  'no-speech': 'No entendí lo que dijiste. Intenta de nuevo hablando más claro.',
  'understand-needs-english': 'Este modo es para escuchar inglés. Reproduce o habla una frase en inglés.',
  'server-error': 'No se pudo procesar el audio. Verifica tu conexión.',
};

// ── Component ──────────────────────────────────────────────────────────────

interface SpeakAndTranslateScreenProps {
  onBack: () => void;
}

// Dos usos de la misma herramienta (ambos reutilizan el flujo existente):
//  · 'speak'      → hablo en español y obtengo la frase en inglés.
//  · 'understand' → escucho/hablo inglés y entiendo su significado.
type Mode = 'speak' | 'understand';

export const SpeakAndTranslateScreen: React.FC<SpeakAndTranslateScreenProps> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('speak');
  const [recordState, setRecordState] = useState<RecordState>('idle');
  // Entrada de texto manual (solo en modo entender).
  const [textInput, setTextInput] = useState('');
  const [translatingText, setTranslatingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
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

      // 32 kbps: suficiente para voz; reduce el tamaño del audio y acelera la
      // subida y la transcripción (sobre todo en celular con datos).
      const mr = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 32000,
      });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      const usesMobileRecording =
        /Android/i.test(navigator.userAgent) ||
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (usesMobileRecording) {
        mr.start();
        dataIntervalRef.current = setInterval(() => {
          if (mr.state === 'recording') mr.requestData();
        }, 500);
      } else {
        mr.start(250);
      }

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
      if (mode === 'understand') {
        // Inglés → español. Si detecta español, no traduce: avisa.
        const data = await understandEnglish(blob);
        if (!mountedRef.current) return;

        if (data.isSpanishInput) {
          setRecordError('understand-needs-english');
          setRecordState('error');
          return;
        }
        if (!data.english.trim()) {
          setRecordError('no-speech');
          setRecordState('error');
          return;
        }

        setResult({ spanish: data.spanish, english: data.english, unclear: false });
        setRecordState('done');
        return;
      }

      // Modo hablar (sin cambios): español → inglés.
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

  // Traducir una frase en inglés ESCRITA (modo entender). Reutiliza la
  // traducción inglés→español del servidor; el resultado se muestra igual que
  // el de voz (SIGNIFICA / Inglés detectado / Cómo decirlo / Escuchar).
  const handleTranslateText = async () => {
    const text = textInput.trim();
    if (!text || translatingText) return;
    stopSpeech();
    setTextError(null);
    setTranslatingText(true);
    try {
      const data = await understandText(text);
      if (!mountedRef.current) return;
      setResult({ spanish: data.spanish, english: data.english, unclear: false });
      setRecordState('done');
    } catch (err) {
      if (!mountedRef.current) return;
      setTextError(err instanceof Error ? err.message : 'No se pudo traducir. Verifica tu conexión.');
    } finally {
      if (mountedRef.current) setTranslatingText(false);
    }
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

  // Pronunciación aproximada en español del resultado en inglés.
  // Solo se genera cuando existe un resultado en inglés. Si la generación
  // fallara, se ignora y el resto del resultado sigue funcionando igual.
  const pronunciation = useMemo(() => {
    const english = result?.english?.trim();
    if (!english) return '';
    try {
      return toSpanishPronunciation(english);
    } catch {
      return '';
    }
  }, [result?.english]);

  // Precarga el audio en inglés (normal y lento) apenas hay resultado, para que
  // "Escuchar" y "Escuchar lento" suenen al instante, sin esperar a generarlo.
  useEffect(() => {
    if (recordState === 'done' && result?.english?.trim()) {
      void prefetchSpeech(result.english, 'normal');
      void prefetchSpeech(result.english, 'slow');
    }
  }, [recordState, result?.english]);

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
    mode === 'understand'         ? 'Toca y reproduce o habla en inglés' :
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
            <h1 className="text-lg font-bold text-gray-800">Traduce con voz</h1>
            <p className="text-xs text-gray-400">Habla en español o escucha inglés en tiempo real.</p>
          </div>
        </div>

        {/* Dos opciones (mismo flujo, distinto enfoque) */}
        {recordState !== 'done' && (
          <div className="flex flex-col gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode('speak')}
              aria-pressed={mode === 'speak'}
              className={[
                'w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all active:scale-[0.99]',
                mode === 'speak'
                  ? 'bg-purple-50 border-purple-400'
                  : 'bg-white border-gray-200 hover:border-purple-200',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🗣️</span>
                <div className="flex-1 min-w-0">
                  <p className={mode === 'speak' ? 'font-bold text-purple-800' : 'font-bold text-gray-800'}>
                    Quiero decir algo en inglés
                  </p>
                  <p className="text-gray-500 text-sm leading-snug">
                    Habla en español y obtén una frase en inglés lista para usar.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('understand')}
              aria-pressed={mode === 'understand'}
              className={[
                'w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all active:scale-[0.99]',
                mode === 'understand'
                  ? 'bg-purple-50 border-purple-400'
                  : 'bg-white border-gray-200 hover:border-purple-200',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👂</span>
                <div className="flex-1 min-w-0">
                  <p className={mode === 'understand' ? 'font-bold text-purple-800' : 'font-bold text-gray-800'}>
                    Quiero entender inglés
                  </p>
                  <p className="text-gray-500 text-sm leading-snug">
                    Escucha inglés y entiende su significado al instante.
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Instruction (según la opción elegida) */}
        {recordState !== 'done' && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎙️</span>
              <div>
                <p className="text-purple-800 font-semibold text-sm mb-1">¿Cómo funciona?</p>
                <p className="text-purple-700 text-sm leading-relaxed">
                  {mode === 'understand'
                    ? 'Presiona el botón y reproduce o di algo en inglés. Te muestro qué significa, cómo se escribe y cómo se pronuncia.'
                    : 'Presiona el botón, habla en español lo que necesitas decir, y yo te doy la traducción en inglés lista para usar.'}
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

        {/* Escribir frase manualmente (solo modo entender, antes del resultado) */}
        {mode === 'understand' && recordState !== 'done' && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs font-semibold">o escríbela</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Escribe una frase en inglés"
              rows={2}
              className="w-full rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none px-4 py-3 text-gray-800 text-base resize-none"
            />

            <button
              type="button"
              onClick={() => void handleTranslateText()}
              disabled={!textInput.trim() || translatingText}
              className={[
                'mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base transition-all',
                !textInput.trim() || translatingText
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 text-white active:scale-95',
              ].join(' ')}
            >
              {translatingText ? 'Traduciendo...' : 'Traducir'}
            </button>

            {textError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <p className="text-red-700 text-sm leading-snug">{textError}</p>
              </div>
            )}
          </div>
        )}

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

            {mode === 'understand' ? (
              <>
                {/* 1 — SIGNIFICA: traducción al español (resultado principal, grande) */}
                <div className="bg-purple-500 rounded-2xl px-5 py-7">
                  <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-3">Significa</p>
                  <p className="text-white font-bold text-3xl leading-snug">{result.spanish}</p>
                </div>

                {/* 2 — Responder (conversación práctica) */}
                <ReplyInEnglish />

                {/* 4 — Inglés detectado + pronunciación (secundario, abajo) */}
                <div className="bg-white border border-gray-200 rounded-t-2xl px-5 pt-5 pb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Inglés detectado</p>
                  <p className="text-gray-900 font-bold text-xl leading-snug">"{result.english}"</p>
                  {pronunciation && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cómo decirlo</p>
                      <p className="text-gray-700 text-base leading-snug">{pronunciation}</p>
                    </div>
                  )}
                </div>
                <ListenButtons onListen={handleListen} ttsState={ttsState} ttsError={ttsError} isTtsActive={isTtsActive} />
              </>
            ) : (
              <>
                {/* Modo hablar (sin cambios): lo que dijiste → inglés + pronunciación */}
                <div className="bg-gray-100 rounded-2xl px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lo que dijiste</p>
                  <p className="text-gray-700 text-base leading-relaxed italic">"{result.spanish}"</p>
                </div>
                <div className="bg-purple-500 rounded-t-2xl px-5 pt-5 pb-4">
                  <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-2">En inglés</p>
                  <p className="text-white font-bold text-2xl leading-snug">"{result.english}"</p>
                  {pronunciation && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                      <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-1">Cómo decirlo</p>
                      <p className="text-purple-50 text-lg leading-snug">{pronunciation}</p>
                    </div>
                  )}
                </div>
                <ListenButtons onListen={handleListen} ttsState={ttsState} ttsError={ttsError} isTtsActive={isTtsActive} />
              </>
            )}

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

// ── Botones de escuchar (TTS del inglés) — reutilizable en ambos modos ───────
const ListenButtons: React.FC<{
  onListen: (speed: 'normal' | 'slow') => void;
  ttsState: TtsState;
  ttsError: string | null;
  isTtsActive: boolean;
}> = ({ onListen, ttsState, ttsError, isTtsActive }) => (
  <div className="bg-purple-50 border border-purple-100 rounded-b-2xl px-5 py-4 flex flex-col gap-3">
    {ttsError && (
      <p className="text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{ttsError}</p>
    )}
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => void onListen('normal')}
        aria-label={isTtsActive ? 'Detener audio' : 'Escuchar en inglés a velocidad normal'}
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
        onClick={() => void onListen('slow')}
        disabled={isTtsActive}
        aria-label="Escuchar en inglés a velocidad lenta"
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
);

// ── Responder en inglés (sub-sección del modo "entender") ────────────────────
// Conversación práctica: el usuario responde en español y obtiene su respuesta
// en inglés + pronunciación + audio. Reutiliza el flujo existente español→inglés
// (translateSpeech) y la voz (generateSpeech). Aislado: no afecta el flujo
// principal ni el modo "Quiero decir algo en inglés".

type ReplyState = 'idle' | 'requesting' | 'recording' | 'processing' | 'done' | 'error';

const ReplyInEnglish: React.FC = () => {
  const [state, setState] = useState<ReplyState>('idle');
  const [english, setEnglish] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tts, setTts] = useState<TtsState>('idle');

  const mrRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const ttsIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mrRef.current?.state === 'recording') mrRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const pronunciation = useMemo(() => {
    const e = english.trim();
    if (!e) return '';
    try {
      return toSpanishPronunciation(e);
    } catch {
      return '';
    }
  }, [english]);

  // Precarga el audio de la respuesta para que "Escuchar" suene al instante.
  useEffect(() => {
    if (english.trim()) void prefetchSpeech(english, 'normal');
  }, [english]);

  const start = async () => {
    stopSpeech();
    setTts('idle');
    setErrorMsg(null);
    setEnglish('');
    chunksRef.current = [];
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setErrorMsg('Tu navegador no soporta grabación. Prueba con Chrome o Edge.');
      setState('error');
      return;
    }
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType =
        ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'].find((t) =>
          MediaRecorder.isTypeSupported(t),
        ) ?? '';
      const mr = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
      mrRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      const usesMobileRecording =
        /Android/i.test(navigator.userAgent) ||
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (usesMobileRecording) {
        mr.start();
        intervalRef.current = setInterval(() => {
          if (mr.state === 'recording') mr.requestData();
        }, 500);
      } else {
        mr.start(250);
      }
      setState('recording');
    } catch {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setErrorMsg('El micrófono está bloqueado. Permite el acceso e intenta de nuevo.');
      setState('error');
    }
  };

  const stop = async () => {
    const mr = mrRef.current;
    if (!mr || mr.state !== 'recording') return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState('processing');
    await new Promise<void>((resolve) => {
      mr.addEventListener('stop', () => resolve(), { once: true });
      mr.stop();
    });
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const chunks = chunksRef.current;
    if (chunks.length === 0) {
      setErrorMsg('No se grabó audio. Habla más fuerte y cerca del micrófono.');
      setState('error');
      return;
    }
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
    try {
      const data = await translateSpeech(blob);
      if (!mountedRef.current) return;
      if (data.unclear || !data.english.trim()) {
        setErrorMsg('No te entendí. Intenta de nuevo hablando más claro.');
        setState('error');
        return;
      }
      setEnglish(data.english);
      setState('done');
    } catch {
      if (!mountedRef.current) return;
      setErrorMsg('No se pudo procesar el audio. Verifica tu conexión.');
      setState('error');
    }
  };

  const handleClick = () => {
    if (state === 'recording') void stop();
    else if (state === 'idle' || state === 'error' || state === 'done') void start();
  };

  const handleListen = async () => {
    if (!english) return;
    if (tts === 'loading' || tts === 'playing') {
      stopSpeech();
      setTts('idle');
      return;
    }
    const id = ++ttsIdRef.current;
    setTts('loading');
    try {
      const p = generateSpeech(english, 'normal');
      if (mountedRef.current && ttsIdRef.current === id) setTts('playing');
      await p;
      if (mountedRef.current && ttsIdRef.current === id) setTts('idle');
    } catch {
      if (mountedRef.current && ttsIdRef.current === id) setTts('error');
    }
  };

  const processing = state === 'requesting' || state === 'processing';
  const recording = state === 'recording';
  const ttsActive = tts === 'loading' || tts === 'playing';

  const btnLabel = recording
    ? 'Detener'
    : state === 'requesting'
      ? 'Solicitando permiso...'
      : state === 'processing'
        ? 'Procesando...'
        : 'Responder';

  return (
    <div className="border-2 border-purple-100 rounded-2xl p-4 flex flex-col gap-3">
      <div>
        <p className="font-bold text-gray-800">Responder en inglés</p>
        <p className="text-gray-500 text-sm leading-snug">Di tu respuesta en español y te la doy en inglés.</p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={processing}
        className={[
          'w-full flex items-center justify-center gap-2 py-5 rounded-2xl font-bold text-lg transition-all',
          processing
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : recording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-200 active:scale-95',
        ].join(' ')}
      >
        <span className="text-2xl">🎤</span> {btnLabel}
      </button>

      {state === 'error' && errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <p className="text-red-700 text-sm leading-snug">{errorMsg}</p>
        </div>
      )}

      {state === 'done' && english && (
        <>
          <div className="bg-purple-500 rounded-2xl px-5 py-5">
            <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-2">Tu respuesta en inglés</p>
            <p className="text-white font-bold text-2xl leading-snug">"{english}"</p>
            {pronunciation && (
              <div className="mt-4 pt-3 border-t border-white/20">
                <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-1">Cómo decirlo</p>
                <p className="text-purple-50 text-lg leading-snug">{pronunciation}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => void handleListen()}
            aria-label={ttsActive ? 'Detener audio' : 'Escuchar respuesta en inglés'}
            className={[
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
              ttsActive
                ? 'bg-purple-500 text-white'
                : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 active:scale-95',
            ].join(' ')}
          >
            {ttsActive ? (
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
            {tts === 'loading' ? 'Cargando...' : tts === 'playing' ? 'Reproduciendo...' : 'Escuchar'}
          </button>
        </>
      )}
    </div>
  );
};
