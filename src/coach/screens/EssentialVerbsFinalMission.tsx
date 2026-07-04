import React, { useEffect, useRef, useState } from 'react';
import {
  generateSpeech,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
  type SpeechSpeed,
} from '../../services/speechApi';
import { evaluateSpeaking, transcribeAudio, type SpeakingEvaluation } from '../../services/voiceApi';
import {
  UNIT_3_LISTENING_STORIES,
  UNIT_3_SPEAKING_STORIES,
  getDifferentItem,
  type Unit3MissionStory,
} from '../data/essentialVerbsPractice';

export interface Unit3BestResult {
  pronunciation: number;
  comprehension: number;
  overall: number;
}

interface EssentialVerbsFinalMissionProps {
  onBack: () => void;
  onComplete: (result: Unit3BestResult) => void;
}

type MicState = 'idle' | 'requesting' | 'recording' | 'processing';
type ListenState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export const EssentialVerbsFinalMission: React.FC<EssentialVerbsFinalMissionProps> = ({
  onBack,
  onComplete,
}) => {
  const [speakingStory, setSpeakingStory] = useState<Unit3MissionStory>(() =>
    getDifferentItem(UNIT_3_SPEAKING_STORIES),
  );
  const [listeningStory, setListeningStory] = useState<Unit3MissionStory>(() =>
    getDifferentItem(UNIT_3_LISTENING_STORIES),
  );
  const [micState, setMicState] = useState<MicState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [listenState, setListenState] = useState<ListenState>('idle');
  const [speed, setSpeed] = useState<SpeechSpeed>('slow');
  const [listenAnswer, setListenAnswer] = useState('');
  const [comprehension, setComprehension] = useState<number | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    stopSpeech();
    cleanupRecorder();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  const cleanupRecorder = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    streamRef.current = null;
  };

  const resetSpeaking = () => {
    cleanupRecorder();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setEvaluation(null);
    setVoiceError(null);
    chunksRef.current = [];
    setMicState('idle');
  };

  const startRecording = async () => {
    stopSpeech();
    setListenState('idle');
    resetSpeaking();
    setMicState('requesting');
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
      setMicState('recording');
    } catch {
      setMicState('idle');
      setVoiceError('No pude usar el micrófono. Revisa el permiso e intenta otra vez.');
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setMicState('processing');
    await new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
      recorder.stop();
    });
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
    if (blob.size < 500) {
      setMicState('idle');
      setVoiceError('La grabación quedó muy corta. Cuenta la historia completa.');
      return;
    }
    const nextUrl = URL.createObjectURL(blob);
    audioUrlRef.current = nextUrl;
    setAudioUrl(nextUrl);
    try {
      const transcript = await transcribeAudio(blob);
      const result = await evaluateSpeaking({
        transcript,
        expectedPhrase: speakingStory.expected,
        situation: speakingStory.situation,
        pronunciationGuide: speakingStory.pronunciation,
      });
      setEvaluation(result ?? localEvaluation(transcript, speakingStory.expected));
    } catch {
      setVoiceError('No se pudo analizar esta grabación. Puedes escucharla y repetir la misión.');
    } finally {
      setMicState('idle');
    }
  };

  const newSpeakingStory = () => {
    resetSpeaking();
    setSpeakingStory((current) => getDifferentItem(UNIT_3_SPEAKING_STORIES, current.id));
  };

  const playListening = async () => {
    if (listenState === 'loading') return;
    if (listenState === 'playing') {
      pauseSpeech();
      setListenState('paused');
      return;
    }
    if (listenState === 'paused') {
      await resumeSpeech();
      setListenState('playing');
      return;
    }
    setListenState('loading');
    try {
      setListenState('playing');
      await generateSpeech(listeningStory.expected, speed);
      setListenState('idle');
    } catch {
      setListenState('error');
    }
  };

  const newListeningStory = () => {
    stopSpeech();
    setListenState('idle');
    setListenAnswer('');
    setComprehension(null);
    setListeningStory((current) => getDifferentItem(UNIT_3_LISTENING_STORIES, current.id));
  };

  const checkListening = () => {
    setComprehension(scoreListening(listenAnswer, listeningStory.expected));
  };

  const pronunciation = evaluation?.score ?? 0;
  const overall =
    comprehension === null ? pronunciation : Math.round((pronunciation + comprehension) / 2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 px-5 pt-10 pb-8">
      <button type="button" onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow mb-5" aria-label="Volver">
        ‹
      </button>
      <p className="text-emerald-700 text-sm font-black uppercase">Misión Final</p>
      <h1 className="text-gray-950 text-3xl font-black mt-1 mb-2">Demuestra lo que ya puedes hacer</h1>
      <p className="text-gray-700 font-semibold mb-5">Habla, escucha y conecta ideas completas.</p>

      <section className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm mb-5">
        <div className="flex justify-between gap-3 mb-4">
          <div>
            <p className="text-violet-700 text-xs font-black uppercase">Reto 1</p>
            <h2 className="text-gray-950 text-2xl font-black">Cuenta la historia</h2>
          </div>
          {evaluation && <span className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-800 flex items-center justify-center text-xl font-black">{evaluation.score}</span>}
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-4">
          <p className="text-gray-950 text-lg font-extrabold">{speakingStory.situation}</p>
        </div>
        <button
          type="button"
          disabled={micState === 'requesting' || micState === 'processing'}
          onClick={() => void (micState === 'recording' ? stopRecording() : startRecording())}
          className={micState === 'recording' ? 'w-full rounded-2xl bg-red-500 text-white py-4 font-black animate-pulse' : 'w-full rounded-2xl bg-emerald-500 text-white py-4 font-black disabled:bg-gray-300'}
        >
          {micState === 'recording' ? 'Detener grabación' : micState === 'processing' ? 'Evaluando...' : 'Contar con mi voz'}
        </button>
        {audioUrl && <div className="mt-4 bg-emerald-50 rounded-2xl p-4"><p className="font-black mb-2">Escúchate y mejora</p><audio controls src={audioUrl} className="w-full h-16" /></div>}
        {voiceError && <p className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 font-bold">{voiceError}</p>}
        {evaluation && (
          <div className="mt-4 space-y-3">
            <Result label="Lo que dijiste" value={evaluation.transcript} />
            <Result label="Forma esperada" value={speakingStory.expected} />
            <Result label="Pronunciación" value={speakingStory.pronunciation} />
            <Result label="Consejo del Coach" value={evaluation.coachNote} />
            <WordResult label="Palabras faltantes" words={evaluation.missingWords} />
            <WordResult label="Palabras adicionales" words={evaluation.extraWords} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button type="button" onClick={resetSpeaking} className="rounded-2xl border-2 border-violet-200 py-3 font-black">Repetir</button>
          <button type="button" onClick={newSpeakingStory} className="rounded-2xl border-2 border-violet-200 py-3 font-black">Otra historia</button>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm mb-5">
        <div className="flex justify-between gap-3 mb-3">
          <div><p className="text-sky-700 text-xs font-black uppercase">Reto 2</p><h2 className="text-gray-950 text-2xl font-black">Escucha la historia</h2></div>
          {comprehension !== null && <span className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-xl font-black">{comprehension}</span>}
        </div>
        <p className="text-gray-700 font-semibold mb-3">{listeningStory.situation}</p>
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mb-3">
          <p className="text-sky-900 font-black">Pausa, escribe y continúa cuando estés listo.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(['slow', 'normal'] as SpeechSpeed[]).map((item) => (
            <button key={item} type="button" disabled={listenState === 'playing' || listenState === 'paused'} onClick={() => setSpeed(item)} className={speed === item ? 'rounded-xl bg-sky-500 text-white py-3 font-black' : 'rounded-xl bg-gray-100 py-3 font-black'}>
              {item === 'slow' ? 'Lento' : 'Normal'}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => void playListening()} className="w-full rounded-2xl bg-sky-500 text-white py-4 font-black mb-3">
          {listenState === 'playing' ? 'Pausar para escribir' : listenState === 'paused' ? 'Continuar escuchando' : 'Escuchar historia'}
        </button>
        <textarea value={listenAnswer} onChange={(event) => { setListenAnswer(event.target.value); setComprehension(null); }} placeholder="Escribe en inglés lo que escuchaste..." className="w-full min-h-28 rounded-2xl border-2 border-gray-300 p-4 mb-3" />
        <button type="button" disabled={!listenAnswer.trim()} onClick={checkListening} className="w-full rounded-2xl bg-emerald-500 text-white py-4 font-black disabled:bg-gray-300">Revisar comprensión</button>
        {comprehension !== null && <div className="mt-4 bg-sky-50 rounded-2xl p-4"><p className="text-xs font-black uppercase text-sky-700">Texto correcto</p><p className="font-black mt-2">{listeningStory.expected}</p></div>}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button type="button" onClick={() => { stopSpeech(); setListenState('idle'); }} className="rounded-2xl border-2 border-sky-200 py-3 font-black">Escuchar otra vez</button>
          <button type="button" onClick={newListeningStory} className="rounded-2xl border-2 border-sky-200 py-3 font-black">Nueva historia</button>
        </div>
      </section>

      <button
        type="button"
        disabled={!evaluation || comprehension === null}
        onClick={() => onComplete({ pronunciation, comprehension: comprehension ?? 0, overall })}
        className="w-full rounded-2xl bg-gray-950 text-white py-4 font-black disabled:bg-gray-300"
      >
        Ver lo que ya puedo hacer
      </button>
    </div>
  );
};

function Result({ label, value }: { label: string; value: string }) {
  return <div className="bg-gray-50 rounded-2xl p-4"><p className="text-gray-500 text-xs font-black uppercase">{label}</p><p className="text-gray-950 font-bold mt-1">{value}</p></div>;
}

function WordResult({ label, words }: { label: string; words: string[] }) {
  if (words.length === 0) return null;
  return <div className="bg-amber-50 rounded-2xl p-4"><p className="text-amber-800 text-xs font-black uppercase">{label}</p><p className="font-bold mt-1">{words.join(' · ')}</p></div>;
}

function normalize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function scoreListening(answer: string, expected: string): number {
  const expectedWords = normalize(expected);
  const answerWords = new Set(normalize(answer));
  const matched = expectedWords.filter((word) => answerWords.has(word)).length;
  return Math.round((matched / Math.max(expectedWords.length, 1)) * 100);
}

function localEvaluation(transcript: string, expected: string): SpeakingEvaluation {
  const said = normalize(transcript);
  const target = normalize(expected);
  const missing = target.filter((word) => !said.includes(word));
  const extra = said.filter((word) => !target.includes(word));
  const score = Math.max(0, Math.round(((target.length - missing.length) / Math.max(target.length, 1)) * 100));
  return {
    transcript,
    expectedPhrase: expected,
    score,
    missingWords: missing,
    extraWords: extra,
    incorrectWords: [],
    correction: expected,
    coachNote: score >= 80 ? 'Muy bien. Ya conectas ideas completas.' : 'Repite despacio y usa cada conector como una pieza.',
    pronunciationFocus: [],
  };
}
