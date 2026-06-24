import React, { useEffect, useRef, useState } from 'react';
import { generateSpeech, stopSpeech } from '../../services/speechApi';
import { evaluateSpeaking, transcribeAudio, type SpeakingEvaluation } from '../../services/voiceApi';
import { TO_BE_FINAL_MISSION } from '../data/toBeFinalPractice';

type MicState = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'evaluating';
type ListenState = 'idle' | 'loading' | 'playing' | 'error';

interface MissionEvaluation extends SpeakingEvaluation {
  usedFallback?: boolean;
}

interface ToBeFinalMissionProps {
  onExit: () => void;
  onComplete: () => void;
}

export const ToBeFinalMission: React.FC<ToBeFinalMissionProps> = ({ onExit, onComplete }) => {
  const [micState, setMicState] = useState<MicState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<MissionEvaluation | null>(null);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [listenState, setListenState] = useState<ListenState>('idle');
  const [listenAnswer, setListenAnswer] = useState('');
  const [listenScore, setListenScore] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceAudioUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      cleanupRecorder();
      revokeVoiceAudioUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupRecorder = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    streamRef.current = null;
  };

  const revokeVoiceAudioUrl = () => {
    if (voiceAudioUrlRef.current) {
      URL.revokeObjectURL(voiceAudioUrlRef.current);
      voiceAudioUrlRef.current = null;
    }
  };

  const resetVoice = () => {
    cleanupRecorder();
    revokeVoiceAudioUrl();
    chunksRef.current = [];
    setMicState('idle');
    setVoiceError(null);
    setEvaluation(null);
    setVoiceAudioUrl(null);
  };

  const startRecording = async () => {
    stopSpeech();
    resetVoice();

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError('Tu navegador no soporta grabacion. Prueba con Chrome o Edge.');
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
      setMicState('recording');
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setMicState('idle');
      const errorName = error instanceof DOMException ? error.name : '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setVoiceError('El microfono esta bloqueado. Permite el acceso y recarga la pagina.');
      } else if (errorName === 'NotFoundError') {
        setVoiceError('No encontre un microfono disponible. Revisa el microfono seleccionado.');
      } else {
        setVoiceError('No pude iniciar la grabacion. Cierra otras apps que usen el microfono e intenta de nuevo.');
      }
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

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
    if (chunks.length === 0 || totalBytes < 800) {
      setMicState('idle');
      setVoiceError('No se grabo audio suficiente. Habla un poco mas fuerte y termina la historia antes de detener.');
      return;
    }

    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    const url = URL.createObjectURL(blob);
    revokeVoiceAudioUrl();
    voiceAudioUrlRef.current = url;
    setVoiceAudioUrl(url);

    try {
      const transcript = await transcribeAudio(blob);
      if (!mountedRef.current) return;

      setMicState('evaluating');
      const aiEvaluation = await evaluateSpeaking({
        transcript,
        expectedPhrase: TO_BE_FINAL_MISSION.expectedEn,
        situation: TO_BE_FINAL_MISSION.situationEs,
        pronunciationGuide: TO_BE_FINAL_MISSION.pronunciation,
      });

      if (!mountedRef.current) return;
      setEvaluation(aiEvaluation ?? buildFallbackEvaluation(transcript));
      setMicState('idle');
    } catch {
      if (!mountedRef.current) return;
      setMicState('idle');
      setVoiceError('No se pudo analizar tu voz. Intenta repetir la mision.');
    }
  };

  const handleMic = () => {
    if (micState === 'recording') void stopRecording();
    else if (micState === 'idle') void startRecording();
  };

  const playStory = async () => {
    if (listenState === 'loading' || listenState === 'playing') {
      stopSpeech();
      setListenState('idle');
      return;
    }
    setListenState('loading');
    try {
      setListenState('playing');
      await generateSpeech(TO_BE_FINAL_MISSION.listenExpectedEn, 'slow');
      if (mountedRef.current) setListenState('idle');
    } catch {
      if (mountedRef.current) setListenState('error');
    }
  };

  const checkListening = () => {
    setListenScore(scoreListening(listenAnswer));
  };

  const canFinish = !!evaluation && listenScore !== null;
  const isRecording = micState === 'recording';
  const micBusy = micState === 'requesting' || micState === 'transcribing' || micState === 'evaluating';
  const micLabel = isRecording
    ? 'Detener grabacion'
    : micBusy
      ? micState === 'evaluating'
        ? 'Evaluando...'
        : 'Analizando...'
      : 'Contar la historia con voz';
  const listenLabel = listenState === 'loading'
    ? 'Preparando...'
    : listenState === 'playing'
      ? 'Detener audio'
      : 'Escuchar historia';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Salir de la mision final"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-gray-400 text-xs font-semibold">Unidad 2</span>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col pb-8">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          Reto final
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
          {TO_BE_FINAL_MISSION.title}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          Une pronombres, am / is / are y vocabulario aprendido en una historia completa.
        </p>

        <section className="bg-white rounded-3xl p-5 shadow-md border border-gray-100 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">Reto 1</p>
              <h2 className="text-gray-900 text-xl font-extrabold">Cuenta la historia</h2>
            </div>
            {evaluation && (
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-emerald-700 text-xl font-extrabold">{evaluation.score}</span>
                <span className="text-emerald-600 text-[10px] font-bold">/100</span>
              </div>
            )}
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">Situacion</p>
            <p className="text-gray-900 font-semibold leading-relaxed">{TO_BE_FINAL_MISSION.situationEs}</p>
          </div>

          <button
            onClick={handleMic}
            disabled={micBusy}
            className={
              isRecording
                ? 'w-full bg-red-500 text-white text-base font-bold rounded-2xl py-4 animate-pulse'
                : micBusy
                  ? 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
                  : 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
            }
          >
            {micLabel}
          </button>

          {voiceError && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4">
              <p className="text-amber-800 text-sm font-semibold">{voiceError}</p>
            </div>
          )}

          {voiceAudioUrl && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Escucha tu historia</p>
              <audio controls src={voiceAudioUrl} className="w-full" />
            </div>
          )}

          {evaluation && (
            <div className="mt-4 flex flex-col gap-3">
              <ResultBlock label="Lo que dijiste" value={evaluation.transcript} />
              <ResultBlock label="Forma esperada" value={TO_BE_FINAL_MISSION.expectedEn} />
              <ResultBlock label="Consejo del Coach" value={evaluation.coachNote} />

              {evaluation.missingWords.length > 0 && (
                <WordList title="Palabras que faltaron" words={evaluation.missingWords} tone="red" />
              )}
              {evaluation.extraWords.length > 0 && (
                <WordList title="Palabras extra" words={evaluation.extraWords} tone="amber" />
              )}
              {evaluation.pronunciationFocus.length > 0 && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-600 mb-2">Enfocate al repetir</p>
                  <div className="flex flex-col gap-2">
                    {evaluation.pronunciationFocus.map((item, index) => (
                      <p key={`${item.word}-${index}`} className="text-gray-700 text-sm leading-relaxed">
                        <span className="font-bold text-purple-700">{item.word}</span>: {item.tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetVoice}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-2xl py-3 hover:bg-gray-50 transition-all"
              >
                Repetir reto 1
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-md border border-gray-100 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">Reto 2</p>
              <h2 className="text-gray-900 text-xl font-extrabold">Escucha la historia</h2>
            </div>
            {listenScore !== null && (
              <div className="w-16 h-16 rounded-2xl bg-sky-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-sky-700 text-xl font-extrabold">{listenScore}</span>
                <span className="text-sky-600 text-[10px] font-bold">/100</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-4">{TO_BE_FINAL_MISSION.listenPrompt}</p>
          <button
            onClick={playStory}
            disabled={listenState === 'loading'}
            className={
              listenState === 'loading'
                ? 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed mb-3'
                : 'w-full bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200 mb-3'
            }
          >
            {listenLabel}
          </button>

          {listenState === 'error' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3">
              <p className="text-amber-800 text-sm font-semibold">No se pudo reproducir el audio. Intenta otra vez.</p>
            </div>
          )}

          <textarea
            value={listenAnswer}
            onChange={(event) => {
              setListenAnswer(event.target.value);
              setListenScore(null);
            }}
            placeholder="Escribe aqui lo que escuchaste..."
            className="w-full min-h-[110px] bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 resize-none mb-3"
          />

          <button
            onClick={checkListening}
            disabled={!listenAnswer.trim()}
            className={
              listenAnswer.trim()
                ? 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
                : 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
            }
          >
            Revisar comprension
          </button>

          {listenScore !== null && (
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 mt-4">
              <p className="text-sky-700 text-xs font-bold uppercase tracking-wide mb-1">Texto correcto</p>
              <p className="text-gray-900 font-bold leading-relaxed">{TO_BE_FINAL_MISSION.listenExpectedEn}</p>
              <p className="text-gray-500 text-sm leading-relaxed mt-3">
                Comprension auditiva: <span className="font-bold text-sky-700">{listenScore}/100</span>
              </p>
            </div>
          )}
        </section>

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={onComplete}
            disabled={!canFinish}
            className={
              canFinish
                ? 'w-full bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
                : 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
            }
          >
            Terminar unidad
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultBlock: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">{label}</p>
    <p className="text-gray-900 text-sm font-semibold leading-relaxed">{value}</p>
  </div>
);

const WordList: React.FC<{ title: string; words: string[]; tone: 'red' | 'amber' }> = ({ title, words, tone }) => {
  const cls = tone === 'red'
    ? 'bg-red-50 border-red-100 text-red-700'
    : 'bg-amber-50 border-amber-100 text-amber-700';
  const chip = tone === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className={`border rounded-2xl p-4 ${cls}`}>
      <p className="text-xs font-bold uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className={`${chip} text-sm font-semibold px-2.5 py-0.5 rounded-lg`}>
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

function buildFallbackEvaluation(transcript: string): MissionEvaluation {
  const score = scoreText(transcript, TO_BE_FINAL_MISSION.expectedEn);
  const said = new Set(tokens(transcript));
  const expected = tokens(TO_BE_FINAL_MISSION.expectedEn);
  const missingWords = Array.from(new Set(expected.filter((word) => !said.has(word))));

  return {
    transcript,
    expectedPhrase: TO_BE_FINAL_MISSION.expectedEn,
    score,
    missingWords,
    extraWords: [],
    incorrectWords: [],
    correction: 'Compara tu respuesta con la historia esperada y repite las partes que faltaron.',
    coachNote: 'Repite despacio: primero sujeto, luego am / is / are, y despues el lugar o estado.',
    pronunciationFocus: missingWords.slice(0, 2).map((word) => ({
      word,
      tip: 'Practica esta palabra despacio dentro de la frase completa.',
    })),
    usedFallback: true,
  };
}

function scoreListening(answer: string): number {
  const said = new Set(tokens(answer));
  const total = TO_BE_FINAL_MISSION.listenKeywords.length;
  const matched = TO_BE_FINAL_MISSION.listenKeywords.filter((word) => said.has(word)).length;
  return Math.round((matched / total) * 100);
}

function scoreText(actual: string, expected: string): number {
  const actualSet = new Set(tokens(actual));
  const expectedTokens = tokens(expected);
  if (expectedTokens.length === 0) return 100;
  const matched = expectedTokens.filter((word) => actualSet.has(word)).length;
  return Math.round((matched / expectedTokens.length) * 100);
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
