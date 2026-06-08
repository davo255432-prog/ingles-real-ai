import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'none' | 'orange' | 'blue' | 'green' | 'purple' | 'cream';
}

const accentBorderMap = {
  none: '',
  orange: 'border-l-4 border-l-orange-400',
  blue: 'border-l-4 border-l-blue-400',
  green: 'border-l-4 border-l-green-400',
  purple: 'border-l-4 border-l-purple-400',
  cream: 'border-l-4 border-l-amber-300',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  accent = 'none',
}) => {
  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-5',
        accentBorderMap[accent],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};
