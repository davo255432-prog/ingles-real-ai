import React, { useEffect, useMemo, useRef, useState } from 'react';
import { generateSpeech, prefetchSpeech, stopSpeech } from '../../services/speechApi';
import {
  ESSENTIAL_VERBS,
  UNIT_3_ACTIVATION,
  UNIT_3_CONNECTORS,
  UNIT_3_CONNECTOR_MATCHING,
  UNIT_3_CONNECTOR_REVIEW,
  UNIT_3_GUIDED_BUILD,
  UNIT_3_PRONOUN_REVIEW,
  UNIT_3_REPETITION_PHRASES,
  UNIT_3_VERB_MATCHING,
  type ConnectorCard,
  type EssentialVerbCard,
  type Unit3MatchingItem,
  type Unit3RepetitionPhrase,
} from '../data/essentialVerbsPractice';

type ReviewStep =
  | { kind: 'activation' }
  | { kind: 'verbs-intro' }
  | { kind: 'verb'; item: EssentialVerbCard }
  | { kind: 'verb-matching' }
  | { kind: 'connectors-intro' }
  | { kind: 'connector'; item: ConnectorCard }
  | { kind: 'connector-review' }
  | { kind: 'connector-matching' }
  | { kind: 'builder' }
  | { kind: 'repetition'; item: Unit3RepetitionPhrase }
  | { kind: 'complete' };

interface EssentialVerbsPracticeProps {
  onExit: () => void;
}

