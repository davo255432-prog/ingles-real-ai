import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TO_BE_BLOCKS,
  TO_BE_DIALOGUES,
  TO_BE_GROUPS,
  TO_BE_PHRASES,
  TO_BE_LESSON_ID,
  getBePhrase,
  type BeForm,
  type BePhrase,
  type BeDialogue,
} from '../data/curriculum';
import { generateSpeech, stopSpeech } from '../../services/speechApi';
import { transcribeAudio } from '../../services/voiceApi';
import { ToBeFinalPractice } from './ToBeFinalPractice';
import { ToBeFinalMission } from './ToBeFinalMission';
import { TO_BE_VISUAL_SCENES, type ToBeVisualScene } from '../data/toBeVisualScenes';
import { getVisual, handleVisualError } from '../visual-library';
import {
  TO_BE_FINAL_MISSION_STEP_SLUG,
  TO_BE_FINAL_PRACTICE_STEP_SLUG,
  TO_BE_FINAL_VOCAB_STEP_SLUG,
  TO_BE_FINAL_VOCABULARY,
  TO_BE_CONNECTOR_CHUNKS,
  TO_BE_USEFUL_CHUNKS,
} from '../data/toBeFinalPractice';

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

function shouldUseBrowserSpeechFallback(): boolean {
  return !/Android/i.test(navigator.userAgent);
}

// ─────────────────────────────────────────────────────────────────────────────
// Unidad 2 — Verbo "to be" (am / is / are). Pantalla autónoma, al estilo de
// PronounsPractice: maneja TODO el flujo internamente (bienvenida, cuadro visual,
// bloques, oído, voz, diálogos, ejercicios, resumen y cierre).
// Reutiliza los servicios existentes: generateSpeech/stopSpeech (audio) y
// transcribeAudio + MediaRecorder (voz). No crea un sistema oral nuevo.
// ─────────────────────────────────────────────────────────────────────────────

interface ToBePracticeProps {
  /** Apodo del usuario para la bienvenida del Coach (si existe). */
  userName?: string;
  /** Paso interno por el que reanudar (id estable). */
  initialStepId?: string;
  /** Salir de la unidad (botón atrás). */
  onExit: () => void;
  /** Persiste el paso exacto actual (capa de avance). */
  onStepChange: (stepId: string) => void;
  /** Unidad completada (sin navegar): recibe el % logrado. */
  onComplete: (score: number) => void;
  /** Volver al mapa del Nivel Básico (botón de la pantalla final). */
  onBackToMap: () => void;
}

// ── Colores por grupo (distintos por verbo, respetando el estilo actual) ──────
const FORM_STYLE: Record<BeForm, { chip: string; soft: string; accent: string; ring: string }> = {
  am: { chip: 'bg-sky-100 text-sky-700', soft: 'bg-sky-50 border-sky-200', accent: 'text-sky-700', ring: 'border-sky-300' },
  is: { chip: 'bg-violet-100 text-violet-700', soft: 'bg-violet-50 border-violet-200', accent: 'text-violet-700', ring: 'border-violet-300' },
  are: { chip: 'bg-amber-100 text-amber-700', soft: 'bg-amber-50 border-amber-200', accent: 'text-amber-700', ring: 'border-amber-300' },
};

// ── Utilidades ───────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
const sid = (slug: string): string => `${TO_BE_LESSON_ID}.s-${slug}`;

// Normaliza texto a tokens en minúscula (para comparar la voz).
function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Compara la transcripción con la frase esperada (sin puntuación fonética).
type VoiceVerdict =
  | { kind: 'got' }
  | { kind: 'word'; word: string }
  | { kind: 'almost' }
  | { kind: 'none' };

function evaluatePhrase(transcript: string, expectedEn: string): VoiceVerdict {
  const said = tokens(transcript);
  if (said.length === 0) return { kind: 'none' };
  const expected = tokens(expectedEn);
  const saidSet = new Set(said);
  const missing = expected.filter((w) => !saidSet.has(w));
  if (missing.length === 0) return { kind: 'got' };
  const matched = expected.length - missing.length;
  // La mayoría correcta pero falta alguna → señala la primera palabra que faltó.
  if (matched / expected.length >= 0.6) return { kind: 'word', word: missing[0] };
  return { kind: 'almost' };
}

// ── Modelo de ejercicio de opciones (cubre varios tipos) ─────────────────────
interface OptionExercise {
  prompt: string;
  sentence?: string;     // frase a mostrar (con ___ o como contexto)
  options: string[];
  answer: string;
  coach: string;         // explicación breve del Coach (al fallar)
  example?: string;      // ejemplo distinto (al fallar)
  figures?: boolean;     // opciones como figuras grandes (elegir la figura)
  audioText?: string;    // si existe, muestra botón de audio y exige escuchar
}

// ── Pasos internos de la unidad ──────────────────────────────────────────────
type ToBeStep =
  | { id: string; kind: 'welcome' }
  | { id: string; kind: 'overview' }
  | { id: string; kind: 'phrase'; phrase: BePhrase; blockIntro?: string; blockTitle?: string }
  | { id: string; kind: 'exercise'; ex: OptionExercise }
  | { id: string; kind: 'order'; prompt: string; words: string[]; answer: string; coach: string }
  | { id: string; kind: 'speak'; phrase: BePhrase; label: string }
  | { id: string; kind: 'dialogue'; dlg: BeDialogue }
  | { id: string; kind: 'visual-scene'; scene: ToBeVisualScene; first: boolean }
  | { id: string; kind: 'summary' }
  | { id: string; kind: 'final-vocab' }
  | { id: string; kind: 'final-practice' }
  | { id: string; kind: 'final-mission' };

