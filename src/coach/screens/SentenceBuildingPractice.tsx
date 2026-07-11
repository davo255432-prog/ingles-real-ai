import React, { useEffect, useMemo, useState } from 'react';
import { generateSpeech, prefetchSpeech, stopSpeech } from '../../services/speechApi';
import {
  COMMON_SENTENCE_ERRORS,
  CONTROLLED_DIALOGUES,
  GROWING_SENTENCES,
  GUIDED_CONSTRUCTIONS,
  PRE_CHALLENGE,
  SENTENCE_BUILDING_CLOSING,
  SENTENCE_BUILDING_CONNECTORS,
  SENTENCE_BUILDING_EXERCISES,
  SENTENCE_BUILDING_PATTERNS,
  SENTENCE_BUILDING_PREPOSITIONS,
  SENTENCE_BUILDING_PRONOUNS,
  SENTENCE_BUILDING_TO_BE,
  SENTENCE_BUILDING_UNIT_INTRO,
  SENTENCE_BUILDING_VERBS,
  SENTENCE_BUILDING_VOCABULARY,
  type CommonSentenceError,
  type ControlledDialogue,
  type GrowingSentence,
  type GuidedConstruction,
  type SentenceExercise,
  type SentencePattern,
} from '../data/sentenceBuildingPractice';

type SentenceStep =
  | { kind: 'intro' }
  | { kind: 'activation' }
  | { kind: 'pattern'; item: SentencePattern }
  | { kind: 'growing'; item: GrowingSentence }
  | { kind: 'error'; item: CommonSentenceError }
  | { kind: 'exercise'; item: SentenceExercise }
  | { kind: 'guided'; item: GuidedConstruction }
  | { kind: 'dialogue'; item: ControlledDialogue }
  | { kind: 'pre-challenge' }
  | { kind: 'complete' };

interface SentenceBuildingPracticeProps {
  onExit: () => void;
}

export const SentenceBuildingPractice: React.FC<SentenceBuildingPracticeProps> = ({ onExit }) => {
  const steps = useMemo<SentenceStep[]>(
    () => [
      { kind: 'intro' },
      { kind: 'activation' },
      ...SENTENCE_BUILDING_PATTERNS.map((item): SentenceStep => ({ kind: 'pattern', item })),
      ...GROWING_SENTENCES.map((item): SentenceStep => ({ kind: 'growing', item })),
      ...COMMON_SENTENCE_ERRORS.map((item): SentenceStep => ({ kind: 'error', item })),
      ...SENTENCE_BUILDING_EXERCISES.map((item): SentenceStep => ({ kind: 'exercise', item })),
      ...GUIDED_CONSTRUCTIONS.map((item): SentenceStep => ({ kind: 'guided', item })),
      ...CONTROLLED_DIALOGUES.map((item): SentenceStep => ({ kind: 'dialogue', item })),
      { kind: 'pre-challenge' },
      { kind: 'complete' },
    ],
    [],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    stopSpeech();
  }, [index]);

  useEffect(() => {
    const audioItems = [
      ...SENTENCE_BUILDING_PATTERNS.map((item) => item.audioText),
      ...GROWING_SENTENCES.flatMap((item) => item.steps.map((step) => step.audioText)),
      ...COMMON_SENTENCE_ERRORS.map((item) => item.audioText),
      ...SENTENCE_BUILDING_EXERCISES.flatMap((item) => (item.audioText ? [item.audioText] : [])),
      ...GUIDED_CONSTRUCTIONS.map((item) => item.audioText),
      ...CONTROLLED_DIALOGUES.flatMap((item) => [item.slowAudioText, item.normalAudioText]),
      ...PRE_CHALLENGE.examples.map((item) => item.audioText),
    ];
    audioItems.forEach((text) => void prefetchSpeech(text, 'normal'));
  }, []);

  const current = steps[index];
  const progress = Math.round(((index + 1) / steps.length) * 100);

  const next = () => setIndex((value) => Math.min(value + 1, steps.length - 1));
  const previous = () => {
    if (index === 0) {
      onExit();
      return;
    }
    setIndex((value) => value - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={previous}
            className="w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700"
            aria-label={index === 0 ? 'Salir de Unidad 4' : 'Paso anterior'}
          >
            <span aria-hidden="true" className="text-2xl leading-none">‹</span>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-extrabold uppercase text-emerald-700">Unidad 4 · Vista previa</span>
              <span className="text-xs font-bold text-gray-500">{index + 1}/{steps.length}</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-5 pb-10 max-w-xl mx-auto">
        {current.kind === 'intro' && <IntroStep onContinue={next} />}
        {current.kind === 'activation' && <ActivationStep onContinue={next} />}
        {current.kind === 'pattern' && <PatternStep pattern={current.item} onContinue={next} />}
        {current.kind === 'growing' && <GrowingStep sentence={current.item} onContinue={next} />}
        {current.kind === 'error' && <ErrorStep error={current.item} onContinue={next} />}
        {current.kind === 'exercise' && <ExerciseStep exercise={current.item} onContinue={next} />}
        {current.kind === 'guided' && <GuidedStep construction={current.item} onContinue={next} />}
        {current.kind === 'dialogue' && <DialogueStep dialogue={current.item} onContinue={next} />}
        {current.kind === 'pre-challenge' && <PreChallengeStep onContinue={next} />}
        {current.kind === 'complete' && <CompleteStep onExit={onExit} />}
      </main>
    </div>
  );
};