export const EssentialVerbsPractice: React.FC<EssentialVerbsPracticeProps> = ({ onExit }) => {
  const steps = useMemo<ReviewStep[]>(
    () => [
      { kind: 'activation' },
      { kind: 'verbs-intro' },
      ...ESSENTIAL_VERBS.map((item): ReviewStep => ({ kind: 'verb', item })),
      { kind: 'verb-matching' },
      { kind: 'connectors-intro' },
      ...UNIT_3_CONNECTORS.map((item): ReviewStep => ({ kind: 'connector', item })),
      { kind: 'connector-review' },
      { kind: 'connector-matching' },
      { kind: 'builder' },
      ...UNIT_3_REPETITION_PHRASES.map((item): ReviewStep => ({ kind: 'repetition', item })),
      { kind: 'complete' },
    ],
    [],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealedPieces, setRevealedPieces] = useState(1);

  useEffect(() => {
    const teachingPhrases = [
      ...UNIT_3_PRONOUN_REVIEW.map((pronoun) => pronoun.english),
      ...UNIT_3_ACTIVATION.map((example) => example.english),
      ...ESSENTIAL_VERBS.flatMap((verb) => verb.examples.map((example) => example.english)),
      ...ESSENTIAL_VERBS.map((verb) => verb.realUse.english),
      ...UNIT_3_CONNECTORS.map((connector) => connector.combined),
      ...UNIT_3_CONNECTOR_REVIEW.flatMap((item) =>
        [item.resultAudio, ...('audioPhrase' in item ? [item.audioPhrase] : [])],
      ),
      UNIT_3_GUIDED_BUILD.result,
      ...UNIT_3_REPETITION_PHRASES.map((phrase) => phrase.english),
      ...UNIT_3_VERB_MATCHING.flatMap((item) => item.audioPhrase ? [item.audioPhrase] : []),
    ];
    teachingPhrases.forEach((phrase) => void prefetchSpeech(phrase, 'normal'));
  }, []);

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
        {step.kind === 'verbs-intro' && <VerbsIntroStep onContinue={next} />}
        {step.kind === 'verb' && (
          <TeachingCard
            key={step.item.id}
            eyebrow="Verbo esencial"
            title={step.item.label}
            meaning={step.item.spanish}
            pronunciation={step.item.pronunciation}
            rule={step.item.miniRule}
            realUse={step.item.realUse}
            examples={step.item.examples}
            exercise={step.item.exercise}
            selected={selected}
            checked={checked}
            onSelect={setSelected}
            onCheck={() => setChecked(true)}
            onRetry={() => {
              setSelected(null);
              setChecked(false);
            }}
            onContinue={next}
          />
        )}
        {step.kind === 'verb-matching' && (
          <MatchingChallenge
            eyebrow="Reto de verbos"
            title="Lleva cada frase a su situación"
            intro="Arrastra la frase o tócala y después toca la situación correcta."
            items={UNIT_3_VERB_MATCHING}
            onContinue={next}
          />
        )}
        {step.kind === 'connectors-intro' && <ConnectorIntro onContinue={next} />}
        {step.kind === 'connector' && (
          <ConnectorStep
            key={step.item.id}
            connector={step.item}
            selected={selected}
            checked={checked}
            onSelect={setSelected}
            onCheck={() => setChecked(true)}
            onRetry={() => {
              setSelected(null);
              setChecked(false);
            }}
            onContinue={next}
          />
        )}
        {step.kind === 'connector-review' && <ConnectorReviewStep onContinue={next} />}
        {step.kind === 'connector-matching' && (
          <MatchingChallenge
            eyebrow="Reto de conectores"
            title="Une cada conector con su función"
            intro="Arrastra cada conector o toca primero la pieza y luego su función."
            items={UNIT_3_CONNECTOR_MATCHING}
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
        {step.kind === 'repetition' && (
          <RepetitionStep key={step.item.id} phrase={step.item} onContinue={next} />
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
      <div className="bg-white border-2 border-sky-200 rounded-3xl p-5 shadow-sm mb-5">
        <p className="text-sky-800 text-base font-black uppercase mb-4">
          Repaso rápido: pronombres
        </p>
        <PronounGroup
          title="Personas en la conversación"
          pronouns={UNIT_3_PRONOUN_REVIEW.filter((item) => ['I', 'You'].includes(item.english))}
          columns="grid-cols-2"
        />
        <PronounGroup
          title="Una persona o cosa"
          pronouns={UNIT_3_PRONOUN_REVIEW.filter((item) => ['He', 'She', 'It'].includes(item.english))}
          columns="grid-cols-3"
        />
        <PronounGroup
          title="Grupos"
          pronouns={UNIT_3_PRONOUN_REVIEW.filter((item) => ['We', 'They'].includes(item.english))}
          columns="grid-cols-2"
          last
        />
      </div>
      <p className="text-emerald-800 text-sm font-extrabold uppercase mb-3">
        Repasa To Be en frases
      </p>
      <div className="space-y-3 mb-6">
        {UNIT_3_ACTIVATION.map((example) => (
          <article key={example.english} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <p className="text-gray-950 text-xl font-extrabold">{example.english}</p>
            <p className="text-gray-600 font-medium mt-1">{example.spanish}</p>
            <p className="text-emerald-700 font-bold mt-2">{example.pronunciation}</p>
            <AudioButton phrase={example.english} />
          </article>
        ))}
      </div>
      <PrimaryButton onClick={onContinue}>Aprender verbos esenciales</PrimaryButton>
    </section>
  );
}

function VerbsIntroStep({ onContinue }: { onContinue: () => void }) {
  const purposes: Record<EssentialVerbCard['id'], string> = {
    need: 'Decir lo que necesitas',
    have: 'Decir lo que tienes',
    want: 'Decir lo que quieres',
    'go-to': 'Decir a dónde vas',
  };

  return (
    <section className="pt-8">
      <p className="text-sm font-extrabold uppercase text-emerald-700 mb-2">
        Abre una nueva puerta
      </p>
      <h1 className="text-3xl font-black text-gray-950 leading-tight mb-3">
        Ahora vas a expresar lo que necesitas, tienes y quieres
      </h1>
      <p className="text-gray-700 text-base font-semibold leading-relaxed mb-5">
        Estos cuatro verbos te ayudarán a comunicar acciones e ideas útiles en situaciones reales.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ESSENTIAL_VERBS.map((verb) => (
          <article
            key={verb.id}
            className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-sm"
          >
            <p className="text-emerald-800 text-2xl font-black">{verb.label}</p>
            <p className="text-gray-600 font-bold">{verb.spanish}</p>
            <p className="text-gray-900 text-sm font-extrabold leading-snug mt-3">
              {purposes[verb.id]}
            </p>
          </article>
        ))}
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
        <p className="text-emerald-900 font-extrabold leading-relaxed">
          Al terminar, podrás comunicar necesidades, deseos, cosas que tienes y lugares a los que vas.
        </p>
      </div>
      <PrimaryButton onClick={onContinue}>Comenzar con NEED</PrimaryButton>
    </section>
  );
}

interface TeachingCardProps {
  eyebrow: string;
  title: string;
  meaning: string;
  pronunciation: string;
  rule: string;
  realUse: EssentialVerbCard['realUse'];
  examples: EssentialVerbCard['examples'];
  exercise: EssentialVerbCard['exercise'];
  selected: string | null;
  checked: boolean;
  onSelect: (value: string) => void;
  onCheck: () => void;
  onRetry: () => void;
  onContinue: () => void;
}

function TeachingCard(props: TeachingCardProps) {
  const [phase, setPhase] = useState<'learn' | 'real-use' | 'practice'>('learn');
  const correct = props.selected === props.exercise.answer;
  if (phase === 'practice') {
    return (
      <ThinkAndAnswer
        exercise={props.exercise}
        selected={props.selected}
        checked={props.checked}
        correct={correct}
        onSelect={props.onSelect}
        onCheck={props.onCheck}
        onRetry={props.onRetry}
        onContinue={props.onContinue}
      />
    );
  }

  if (phase === 'real-use') {
    return (
      <section className="pt-4">
        <p className="text-sm font-extrabold uppercase text-violet-700 mb-2">
          Úsalo en una situación real
        </p>
        <div className="bg-white border-2 border-violet-200 rounded-3xl p-6 shadow-sm mb-5">
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-5">
            <p className="text-violet-800 text-sm font-black uppercase mb-2">Situación</p>
            <p className="text-gray-950 text-xl font-extrabold leading-relaxed">
              {props.realUse.situation}
            </p>
          </div>
          <p className="text-gray-500 text-sm font-black uppercase mb-2">Así lo dices</p>
          <p className="text-gray-950 text-2xl font-black leading-tight">
            {props.realUse.english}
          </p>
          <p className="text-gray-700 text-base font-semibold mt-2">{props.realUse.spanish}</p>
          <p className="text-violet-700 text-base font-extrabold mt-3">
            {props.realUse.pronunciation}
          </p>
          <AudioButton phrase={props.realUse.english} />
        </div>
        <PrimaryButton onClick={() => setPhase('practice')}>Ahora piensa tú</PrimaryButton>
      </section>
    );
  }

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
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 mb-4">
          <p className="text-emerald-800 text-lg font-black uppercase mb-3">Regla clave:</p>
          {props.title === 'have' ? (
            <>
              <p className="text-gray-950 text-lg font-extrabold mb-3">
                En esta práctica, <span className="text-emerald-700 text-xl">HAVE</span> se usa solo con:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {['I', 'YOU', 'WE', 'THEY'].map((pronoun) => (
                  <span
                    key={pronoun}
                    className="bg-white border border-emerald-300 rounded-lg px-3 py-2 text-emerald-900 font-black"
                  >
                    {pronoun}
                  </span>
                ))}
              </div>
              <div className="bg-emerald-700 text-white rounded-xl px-4 py-3 text-center text-lg font-black">
                PRONOMBRE + <span className="text-xl text-yellow-200">HAVE</span> + COSA
              </div>
            </>
          ) : (
            <p className="text-gray-950 text-lg font-extrabold leading-relaxed">{props.rule}</p>
          )}
        </div>
        {props.title === 'have' && ESSENTIAL_VERBS.find((verb) => verb.id === 'have')?.importantNote && (
          <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-5 mb-5">
            <p className="text-sky-800 text-xl font-black mb-4">Cambio importante</p>
            <div className="space-y-3 mb-4">
              <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <p className="text-gray-900 font-black">I · YOU · WE · THEY</p>
                <span className="bg-emerald-700 text-white rounded-xl px-4 py-2 text-xl font-black">
                  HAVE
                </span>
              </div>
              <div className="bg-white border border-sky-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <p className="text-gray-900 font-black">HE · SHE · IT</p>
                <span className="bg-sky-700 text-white rounded-xl px-4 py-2 text-xl font-black">
                  HAS
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="bg-white rounded-xl p-3 text-center border border-sky-200">
                <p className="text-gray-950 font-black">I have</p>
                <p className="text-gray-600 font-semibold">yo tengo</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-sky-200">
                <p className="text-gray-950 font-black">He has</p>
                <p className="text-gray-600 font-semibold">él tiene</p>
              </div>
            </div>
            <div className="border-t-2 border-sky-200 pt-4 mt-4">
              <p className="text-emerald-800 text-sm font-black uppercase mb-2">
                Por ahora practicaremos
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['I HAVE', 'YOU HAVE', 'WE HAVE', 'THEY HAVE'].map((form) => (
                  <span
                    key={form}
                    className="bg-emerald-100 border border-emerald-300 rounded-lg px-3 py-2 text-emerald-900 font-black"
                  >
                    {form}
                  </span>
                ))}
              </div>
              <p className="text-sky-800 text-sm font-black uppercase mb-2">Más adelante</p>
              <div className="flex flex-wrap gap-2">
                {['HE HAS', 'SHE HAS', 'IT HAS'].map((form) => (
                  <span
                    key={form}
                    className="bg-white border border-sky-300 rounded-lg px-3 py-2 text-sky-900 font-black"
                  >
                    {form}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {props.examples.map((example) => (
            <div key={example.english} className="border-t border-gray-100 pt-3">
              <p className="text-gray-950 text-lg font-extrabold">{example.english}</p>
              <p className="text-gray-600 font-medium">{example.spanish}</p>
              <p className="text-emerald-700 font-bold text-sm mt-1">{example.pronunciation}</p>
              <AudioButton phrase={example.english} />
            </div>
          ))}
        </div>
      </div>
      <PrimaryButton onClick={() => setPhase('real-use')}>Ver una situación real</PrimaryButton>
    </section>
  );
}

function ConnectorIntro({ onContinue }: { onContinue: () => void }) {
  const connectorPurpose: Record<ConnectorCard['id'], string> = {
    and: 'Agregar',
    but: 'Contrastar',
    because: 'Explicar una razón',
    also: 'Añadir otra idea',
  };

  return (
    <section className="pt-12 text-center">
      <div className="flex items-end justify-center gap-5 mb-4" aria-hidden="true">
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🎈</span>
        <span className="text-5xl animate-bounce" style={{ animationDelay: '160ms' }}>🎈</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '320ms' }}>🎈</span>
      </div>
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-6">
        <p className="text-emerald-800 text-lg font-black">¡Dominaste los verbos esenciales!</p>
        <p className="text-gray-700 font-semibold mt-1">Ahora vas a aprender a unir tus ideas.</p>
      </div>
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl mb-5">
        +
      </div>
      <p className="text-sm font-extrabold uppercase text-amber-700 mb-2">Nueva habilidad</p>
      <h1 className="text-4xl font-black text-gray-950 leading-tight mb-4">Ahora puedes unir ideas</h1>
      <p className="text-gray-700 text-lg font-medium leading-relaxed mb-8">
        Estas cuatro palabras convierten frases sueltas en ideas más completas.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6 text-left">
        {UNIT_3_CONNECTORS.map((connector) => (
          <article
            key={connector.id}
            className="bg-white border-2 border-amber-200 rounded-2xl p-4"
          >
            <p className="text-amber-800 text-xl font-black">{connector.label}</p>
            <p className="text-gray-600 font-bold">{connector.spanish}</p>
            <p className="text-gray-900 text-sm font-extrabold mt-2">
              {connectorPurpose[connector.id]}
            </p>
          </article>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <p className="text-amber-900 font-extrabold leading-relaxed">
          Con ellos podrás agregar, contrastar y explicar tus ideas.
        </p>
      </div>
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
  onRetry: () => void;
  onContinue: () => void;
}

function ConnectorStep(props: ConnectorStepProps) {
  const [practiceReady, setPracticeReady] = useState(false);
  const { connector } = props;
  if (practiceReady) {
    return (
      <ThinkAndAnswer
        exercise={connector.exercise}
        selected={props.selected}
        checked={props.checked}
        correct={props.selected === connector.exercise.answer}
        onSelect={props.onSelect}
        onCheck={props.onCheck}
        onRetry={props.onRetry}
        onContinue={props.onContinue}
      />
    );
  }

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
          <AudioButton phrase={connector.combined} />
        </div>
      </div>
      <PrimaryButton onClick={() => setPracticeReady(true)}>Ahora piensa tú</PrimaryButton>
    </section>
  );
}

function ThinkAndAnswer(props: {
  exercise: EssentialVerbCard['exercise'];
  selected: string | null;
  checked: boolean;
  correct: boolean;
  onSelect: (value: string) => void;
  onCheck: () => void;
  onRetry: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="pt-8">
      <div className="bg-violet-50 border-2 border-violet-200 rounded-3xl p-6 mb-5 text-center">
        <p className="text-violet-800 text-sm font-extrabold uppercase mb-2">Ahora piensa tú</p>
        <h1 className="text-gray-950 text-2xl font-black leading-tight mb-2">
          Haz una pausa y recuerda lo aprendido
        </h1>
        <p className="text-gray-700 font-semibold leading-relaxed">
          La respuesta ya no está frente a ti. Responde sin mirar atrás.
        </p>
        <p className="text-violet-800 font-extrabold mt-3">
          Si fallas, inténtalo de nuevo. Vamos, tú puedes.
        </p>
      </div>
      <ExercisePanel
        prompt={props.exercise.prompt}
        options={props.exercise.options}
        answer={props.exercise.answer}
        explanation={props.exercise.explanation}
        selected={props.selected || null}
        checked={props.checked}
        onSelect={props.onSelect}
        onCheck={props.onCheck}
        onRetry={props.onRetry}
        onContinue={props.onContinue}
        correct={props.correct}
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
  onRetry: () => void;
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
        props.correct ? (
          <div className="relative overflow-hidden bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 mb-4 text-center">
            <div className="flex justify-center gap-4 mb-2" aria-hidden="true">
              <span className="text-2xl animate-pulse">⭐</span>
              <span className="text-4xl animate-bounce">⭐</span>
              <span className="text-2xl animate-pulse">⭐</span>
            </div>
            <p className="text-emerald-800 text-xl font-black">¡Muy bien!</p>
            <p className="text-gray-950 font-extrabold mt-1">Habilidad desbloqueada</p>
            <p className="text-gray-700 font-medium mt-2">{props.explanation}</p>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0" aria-hidden="true">😌</span>
              <div>
                <p className="text-amber-900 text-lg font-black">Casi. No pasa nada.</p>
                <p className="text-gray-800 font-bold mt-1">
                  Respira, recuerda y prueba otra vez.
                </p>
                <p className="text-gray-700 font-medium mt-2">
                  Pista: {props.explanation}
                </p>
              </div>
            </div>
          </div>
        )
      )}
      {!props.checked ? (
        <PrimaryButton onClick={props.onCheck} disabled={!props.selected}>Comprobar</PrimaryButton>
      ) : !props.correct ? (
        <PrimaryButton onClick={props.onRetry}>Intentar de nuevo</PrimaryButton>
      ) : (
        <PrimaryButton onClick={props.onContinue}>Continuar</PrimaryButton>
      )}
    </div>
  );
}

function AudioButton({ phrase }: { phrase: string }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  const handlePlay = async () => {
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await generateSpeech(phrase, 'normal');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handlePlay()}
      className="mt-3 min-h-12 w-full rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] px-4 py-3 text-white text-sm font-extrabold shadow-sm transition-all"
    >
      {playing ? 'Detener audio' : `Escuchar: ${phrase}`}
    </button>
  );
}

function MatchingChallenge(props: {
  eyebrow: string;
  title: string;
  intro: string;
  items: Unit3MatchingItem[];
  onContinue: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongTargetId, setWrongTargetId] = useState<string | null>(null);
  const [starTargetId, setStarTargetId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const complete = matchedIds.length === props.items.length;
  const destinations = useMemo(
    () => [...props.items].sort((a, b) => b.id.localeCompare(a.id)),
    [props.items],
  );

  const tryMatch = (pieceId: string, targetId: string) => {
    if (matchedIds.includes(pieceId)) return;
    if (pieceId === targetId) {
      setMatchedIds((current) => [...current, pieceId]);
      setSelectedId(null);
      setWrongTargetId(null);
      setStarTargetId(targetId);
      window.setTimeout(() => setStarTargetId(null), 900);
    } else {
      setWrongTargetId(targetId);
      window.setTimeout(() => setWrongTargetId(null), 700);
    }
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>, pieceId: string) => {
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-match-target]');
    const targetId = target?.dataset.matchTarget;
    setDragging(null);
    if (targetId) {
      tryMatch(pieceId, targetId);
    } else {
      setSelectedId((current) => current === pieceId ? null : pieceId);
    }
  };

  return (
    <section className="pt-4">
      {dragging && (
        <div
          className="fixed z-50 pointer-events-none bg-violet-600 text-white border-2 border-violet-700 rounded-2xl px-4 py-3 font-black shadow-xl"
          style={{
            left: dragging.x,
            top: dragging.y,
            transform: 'translate(-50%, -50%) rotate(-2deg)',
          }}
          aria-hidden="true"
        >
          {props.items.find((item) => item.id === dragging.id)?.piece}
        </div>
      )}
      <p className="text-sm font-extrabold uppercase text-violet-700 mb-2">{props.eyebrow}</p>
      <h1 className="text-gray-950 text-3xl font-black leading-tight mb-3">{props.title}</h1>
      <p className="text-gray-700 font-semibold leading-relaxed mb-5">{props.intro}</p>

      <div className="bg-white border-2 border-violet-200 rounded-3xl p-5 shadow-sm mb-4">
        <p className="text-gray-500 text-xs font-black uppercase mb-3">Piezas</p>
        <div className="grid grid-cols-2 gap-3">
          {props.items.map((item) => {
            const matched = matchedIds.includes(item.id);
            const selected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={matched}
                onPointerDown={(event) => {
                  if (matched) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragging({ id: item.id, x: event.clientX, y: event.clientY });
                }}
                onPointerMove={(event) => {
                  if (dragging?.id !== item.id) return;
                  setDragging({ id: item.id, x: event.clientX, y: event.clientY });
                }}
                onPointerUp={(event) => finishDrag(event, item.id)}
                className={[
                  'min-h-20 rounded-2xl border-2 p-3 text-center font-black transition-all select-none',
                  matched
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-60'
                    : selected
                      ? 'bg-violet-600 border-violet-700 text-white scale-[1.02]'
                      : 'bg-violet-50 border-violet-200 text-gray-950 active:scale-[0.98]',
                ].join(' ')}
                style={{ touchAction: 'none' }}
              >
                {matched ? '✓ ' : ''}{item.piece}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <p className="text-gray-500 text-xs font-black uppercase">Situaciones o funciones</p>
        {destinations.map((item) => {
          const matched = matchedIds.includes(item.id);
          const wrong = wrongTargetId === item.id;
          const star = starTargetId === item.id;
          return (
            <div
              key={item.id}
              data-match-target={item.id}
              role="button"
              tabIndex={matched ? -1 : 0}
              onClick={() => {
                if (selectedId) tryMatch(selectedId, item.id);
              }}
              onKeyDown={(event) => {
                if (selectedId && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  tryMatch(selectedId, item.id);
                }
              }}
              className={[
                'relative rounded-2xl border-2 p-4 transition-all',
                matched
                  ? 'bg-emerald-50 border-emerald-300'
                  : wrong
                    ? 'bg-red-50 border-red-300 animate-pulse'
                    : selectedId
                      ? 'bg-white border-violet-300 cursor-pointer'
                      : 'bg-gray-50 border-gray-200',
              ].join(' ')}
            >
              {star && (
                <span
                  className="absolute -top-4 right-4 text-4xl animate-bounce"
                  aria-label="Conexión correcta"
                >
                  ⭐
                </span>
              )}
              <p className="text-gray-950 text-lg font-extrabold">{item.destination}</p>
              {matched && (
                <>
                  <p className="text-emerald-800 font-black mt-2">¡Muy bien! Conexión correcta.</p>
                  {item.audioPhrase && <AudioButton phrase={item.audioPhrase} />}
                </>
              )}
            </div>
          );
        })}
      </div>

      {wrongTargetId && (
        <p className="text-center text-amber-800 font-extrabold mb-4">
          Casi. Prueba otra conexión.
        </p>
      )}
      <PrimaryButton onClick={props.onContinue} disabled={!complete}>
        Continuar
      </PrimaryButton>
    </section>
  );
}

function PronounGroup(props: {
  title: string;
  pronouns: ReadonlyArray<{ english: string; spanish: string; pronunciation: string }>;
  columns: 'grid-cols-2' | 'grid-cols-3';
  last?: boolean;
}) {
  return (
    <div className={props.last ? '' : 'mb-4'}>
      <p className="text-gray-500 text-xs font-black uppercase mb-2">{props.title}</p>
      <div className={`grid ${props.columns} gap-2`}>
        {props.pronouns.map((pronoun) => (
          <PronounReviewButton key={pronoun.english} pronoun={pronoun} />
        ))}
      </div>
    </div>
  );
}

function PronounReviewButton(props: {
  pronoun: { english: string; spanish: string; pronunciation: string };
}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  const handlePlay = async () => {
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await generateSpeech(props.pronoun.english, 'normal');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handlePlay()}
      className={
        playing
          ? 'min-h-24 rounded-2xl bg-sky-600 border-2 border-sky-700 p-3 text-left text-white shadow-sm'
          : 'min-h-24 rounded-2xl bg-sky-50 border border-sky-200 p-3 text-left hover:bg-sky-100 active:scale-[0.98] transition-all'
      }
      aria-label={`Escuchar ${props.pronoun.english}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={playing ? 'text-xl font-black text-white' : 'text-xl font-black text-gray-950'}>
          {props.pronoun.english}
        </span>
        <span
          className={
            playing
              ? 'w-7 h-7 rounded-full bg-white text-sky-700 flex items-center justify-center text-xs'
              : 'w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs'
          }
          aria-hidden="true"
        >
          {playing ? '■' : '▶'}
        </span>
      </div>
      <span className={playing ? 'block text-xs font-semibold text-sky-50' : 'block text-xs font-semibold text-gray-600'}>
        {props.pronoun.spanish}
      </span>
      <span className={playing ? 'block font-black text-white mt-1' : 'block font-black text-sky-800 mt-1'}>
        {props.pronoun.pronunciation}
      </span>
    </button>
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
            <AudioButton phrase={UNIT_3_GUIDED_BUILD.result} />
          </div>
        )}
      </div>
      <PrimaryButton onClick={complete ? props.onContinue : props.onReveal}>
        {complete ? 'Terminar vista previa' : 'Agregar la siguiente pieza'}
      </PrimaryButton>
    </section>
  );
}

function ConnectorReviewStep({ onContinue }: { onContinue: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const question = UNIT_3_CONNECTOR_REVIEW[questionIndex];
  const correct = selected === question.answer;
  const isLast = questionIndex === UNIT_3_CONNECTOR_REVIEW.length - 1;

  const retry = () => {
    setSelected(null);
    setChecked(false);
  };

  const advance = () => {
    if (isLast) {
      onContinue();
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <section className="pt-4">
      <p className="text-sm font-extrabold uppercase text-amber-700 mb-2">
        Refuerzo de conectores
      </p>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-gray-950 text-2xl font-black">Ahora mézclalos</h1>
          <span className="bg-white border border-amber-200 rounded-lg px-3 py-1 text-amber-800 font-black">
            {questionIndex + 1}/{UNIT_3_CONNECTOR_REVIEW.length}
          </span>
        </div>
        <p className="text-gray-700 font-semibold leading-relaxed">
          Ya no verás cada conector por separado. Recuerda qué función cumple cada uno.
        </p>
      </div>

      {'audioPhrase' in question && (
        <div className="bg-white border border-sky-200 rounded-2xl p-4 mb-4">
          <p className="text-gray-600 text-sm font-bold mb-2">Escucha antes de responder</p>
          <AudioButton phrase={question.audioPhrase} />
        </div>
      )}

      <ExercisePanel
        prompt={`${question.instruction} ${question.prompt}`}
        options={[...question.options]}
        answer={question.answer}
        explanation={question.explanation}
        selected={selected}
        checked={checked}
        correct={correct}
        onSelect={setSelected}
        onCheck={() => setChecked(true)}
        onRetry={retry}
        onContinue={advance}
      />
      {checked && correct && (
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mt-4">
          <p className="text-sky-900 font-black mb-2">Escucha la frase completa</p>
          <p className="text-gray-950 text-lg font-extrabold">{question.resultAudio}</p>
          <AudioButton phrase={question.resultAudio} />
        </div>
      )}
    </section>
  );
}

function PreviewComplete({ onExit }: { onExit: () => void }) {
  return (
    <section className="pt-16 text-center">
      <div className="flex justify-center gap-5 mb-5" aria-hidden="true">
        <span className="text-4xl animate-bounce">🎈</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '180ms' }}>⭐</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '360ms' }}>🎈</span>
      </div>
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-4xl font-black mb-5">
        ✓
      </div>
      <p className="text-sm font-extrabold uppercase text-emerald-700 mb-2">
        ¡Primera parte completada!
      </p>
      <h1 className="text-3xl font-black text-gray-950 mb-4">
        Ya puedes usar verbos esenciales y unir ideas
      </h1>
      <p className="text-gray-700 font-medium leading-relaxed mb-8">
        Lo siguiente será practicar estas ideas en conversaciones y situaciones reales.
      </p>
      <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mb-4">
        <p className="text-sky-800 font-black">Siguiente etapa: práctica real</p>
        <p className="text-gray-700 text-sm font-semibold mt-1">
          Diálogo, práctica hablada y Misión Final.
        </p>
      </div>
      <PrimaryButton onClick={onExit}>Cerrar por ahora</PrimaryButton>
    </section>
  );
}

function RepetitionStep(props: {
  phrase: Unit3RepetitionPhrase;
  onContinue: () => void;
}) {
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const learnerAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const playModel = async () => {
    if (isPlayingModel) {
      stopSpeech();
      setIsPlayingModel(false);
      return;
    }
    setError(null);
    setIsPlayingModel(true);
    try {
      await generateSpeech(props.phrase.english, 'normal');
    } catch {
      setError('No se pudo reproducir el audio modelo. Intenta otra vez.');
    } finally {
      setIsPlayingModel(false);
    }
  };

  const startRecording = async () => {
    stopSpeech();
    setIsPlayingModel(false);
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar audio.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType =
        ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
          MediaRecorder.isTypeSupported(type),
        ) ?? '';
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 64000,
      });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (mobile) {
        recorder.start();
        intervalRef.current = setInterval(() => {
          if (recorder.state === 'recording') recorder.requestData();
        }, 500);
      } else {
        recorder.start(250);
      }
      setIsRecording(true);
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      setError('No pude usar el micrófono. Revisa el permiso e intenta otra vez.');
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    await new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
      recorder.stop();
    });
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);

    const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
    if (blob.size < 300) {
      setError('La grabación quedó muy corta. Intenta decir la frase completa.');
      return;
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const nextUrl = URL.createObjectURL(blob);
    audioUrlRef.current = nextUrl;
    setAudioUrl(nextUrl);
  };

  const playLearnerAudio = async () => {
    if (!learnerAudioRef.current) return;
    learnerAudioRef.current.currentTime = 0;
    learnerAudioRef.current.playbackRate = 1;
    await learnerAudioRef.current.play();
  };

  return (
    <section className="pt-4">
      <p className="text-sm font-extrabold uppercase text-violet-700 mb-2">Práctica de repetición</p>
      <h1 className="text-3xl font-black text-gray-950 mb-3">Escucha, repite y escúchate</h1>
      <p className="text-gray-700 font-medium leading-relaxed mb-5">
        Primero escucha el modelo. Después repite la frase con tu voz.
      </p>

      <div className="bg-white border-2 border-violet-200 rounded-3xl p-6 shadow-sm mb-4">
        <p className="text-gray-950 text-2xl font-black leading-tight">{props.phrase.english}</p>
        <p className="text-gray-600 font-semibold mt-2">{props.phrase.spanish}</p>
        <p className="text-violet-700 font-extrabold mt-3">{props.phrase.pronunciation}</p>
      </div>

      <div className="grid gap-3 mb-4">
        <button
          type="button"
          onClick={() => void playModel()}
          disabled={isRecording}
          className="w-full min-h-14 rounded-2xl bg-sky-500 text-white text-base font-extrabold disabled:bg-gray-300"
        >
          {isPlayingModel ? 'Detener audio modelo' : 'Escuchar audio modelo'}
        </button>
        <button
          type="button"
          onClick={() => void (isRecording ? stopRecording() : startRecording())}
          className={
            isRecording
              ? 'w-full min-h-14 rounded-2xl bg-red-500 text-white text-base font-extrabold animate-pulse'
              : 'w-full min-h-14 rounded-2xl bg-emerald-500 text-white text-base font-extrabold'
          }
        >
          {isRecording ? 'Detener grabación' : audioUrl ? 'Grabar otra vez' : 'Grabar mi voz'}
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-amber-900 font-bold">{error}</p>
        </div>
      )}

      {audioUrl && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 mb-4">
          <p className="text-gray-950 text-lg font-black mb-3">{props.phrase.motivation}</p>
          <audio ref={learnerAudioRef} src={audioUrl} className="hidden" />
          <button
            type="button"
            onClick={() => void playLearnerAudio()}
            className="w-full min-h-14 rounded-2xl bg-gray-900 text-white text-base font-extrabold"
          >
            Escuchar mi grabación
          </button>
        </div>
      )}

      <PrimaryButton onClick={props.onContinue} disabled={!audioUrl}>
        Continuar
      </PrimaryButton>
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
