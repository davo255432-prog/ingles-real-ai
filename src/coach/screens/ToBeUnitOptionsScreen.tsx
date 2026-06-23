import React from 'react';

interface ToBeUnitOptionsScreenProps {
  completed: boolean;
  inProgress: boolean;
  onBack: () => void;
  onContinue: () => void;
  onReviewFromStart: () => void;
  onFinalPractice: () => void;
}

export const ToBeUnitOptionsScreen: React.FC<ToBeUnitOptionsScreenProps> = ({
  completed,
  inProgress,
  onBack,
  onContinue,
  onReviewFromStart,
  onFinalPractice,
}) => {
  const continueText = completed
    ? 'Abre el ultimo punto guardado sin cambiar tu progreso.'
    : inProgress
      ? 'Reanuda desde donde quedaste.'
      : 'Empieza la Unidad 2 por primera vez.';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50">
      <div className="flex items-center gap-3 px-5 pt-12 pb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500"
          aria-label="Volver"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-gray-400 text-sm font-medium">Unidad 2</span>
      </div>

      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
          Verbo to be
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Elige como quieres practicar am, is y are.
        </p>
      </div>

      <div className="px-5 flex flex-col gap-3 flex-1 pb-8">
        <OptionButton
          title="Continuar leccion"
          description={continueText}
          badge={inProgress ? 'En progreso' : completed ? 'Guardado' : 'Inicio'}
          onClick={onContinue}
        />
        <OptionButton
          title="Repasar desde el inicio"
          description="Vuelve a hacer toda la unidad sin borrar lo que ya completaste."
          badge="Repaso"
          onClick={onReviewFromStart}
        />
        <OptionButton
          title="Practica final hablada"
          description="Repasa el vocabulario previo y entra directo a hablar."
          badge="Voz"
          onClick={onFinalPractice}
        />
      </div>
    </div>
  );
};

const OptionButton: React.FC<{
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}> = ({ title, description, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-white border border-gray-100 rounded-3xl p-5 shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
        <svg className="text-emerald-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-gray-900 font-bold leading-snug">{title}</p>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
            {badge}
          </span>
        </div>
        <p className="text-gray-500 text-sm leading-snug">{description}</p>
      </div>
    </div>
  </button>
);
