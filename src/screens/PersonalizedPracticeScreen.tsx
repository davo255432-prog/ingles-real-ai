import React, { useEffect, useRef } from 'react';
import type { PracticeData } from '../types';
import { Header } from '../components/Header';
import { PracticeCard } from '../components/PracticeCard';
import { Button } from '../components/Button';
import { stopSpeech } from '../services/speechApi';

// ── Types ──────────────────────────────────────────────────────────────────

interface PersonalizedPracticeScreenProps {
  data: PracticeData;
  onBack: () => void;
  onVoicePractice: (phrase: string) => void;
  onCreateAnother: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export const PersonalizedPracticeScreen: React.FC<PersonalizedPracticeScreenProps> = ({
  data,
  onBack,
  onVoicePractice,
  onCreateAnother,
}) => {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSpeech();
    };
  }, []);

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

        <PracticeCard
          data={data}
          onPracticeBasic={() => onVoicePractice(data.basicForm)}
          onPracticeNatural={() => onVoicePractice(data.naturalForm)}
        />
      </div>

      {/* Bottom actions */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6 safe-pb">
        <Button
          onClick={onCreateAnother}
          color="orange"
          variant="primary"
          size="lg"
          fullWidth
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Crear nueva práctica
        </Button>
      </div>
    </div>
  );
};
