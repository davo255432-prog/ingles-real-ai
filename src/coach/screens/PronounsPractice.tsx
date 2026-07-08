import React, { useMemo, useState } from 'react';
import { PRONOUNS_INFO, type PronounInfo } from '../data/curriculum';
import { generateSpeech, stopSpeech } from '../../services/speechApi';

interface PronounsPracticeProps {
  /** Salir de la práctica (volver atrás). */
  onExit: () => void;
  /** Marca la unidad como completada (sin navegar). Recibe el % logrado. */
  onUnitComplete: (score: number) => void;
  /** Volver al mapa del Nivel Básico (botón de la pantalla final). */
  onBackToMap: () => void;
}

// ── Modelo interno de pregunta de práctica ───────────────────────────────────
type QKind = 'visual' | 'es-en' | 'en-es' | 'figure' | 'we-they' | 'he-she-it' | 'listen';

interface PracticeQ {
  id: string;
  kind: QKind;
  category: string;     // etiqueta corta de la categoría
  prompt: string;       // enunciado
  icon?: string;        // figura grande (reconocimiento visual / figura)
  subText?: string;     // descripción bajo la figura
  audioWord?: string;   // inglés a reproducir (práctica de oído)
  options: string[];    // opciones mostradas
  answer: string;       // opción correcta
  pronounId: string;    // pronombre evaluado (para volver a su tarjeta)
}

// ── Utilidades de aleatorización ─────────────────────────────────────────────
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

function buildOptions(correct: string, pool: string[], n = 4): string[] {
  const distractors = sample(pool.filter((o) => o !== correct), n - 1);
  return shuffle([correct, ...distractors]);
}

const byId = (id: string): PronounInfo => PRONOUNS_INFO.find((p) => p.id === id)!;

const CorrectPronounCard: React.FC<{ pronoun: PronounInfo }> = ({ pronoun }) => (
  <div className="bg-white border border-emerald-100 rounded-3xl p-5 mb-4 text-center shadow-sm">
    <div className="text-6xl mb-2" aria-hidden="true">{pronoun.icon}</div>
    <p className="text-gray-950 text-5xl font-black leading-none">{pronoun.en}</p>
    <p className="text-gray-700 text-xl font-extrabold mt-3">{pronoun.translation ?? pronoun.meaning}</p>
    <div className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-100 px-4 py-2">
      <span className="text-emerald-900 text-lg font-black">Se dice: {pronoun.pron}</span>
    </div>
  </div>
);

const AchievementCard: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 mb-4 text-center shadow-sm">
    <div className="text-3xl mb-2" aria-hidden="true">⭐ ⭐ ⭐</div>
    <p className="text-emerald-800 text-xl font-black leading-tight">{title}</p>
    <p className="text-gray-900 font-extrabold mt-1">{subtitle}</p>
  </div>
);

