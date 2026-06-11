import React, { useState, useRef, useEffect } from 'react';
import type { PracticeData, CorrectionData } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { transcribeAudio, evaluateSpeaking } from '../services/voiceApi';
import { generateSpeech, stopSpeech } from '../services/speechApi';
import type { SpeechSpeed } from '../services/speechApi';
import { mockCorrectionData } from '../data/mockData';

// ── Types ──────────────────────────────────────────────────────────────────

type VoiceState =
  | 'idle'          // waiting for user to press record
  | 'requesting'    // asking mic permission
  | 'recording'     // actively recording
  | 'transcribing'  // sending audio to Whisper
  | 'evaluating'    // evaluating with AI
  | 'error';        // something went wrong

type TtsState = 'idle' | 'loading' | 'playing' | 'error';

type VoiceError =
  | 'mic-not-supported'
  | 'mic-denied'
  | 'mic-not-found'
  | 'recording-empty'
  | 'server-error';

const ERROR_MESSAGES: Record<VoiceError, string> = {
  'mic-not-supported': 'Tu navegador no soporta grabación. Prueba con Chrome o Edge.',
  'mic-denied': 'El micrófono está bloqueado. Permite el acceso en la barra del navegador.',
  'mic-not-found': 'No se encontró micrófono. Verifica que esté conectado.',
  'recording-empty': 'No se grabó audio. Intenta de nuevo y habla más fuerte.',
  'server-error': 'No se pudo analizar el audio. Verifica que el servidor esté activo.',
};

const RECORD_LABEL: Record<VoiceState, string> = {
  idle: 'Presiona para hablar',
  requesting: 'Solicitando permiso...',
  recording: 'Detener grabación',
  transcribing: 'Analizando tu voz...',
  evaluating: 'Evaluando respuesta...',
  error: 'Presiona para hablar',
};

// ── Component ──────────────────────────────────────────────────────────────

interface VoicePracticeScreenProps {
  data: PracticeData;
  practicePhrase?: string;   // override which phrase to practice (basic or natural)
  onBack: () => void;
  onCorrection: (data: CorrectionData) => void;
  breadcrumb?: string;
}

