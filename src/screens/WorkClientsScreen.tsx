import React from 'react';

interface WorkClientsScreenProps {
  onBack: () => void;
  onKitchen: () => void;
}

export const WorkClientsScreen: React.FC<WorkClientsScreenProps> = ({ onBack, onKitchen }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-5 pt-12 pb-10">

        {/* ── Header ── */}
        <div className="flex items-start gap-3 mb-7">
          <button
            onClick={onBack}
            className="mt-1 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
            aria-label="Volver"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Trabajo y clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Elige tu oficio y practica frases reales para tu día a día.</p>
          </div>
        </div>

        {/* ── Profesor IA ── */}
        <div
          className="rounded-3xl p-5 mb-8 shadow-lg shadow-blue-200"
          style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #0ea5e9 100%)' }}
        >
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              🎓
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Profesor IA</p>
              <p className="text-white text-sm font-medium leading-relaxed">
                Primero probamos un ejemplo funcional. Después, la IA podrá crear prácticas según tu oficio, tu nivel y lo que necesitas comunicar.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: '🏷️', label: 'Entiende tu oficio' },
              { icon: '💬', label: 'Crea frases reales' },
              { icon: '🎯', label: 'Corrige tu pronunciación' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                <span className="text-sm">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="flex flex-col gap-4">

          {/* Card A — Cocina / restaurante (active) */}
          <button
            onClick={onKitchen}
            className="w-full bg-amber-50 hover:bg-amber-100 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] border-2 border-amber-300 rounded-3xl p-5 text-left shadow-md shadow-amber-100 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center text-2xl">
                🍳
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-amber-900 text-lg font-bold leading-tight">Cocina / restaurante</h2>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-amber-500">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <span className="inline-block text-xs bg-amber-200 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full mb-2">
                  Ejemplo funcional
                </span>
                <p className="text-amber-800 text-sm leading-snug">
                  Practica una situación de cocina ya preparada: productos faltantes, chef, manager y órdenes.
                </p>
              </div>
            </div>
          </button>

          {/* Card B — Crear práctica con IA (coming soon) */}
          <div className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-5 text-left shadow-sm shadow-indigo-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                  <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-indigo-900 text-lg font-bold leading-tight">Crear práctica con IA</h2>
                </div>
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-600 font-bold px-2.5 py-0.5 rounded-full mb-2">
                  ✦ Próximamente con IA
                </span>
                <p className="text-indigo-700 text-sm leading-snug">
                  Escribe tu oficio y lo que necesitas decir. La IA creará una práctica adaptada a tu trabajo.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer note ── */}
        <div className="mt-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
              <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
            </svg>
          </div>
          <p className="text-blue-700 text-sm font-medium leading-snug">
            Próximamente: prácticas para cualquier oficio con IA.
          </p>
        </div>

      </div>
    </div>
  );
};
