import React, { useEffect, useMemo, useState } from 'react';
import type { Lesson, LessonStatus, Piece, Step } from '../types';
import { PronounsPractice } from './PronounsPractice';
import { ToBePractice } from './ToBePractice';
import { SpeakPractice } from './SpeakPractice';
import { PRONOUNS_INFO, type PronounInfo } from '../data/curriculum';

interface CoachLessonScreenProps {
  lesson: Lesson;
  /** Apodo del usuario (para la bienvenida del Coach). Solo si existe. */
  userName?: string;
  /** Paso por el que se debe reanudar (si se sale y vuelve). */
  initialStepId?: string;
  onBack: () => void;
  /** Persiste el paso exacto actual (capa de avance). */
  onStepChange: (stepId: string) => void;
  /** Marca el estado de la lección (in-progress al iniciar, completed al terminar). */
  onStatus: (
    status: LessonStatus,
    extra?: { lastStepId?: string; lastScore?: number; oralPending?: boolean },
  ) => void;
  /** Terminar la lección y volver (al panel / unidades). */
  onFinish: () => void;
  isReview?: boolean;
}

/**
 * Motor de lección local (Fase 2B): contenido visual + ejercicios resueltos en
 * el navegador (0 API). Sin voz ni figuras todavía.
 * Renderiza los pasos uno a uno y guarda el paso exacto donde queda el usuario.
 */
