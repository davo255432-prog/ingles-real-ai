import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Color = 'orange' | 'blue' | 'green' | 'purple' | 'gray' | 'teal';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  color?: Color;
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap: Record<Color, Record<Variant, string>> = {
  orange: {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200',
    secondary: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200',
    ghost: 'text-orange-500 hover:bg-orange-50',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
  },
  blue: {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200',
    secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200',
    ghost: 'text-blue-500 hover:bg-blue-50',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
  },
  green: {
    primary: 'bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200',
    secondary: 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200',
    ghost: 'text-green-500 hover:bg-green-50',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50',
  },
  purple: {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white shadow-md shadow-purple-200',
    secondary: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200',
    ghost: 'text-purple-500 hover:bg-purple-50',
    outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-50',
  },
  gray: {
    primary: 'bg-gray-700 hover:bg-gray-800 text-white shadow-md shadow-gray-200',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    ghost: 'text-gray-500 hover:bg-gray-100',
    outline: 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50',
  },
  teal: {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-200',
    secondary: 'bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-200',
    ghost: 'text-teal-500 hover:bg-teal-50',
    outline: 'border-2 border-teal-500 text-teal-500 hover:bg-teal-50',
  },
};

const sizeMap = {
  sm: 'text-sm px-4 py-2 rounded-xl gap-1.5',
  md: 'text-base px-5 py-3 rounded-2xl gap-2',
  lg: 'text-lg px-6 py-4 rounded-2xl gap-2.5 font-semibold',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  color = 'orange',
  icon,
  disabled = false,
  fullWidth = false,
  size = 'md',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-95',
        colorMap[color][variant],
        sizeMap[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
