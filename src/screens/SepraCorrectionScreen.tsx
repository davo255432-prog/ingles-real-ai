import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface SepraCorrectionScreenProps {
  onNext: () => void;
}

export const SepraCorrectionScreen: React.FC<SepraCorrectionScreenProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-5 pt-14 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">✅</div>
          <div>
            <h1 className="text-white text-2xl font-extrabold">Correcto</h1>
            <p className="text-white/80 text-sm mt-0.5">Vamos a afinar la pronunciación.</p>
          </div>
        </div>
        {/* Score */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-xs font-semibold">Precisión</span>
            <span className="text-white font-bold text-sm">82%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2.5">
            <div className="bg-white rounded-full h-2.5 transition-all duration-700" style={{ width: '82%' }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <Card accent="orange" className="mb-4">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">Lo que dijiste</p>
          <p className="text-gray-700 text-lg">"I don understand"</p>
        </Card>

        <Card accent="green" className="bg-green-50 mb-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Forma correcta</p>
          <p className="text-gray-800 font-bold text-xl">"I don't understand."</p>
        </Card>

        <Card accent="blue" className="mb-4">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Corrección</p>
          <p className="text-gray-700 leading-relaxed">
            "Se entiende, pero falta marcar bien <strong>don't</strong>. La contracción <em>don't</em> (do not) es clave para que suene natural."
          </p>
        </Card>

        <Card accent="purple" className="bg-purple-50 mb-6">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Pronunciación aproximada</p>
          <p className="text-purple-700 font-medium italic text-lg">ai dont an-der-STAND</p>
        </Card>

        <Button
          onClick={onNext}
          color="blue"
          variant="primary"
          size="lg"
          fullWidth
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          }
        >
          Ver mini regla
        </Button>
      </div>
    </div>
  );
};
