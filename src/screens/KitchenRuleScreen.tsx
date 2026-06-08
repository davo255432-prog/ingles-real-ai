import React from 'react';
import { Button } from '../components/Button';

interface KitchenRuleScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export const KitchenRuleScreen: React.FC<KitchenRuleScreenProps> = ({ onBack, onNext }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Cocina / restaurante</p>
            <h1 className="text-xl font-bold text-blue-600">Mini regla</h1>
          </div>
        </div>

        {/* Rule card */}
        <div className="bg-blue-500 rounded-2xl p-5 mb-5">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-3">La regla</p>
          <p className="text-white text-base font-semibold leading-relaxed">
            <span className="text-white font-extrabold text-lg">"We're out of..."</span> sirve para decir{' '}
            <span className="text-blue-100 font-bold">"se nos acabó..."</span>
          </p>
        </div>

        {/* Pattern */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 mb-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Patrón</p>
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-center">
            <p className="text-blue-700 text-lg font-extrabold">"We're out of + producto"</p>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Ejemplos</p>
          <div className="flex flex-col gap-3">
            {[
              { en: '"We\'re out of rice."', es: 'Se nos acabó el arroz.' },
              { en: '"We\'re out of chicken."', es: 'Se nos acabó el pollo.' },
              { en: '"We\'re out of sauce."', es: 'Se nos acabó la salsa.' },
            ].map((ex, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-700 font-bold text-sm">{ex.en}</p>
                  <p className="text-gray-500 text-xs mt-0.5">= {ex.es}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-5 pt-4 pb-6">
        <Button onClick={onNext} color="blue" variant="primary" size="lg" fullWidth>
          Usarla en una situación →
        </Button>
      </div>
    </div>
  );
};
