import React, { useState } from 'react';
import type { InputMode, PracticeData } from '../types';
import { Header } from '../components/Header';
import { CoachMessage } from '../components/CoachMessage';
import { ModeSelector } from '../components/ModeSelector';
import { Button } from '../components/Button';
import { analyzeContext, generatePractice } from '../services/practiceApi';
import type { RequiredDetail, CommunicativeIntent } from '../services/practiceApi';

interface HowDoISayThisScreenProps {
  onBack: () => void;
  onCreatePractice: (data: PracticeData, input: string) => void;
  initialInput?: string;
}

export const HowDoISayThisScreen: React.FC<HowDoISayThisScreenProps> = ({
  onBack,
  onCreatePractice,
  initialInput = '',
}) => {
  const [mode, setMode] = useState<InputMode>('write');
  const [input, setInput] = useState(initialInput);

  // Loading: null = idle, string = message to show while busy
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  // Clarification flow
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [clarificationInput, setClarificationInput] = useState('');

  // Extracted details from analyze step (used in generate)
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [pendingDetails, setPendingDetails] = useState<RequiredDetail[]>([]);
  const [pendingCommIntent, setPendingCommIntent] = useState<CommunicativeIntent | null>(null);
  const [pendingIntentExpl, setPendingIntentExpl] = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────

  const resetClarification = () => {
    setClarifyingQuestion(null);
    setClarificationInput('');
    setPendingIntent(null);
    setPendingDetails([]);
    setPendingCommIntent(null);
    setPendingIntentExpl(null);
  };

  // Generates practice; originalInput stays clean; all extra context is passed separately
  const runGenerate = async (
    originalInput: string,
    clarificationContext?: string,
    intent?: string | null,
    requiredDetails?: RequiredDetail[],
    communicativeIntent?: CommunicativeIntent | null,
    intentExplanation?: string | null,
  ) => {
    setLoadingMsg('Creando práctica...');
    const result = await generatePractice(
      originalInput, clarificationContext,
      intent, requiredDetails,
      communicativeIntent, intentExplanation,
    );
    setLoadingMsg(null);
    if (result.usedFallback) setUsedFallback(true);
    // Always pass the original input so "Tu situación" shows the user's own words
    onCreatePractice(result.data, originalInput);
  };

  // ── Step 1: analyze before generating ─────────────────────────────────

  const handleCreate = async () => {
    if (!input.trim()) return;
    resetClarification();
    setUsedFallback(false);
    setLoadingMsg('Analizando...');

    const analysis = await analyzeContext(input.trim());
    console.log('[handleCreate] analysis recibido:', analysis);
    setLoadingMsg(null);

    if (analysis && analysis.needsClarification && analysis.clarifyingQuestion) {
      console.log('[handleCreate] → mostrando aclaración');
      setClarifyingQuestion(analysis.clarifyingQuestion);
      // Store whatever was extracted before asking (may be partial)
      setPendingIntent(analysis.intent);
      setPendingDetails(analysis.requiredDetails ?? []);
      setPendingCommIntent(analysis.communicativeIntent);
      setPendingIntentExpl(analysis.intentExplanation);
      return;
    }

    console.log('[handleCreate] → generando práctica directamente');
    await runGenerate(
      input.trim(),
      undefined,
      analysis?.intent ?? undefined,
      analysis?.requiredDetails ?? [],
      analysis?.communicativeIntent ?? undefined,
      analysis?.intentExplanation ?? undefined,
    );
  };

  // ── Step 2: user provided clarification → generate ─────────────────────

  const handleContinue = async () => {
    if (!clarificationInput.trim()) return;
    const clarContext = clarificationInput.trim();
    const intent = pendingIntent;
    const details = pendingDetails;
    const commIntent = pendingCommIntent;
    const intentExpl = pendingIntentExpl;
    resetClarification();
    // Pass original input unchanged; all extra context goes separately
    await runGenerate(input.trim(), clarContext, intent, details, commIntent, intentExpl);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  const isLoading = loadingMsg !== null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-6">
        <Header
          title="¿Cómo digo esto?"
          onBack={onBack}
          accent="orange"
        />

        <CoachMessage message="Puedes decirlo con voz o escribirlo. Yo lo convertiré en inglés práctico y luego lo practicamos juntos." />

        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            ¿Qué necesitas comunicar?
          </h2>
          <p className="text-gray-400 text-sm">Puedes hablar o escribir en español.</p>
        </div>

        <ModeSelector mode={mode} onModeChange={setMode} />

        {/* ── Input area ── */}
        {mode === 'write' ? (
          <div className="mb-5">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Dismiss clarification if the user changes the original input
                if (clarifyingQuestion) resetClarification();
              }}
              placeholder="Ejemplo: ¿Cómo le digo al chef que se acabaron las cebollas y hay que pedirlas urgente al manager?"
              rows={5}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-200 focus:border-orange-400 rounded-2xl p-4 text-gray-800 placeholder-gray-300 text-base resize-none outline-none transition-colors leading-relaxed disabled:opacity-60"
            />
            {input.length > 0 && (
              <p className="text-right text-xs text-gray-400 mt-1">{input.length} caracteres</p>
            )}
          </div>
        ) : (
          <div className="mb-5">
            <div className="w-full bg-white border-2 border-orange-200 rounded-2xl p-6 flex flex-col items-center gap-4 min-h-[140px] justify-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm text-center">
                Toca para grabar tu voz<br />
                <span className="text-xs">(disponible próximamente)</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Clarification card ── */}
        {clarifyingQuestion && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💬</span>
              <p className="text-orange-700 text-sm font-bold">Necesito un poco más de contexto</p>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {clarifyingQuestion}
            </p>
            <textarea
              value={clarificationInput}
              onChange={(e) => setClarificationInput(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              rows={2}
              autoFocus
              className="w-full bg-white border-2 border-orange-200 focus:border-orange-400 rounded-xl p-3 text-gray-800 placeholder-gray-300 text-sm resize-none outline-none transition-colors mb-3"
            />
            <Button
              onClick={handleContinue}
              color="orange"
              variant="primary"
              size="md"
              fullWidth
              disabled={!clarificationInput.trim() || isLoading}
              icon={
                isLoading ? (
                  <span className="flex gap-0.5 items-center">
                    <span className="w-1 h-3.5 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-3.5 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-3.5 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )
              }
            >
              {isLoading ? loadingMsg! : 'Continuar →'}
            </Button>
          </div>
        )}

        {/* ── Fallback banner ── */}
        {usedFallback && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
            <span className="text-amber-500 text-base flex-shrink-0">⚠️</span>
            <p className="text-amber-700 text-xs leading-snug">
              Usando práctica de ejemplo por ahora. Verifica que el servidor esté corriendo.
            </p>
          </div>
        )}

        {/* ── Main button (hidden while clarification card is active) ── */}
        {!clarifyingQuestion && (
          <Button
            onClick={handleCreate}
            color="orange"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!input.trim() || isLoading}
            icon={
              isLoading ? (
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-4 bg-current rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              )
            }
          >
            {isLoading ? (loadingMsg ?? 'Crear práctica') : 'Crear práctica'}
          </Button>
        )}
      </div>
    </div>
  );
};
