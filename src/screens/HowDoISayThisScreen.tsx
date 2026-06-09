import React, { useState, useRef, useEffect } from 'react';
import type { InputMode, PracticeData } from '../types';
import { Header } from '../components/Header';
import { CoachMessage } from '../components/CoachMessage';
import { ModeSelector } from '../components/ModeSelector';
import { Button } from '../components/Button';
import { analyzeContext, generatePractice } from '../services/practiceApi';
import type { RequiredDetail, CommunicativeIntent } from '../services/practiceApi';
import { API_BASE } from '../config/api';

interface HowDoISayThisScreenProps {
  onBack: () => void;
  onCreatePractice: (data: PracticeData, input: string) => void;
  initialInput?: string;
}

type VoiceState = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'error';

export const HowDoISayThisScreen: React.FC<HowDoISayThisScreenProps> = ({
  onBack,
  onCreatePractice,
  initialInput = '',
}) => {
  const [mode, setMode] = useState<InputMode>('write');
  const [input, setInput] = useState(initialInput);

  // Loading: null = idle, string = message to show while busy
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Clarification flow
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [clarificationInput, setClarificationInput] = useState('');

  // Extracted details from analyze step (used in generate)
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [pendingDetails, setPendingDetails] = useState<RequiredDetail[]>([]);
  const [pendingCommIntent, setPendingCommIntent] = useState<CommunicativeIntent | null>(null);
  const [pendingIntentExpl, setPendingIntentExpl] = useState<string | null>(null);

  // ── Voice recording state ─────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const dataIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);

  // Cleanup mic/intervals on unmount
  useEffect(() => {
    return () => {
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const resetClarification = () => {
    setClarifyingQuestion(null);
    setClarificationInput('');
    setPendingIntent(null);
    setPendingDetails([]);
    setPendingCommIntent(null);
    setPendingIntentExpl(null);
  };

  // Generates practice; originalInput stays clean; all extra context is passed separately
  const runGenerate = async (
    originalInput: string,
    clarificationContext?: string,
    intent?: string | null,
    requiredDetails?: RequiredDetail[],
    communicativeIntent?: CommunicativeIntent | null,
    intentExplanation?: string | null,
  ) => {
    setLoadingMsg('Creando práctica...');
    const result = await generatePractice(
      originalInput, clarificationContext,
      intent, requiredDetails,
      communicativeIntent, intentExplanation,
    );
    setLoadingMsg(null);
    if (result.usedFallback) setUsedFallback(true);
    // Always pass the original input so "Tu situación" shows the user's own words
    onCreatePractice(result.data, originalInput);
  };

  // ── Step 1: analyze before generating ─────────────────────────────────────
  // Accepts an optional inputText so voice mode can pass the transcription
  // directly without waiting for React to flush the `input` state update.
  const handleCreate = async (inputText?: string) => {
    const text = (inputText ?? input).trim();
    if (!text) return;
    resetClarification();
    setUsedFallback(false);
    setLoadingMsg('Analizando...');

    const analysis = await analyzeContext(text);
    console.log('[handleCreate] analysis recibido:', analysis);
    setLoadingMsg(null);

    if (analysis && analysis.needsClarification && analysis.clarifyingQuestion) {
      console.log('[handleCreate] → mostrando aclaración');
      setClarifyingQuestion(analysis.clarifyingQuestion);
      setPendingIntent(analysis.intent);
      setPendingDetails(analysis.requiredDetails ?? []);
      setPendingCommIntent(analysis.communicativeIntent);
      setPendingIntentExpl(analysis.intentExplanation);
      return;
    }

    console.log('[handleCreate] → generando práctica directamente');
    await runGenerate(
      text,
      undefined,
      analysis?.intent ?? undefined,
      analysis?.requiredDetails ?? [],
      analysis?.communicativeIntent ?? undefined,
      analysis?.intentExplanation ?? undefined,
    );
  };

  // ── Step 2: user provided clarification → generate ─────────────────────────

  const handleContinue = async () => {
    if (!clarificationInput.trim()) return;
    const clarContext = clarificationInput.trim();
    const intent = pendingIntent;
    const details = pendingDetails;
    const commIntent = pendingCommIntent;
    const intentExpl = pendingIntentExpl;
    resetClarification();
    await runGenerate(input.trim(), clarContext, intent, details, commIntent, intentExpl);
  };

  // ── Voice recording ────────────────────────────────────────────────────────

  const handleStartRecording = async () => {
    setVoiceError(null);
    setVoiceState('requesting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceState('error');
      setVoiceError('Tu navegador no soporta grabación de voz.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        if (dataIntervalRef.current) {
          clearInterval(dataIntervalRef.current);
          dataIntervalRef.current = null;
        }
        stream.getTracks().forEach(t => t.stop());

        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        chunksRef.current = [];

        if (blob.size === 0) {
          setVoiceState('error');
          setVoiceError('No se grabó audio. Intenta de nuevo.');
          return;
        }

        setVoiceState('transcribing');

        // Use /api/translate-speech (proven endpoint from Flow 4) and take only the
        // Spanish transcription — avoids any issues with /api/transcribe.
        const transcribeBlob = async (b: Blob): Promise<string> => {
          const send = async () => {
            const fd = new FormData();
            fd.append('audio', b, 'recording.webm');
            const r = await fetch(`${API_BASE}/api/translate-speech`, {
              method: 'POST',
              body: fd,
            });
            if (!r.ok) {
              const msg = await r.text().catch(() => '');
              throw new Error(`server_error:${r.status}:${msg}`);
            }
            const json = await r.json() as { spanish?: string; unclear?: boolean };
            if (json.unclear) return ''; // server flagged it as inaudible
            return (json.spanish ?? '').trim();
          };

          // First attempt
          try {
            return await send();
          } catch (firstErr) {
            // On network/server error, wait 3 s and retry once (handles Render cold start)
            console.warn('[transcribe] 1er intento falló, reintentando en 3 s…', firstErr);
            await new Promise(res => setTimeout(res, 3000));
            return await send();
          }
        };

        try {
          const transcribed = await transcribeBlob(blob);

          if (!transcribed) {
            setVoiceState('error');
            setVoiceError('No entendí lo que dijiste. Intenta hablar más fuerte o más cerca del micrófono.');
            return;
          }

          // Populate the text input and switch to write mode so the user
          // can see what was transcribed, then auto-trigger the analysis.
          setInput(transcribed);
          setMode('write');
          setVoiceState('idle');

          // Pass transcription directly so we don't depend on the state flush
          await handleCreate(transcribed);
        } catch (err) {
          console.error('[transcribe] Error final:', err);
          const msg = err instanceof Error ? err.message : String(err);
          // Show the raw error so we can diagnose — will clean up once fixed
          const display = msg.replace('server_error:', 'Servidor: ').slice(0, 120);
          if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
            setVoiceError('No se pudo conectar al servidor. Verifica tu internet.');
          } else {
            setVoiceError(`Error: ${display}`);
          }
          setVoiceState('error');
        }
      };

      // iOS Safari fix: start() without timeslice, use interval to request data
      mr.start();
      dataIntervalRef.current = setInterval(() => {
        if (mr.state === 'recording') mr.requestData();
      }, 500);

      setVoiceState('recording');
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError') {
        setVoiceState('error');
        setVoiceError('Necesitas permitir el acceso al micrófono en tu dispositivo.');
      } else if (name === 'NotFoundError') {
        setVoiceState('error');
        setVoiceError('No se encontró un micrófono. Verifica que esté conectado.');
      } else {
        setVoiceState('error');
        setVoiceError('No se pudo acceder al micrófono. Intenta de nuevo.');
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const isLoading = loadingMsg !== null;

  // ── Voice mode UI helper ───────────────────────────────────────────────────

  const renderVoiceArea = () => {
    if (voiceState === 'recording') {
      return (
        <div className="w-full bg-white border-2 border-red-300 rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[160px] justify-center">
          {/* Pulsing red ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-red-100 animate-ping opacity-60" />
            <button
              onClick={handleStopRecording}
              className="relative w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              {/* Stop icon */}
              <div className="w-5 h-5 bg-white rounded-sm" />
            </button>
          </div>
          <p className="text-red-600 text-sm font-semibold text-center">
            Grabando… toca para detener
          </p>
        </div>
      );
    }

    if (voiceState === 'requesting') {
      return (
        <div className="w-full bg-white border-2 border-orange-200 rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[160px] justify-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-sm text-center">Accediendo al micrófono…</p>
        </div>
      );
    }

    if (voiceState === 'transcribing') {
      return (
        <div className="w-full bg-white border-2 border-orange-200 rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[160px] justify-center">
          <div className="flex gap-1 items-center">
            <span className="w-2 h-5 bg-orange-400 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-5 bg-orange-400 rounded animate-bounce" style={{ animationDelay: '120ms' }} />
            <span className="w-2 h-5 bg-orange-400 rounded animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
          <p className="text-gray-500 text-sm text-center">Procesando tu voz…</p>
        </div>
      );
    }

    if (voiceState === 'error') {
      return (
        <div className="w-full bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[160px] justify-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 text-sm text-center leading-snug">{voiceError}</p>
          <button
            onClick={() => { setVoiceState('idle'); setVoiceError(null); }}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    // idle
    return (
      <div className="w-full bg-white border-2 border-orange-200 rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[160px] justify-center">
        <button
          onClick={handleStartRecording}
          disabled={isLoading}
          className="w-16 h-16 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 transition-all duration-200"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-gray-600 text-sm font-medium">Toca para grabar tu voz</p>
          <p className="text-gray-400 text-xs mt-0.5">Di en español lo que necesitas comunicar</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-6">
        <Header
          title="¿Cómo digo esto?"
          onBack={onBack}
          accent="orange"
        />

        <CoachMessage message="Puedes decirlo con voz o escribirlo. Yo lo convertiré en inglés práctico y luego lo practicamos juntos." />

        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            ¿Qué necesitas comunicar?
          </h2>
          <p className="text-gray-400 text-sm">Puedes hablar o escribir en español.</p>
        </div>

        <ModeSelector mode={mode} onModeChange={(m) => {
          setMode(m);
          // Reset voice state when switching tabs
          setVoiceState('idle');
          setVoiceError(null);
        }} />

        {/* ── Input area ── */}
        {mode === 'write' ? (
          <div className="mb-5">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (clarifyingQuestion) resetClarification();
              }}
              placeholder="Ejemplo: ¿Cómo le digo al chef que se acabaron las cebollas y hay que pedirlas urgente al manager?"
              rows={5}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-200 focus:border-orange-400 rounded-2xl p-4 text-gray-800 placeholder-gray-300 text-base resize-none outline-none transition-colors leading-relaxed disabled:opacity-60"
            />
            {input.length > 0 && (
              <p className="text-right text-xs text-gray-400 mt-1">{input.length} caracteres</p>
            )}
          </div>
        ) : (
          <div className="mb-5">
            {renderVoiceArea()}
          </div>
        )}

        {/* ── Clarification card ── */}
        {clarifyingQuestion && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💬</span>
              <p className="text-orange-700 text-sm font-bold">Necesito un poco más de contexto</p>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {clarifyingQuestion}
            </p>
            <textarea
              value={clarificationInput}
              onChange={(e) => setClarificationInput(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={2}
              autoFocus
              className="w-full bg-white border-2 border-orange-200 focus:border-orange-400 rounded-xl p-3 text-gray-800 placeholder-gray-300 text-sm resize-none outline-none transition-colors mb-3"
            />
            <Button
              onClick={handleContinue}
              color="orange"
              variant="primary"
              size="md"
              fullWidth
              disabled={!clarificationInput.trim() || isLoading}
              icon={
                isLoading ? (
                  <span className="flex gap-0.5 items-center">
                    <span className="w-1 h-3.5 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-3.5 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-3.5 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )
              }
            >
              {isLoading ? loadingMsg! : 'Continuar →'}
            </Button>
          </div>
        )}

        {/* ── Fallback banner ── */}
        {usedFallback && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
            <span className="text-amber-500 text-base flex-shrink-0">⚠️</span>
            <p className="text-amber-700 text-xs leading-snug">
              Usando práctica de ejemplo por ahora. Verifica que el servidor esté corriendo.
            </p>
          </div>
        )}

        {/* ── Main button (write mode only; voice mode auto-submits after transcription) ── */}
        {mode === 'write' && !clarifyingQuestion && (
          <Button
            onClick={() => handleCreate()}
            color="orange"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!input.trim() || isLoading}
            icon={
              isLoading ? (
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              )
            }
          >
            {isLoading ? (loadingMsg ?? 'Crear práctica') : 'Crear práctica'}
          </Button>
        )}

        {/* Loading message shown in voice mode while analyzing/generating */}
        {mode === 'voice' && isLoading && (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-orange-600 text-sm font-medium">{loadingMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};