// Genera la frase con un hueco "___" para los ejercicios de elegir verbo.
function gap(phrase: BePhrase): string {
  return phrase.en.replace(/\b(am|is|are)\b/i, '___');
}

// Construye la lista completa de pasos de la unidad (con ids estables).
function buildSteps(): ToBeStep[] {
  const steps: ToBeStep[] = [];
  steps.push({ id: sid('welcome'), kind: 'welcome' });
  steps.push({ id: sid('overview'), kind: 'overview' });

  // ── Bloques: enseñar → ejercicio corto → oído → voz ──
  for (const block of TO_BE_BLOCKS) {
    block.phrases.forEach((phrase, i) => {
      steps.push({
        id: sid(`teach-${phrase.id}`),
        kind: 'phrase',
        phrase,
        blockIntro: i === 0 ? block.intro : undefined,
        blockTitle: block.title,
      });
    });

    // Ejercicio corto: elegir am/is/are para una frase del bloque.
    const ePhrase = block.phrases[0];
    steps.push({
      id: sid(`ex-be-${block.id}`),
      kind: 'exercise',
      ex: {
        prompt: 'Elige el verbo correcto.',
        sentence: gap(ePhrase),
        options: ['am', 'is', 'are'],
        answer: block.verb,
        coach: `Con ${block.pronouns} usamos ${block.verb}.`,
        example: ePhrase.en,
      },
    });

    // Práctica de oído: escuchar una frase del bloque y elegir su significado.
    const lPhrase = block.phrases[block.phrases.length - 1];
    steps.push({
      id: sid(`listen-${block.id}`),
      kind: 'exercise',
      ex: buildListen(lPhrase),
    });

    // Repetición con voz tras el bloque.
    const speakPhrase = getBePhrase(block.speakPhraseIds[0]);
    if (speakPhrase) {
      steps.push({
        id: sid(`speak-${block.id}`),
        kind: 'speak',
        phrase: speakPhrase,
        label: 'Repite la frase con tu voz',
      });
    }
  }

  // ── Ejercicios variados ──
  TO_BE_VISUAL_SCENES.forEach((scene, index) => {
    steps.push({
      id: sid(`visual-${scene.id}`),
      kind: 'visual-scene',
      scene,
      first: index === 0,
    });
  });

  steps.push({
    id: sid('ex-match'),
    kind: 'exercise',
    ex: {
      prompt: '¿Qué verbo va con "we"?',
      options: ['am', 'is', 'are'],
      answer: 'are',
      coach: 'we / you / they → are.',
      example: 'We are ready.',
    },
  });
  steps.push({
    id: sid('ex-fill'),
    kind: 'exercise',
    ex: {
      prompt: 'Completa la frase.',
      sentence: 'She ___ happy.',
      options: ['am', 'is', 'are'],
      answer: 'is',
      coach: 'he / she / it → is.',
      example: 'She is happy.',
    },
  });
  steps.push({
    id: sid('ex-order'),
    kind: 'order',
    prompt: 'Ordena las palabras para formar la frase.',
    words: ['I', 'am', 'ready'],
    answer: 'I am ready',
    coach: 'Empieza por quién: "I" + am.',
  });

  // Corregir errores (los tres del enunciado).
  steps.push(fixStep('fix-1', 'I is ready', ['I am ready', 'I are ready', 'I is ready'], 'I am ready', 'Con "I" siempre va am.'));
  steps.push(fixStep('fix-2', 'He are tired', ['He am tired', 'He is tired', 'He are tired'], 'He is tired', 'Con "he" va is.'));
  steps.push(fixStep('fix-3', 'They is outside', ['They am outside', 'They is outside', 'They are outside'], 'They are outside', 'Con "they" va are.'));

  // Elegir la figura correcta.
  steps.push({
    id: sid('ex-figure'),
    kind: 'exercise',
    ex: {
      prompt: 'Elige la figura de "She is happy."',
      options: ['😊', '😴', '🚪', '🌳'],
      answer: '😊',
      figures: true,
      coach: '"She is happy." = Ella está feliz.',
    },
  });

  // ── Mini diálogos ──
  for (const dlg of TO_BE_DIALOGUES) {
    steps.push({ id: sid(`dlg-${dlg.id}`), kind: 'dialogue', dlg });
  }

  // ── Resumen final ──
  steps.push({ id: sid('summary'), kind: 'summary' });

  // ── Repaso mezclado ──
  steps.push({
    id: sid('rev-1'),
    kind: 'exercise',
    ex: {
      prompt: 'Elige el verbo correcto.',
      sentence: 'He ___ tired.',
      options: ['am', 'is', 'are'],
      answer: 'is',
      coach: 'he / she / it → is.',
      example: 'He is tired.',
    },
  });
  steps.push({
    id: sid('rev-2'),
    kind: 'exercise',
    ex: {
      prompt: 'Elige el verbo correcto.',
      sentence: 'You ___ here.',
      options: ['am', 'is', 'are'],
      answer: 'are',
      coach: 'you / we / they → are.',
      example: 'You are here.',
    },
  });

  // ── 5 ejercicios auditivos ──
  sample(TO_BE_PHRASES, 5).forEach((p, i) => {
    steps.push({ id: sid(`aud-${i}`), kind: 'exercise', ex: buildListen(p) });
  });

  // ── 3 frases con voz ──
  sample(TO_BE_PHRASES, 3).forEach((p, i) => {
    steps.push({ id: sid(`voice-${i}`), kind: 'speak', phrase: p, label: 'Di la frase en voz alta' });
  });

  // ── Mini reto final ──
  steps.push({
    id: sid('challenge'),
    kind: 'order',
    prompt: 'Reto final: ordena la frase.',
    words: ['They', 'are', 'outside'],
    answer: 'They are outside',
    coach: 'they → are. La cosa/personas van primero.',
  });

  steps.push({ id: sid(TO_BE_FINAL_VOCAB_STEP_SLUG), kind: 'final-vocab' });
  steps.push({ id: sid(TO_BE_FINAL_PRACTICE_STEP_SLUG), kind: 'final-practice' });
  steps.push({ id: sid(TO_BE_FINAL_MISSION_STEP_SLUG), kind: 'final-mission' });

  return steps;
}

