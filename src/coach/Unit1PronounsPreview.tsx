import { useState } from 'react';
import { FIRST_LESSON_ID, getLesson } from './data/curriculum';
import { CoachLessonScreen } from './screens/CoachLessonScreen';

interface Unit1PronounsPreviewProps {
  onExit: () => void;
}

/**
 * Recorrido temporal exclusivo de desarrollo.
 * Ejecuta la Unidad 1 real sin leer ni escribir el progreso persistido.
 */
export function Unit1PronounsPreview({ onExit }: Unit1PronounsPreviewProps) {
  const [run, setRun] = useState(0);
  const [showPreviewEnd, setShowPreviewEnd] = useState(false);
  const lesson = getLesson(FIRST_LESSON_ID);

  if (!lesson) return null;

  if (showPreviewEnd) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 text-4xl">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Recorrido temporal completado</h1>
        <p className="text-gray-500 mb-8">El progreso real del Coach no fue modificado.</p>
        <button
          onClick={() => {
            setRun((current) => current + 1);
            setShowPreviewEnd(false);
          }}
          className="w-full bg-emerald-500 text-white font-bold rounded-2xl py-4 mb-3"
        >
          Recorrer otra vez
        </button>
        <button
          onClick={onExit}
          className="w-full bg-white text-gray-700 font-bold rounded-2xl py-4 border border-gray-200"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <CoachLessonScreen
      key={run}
      lesson={lesson}
      onBack={onExit}
      onStepChange={() => {}}
      onStatus={() => {}}
      onFinish={() => setShowPreviewEnd(true)}
      isReview
    />
  );
}
