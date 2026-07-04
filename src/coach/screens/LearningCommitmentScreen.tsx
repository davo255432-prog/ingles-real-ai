import React from 'react';

interface LearningCommitmentScreenProps {
  onContinue: () => void;
}

export const LearningCommitmentScreen: React.FC<LearningCommitmentScreenProps> = ({
  onContinue,
}) => (
  <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 px-6 py-10 flex items-center">
    <section className="w-full max-w-lg mx-auto text-center">
      <div
        className="w-20 h-20 mx-auto mb-7 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-emerald-700 text-4xl font-black">✓</span>
      </div>

      <p className="text-emerald-700 text-sm font-black uppercase mb-3">
        Antes de comenzar
      </p>
      <h1 className="text-gray-950 text-4xl font-black leading-tight">
        Tu progreso depende de ti
      </h1>
      <p className="text-gray-700 text-lg font-semibold leading-relaxed mt-5">
        Esta aplicación te muestra el camino, pero nadie puede aprender por ti.
      </p>

      <div className="grid grid-cols-3 gap-2 my-8" aria-label="Acciones para aprender">
        {['Estudia', 'Habla', 'Practica'].map((action, actionIndex) => (
          <div
            key={action}
            className="min-h-24 rounded-2xl bg-white border-2 border-emerald-100 shadow-sm flex flex-col items-center justify-center px-2"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center mb-2">
              {actionIndex + 1}
            </span>
            <span className="text-gray-950 font-black">{action}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-800 text-lg font-bold leading-relaxed">
        No necesitas hacerlo perfecto. Necesitas seguir intentándolo.
      </p>
      <p className="text-emerald-800 text-xl font-black mt-5 mb-8">
        Cada práctica te acerca a hablar inglés.
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="w-full min-h-16 rounded-2xl bg-emerald-500 text-white text-lg font-black shadow-lg shadow-emerald-200 active:scale-[0.99]"
      >
        Estoy listo para aprender
      </button>
    </section>
  </main>
);
