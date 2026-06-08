import React from 'react';

interface CoachMessageProps {
  message: string;
}

export const CoachMessage: React.FC<CoachMessageProps> = ({ message }) => {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
        🎓
      </div>
      <div>
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
          Profesor IA
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