function buildListen(phrase: BePhrase): OptionExercise {
  const distractors = sample(
    TO_BE_PHRASES.filter((p) => p.id !== phrase.id),
    3,
  ).map((p) => p.es);
  return {
    prompt: 'Escucha y elige el significado.',
    options: shuffle([phrase.es, ...distractors]),
    answer: phrase.es,
    audioText: phrase.en,
    coach: `"${phrase.en}" = ${phrase.es}`,
  };
}

function fixStep(slug: string, wrong: string, options: string[], answer: string, coach: string): ToBeStep {
  return {
    id: sid(slug),
    kind: 'exercise',
    ex: {
      prompt: 'Corrige el error. ¿Cuál es la forma correcta?',
      sentence: `❌ ${wrong}`,
      options: shuffle(options),
      answer,
      coach,
      example: answer,
    },
  };
}

// ── Hook de audio (carga / listo / error) ────────────────────────────────────
type AudioState = 'idle' | 'loading' | 'ready' | 'error';
function useAudio() {
  const [state, setState] = useState<AudioState>('idle');
  const play = async (text: string) => {
    if (!text) return;
    setState('loading');
    try {
      await generateSpeech(text);
      setState('ready');
    } catch (err) {
      console.error('[ToBePractice] Falló la reproducción de voz:', err);
      setState('error');
    }
  };
  const reset = () => {
    stopSpeech();
    setState('idle');
  };
  return { state, play, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export const ToBePractice: React.FC<ToBePracticeProps> = ({
  userName,
  initialStepId,
  onExit,
  onStepChange,
  onComplete,
  onBackToMap,
}) => {
  const steps = useMemo(() => buildSteps(), []);
  const total = steps.length;

  const startIndex = useMemo(() => {
    if (!initialStepId) return 0;
    const i = steps.findIndex((s) => s.id === initialStepId);
    return i >= 0 ? i : 0;
  }, [initialStepId, steps]);

  const [index, setIndex] = useState(startIndex);
  const [finished, setFinished] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);

  const step = steps[index];

  // Persiste el paso exacto cada vez que cambia (capa de avance).
  useEffect(() => {
    if (!finished && step) onStepChange(step.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  const advance = (wasCorrect?: boolean, isExercise?: boolean) => {
    if (isExercise) {
      setExerciseCount((n) => n + 1);
      if (wasCorrect) setCorrect((c) => c + 1);
    }
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      stopSpeech();
      const score = exerciseCount > 0 ? Math.round((correct / exerciseCount) * 100) : 100;
      setFinished(true);
      onComplete(score);
    }
  };

  // ── Pantalla de cierre ──
  if (finished) {
    return (
      <Shell onExit={onExit} hideTop>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Unidad 2 — Verbo to be completada</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Ya puedes usar am, is y are para formar frases sencillas.
          </p>
        </div>
        <div className="px-5 pb-8">
          <button
            onClick={onBackToMap}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Volver al mapa del Nivel Básico
          </button>
        </div>
      </Shell>
    );
  }

  const progressPct = Math.round((index / total) * 100);

  if (step.kind === 'final-practice') {
    return <ToBeFinalPractice onExit={onExit} onComplete={() => advance()} completeLabel="Ir a la Mision Final" />;
  }

  if (step.kind === 'final-mission') {
    return <ToBeFinalMission onExit={onExit} onComplete={() => advance()} />;
  }

  return (
    <Shell onExit={onExit} progressPct={progressPct} counter={`${index + 1}/${total}`}>
      {step.kind === 'welcome' && <Welcome userName={userName} onNext={() => advance()} />}
      {step.kind === 'overview' && <Overview onNext={() => advance()} />}
      {step.kind === 'phrase' && <PhraseCard step={step} onNext={() => advance()} />}
      {step.kind === 'exercise' && (
        <ExerciseCard
          key={step.id}
          ex={step.ex}
          onDone={(ok) => advance(ok, true)}
        />
      )}
      {step.kind === 'order' && (
        <OrderCard
          key={step.id}
          prompt={step.prompt}
          words={step.words}
          answer={step.answer}
          coach={step.coach}
          onDone={(ok) => advance(ok, true)}
        />
      )}
      {step.kind === 'speak' && (
        <VoiceRepeat key={step.id} phrase={step.phrase} label={step.label} onNext={() => advance()} />
      )}
      {step.kind === 'dialogue' && <DialogueCard key={step.id} dlg={step.dlg} onNext={() => advance()} />}
      {step.kind === 'visual-scene' && (
        <VisualSceneCard key={step.id} scene={step.scene} first={step.first} onNext={() => advance()} />
      )}
      {step.kind === 'summary' && <Summary onNext={() => advance()} />}
      {step.kind === 'final-vocab' && <FinalVocab onNext={() => advance()} />}
    </Shell>
  );
};

// ── Carcasa común (top bar + progreso) ───────────────────────────────────────
const Shell: React.FC<{
  onExit: () => void;
  progressPct?: number;
  counter?: string;
  hideTop?: boolean;
  children: React.ReactNode;
}> = ({ onExit, progressPct, counter, hideTop, children }) => (
  <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
    {hideTop ? (
      <div className="flex items-center gap-3 px-5 pt-12 pb-2">
        <span className="text-gray-400 text-sm font-medium">Coach IA</span>
      </div>
    ) : (
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
          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progressPct ?? 0}%` }} />
          </div>
          <span className="text-gray-400 text-xs font-semibold tabular-nums">{counter}</span>
        </div>
      </div>
    )}
    <div className="px-6 flex-1 flex flex-col pb-8">{children}</div>
  </div>
);

// ── Botón primario reutilizable ──────────────────────────────────────────────
const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({
  onClick,
  children,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={
      disabled
        ? 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
        : 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
    }
  >
    {children}
  </button>
);

// ── Botón de audio ───────────────────────────────────────────────────────────
const AudioButton: React.FC<{ state: AudioState; onPlay: () => void; size?: 'sm' | 'lg' }> = ({
  state,
  onPlay,
  size = 'sm',
}) => {
  const big = size === 'lg';
  const label =
    state === 'loading' ? 'Cargando…' : state === 'error' ? 'Reintentar' : state === 'ready' ? 'Escuchar otra vez' : 'Escuchar';
  const icon = state === 'loading' ? '🔈' : state === 'error' ? '⚠️' : '🔊';
  if (big) {
    return (
      <button
        onClick={onPlay}
        disabled={state === 'loading'}
        className={
          state === 'error'
            ? 'w-28 h-28 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg transition-all'
            : 'w-28 h-28 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-70 text-white flex flex-col items-center justify-center shadow-lg transition-all'
        }
        aria-label="Reproducir audio"
      >
        <span className="text-4xl">{icon}</span>
        <span className="text-xs font-bold mt-1">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onPlay}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-70 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
    >
      {icon} {label}
    </button>
  );
};

// ── Bienvenida del Coach ─────────────────────────────────────────────────────
const Welcome: React.FC<{ userName?: string; onNext: () => void }> = ({ userName, onNext }) => {
  const name = userName?.trim();
  const greeting = name ? `Hola, ${name}.` : 'Hola.';
  return (
    <>
      <div className="pt-4 pb-6 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-lg">🎓</span>
          </div>
          <span className="text-emerald-700 font-bold text-sm">Coach IA</span>
        </div>
        <div className="bg-white rounded-3xl rounded-tl-md p-5 shadow-md border border-emerald-100">
          <p className="text-gray-800 text-lg leading-relaxed">
            {greeting} Hoy aprenderás a usar <span className="font-bold">am</span>,{' '}
            <span className="font-bold">is</span> y <span className="font-bold">are</span>. Al terminar, podrás
            decir quién eres, cómo estás y describir personas, cosas y situaciones sencillas.
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <PrimaryButton onClick={onNext}>Empezar</PrimaryButton>
      </div>
    </>
  );
};

// ── Cuadro visual am / is / are ──────────────────────────────────────────────
const Overview: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <>
    <div className="pt-2 pb-4 flex-1">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">El verbo to be</h1>
      <p className="text-gray-500 text-sm mb-5">Tres formas según quién hace la acción:</p>
      <div className="flex flex-col gap-3">
        {TO_BE_GROUPS.map((g) => {
          const s = FORM_STYLE[g.verb];
          return (
            <div key={g.verb} className={`rounded-2xl border ${s.soft} p-4 flex items-center gap-4`}>
              <span className={`text-2xl font-extrabold ${s.accent} w-16 text-center`}>{g.verb}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-bold">{g.pronouns}</p>
                <p className="text-gray-500 text-sm">Ejemplo: {g.example}</p>
              </div>
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${s.chip}`}>to be</span>
            </div>
          );
        })}
      </div>
    </div>
    <div className="mt-auto">
      <PrimaryButton onClick={onNext}>Continuar</PrimaryButton>
    </div>
  </>
);