function IntroStep({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="pt-8 space-y-6">
      <div className="text-center space-y-3">
        <div className="mx-auto w-20 h-20 rounded-[28px] bg-emerald-100 border border-emerald-200 flex items-center justify-center text-4xl">
          🧩
        </div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-700">Unidad 4</p>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-950">
          {SENTENCE_BUILDING_UNIT_INTRO.title}
        </h1>
        <p className="text-xl font-bold text-slate-700">
          {SENTENCE_BUILDING_UNIT_INTRO.centralMessage}
        </p>
      </div>

      <div className="bg-white rounded-[28px] border border-emerald-100 shadow-sm p-5 space-y-4">
        <p className="text-sm font-extrabold uppercase text-emerald-700">En esta unidad vas a lograr</p>
        <div className="grid gap-3">
          {SENTENCE_BUILDING_UNIT_INTRO.visibleGoals.map((goal, itemIndex) => (
            <div key={goal} className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                {itemIndex + 1}
              </span>
              <span className="font-bold text-slate-900">{goal}</span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={onContinue}>Construir frases</PrimaryButton>
    </section>
  );
}

function ActivationStep({ onContinue }: { onContinue: () => void }) {
  const pieceGroups = [
    { title: 'Persona', items: SENTENCE_BUILDING_PRONOUNS.slice(0, 4), tone: 'sky' },
    { title: 'To Be', items: SENTENCE_BUILDING_TO_BE, tone: 'violet' },
    { title: 'Verbo', items: SENTENCE_BUILDING_VERBS, tone: 'emerald' },
    { title: 'Lugar', items: SENTENCE_BUILDING_PREPOSITIONS, tone: 'amber' },
    { title: 'Conector', items: SENTENCE_BUILDING_CONNECTORS, tone: 'orange' },
    { title: 'Palabras', items: SENTENCE_BUILDING_VOCABULARY.slice(0, 6), tone: 'slate' },
  ];

  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Activacion visual</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Las piezas ya estan en tu mano</h1>
      <p className="text-lg font-semibold text-slate-700">
        Ahora no se trata de aprender muchas palabras nuevas. Se trata de ordenar mejor las que ya conoces.
      </p>

      <div className="grid gap-4">
        {pieceGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-black uppercase text-slate-500 mb-3">{group.title}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span key={item.id} className={chipClass(group.tone)}>
                  <b>{item.english}</b>
                  <span className="opacity-75">{item.spanish}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-4">
        <p className="text-lg font-black text-amber-900">Idea clave</p>
        <p className="mt-1 text-base font-bold text-amber-900">
          Una frase completa necesita piezas en orden: persona + accion + complemento.
        </p>
      </div>

      <PrimaryButton onClick={onContinue}>Ver patrones</PrimaryButton>
    </section>
  );
}

function PatternStep({ pattern, onContinue }: { pattern: SentencePattern; onContinue: () => void }) {
  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Patron de construccion</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">{pattern.title}</h1>

      <div className="bg-white rounded-[28px] border-2 border-emerald-200 shadow-sm p-5 space-y-5">
        <RuleBox title="Mini regla" text={pattern.miniRule} />
        <PieceBuilder pieces={pattern.visualPieces} />
        <ExampleCard
          english={pattern.example}
          spanish={pattern.spanish}
          pronunciation={pattern.pronunciation}
          audioText={pattern.audioText}
        />
      </div>

      <PrimaryButton onClick={onContinue}>Continuar</PrimaryButton>
    </section>
  );
}

function GrowingStep({ sentence, onContinue }: { sentence: GrowingSentence; onContinue: () => void }) {
  const [visible, setVisible] = useState(1);
  const complete = visible >= sentence.steps.length;

  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Frase que crece</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Mira como una idea se vuelve completa</h1>

      <div className="bg-white rounded-[28px] border border-emerald-100 shadow-sm p-5 space-y-3">
        {sentence.steps.slice(0, visible).map((step, itemIndex) => (
          <div
            key={`${sentence.id}-${step.text}`}
            className="rounded-[22px] border-2 border-sky-100 bg-sky-50 p-4 animate-[fadeIn_220ms_ease-out]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-sky-700">Paso {itemIndex + 1}</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{step.text}</p>
                <p className="font-semibold text-slate-600">{step.spanish}</p>
                <p className="mt-2 text-lg font-black text-sky-800">{step.pronunciation}</p>
              </div>
              <SmallAudioButton text={step.audioText} label="Audio" />
            </div>
          </div>
        ))}
      </div>

      {!complete ? (
        <PrimaryButton onClick={() => setVisible((value) => value + 1)}>Agregar otra pieza</PrimaryButton>
      ) : (
        <>
          <Achievement message="Muy bien. Ya ves como se construye una frase completa." />
          <PrimaryButton onClick={onContinue}>Continuar</PrimaryButton>
        </>
      )}
    </section>
  );
}

function ErrorStep({ error, onContinue }: { error: CommonSentenceError; onContinue: () => void }) {
  const [phase, setPhase] = useState<'question' | 'hint' | 'answer'>('question');

  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Detecta el error</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Primero piensa, luego corrige</h1>

      <div className="rounded-[28px] bg-red-50 border-2 border-red-200 p-5">
        <p className="text-xs font-black uppercase text-red-700">Frase incorrecta</p>
        <p className="mt-3 text-3xl font-black text-red-700">{error.wrong}</p>
      </div>

      <div className="rounded-[28px] bg-white border border-slate-100 shadow-sm p-5 space-y-4">
        <p className="text-lg font-black text-slate-950">{error.hintQuestion}</p>
        {phase === 'question' && (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setPhase('hint')}
              className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-4 text-left font-black text-amber-900"
            >
              Ver pista
            </button>
            <button
              type="button"
              onClick={() => setPhase('answer')}
              className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-4 text-left font-black text-emerald-900"
            >
              Ya lo pense. Ver correccion
            </button>
          </div>
        )}
        {phase === 'hint' && (
          <>
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-black uppercase text-amber-800">Pista</p>
              <p className="mt-1 text-lg font-bold text-amber-950">{error.explanation}</p>
            </div>
            <PrimaryButton onClick={() => setPhase('answer')}>Ver respuesta correcta</PrimaryButton>
          </>
        )}
        {phase === 'answer' && (
          <>
            <ExampleCard
              english={error.correct}
              spanish={error.explanation}
              pronunciation={error.pronunciation}
              audioText={error.audioText}
              tone="emerald"
            />
            <PrimaryButton onClick={onContinue}>Continuar</PrimaryButton>
          </>
        )}
      </div>
    </section>
  );
}

