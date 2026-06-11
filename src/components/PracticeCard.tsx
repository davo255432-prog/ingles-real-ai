import React from 'react';
import type { PracticeData } from '../types';
import { Card } from './Card';
import type { KeywordEntry } from '../types';

interface PracticeCardProps {
  data: PracticeData;
  onPracticeBasic?: () => void;
  onPracticeNatural?: () => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ data, onPracticeBasic, onPracticeNatural }) => {
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
        <p className="text-gray-800 font-semibold text-lg leading-snug mb-1">
          "{data.basicForm}"
        </p>
        <p className="text-blue-400 text-sm italic font-medium leading-snug mb-2">
          {data.basicPronunciation || data.pronunciation}
        </p>
        <p className="text-gray-500 text-xs mb-3">📍 {data.situation}</p>
        {onPracticeBasic && (
          <button
            onClick={onPracticeBasic}
            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Practicar esta frase
          </button>
        )}
      </Card>

      <Card accent="green">
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
          Forma natural
        </p>
        <p className="text-gray-800 font-semibold text-lg leading-snug mb-1">
          "{data.naturalForm}"
        </p>
        <p className="text-green-500 text-sm italic font-medium leading-snug mb-2">
          {data.pronunciation}
        </p>
        <p className="text-gray-500 text-xs mb-3">📍 {data.situation}</p>
        {onPracticeNatural && (
          <button
            onClick={onPracticeNatural}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Practicar esta frase
          </button>
        )}
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
      {(data.basicPhraseBreakdown?.length || data.phraseBreakdown?.length) ? (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Entiende las frases
          </p>

          {/* Basic breakdown */}
          {data.basicPhraseBreakdown && data.basicPhraseBreakdown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-blue-400 mb-2">Forma básica</p>
              <div className="flex flex-col gap-2">
                {data.basicPhraseBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-400 text-white text-sm font-bold px-3 py-1 rounded-lg">
                      {item.part}
                    </span>
                    <span className="text-blue-400 font-bold text-sm">→</span>
                    <span className="text-gray-700 text-sm font-medium">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Natural breakdown */}
          {data.phraseBreakdown && data.phraseBreakdown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-blue-600 mb-2">Forma natural</p>
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
        </div>
      ) : null}

      {/* ── Keywords ─────────────────────────────────────────────── */}
      {(data.basicKeywords?.length || data.keywords?.length) ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
            Palabras clave
          </p>

          {/* Basic keywords */}
          {data.basicKeywords && data.basicKeywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-yellow-600 mb-3">Forma básica</p>
              <div className="flex flex-col gap-3">
                {data.basicKeywords.map((kw: KeywordEntry, i: number) => (
                  <div key={i} className="bg-white border border-yellow-100 rounded-xl p-3">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-bold text-yellow-700 text-sm leading-snug">{kw.word}</span>
                      <span className="text-yellow-500 text-xs italic font-medium shrink-0">{kw.pronunciation}</span>
                    </div>
                    <p className="text-gray-700 text-sm font-semibold mb-1">{kw.meaning}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mb-2">{kw.usage}</p>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 flex flex-col gap-0.5">
                      <p className="text-gray-800 text-xs font-semibold">{kw.exampleEnglish}</p>
                      <p className="text-gray-500 text-xs">{kw.exampleSpanish}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider between sections */}
          {data.basicKeywords && data.basicKeywords.length > 0 && data.keywords && data.keywords.length > 0 && (
            <div className="border-t border-yellow-200" />
          )}

          {/* Natural keywords */}
          {data.keywords && data.keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-yellow-700 mb-3">Forma natural</p>
              <div className="flex flex-col gap-3">
                {data.keywords.map((kw: KeywordEntry, i: number) => (
                  <div key={i} className="bg-white border border-yellow-100 rounded-xl p-3">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-bold text-yellow-700 text-sm leading-snug">{kw.word}</span>
                      <span className="text-yellow-500 text-xs italic font-medium shrink-0">{kw.pronunciation}</span>
                    </div>
                    <p className="text-gray-700 text-sm font-semibold mb-1">{kw.meaning}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mb-2">{kw.usage}</p>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 flex flex-col gap-0.5">
                      <p className="text-gray-800 text-xs font-semibold">{kw.exampleEnglish}</p>
                      <p className="text-gray-500 text-xs">{kw.exampleSpanish}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

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
