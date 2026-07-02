import React, { useMemo, useState } from 'react';
import {
  ESSENTIAL_VERBS,
  UNIT_3_ACTIVATION,
  UNIT_3_CONNECTORS,
  UNIT_3_GUIDED_BUILD,
  type ConnectorCard,
  type EssentialVerbCard,
} from '../data/essentialVerbsPractice';

type ReviewStep =
  | { kind: 'activation' }
  | { kind: 'verb'; item: EssentialVerbCard }
  | { kind: 'connectors-intro' }
  | { kind: 'connector'; item: ConnectorCard }
  | { kind: 'builder' }
  | { kind: 'complete' };

interface EssentialVerbsPracticeProps {
  onExit: () => void;
}

export const EssentialVerbsPractice: React.FC<EssentialVerbsPracticeProps> = ({ onExit }) => {
  const steps = useMemo<ReviewStep[]>(
    () => [
      { kind: 'activation' },
      ...ESSENTIAL_VERBS.map((item): ReviewStep => ({ kind: 'verb', item })),
      { kind: 'connectors-intro' },
      ...UNIT_3_CONNECTORS.map((item): ReviewStep => ({ kind: 'connector', item })),
      { kind: 'builder' },
      { kind: 'complete' },
    ],
    [],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealedPieces, setRevealedPieces] = useState(1);

  const step = steps[index];
  const progress = Math.round(((index + 1) / steps.length) * 100);

  const next = () => {
    setSelected(null);
    setChecked(false);
    setRevealedPieces(1);
    setIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const previous = () => {
    if (index === 0) {
      onExit();
      return;
    }
    setSelected(null);
    setChecked(false);
    setRevealedPieces(1);
    setIndex((current) => current - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={previous}
            className="w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700"
            aria-label={index === 0 ? 'Salir de la vista previa' : 'Paso anterior'}
          >
            <span aria-hidden="true" className="text-2xl leading-none">‹</span>
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-extrabold uppercase text-emerald-700">Unidad 3 · Vista previa</span>
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
        {step.kind === 'activation' && <ActivationStep onContinue={next} />}
        {step.kind === 'verb' && (
          <TeachingCard
            eyebrow="Verbo esencial"
            title={step.item.label}
            meaning={step.item.spanish}
            pronunciation={step.item.pronunciation}
            rule={step.item.miniRule}
            examples={step.item.examples}
            exercise={step.item.exercise}
            selected={selected}
            checked={checked}
            onSelect={setSelected}
            onCheck={() => setChecked(true)}
            onContinue={next}
          />
        )}
        {step.kind === 'connectors-intro' && <ConnectorIntro onContinue={next} />}
        {step.kind === 'connector' && (
          <ConnectorStep
            connector={step.item}
            selected={selected}
            checked={checked}
            onSelect={setSelected}
            onCheck={() => setChecked(true)}
            onContinue={next}
          />
        )}
        {step.kind === 'builder' && (
          <BuilderStep
            revealedPieces={revealedPieces}
            onReveal={() =>
              setRevealedPieces((current) =>
                Math.min(current + 1, UNIT_3_GUIDED_BUILD.pieces.length),
              )
            }
            onContinue={next}
          />
        )}
        {step.kind === 'complete' && <PreviewComplete onExit={onExit} />}
      </main>
    </div>
  );
};

function ActivationStep({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="pt-4">
      <p className="text-sm font-extrabold uppercase text-emerald-700 mb-2">Activación breve</p>
      <h1 className="text-3xl font-extrabold text-gray-950 mb-3">Ya tienes una base</h1>
      <p className="text-gray-700 text-base font-medium leading-relaxed mb-5">
        Primero recuerda los pronombres y el verbo To Be que ya aprendiste.
      </p>
      <div className="space-y-3 mb-6">
        {UNIT_3_ACTIVATION.map((example) => (
          <article key={example.english} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-950 text-xl font-extrabold">{example.english}</p>
            <p className="text-gray-600 font-medium mt-1">{example.spanish}</p>
            <p className="text-emerald-700 font-bold mt-2">{example.pronunciation}</p>
          </article>
        ))}
      </div>
      <PrimaryButton onClick={onContinue}>Aprender verbos esenciales</PrimaryButton>
    </section>
  );
}

interface TeachingCardProps {
  eyebrow: string;
  title: string;
  meaning: string;
  pronunciation: string;
  rule: string;
  examples: EssentialVerbCard['examples'];
  exercise: EssentialVerbCard['exercise'];
  selected: string | null;
  checked: boolean;
  onSelect: (value: string) => void;
  onCheck: () => void;
  onContinue: () => void;
}

function TeachingCard(props: TeachingCardProps) {
  const correct = props.selected === props.exercise.answer;
  return (
    <section className="pt-4">
      <p className="text-sm font-extrabold uppercase text-emerald-700 mb-2">{props.eyebrow}</p>
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-black text-gray-950">{props.title}</h1>
            <p className="text-gray-700 text-lg font-bold mt-1">{props.meaning}</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 rounded-xl px-3 py-2 font-extrabold">
            {props.pronunciation}
          </span>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-extrabold uppercase text-emerald-700 mb-1">Mini regla</p>
          <p className="text-gray-900 font-bold leading-relaxed">{props.rule}</p>
        </div>
        <div className="space-y-3">
          {props.examples.map((example) => (
            <div key={example.english} className="border-t border-gray-100 pt-3">
              <p className="text-gray-950 text-lg font-extrabold">{example.english}</p>
              <p className="text-gray-600 font-medium">{example.spanish}</p>
              <p className="text-emerald-700 font-bold text-sm mt-1">{example.pronunciation}</p>
            </div>
          ))}
        </div>
      </div>
      <ExercisePanel
        prompt={props.exercise.prompt}
        options={props.exercise.options}
        answer={props.exercise.answer}
        explanation={props.exercise.explanation}
        selected={props.selected}
        checked={props.checked}
        onSelect={props.onSelect}
        onCheck={props.onCheck}
        onContinue={props.onContinue}
        correct={correct}
      />
    </section>
  );
}

function ConnectorIntro({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="pt-12 text-center">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl mb-5">
        +
      </div>
      <p className="text-sm font-extrabold uppercase text-amber-700 mb-2">Nueva habilidad</p>
      <h1 className="text-4xl font-black text-gray-950 leading-tight mb-4">Ahora puedes unir ideas</h1>
      <p className="text-gray-700 text-lg font-medium leading-relaxed mb-8">
        Aprenderás cuatro piezas pequeñas que convierten frases sueltas en una idea completa.
      </p>
      <PrimaryButton onClick={onContinue}>Desbloquear conectores</PrimaryButton>
    </section>
  );
}

interface ConnectorStepProps {
  connector: ConnectorCard;
  selected: string | null;
  checked: boolean;
  onSelect: (value: string) => void;
  onCheck: () => void;
  onContinue: () => void;
}

function ConnectorStep(props: ConnectorStepProps) {
  const { connector } = props;
  return (
    <section className="pt-4">
      <p className="text-sm font-extrabold uppercase text-amber-700 mb-2">Conector visual</p>
      <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-black text-gray-950">{connector.label}</h1>
            <p className="text-gray-700 text-lg font-bold">{connector.spanish}</p>
          </div>
          <span className="bg-amber-100 text-amber-800 rounded-xl px-3 py-2 font-extrabold">
            {connector.pronunciation}
          </span>
        </div>
        <p className="text-gray-900 text-xl font-extrabold mb-3">{connector.function}</p>
        <div className="bg-amber-50 rounded-2xl p-4 mb-5">
          <p className="text-xs font-extrabold uppercase text-amber-700 mb-1">Mini regla</p>
          <p className="text-gray-900 font-bold leading-relaxed">{connector.miniRule}</p>
        </div>
        <div className="space-y-2 mb-4">
          {connector.before.map((line) => (
            <div key={line} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold">
              {line}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center text-3xl text-amber-600 font-black mb-3">↓</div>
        <div className="bg-amber-100 border border-amber-200 rounded-2xl p-5">
          <p className="text-gray-950 text-xl font-black">{connector.combined}</p>
          <p className="text-gray-700 font-medium mt-1">{connector.combinedSpanish}</p>
        </div>
      </div>
      <ExercisePanel
        prompt={connector.exercise.prompt}
        options={connector.exercise.options}
        answer={connector.exercise.answer}
        explanation={connector.exercise.explanation}
        selected={props.selected}
        checked={props.checked}
        onSelect={props.onSelect}
        onCheck={props.onCheck}
        onContinue={props.onContinue}
        correct={props.selected === connector.exercise.answer}
      />
    </section>
  );
}

interface ExercisePanelProps {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  selected: string | null;
  checked: boolean;
  correct: boolean;
  onSelect: (value: string) => void;
  onCheck: () => void;
  onContinue: () => void;
}

function ExercisePanel(props: ExercisePanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase text-gray-500 mb-2">Práctica inmediata</p>
      <p className="text-gray-950 text-xl font-extrabold mb-4">{props.prompt}</p>
      <div className="grid gap-2 mb-4">
        {props.options.map((option) => {
          const selected = props.selected === option;
          const answerState = props.checked && option === props.answer;
          const wrongState = props.checked && selected && option !== props.answer;
          return (
            <button
              key={option}
              type="button"
              disabled={props.checked}
              onClick={() => props.onSelect(option)}
              className={[
                'min-h-14 rounded-2xl border-2 px-4 py-3 text-left text-base font-extrabold transition-colors',
                answerState
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : wrongState
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : selected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-800',
              ].join(' ')}
            >
              {option}
            </button>
          );
        })}
      </div>
      {props.checked && (
        <div className={props.correct ? 'bg-emerald-50 rounded-2xl p-4 mb-4' : 'bg-amber-50 rounded-2xl p-4 mb-4'}>
          <p className="font-extrabold text-gray-900">
            {props.correct ? 'Muy bien.' : `La respuesta correcta es ${props.answer}.`}
          </p>
          <p className="text-gray-700 font-medium mt-1">{props.explanation}</p>
        </div>
      )}
      {!props.checked ? (
        <PrimaryButton onClick={props.onCheck} disabled={!props.selected}>Comprobar</PrimaryButton>
      ) : (
        <PrimaryButton onClick={props.onContinue}>Continuar</PrimaryButton>
      )}
    </div>
  );
}

function BuilderStep(props: { revealedPieces: number; onReveal: () => void; onContinue: () => void }) {
  const complete = props.revealedPieces === UNIT_3_GUIDED_BUILD.pieces.length;
  return (
    <section className="pt-4">
      <p className="text-sm font-extrabold uppercase text-sky-700 mb-2">Construcción guiada</p>
      <h1 className="text-3xl font-black text-gray-950 mb-3">Construye una idea completa</h1>
      <p className="text-gray-700 font-medium leading-relaxed mb-5">Agrega una pieza a la vez y observa cómo crece la frase.</p>
      <div className="bg-white border-2 border-sky-200 rounded-3xl p-5 shadow-sm mb-4">
        <div className="grid grid-cols-2 gap-2 mb-5">
          {UNIT_3_GUIDED_BUILD.pieces.map((piece, pieceIndex) => (
            <div
              key={piece}
              className={
                pieceIndex < props.revealedPieces
                  ? 'rounded-xl bg-sky-100 border border-sky-200 p-3'
                  : 'rounded-xl bg-gray-100 border border-dashed border-gray-300 p-3'
              }
            >
              <p className="text-[11px] uppercase font-extrabold text-gray-500 mb-1">
                {UNIT_3_GUIDED_BUILD.labels[pieceIndex]}
              </p>
              <p className="text-gray-950 font-black">
                {pieceIndex < props.revealedPieces ? piece : '...'}
              </p>
            </div>
          ))}
        </div>
        {complete && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <p className="text-gray-950 text-xl font-black">{UNIT_3_GUIDED_BUILD.result}</p>
            <p className="text-gray-700 font-medium mt-1">{UNIT_3_GUIDED_BUILD.spanish}</p>
            <p className="text-emerald-700 font-bold mt-2">{UNIT_3_GUIDED_BUILD.pronunciation}</p>
          </div>
        )}
      </div>
      <PrimaryButton onClick={complete ? props.onContinue : props.onReveal}>
        {complete ? 'Terminar vista previa' : 'Agregar la siguiente pieza'}
      </PrimaryButton>
    </section>
  );
}

function PreviewComplete({ onExit }: { onExit: () => void }) {
  return (
    <section className="pt-16 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-4xl font-black mb-5">
        ✓
      </div>
      <p className="text-sm font-extrabold uppercase text-emerald-700 mb-2">Fase 1 completa</p>
      <h1 className="text-3xl font-black text-gray-950 mb-4">Base de Unidad 3 lista para revisar</h1>
      <p className="text-gray-700 font-medium leading-relaxed mb-8">
        La práctica hablada y la Misión Final se agregarán en la siguiente fase.
      </p>
      <PrimaryButton onClick={onExit}>Cerrar vista previa</PrimaryButton>
    </section>
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
      className={
        props.disabled
          ? 'w-full min-h-14 rounded-2xl bg-gray-200 text-gray-400 text-base font-extrabold cursor-not-allowed'
          : 'w-full min-h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-extrabold transition-all'
      }
    >
      {props.children}
    </button>
  );
}
