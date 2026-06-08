import React from 'react';

const STEPS = [
  { key: 'S', label: 'Situación' },
  { key: 'E', label: 'Escucha' },
  { key: 'P', label: 'Práctica' },
  { key: 'R', label: 'Regla' },
  { key: 'A', label: 'Acción' },
];

interface SepraStepIndicatorProps {
  currentStep: 0 | 1 | 2 | 3 | 4;
}

export const SepraStepIndicator: React.FC<SepraStepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-6 px-1">
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  isActive
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                    : isDone
                    ? 'bg-blue-100 text-blue-500'
                    : 'bg-gray-100 text-gray-400',
                ].join(' ')}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.key
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-500' : isDone ? 'text-blue-400' : 'text-gray-300'}`}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${index < currentStep ? 'bg-blue-200' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
