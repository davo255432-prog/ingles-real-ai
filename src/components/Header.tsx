import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  accent?: 'orange' | 'blue' | 'green' | 'purple';
}

const accentMap = {
  orange: 'text-orange-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  accent = 'orange',
}) => {
  return (
    <div className="flex items-start gap-3 mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mt-1 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Volver"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <div>
        <h1 className={`text-2xl font-bold leading-tight ${accentMap[accent]}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1 leading-snug">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
