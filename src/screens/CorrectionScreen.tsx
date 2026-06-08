import React from 'react';
import type { CorrectionData } from '../types';
import { CorrectionCard } from '../components/CorrectionCard';
import { Button } from '../components/Button';

interface CorrectionScreenProps {
  data: CorrectionData;
  onPracticeAgain: () => void;
  onContinue: () => void;
}

// ── Score theme ────────────────────────────────────────────────────────────

function getScoreTheme(score: number) {
  if (score >= 80) return {
    gradient: 'from-green-400 to-green-500',
    emoji: '🎉',
    title: '¡Muy bien!',
    subtitle: 'Vamos a mejorar un detalle.',
  };
  if (score >= 50) return {
    gradient: 'from-amber-400 to-amber-500',
    emoji: '💪',
    title: '¡Buen intento!',
    subtitle: 'Con práctica lo logras.',
  };
  return {
    gradient: 'from-orange-400 to-orange-600',
    emoji: '🔄',
    title: '¡Sigue practicando!',
    subtitle: 'Repite hasta que fluya.',
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export const CorrectionScreen: React.FC<CorrectionScreenProps> = ({
  data,
  onPracticeAgain,
  onContinue,
}) => {
  const score = data.score ?? 75;
  const theme = getScoreTheme(score);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Hero banner (dynamic) ── */}
      <div className={`bg-gradient-to-br ${theme.gradient} px-5 pt-14 pb-8`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            {theme.emoji}
          </div>
          <div>
            <h1 className="text-white text-2xl font-extrabold">{theme.title}</h1>
            <p className="text-white/80 text-sm mt-0.5">{theme.subtitle}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-xs font-semibold">Tu pronunciación</span>
            <span className="text-white font-bold text-sm">{score}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2.5">
            <div
              className="bg-white rounded-full h-2.5 transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Fallback notice */}
        {data.usedFallback && (
          <div className="mt-4 bg-white/20 border border-white/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-white text-sm">⚠️</span>
            <p className="text-white/90 text-xs leading-snug">
              No pudimos analizar la voz. Mostramos una práctica de ejemplo.
            </p>
          </div>
        )}
      </div>

      {/* ── Correction content ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 flex flex-col gap-4">

        {/* Core correction card (existing) */}
        <CorrectionCard data={data} />

        {/* Missing words */}
        {data.missingWords && data.missingWords.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">❌</span>
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                Palabras que faltaron
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.missingWords.map((word, i) => (
                  <span
                    key={i}
                    className="bg-red-100 text-red-700 text-sm font-semibold px-2.5 py-0.5 rounded-lg"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pronunciation focus */}
        {data.pronunciationFocus && data.pronunciationFocus.length > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">
              Enfócate en esto al repetir
            </p>
            <div className="flex flex-col gap-2">
              {data.pronunciationFocus.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">🎯</span>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-bold text-purple-700">{item.word}</span>
                    {' — '}
                    {item.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Actions ── */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button
          onClick={onPracticeAgain}
          color="orange"
          variant="primary"
          size="lg"
          fullWidth
          className="mb-3"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          }
        >
          Practicar de nuevo
        </Button>

        <Button
          onClick={onContinue}
          color="gray"
          variant="secondary"
          size="lg"
          fullWidth
        >
          Continuar
        </Button>
      </div>

    </div>
  );
};