// ── Generador del set de práctica (cambia en cada ronda) ──────────────────────
function generatePractice(): PracticeQ[] {
  const enPool = PRONOUNS_INFO.map((p) => p.en);
  const meaningPool = PRONOUNS_INFO.map((p) => p.meaning);

  // 1) Reconocimiento visual: figura → inglés
  const v = sample(PRONOUNS_INFO, 1)[0];
  const q1: PracticeQ = {
    id: 'm1', kind: 'visual', category: 'Reconoce la figura',
    prompt: '¿Qué pronombre corresponde a esta figura?',
    icon: v.icon, options: buildOptions(v.en, enPool), answer: v.en, pronounId: v.id,
  };

  // 2) Español → inglés
  const a = sample(PRONOUNS_INFO, 1)[0];
  const q2: PracticeQ = {
    id: 'm2', kind: 'es-en', category: 'Español → inglés',
    prompt: `¿Cómo se dice "${a.meaning}" en inglés?`,
    options: buildOptions(a.en, enPool), answer: a.en, pronounId: a.id,
  };

  // 3) Inglés → español
  const b = sample(PRONOUNS_INFO, 1)[0];
  const q3: PracticeQ = {
    id: 'm3', kind: 'en-es', category: 'Inglés → español',
    prompt: `¿Qué significa "${b.en}"?`,
    options: buildOptions(b.meaning, meaningPool), answer: b.meaning, pronounId: b.id,
  };

  // 4) Elegir pronombre según una figura (escena descrita)
  const scenes = [
    { icon: '🐶', text: 'un perro', id: 'it' },
    { icon: '📱', text: 'un teléfono', id: 'it' },
    { icon: '👩', text: 'una mujer', id: 'she' },
    { icon: '👨', text: 'un hombre', id: 'he' },
    { icon: '👨‍👩‍👧', text: 'una familia (sin ti)', id: 'they' },
    { icon: '🧑‍🤝‍🧑', text: 'tú y tus amigos', id: 'we' },
  ];
  const sc = sample(scenes, 1)[0];
  const q4: PracticeQ = {
    id: 'm4', kind: 'figure', category: 'Elige el pronombre',
    prompt: '¿Qué pronombre usarías?',
    icon: sc.icon, subText: sc.text,
    options: buildOptions(byId(sc.id).en, enPool), answer: byId(sc.id).en, pronounId: sc.id,
  };

  // 5) Diferenciar we / they
  const wt = sample([
    { text: 'Un grupo que TE incluye a ti (tú + otras personas)', id: 'we' },
    { text: 'Un grupo de personas que NO te incluye a ti', id: 'they' },
  ], 1)[0];
  const q5: PracticeQ = {
    id: 'm5', kind: 'we-they', category: 'we o they',
    prompt: wt.text, options: shuffle(['we', 'they']),
    answer: byId(wt.id).en, pronounId: wt.id,
  };

  // 6) Diferenciar he / she / it
  const hsi = sample([
    { text: 'un hombre o un niño', id: 'he' },
    { text: 'una mujer o una niña', id: 'she' },
    { text: 'una cosa, un objeto o un animal', id: 'it' },
  ], 1)[0];
  const q6: PracticeQ = {
    id: 'm6', kind: 'he-she-it', category: 'he, she o it',
    prompt: `Para ${hsi.text}, usamos…`, options: shuffle(['he', 'she', 'it']),
    answer: byId(hsi.id).en, pronounId: hsi.id,
  };

  // Práctica de oído: 5 muestras (solo contenido ya estudiado).
  // Para el significado usamos la traducción pura (p. ej. "it" → "eso / ello"),
  // no el texto del cuadro resumen que puede mezclar uso.
  const translationPool = PRONOUNS_INFO.map((p) => p.translation ?? p.meaning);
  const listen = sample(PRONOUNS_INFO, 5).map((p, i): PracticeQ => {
    const meaningText = p.translation ?? p.meaning;
    return {
      id: `l${i}`, kind: 'listen', category: 'Práctica de oído',
      prompt: 'Escucha y elige el significado.', audioWord: p.en,
      options: buildOptions(meaningText, translationPool), answer: meaningText, pronounId: p.id,
    };
  });

  return [...shuffle([q1, q2, q3, q4, q5, q6]), ...listen];
}

// ── Componente ────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'summary' | 'exercises' | 'done';
type Stage = 'answer' | 'firstError' | 'teachCard';

