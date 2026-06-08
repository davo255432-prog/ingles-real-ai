import React, { useState, useEffect, useRef } from 'react';
import type { PracticeData } from '../types';
import { Header } from '../components/Header';
import { PracticeCard } from '../components/PracticeCard';
import { Button } from '../components/Button';
import { generateSpeech, stopSpeech } from '../services/speechApi';
import type { SpeechSpeed } from '../services/speechApi';

// ── Types ──────────────────────────────────────────────────────────────────

type TtsState = 'idle' | 'loading' | 'playing' | 'error';

interface PersonalizedPracticeScreenProps {
  data: PracticeData;
  onBack: () => void;
  onVoicePractice: () => void;
  onCreateAnother: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export const PersonalizedPracticeScreen: React.FC<PersonalizedPracticeScreenProps> = ({
  data,
  onBack,
  onVoicePractice,
  onCreateAnother,
}) => {
  const [saved, setSaved] = useState(false);
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [ttsError, setTtsError] = useState<string | null>(null);

  // Track active call so stale async updates don't land after unmount / new call
  const callIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleListen = async (speed: SpeechSpeed) => {
    // If already playing/loading, stop it first (toggle off)
    if (ttsState === 'loading' || ttsState === 'playing') {
      stopSpeech();
      setTtsState('idle');
      setTtsError(null);
      return;
    }

    const callId = ++callIdRef.current;
    setTtsError(null);
    setTtsState('loading');

    try {
      // generateSpeech itself handles cancelling any prior audio
      // We switch to 'playing' only if this call is still current
      const playPromise = generateSpeech(data.naturalForm, speed);

      // Transition to 'playing' once audio actually starts (fetch returned)
      // We can't hook into that exactly, so we set it immediately after fetch returns.
      // generateSpeech resolves only after the audio ends.
      // To show 'playing' while audio plays, we update state once the promise is running.
      if (mountedRef.current && callIdRef.current === callId) {
        setTtsState('playing');
      }

      await playPromise;

      if (mountedRef.current && callIdRef.current === callId) {
        setTtsState('idle');
      }
    } catch (err) {
      if (mountedRef.current && callIdRef.current === callId) {
        setTtsError(err instanceof Error ? err.message : 'Error al reproducir el audio.');
        setTtsState('error');
      }
    }
  };

  // ── Listen button label / icon ────────────────────────────────────────────

  const isListening = ttsState === 'loading' || ttsState === 'playing';

  const listenIcon = isListening ? (
    <span className="flex gap-0.5">
      <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-0.5 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );

  const listenLabel =
    ttsState === 'loading' ? 'Preparando...' :
    ttsState === 'playing' ? 'Reproduciendo...' :
    'Escuchar frase';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-5 pt-12 pb-4">
        <Header
          title="Tu práctica personalizada"
          subtitle="Aprende y practica esta frase."
          onBack={onBack}
          accent="blue"
        />

        <PracticeCard data={data} />
      </div>

      {/* Bottom actions */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6 safe-pb">

        {/* TTS error */}
        {ttsState === 'error' && ttsError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
            <span className="text-red-400 text-sm flex-shrink-0">⚠️</span>
            <p className="text-red-700 text-xs leading-snug">{ttsError}</p>
          </div>
        )}

        {/* Listen row: normal + slow */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Button
            onClick={() => void handleListen('normal')}
            color="blue"
            variant={isListening ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            aria-label={isListening ? 'Detener audio' : 'Escuchar frase en velocidad normal'}
            icon={listenIcon}
          >
            {listenLabel}
          </Button>

          <Button
            onClick={() => void handleListen('slow')}
            color="blue"
            variant="outline"
            size="md"
            fullWidth
            disabled={isListening}
            aria-label="Escuchar frase en velocidad lenta"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          >
            Escuchar lento
          </Button>
        </div>

        {/* Save button (full width) */}
        <Button
          onClick={handleSave}
          color="green"
          variant={saved ? 'primary' : 'secondary'}
          size="md"
          fullWidth
          className="mb-3"
          icon={
            saved ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            )
          }
        >
          {saved ? 'Guardada ✓' : 'Guardar práctica'}
        </Button>

        <Button
          onClick={onVoicePractice}
          color="orange"
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
          Practicar con voz ahora
        </Button>

        <Button
          onClick={onCreateAnother}
          color="gray"
          variant="ghost"
          size="md"
          fullWidth
        >
          Crear otra práctica
        </Button>
      </div>
    </div>
  );
};
