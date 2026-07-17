import { VISUAL_CATALOG, type VisualId } from './catalog';
import type { ResolvedVisual } from './types';

const assetModules = import.meta.glob<string>(
  '../../assets/coach/**/*.{png,jpg,jpeg,webp,avif,svg}',
  { eager: true, import: 'default', query: '?url' },
);

const FALLBACK_VISUAL =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" rx="32" fill="#ecfdf5"/><circle cx="320" cy="170" r="72" fill="#a7f3d0"/><path d="M205 350c18-82 74-120 115-120s97 38 115 120" fill="#6ee7b7"/><circle cx="295" cy="158" r="8" fill="#047857"/><circle cx="345" cy="158" r="8" fill="#047857"/><path d="M292 194c18 17 38 17 56 0" fill="none" stroke="#047857" stroke-width="8" stroke-linecap="round"/></svg>',
  );

const isDevelopment = import.meta.env.DEV;

const PRONOUN_VISUAL_IDS = {
  i: 'unit1.pronouns.i',
  you: 'unit1.pronouns.you',
  he: 'unit1.pronouns.he',
  she: 'unit1.pronouns.she',
  we: 'unit1.pronouns.we',
  they: 'unit1.pronouns.they',
  it: 'unit1.pronouns.it',
} as const satisfies Record<string, VisualId>;

function reportMissingVisual(id: VisualId, file: string) {
  if (isDevelopment) {
    console.error(`[Biblioteca Visual] No existe el archivo registrado para "${id}": ${file}`);
  }
}

export function getVisual(id: VisualId): ResolvedVisual {
  const metadata = VISUAL_CATALOG[id];
  const src = assetModules[metadata.file];

  if (!src) reportMissingVisual(id, metadata.file);

  return {
    ...metadata,
    src: src ?? FALLBACK_VISUAL,
    fallback: FALLBACK_VISUAL,
  };
}

export function getPronounVisual(pronounId: string): ResolvedVisual | undefined {
  const visualId = PRONOUN_VISUAL_IDS[pronounId.toLowerCase() as keyof typeof PRONOUN_VISUAL_IDS];
  return visualId ? getVisual(visualId) : undefined;
}

export function handleVisualError(
  event: React.SyntheticEvent<HTMLImageElement>,
  visual: ResolvedVisual,
) {
  const image = event.currentTarget;
  if (image.src === visual.fallback) return;

  reportMissingVisual(visual.id as VisualId, visual.file);
  image.src = visual.fallback;
}