// ── Tarjeta de frase (enseñanza) ─────────────────────────────────────────────
const PhraseCard: React.FC<{
  step: Extract<ToBeStep, { kind: 'phrase' }>;
  onNext: () => void;
}> = ({ step, onNext }) => {
  const { phrase, blockIntro, blockTitle } = step;
  const audio = useAudio();
  const s = FORM_STYLE[phrase.form];

  // Reproduce la frase al entrar en la tarjeta.
  useEffect(() => {
    void audio.play(phrase.en);
    return () => audio.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase.id]);

  return (
    <>
      <div className="pt-2 pb-4 flex-1">
        {blockTitle && (
          <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 ${s.chip}`}>
            {blockTitle}
          </span>
        )}
        {blockIntro && (
          <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-emerald-100 mb-4 flex items-start gap-2">
            <span className="text-base">🎓</span>
            <p className="text-gray-700 text-sm leading-relaxed">{blockIntro}</p>
          </div>
        )}

        {/* Figura / escena + frase + traducción + pronunciación */}
        <div className={`bg-white rounded-3xl p-6 shadow-md border ${s.ring} mb-4 text-center`}>
          <div className="text-6xl mb-3">{phrase.icon}</div>
          <p className="text-3xl font-extrabold text-gray-900 leading-tight mb-1">{phrase.en}</p>
          <p className="text-gray-500 text-lg mb-1">{phrase.es}</p>
          <p className={`text-sm font-semibold mb-3 ${s.accent}`}>Cómo decirlo: {phrase.pron}</p>
          <AudioButton state={audio.state} onPlay={() => void audio.play(phrase.en)} />
        </div>

        {/* Explicación breve del Coach */}
        <div className={`rounded-2xl border ${s.soft} p-4`}>
          <p className="text-gray-700 text-sm leading-relaxed">
            <span className="font-bold">🎓 Coach:</span> {phrase.coach}
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <PrimaryButton onClick={onNext}>Continuar</PrimaryButton>
      </div>
    </>
  );
};

// ── Tarjeta de ejercicio de opciones ─────────────────────────────────────────
const VisualSceneCard: React.FC<{
  scene: ToBeVisualScene;
  first: boolean;
  onNext: () => void;
}> = ({ scene, first, onNext }) => {
  const visual = getVisual(scene.visualId);
  const audio = useAudio();
  const s = FORM_STYLE[scene.form];

  useEffect(() => {
    void audio.play(scene.en);
    return () => audio.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);

  return (
    <>
      <div className="pt-2 pb-4 flex-1">
        {first && (
          <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-emerald-100 mb-4">
            <p className="text-gray-900 font-extrabold mb-1">Ahora úsalo en situaciones reales</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Mira la escena y conecta directamente a la persona con am, is o are.
            </p>
          </div>
        )}

        <div className={`bg-white rounded-3xl p-4 shadow-md border ${s.ring} mb-4 text-center`}>
          <img
            src={visual.src}
            alt={visual.alt}
            onError={(event) => handleVisualError(event, visual)}
            className="w-full max-h-[22rem] object-contain mx-auto rounded-2xl bg-emerald-50 mb-4"
          />
          <p className="text-3xl font-extrabold text-gray-900 leading-tight mb-1">{scene.en}</p>
          <p className="text-gray-500 text-lg mb-1">{scene.es}</p>
          <p className={`text-sm font-semibold mb-3 ${s.accent}`}>Cómo decirlo: {scene.pron}</p>
          <AudioButton state={audio.state} onPlay={() => void audio.play(scene.en)} />
        </div>
      </div>
      <div className="mt-auto">
        <PrimaryButton onClick={onNext}>Continuar</PrimaryButton>
      </div>
    </>
  );
};

const ExerciseCard: React.FC<{ ex: OptionExercise; onDone: (correct: boolean) => void }> = ({ ex, onDone }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<'answer' | 'wrong' | 'right'>('answer');
  const [attempts, setAttempts] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(true);
  const audio = useAudio();
  const needsAudio = !!ex.audioText;

  // Reproduce automáticamente en ejercicios de oído.
  useEffect(() => {
    if (needsAudio && ex.audioText) void audio.play(ex.audioText);
    return () => audio.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = () => {
    if (selected === null) return;
    if (needsAudio && audio.state !== 'ready') return;
    if (selected === ex.answer) {
      setStage('right');
    } else {
      if (attempts === 0) setFirstTryCorrect(false);
      setAttempts((a) => a + 1);
      setStage('wrong');
    }
  };

  const retry = () => {
    setSelected(null);
    setStage('answer');
  };

  const canCheck = selected !== null && (!needsAudio || audio.state === 'ready');

  return (
    <>
      <div className="pt-2 pb-4 flex-1 flex flex-col">
        <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-4">{ex.prompt}</h2>

        {needsAudio && (
          <div className="flex flex-col items-center mb-5">
            <AudioButton size="lg" state={audio.state} onPlay={() => void audio.play(ex.audioText!)} />
            {audio.state === 'idle' && <p className="text-gray-400 text-xs mt-3">Escucha el audio para responder.</p>}
            {audio.state === 'error' && (
              <p className="text-red-600 text-sm font-medium mt-3 text-center">No se pudo reproducir. Toca para reintentar.</p>
            )}
          </div>
        )}

        {ex.sentence && !needsAudio && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{ex.sentence}</p>
          </div>
        )}

        {/* Opciones */}
        {stage !== 'right' && (
          <div className={ex.figures ? 'grid grid-cols-2 gap-3 mb-4' : 'flex flex-col gap-3 mb-4'}>
            {ex.options.map((opt) => {
              const isSel = selected === opt;
              const base = ex.figures
                ? 'rounded-2xl border-2 py-6 text-5xl flex items-center justify-center transition-all'
                : 'w-full text-left border-2 rounded-2xl px-4 py-3.5 font-semibold transition-all';
              const cls = isSel ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-white border-gray-200 text-gray-800';
              return (
                <button key={opt} onClick={() => setSelected(opt)} className={`${base} ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback de acierto */}
        {stage === 'right' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
            <p className="text-emerald-700 font-bold">¡Correcto! 🎉</p>
          </div>
        )}

        {/* Feedback de error: explicación del Coach + ejemplo distinto */}
        {stage === 'wrong' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🎓</span>
              <span className="text-amber-800 font-bold text-sm">Coach IA</span>
            </div>
            <p className="text-amber-800 text-sm leading-relaxed">{ex.coach}</p>
            {ex.example && (
              <p className="text-amber-700 text-sm mt-2">
                Ejemplo: <span className="font-semibold">{ex.example}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {stage === 'answer' && (
          <PrimaryButton onClick={check} disabled={!canCheck}>
            {needsAudio && audio.state !== 'ready' ? 'Escucha el audio primero' : 'Comprobar'}
          </PrimaryButton>
        )}
        {stage === 'wrong' && (
          <button
            onClick={retry}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Intentar de nuevo
          </button>
        )}
        {stage === 'right' && <PrimaryButton onClick={() => onDone(firstTryCorrect)}>Continuar</PrimaryButton>}
      </div>
    </>
  );
};

// ── Ordenar palabras ─────────────────────────────────────────────────────────
const OrderCard: React.FC<{
  prompt: string;
  words: string[];
  answer: string;
  coach: string;
  onDone: (correct: boolean) => void;
}> = ({ prompt, words, answer, coach, onDone }) => {
  const bank = useMemo(() => shuffle(words.map((w, i) => ({ id: `${w}-${i}`, text: w }))), [words]);
  const [built, setBuilt] = useState<{ id: string; text: string }[]>([]);
  const [checked, setChecked] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(true);

  const remaining = bank.filter((b) => !built.some((x) => x.id === b.id));
  const builtText = built.map((b) => b.text).join(' ');
  const isCorrect = builtText === answer;

  return (
    <>
      <div className="pt-2 pb-4 flex-1 flex flex-col">
        <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-5">{prompt}</h2>

        <div className="min-h-[64px] bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-3 flex flex-wrap gap-2 mb-4">
          {built.length === 0 && <span className="text-gray-300 text-sm self-center px-2">Toca las palabras en orden…</span>}
          {built.map((p) => (
            <button
              key={p.id}
              disabled={checked}
              onClick={() => setBuilt((prev) => prev.filter((b) => b.id !== p.id))}
              className="bg-emerald-100 text-emerald-800 font-bold px-3 py-2 rounded-xl"
            >
              {p.text}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {remaining.map((p) => (
            <button
              key={p.id}
              disabled={checked}
              onClick={() => setBuilt((prev) => [...prev, p])}
              className="bg-white border border-gray-200 text-gray-800 font-bold px-3 py-2 rounded-xl shadow-sm hover:border-emerald-300 active:scale-95 transition-all"
            >
              {p.text}
            </button>
          ))}
        </div>

        {checked && (
          <div
            className={
              isCorrect
                ? 'bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4'
                : 'bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4'
            }
          >
            <p className={isCorrect ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold mb-1'}>
              {isCorrect ? '¡Correcto! 🎉' : 'Casi…'}
            </p>
            {!isCorrect && (
              <>
                <p className="text-amber-800 text-sm">🎓 {coach}</p>
                <p className="text-amber-700 text-sm mt-1">
                  Respuesta: <span className="font-semibold">{answer}</span>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {!checked ? (
          <PrimaryButton onClick={() => setChecked(true)} disabled={built.length !== words.length}>
            Comprobar
          </PrimaryButton>
        ) : isCorrect ? (
          <PrimaryButton onClick={() => onDone(firstTryCorrect)}>Continuar</PrimaryButton>
        ) : (
          <button
            onClick={() => {
              setFirstTryCorrect(false);
              setBuilt([]);
              setChecked(false);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </>
  );
};

// ── Mini diálogo (2 líneas, con traducción y pronunciación) ──────────────────
const DialogueCard: React.FC<{ dlg: BeDialogue; onNext: () => void }> = ({ dlg, onNext }) => {
  const audio = useAudio();
  return (
    <>
      <div className="pt-2 pb-4 flex-1">
        <span className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3 bg-emerald-100 text-emerald-700">
          Mini diálogo
        </span>

        {/* Línea A */}
        <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-gray-100 mb-3">
          <p className="text-gray-400 text-xs font-bold mb-1">A</p>
          <p className="text-xl font-extrabold text-gray-900">{dlg.aEn}</p>
          <p className="text-gray-500">{dlg.aEs}</p>
          <div className="flex items-center justify-between gap-3 mt-2">
            <p className="text-emerald-700 text-sm font-semibold">🗣️ {dlg.aPron}</p>
            <button
              onClick={() => void audio.play(dlg.aEn)}
              disabled={audio.state === 'loading'}
              className="shrink-0 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl active:scale-95 disabled:opacity-60"
            >
              Escuchar A
            </button>
          </div>
        </div>

        {/* Línea B */}
        <div className="bg-emerald-50 rounded-2xl rounded-tr-md p-4 shadow-sm border border-emerald-100 ml-6">
          <p className="text-emerald-600 text-xs font-bold mb-1">B</p>
          <p className="text-xl font-extrabold text-gray-900">{dlg.bEn}</p>
          <p className="text-gray-500">{dlg.bEs}</p>
          <div className="flex items-center justify-between gap-3 mt-2">
            <p className="text-emerald-700 text-sm font-semibold">🗣️ {dlg.bPron}</p>
            <button
              onClick={() => void audio.play(dlg.bEn)}
              disabled={audio.state === 'loading'}
              className="shrink-0 bg-white border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl active:scale-95 disabled:opacity-60"
            >
              Escuchar B
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mt-5">
          <p className="text-gray-400 text-xs font-semibold mb-2">Escucha el dialogo completo</p>
          <AudioButton
            state={audio.state}
            onPlay={async () => {
              await audio.play(dlg.aEn);
              await audio.play(dlg.bEn);
            }}
          />
        </div>
      </div>
      <div className="mt-auto">
        <PrimaryButton onClick={onNext}>Continuar</PrimaryButton>
      </div>
    </>
  );
};

// ── Resumen final ────────────────────────────────────────────────────────────
const Summary: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <>
    <div className="pt-2 pb-4 flex-1">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Resumen</h1>
      <p className="text-gray-500 text-sm mb-5">Recuerda estas tres combinaciones:</p>
      <div className="flex flex-col gap-3">
        {TO_BE_GROUPS.map((g) => {
          const s = FORM_STYLE[g.verb];
          return (
            <div key={g.verb} className={`rounded-2xl border ${s.soft} p-4 flex items-center gap-3`}>
              <span className="text-gray-900 font-bold flex-1">{g.pronouns}</span>
              <span className="text-gray-400">→</span>
              <span className={`text-xl font-extrabold ${s.accent}`}>{g.verb}</span>
            </div>
          );
        })}
      </div>
      <p className="text-gray-500 text-sm mt-5">Ahora un repaso rápido antes de terminar.</p>
    </div>
    <div className="mt-auto">
      <PrimaryButton onClick={onNext}>Empezar repaso</PrimaryButton>
    </div>
  </>
);

// ── Repetición con voz (reutiliza transcribeAudio + MediaRecorder) ───────────
const FinalVocab: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <>
    <div className="pt-2 pb-4 flex-1">
      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
        Alto: antes de practicar
      </p>
      <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
        Primero revisa esto
      </h1>
      <div className="bg-emerald-600 rounded-3xl p-5 mb-5 shadow-md">
        <p className="text-white text-xl font-extrabold leading-snug">
          Estas piezas son tu mapa para hablar sin bloquearte.
        </p>
        <p className="text-emerald-50 text-base font-semibold leading-relaxed mt-3">
          Lee en voz baja, escucha mentalmente y luego habla frase por frase. No estas adivinando: estas construyendo tu historia real.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
        <p className="text-amber-900 text-lg font-extrabold leading-snug">
          Recomendacion del Coach
        </p>
        <p className="text-amber-800 text-sm font-bold leading-relaxed mt-2">
          No saltes esta parte. Aqui aparecen las palabras que usaras en la practica y en la Mision Final.
        </p>
      </div>

      <h2 className="text-gray-900 text-xl font-extrabold mb-3">Palabras que veras</h2>
      <div className="flex flex-col gap-3">
        {TO_BE_FINAL_VOCABULARY.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gray-950 text-2xl font-extrabold leading-tight break-words">{item.en}</p>
                <p className="text-gray-700 text-base font-bold leading-snug mt-1">{item.es}</p>
              </div>
              <span className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full">
                vocab
              </span>
            </div>
            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <p className="text-emerald-900 text-sm font-extrabold leading-snug">
                Se dice: <span className="text-base">{item.pronunciation}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-gray-900 text-xl font-extrabold mt-6 mb-3">Conectores que usaras</h2>
      <div className="flex flex-col gap-3">
        {TO_BE_CONNECTOR_CHUNKS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-gray-950 text-2xl font-extrabold leading-tight break-words">{item.en}</p>
                <p className="text-gray-700 text-base font-bold leading-snug mt-1">{item.es}</p>
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                {item.en.startsWith('at') ? 'at' : item.en.startsWith('in') ? 'in' : item.en.startsWith('a ') ? 'a' : 'chunk'}
              </span>
            </div>
            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <p className="text-emerald-900 text-sm font-extrabold leading-snug">
                Se dice: <span className="text-base">{item.pronunciation}</span>
              </p>
            </div>
            <p className="text-gray-600 text-sm font-semibold leading-snug mt-2">{item.note}</p>
          </div>
        ))}
      </div>

      <h2 className="text-gray-900 text-xl font-extrabold mt-6 mb-3">Piezas utiles</h2>
      <div className="flex flex-col gap-3">
        {TO_BE_USEFUL_CHUNKS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-950 text-xl font-extrabold leading-tight break-words">{item.en}</p>
            <p className="text-gray-700 text-base font-bold leading-snug mt-1">{item.es}</p>
            <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <p className="text-emerald-900 text-sm font-extrabold leading-snug">
                Se dice: <span className="text-base">{item.pronunciation}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-auto">
      <PrimaryButton onClick={onNext}>Estoy listo para practicar</PrimaryButton>
    </div>
  </>
);

type MicState = 'idle' | 'requesting' | 'recording' | 'transcribing';

const VoiceRepeat: React.FC<{ phrase: BePhrase; label: string; onNext: () => void }> = ({ phrase, label, onNext }) => {
  const audio = useAudio();
  const [mic, setMic] = useState<MicState>('idle');
  const [verdict, setVerdict] = useState<VoiceVerdict | null>(null);
  const [micBlocked, setMicBlocked] = useState(false);
  const [heardText, setHeardText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const browserTranscriptRef = useRef('');
  const mountedRef = useRef(true);

  useEffect(() => {
    void audio.play(phrase.en);
    return () => {
      audio.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrase.id]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      recognitionRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      recognitionRef.current = null;
      streamRef.current = null;
    };
  }, []);

  const startBrowserRecognition = () => {
    if (!shouldUseBrowserSpeechFallback()) return;
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

  const startRecording = async () => {
    stopSpeech();
    setVerdict(null);
    setHeardText('');
    chunksRef.current = [];
    browserTranscriptRef.current = '';
    stopBrowserRecognition();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicBlocked(true);
      return;
    }
    setMic('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType =
        ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'].find((t) =>
          MediaRecorder.isTypeSupported(t),
        ) ?? '';
      const mr = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start();
      intervalRef.current = setInterval(() => {
        if (mr.state === 'recording') mr.requestData();
      }, 500);
      startBrowserRecognition();
      setMic('recording');
    } catch {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setMicBlocked(true);
      setMic('idle');
    }
  };

  const stopRecording = async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopBrowserRecognition();
    setMic('transcribing');
    await new Promise<void>((resolve) => {
      mr.addEventListener('stop', () => resolve(), { once: true });
      mr.stop();
    });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;

    const chunks = chunksRef.current;
    if (chunks.length === 0) {
      if (mountedRef.current) {
        setVerdict({ kind: 'none' });
        setMic('idle');
      }
      return;
    }
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
    try {
      let transcript = await transcribeAudio(blob);
      if (!transcript.trim() && browserTranscriptRef.current.trim()) {
        transcript = browserTranscriptRef.current;
      }
      if (!mountedRef.current) return;
      setHeardText(transcript.trim());
      setVerdict(evaluatePhrase(transcript, phrase.en));
    } catch {
      if (mountedRef.current && browserTranscriptRef.current.trim()) {
        setHeardText(browserTranscriptRef.current.trim());
        setVerdict(evaluatePhrase(browserTranscriptRef.current, phrase.en));
      } else if (mountedRef.current) {
        setVerdict({ kind: 'none' });
      }
    } finally {
      if (mountedRef.current) setMic('idle');
    }
  };

  const handleMic = () => {
    if (mic === 'recording') void stopRecording();
    else if (mic === 'idle') void startRecording();
  };

  const recording = mic === 'recording';
  const processing = mic === 'requesting' || mic === 'transcribing';
  const micLabel = recording ? 'Detener' : processing ? 'Escuchando…' : 'Repite con tu voz';

  return (
    <>
      <div className="pt-2 pb-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Práctica oral</p>
        <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-4">{label}</h2>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-5 text-center">
          <div className="text-5xl mb-2">{phrase.icon}</div>
          <p className="text-3xl font-extrabold text-gray-900 mb-1">{phrase.en}</p>
          <p className="text-gray-500 mb-1">{phrase.es}</p>
          <p className="text-emerald-700 text-sm font-semibold mb-3">{phrase.pron}</p>
          <AudioButton state={audio.state} onPlay={() => void audio.play(phrase.en)} />
        </div>

        {/* Feedback de voz */}
        {verdict?.kind === 'got' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
            <p className="text-emerald-700 font-bold">Te entendí. ✅</p>
          </div>
        )}
        {verdict?.kind === 'word' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 font-bold">Practica de nuevo la palabra "{verdict.word}".</p>
          </div>
        )}
        {verdict?.kind === 'almost' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 font-bold">Casi. Escucha otra vez y repite.</p>
          </div>
        )}
        {verdict?.kind === 'none' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-red-600 font-bold">No pude escucharte. Inténtalo de nuevo.</p>
          </div>
        )}
        {heardText && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-1">Escuche</p>
            <p className="text-gray-700 text-sm font-semibold leading-snug">"{heardText}"</p>
          </div>
        )}

        {micBlocked && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
            <p className="text-gray-600 text-sm leading-snug">
              No pudimos usar el micrófono. Puedes continuar; practicarás la voz más adelante.
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={handleMic}
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
        {verdict?.kind === 'got' ? (
          <PrimaryButton onClick={onNext}>Continuar</PrimaryButton>
        ) : (
          <button
            onClick={onNext}
            className="w-full bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-2xl py-3 hover:bg-gray-50 transition-all"
          >
            Continuar
          </button>
        )}
      </div>
    </>
  );
};
