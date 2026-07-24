import { useState, useEffect } from 'react';
import { API_BASE } from './config/api';
import type { Screen, PracticeData, UrgentPhraseData, CorrectionData } from './types';
import { mockCorrectionData, mockUrgentCorrectionData } from './data/mockData';
import { generatePracticeEnrichment } from './services/practiceApi';

// Screens — Home
import { HomeScreen } from './screens/HomeScreen';

// Flow 1: ¿Cómo digo esto?
import { HowDoISayThisScreen } from './screens/HowDoISayThisScreen';
import { PersonalizedPracticeScreen } from './screens/PersonalizedPracticeScreen';
import { VoicePracticeScreen } from './screens/VoicePracticeScreen';
import { CorrectionScreen } from './screens/CorrectionScreen';

// Flow 2: Necesito decir esto ahora
import { UrgentSayScreen } from './screens/UrgentSayScreen';
import { UrgentPhraseReadyScreen } from './screens/UrgentPhraseReadyScreen';
import { UrgentShowBigScreen } from './screens/UrgentShowBigScreen';
import { UrgentPracticeScreen } from './screens/UrgentPracticeScreen';
import { UrgentCorrectionScreen } from './screens/UrgentCorrectionScreen';

// Flow 3: Practicar situaciones — S.E.P.R.A.
import { SituationsMenuScreen } from './screens/SituationsMenuScreen';
import { SituationsFromScratchScreen } from './screens/SituationsFromScratchScreen';
import { SepraSituationScreen } from './screens/SepraSituationScreen';
import { SepraListenScreen } from './screens/SepraListenScreen';
import { SepraVoicePracticeScreen } from './screens/SepraVoicePracticeScreen';
import { SepraCorrectionScreen } from './screens/SepraCorrectionScreen';
import { SepraMiniRuleScreen } from './screens/SepraMiniRuleScreen';
import { SepraActionScreen } from './screens/SepraActionScreen';
import { SepraProgressScreen } from './screens/SepraProgressScreen';

// Flow 4: Habla en español, yo traduzco
import { SpeakAndTranslateScreen } from './screens/SpeakAndTranslateScreen';

// Flow 3b: Trabajo y clientes → Cocina / restaurante
import { WorkClientsScreen } from './screens/WorkClientsScreen';
import { KitchenIntroScreen } from './screens/KitchenIntroScreen';
import { KitchenListenScreen } from './screens/KitchenListenScreen';
import { KitchenPracticeScreen } from './screens/KitchenPracticeScreen';
import { KitchenCorrectionScreen } from './screens/KitchenCorrectionScreen';
import { KitchenRuleScreen } from './screens/KitchenRuleScreen';
import { KitchenActionScreen } from './screens/KitchenActionScreen';
import { KitchenProgressScreen } from './screens/KitchenProgressScreen';

// Coach IA — módulo aislado (gestiona su propia navegación interna)
import { CoachRoot } from './coach/CoachRoot';
import { EssentialVerbsPractice } from './coach/screens/EssentialVerbsPractice';
import { LearningCommitmentScreen } from './coach/screens/LearningCommitmentScreen';
import { PronounsPractice } from './coach/screens/PronounsPractice';
import { SentenceBuildingPractice } from './coach/screens/SentenceBuildingPractice';
import { ToBePractice } from './coach/screens/ToBePractice';

// Biblioteca (placeholder)
import { BibliotecaScreen } from './screens/BibliotecaScreen';

const UNIT_3_PREVIEW_PARAM = 'preview-unit-3';
const UNIT_3_PREVIEW_KEY = 'familia-u3-2026';
const UNIT_4_PREVIEW_PARAM = 'preview-unit-4';
const UNIT_4_PREVIEW_KEY = 'familia-u4-2026';
const UNIT_1_PREVIEW_PARAM = 'preview-unit-1';
const UNIT_1_PREVIEW_KEY = 'familia-u1-2026';
const UNIT_2_PREVIEW_KEY = 'unit2-to-be';
const LEARNING_COMMITMENT_KEY = 'unit-3-learning-commitment-seen';