export const VoicePracticeScreen: React.FC<VoicePracticeScreenProps> = ({
  data,
  practicePhrase,
  onBack,
  onCorrection,
  breadcrumb: _breadcrumb,
}) => {
  // Use the selected phrase (basic or natural) — defaults to naturalForm
  const targetPhrase = practicePhrase ?? data.naturalForm;
  // Use the matching pronunciation for the selected phrase
  const targetPronunciation = (practicePhrase === data.basicForm && data.basicPronunciation)
    ? data.basicPronunciation
    : data.pronunciation;
  const [voiceState, setVoiceState]       = useState<VoiceState>('idle');
  const [voiceError, setVoiceError]       = useState<VoiceError | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [ttsState, setTtsState]           = useState<TtsState>('idle');
  const [ttsError, setTtsError]           = useState<string | null>(null);

  // Refs — survive re-renders, cleaned up on unmount
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const streamRef         = useRef<MediaStream | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const dataIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef        = useRef(true);
  const ttsCallIdRef      = useRef(0);

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────

  const isProcessing   = voiceState === 'requesting' || voiceState === 'transcribing' || voiceState === 'evaluating';
  const isRecordDisabled = isProcessing;
  const isTtsActive    = ttsState === 'loading' || ttsState === 'playing';

  // ── TTS ──────────────────────────────────────────────────────────────────

  const handleListen = async (speed: SpeechSpeed) => {
    // Toggle off if already active
    if (isTtsActive) {
      stopSpeech();
      setTtsState('idle');
      setTtsError(null);
      return;
    }

    const callId = ++ttsCallIdRef.current;
    setTtsError(null);
    setTtsState('loading');

    try {
      const playPromise = generateSpeech(targetPhrase, speed);

      if (mountedRef.current && ttsCallIdRef.current === callId) {
        setTtsState('playing');
      }

      await playPromise;

      if (mountedRef.current && ttsCallIdRef.current === callId) {
        setTtsState('idle');
      }
    } catch (err) {
      if (mountedRef.current && ttsCallIdRef.current === callId) {
        setTtsError(err instanceof Error ? err.message : 'Error al reproducir el audio.');
        setTtsState('error');
      }
    }
  };

  // ── Start real recording ─────────────────────────────────────────────────

  const handleStartRecording = async () => {
    // Stop any TTS that might be playing
    stopSpeech();
    setTtsState('idle');
    setTtsError(null);

    setVoiceError(null);
    audioChunksRef.current = [];

    // Browser support check
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError('mic-not-supported');
      setVoiceState('error');
      return;
    }

    setVoiceState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick the best supported MIME type
      const mimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ].find((t) => MediaRecorder.isTypeSupported(t)) ?? '';

      const mr = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 16000, // 16 kbps — 8× smaller upload, fine for Whisper
      });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // iOS Safari ignores the timeslice in mr.start(N).
      // Fix: start without timeslice + poll requestData() every 500 ms.
      mr.start();
      dataIntervalRef.current = setInterval(() => {
        if (mr.state === 'recording') mr.requestData();
      }, 500);

      setVoiceState('recording');
    } catch (err) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setVoiceError('mic-denied');
      } else if (name === 'NotFoundError') {
        setVoiceError('mic-not-found');
      } else {
        setVoiceError('server-error');
      }
      setVoiceState('error');
    }
  };

  // ── Stop recording → transcribe → evaluate ───────────────────────────────

  const handleStopRecording = async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;

    if (dataIntervalRef.current) {
      clearInterval(dataIntervalRef.current);
      dataIntervalRef.current = null;
    }

    setVoiceState('transcribing');

    // Wait for MediaRecorder to flush and fire onstop
    await new Promise<void>((resolve) => {
      mr.addEventListener('stop', () => resolve(), { once: true });
      mr.stop();
    });

    // Release mic immediately
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const chunks = audioChunksRef.current;
    if (chunks.length === 0) {
      setVoiceError('recording-empty');
      setVoiceState('error');
      return;
    }

    const mimeType = mr.mimeType || 'audio/webm';
    const audioBlob = new Blob(chunks, { type: mimeType });

    try {
      // 1 — Transcribe
      const transcript = await transcribeAudio(audioBlob);

      // Show transcription immediately — user sees feedback while evaluation runs
      setTranscribedText(transcript);

      // 2 — Evaluate
      setVoiceState('evaluating');
      const evaluation = await evaluateSpeaking({
        transcript,
        expectedPhrase: targetPhrase,
        situation: data.situation,
        pronunciationGuide: data.pronunciation,
      });

      // 3 — Build CorrectionData and navigate
      const correctionData: CorrectionData = evaluation
        ? {
            whatYouSaid: transcript,
            correctForm: targetPhrase,
            correction: evaluation.correction,
            pronunciation: data.pronunciation,
            coachNote: evaluation.coachNote,
            score: evaluation.score,
            missingWords: evaluation.missingWords,
            extraWords: evaluation.extraWords,
            incorrectWords: evaluation.incorrectWords,
            pronunciationFocus: evaluation.pronunciationFocus,
            usedFallback: false,
          }
        : {
            ...mockCorrectionData,
            whatYouSaid: transcript,
            correctForm: targetPhrase,
            usedFallback: true,
          };

      onCorrection(correctionData);
    } catch {
      setVoiceError('server-error');
      setVoiceState('error');
    }
  };

  // ── Button click dispatcher ──────────────────────────────────────────────

  const handleRecordClick = () => {
    if (voiceState === 'recording') {
      void handleStopRecording();
    } else if (voiceState === 'idle' || voiceState === 'error') {
      void handleStartRecording();
    }
  };

  const handleRepeat = () => {
    setVoiceState('idle');
    setVoiceError(null);
    setTranscribedText(null);
  };

  // ── Record button style ──────────────────────────────────────────────────

  const recordBtnClass = [
    'w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-semibold text-lg transition-all duration-200',
    isRecordDisabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : voiceState === 'recording'
        ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse active:scale-95'
        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-95',
  ].join(' ');

  // ── Listen icon / label ──────────────────────────────────────────────────

  const listenLabel =
    ttsState === 'loading' ? 'Preparando...' :
    ttsState === 'playing' ? 'Reproduciendo...' :
    'Escuchar';

  const listenIcon = isTtsActive ? (
    <span className="flex gap-1 items-center">
      <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-8">

        {/* Back + breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-xs text-gray-400 font-medium">¿Cómo digo esto? • Práctica de voz</p>
        </div>

        {/* Situation */}
        <Card accent="orange" className="mb-4">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Tu situación</p>
          <p className="text-gray-700 leading-relaxed">"{data.situation}"</p>
        </Card>

        {/* Phrase to practice + pronunciation */}
        <div className="mb-6">
          <div className="bg-blue-500 rounded-t-2xl px-5 pt-5 pb-4">
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-2">Frase para practicar</p>
            <p className="text-white font-bold text-xl leading-snug">"{targetPhrase}"</p>
          </div>
          {targetPronunciation && (
            <div className="bg-blue-50 border border-blue-100 rounded-b-2xl px-5 py-3">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
                Pronunciación aproximada
              </p>
              <p className="text-blue-700 text-sm italic leading-relaxed">
                {targetPronunciation}
              </p>
            </div>
          )}
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-base">👂</div>
          <p className="text-gray-600 font-medium">Escucha y luego repite con tu voz.</p>
        </div>

        {/* Voice controls */}
        <div className="flex flex-col gap-4">

          {/* Listen — normal + slow */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => void handleListen('normal')}
              color="blue"
              variant={isTtsActive ? 'primary' : 'secondary'}
              size="lg"
              fullWidth
              disabled={voiceState === 'recording' || isProcessing}
              aria-label={isTtsActive ? 'Detener audio' : 'Escuchar frase en velocidad normal'}
              icon={listenIcon}
            >
              {listenLabel}
            </Button>

            <Button
              onClick={() => void handleListen('slow')}
              color="blue"
              variant="outline"
              size="lg"
              fullWidth
              disabled={isTtsActive || voiceState === 'recording' || isProcessing}
              aria-label="Escuchar frase en velocidad lenta"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            >
              Escuchar lento
            </Button>
          </div>

          {/* TTS error */}
          {ttsState === 'error' && ttsError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <span className="text-amber-400 text-base flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-amber-700 text-sm leading-snug">{ttsError}</p>
            </div>
          )}

          {/* Transcription preview — shown immediately after STT, while evaluation runs */}
          {voiceState === 'evaluating' && transcribedText && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">Lo que dijiste</p>
              <p className="text-gray-700 text-sm italic leading-snug">"{transcribedText}"</p>
            </div>
          )}

          {/* Record / Stop / Processing */}
          <button
            type="button"
            onClick={handleRecordClick}
            disabled={isRecordDisabled}
            className={recordBtnClass}
            aria-label={voiceState === 'recording' ? 'Detener grabación' : 'Iniciar grabación'}
          >
            {/* Icon */}
            <div className={[
              'w-6 h-6 rounded-full border-2 border-current flex items-center justify-center',
              voiceState === 'recording' ? 'bg-white' : '',
            ].join(' ')}>
              {isProcessing ? (
                <span className="flex gap-0.5 items-center">
                  <span className="w-0.5 h-3 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-3 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-3 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : voiceState === 'recording' ? (
                <span className="w-3 h-3 bg-red-500 rounded-full" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                </svg>
              )}
            </div>
            {RECORD_LABEL[voiceState]}
          </button>

          {/* Voice error message */}
          {voiceState === 'error' && voiceError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <span className="text-red-400 text-base flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm leading-snug">{ERROR_MESSAGES[voiceError]}</p>
            </div>
          )}

          {/* Repeat / Reset */}
          <Button
            onClick={handleRepeat}
            color="gray"
            variant="outline"
            size="md"
            fullWidth
            disabled={isProcessing}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.92" />
              </svg>
            }
          >
            Repetir
          </Button>

        </div>
      </div>
    </div>
  );
};