export const CoachLessonScreen: React.FC<CoachLessonScreenProps> = ({
  lesson,
  userName,
  initialStepId,
  onBack,
  onStepChange,
  onStatus,
  onFinish,
  isReview = false,
}) => {
  const steps = lesson.steps;

  // Índice inicial: reanuda en el paso guardado si existe.
  const initialIndex = useMemo(() => {
    if (!initialStepId) return 0;
    const i = steps.findIndex((s) => s.id === initialStepId);
    return i >= 0 ? i : 0;
  }, [initialStepId, steps]);

  const [index, setIndex] = useState(initialIndex);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // Si el usuario completa una práctica oral en modo silencioso, la unidad
  // queda con "práctica oral pendiente" hasta el cierre de la lección.
  const [oralPending, setOralPending] = useState(false);

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const progressPct = Math.round(((index + (finished ? 1 : 0)) / steps.length) * 100);

  // Al montar: marca la lección como en progreso.
  useEffect(() => {
    if (isReview) return;
    onStatus('in-progress', { lastStepId: steps[initialIndex]?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persiste el paso exacto cada vez que cambia (mientras no esté terminada).
  // Las pantallas autónomas (toBe) gestionan su propia persistencia de paso.
  useEffect(() => {
    if (!finished && step && !step.toBe) onStepChange(step.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished]);

  // ── Estado de ejercicio (por paso) ──
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [built, setBuilt] = useState<Piece[]>([]);

  // Reinicia el estado del ejercicio al cambiar de paso.
  useEffect(() => {
    setSelected(null);
    setChecked(false);
    setBuilt([]);
  }, [index]);

  // Unidad 1 (Pronombres): usa el flujo nuevo completo, no los pasos antiguos.
  if (lesson.title.toLowerCase().includes('pronombres')) {
    const finalStepId = steps.find((s) => s.practice)?.id ?? steps[steps.length - 1]?.id;
    return (
      <PronounsPractice
        onExit={onBack}
        onUnitComplete={(score) =>
          onStatus('completed', { lastStepId: finalStepId, lastScore: score, oralPending })
        }
        onBackToMap={onFinish}
      />
    );
  }

  const goNext = (wasCorrect: boolean) => {
    if (wasCorrect) setCorrectCount((c) => c + 1);
    if (isLast) {
      const score = Math.round(
        ((wasCorrect ? correctCount + 1 : correctCount) /
          steps.filter((s) => s.type === 'exercise').length || 1) * 100,
      );
      setFinished(true);
      onStatus('completed', { lastStepId: step.id, lastScore: isNaN(score) ? 100 : score });
    } else {
      setIndex((i) => i + 1);
    }
  };

  // ── Práctica oral (paso `speak`): repetir pronombres con la voz ──
  // Reutiliza el reconocimiento de voz existente (Whisper) vía SpeakPractice.
  // El modo silencioso permite completar la unidad dejando la práctica oral
  // pendiente (se persiste como oralPending en el progreso de la lección).
  if (step?.type === 'speak') {
    const speakPronouns = resolveSpeakPronouns(step);
    return (
      <SpeakPractice
        pronouns={speakPronouns}
        title={step.title}
        intro={step.note}
        onExit={onBack}
        onComplete={() => goNext(true)}
        onSilent={() => {
          setOralPending(true);
          onStatus('in-progress', { lastStepId: step.id, oralPending: true });
          goNext(true);
        }}
      />
    );
  }

  // ── Práctica final de unidad (Pronombres): pantalla autónoma ──
  // El paso `practice` delega toda la interacción (cuadro resumen, ejercicios
  // mezclados, práctica de oído, lógica de error y pantalla final) al componente
  // PronounsPractice. Al completarse, marca la lección y vuelve al mapa.
  if (step?.practice) {
    return (
      <PronounsPractice
        onExit={onBack}
        onUnitComplete={(score) =>
          onStatus('completed', { lastStepId: step.id, lastScore: score, oralPending })
        }
        onBackToMap={onFinish}
      />
    );
  }

  // ── Unidad 2 (Verbo to be): pantalla autónoma ──
  // El paso `toBe` delega toda la interacción (bienvenida, cuadro am/is/are,
  // bloques, ejercicios, práctica oral, diálogos, repaso y cierre) al componente
  // ToBePractice, que además gestiona su propia persistencia de paso exacto.
  if (step?.toBe) {
    return (
      <ToBePractice
        userName={userName}
        initialStepId={initialStepId}
        onExit={onBack}
        onStepChange={onStepChange}
        onComplete={(score) =>
          onStatus('completed', { lastStepId: step.id, lastScore: score })
        }
        onBackToMap={onFinish}
      />
    );
  }

  // ── Vista de finalización ──
  if (finished) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="flex items-center gap-3 px-5 pt-12 pb-2">
          <span className="text-gray-400 text-sm font-medium">Coach IA</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">¡Lección completada!</h1>
          <p className="text-gray-500 leading-relaxed mb-2">
            Ya practicaste:
          </p>
          <p className="text-emerald-700 text-xl font-bold mb-1">"{lesson.goalPhrase}"</p>
          <p className="text-gray-400 mb-8">{lesson.goalSpanish}</p>
        </div>
        <div className="px-5 pb-8">
          <button
            onClick={onFinish}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Volver a mi progreso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* Top bar + barra de progreso */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Salir de la lección"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-gray-400 text-xs font-semibold tabular-nums">
            {index + 1}/{steps.length}
          </span>
        </div>
      </div>

      {/* Contenido del paso */}
      <div className="px-6 flex-1 flex flex-col">
        {step.coachIntro
          ? renderCoachIntro(userName, () => goNext(true), isLast)
          : renderStep(step, {
              selected,
              setSelected,
              checked,
              setChecked,
              built,
              setBuilt,
              onContinue: goNext,
              isLast,
            })}
      </div>
    </div>
  );
};

// ── Resolución de pronombres para un paso de práctica oral ───────────────────
// Si el paso pide N al azar, mezcla y toma N; si no, mapea los ids indicados.
function resolveSpeakPronouns(step: Step): PronounInfo[] {
  if (step.speakRandomCount && step.speakRandomCount > 0) {
    const shuffled = [...PRONOUNS_INFO];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, step.speakRandomCount);
  }
  const ids = step.speakPronounIds ?? [];
  return ids
    .map((id) => PRONOUNS_INFO.find((p) => p.id === id))
    .filter((p): p is PronounInfo => Boolean(p));
}

// ── Render por tipo de paso ──────────────────────────────────────────────────

interface StepCtx {
  selected: string | null;
  setSelected: (v: string | null) => void;
  checked: boolean;
  setChecked: (v: boolean) => void;
  built: Piece[];
  setBuilt: React.Dispatch<React.SetStateAction<Piece[]>>;
  onContinue: (wasCorrect: boolean) => void;
  isLast: boolean;
}

function renderStep(step: Step, ctx: StepCtx) {
  if (step.type === 'exercise' && step.exercise) {
    return renderExercise(step, ctx);
  }
  return renderTeach(step, ctx);
}

// Bienvenida del Coach IA: saludo amable, claro y motivador. Usa el nombre solo
// si existe; si no, empieza con "Hola.".
function renderCoachIntro(userName: string | undefined, onContinue: () => void, isLast: boolean) {
  const intro =
    "Hoy aprenderás cómo decir 'yo', 'tú', 'él', 'ella', 'nosotros', 'ellos' y cómo hablar de cosas o animales en inglés. Al terminar, podrás identificar quién realiza la acción y empezar a formar tus primeras frases.";
  const name = userName?.trim();
  const greeting = name ? `Hola, ${name}. ${intro}` : `Hola. ${intro}`;

  return (
    <>
      <div className="pt-4 pb-6 flex-1">
        {/* Identidad: intervención del Coach IA */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-lg">🎓</span>
          </div>
          <span className="text-emerald-700 font-bold text-sm">Coach IA</span>
        </div>

        {/* Burbuja de mensaje del Coach */}
        <div className="bg-white rounded-3xl rounded-tl-md p-5 shadow-md border border-emerald-100 mb-4">
          <p className="text-gray-800 text-lg leading-relaxed">{greeting}</p>
        </div>

        {/* Aclaración breve sobre "it" */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-emerald-800 text-sm leading-relaxed">
            Para hablar de una cosa, un objeto o un animal usamos{' '}
            <span className="font-bold">it</span>.
          </p>
        </div>
      </div>

      <div className="pb-8">
        <button
          onClick={onContinue}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
        >
          {isLast ? 'Terminar' : 'Empezar'}
        </button>
      </div>
    </>
  );
}

// Pasos de enseñanza (teach / listen sin audio en esta fase)
function renderTeach(step: Step, ctx: StepCtx) {
  return (
    <>
      <div className="pt-4 pb-6 flex-1">
        {step.title && (
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
            {step.title}
          </p>
        )}

        {/* Icono solo (pasos sin frase, p.ej. introducción) */}
        {!step.english && step.icon && (
          <div className="text-center mb-4">
            <span className="text-6xl">{step.icon}</span>
          </div>
        )}

        {/* Frase / palabra objetivo (con icono y figura simple) */}
        {step.english && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-4 text-center">
            {step.icon && <div className="text-5xl mb-3">{step.icon}</div>}
            <p className="text-3xl font-extrabold text-gray-900 leading-tight mb-1">
              {step.english}
            </p>
            {step.spanish && <p className="text-gray-500 text-lg mb-3">{step.spanish}</p>}
            {step.pronunciation && (
              <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                🔊 {step.pronunciation}
              </span>
            )}
          </div>
        )}

        {/* Desglose pieza por pieza */}
        {step.pieces && step.pieces.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-4">
            {step.pieces.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <span className="text-gray-900 text-lg font-bold">{p.text}</span>
                  <span className="text-gray-400 text-sm ml-2">/ {p.pronunciation}</span>
                </div>
                <span className="text-gray-500 font-medium">{p.meaning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Nota */}
        {step.note && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-amber-800 text-sm leading-relaxed">💡 {step.note}</p>
          </div>
        )}
      </div>

      <div className="pb-8">
        <button
          onClick={() => ctx.onContinue(true)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
        >
          {ctx.isLast ? 'Terminar' : 'Continuar'}
        </button>
      </div>
    </>
  );
}

// Pasos de ejercicio (multiple-choice / fill-blank / word-order)
function renderExercise(step: Step, ctx: StepCtx) {
  const ex = step.exercise!;
  const { selected, setSelected, checked, setChecked, built, setBuilt, onContinue, isLast } = ctx;

  // ── word-order ──
  if (ex.type === 'word-order' && ex.pieces) {
    const remaining = ex.pieces.filter((p) => !built.some((b) => b.id === p.id));
    const builtText = built.map((b) => b.text).join(' ');
    const isCorrect = builtText === ex.answer;

    return (
      <ExerciseShell prompt={ex.prompt}>
        {/* Zona construida */}
        <div className="min-h-[64px] bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-3 flex flex-wrap gap-2 mb-4">
          {built.length === 0 && (
            <span className="text-gray-300 text-sm self-center px-2">Toca las palabras en orden…</span>
          )}
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

        {/* Banco de piezas */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        <ExerciseFeedback show={checked} correct={isCorrect} answer={ex.answer} hint={ex.hint} />

        <ExerciseActions
          canCheck={built.length === ex.pieces.length}
          checked={checked}
          correct={isCorrect}
          isLast={isLast}
          onCheck={() => setChecked(true)}
          onContinue={() => onContinue(isCorrect)}
          onRetry={() => { setBuilt([]); setChecked(false); }}
        />
      </ExerciseShell>
    );
  }

  // ── fill-blank ── (con opciones)
  if (ex.type === 'fill-blank') {
    const isCorrect = selected === ex.answer;
    const sentenceParts = (ex.blankSentence ?? '').split('___');
    return (
      <ExerciseShell prompt={ex.prompt}>
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-5">
          <p className="text-xl font-bold text-gray-900 leading-relaxed text-center">
            {sentenceParts[0]}
            <span className="inline-block min-w-[64px] border-b-2 border-emerald-400 mx-1 text-emerald-600">
              {selected ?? ' '}
            </span>
            {sentenceParts[1]}
          </p>
        </div>
        <OptionGrid
          options={ex.options ?? []}
          selected={selected}
          answer={ex.answer}
          checked={checked}
          onSelect={setSelected}
        />
        <ExerciseFeedback show={checked} correct={isCorrect} answer={ex.answer} hint={ex.hint} />
        <ExerciseActions
          canCheck={selected !== null}
          checked={checked}
          correct={isCorrect}
          isLast={isLast}
          onCheck={() => setChecked(true)}
          onContinue={() => onContinue(isCorrect)}
          onRetry={() => { setSelected(null); setChecked(false); }}
        />
      </ExerciseShell>
    );
  }

  // ── multiple-choice (por defecto) ──
  const isCorrect = selected === ex.answer;
  return (
    <ExerciseShell prompt={ex.prompt}>
      <div className="mb-2" />
      <OptionGrid
        options={ex.options ?? []}
        selected={selected}
        answer={ex.answer}
        checked={checked}
        onSelect={setSelected}
      />
      <ExerciseFeedback show={checked} correct={isCorrect} answer={ex.answer} hint={ex.hint} />
      <ExerciseActions
        canCheck={selected !== null}
        checked={checked}
        correct={isCorrect}
        isLast={isLast}
        onCheck={() => setChecked(true)}
        onContinue={() => onContinue(isCorrect)}
        onRetry={() => { setSelected(null); setChecked(false); }}
      />
    </ExerciseShell>
  );
}

// ── Subcomponentes de UI de ejercicio ────────────────────────────────────────

const ExerciseShell: React.FC<{ prompt: string; children: React.ReactNode }> = ({ prompt, children }) => (
  <div className="pt-4 pb-8 flex-1 flex flex-col">
    <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-5">{prompt}</h2>
    <div className="flex-1 flex flex-col">{children}</div>
  </div>
);

const OptionGrid: React.FC<{
  options: string[];
  selected: string | null;
  answer?: string;
  checked: boolean;
  onSelect: (v: string) => void;
}> = ({ options, selected, answer, checked, onSelect }) => (
  <div className="flex flex-col gap-3 mb-5">
    {options.map((opt) => {
      const isSel = selected === opt;
      const isAns = answer === opt;
      let cls = 'bg-white border-gray-200 text-gray-800';
      if (checked) {
        if (isAns) cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
        else if (isSel) cls = 'bg-red-50 border-red-300 text-red-700';
        else cls = 'bg-white border-gray-200 text-gray-400';
      } else if (isSel) {
        cls = 'bg-emerald-50 border-emerald-400 text-emerald-800';
      }
      return (
        <button
          key={opt}
          disabled={checked}
          onClick={() => onSelect(opt)}
          className={`w-full text-left border-2 rounded-2xl px-4 py-3.5 font-semibold transition-all ${cls}`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

const ExerciseFeedback: React.FC<{
  show: boolean;
  correct: boolean;
  answer?: string;
  hint?: string;
}> = ({ show, correct, answer, hint }) => {
  if (!show) return null;
  return (
    <div
      className={
        correct
          ? 'bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4'
          : 'bg-red-50 border border-red-200 rounded-2xl p-4 mb-4'
      }
    >
      <p className={correct ? 'text-emerald-700 font-bold mb-0.5' : 'text-red-600 font-bold mb-0.5'}>
        {correct ? '¡Correcto! 🎉' : 'Casi…'}
      </p>
      {!correct && answer && (
        <p className="text-gray-600 text-sm">
          Respuesta correcta: <span className="font-semibold">{answer}</span>
        </p>
      )}
      {!correct && hint && <p className="text-gray-500 text-sm mt-1">💡 {hint}</p>}
    </div>
  );
};

const ExerciseActions: React.FC<{
  canCheck: boolean;
  checked: boolean;
  correct: boolean;
  isLast: boolean;
  onCheck: () => void;
  onContinue: () => void;
  onRetry: () => void;
}> = ({ canCheck, checked, correct, isLast, onCheck, onContinue, onRetry }) => (
  <div className="mt-auto flex flex-col gap-3">
    {!checked ? (
      <button
        disabled={!canCheck}
        onClick={onCheck}
        className={
          canCheck
            ? 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
            : 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
        }
      >
        Comprobar
      </button>
    ) : (
      <>
        {!correct && (
          <button
            onClick={onRetry}
            className="w-full bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-2xl py-3 hover:bg-gray-50 transition-all"
          >
            Intentar de nuevo
          </button>
        )}
        <button
          onClick={onContinue}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
        >
          {isLast ? 'Terminar' : 'Continuar'}
        </button>
      </>
    )}
  </div>
);