export const PronounsPractice: React.FC<PronounsPracticeProps> = ({ onExit, onUnitComplete, onBackToMap }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0); // fuerza regeneración en "Practicar otra vez"
  const questions = useMemo(() => generatePractice(), [round]);

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('answer');
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // Estado del audio de la práctica de oído.
  //  idle    → aún no se ha reproducido en esta pregunta
  //  loading → solicitando/reproduciendo la voz
  //  ready   → se reprodujo correctamente (habilita comprobar)
  //  error   → la voz falló (muestra reintentar)
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [audioError, setAudioError] = useState<string | null>(null);

  const q = questions[qIndex];

  const resetQuestion = () => {
    stopSpeech(); // corta cualquier audio anterior antes de cambiar de muestra
    setSelected(null);
    setStage('answer');
    setAttempts(0);
    setAudioState('idle');
    setAudioError(null);
  };

  const startPractice = () => {
    setQIndex(0);
    setCorrectCount(0);
    resetQuestion();
    setPhase('exercises');
  };

  const playAgain = () => {
    stopSpeech();
    setRound((r) => r + 1);
    setQIndex(0);
    setCorrectCount(0);
    resetQuestion();
    setPhase('intro');
  };

  const playAudio = async (text: string) => {
    if (!text) return;
    setAudioState('loading');
    setAudioError(null);
    try {
      await generateSpeech(text);
      setAudioState('ready');
    } catch (err) {
      // Registramos el fallo en consola para diagnosticar (red/servidor).
      console.error('[PronounsPractice] Falló la reproducción de voz:', err);
      setAudioState('error');
      setAudioError(err instanceof Error ? err.message : 'No se pudo reproducir el audio.');
    }
  };

  const advance = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      resetQuestion();
    } else {
      const score = Math.round((correctCount / questions.length) * 100);
      stopSpeech();
      setPhase('done');
      onUnitComplete(score); // marca completada (sin navegar; la pantalla final decide)
    }
  };

  const handleCheck = () => {
    if (selected === null) return;
    // No evaluamos sin un objetivo válido…
    if (!q || !q.answer) return;
    // …ni una pregunta de oído cuyo audio no se haya reproducido todavía.
    if (q.kind === 'listen' && audioState !== 'ready') return;
    if (selected === q.answer) {
      // Acierto: cuenta como correcto si es el primer intento sin errores.
      if (attempts === 0) setCorrectCount((c) => c + 1);
      setStage('answer'); // mostraremos feedback de acierto por bandera aparte
      advanceAfterCorrect();
    } else {
      const next = attempts + 1;
      setAttempts(next);
      // 1er error → explicación + ejemplo; 2º error → tarjeta del pronombre.
      setStage(next >= 2 ? 'teachCard' : 'firstError');
    }
  };

  // Mostramos un breve "¡Correcto!" antes de avanzar.
  const [showCorrect, setShowCorrect] = useState(false);
  const advanceAfterCorrect = () => {
    setShowCorrect(true);
  };
  const continueFromCorrect = () => {
    setShowCorrect(false);
    advance();
  };

  const retrySameQuestion = () => {
    // Reintento tras el primer error (mismo pronombre, opciones barajadas).
    setSelected(null);
    setStage('answer');
  };

  const continueFromTeachCard = () => {
    // Tras repasar la tarjeta, seguimos a la siguiente pregunta (no al inicio).
    advance();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FASE: Cuadro resumen
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="flex items-center gap-3 px-5 pt-12 pb-2">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Volver"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-gray-400 text-sm font-medium">Unidad 1 · Pronombres</span>
        </div>

        <div className="px-6 pt-5 pb-4">
          <p className="text-emerald-700 text-xs font-black uppercase tracking-wide mb-2">
            Aquí empieza tu meta
          </p>
          <h1 className="text-4xl font-black text-gray-950 leading-tight mb-4">
            Tu primera base para hablar inglés
          </h1>
          <div className="bg-emerald-600 rounded-3xl p-5 shadow-md mb-5">
            <p className="text-white text-xl font-extrabold leading-snug">
              Hoy no vas a memorizar palabras sueltas.
            </p>
            <p className="text-emerald-50 text-base font-bold leading-relaxed mt-3">
              Vas a aprender quién habla, de quién hablamos y cómo empezar a formar frases reales.
            </p>
          </div>
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-4 shadow-sm">
            <p className="text-gray-950 text-lg font-black leading-snug">
              Los pronombres son el primer paso.
            </p>
            <p className="text-gray-600 text-sm font-semibold leading-relaxed mt-2">
              Sin ellos no sabemos quién hace la acción. Por eso empezamos aquí.
            </p>
          </div>
        </div>

        <div className="px-5 flex-1">
          <div className="grid grid-cols-2 gap-3">
            {PRONOUNS_INFO.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 min-h-[132px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl" aria-hidden="true">{p.icon}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-base font-black px-3 py-1.5 rounded-full">
                    {p.pron}
                  </span>
                </div>
                <p className="text-gray-950 text-3xl font-black leading-none mt-3">{p.en}</p>
                <p className="text-gray-600 text-sm font-bold leading-snug mt-2">{p.translation ?? p.meaning}</p>
                <p className="text-emerald-800 text-sm font-black uppercase tracking-wide mt-3">
                  se dice: <span className="text-lg">{p.pron}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-8">
          <button
            onClick={() => setPhase('summary')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Empezar con los pronombres
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="flex items-center gap-3 px-5 pt-12 pb-2">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Volver"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-gray-400 text-sm font-medium">Pronombres · Resumen</span>
        </div>

        <div className="px-6 pt-4 pb-2">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Cuadro resumen</h1>
          <p className="text-gray-500 text-sm">
            Repasa los 7 pronombres antes de practicar.
          </p>
        </div>

        <div className="px-5 flex-1">
          <div className="bg-emerald-600 rounded-3xl p-5 mb-4 shadow-md">
            <p className="text-white text-xl font-extrabold leading-snug">
              Primero reconoce quién habla o de quién hablamos.
            </p>
            <p className="text-emerald-50 text-sm font-bold leading-relaxed mt-2">
              Si fallas, repasas y vuelves. Así se construye la base.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {PRONOUNS_INFO.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <span className="text-2xl w-8 text-center shrink-0">{p.icon}</span>
                <div className="w-14 shrink-0">
                  <span className="text-gray-900 text-lg font-extrabold">{p.en}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 font-medium leading-snug">{p.meaning}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                  🔊 {p.pron}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-8">
          <button
            onClick={startPractice}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Empezar la práctica
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FASE: Pantalla final de unidad completada
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="flex items-center gap-3 px-5 pt-12 pb-2">
          <span className="text-gray-400 text-sm font-medium">Coach IA</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-4xl mb-3" aria-hidden="true">🎈 ⭐ 🎈</div>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-emerald-700 text-sm font-black uppercase tracking-wide mb-2">Primera base lograda</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Unidad Pronombres completada</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Ya puedes reconocer los pronombres personales y distinguir quién realiza la acción.
          </p>
        </div>
        <div className="px-5 pb-8 flex flex-col gap-3">
          <button
            onClick={onBackToMap}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Volver al mapa del Nivel Básico
          </button>
          <button
            onClick={playAgain}
            className="w-full bg-white border border-gray-200 text-gray-700 text-base font-bold rounded-2xl py-4 hover:bg-gray-50 transition-all"
          >
            Practicar otra vez
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FASE: Ejercicios
  // ─────────────────────────────────────────────────────────────────────────
  const progressPct = Math.round((qIndex / questions.length) * 100);
  const info = byId(q.pronounId);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* Top bar + progreso */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
            aria-label="Salir de la práctica"
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
            {qIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col pb-8">
        {/* Etiqueta de categoría */}
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
          {q.category}
        </p>

        {/* Enunciado */}
        <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-4">{q.prompt}</h2>

        {/* Figura (reconocimiento visual / escena) */}
        {q.icon && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 mb-5 text-center">
            <div className="text-6xl mb-1">{q.icon}</div>
            {q.subText && <p className="text-gray-500 font-medium">{q.subText}</p>}
          </div>
        )}

        {/* Botón de audio (práctica de oído) */}
        {q.kind === 'listen' && q.audioWord && (
          <div className="flex flex-col items-center mb-5">
            <button
              onClick={() => playAudio(q.audioWord!)}
              disabled={audioState === 'loading'}
              className={
                audioState === 'error'
                  ? 'w-28 h-28 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg transition-all'
                  : 'w-28 h-28 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-70 text-white flex flex-col items-center justify-center shadow-lg transition-all'
              }
              aria-label="Reproducir audio"
            >
              <span className="text-4xl">
                {audioState === 'loading' ? '🔈' : audioState === 'error' ? '⚠️' : '🔊'}
              </span>
              <span className="text-xs font-bold mt-1">
                {audioState === 'loading'
                  ? 'Cargando…'
                  : audioState === 'error'
                    ? 'Reintentar'
                    : audioState === 'ready'
                      ? 'Escuchar otra vez'
                      : 'Escuchar'}
              </span>
            </button>
            {audioState === 'error' && (
              <p className="text-red-600 text-sm font-medium text-center mt-3 max-w-xs">
                {audioError ?? 'No se pudo reproducir el audio.'} Toca para reintentar.
              </p>
            )}
            {audioState === 'idle' && (
              <p className="text-gray-400 text-xs text-center mt-3">
                Escucha el audio para poder responder.
              </p>
            )}
          </div>
        )}

        {/* Opciones */}
        {stage !== 'teachCard' && !showCorrect && (
          <div className="flex flex-col gap-3 mb-4">
            {q.options.map((opt) => {
              const isSel = selected === opt;
              const cls = isSel
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-800';
              return (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={`w-full text-left border-2 rounded-2xl px-4 py-3.5 font-semibold transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback: acierto */}
        {showCorrect && (
          <>
          <AchievementCard
            title="¡Muy bien!"
            subtitle="Ya reconoces quién hace la acción."
          />
          <CorrectPronounCard pronoun={info} />
          </>
        )}

        {/* Feedback: primer error → explicación del Coach + ejemplo distinto */}
        {stage === 'firstError' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🎓</span>
              <span className="text-amber-800 font-bold text-sm">Coach IA</span>
            </div>
            <p className="text-amber-800 text-sm leading-relaxed mb-2">{info.tip}</p>
            <p className="text-amber-700 text-sm">
              Ejemplo: <span className="font-semibold">{info.example}</span>
            </p>
          </div>
        )}

        {/* Segundo error → tarjeta donde se enseñó el pronombre */}
        {stage === 'teachCard' && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-3">
              Repasa esta tarjeta y luego sigue con la práctica:
            </p>
            <div className="bg-white rounded-3xl p-6 shadow-md border border-emerald-100 text-center">
              <div className="text-5xl mb-3">{info.icon}</div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{info.en}</p>
              <p className="text-gray-500 text-lg mb-3">{info.meaning}</p>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                🔊 {info.pron}
              </span>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">{info.tip}</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="mt-auto flex flex-col gap-3">
          {showCorrect ? (
            <button
              onClick={continueFromCorrect}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
            >
              {qIndex === questions.length - 1 ? 'Terminar' : 'Siguiente'}
            </button>
          ) : stage === 'firstError' ? (
            <button
              onClick={retrySameQuestion}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
            >
              Intentar de nuevo
            </button>
          ) : stage === 'teachCard' ? (
            <button
              onClick={continueFromTeachCard}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
            >
              Volver a la práctica
            </button>
          ) : (() => {
            // En oído: hay que escuchar el audio (ready) antes de comprobar.
            const needsAudio = q.kind === 'listen' && audioState !== 'ready';
            const canCheck = selected !== null && !!q.answer && !needsAudio;
            return (
              <button
                disabled={!canCheck}
                onClick={handleCheck}
                className={
                  canCheck
                    ? 'w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200'
                    : 'w-full bg-gray-200 text-gray-400 text-base font-bold rounded-2xl py-4 cursor-not-allowed'
                }
              >
                {needsAudio ? 'Escucha el audio primero' : 'Comprobar'}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
