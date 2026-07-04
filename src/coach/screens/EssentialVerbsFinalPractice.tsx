import React, { useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '../../services/voiceApi';
import {
  UNIT_3_SPEAKING_PRACTICES,
  getDifferentItem,
  type Unit3SpeakingPractice,
} from '../data/essentialVerbsPractice';

interface EssentialVerbsFinalPracticeProps {
  onBack: () => void;
  onComplete: () => void;
}

type PracticeState = 'idle' | 'requesting' | 'recording' | 'processing';

export const EssentialVerbsFinalPractice: React.FC<EssentialVerbsFinalPracticeProps> = ({
  onBack,
  onComplete,
}) => {
  const [practice, setPractice] = useState<Unit3SpeakingPractice>(() =>
    getDifferentItem(UNIT_3_SPEAKING_PRACTICES),
  );
  const [state, setState] = useState<PracticeState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => () => cleanup(), []);

  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    streamRef.current = null;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
  };

  const resetResult = () => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setTranscript('');
    setError(null);
    chunksRef.current = [];
  };

  const startRecording = async () => {
    resetResult();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar audio.');
      return;
    }
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const mimeType =
        ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4']
          .find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64000,
      });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      const ios =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (ios) {
        recorder.start();
        intervalRef.current = setInterval(() => {
          if (recorder.state === 'recording') recorder.requestData();
        }, 500);
      } else {
        recorder.start(250);
      }
      setState('recording');
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      setState('idle');
      setError('No pude usar el micrófono. Revisa el permiso e intenta otra vez.');
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setState('processing');
    await new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
      recorder.stop();
    });
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;

    const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
    if (blob.size < 500) {
      setState('idle');
      setError('La grabación quedó muy corta. Di la situación completa.');
      return;
    }
    const nextUrl = URL.createObjectURL(blob);
    audioUrlRef.current = nextUrl;
    setAudioUrl(nextUrl);
    try {
      setTranscript(await transcribeAudio(blob));
    } catch {
      setError('No se pudo transcribir, pero puedes escuchar tu grabación y repetir.');
    } finally {
      setState('idle');
    }
  };

  const newPractice = () => {
    cleanup();
    resetResult();
    setState('idle');
    setPractice((current) => getDifferentItem(UNIT_3_SPEAKING_PRACTICES, current.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 px-5 pt-10 pb-8">
      <button type="button" onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow mb-5" aria-label="Volver">
        ‹
      </button>
      <p className="text-emerald-700 text-sm font-black uppercase">Práctica hablada</p>
      <h1 className="text-gray-950 text-3xl font-black mt-1 mb-2">Responde con tu voz</h1>
      <p className="text-gray-700 font-semibold mb-5">Une verbos y conectores en una situación real.</p>

      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-sm mb-4">
        <p className="text-gray-500 text-xs font-black uppercase mb-2">Situación</p>
        <p className="text-gray-950 text-xl font-extrabold leading-relaxed">{practice.situation}</p>
      </div>

      <button
        type="button"
        disabled={state === 'requesting' || state === 'processing'}
        onClick={() => void (state === 'recording' ? stopRecording() : startRecording())}
        className={
          state === 'recording'
            ? 'w-full rounded-2xl bg-red-500 text-white py-4 font-black animate-pulse mb-4'
            : 'w-full rounded-2xl bg-emerald-500 text-white py-4 font-black disabled:bg-gray-300 mb-4'
        }
      >
        {state === 'recording' ? 'Detener grabación' : state === 'processing' ? 'Transcribiendo...' : 'Responder hablando'}
      </button>

      {audioUrl && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 mb-4">
          <p className="text-gray-950 text-lg font-black mb-3">Escúchate y mejora</p>
          <audio controls src={audioUrl} className="w-full h-16" />
        </div>
      )}
      {transcript && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <p className="text-gray-500 text-xs font-black uppercase">Tu transcripción</p>
          <p className="text-gray-950 font-bold mt-2">{transcript}</p>
        </div>
      )}
      {audioUrl && (
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5 mb-4">
          <p className="text-sky-800 text-xs font-black uppercase">Versión sugerida</p>
          <p className="text-gray-950 text-lg font-black mt-2">{practice.expected}</p>
          <p className="text-sky-800 font-extrabold mt-3">{practice.pronunciation}</p>
        </div>
      )}
      {error && <p className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 font-bold mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={newPractice} className="rounded-2xl border-2 border-emerald-300 bg-white py-4 font-black text-emerald-800">
          Nueva práctica
        </button>
        <button type="button" disabled={!audioUrl} onClick={onComplete} className="rounded-2xl bg-gray-950 text-white py-4 font-black disabled:bg-gray-300">
          Ir a la misión
        </button>
      </div>
    </div>
  );
};