function App() {
  const showUnit2Preview =
    new URLSearchParams(window.location.search).get('preview') ===
    UNIT_2_PREVIEW_KEY;
  const showUnit1Preview =
    new URLSearchParams(window.location.search).get(UNIT_1_PREVIEW_PARAM) ===
    UNIT_1_PREVIEW_KEY;
  const showUnit3Preview =
    new URLSearchParams(window.location.search).get(UNIT_3_PREVIEW_PARAM) ===
    UNIT_3_PREVIEW_KEY;
  const showUnit4Preview =
    new URLSearchParams(window.location.search).get(UNIT_4_PREVIEW_PARAM) ===
    UNIT_4_PREVIEW_KEY;
  const startUnit3AtPhase2 =
    new URLSearchParams(window.location.search).get('unit3-section') === 'phase2';
  const startUnit3AtPrepositions =
    new URLSearchParams(window.location.search).get('unit3-section') === 'prepositions';
  const [showLearningCommitment, setShowLearningCommitment] = useState(
    () => sessionStorage.getItem(LEARNING_COMMITMENT_KEY) !== 'yes',
  );

  if (showUnit2Preview) {
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center items-start notranslate" translate="no">
        <div className="w-full max-w-[640px] min-h-screen bg-gray-50 shadow-[0_0_40px_rgba(0,0,0,0.12)]">
          <ToBePractice
            onExit={() => {
              window.location.href = window.location.pathname;
            }}
            onStepChange={() => undefined}
            onComplete={() => undefined}
            onBackToMap={() => {
              window.location.href = window.location.pathname;
            }}
          />
        </div>
      </div>
    );
  }

  if (showUnit1Preview) {
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center items-start notranslate" translate="no">
        <div className="w-full max-w-[640px] min-h-screen bg-gray-50 shadow-[0_0_40px_rgba(0,0,0,0.12)]">
          <PronounsPractice
            onExit={() => {
              window.location.href = window.location.pathname;
            }}
            onUnitComplete={() => undefined}
            onBackToMap={() => {
              window.location.href = window.location.pathname;
            }}
          />
        </div>
      </div>
    );
  }

  if (showUnit3Preview) {
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center items-start notranslate" translate="no">
        <div className="w-full max-w-[640px] min-h-screen bg-gray-50 shadow-[0_0_40px_rgba(0,0,0,0.12)]">
          {showLearningCommitment ? (
            <LearningCommitmentScreen
              onContinue={() => {
                sessionStorage.setItem(LEARNING_COMMITMENT_KEY, 'yes');
                setShowLearningCommitment(false);
              }}
            />
          ) : (
            <EssentialVerbsPractice
              startAtPhase2={startUnit3AtPhase2}
              startAtPrepositions={startUnit3AtPrepositions}
              onExit={() => {
                window.location.href = window.location.pathname;
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (showUnit4Preview) {
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center items-start notranslate" translate="no">
        <div className="w-full max-w-[640px] min-h-screen bg-gray-50 shadow-[0_0_40px_rgba(0,0,0,0.12)]">
          <SentenceBuildingPractice
            onExit={() => {
              window.location.href = window.location.pathname;
            }}
          />
        </div>
      </div>
    );
  }

  return <MainApp />;
}

function MainApp() {
  const [screen, setScreen] = useState<Screen>('home');

  // Mantiene el servidor despierto: ping al abrir y cada 4 min mientras la app
  // esté abierta, para evitar el arranque en frío de Railway (que hace muy lenta
  // la primera reproducción de voz / traducción tras un rato de inactividad).
  useEffect(() => {
    const ping = () => { fetch(`${API_BASE}/api/ping`).catch(() => {}); };
    ping();
    const id = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ── Flow 1 state ──
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [lastInput, setLastInput] = useState('');
  const [correctionData, setCorrectionData] = useState<CorrectionData | null>(null);
  const [practicePhrase, setPracticePhrase] = useState<string | null>(null);

  const handleCreatePractice = (data: PracticeData, input: string) => {
    setPracticeData(data);
    setLastInput(input);
    setScreen('practice');

    // Enriquecimiento en 2º plano: la práctica ya se muestra con el núcleo;
    // los desgloses/keywords se cargan después y se fusionan cuando llegan.
    // Si falla o el usuario crea otra práctica, no afecta nada (guard por situación).
    void generatePracticeEnrichment(input, data).then((enrichment) => {
      if (!enrichment) return;
      setPracticeData((cur) => (cur && cur.situation === data.situation ? { ...cur, ...enrichment } : cur));
    });
  };

  const handleCreateAnother = () => {
    setPracticeData(null);
    setLastInput('');
    setPracticePhrase(null);
    setScreen('how-do-i-say');
  };

  const handleVoicePractice = (phrase: string) => {
    setPracticePhrase(phrase);
    setScreen('voice-practice');
  };

  // ── Flow 2 state ──
  const [urgentData, setUrgentData] = useState<UrgentPhraseData | null>(null);
  const [urgentInput, setUrgentInput] = useState('');

  const handleTranslateUrgent = (data: UrgentPhraseData, input: string) => {
    setUrgentData(data);
    setUrgentInput(input);
    setScreen('urgent-phrase-ready');
  };

  const handleTranslateAnother = () => {
    setUrgentData(null);
    setUrgentInput('');
    setScreen('urgent-say');
  };

  return (
    <div className="min-h-screen bg-slate-200 flex justify-center items-start notranslate" translate="no">
    <div
      className={`w-full min-h-screen bg-gray-50 relative flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.12)] ${
        screen === 'home' ? 'max-w-[960px]' : 'max-w-[640px]'
      }`}
      translate="no"
    >

      {/* ── Home ── */}
      {screen === 'home' && (
        <HomeScreen
          onStartFlow={() => setScreen('how-do-i-say')}
          onSpeakTranslate={() => setScreen('speak-translate')}
          onCoach={() => setScreen('coach')}
          onBiblioteca={() => setScreen('biblioteca')}
        />
      )}

      {/* ── Biblioteca (placeholder) ── */}
      {screen === 'biblioteca' && (
        <BibliotecaScreen onBack={() => setScreen('home')} />
      )}

      {/* ── Coach IA — módulo aislado ── */}
      {screen === 'coach' && (
        <CoachRoot onExit={() => setScreen('home')} />
      )}

      {/* ── Flow 4: Habla en español, yo traduzco ── */}
      {screen === 'speak-translate' && (
        <SpeakAndTranslateScreen
          onBack={() => setScreen('home')}
        />
      )}

      {/* ── Flow 1: ¿Cómo digo esto? ── */}
      {screen === 'how-do-i-say' && (
        <HowDoISayThisScreen
          onBack={() => setScreen('home')}
          onCreatePractice={handleCreatePractice}
          initialInput={lastInput}
        />
      )}
      {screen === 'practice' && practiceData && (
        <PersonalizedPracticeScreen
          data={practiceData}
          onBack={() => setScreen('how-do-i-say')}
          onVoicePractice={handleVoicePractice}
          onCreateAnother={handleCreateAnother}
        />
      )}
      {screen === 'voice-practice' && practiceData && (
        <VoicePracticeScreen
          data={practiceData}
          practicePhrase={practicePhrase ?? undefined}
          onBack={() => setScreen('practice')}
          onCorrection={(data) => { setCorrectionData(data); setScreen('correction'); }}
        />
      )}
      {screen === 'correction' && (
        <CorrectionScreen
          data={correctionData ?? mockCorrectionData}
          onPracticeAgain={() => setScreen('voice-practice')}
          onContinue={() => setScreen('practice')}
        />
      )}

      {/* ── Flow 2: Necesito decir esto ahora ── */}
      {screen === 'urgent-say' && (
        <UrgentSayScreen
          onBack={() => setScreen('home')}
          onTranslate={handleTranslateUrgent}
          initialInput={urgentInput}
        />
      )}
      {screen === 'urgent-phrase-ready' && urgentData && (
        <UrgentPhraseReadyScreen
          data={urgentData}
          onBack={() => setScreen('urgent-say')}
          onShowBig={() => setScreen('urgent-show-big')}
          onPractice={() => setScreen('urgent-practice')}
          onTranslateAnother={handleTranslateAnother}
        />
      )}
      {screen === 'urgent-show-big' && urgentData && (
        <UrgentShowBigScreen
          data={urgentData}
          onBack={() => setScreen('urgent-phrase-ready')}
        />
      )}
      {screen === 'urgent-practice' && urgentData && (
        <UrgentPracticeScreen
          data={urgentData}
          onBack={() => setScreen('urgent-phrase-ready')}
          onCorrection={() => setScreen('urgent-correction')}
        />
      )}
      {screen === 'urgent-correction' && (
        <UrgentCorrectionScreen
          data={mockUrgentCorrectionData}
          onPracticeAgain={() => setScreen('urgent-practice')}
          onBackToPhrase={() => setScreen('urgent-phrase-ready')}
        />
      )}

      {/* ── Flow 3: Practicar situaciones — S.E.P.R.A. ── */}
      {screen === 'situations' && (
        <SituationsMenuScreen
          onBack={() => setScreen('home')}
          onFromScratch={() => setScreen('situations-from-scratch')}
          onWorkClients={() => setScreen('work-clients')}
        />
      )}
      {screen === 'situations-from-scratch' && (
        <SituationsFromScratchScreen
          onBack={() => setScreen('situations')}
          onStart={() => setScreen('sepra-situation')}
        />
      )}
      {screen === 'sepra-situation' && (
        <SepraSituationScreen
          onBack={() => setScreen('situations-from-scratch')}
          onNext={() => setScreen('sepra-listen')}
        />
      )}
      {screen === 'sepra-listen' && (
        <SepraListenScreen
          onBack={() => setScreen('sepra-situation')}
          onNext={() => setScreen('sepra-voice')}
        />
      )}
      {screen === 'sepra-voice' && (
        <SepraVoicePracticeScreen
          onBack={() => setScreen('sepra-listen')}
          onCorrection={() => setScreen('sepra-correction')}
        />
      )}
      {screen === 'sepra-correction' && (
        <SepraCorrectionScreen
          onNext={() => setScreen('sepra-rule')}
        />
      )}
      {screen === 'sepra-rule' && (
        <SepraMiniRuleScreen
          onBack={() => setScreen('sepra-correction')}
          onNext={() => setScreen('sepra-action')}
        />
      )}
      {screen === 'sepra-action' && (
        <SepraActionScreen
          onBack={() => setScreen('sepra-rule')}
          onNext={() => setScreen('sepra-progress')}
        />
      )}
      {screen === 'sepra-progress' && (
        <SepraProgressScreen
          onPracticeAnother={() => setScreen('situations-from-scratch')}
          onHome={() => setScreen('home')}
        />
      )}

      {/* ── Flow 3b: Trabajo y clientes → Cocina / restaurante ── */}
      {screen === 'work-clients' && (
        <WorkClientsScreen
          onBack={() => setScreen('situations')}
          onKitchen={() => setScreen('kitchen-intro')}
        />
      )}
      {screen === 'kitchen-intro' && (
        <KitchenIntroScreen
          onBack={() => setScreen('work-clients')}
          onListen={() => setScreen('kitchen-listen')}
          onStart={() => setScreen('kitchen-practice')}
        />
      )}
      {screen === 'kitchen-listen' && (
        <KitchenListenScreen
          onBack={() => setScreen('kitchen-intro')}
          onNext={() => setScreen('kitchen-practice')}
        />
      )}
      {screen === 'kitchen-practice' && (
        <KitchenPracticeScreen
          onBack={() => setScreen('kitchen-intro')}
          onCorrection={() => setScreen('kitchen-correction')}
        />
      )}
      {screen === 'kitchen-correction' && (
        <KitchenCorrectionScreen
          onNext={() => setScreen('kitchen-rule')}
        />
      )}
      {screen === 'kitchen-rule' && (
        <KitchenRuleScreen
          onBack={() => setScreen('kitchen-correction')}
          onNext={() => setScreen('kitchen-action')}
        />
      )}
      {screen === 'kitchen-action' && (
        <KitchenActionScreen
          onBack={() => setScreen('kitchen-rule')}
          onFinish={() => setScreen('kitchen-progress')}
        />
      )}
      {screen === 'kitchen-progress' && (
        <KitchenProgressScreen
          onPracticeAnother={() => setScreen('kitchen-intro')}
          onWorkClients={() => setScreen('work-clients')}
          onHome={() => setScreen('home')}
        />
      )}

    </div>
    </div>
  );
}

export default App;
