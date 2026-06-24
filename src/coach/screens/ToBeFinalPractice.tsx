import React, { useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '../../services/voiceApi';
import {
  getNextToBeFinalPractice,
  type ToBeFinalPracticeItem,
} from '../data/toBeFinalPractice';

type MicState = 'idle' | 'requesting' | 'recording' | 'transcribing';

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type BrowserSpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

interface ToBeFinalPracticeProps {
  onExit: () => void;
  onComplete: () => void;
  completeLabel?: string;
}

export const ToBeFinalPractice: React.FC<ToBeFinalPracticeProps> = ({ onExit, onComplete, completeLabel = 'Terminar unidad' }) => {
  const [practice, setPractice] = useState<ToBeFinalPracticeItem>(() => getNextToBeFinalPractice());
  const [micState, setMicState] = useState<MicState>('idle');
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micBlocked, setMicBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const browserTranscriptRef = useRef('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupRecorder();
      revokeAudioUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revokeAudioUrl = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  const cleanupRecorder = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    recognitionRef.current?.abort();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    recognitionRef.current = null;
    streamRef.current = null;
  };

  const resetAttempt = () => {
    cleanupRecorder();
    revokeAudioUrl();
    chunksRef.current = [];
    browserTranscriptRef.current = '';
    setMicState('idle');
    setTranscript('');
    setAudioUrl(null);
    setMicBlocked(false);
    setError(null);
  };

  const newPractice = () => {
    const next = getNextToBeFinalPractice(practice.id);
    resetAttempt();
    setPractice(next);
  };

  const startRecording = async () => {
    resetAttempt();

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicBlocked(true);
      setError('Tu navegador no soporta grabacion. Prueba con Chrome o Edge.');
      return;
    }

    setMicState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const mimeType =
        ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'].find((type) =>
          MediaRecorder.isTypeSupported(type),
        ) ?? '';

      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64000,
      });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start();
      intervalRef.current = setInterval(() => {
        if (recorder.state === 'recording') recorder.requestData();
      }, 500);
      startBrowserRecognition();
      setMicState('recording');
    } catch (err) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setMicBlocked(true);
      setMicState('idle');
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('El microfono esta bloqueado. Permite el acceso y recarga la pagina.');
      } else if (name === 'NotFoundError') {
        setError('No encontre un microfono disponible. Revisa el microfono seleccionado.');
      } else {
        setError('No pude iniciar la grabacion. Cierra otras apps que usen el microfono e intenta de nuevo.');
      }
    }
  };

  const startBrowserRecognition = () => {
    const SpeechRecognition =
      (window as BrowserSpeechRecognitionWindow).SpeechRecognition ??
      (window as BrowserSpeechRecognitionWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        if (text.trim()) browserTranscriptRef.current = text.trim();
      };
      recognition.onerror = () => undefined;
      recognition.onend = () => undefined;
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      recognitionRef.current = null;
    }
  };

  const stopBrowserRecognition = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      recognitionRef.current?.abort();
    } finally {
      recognitionRef.current = null;
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopBrowserRecognition();
    setMicState('transcribing');

    await new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
      try {
        recorder.requestData();
      } catch {
        // Algunos navegadores no permiten requestData justo antes de stop.
      }
      recorder.stop();
    });
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;

    const chunks = chunksRef.current;
    const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const browserTranscript = browserTranscriptRef.current.trim();
    if (chunks.length === 0 || totalBytes < 800) {
      if (browserTranscript) {
        if (mountedRef.current) {
          setTranscript(browserTranscript);
          setError(null);
          setMicState('idle');
        }
        return;
      }
      if (mountedRef.current) {
        setError('La grabacion salio muy corta. Habla la frase completa antes de detener.');
        setMicState('idle');
      }
      return;
    }

    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    const url = URL.createObjectURL(blob);
    revokeAudioUrl();
    audioUrlRef.current = url;
    setAudioUrl(url);

    try {
      let text = await transcribeAudio(blob);
      if (!text.trim() && browserTranscript) text = browserTranscript;
      if (!mountedRef.current) return;
      setTranscript(text.trim());
      if (!text.trim()) setError('No pude transcribir tu voz. Intenta hablar mas claro y cerca del microfono.');
    } catch {
      if (mountedRef.current) {
        if (browserTranscript) {
          setTranscript(browserTranscript);
          setError(null);
        } else {
          setError('No se pudo transcribir esta grabacion. Puedes repetir la practica.');
        }
      }
    } finally {
      if (mountedRef.current) setMicState('idle');
    }
  };

  const handleMic = () => {
    if (micState === 'recording') void stopRecording();
    else if (micState === 'idle') void startRecording();
  };

  const isRecording = micState === 'recording';
  const isBusy = micState === 'requesting' || micState === 'transcribing';
  const hasResult = !!transcript || !!audioUrl || !!error;
  const micLabel = isRecording
    ? 'Detener grabacion'
    : isBusy
      ? 'Procesando...'
      : hasResult
        ? 'Grabar otra vez'
        : 'Responder hablando';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Salir de la practica"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-gray-400 text-xs font-semibold">Practica final</span>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col pb-8">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          Verbo to be
        </p>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">
          Responde en ingles con tu voz
        </h1>

        <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-100 mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Situacion</p>
          <p className="text-gray-900 text-lg leading-relaxed font-semibold">{practice.situationEs}</p>
        </div>

        {!hasResult && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
            <p className="text-emerald-800 text-sm leading-relaxed">
              Primero habla. Despues veras tu transcripcion y una version sugerida para comparar.
            </p>
          </div>
        )}

        {audioUrl && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <p className="text-gray-700 text-sm font-bold mb-2">Escucha tu grabacion</p>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {transcript && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Tu transcripcion</p>
            <p className="text-gray-900 font-semibold leading-relaxed">{transcript}</p>
          </div>
        )}

        {hasResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide mb-1">
              Version sugerida
            </p>
            <p className="text-gray-900 font-bold leading-relaxed">{practice.suggestedEn}</p>
            <div className="mt-3 pt-3 border-t border-emerald-100">
              <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide mb-1">
                Como decirlo
              </p>
              <p className="text-gray-700 text-sm font-semibold leading-relaxed">
                {practice.suggestedPronunciation}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 text-sm font-semibold">{error}</p>
          </div>
        )}

        {micBlocked && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
            <p className="text-gray-600 text-sm leading-snug">
              No pudimos usar el microfono. Revisa el permiso del navegador y vuelve a intentar.
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={handleMic}
            disabled={isBusy}
            className={
              isRecording
                ? 'w-full bg-red-500 text-white text-base font-bold rounded-2xl py-4 animate-pulse'
                : isBusy
                  ? 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
                  : 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
            }
          >
            {micLabel}
          </button>

          <button
            onClick={newPractice}
            disabled={isBusy || isRecording}
            className={
              isBusy || isRecording
                ? 'w-full bg-gray-100 border border-gray-200 text-gray-400 text-sm font-bold rounded-2xl py-3 cursor-not-allowed'
                : 'w-full bg-white border border-emerald-200 text-emerald-700 text-sm font-bold rounded-2xl py-3 hover:bg-emerald-50 transition-all'
            }
          >
            Nueva practica
          </button>

          {hasResult && (
            <button
              onClick={onComplete}
              className="w-full bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
            >
              {completeLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
