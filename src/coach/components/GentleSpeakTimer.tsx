import React, { useEffect, useState } from 'react';

interface GentleSpeakTimerProps {
  seconds: number;
  active: boolean;
  resetKey: string;
  tone?: 'emerald' | 'amber';
}

export const GentleSpeakTimer: React.FC<GentleSpeakTimerProps> = ({
  seconds,
  active,
  resetKey,
  tone = 'emerald',
}) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!active || remaining <= 0) return;
    const timer = window.setTimeout(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [active, remaining]);

  const progress = Math.max(0, Math.min(100, (remaining / seconds) * 100));
  const colors = tone === 'amber'
    ? {
        border: 'border-amber-200',
        background: 'bg-amber-50',
        track: 'bg-amber-100',
        bar: 'bg-amber-400',
        text: 'text-amber-800',
        badge: 'bg-amber-100 text-amber-800',
      }
    : {
        border: 'border-emerald-200',
        background: 'bg-emerald-50',
        track: 'bg-emerald-100',
        bar: 'bg-emerald-500',
        text: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-800',
      };

  return (
    <div className={`rounded-2xl border p-4 ${colors.border} ${colors.background}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-sm font-black ${colors.text}`}>
            {remaining > 0 ? 'Prepárate y suelta la lengua' : '¡Ahora dilo con tu voz!'}
          </p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-600">
            {remaining > 0
              ? 'Intenta comenzar antes de que termine la barra.'
              : 'Sin presión: puedes empezar cuando estés listo.'}
          </p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black ${colors.badge}`}>
          {remaining > 0 ? remaining : '✓'}
        </span>
      </div>
      <div className={`mt-3 h-2 overflow-hidden rounded-full ${colors.track}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${colors.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] font-bold text-gray-500">
        Este tiempo te anima; nunca baja tu nota.
      </p>
    </div>
  );
};
