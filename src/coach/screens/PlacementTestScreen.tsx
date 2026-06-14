import React, { useMemo, useState } from 'react';
import type { LevelId } from '../types';
import { PLACEMENT_QUESTIONS, suggestLevel, LEVEL_EXPLANATION } from '../data/placementTest';
import { generateSpeech } from '../../services/speechApi';

interface PlacementTestScreenProps {
  onBack: () => void;
  /** Devuelve el nivel sugerido y los aciertos al terminar la prueba. */
  onComplete: (suggestedLevel: LevelId, correct: number, total: number) => void;
}

const LEVEL_LABEL: Record<LevelId, string> = {
  1: 'Nivel Básico — Desde cero',
  2: 'Nivel Intermedio',
  3: 'Nivel Avanzado',
  4: 'Nivel 4',
  5: 'Nivel 5',
};

/**
 * Prueba rápida de ubicación con formatos mixtos (opción múltiple, completar,
 * ordenar palabras, comprensión auditiva y situación real).
 * Diseño y navegación iguales a la versión anterior.
 */
export const PlacementTestScreen: React.FC<PlacementTestScreenProps> = ({ onBack, onComplete }) => {
  const total = PLACEMENT_QUESTIONS.length;
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  // Estado para formatos de selección (MC, fill-blank, listening, situation)
  const [selected, setSelected] = useState<number | null>(null);
  // Estado para ordenar palabras
  const [built, setBuilt] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  // Estado de la voz
  const [playing, setPlaying] = useState(false);

  const question = PLACEMENT_QUESTIONS[index];
  const suggested = suggestLevel(correct);
  const isWordOrder = question.format === 'word-order';

  // Piezas restantes para ordenar (las que aún no se colocaron)
  const remaining = useMemo(() => {
    if (!isWordOrder || !question.scrambled) return [];
    const pool = [...question.scrambled];
    built.forEach((w) => {
      const i = pool.indexOf(w);
      if (i !== -1) pool.splice(i, 1);
    });
    return pool;
  }, [isWordOrder, question.scrambled, built]);

  const wordOrderCorrect =
    isWordOrder &&
    !!question.answerOrder &&
    built.length === question.answerOrder.length &&
    built.every((w, i) => w === question.answerOrder![i]);

  const answered = isWordOrder ? checked : selected !== null;

  // ── Handlers ──
  const handleSelect = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === question.answerIndex) setCorrect((c) => c + 1);
  };

  const handleAddWord = (word: string) => {
    if (checked) return;
    setBuilt((b) => [...b, word]);
  };

  const handleRemoveWord = (pos: number) => {
    if (checked) return;
    setBuilt((b) => b.filter((_, i) => i !== pos));
  };

  const handleCheckOrder = () => {
    if (checked) return;
    setChecked(true);
    if (wordOrderCorrect) setCorrect((c) => c + 1);
  };

  const handlePlayAudio = async () => {
    if (!question.audioText || playing) return;
    setPlaying(true);
    try {
      await generateSpeech(question.audioText);
    } catch {
      // Error de voz no bloquea la prueba
    } finally {
      setPlaying(false);
    }
  };

  const handleNext = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected(null);
      setBuilt([]);
      setChecked(false);
    } else {
      setFinished(true);
    }
  };

  // ── Render de las opciones tipo selección ──
  const renderOptions = () => (
    <div className="flex flex-col gap-3">
      {(question.options ?? []).map((opt, i) => {
        const isAnswered = selected !== null;
        const isCorrect = i === question.answerIndex;
        const isChosen = i === selected;

        let style = 'bg-white border-gray-100 text-gray-800';
        if (isAnswered && isCorrect) style = 'bg-green-50 border-green-300 text-green-800';
        else if (isAnswered && isChosen && !isCorrect) style = 'bg-red-50 border-red-300 text-red-800';

        return (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={isAnswered}
            className={`w-full text-left rounded-2xl border p-4 shadow-sm transition-all duration-150 ${style} ${!isAnswered ? 'hover:bg-gray-50 active:scale-[0.98]' : ''}`}
          >
            <span className="font-semibold">{opt}</span>
          </button>
        );
      })}
    </div>
  );

  // ── Render de ordenar palabras ──
  const renderWordOrder = () => (
    <div className="flex flex-col gap-5">
      {/* Línea construida */}
      <div
        className={`min-h-[56px] rounded-2xl border-2 border-dashed p-3 flex flex-wrap gap-2 items-center ${
          checked
            ? wordOrderCorrect
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-white'
        }`}
      >
        {built.length === 0 && (
          <span className="text-gray-300 text-sm px-1">Toca las palabras en orden…</span>
        )}
        {built.map((w, i) => (
          <button
            key={`${w}-${i}`}
            onClick={() => handleRemoveWord(i)}
            disabled={checked}
            className="bg-emerald-500 text-white text-sm font-bold px-3 py-2 rounded-xl active:scale-[0.96]"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Piezas disponibles */}
      {!checked && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((w, i) => (
            <button
              key={`${w}-${i}`}
              onClick={() => handleAddWord(w)}
              className="bg-white border border-gray-200 text-gray-800 text-sm font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 active:scale-[0.96]"
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Comprobar */}
      {!checked && (
        <button
          onClick={handleCheckOrder}
          disabled={remaining.length > 0}
          className="w-full bg-emerald-500 disabled:bg-gray-300 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-3.5 transition-all duration-200"
        >
          Comprobar
        </button>
      )}

      {/* Feedback con la respuesta correcta si falló */}
      {checked && !wordOrderCorrect && question.answerOrder && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Respuesta correcta</p>
          <p className="text-green-800 font-bold">{question.answerOrder.join(' ')}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
          aria-label="Volver"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-gray-400 text-sm font-medium">Prueba rápida</span>
      </div>

      {!finished ? (
        <>
          {/* Progress */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                Pregunta {index + 1} de {total}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="px-6 pt-7 pb-4 flex-1">
            <h1 className="text-xl font-extrabold text-gray-900 leading-snug mb-4">
              {question.prompt}
            </h1>

            {/* Escena (situación real) */}
            {question.scene && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <p className="text-gray-700 text-sm leading-relaxed">{question.scene}</p>
              </div>
            )}

            {/* Frase con hueco (completar) */}
            {question.sentence && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm">
                <p className="text-gray-900 text-lg font-semibold text-center">{question.sentence}</p>
              </div>
            )}

            {/* Botón de audio (comprensión auditiva) */}
            {question.format === 'listening' && (
              <button
                onClick={handlePlayAudio}
                disabled={playing}
                className="w-full bg-emerald-500 disabled:bg-emerald-300 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 mb-5 flex items-center justify-center gap-2 transition-all duration-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                {playing ? 'Reproduciendo…' : 'Escuchar'}
              </button>
            )}

            {isWordOrder ? renderWordOrder() : renderOptions()}
          </div>

          {/* Next */}
          <div className="px-5 pb-8">
            <button
              onClick={handleNext}
              disabled={!answered}
              className="w-full bg-emerald-500 disabled:bg-gray-300 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
            >
              {index + 1 < total ? 'Siguiente' : 'Ver resultado'}
            </button>
          </div>
        </>
      ) : (
        /* Result */
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-5">
            <span className="text-3xl">🧭</span>
          </div>
          <p className="text-gray-500 mb-1">Acertaste {correct} de {total}</p>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Tu nivel sugerido</h1>
          <p className="text-emerald-600 text-xl font-bold mb-4">{LEVEL_LABEL[suggested]}</p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8">
            <p className="text-gray-700 leading-relaxed">{LEVEL_EXPLANATION[suggested]}</p>
          </div>
          <button
            onClick={() => onComplete(suggested, correct, total)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-base font-bold rounded-2xl py-4 transition-all duration-200"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};
