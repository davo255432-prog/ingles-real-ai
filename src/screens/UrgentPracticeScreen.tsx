import React, { useState, useRef, useEffect } from 'react';
import type { UrgentPhraseData } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

type VoiceState = 'idle' | 'playing' | 'listening';

interface UrgentPracticeScreenProps {
  data: UrgentPhraseData;
  onBack: () => void;
  onCorrection: () => void;
}

export const UrgentPracticeScreen: React.FC<UrgentPracticeScreenProps> = ({
  data,
  onBack,
  onCorrection,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      if (recordTimerRef.current) clearTimeout(recordTimerRef.current);
    };
  }, []);

  const handleListen = () => {
    setVoiceState('playing');
    listenTimerRef.current = setTimeout(() => setVoiceState('idle'), 2500);
  };

  const handleRecord = () => {
    setVoiceState('listening');
    recordTimerRef.current = setTimeout(() => {
      onCorrection();
    }, 2000);
  };

  const handleRepeat = () => setVoiceState('idle');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-8">
        {/* Context breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-xs text-gray-400 font-medium">Necesito decir esto ahora</p>
        </div>

        {/* Situation */}
        <Card accent="green" className="mb-4">
          <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-2">Tu situación</p>
          <p className="text-gray-700 leading-relaxed">"{data.situation}"</p>
        </Card>

        {/* Phrase to practice */}
        <div className="bg-teal-500 rounded-2xl p-5 mb-6">
          <p className="text-xs font-semibold text-teal-100 uppercase tracking-wide mb-2">
            Frase para practicar
          </p>
          <p className="text-white font-bold text-xl leading-snug">
            "{data.phraseInEnglish}"
          </p>
        </div>

        {/* Instruction */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-base">
            👂
          </div>
          <p className="text-gray-600 font-medium">Escucha y repite.</p>
        </div>

        {/* Voice controls */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleListen}
            color="blue"
            variant={voiceState === 'playing' ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            disabled={voiceState === 'listening'}
            icon={
              voiceState === 'playing' ? (
                <span className="flex gap-1 items-center">
                  <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-5 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )
            }
          >
            {voiceState === 'playing' ? 'Reproduciendo...' : 'Escuchar'}
          </Button>

          <button
            onClick={handleRecord}
            disabled={voiceState === 'playing'}
            className={[
              'w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-semibold text-lg transition-all duration-200 active:scale-95',
              voiceState === 'listening'
                ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse'
                : 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-200',
              voiceState === 'playing' ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            <div className={[
              'w-6 h-6 rounded-full border-2 border-current flex items-center justify-center',
              voiceState === 'listening' ? 'bg-white' : '',
            ].join(' ')}>
              {voiceState === 'listening' ? (
                <span className="w-3 h-3 bg-red-500 rounded-full" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                </svg>
              )}
            </div>
            {voiceState === 'listening' ? 'Grabando...' : 'Presiona para hablar'}
          </button>

          <Button
            onClick={handleRepeat}
            color="gray"
            variant="outline"
            size="md"
            fullWidth
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.92" />
              </svg>
            }
          >
            Repetir
          </Button>
        </div>
      </div>
    </div>
  );
};