function ExerciseStep({ exercise, onContinue }: { exercise: SentenceExercise; onContinue: () => void }) {
  const answerList = Array.isArray(exercise.answer) ? exercise.answer : [];
  const isSequence = answerList.length > 0;
  const [selected, setSelected] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [checked, setChecked] = useState(false);

  const options = exercise.options ?? exercise.pieces ?? [];
  const currentAnswer = isSequence ? selected.join(' ') : choice ?? '';
  const expectedAnswer = isSequence ? answerList.join(' ') : String(exercise.answer);
  const correct = normalizeAnswer(currentAnswer) === normalizeAnswer(expectedAnswer);
  const canCheck = isSequence ? selected.length === answerList.length : !!choice;

  const selectPiece = (piece: string, pieceIndex: number) => {
    if (checked && correct) return;
    setSelected((current) => [...current, `${piece}__${pieceIndex}`]);
  };

  const selectedLabels = selected.map((item) => item.split('__')[0]);
  const availablePieces = (exercise.pieces ?? []).map((piece, pieceIndex) => ({
    piece,
    pieceIndex,
    key: `${piece}__${pieceIndex}`,
  }));

  const reset = () => {
    setSelected([]);
    setChoice(null);
    setChecked(false);
    setShowHint(false);
  };

  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Practica inmediata</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">{exercise.prompt}</h1>

      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 space-y-4">
        {exercise.spanish && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Idea en espanol</p>
            <p className="text-xl font-black text-slate-950">{exercise.spanish}</p>
          </div>
        )}

        {isSequence ? (
          <>
            <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-100 min-h-[90px] p-3">
              <p className="text-xs font-black uppercase text-emerald-700 mb-2">Tu frase</p>
              <div className="flex flex-wrap gap-2">
                {selectedLabels.length === 0 ? (
                  <span className="text-base font-bold text-emerald-700">Toca las piezas en orden...</span>
                ) : (
                  selectedLabels.map((piece, itemIndex) => (
                    <button
                      type="button"
                      key={`${piece}-${itemIndex}`}
                      onClick={() => setSelected((current) => current.filter((_, i) => i !== itemIndex))}
                      className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-black shadow-sm"
                    >
                      {piece}
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availablePieces.map(({ piece, pieceIndex, key }) => {
                const alreadyUsed = selected.includes(key);
                return (
                  <button
                    type="button"
                    key={key}
                    disabled={alreadyUsed || (checked && correct)}
                    onClick={() => selectPiece(piece, pieceIndex)}
                    className={`rounded-2xl border-2 px-4 py-4 text-left text-lg font-black ${
                      alreadyUsed
                        ? 'border-slate-100 bg-slate-100 text-slate-400'
                        : 'border-sky-200 bg-sky-50 text-slate-950 active:scale-[0.98]'
                    }`}
                  >
                    {piece}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid gap-3">
            {options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  setChoice(option);
                  setChecked(false);
                }}
                className={`rounded-2xl border-2 px-4 py-4 text-left text-lg font-black ${
                  choice === option
                    ? 'border-emerald-400 bg-emerald-50 text-slate-950'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {showHint && !correct && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-black uppercase text-amber-800">Pista</p>
            <p className="font-bold text-amber-950">{exercise.hint}</p>
          </div>
        )}

        {checked && (
          correct ? (
            <div className="space-y-4">
              <Achievement message="Muy bien. Ordenaste la frase correctamente." />
              <ExampleCard
                english={expectedAnswer}
                spanish={exercise.explanation}
                pronunciation={exercise.pronunciation ?? ''}
                audioText={exercise.audioText ?? expectedAnswer}
                tone="emerald"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-xl font-black text-red-700">Todavia no.</p>
              <p className="font-bold text-red-900">Usa la pista y vuelve a intentarlo. Vamos, tu puedes.</p>
            </div>
          )
        )}

        {!checked ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-4 font-black text-amber-900"
            >
              Ver pista
            </button>
            <PrimaryButton onClick={() => setChecked(true)} disabled={!canCheck}>Comprobar</PrimaryButton>
          </div>
        ) : correct ? (
          <PrimaryButton onClick={onContinue}>Continuar</PrimaryButton>
        ) : (
          <PrimaryButton onClick={reset}>Intentar de nuevo</PrimaryButton>
        )}
      </div>
    </section>
  );
}

function GuidedStep({ construction, onContinue }: { construction: GuidedConstruction; onContinue: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const expected = construction.pieces.join(' ');
  const selectedText = selected.map((item) => item.split('__')[0]).join(' ');
  const correct = normalizeAnswer(selectedText) === normalizeAnswer(expected);
  const pieces = construction.pieces.map((piece, pieceIndex) => ({
    piece,
    key: `${piece}__${pieceIndex}`,
  }));

  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Construccion guiada</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">Lleva la situacion a ingles</h1>

      <div className="rounded-[28px] bg-white border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
          <p className="text-xs font-black uppercase text-orange-700">Situacion</p>
          <p className="text-xl font-black text-slate-950">{construction.situationEs}</p>
        </div>

        <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-100 p-3 min-h-[96px]">
          <p className="text-xs font-black uppercase text-emerald-700 mb-2">Tu construccion</p>
          <div className="flex flex-wrap gap-2">
            {selected.length === 0 ? (
              <span className="font-bold text-emerald-700">Toca cada pieza en orden...</span>
            ) : (
              selected.map((item, itemIndex) => (
                <button
                  type="button"
                  key={`${item}-${itemIndex}`}
                  onClick={() => setSelected((current) => current.filter((_, i) => i !== itemIndex))}
                  className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-black"
                >
                  {item.split('__')[0]}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pieces.map(({ piece, key }) => {
            const used = selected.includes(key);
            return (
              <button
                type="button"
                key={key}
                disabled={used || (checked && correct)}
                onClick={() => setSelected((current) => [...current, key])}
                className={`rounded-xl border-2 px-4 py-3 font-black ${
                  used ? 'border-slate-100 bg-slate-100 text-slate-400' : 'border-sky-200 bg-sky-50 text-slate-950'
                }`}
              >
                {piece}
              </button>
            );
          })}
        </div>

        {checked && (
          correct ? (
            <div className="space-y-4">
              <Achievement message="Excelente. Ya estas armando ideas completas." />
              <ExampleCard
                english={construction.expected}
                spanish={construction.spanish}
                pronunciation={construction.pronunciation}
                audioText={construction.audioText}
                tone="sky"
              />
              <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
                <p className="text-sm font-black uppercase text-violet-700">Repitelo sin evaluacion</p>
                <p className="mt-1 font-bold text-violet-950">Escucha el audio y dilo en voz alta una vez mas.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-xl font-black text-red-700">Revisa el orden.</p>
              <p className="font-bold text-red-900">Empieza con la persona y construye una idea a la vez.</p>
            </div>
          )
        )}

        {!checked ? (
          <PrimaryButton onClick={() => setChecked(true)} disabled={selected.length !== construction.pieces.length}>
            Comprobar
          </PrimaryButton>
        ) : correct ? (
          <PrimaryButton onClick={onContinue}>Continuar</PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              setSelected([]);
              setChecked(false);
            }}
          >
            Intentar de nuevo
          </PrimaryButton>
        )}
      </div>
    </section>
  );
}

function DialogueStep({ dialogue, onContinue }: { dialogue: ControlledDialogue; onContinue: () => void }) {
  const play = (speed: 'normal' | 'slow') =>
    generateSpeech(speed === 'slow' ? dialogue.slowAudioText : dialogue.normalAudioText, speed);

  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Dialogo controlado</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">{dialogue.title}</h1>
      <p className="text-lg font-semibold text-slate-700">Todavia es vista previa: escucha, lee y observa el orden.</p>

      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 space-y-3">
        {dialogue.lines.map((line) => (
          <div key={`${dialogue.id}-${line.speaker}-${line.english}`} className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Persona {line.speaker}</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{line.english}</p>
            <p className="font-semibold text-slate-600">{line.spanish}</p>
            <p className="mt-2 text-lg font-black text-sky-800">{line.pronunciation}</p>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void play('slow')}
            className="rounded-2xl bg-sky-500 text-white py-4 font-black shadow-sm active:scale-[0.98]"
          >
            Audio lento
          </button>
          <button
            type="button"
            onClick={() => void play('normal')}
            className="rounded-2xl bg-violet-500 text-white py-4 font-black shadow-sm active:scale-[0.98]"
          >
            Audio normal
          </button>
        </div>
      </div>

      <PrimaryButton onClick={onContinue}>Continuar</PrimaryButton>
    </section>
  );
}

function PreChallengeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="pt-8 space-y-5">
      <p className="text-sm font-extrabold uppercase text-emerald-700">Antes del reto</p>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-950">{PRE_CHALLENGE.message}</h1>

      <div className="bg-white rounded-[28px] border border-emerald-100 shadow-sm p-5 space-y-5">
        <div>
          <p className="text-xs font-black uppercase text-slate-500 mb-3">Palabras permitidas</p>
          <div className="flex flex-wrap gap-2">
            {PRE_CHALLENGE.words.map((word) => (
              <span key={word.id} className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-sm font-black text-slate-900">
                {word.english} <span className="text-slate-500">· {word.spanish}</span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase text-slate-500 mb-3">Estructuras que ya viste</p>
          <div className="grid gap-3">
            {PRE_CHALLENGE.structures.map((structure) => (
              <div key={structure.id} className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                <p className="font-black text-slate-950">{structure.title}</p>
                <p className="mt-1 text-lg font-black text-emerald-800">{structure.example}</p>
                <p className="font-bold text-sky-800">{structure.pronunciation}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase text-slate-500 mb-3">Ejemplos para escuchar</p>
          <div className="grid gap-3">
            {PRE_CHALLENGE.examples.map((example) => (
              <ExampleCard
                key={example.id}
                english={example.english}
                spanish={example.spanish}
                pronunciation={example.pronunciation}
                audioText={example.audioText}
                tone="amber"
              />
            ))}
          </div>
        </div>
      </div>

      <PrimaryButton onClick={onContinue}>Cerrar Fase 2</PrimaryButton>
    </section>
  );
}

function CompleteStep({ onExit }: { onExit: () => void }) {
  return (
    <section className="pt-16 space-y-6 text-center">
      <div className="text-4xl">🎈 ⭐ 🎈</div>
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-5xl text-emerald-700">
        ✓
      </div>
      <p className="text-sm font-extrabold uppercase text-emerald-700">Fase 2 lista</p>
      <h1 className="text-4xl font-black text-slate-950">Ya puedes ordenar y construir frases completas.</h1>
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 text-left space-y-3">
        <p className="text-sm font-black uppercase text-slate-500">Lo siguiente sera</p>
        <div className="grid gap-3">
          {['Dialogo real completo.', 'Practica hablada.', 'Mision final con puntuacion.'].map((item) => (
            <div key={item} className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 font-black text-slate-950">
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-sky-50 rounded-[24px] border border-sky-200 p-4 text-left">
        <p className="text-sm font-black uppercase text-sky-700">{SENTENCE_BUILDING_CLOSING.title}</p>
        <ul className="mt-2 space-y-2">
          {SENTENCE_BUILDING_CLOSING.achievements.map((item) => (
            <li key={item} className="font-bold text-slate-900">✓ {item}</li>
          ))}
        </ul>
      </div>
      <PrimaryButton onClick={onExit}>Cerrar vista previa</PrimaryButton>
    </section>
  );
}

function RuleBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] bg-emerald-50 border border-emerald-100 p-4">
      <p className="text-xs font-black uppercase text-emerald-700">{title}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{text}</p>
    </div>
  );
}

function PieceBuilder({ pieces }: { pieces: string[] }) {
  return (
    <div className="rounded-[22px] bg-slate-50 border border-slate-200 p-4">
      <p className="text-xs font-black uppercase text-slate-500 mb-3">Piezas</p>
      <div className="flex flex-wrap items-center gap-2">
        {pieces.map((piece, itemIndex) => (
          <React.Fragment key={`${piece}-${itemIndex}`}>
            <span className="rounded-2xl bg-white border-2 border-sky-200 px-4 py-3 text-xl font-black text-slate-950 shadow-sm">
              {piece}
            </span>
            {itemIndex < pieces.length - 1 && <span className="text-2xl font-black text-slate-300">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ExampleCard(props: {
  english: string;
  spanish: string;
  pronunciation: string;
  audioText: string;
  tone?: 'emerald' | 'sky' | 'amber';
}) {
  const tone = props.tone ?? 'sky';
  const boxClass =
    tone === 'emerald'
      ? 'bg-emerald-50 border-emerald-200'
      : tone === 'amber'
        ? 'bg-amber-50 border-amber-200'
        : 'bg-sky-50 border-sky-200';

  return (
    <div className={`rounded-[22px] border-2 p-4 ${boxClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Ejemplo completo</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{props.english}</p>
          <p className="font-semibold text-slate-600">{props.spanish}</p>
          {props.pronunciation && (
            <p className="mt-2 text-lg font-black text-sky-800">{props.pronunciation}</p>
          )}
        </div>
        <SmallAudioButton text={props.audioText} label="Audio" />
      </div>
    </div>
  );
}

function Achievement({ message }: { message: string }) {
  return (
    <div className="rounded-[24px] bg-emerald-50 border-2 border-emerald-200 p-5 text-center">
      <div className="text-3xl">⭐ ⭐ ⭐</div>
      <p className="mt-2 text-2xl font-black text-emerald-800">¡Muy bien!</p>
      <p className="font-bold text-slate-900">{message}</p>
    </div>
  );
}

function SmallAudioButton({ text, label }: { text: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const play = async () => {
    setPlaying(true);
    try {
      await generateSpeech(text, 'normal');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void play()}
      disabled={playing}
      className="shrink-0 rounded-2xl bg-sky-500 text-white px-4 py-3 font-black shadow-sm active:scale-[0.98] disabled:opacity-70"
    >
      {playing ? '...' : label}
    </button>
  );
}

function PrimaryButton(props: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className="w-full rounded-2xl bg-emerald-500 py-5 px-5 text-lg font-black text-white shadow-sm active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400"
    >
      {props.children}
    </button>
  );
}

function chipClass(tone: string) {
  const tones: Record<string, string> = {
    sky: 'bg-sky-50 border-sky-200 text-sky-950',
    violet: 'bg-violet-50 border-violet-200 text-violet-950',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    amber: 'bg-amber-50 border-amber-200 text-amber-950',
    orange: 'bg-orange-50 border-orange-200 text-orange-950',
    slate: 'bg-slate-50 border-slate-200 text-slate-950',
  };
  return `rounded-xl border px-3 py-2 text-sm font-bold flex items-center gap-2 ${tones[tone] ?? tones.slate}`;
}

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
