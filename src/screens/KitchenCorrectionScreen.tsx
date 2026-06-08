import React from 'react';
import { Button } from '../components/Button';

interface KitchenCorrectionScreenProps {
  onNext: () => void;
}

export const KitchenCorrectionScreen: React.FC<KitchenCorrectionScreenProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-4">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium mb-1">Cocina / restaurante</p>
          <h1 className="text-2xl font-bold text-green-600 leading-tight">¡Bien!</h1>
          <p className="text-gray-500 text-base mt-1">Vamos a mejorar un detalle.</p>
        </div>

        {/* What you said */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Lo que dijiste</p>
          <p className="text-gray-700 text-base font-semibold line-through decoration-red-400">
            "We out onions"
          </p>
        </div>

        {/* Correct form */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Forma correcta</p>
          <p className="text-green-700 text-xl font-extrabold">
            "We're out of onions."
          </p>
        </div>

        {/* Correction explanation */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Corrección</p>
          <p className="text-gray-700 text-sm leading-relaxed">
            Te faltó <span className="font-bold text-blue-600">'we're'</span> y <span className="font-bold text-blue-600">'of'</span>. Para decir que algo se acabó, usa:
          </p>
          <div className="bg-blue-50 rounded-xl px-4 py-3 mt-3">
            <p className="text-blue-700 font-bold text-center text-base">"We're out of + producto"</p>
          </div>
        </div>

        {/* Pronunciation */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Pronunciación aproximada</p>
          <p className="text-gray-700 text-lg font-bold tracking-wide">wir aut ov Ó-ni-ons</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button onClick={onNext} color="blue" variant="primary" size="lg" fullWidth>
          Ver mini regla →
        </Button>
      </div>
    </div>
  );
};
