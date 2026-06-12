import React from 'react';
import type { CorrectionData } from '../types';
import { Card } from './Card';

interface CorrectionCardProps {
  data: CorrectionData;
}

export const CorrectionCard: React.FC<CorrectionCardProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-4">
      <Card accent="orange">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">
          Lo que dijiste
        </p>
        <p className="text-gray-700 text-lg">"{data.whatYouSaid}"</p>
      </Card>

      <Card accent="green" className="bg-green-50">
        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
          Forma correcta
        </p>
        <p className="text-gray-800 font-semibold text-lg leading-snug">
          "{data.correctForm}"
        </p>
      </Card>

      <Card accent="blue">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
          Corrección
        </p>
        <p className="text-gray-700 leading-relaxed">{data.correction}</p>
      </Card>

      <Card accent="purple" className="bg-purple-50">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
          Pronunciación aproximada
        </p>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          <p className="text-purple-700 text-base font-semibold italic leading-snug">
            {data.pronunciation}
          </p>
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <span className="text-xl flex-shrink-0">💡</span>
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
            Nota del coach
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">{data.coachNote}</p>
        </div>
      </div>
    </div>
  );
};
