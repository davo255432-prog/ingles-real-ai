import React, { useState } from 'react';
import type { UrgentPhraseData } from '../types';
import { Button } from '../components/Button';

interface UrgentPhraseReadyScreenProps {
  data: UrgentPhraseData;
  onBack: () => void;
  onShowBig: () => void;
  onPractice: () => void;
  onTranslateAnother: () => void;
}

export const UrgentPhraseReadyScreen: React.FC<UrgentPhraseReadyScreenProps> = ({
  data,
  onBack,
  onShowBig,
  onPractice,
  onTranslateAnother,
}) => {
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleListen = () => {
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-teal-500 to-emerald-500 px-5 pt-14 pb-8">
        <div className="flex items-start gap-3 mb-5">
          <button
            onClick={onBack}
            className="mt-0.5 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-wide mb-1">Tu frase está lista</p>
            <h1 className="text-white text-2xl font-extrabold leading-tight">Lista para usar</h1>
          </div>
        </div>

        {/* The phrase — highlighted */}
        <div className="bg-white/15 rounded-2xl p-5">
          <p className="text-teal-100 text-xs font-semibold uppercase tracking-wide mb-2">En inglés</p>
          <p className="text-white text-2xl font-extrabold leading-snug mb-3">
            "{data.phraseInEnglish}"
          </p>
          <p className="text-teal-100 text-sm italic">
            🔊 {data.pronunciation}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
        {/* Situation */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-2">
            Lo que necesitas decir
          </p>
          <p className="text-gray-700 leading-relaxed">"{data.situation}"</p>
        </div>

        {/* Mini help */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5 flex gap-3">
          <span className="text-lg flex-shrink-0">💡</span>
          <p className="text-gray-600 text-sm leading-relaxed">{data.miniHelp}</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Button
            onClick={handleListen}
            color="blue"
            variant={playing ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            icon={
              playing ? (
                <span className="flex gap-0.5">
                  <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )
            }
          >
            {playing ? 'Escuchando...' : 'Escuchar'}
          </Button>

          <Button
            onClick={handleSave}
            color="green"
            variant={saved ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            icon={
              saved ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              )
            }
          >
            {saved ? 'Guardada ✓' : 'Guardar'}
          </Button>
        </div>

        <Button
          onClick={onShowBig}
          color="gray"
          variant="secondary"
          size="md"
          fullWidth
          className="mb-3"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          }
        >
          Mostrar frase grande
        </Button>

        <Button
          onClick={onPractice}
          color="green"
          variant="primary"
          size="lg"
          fullWidth
          className="mb-2"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          }
        >
          Practicar después
        </Button>

        <Button
          onClick={onTranslateAnother}
          color="gray"
          variant="ghost"
          size="md"
          fullWidth
        >
          Traducir otra frase
        </Button>
      </div>
    </div>
  );
};
