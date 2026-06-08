# Inglés Real AI — Versión 1 Estable

**Fecha:** 4 de junio de 2026  
**Estado:** ✅ Estable — build limpio, 0 errores TypeScript  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v3  

---

## Resumen

Primera versión funcional de Inglés Real AI, una app mobile-first para adultos hispanos que aprenden inglés en situaciones reales de trabajo y vida diaria. Todos los flujos usan datos simulados (mock). No hay conexión a IA real ni voz real todavía.

---

## Flujos terminados

### Flow 1 — ¿Cómo digo esto? (naranja)
El usuario escribe o dice en español lo que quiere comunicar. La app genera una práctica personalizada con forma básica, forma natural, pronunciación y regla gramatical. Incluye práctica con voz simulada y corrección.

Pantallas: `how-do-i-say` → `practice` → `voice-practice` → `correction`

### Flow 2 — Necesito decir esto ahora (teal)
El usuario escribe una frase urgente en español. La app la traduce al inglés de forma rápida, la muestra en grande para mostrarla a alguien, y ofrece práctica con voz y corrección.

Pantallas: `urgent-say` → `urgent-phrase-ready` → `urgent-show-big` → `urgent-practice` → `urgent-correction`

### Flow 3a — Practicar situaciones / Empezar desde cero (azul, S.E.P.R.A.)
Flujo guiado con el método S.E.P.R.A. (Situación → Escucha → Práctica → Regla → Acción). Frase de ejemplo: "I don't understand." Incluye indicador de progreso por paso.

Pantallas: `situations` → `situations-from-scratch` → `sepra-situation` → `sepra-listen` → `sepra-voice` → `sepra-correction` → `sepra-rule` → `sepra-action` → `sepra-progress`

### Flow 3b — Trabajo y clientes / Cocina / restaurante (azul + ámbar)
Submódulo de oficios reales. Por ahora incluye solo "Cocina / restaurante" como ejemplo funcional completo. Frase: "We're out of onions." Los demás oficios y la opción "Crear práctica con IA" están marcados como próximamente.

Pantallas: `work-clients` → `kitchen-intro` → `kitchen-listen` → `kitchen-practice` → `kitchen-correction` → `kitchen-rule` → `kitchen-action` → `kitchen-progress`

---

## Pantallas totales: 27

| Pantalla | Flow |
|----------|------|
| `home` | Home |
| `how-do-i-say` | Flow 1 |
| `practice` | Flow 1 |
| `voice-practice` | Flow 1 |
| `correction` | Flow 1 |
| `urgent-say` | Flow 2 |
| `urgent-phrase-ready` | Flow 2 |
| `urgent-show-big` | Flow 2 |
| `urgent-practice` | Flow 2 |
| `urgent-correction` | Flow 2 |
| `situations` | Flow 3 |
| `situations-from-scratch` | Flow 3a |
| `sepra-situation` | Flow 3a |
| `sepra-listen` | Flow 3a |
| `sepra-voice` | Flow 3a |
| `sepra-correction` | Flow 3a |
| `sepra-rule` | Flow 3a |
| `sepra-action` | Flow 3a |
| `sepra-progress` | Flow 3a |
| `work-clients` | Flow 3b |
| `kitchen-intro` | Flow 3b |
| `kitchen-listen` | Flow 3b |
| `kitchen-practice` | Flow 3b |
| `kitchen-correction` | Flow 3b |
| `kitchen-rule` | Flow 3b |
| `kitchen-action` | Flow 3b |
| `kitchen-progress` | Flow 3b |

---

## Componentes reutilizables

- `Button` — 6 colores, 4 variantes, 3 tamaños
- `Card` — con acento de color
- `Header` — título + botón volver
- `CoachMessage` — mensaje del Profesor IA
- `ModeSelector` — voz / escritura
- `PracticeCard` — tarjeta de práctica personalizada
- `CorrectionCard` — tarjeta de corrección
- `SepraStepIndicator` — indicador S·E·P·R·A por pasos

---

## Datos simulados (mock)

Todos los flujos usan datos fijos definidos en `src/data/mockData.ts`. No hay llamadas a APIs externas.

- `mockPracticeData` — Flow 1
- `mockCorrectionData` — Flow 1
- `mockUrgentData` — Flow 2
- `mockUrgentCorrectionData` — Flow 2
- Datos de Cocina / restaurante — hardcodeados en las Kitchen screens

---

## Pendientes — Fase 2

### IA real
- Conectar OpenAI API para generar práctica real desde el input del usuario (Flow 1)
- Conectar OpenAI para traducción urgente real (Flow 2)
- Activar "Crear práctica con IA" en Trabajo y clientes
- Activar oficios: Dealer, Construcción, Limpieza, Delivery, Cuidado de adultos mayores, Ventas

### Voz real
- Integrar Web Speech API o OpenAI Whisper para transcribir voz del usuario
- Integrar TTS (ElevenLabs u OpenAI TTS) para reproducir frases en inglés
- Corrección real basada en lo que el usuario dijo
- Análisis básico de pronunciación

### Persistencia y progreso
- Guardar progreso en localStorage (sin login) como primera versión
- Historial de sesiones y rachas de práctica
- Pantalla de progreso general desde Home
- Sistema de usuario / autenticación si se requiere multi-dispositivo

### Publicación
- Build de producción (`npm run build`)
- Deploy en Vercel o Netlify
- Variables de entorno para API key (`VITE_OPENAI_API_KEY`)
- Dominio propio si aplica

### Mejoras opcionales
- Animaciones de transición entre pantallas
- Más frases en Cocina / restaurante (actualmente 1 frase de ejemplo)
- Más flujos S.E.P.R.A. con frases distintas
- Modo oscuro
- PWA / soporte offline básico
- Analytics de uso

---

## ⚠️ Nota importante

**No modificar esta versión directamente sin antes crear una copia de seguridad o una rama nueva en Git.**

Antes de iniciar Fase 2, se recomienda:
1. Hacer `git init` si aún no está inicializado
2. Crear un commit con el mensaje `v1-estable`
3. Crear una rama nueva: `git checkout -b fase-2-ia-real`
4. Trabajar siempre sobre la rama nueva, nunca sobre `main` directamente

Esta versión representa una base estable, probada y sin errores de TypeScript.  
Cualquier cambio experimental debe hacerse sobre una rama separada.
