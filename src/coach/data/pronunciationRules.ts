const AMERICAN_SOFT_T_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\buo-ter\b/g, 'ua-rer'],
  [/\buo ter\b/g, 'ua rer'],
  [/\bwo-ter\b/g, 'ua-rer'],
  [/\bbe-ter\b/g, 'be-rer'],
  [/\bsi-ti\b/g, 'si-ri'],
  [/\bgou tu\b/g, 'gou ru'],
];

export const AMERICAN_SOFT_T_RULE = {
  title: 'Regla de sonido: T suave',
  shortText: 'En inglés americano, algunas T suenan suave, casi como una R rápida.',
  examples: [
    { word: 'water', oldSound: 'uo-ter', naturalSound: 'ua-rer' },
    { word: 'go to', oldSound: 'gou tu', naturalSound: 'gou ru' },
    { word: 'better', oldSound: 'be-ter', naturalSound: 'be-rer' },
  ],
};

export function applyCoachPronunciationRules(pronunciation: string): string {
  return AMERICAN_SOFT_T_REPLACEMENTS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    pronunciation,
  );
}
