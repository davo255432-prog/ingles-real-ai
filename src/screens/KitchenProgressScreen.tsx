import React from 'react';
import { Button } from '../components/Button';

interface KitchenProgressScreenProps {
  onPracticeAnother: () => void;
  onWorkClients: () => void;
  onHome: () => void;
}

export const KitchenProgressScreen: React.FC<KitchenProgressScreenProps> = ({
  onPracticeAnother,
  onWorkClients,
  onHome,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">¡Buen trabajo!</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Completaste una práctica de cocina / restaurante.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-600">1</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">frase practicada</p>
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-green-600">88%</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">precisión</p>
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-4 text-center">
            <span className="text-2xl">🍳</span>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Cocina</p>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Resumen</p>

          {/* Phrase learned */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Frase aprendida</p>
            <p className="text-blue-700 text-lg font-extrabold">"We're out of onions."</p>
          </div>

          {/* Mini rule */}
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Mini regla</p>
            <p className="text-blue-800 text-sm font-semibold leading-snug">
              "We're out of..." sirve para decir "se nos acabó..."
            </p>
          </div>

          {/* Vocabulary */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Vocabulario</p>
            <div className="flex flex-wrap gap-2">
              {['out of', 'onions', 'rice', 'chicken', 'sauce'].map((word) => (
                <span
                  key={word}
                  className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Pronunciation */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pronunciación</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm font-semibold">onions</span>
              <span className="text-gray-400">→</span>
              <span className="text-blue-600 font-bold text-sm tracking-wide">Ó-ni-ons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6 flex flex-col gap-3">
        <Button onClick={onPracticeAnother} color="blue" variant="primary" size="lg" fullWidth>
          Practicar otra situación
        </Button>
        <Button onClick={onWorkClients} color="gray" variant="secondary" size="lg" fullWidth>
          Volver a Trabajo y clientes
        </Button>
        <Button onClick={onHome} color="gray" variant="outline" size="md" fullWidth>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};
