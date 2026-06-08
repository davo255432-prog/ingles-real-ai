import React from 'react';
import type { PracticeData } from '../types';
import { Card } from './Card';
import type { KeywordEntry } from '../types';

interface PracticeCardProps {
  data: PracticeData;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-4">
      <Card accent="orange">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">
          Tu situación
        </p>
        <p className="text-gray-700 leading-relaxed">"{data.situation}"</p>
      </Card>

      <Card accent="blue">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
          Forma básica
        </p>
        <p className="text-gray-800 font-semibold text-lg leading-snug">
          "{data.basicForm}"
        </p>
      </Card>

      <Card accent="green">
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
          Forma natural
        </p>
        <p className="text-gray-800 font-semibold text-lg leading-snug">
          "{data.naturalForm}"
        </p>
      </Card>

      <Card accent="purple" className="bg-purple-50">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
          Pronunciación aproximada
        </p>
        <p className="text-purple-700 font-medium italic leading-relaxed">
          "{data.pronunciation}"
        </p>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
          Mini gramática
        </p>
        <p className="text-gray-700 mb-3 leading-relaxed">{data.grammarRule}</p>
        <div className="flex flex-col gap-1.5">
          {data.grammarExamples.map((example, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <p className="text-gray-700 font-medium">"{example}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Phrase breakdown ─────────────────────────────────────── */}
      {data.phraseBreakdown && data.phraseBreakdown.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
            Entiende la frase
          </p>
          <div className="flex flex-col gap-2">
            {data.phraseBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                  {item.part}
                </span>
                <span className="text-blue-400 font-bold text-sm">→</span>
                <span className="text-gray-700 text-sm font-medium">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Keywords ─────────────────────────────────────────────── */}
      {data.keywords && data.keywords.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">
            Palabras clave
          </p>
          <div className="flex flex-col gap-3">
            {data.keywords.map((kw: KeywordEntry, i: number) => (
              <div key={i} className="bg-white border border-yellow-100 rounded-xl p-3">
                {/* Word + pronunciation */}
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className="font-bold text-yellow-700 text-sm leading-snug">
                    {kw.word}
                  </span>
                  <span className="text-yellow-500 text-xs italic font-medium shrink-0">
                    {kw.pronunciation}
                  </span>
                </div>
                {/* Meaning */}
                <p className="text-gray-700 text-sm font-semibold mb-1">{kw.meaning}</p>
                {/* Usage note */}
                <p className="text-gray-500 text-xs leading-relaxed mb-2">{kw.usage}</p>
                {/* Example */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 flex flex-col gap-0.5">
                  <p className="text-gray-800 text-xs font-semibold">{kw.exampleEnglish}</p>
                  <p className="text-gray-500 text-xs">{kw.exampleSpanish}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Why this phrase ──────────────────────────────────────── */}
      {data.whyThisPhrase && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            ¿Por qué se dice así?
          </p>
          <p className="text-gray-700 leading-relaxed text-sm">{data.whyThisPhrase}</p>
        </div>
      )}

      {/* ── When to use + basic vs natural ──────────────────────── */}
      {(data.whenToUse || data.basicVsNatural) && (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex flex-col gap-4">
          {data.whenToUse && (
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
                Cuándo usarla
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">{data.whenToUse}</p>
            </div>
          )}
          {data.whenToUse && data.basicVsNatural && (
            <div className="border-t border-teal-100" />
          )}
          {data.basicVsNatural && (
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
                Básica vs. natural
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">{data.basicVsNatural}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
